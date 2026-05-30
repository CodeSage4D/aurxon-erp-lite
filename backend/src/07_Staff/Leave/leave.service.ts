// IEEE 12207 compliant staff leave management service
// Handles leave requests, approval workflow, and leave balance tracking

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async findAll(institutionId: string, staffId?: string, status?: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        staff: { institutionId },
        ...(staffId ? { staffId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        staff: { select: { firstName: true, lastName: true, employeeId: true, designation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(institutionId: string, id: string) {
    const leave = await this.prisma.leaveRequest.findFirst({
      where: { id, staff: { institutionId } },
      include: {
        staff: { select: { firstName: true, lastName: true, employeeId: true } },
      },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async create(institutionId: string, data: {
    staffId: string;
    startDate: string;
    endDate: string;
    reason: string;
    leaveType?: string;
  }) {
    const staff = await this.prisma.staff.findFirst({ where: { id: data.staffId, institutionId } });
    if (!staff) throw new NotFoundException('Staff member not found');

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) throw new BadRequestException('startDate must be before or equal to endDate');

    // Check for overlapping pending/approved leave
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        staffId: data.staffId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });
    if (overlap) throw new BadRequestException('A leave request already exists for overlapping dates');

    return this.prisma.leaveRequest.create({
      data: {
        staffId: data.staffId,
        startDate: start,
        endDate: end,
        reason: data.reason,
        leaveType: data.leaveType || 'CL',
        status: 'PENDING',
      },
    });
  }

  async approve(institutionId: string, id: string, approverId: string) {
    const leave = await this.prisma.leaveRequest.findFirst({
      where: { id, staff: { institutionId } },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    if (leave.status !== 'PENDING') throw new BadRequestException('Only pending leave requests can be approved');

    // Calculate number of leave days
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return this.prisma.$transaction(async (tx) => {
      // Find or initialize balance for this staff, leaveType, and current academic year
      const currentYear = '2026-2027'; // ERP default academic year
      const balance = await tx.staffLeaveBalance.findFirst({
        where: {
          staffId: leave.staffId,
          leaveType: leave.leaveType,
          academicYear: currentYear,
        },
      });

      if (balance) {
        await tx.staffLeaveBalance.update({
          where: { id: balance.id },
          data: {
            consumed: balance.consumed + diffDays,
          },
        });
      } else {
        // Create initial balance ledger if not exists
        await tx.staffLeaveBalance.create({
          data: {
            staffId: leave.staffId,
            leaveType: leave.leaveType,
            entitlement: 15, // default basic entitlement
            consumed: diffDays,
            academicYear: currentYear,
          },
        });
      }

      return tx.leaveRequest.update({
        where: { id },
        data: { status: 'APPROVED', approvedById: approverId },
      });
    });
  }

  async reject(institutionId: string, id: string, approverId: string) {
    const leave = await this.prisma.leaveRequest.findFirst({
      where: { id, staff: { institutionId } },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    if (leave.status !== 'PENDING') throw new BadRequestException('Only pending leave requests can be rejected');

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', approvedById: approverId },
    });
  }

  async getBalances(institutionId: string, staffId: string) {
    const staff = await this.prisma.staff.findFirst({ where: { id: staffId, institutionId } });
    if (!staff) throw new NotFoundException('Staff member not found');

    const balances = await this.prisma.staffLeaveBalance.findMany({
      where: { staffId },
    });

    return { staff, balances };
  }

  async upsertBalance(institutionId: string, data: {
    staffId: string;
    leaveType: string;
    entitlement: number;
    academicYear: string;
  }) {
    const staff = await this.prisma.staff.findFirst({ where: { id: data.staffId, institutionId } });
    if (!staff) throw new NotFoundException('Staff member not found');

    return this.prisma.staffLeaveBalance.upsert({
      where: {
        staffId_leaveType_academicYear: {
          staffId: data.staffId,
          leaveType: data.leaveType,
          academicYear: data.academicYear,
        },
      },
      create: {
        staffId: data.staffId,
        leaveType: data.leaveType,
        entitlement: data.entitlement,
        consumed: 0,
        academicYear: data.academicYear,
      },
      update: {
        entitlement: data.entitlement,
      },
    });
  }
}
