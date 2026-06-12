// IEEE Standard 1012 compliant software validation and student service operations
// Deeply structured for Indian academic record keeping standards

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../SHARED/Prisma/prisma.service';
import { encrypt, decrypt, maskSensitiveData } from '../../../SHARED/helpers/encryption.helper';
import { SubscriptionLimitService } from '../../../KERNEL/Support/subscription-limit.service';
import { AuditLogService } from '../../../KERNEL/Audit/audit-log.service';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

export const studentListCache = new Map<string, { data: any; timestamp: number }>();

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private subscriptionLimitService: SubscriptionLimitService,
    private auditLogService: AuditLogService,
  ) {}

  async verifyStudentOwnership(userId: string, studentId: string): Promise<void> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, userId },
    });
    if (!student) {
      throw new ForbiddenException('You can only access your own profile');
    }
  }

  async verifyParentOwnership(userId: string, studentId: string): Promise<void> {
    const parent = await this.prisma.parent.findFirst({
      where: { userId },
    });
    if (!parent) {
      throw new ForbiddenException('Parent profile not found');
    }

    const linkedStudent = await this.prisma.student.findFirst({
      where: { id: studentId, parentId: parent.id },
    });
    if (!linkedStudent) {
      throw new ForbiddenException('You can only access profiles of your linked children');
    }
  }

  private processSensitiveFields(student: any, requesterRole?: string): any {
    if (!student) return student;
    const decryptedAadhaar = decrypt(student.aadhaarNumber);
    const decryptedAccNumber = decrypt(student.accNumber);
    const decryptedIfscCode = decrypt(student.ifscCode);
    const decryptedSamagra = decrypt(student.samagraId);
    const decryptedFamily = decrypt(student.familyId);
    const decryptedPen = decrypt(student.penNumber);
    const decryptedHouseNo = decrypt(student.houseNo);
    const decryptedStreet = decrypt(student.street);
    const decryptedFatherName = decrypt(student.fatherName);
    const decryptedMotherName = decrypt(student.motherName);

    const isAuthorized = requesterRole === 'SUPER_ADMIN' || requesterRole === 'INSTITUTE_ADMIN' || requesterRole === 'HR_MANAGER';

    return {
      ...student,
      aadhaarNumber: isAuthorized ? decryptedAadhaar : (decryptedAadhaar ? maskSensitiveData(decryptedAadhaar, 4) : null),
      accNumber: isAuthorized ? decryptedAccNumber : (decryptedAccNumber ? maskSensitiveData(decryptedAccNumber, 4) : null),
      ifscCode: isAuthorized ? decryptedIfscCode : (decryptedIfscCode ? maskSensitiveData(decryptedIfscCode, 4) : null),
      samagraId: isAuthorized ? decryptedSamagra : (decryptedSamagra ? maskSensitiveData(decryptedSamagra, 4) : null),
      familyId: isAuthorized ? decryptedFamily : (decryptedFamily ? maskSensitiveData(decryptedFamily, 4) : null),
      penNumber: isAuthorized ? decryptedPen : (decryptedPen ? maskSensitiveData(decryptedPen, 4) : null),
      houseNo: isAuthorized ? decryptedHouseNo : (decryptedHouseNo ? 'Masked' : null),
      street: isAuthorized ? decryptedStreet : (decryptedStreet ? 'Masked' : null),
      fatherName: isAuthorized ? decryptedFatherName : (decryptedFatherName ? maskSensitiveData(decryptedFatherName, 4) : null),
      motherName: isAuthorized ? decryptedMotherName : (decryptedMotherName ? maskSensitiveData(decryptedMotherName, 4) : null),
    };
  }

  private processSensitiveFieldsList(students: any[], requesterRole?: string): any[] {
    return students.map(s => this.processSensitiveFields(s, requesterRole));
  }

  async findAll(
    institutionId: string,
    classId?: string,
    search?: string,
    requesterRole?: string,
    requesterProfileId?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'rollNumber',
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const cacheKey = `${institutionId}-${classId || ''}-${search || ''}-${requesterRole || ''}-${requesterProfileId || ''}-${status || ''}-${page}-${limit}-${sortBy}-${sortOrder}`;
    const cached = studentListCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 5000) {
      return cached.data;
    }

    const where: any = { institutionId };

    // Default: exclude archived unless explicitly filtered
    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }
    
    if (classId) {
      where.classId = classId;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { scholarNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (requesterRole === 'TEACHER' && requesterProfileId) {
      where.class = {
        OR: [
          { classTeacherId: requesterProfileId },
          { subjects: { some: { teacherId: requesterProfileId } } }
        ]
      };
    }

    const validSortFields = ['rollNumber', 'firstName', 'lastName', 'scholarNumber', 'admissionDate', 'createdAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'rollNumber';

    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const pageNum = Math.max(Number(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, board: true, stream: true } },
          parent: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
        orderBy: { [orderByField]: sortOrder },
        take: limitNum,
        skip,
      }),
      this.prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const result = {
      students: this.processSensitiveFieldsList(students, requesterRole),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };

    studentListCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  async findOne(
    institutionId: string,
    id: string,
    requesterRole?: string,
    requesterProfileId?: string,
  ) {
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
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            changedBy: { select: { email: true } },
          },
        },
        enrollments: {
          include: {
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
            academicYear: { select: { id: true, name: true } },
          },
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    if (requesterRole === 'TEACHER' && requesterProfileId) {
      const isAssigned = await this.prisma.class.findFirst({
        where: {
          id: student.classId,
          OR: [
            { classTeacherId: requesterProfileId },
            { subjects: { some: { teacherId: requesterProfileId } } }
          ]
        }
      });
      if (!isAssigned) {
        throw new ForbiddenException('You can only access students in your assigned classes');
      }
    }

    return this.processSensitiveFields(student, requesterRole);
  }

  async create(institutionId: string, data: any, creatorUserId?: string) {
    studentListCache.clear();
    // 0. Check subscription limits (Requirement 6)
    await this.subscriptionLimitService.checkLimits(institutionId, 'STUDENTS');

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

    // 4. Generate temporary password + force change (Requirement 1)
    const tempPassword = `TEMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const passwordHash = await argon2.hash(tempPassword);

    const createdStudent = await this.prisma.$transaction(async (tx) => {
      // 3. Dynamic Scholar Number Generation from settings (Requirement 6)
      const settingGroup = await tx.organizationSetting.findUnique({
        where: {
          organizationId_groupCode: {
            organizationId: institutionId,
            groupCode: 'ACADEMIC_RULES',
          },
        },
        include: { items: true },
      });

      const prefixItem = settingGroup?.items.find((item) => item.key === 'scholar_number_prefix');
      const digitsItem = settingGroup?.items.find((item) => item.key === 'scholar_number_digits');

      const prefix = prefixItem?.value || 'SCH';
      const digitsCount = digitsItem ? parseInt(digitsItem.value, 10) : 4;

      const studentCount = await tx.student.count({ where: { institutionId } });
      const currentYear = new Date().getFullYear();
      const scholarNumber = `${prefix}-${currentYear}-${String(studentCount + 1).padStart(digitsCount, '0')}`;

      // 5. Create User Identity
      const user = await tx.user.create({
        data: {
          email: data.email.trim().toLowerCase(),
          passwordHash,
          role: 'STUDENT',
          institutionId,
          mustChangePassword: true, // Force change on login
        },
      });

      // 6. Guardian entity handling (Requirement 8)
      let parentId = data.parentId || null;
      if (!parentId && (data.fatherName || data.motherName) && data.parentPhone) {
        const parent = await tx.parent.create({
          data: {
            firstName: data.fatherName || 'Guardian',
            lastName: data.lastName || '',
            phone: encrypt(data.parentPhone) || '',
            occupation: data.fatherOccupation || null,
            address: data.street ? encrypt(`${data.houseNo || ''} ${data.street}`) : null,
          },
        });
        parentId = parent.id;
      }

      // 7. Create Student record
      const student = await tx.student.create({
        data: {
          userId: user.id,
          scholarNumber,
          rollNumber: data.rollNumber || `ROLL-${studentCount + 1}`,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          classId: data.classId,
          parentId,
          institutionId,
          
          // Indian demographic credentials
          aadhaarNumber: encrypt(data.aadhaarNumber) || null,
          samagraId: encrypt(data.samagraId) || null,
          familyId: encrypt(data.familyId) || null,
          penNumber: encrypt(data.penNumber) || null,
          birthCertificateNumber: data.birthCertificateNumber || null,
          bloodGroup: data.bloodGroup || null,
          religion: data.religion || null,
          casteCategory: data.casteCategory || 'GENERAL',
          nationality: data.nationality || 'Indian',
          motherTongue: data.motherTongue || null,

          // Parents details
          fatherName: encrypt(data.fatherName) || null,
          motherName: encrypt(data.motherName) || null,
          fatherOccupation: data.fatherOccupation || null,
          motherOccupation: data.motherOccupation || null,
          annualIncome: data.annualIncome ? parseFloat(data.annualIncome) : null,

          // Banking credentials
          bankName: data.bankName || null,
          accHolderName: data.accHolderName || null,
          accNumber: encrypt(data.accNumber) || null,
          ifscCode: data.ifscCode ? encrypt(data.ifscCode.toUpperCase()) : null,
          bankBranch: data.bankBranch || null,
          upiId: data.upiId || null,

          // Structured Address
          houseNo: encrypt(data.houseNo) || null,
          street: encrypt(data.street) || null,
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

      // 8. Create dynamic Section & Enrollment entries to protect historic integrity
      let section = await tx.section.findFirst({
        where: { classId: data.classId, name: 'A' },
      });
      if (!section) {
        section = await tx.section.create({
          data: {
            classId: data.classId,
            name: 'A',
          },
        });
      }

      const activeAcadYear = await tx.academicYear.findFirst({
        where: { institutionId, isActive: true },
      });
      let finalAcadYearId = activeAcadYear?.id;
      if (!finalAcadYearId) {
        const fallbackYear = await tx.academicYear.findFirst({
          where: { institutionId },
        });
        if (fallbackYear) {
          finalAcadYearId = fallbackYear.id;
        } else {
          const newYear = await tx.academicYear.create({
            data: {
              institutionId,
              name: '2026-2027',
              startDate: new Date('2026-04-01'),
              endDate: new Date('2027-03-31'),
              isActive: true,
              status: 'ACTIVE',
            },
          });
          finalAcadYearId = newYear.id;
        }
      }

      await tx.enrollment.create({
        data: {
          studentId: student.id,
          classId: data.classId,
          sectionId: section.id,
          academicYearId: finalAcadYearId,
          status: 'ACTIVE',
        },
      });

      // Allocate default fee structures to the student
      const feeStructures = await tx.feeStructure.findMany({
        where: { institutionId },
      });
      for (const fs of feeStructures) {
        await tx.studentFeeAllocation.create({
          data: {
            studentId: student.id,
            feeStructureId: fs.id,
            amountDue: fs.amount,
            amountPaid: 0,
            status: 'UNPAID',
          },
        });
      }

      // 9. Log Timeline milestone
      await tx.timelineEvent.create({
        data: {
          studentId: student.id,
          type: 'ADMISSION',
          description: `Student admitted under permanent Scholar No. ${scholarNumber}.`,
        },
      });

      // 10. Initial Status History entry
      if (creatorUserId) {
        await tx.studentStatusHistory.create({
          data: {
            studentId: student.id,
            oldStatus: 'NONE',
            newStatus: 'ACTIVE',
            changedById: creatorUserId,
            remarks: 'Initial status assignment upon student admission.',
          },
        });
      }

      return student;
    });

    const processed = this.processSensitiveFields(createdStudent, 'SUPER_ADMIN');

    // 10. Audit Log with snapshot (Requirement 7)
    if (creatorUserId) {
      await this.auditLogService.logAction(
        creatorUserId,
        'CREATE_STUDENT',
        JSON.stringify({
          message: `Admitted student ${processed.firstName} ${processed.lastName} under scholar number ${processed.scholarNumber}`,
          before: null,
          after: processed,
        }),
      );
    }

    return { ...processed, temporaryPassword: tempPassword };
  }

  async update(institutionId: string, id: string, data: any, updaterUserId?: string) {
    studentListCache.clear();
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

    const beforeSnapshot = this.processSensitiveFields(student, 'SUPER_ADMIN');

    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      const oldStatus = student.status;
      const newStatus = data.status || oldStatus;

      const updated = await tx.student.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          classId: data.classId,
          rollNumber: data.rollNumber,
          status: data.status,
          
          aadhaarNumber: data.aadhaarNumber !== undefined ? (encrypt(data.aadhaarNumber) || null) : undefined,
          samagraId: data.samagraId !== undefined ? (encrypt(data.samagraId) || null) : undefined,
          familyId: data.familyId !== undefined ? (encrypt(data.familyId) || null) : undefined,
          penNumber: data.penNumber !== undefined ? (encrypt(data.penNumber) || null) : undefined,
          birthCertificateNumber: data.birthCertificateNumber,
          casteCategory: data.casteCategory,
          religion: data.religion,
          bloodGroup: data.bloodGroup,

          fatherName: data.fatherName !== undefined ? (encrypt(data.fatherName) || null) : undefined,
          motherName: data.motherName !== undefined ? (encrypt(data.motherName) || null) : undefined,
          annualIncome: data.annualIncome ? parseFloat(data.annualIncome) : undefined,
          
          bankName: data.bankName,
          accHolderName: data.accHolderName,
          accNumber: data.accNumber !== undefined ? (encrypt(data.accNumber) || null) : undefined,
          ifscCode: data.ifscCode !== undefined ? (data.ifscCode ? encrypt(data.ifscCode.toUpperCase()) : null) : undefined,
          bankBranch: data.bankBranch,

          houseNo: data.houseNo !== undefined ? (encrypt(data.houseNo) || null) : undefined,
          street: data.street !== undefined ? (encrypt(data.street) || null) : undefined,
          city: data.city,
          district: data.district,
          state: data.state,
          pinCode: data.pinCode,
        },
      });

      if (oldStatus !== newStatus && updaterUserId) {
        await tx.studentStatusHistory.create({
          data: {
            studentId: id,
            oldStatus,
            newStatus,
            changedById: updaterUserId,
            remarks: data.statusRemarks || 'Status updated via profile update.',
          },
        });

        await tx.timelineEvent.create({
          data: {
            studentId: id,
            type: 'STATUS_CHANGE',
            description: `Status changed from ${oldStatus} to ${newStatus}.`,
          },
        });
      }

      return updated;
    });

    const afterSnapshot = this.processSensitiveFields(updatedStudent, 'SUPER_ADMIN');

    if (updaterUserId) {
      await this.auditLogService.logAction(
        updaterUserId,
        'UPDATE_STUDENT',
        JSON.stringify({
          message: `Updated profile details for student ${afterSnapshot.firstName} ${afterSnapshot.lastName}`,
          before: beforeSnapshot,
          after: afterSnapshot,
        }),
      );
    }

    return afterSnapshot;
  }

  async promote(institutionId: string, data: { studentIds: string[]; targetClassId: string }, promotedById?: string) {
    studentListCache.clear();
    return this.prisma.$transaction(async (tx) => {
      const targetClass = await tx.class.findUnique({
        where: { id: data.targetClassId },
      });
      if (!targetClass || targetClass.institutionId !== institutionId) {
        throw new BadRequestException('Target class not found');
      }

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
        // 1. Verify library book issues
        const activeIssues = await tx.bookIssue.findMany({
          where: { studentId, status: 'ISSUED' },
          include: { book: true }
        });
        if (activeIssues.length > 0) {
          const bookTitles = activeIssues.map(i => i.book.title).join(', ');
          throw new BadRequestException(`Promotion blocked. Student has active library book issues: ${bookTitles}`);
        }

        const student = await tx.student.findFirst({
          where: { id: studentId, institutionId },
        });

        if (!student) continue;

        const beforeSnapshot = this.processSensitiveFields(student, 'SUPER_ADMIN');

        const classStudents = await tx.student.count({
          where: { classId: data.targetClassId },
        });
        const classDigits = targetClass.name.replace(/\D/g, '') || '0';
        const nextRoll = `${classDigits}1${String(classStudents + 1).padStart(2, '0')}`;

        // 8b. Create section and enrollment tracking for promotion history
        let section = await tx.section.findFirst({
          where: { classId: data.targetClassId, name: 'A' },
        });
        if (!section) {
          section = await tx.section.create({
            data: {
              classId: data.targetClassId,
              name: 'A',
            },
          });
        }

        const activeAcadYear = await tx.academicYear.findFirst({
          where: { institutionId, isActive: true },
        });
        let finalAcadYearId = activeAcadYear?.id;
        if (!finalAcadYearId) {
          const fallbackYear = await tx.academicYear.findFirst({
            where: { institutionId },
          });
          if (fallbackYear) {
            finalAcadYearId = fallbackYear.id;
          } else {
            const newYear = await tx.academicYear.create({
              data: {
                institutionId,
                name: '2026-2027',
                startDate: new Date('2026-04-01'),
                endDate: new Date('2027-03-31'),
                isActive: true,
                status: 'ACTIVE',
              },
            });
            finalAcadYearId = newYear.id;
          }
        }

        // Archive previous active enrollment(s)
        const activeEnrollment = await tx.enrollment.findFirst({
          where: { studentId, status: 'ACTIVE' },
        });
        if (activeEnrollment) {
          await tx.enrollment.update({
            where: { id: activeEnrollment.id },
            data: { status: 'PROMOTED' },
          });
        }

        // Create new active enrollment for the target class
        await tx.enrollment.create({
          data: {
            studentId,
            classId: data.targetClassId,
            sectionId: section.id,
            academicYearId: finalAcadYearId,
            status: 'ACTIVE',
          },
        });

        await tx.promotionHistory.create({
          data: {
            studentId,
            fromClassId: student.classId,
            toClassId: data.targetClassId,
            academicYear: activeAcadYear?.name || '2026-2027',
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

        // Allocate target class fee structures if not already allocated
        const feeStructures = await tx.feeStructure.findMany({
          where: { institutionId },
        });
        for (const fs of feeStructures) {
          const existingAlloc = await tx.studentFeeAllocation.findFirst({
            where: { studentId, feeStructureId: fs.id },
          });
          if (!existingAlloc) {
            await tx.studentFeeAllocation.create({
              data: {
                studentId,
                feeStructureId: fs.id,
                amountDue: fs.amount,
                amountPaid: 0,
                status: 'UNPAID',
              },
            });
          }
        }

        await tx.timelineEvent.create({
          data: {
            studentId,
            type: 'PROMOTION',
            description: `Promoted automatically to ${targetClass.name} under Roll No. ${nextRoll}.`,
          },
        });

        const afterSnapshot = this.processSensitiveFields(updated, 'SUPER_ADMIN');

        await this.auditLogService.logAction(
          activePromotedById,
          'PROMOTE_STUDENT',
          JSON.stringify({
            message: `Promoted student ${afterSnapshot.firstName} ${afterSnapshot.lastName} from ${beforeSnapshot.classId} to ${targetClass.name}`,
            before: beforeSnapshot,
            after: afterSnapshot,
          }),
        );

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

  async remove(institutionId: string, id: string, archiverUserId?: string) {
    studentListCache.clear();
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const beforeSnapshot = this.processSensitiveFields(student, 'SUPER_ADMIN');

    const archivedStudent = await this.prisma.$transaction(async (tx) => {
      // Deactivate associated user login
      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      });

      // Update student status to ARCHIVED (archiving instead of deleting - Requirement 5)
      const archived = await tx.student.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });

      // Log timeline event for archiving
      await tx.timelineEvent.create({
        data: {
          studentId: id,
          type: 'STATUS_CHANGE',
          description: `Student profile soft-deleted and archived. Associated user login deactivated.`,
        },
      });

      // Add student status history entry
      if (archiverUserId) {
        await tx.studentStatusHistory.create({
          data: {
            studentId: id,
            oldStatus: student.status,
            newStatus: 'ARCHIVED',
            changedById: archiverUserId,
            remarks: 'Student record soft-deleted and archived.',
          },
        });
      }

      return archived;
    });

    const afterSnapshot = this.processSensitiveFields(archivedStudent, 'SUPER_ADMIN');

    if (archiverUserId) {
      await this.auditLogService.logAction(
        archiverUserId,
        'ARCHIVE_STUDENT',
        JSON.stringify({
          message: `Archived student profile ${afterSnapshot.firstName} ${afterSnapshot.lastName}`,
          before: beforeSnapshot,
          after: afterSnapshot,
        }),
      );
    }

    return afterSnapshot;
  }

  // ─── Document Management ─────────────────────────────────────────────────────

  async addDocument(
    institutionId: string,
    studentId: string,
    name: string,
    fileUrl: string,
    actorId?: string,
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, institutionId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const doc = await this.prisma.document.create({
      data: {
        studentId,
        name,
        fileUrl,
      },
    });

    await this.prisma.timelineEvent.create({
      data: {
        studentId,
        type: 'DOCUMENT_UPLOAD',
        description: `Document "${name}" uploaded and linked to student profile.`,
      },
    });

    if (actorId) {
      await this.auditLogService.logAction(
        actorId,
        'ADD_DOCUMENT',
        JSON.stringify({
          message: `Uploaded document "${name}" for student ${student.firstName} ${student.lastName}`,
          before: null,
          after: doc,
        }),
      );
    }

    return doc;
  }

  async removeDocument(
    institutionId: string,
    studentId: string,
    docId: string,
    actorId?: string,
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, institutionId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const doc = await this.prisma.document.findFirst({
      where: { id: docId, studentId },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Delete physical file from disk
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const filename = doc.fileUrl.split('/').pop();
      if (filename) {
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.warn('Could not delete physical file:', err.message);
    }

    await this.prisma.document.delete({ where: { id: docId } });

    await this.prisma.timelineEvent.create({
      data: {
        studentId,
        type: 'DOCUMENT_REMOVE',
        description: `Document "${doc.name}" removed from student profile.`,
      },
    });

    if (actorId) {
      await this.auditLogService.logAction(
        actorId,
        'REMOVE_DOCUMENT',
        JSON.stringify({
          message: `Removed document "${doc.name}" from student ${student.firstName} ${student.lastName}`,
          before: doc,
          after: null,
        }),
      );
    }

    return { success: true, docId };
  }

  // ─── Bulk Import Pipeline ────────────────────────────────────────────────────

  async importStudents(
    institutionId: string,
    rows: any[],
    creatorUserId?: string,
  ) {
    studentListCache.clear();
    // Phase 1: Validate all rows before any DB mutations
    const errors: { row: number; field: string; message: string }[] = [];
    const emailsSeen = new Set<string>();

    // Check subscription limits before full batch
    await this.subscriptionLimitService.checkLimits(institutionId, 'STUDENTS');

    // Load existing emails and class IDs for validation
    const existingEmails = new Set(
      (await this.prisma.user.findMany({ select: { email: true } })).map(u => u.email.toLowerCase()),
    );
    const existingClasses = new Map(
      (await this.prisma.class.findMany({ where: { institutionId }, select: { id: true, name: true } }))
        .map(c => [c.name.toLowerCase(), c.id]),
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.firstName?.trim()) errors.push({ row: rowNum, field: 'firstName', message: 'First name is required' });
      if (!row.lastName?.trim()) errors.push({ row: rowNum, field: 'lastName', message: 'Last name is required' });
      if (!row.email?.trim()) {
        errors.push({ row: rowNum, field: 'email', message: 'Email is required' });
      } else {
        const emailLower = row.email.trim().toLowerCase();
        if (existingEmails.has(emailLower)) {
          errors.push({ row: rowNum, field: 'email', message: `Email "${emailLower}" already exists in the system` });
        } else if (emailsSeen.has(emailLower)) {
          errors.push({ row: rowNum, field: 'email', message: `Email "${emailLower}" is duplicated in this CSV batch` });
        }
        emailsSeen.add(emailLower);
      }
      if (!row.dateOfBirth?.trim()) {
        errors.push({ row: rowNum, field: 'dateOfBirth', message: 'Date of birth is required (YYYY-MM-DD)' });
      } else if (isNaN(new Date(row.dateOfBirth).getTime())) {
        errors.push({ row: rowNum, field: 'dateOfBirth', message: 'Invalid date of birth format. Use YYYY-MM-DD' });
      }
      if (!row.gender?.trim()) errors.push({ row: rowNum, field: 'gender', message: 'Gender is required (MALE/FEMALE/OTHER)' });
      if (!row.className?.trim()) {
        errors.push({ row: rowNum, field: 'className', message: 'Class name is required' });
      } else if (!existingClasses.has(row.className.trim().toLowerCase())) {
        errors.push({ row: rowNum, field: 'className', message: `Class "${row.className}" not found in institution` });
      }
      if (row.aadhaarNumber && !/^\d{12}$/.test(row.aadhaarNumber)) {
        errors.push({ row: rowNum, field: 'aadhaarNumber', message: 'Aadhaar must be 12 digits' });
      }
      if (row.pinCode && !/^\d{6}$/.test(row.pinCode)) {
        errors.push({ row: rowNum, field: 'pinCode', message: 'PIN code must be 6 digits' });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors, imported: 0 };
    }

    // Phase 2: Transactional bulk creation
    const settingGroup = await this.prisma.organizationSetting.findUnique({
      where: { organizationId_groupCode: { organizationId: institutionId, groupCode: 'ACADEMIC_RULES' } },
      include: { items: true },
    });
    const prefixItem = settingGroup?.items.find(item => item.key === 'scholar_number_prefix');
    const digitsItem = settingGroup?.items.find(item => item.key === 'scholar_number_digits');
    const prefix = prefixItem?.value || 'SCH';
    const digitsCount = digitsItem ? parseInt(digitsItem.value, 10) : 4;

    const existingClasses2 = new Map(
      (await this.prisma.class.findMany({ where: { institutionId }, select: { id: true, name: true } }))
        .map(c => [c.name.toLowerCase(), c.id]),
    );

    const results: any[] = [];

    await this.prisma.$transaction(async (tx) => {
      let studentBaseCount = await tx.student.count({ where: { institutionId } });
      const currentYear = new Date().getFullYear();

      for (const row of rows) {
        const classId = existingClasses2.get(row.className.trim().toLowerCase())!;
        studentBaseCount++;
        const scholarNumber = `${prefix}-${currentYear}-${String(studentBaseCount).padStart(digitsCount, '0')}`;

        const tempPassword = `TEMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const passwordHash = await argon2.hash(tempPassword);

        const user = await tx.user.create({
          data: {
            email: row.email.trim().toLowerCase(),
            passwordHash,
            role: 'STUDENT',
            institutionId,
            mustChangePassword: true,
          },
        });

        let parentId: string | null = null;
        if (row.fatherName || row.motherName) {
          const parent = await tx.parent.create({
            data: {
              firstName: row.fatherName || 'Guardian',
              lastName: row.lastName || '',
              phone: encrypt(row.parentPhone || '9999999999') || '',
              occupation: row.fatherOccupation || null,
            },
          });
          parentId = parent.id;
        }

        const student = await tx.student.create({
          data: {
            userId: user.id,
            scholarNumber,
            rollNumber: row.rollNumber || `ROLL-${studentBaseCount}`,
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            dateOfBirth: new Date(row.dateOfBirth),
            gender: row.gender.toUpperCase(),
            classId,
            parentId,
            institutionId,
            aadhaarNumber: row.aadhaarNumber ? encrypt(row.aadhaarNumber) : null,
            bloodGroup: row.bloodGroup || null,
            religion: row.religion || null,
            casteCategory: row.casteCategory || 'GENERAL',
            fatherName: row.fatherName ? encrypt(row.fatherName) : null,
            motherName: row.motherName ? encrypt(row.motherName) : null,
            city: row.city || null,
            state: row.state || null,
            pinCode: row.pinCode || null,
          },
        });

        await tx.timelineEvent.create({
          data: {
            studentId: student.id,
            type: 'ADMISSION',
            description: `Bulk imported. Scholar No: ${scholarNumber}`,
          },
        });

        if (creatorUserId) {
          await tx.studentStatusHistory.create({
            data: {
              studentId: student.id,
              oldStatus: 'NONE',
              newStatus: 'ACTIVE',
              changedById: creatorUserId,
              remarks: 'Initial status set during bulk import.',
            },
          });
        }

        results.push({ scholarNumber, email: row.email, temporaryPassword: tempPassword });
      }
    });

    if (creatorUserId) {
      await this.auditLogService.logAction(
        creatorUserId,
        'BULK_IMPORT_STUDENTS',
        JSON.stringify({
          message: `Bulk imported ${results.length} students into institution ${institutionId}`,
          before: null,
          after: { count: results.length },
        }),
      );
    }

    return { success: true, errors: [], imported: results.length, students: results };
  }
}
