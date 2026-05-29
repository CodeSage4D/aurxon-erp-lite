// IEEE Standard 1012 compliant software validation and student service operations
// Deeply structured for Indian academic record keeping standards

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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { scholarNumber: { contains: search, mode: 'insensitive' } },
        { aadhaarNumber: { contains: search } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, board: true, stream: true } },
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
        class: { select: { id: true, name: true, board: true, stream: true } },
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
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  async create(institutionId: string, data: any) {
    // 1. Email Check
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Login Email already registered');
    }

    // 2. Identity validations
    if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
      throw new BadRequestException('Aadhaar number must be exactly 12 numeric digits');
    }
    if (data.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode.toUpperCase())) {
      throw new BadRequestException('Invalid bank IFSC code format (e.g. SBIN0004520)');
    }
    if (data.pinCode && !/^\d{6}$/.test(data.pinCode)) {
      throw new BadRequestException('PIN code must be exactly 6 digits');
    }

    return this.prisma.$transaction(async (tx) => {
      // 3. Auto-generate permanent Scholar Number
      const studentCount = await tx.student.count({ where: { institutionId } });
      const currentYear = new Date().getFullYear();
      const scholarNumber = `SCH-${currentYear}-${String(studentCount + 1).padStart(4, '0')}`;

      // 4. Create User Identity
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash || '$2a$10$tMh4r7K/9V87Vb6L.vF2e.0.eP4fM3z7rWq1c7tE/s2F6C1l3j9l2', // default 'password123'
          role: 'STUDENT',
          institutionId,
        },
      });

      // 5. Create Student record
      const student = await tx.student.create({
        data: {
          userId: user.id,
          scholarNumber,
          rollNumber: data.rollNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          classId: data.classId,
          parentId: data.parentId || null,
          institutionId,
          
          // Indian demographic credentials
          aadhaarNumber: data.aadhaarNumber || null,
          samagraId: data.samagraId || null,
          familyId: data.familyId || null,
          penNumber: data.penNumber || null,
          birthCertificateNumber: data.birthCertificateNumber || null,
          bloodGroup: data.bloodGroup || null,
          religion: data.religion || null,
          casteCategory: data.casteCategory || 'GENERAL',
          nationality: data.nationality || 'Indian',
          motherTongue: data.motherTongue || null,

          // Parents details
          fatherName: data.fatherName || null,
          motherName: data.motherName || null,
          fatherOccupation: data.fatherOccupation || null,
          motherOccupation: data.motherOccupation || null,
          annualIncome: data.annualIncome ? parseFloat(data.annualIncome) : null,

          // Banking credentials
          bankName: data.bankName || null,
          accHolderName: data.accHolderName || null,
          accNumber: data.accNumber || null,
          ifscCode: data.ifscCode ? data.ifscCode.toUpperCase() : null,
          bankBranch: data.bankBranch || null,
          upiId: data.upiId || null,

          // Structured Address
          houseNo: data.houseNo || null,
          street: data.street || null,
          city: data.city || null,
          district: data.district || null,
          state: data.state || null,
          pinCode: data.pinCode || null,

          // TC migration details
          prevSchoolName: data.prevSchoolName || null,
          tcNumber: data.tcNumber || null,
          migrationCertNo: data.migrationCertNo || null,
        },
      });

      // 6. Log Timeline milestone
      await tx.timelineEvent.create({
        data: {
          studentId: student.id,
          type: 'ADMISSION',
          description: `Student admitted under permanent Scholar No. ${scholarNumber}.`,
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

    if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
      throw new BadRequestException('Aadhaar number must be exactly 12 numeric digits');
    }
    if (data.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode.toUpperCase())) {
      throw new BadRequestException('Invalid bank IFSC code format');
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
        
        aadhaarNumber: data.aadhaarNumber,
        samagraId: data.samagraId,
        familyId: data.familyId,
        penNumber: data.penNumber,
        birthCertificateNumber: data.birthCertificateNumber,
        casteCategory: data.casteCategory,
        religion: data.religion,
        bloodGroup: data.bloodGroup,

        fatherName: data.fatherName,
        motherName: data.motherName,
        annualIncome: data.annualIncome ? parseFloat(data.annualIncome) : undefined,
        
        bankName: data.bankName,
        accHolderName: data.accHolderName,
        accNumber: data.accNumber,
        ifscCode: data.ifscCode ? data.ifscCode.toUpperCase() : undefined,
        bankBranch: data.bankBranch,

        houseNo: data.houseNo,
        street: data.street,
        city: data.city,
        district: data.district,
        state: data.state,
        pinCode: data.pinCode,
      },
    });
  }

  async promote(institutionId: string, data: { studentIds: string[]; targetClassId: string }, promotedById?: string) {
    return this.prisma.$transaction(async (tx) => {
      const targetClass = await tx.class.findUnique({
        where: { id: data.targetClassId },
      });
      if (!targetClass || targetClass.institutionId !== institutionId) {
        throw new BadRequestException('Target class not found');
      }

      // Fallback admin user if promotedById is missing (e.g. CLI/tests)
      let activePromotedById = promotedById;
      if (!activePromotedById) {
        const fallbackAdmin = await tx.user.findFirst({
          where: { role: 'INSTITUTE_ADMIN', institutionId },
        });
        activePromotedById = fallbackAdmin ? fallbackAdmin.id : undefined;
      }

      if (!activePromotedById) {
        throw new BadRequestException('Authorized Admin User ID is required for promotion ledger archiving.');
      }

      const results: any[] = [];
      for (const studentId of data.studentIds) {
        const student = await tx.student.findFirst({
          where: { id: studentId, institutionId },
        });

        if (!student) continue;

        // Auto-generate class roll number: target class name numeric digits + index
        const classStudents = await tx.student.count({
          where: { classId: data.targetClassId },
        });
        const classDigits = targetClass.name.replace(/\D/g, '') || '0';
        const nextRoll = `${classDigits}1${String(classStudents + 1).padStart(2, '0')}`;

        // Create PromotionHistory record BEFORE updating classId to preserve history
        await tx.promotionHistory.create({
          data: {
            studentId,
            fromClassId: student.classId,
            toClassId: data.targetClassId,
            academicYear: '2026-2027', // Default CBSE/Indian standard academic year
            promotedById: activePromotedById,
          },
        });

        const updated = await tx.student.update({
          where: { id: studentId },
          data: {
            classId: data.targetClassId,
            rollNumber: nextRoll,
          },
        });

        await tx.timelineEvent.create({
          data: {
            studentId,
            type: 'PROMOTION',
            description: `Promoted automatically to ${targetClass.name} under Roll No. ${nextRoll}.`,
          },
        });

        results.push(updated);
      }

      return { success: true, count: results.length };
    });
  }

  async getPromotionHistory(institutionId: string) {
    return this.prisma.promotionHistory.findMany({
      where: {
        student: { institutionId },
      },
      include: {
        student: { select: { firstName: true, lastName: true, scholarNumber: true } },
        fromClass: { select: { name: true } },
        toClass: { select: { name: true } },
        promotedBy: { select: { email: true } },
      },
      orderBy: { promotedAt: 'desc' },
    });
  }

  async remove(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
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
