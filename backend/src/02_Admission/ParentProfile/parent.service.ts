// IEEE Standard 12207 compliant parent profile service
// Parent is a first-class entity in AURXON ERP Lite — not just a portal accessor

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';
import * as argon2 from 'argon2';
import { encrypt, decrypt, maskSensitiveData } from '../../common/helpers/encryption.helper';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  private processParent(parent: any, requesterRole?: string): any {
    if (!parent) return null;
    const decryptedAadhaar = decrypt(parent.aadhaarNumber);
    const decryptedPhone = decrypt(parent.phone);
    const decryptedAddress = decrypt(parent.address);

    const isAuthorized = requesterRole === 'SUPER_ADMIN' || requesterRole === 'INSTITUTE_ADMIN' || requesterRole === 'HR_MANAGER';

    return {
      ...parent,
      aadhaarNumber: isAuthorized ? decryptedAadhaar : (decryptedAadhaar ? maskSensitiveData(decryptedAadhaar, 4) : null),
      phone: isAuthorized ? decryptedPhone : (decryptedPhone ? maskSensitiveData(decryptedPhone, 4) : null),
      address: isAuthorized ? decryptedAddress : (decryptedAddress ? 'Masked for Privacy' : null),
    };
  }

  async findAll(institutionId: string, search?: string, requesterRole?: string) {
    const where: any = {
      AND: [
        {
          OR: [
            { user: { institutionId } },
            { students: { some: { institutionId } } },
          ],
        },
      ],
    };

    if (search) {
      where.AND.push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    const parents = await this.prisma.parent.findMany({
      where,
      include: {
        user: { select: { email: true, isActive: true, role: true } },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            scholarNumber: true,
            class: { select: { name: true } },
            status: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return parents.map(p => this.processParent(p, requesterRole));
  }

  async findOne(institutionId: string, id: string, requesterRole?: string) {
    const parent = await this.prisma.parent.findFirst({
      where: {
        id,
        OR: [
          { user: { institutionId } },
          { students: { some: { institutionId } } },
        ],
      },
      include: {
        user: { select: { id: true, email: true, isActive: true, role: true } },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            scholarNumber: true,
            rollNumber: true,
            class: { select: { id: true, name: true } },
            status: true,
          },
        },
      },
    });

    if (!parent) throw new NotFoundException('Parent profile not found');
    return this.processParent(parent, requesterRole);
  }

  async create(institutionId: string, data: any) {
    // Email uniqueness check
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email is already registered');

    // Aadhaar validation
    if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
      throw new BadRequestException('Aadhaar number must be exactly 12 numeric digits');
    }

    return this.prisma.$transaction(async (tx) => {
      const passwordHash = await argon2.hash(data.password || 'parent@123');

      const user = await tx.user.create({
        data: {
          email: data.email.trim().toLowerCase(),
          passwordHash,
          role: 'PARENT',
          institutionId,
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: encrypt(data.phone) || '',
          occupation: data.occupation || null,
          address: encrypt(data.address) || null,
          aadhaarNumber: data.aadhaarNumber ? encrypt(data.aadhaarNumber) : null,
        },
      });

      // Link students if provided
      if (data.studentIds && data.studentIds.length > 0) {
        await tx.student.updateMany({
          where: {
            id: { in: data.studentIds },
            institutionId,
          },
          data: { parentId: parent.id },
        });
      }

      return { ...this.processParent(parent, 'SUPER_ADMIN'), user: { email: user.email, isActive: user.isActive } };
    });
  }

  async update(institutionId: string, id: string, data: any) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, user: { institutionId } },
    });

    if (!parent) throw new NotFoundException('Parent profile not found');

    if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
      throw new BadRequestException('Aadhaar number must be exactly 12 numeric digits');
    }

    const updatedParent = await this.prisma.parent.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone !== undefined ? (encrypt(data.phone) || '') : undefined,
        occupation: data.occupation,
        address: data.address !== undefined ? (encrypt(data.address) || null) : undefined,
        aadhaarNumber: data.aadhaarNumber !== undefined
          ? (data.aadhaarNumber ? encrypt(data.aadhaarNumber) : null)
          : undefined,
      },
    });

    return this.processParent(updatedParent, 'SUPER_ADMIN');
  }

  async linkStudent(institutionId: string, parentId: string, studentId: string) {
    const [parent, student] = await Promise.all([
      this.prisma.parent.findFirst({ where: { id: parentId, user: { institutionId } } }),
      this.prisma.student.findFirst({ where: { id: studentId, institutionId } }),
    ]);

    if (!parent) throw new NotFoundException('Parent not found');
    if (!student) throw new NotFoundException('Student not found');

    await this.prisma.student.update({
      where: { id: studentId },
      data: { parentId },
    });

    return { success: true, message: 'Student linked to parent successfully' };
  }

  async unlinkStudent(institutionId: string, parentId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, parentId, institutionId },
    });

    if (!student) throw new NotFoundException('Student not found or not linked to this parent');

    await this.prisma.student.update({
      where: { id: studentId },
      data: { parentId: null },
    });

    return { success: true, message: 'Student unlinked from parent' };
  }

  async remove(institutionId: string, id: string) {
    const parent = await this.prisma.parent.findFirst({
      where: {
        id,
        OR: [
          { user: { institutionId } },
          { students: { some: { institutionId } } },
        ],
      },
      include: { user: true },
    });

    if (!parent) throw new NotFoundException('Parent profile not found');

    // Unlink all children before removing
    await this.prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    await this.prisma.parent.delete({ where: { id } });
    if (parent.userId) {
      await this.prisma.user.delete({ where: { id: parent.userId } });
    }

    return { success: true, message: 'Parent profile removed successfully' };
  }

  async getLinkedStudents(institutionId: string, parentId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id: parentId, user: { institutionId } },
      include: {
        students: {
          include: {
            class: { select: { name: true, board: true, stream: true } },
            attendance: {
              take: 30,
              orderBy: { date: 'desc' },
              select: { date: true, status: true },
            },
            feeAllocations: {
              where: { status: { not: 'PAID' } },
              include: { feeStructure: { select: { name: true, dueDate: true } } },
            },
          },
        },
      },
    });

    if (!parent) throw new NotFoundException('Parent not found');
    return parent.students;
  }
}
