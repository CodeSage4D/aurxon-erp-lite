import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async findAll(institutionId: string, classId?: string, search?: string) {
    const where: any = { institutionId };
    
    if (classId) {
      where.classId = classId;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { rollNumber: { contains: search } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
        parent: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  async findOne(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
      include: {
        user: { select: { email: true, isActive: true } },
        class: { select: { id: true, name: true } },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            occupation: true,
            address: true,
            user: { select: { email: true } },
          },
        },
        documents: true,
        timeline: { orderBy: { eventDate: 'desc' } },
        feeAllocations: {
          include: { feeStructure: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async create(institutionId: string, data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash || '$2a$10$tMh4r7K/9V87Vb6L.vF2e.0.eP4fM3z7rWq1c7tE/s2F6C1l3j9l2', // default 'password123'
          role: 'STUDENT',
          institutionId,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          rollNumber: data.rollNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          classId: data.classId,
          parentId: data.parentId || null,
          institutionId,
        },
      });

      await tx.timelineEvent.create({
        data: {
          studentId: student.id,
          type: 'ADMISSION',
          description: `Student admitted under Roll No. ${data.rollNumber}.`,
        },
      });

      return student;
    });
  }

  async update(institutionId: string, id: string, data: any) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        classId: data.classId,
        rollNumber: data.rollNumber,
      },
    });
  }

  async remove(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete timeline events, allocations, documents first
      await tx.timelineEvent.deleteMany({ where: { studentId: id } });
      await tx.document.deleteMany({ where: { studentId: id } });
      await tx.attendance.deleteMany({ where: { studentId: id } });
      await tx.studentFeeAllocation.deleteMany({ where: { studentId: id } });
      await tx.examResult.deleteMany({ where: { studentId: id } });
      
      const stud = await tx.student.delete({ where: { id } });
      await tx.user.delete({ where: { id: student.userId } });
      return stud;
    });
  }
}
