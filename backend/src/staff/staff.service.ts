import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getStaff(institutionId: string, designation?: string) {
    const where: any = { institutionId };
    if (designation) {
      where.designation = designation;
    }

    return this.prisma.staff.findMany({
      where,
      include: {
        user: { select: { email: true, isActive: true } },
      },
      orderBy: { employeeId: 'asc' },
    });
  }

  async createStaff(institutionId: string, data: any) {
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
          role: data.role || 'TEACHER',
          institutionId,
        },
      });

      return tx.staff.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          designation: data.designation,
          joiningDate: new Date(data.joiningDate || Date.now()),
          salary: parseFloat(data.salary || 0),
          institutionId,
        },
      });
    });
  }

  async getLeaves(institutionId: string, staffId?: string) {
    const where: any = {
      staff: { institutionId },
    };

    if (staffId) {
      where.staffId = staffId;
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        staff: {
          select: { firstName: true, lastName: true, designation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeaveRequest(staffUserId: string, data: any) {
    const staff = await this.prisma.staff.findUnique({
      where: { userId: staffUserId },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }

    return this.prisma.leaveRequest.create({
      data: {
        staffId: staff.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'PENDING',
      },
    });
  }

  async updateLeaveStatus(institutionId: string, leaveId: string, status: string, approverUserId: string) {
    const leave = await this.prisma.leaveRequest.findFirst({
      where: {
        id: leaveId,
        staff: { institutionId },
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        approvedById: approverUserId,
      },
    });
  }
}
