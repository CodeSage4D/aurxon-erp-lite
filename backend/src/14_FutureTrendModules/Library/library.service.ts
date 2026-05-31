import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async getBooks(institutionId: string, search?: string) {
    const where: any = { institutionId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.book.findMany({
      where,
      orderBy: { title: 'asc' },
    });
  }

  async getBookById(institutionId: string, id: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, institutionId },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async createBook(institutionId: string, data: any) {
    const existing = await this.prisma.book.findFirst({
      where: { isbn: data.isbn, institutionId },
    });

    if (existing) {
      throw new BadRequestException('A book with this ISBN already exists in your library');
    }

    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        totalCopies: parseInt(data.totalCopies) || 1,
        availableCopies: parseInt(data.totalCopies) || 1,
        institutionId,
      },
    });
  }

  async updateBook(institutionId: string, id: string, data: any) {
    const book = await this.getBookById(institutionId, id);
    
    const totalCopies = data.totalCopies !== undefined ? parseInt(data.totalCopies) : book.totalCopies;
    const diff = totalCopies - book.totalCopies;
    const availableCopies = Math.max(0, book.availableCopies + diff);

    return this.prisma.book.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : book.title,
        author: data.author !== undefined ? data.author : book.author,
        isbn: data.isbn !== undefined ? data.isbn : book.isbn,
        totalCopies,
        availableCopies,
      },
    });
  }

  async deleteBook(institutionId: string, id: string) {
    await this.getBookById(institutionId, id);
    return this.prisma.book.delete({
      where: { id },
    });
  }

  async getIssues(institutionId: string) {
    const issues = await this.prisma.bookIssue.findMany({
      where: {
        book: { institutionId },
      },
      include: {
        book: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            scholarNumber: true,
            rollNumber: true,
            class: { select: { name: true, section: true } },
          },
        },
        staff: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    // Dynamically calculate fines for active issued/overdue books
    const updatedIssues: any[] = [];
    for (const issue of issues) {
      let fineAmount = issue.fineAmount;
      let fineStatus = issue.fineStatus;
      let status = issue.status;

      if (status === 'ISSUED' || status === 'OVERDUE') {
        const daysOverdue = Math.max(
          0,
          Math.floor((Date.now() - new Date(issue.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        );
        if (daysOverdue > 0) {
          fineAmount = daysOverdue * 10; // ₹10 per day fine rate
          fineStatus = 'UNPAID';
          status = 'OVERDUE';

          // Update database asynchronously
          await this.prisma.bookIssue.update({
            where: { id: issue.id },
            data: { fineAmount, fineStatus, status },
          });
        }
      }

      updatedIssues.push({
        ...issue,
        fineAmount,
        fineStatus,
        status,
      });
    }

    return updatedIssues;
  }

  async getStudentIssues(studentId: string) {
    return this.prisma.bookIssue.findMany({
      where: { studentId },
      include: {
        book: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async issueBook(institutionId: string, data: { studentId?: string; staffId?: string; bookId: string }) {
    const book = await this.prisma.book.findFirst({
      where: { id: data.bookId, institutionId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new BadRequestException('No copies of this book are currently available');
    }

    if (data.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: data.studentId, institutionId },
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const existingIssue = await this.prisma.bookIssue.findFirst({
        where: {
          studentId: data.studentId,
          bookId: data.bookId,
          status: { in: ['ISSUED', 'OVERDUE'] },
        },
      });
      if (existingIssue) {
        throw new BadRequestException('This book is already issued to this student');
      }
    } else if (data.staffId) {
      const staff = await this.prisma.staff.findFirst({
        where: { id: data.staffId, institutionId },
      });
      if (!staff) {
        throw new NotFoundException('Staff member not found');
      }

      const existingIssue = await this.prisma.bookIssue.findFirst({
        where: {
          staffId: data.staffId,
          bookId: data.bookId,
          status: { in: ['ISSUED', 'OVERDUE'] },
        },
      });
      if (existingIssue) {
        throw new BadRequestException('This book is already issued to this staff member');
      }
    } else {
      throw new BadRequestException('Please select a student or staff member to issue the book to');
    }

    // Default borrow duration: 14 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    return this.prisma.$transaction(async (tx) => {
      const issue = await tx.bookIssue.create({
        data: {
          studentId: data.studentId || null,
          staffId: data.staffId || null,
          bookId: data.bookId,
          dueDate,
          status: 'ISSUED',
        },
        include: {
          book: true,
          student: true,
          staff: true,
        },
      });

      await tx.book.update({
        where: { id: data.bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      });

      return issue;
    });
  }

  async returnBook(institutionId: string, issueId: string) {
    const issue = await this.prisma.bookIssue.findUnique({
      where: { id: issueId },
      include: { book: true },
    });

    if (!issue || issue.book.institutionId !== institutionId) {
      throw new NotFoundException('Book issue record not found');
    }

    if (issue.status === 'RETURNED') {
      throw new BadRequestException('Book has already been returned');
    }

    // Finalize dynamic fines at return time
    let finalFine = issue.fineAmount;
    let fineStatus = issue.fineStatus;
    const daysOverdue = Math.max(
      0,
      Math.floor((Date.now() - new Date(issue.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    if (daysOverdue > 0 && (issue.status === 'ISSUED' || issue.status === 'OVERDUE')) {
      finalFine = daysOverdue * 10;
      fineStatus = 'UNPAID';
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedIssue = await tx.bookIssue.update({
        where: { id: issueId },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
          fineAmount: finalFine,
          fineStatus,
        },
        include: {
          book: true,
          student: true,
          staff: true,
        },
      });

      await tx.book.update({
        where: { id: issue.bookId },
        data: {
          availableCopies: {
            increment: 1,
          },
        },
      });

      return updatedIssue;
    });
  }

  async payFine(institutionId: string, issueId: string) {
    const issue = await this.prisma.bookIssue.findUnique({
      where: { id: issueId },
      include: { book: true },
    });

    if (!issue || issue.book.institutionId !== institutionId) {
      throw new NotFoundException('Book issue record not found');
    }

    if (issue.fineAmount <= 0) {
      throw new BadRequestException('This book checkout has no outstanding fines');
    }

    return this.prisma.bookIssue.update({
      where: { id: issueId },
      data: {
        finePaid: issue.fineAmount,
        fineStatus: 'PAID',
      },
      include: {
        book: true,
        student: true,
        staff: true,
      },
    });
  }
}
