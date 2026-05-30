// Staff Attendance service — IEEE 12207 compliant clock-in/clock-out management
// Tracks staff presence, half-days, leave-days with timestamp accuracy

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class StaffAttendanceService {
  constructor(private prisma: PrismaService) {}

  async recordToday(institutionId: string, data: { staffId: string; status: string; clockIn?: string; clockOut?: string; remarks?: string; branchId?: string }) {
    // Verify staff belongs to institution
    const staff = await this.prisma.staff.findFirst({
      where: { id: data.staffId, institutionId },
    });
    if (!staff) throw new NotFoundException('Staff member not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert: update if today's record exists, create otherwise
    const existing = await this.prisma.staffAttendance.findFirst({
      where: { staffId: data.staffId, date: today },
    });

    if (existing) {
      return this.prisma.staffAttendance.update({
        where: { id: existing.id },
        data: {
          status: data.status,
          clockIn: data.clockIn ?? existing.clockIn,
          clockOut: data.clockOut ?? existing.clockOut,
          remarks: data.remarks ?? existing.remarks,
        },
      });
    }

    return this.prisma.staffAttendance.create({
      data: {
        staffId: data.staffId,
        date: today,
        status: data.status,
        clockIn: data.clockIn,
        clockOut: data.clockOut,
        remarks: data.remarks,
        branchId: data.branchId,
      },
    });
  }

  async bulkRecord(institutionId: string, date: string, records: Array<{ staffId: string; status: string; clockIn?: string; remarks?: string }>) {
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);

    const results: any[] = [];
    for (const record of records) {
      const staff = await this.prisma.staff.findFirst({ where: { id: record.staffId, institutionId } });
      if (!staff) continue;

      const existing = await this.prisma.staffAttendance.findFirst({
        where: { staffId: record.staffId, date: recordDate },
      });

      if (existing) {
        results.push(await this.prisma.staffAttendance.update({
          where: { id: existing.id },
          data: { status: record.status, clockIn: record.clockIn, remarks: record.remarks },
        }));
      } else {
        results.push(await this.prisma.staffAttendance.create({
          data: {
            staffId: record.staffId,
            date: recordDate,
            status: record.status,
            clockIn: record.clockIn,
            remarks: record.remarks,
          },
        }));
      }
    }

    return { success: true, recorded: results.length };
  }

  async getByDate(institutionId: string, date: string) {
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);

    return this.prisma.staffAttendance.findMany({
      where: {
        staff: { institutionId },
        date: recordDate,
      },
      include: {
        staff: { select: { firstName: true, lastName: true, employeeId: true, designation: true } },
      },
      orderBy: { staff: { firstName: 'asc' } },
    });
  }

  async getMonthlySummary(institutionId: string, staffId: string, month: number, year: number) {
    const staff = await this.prisma.staff.findFirst({ where: { id: staffId, institutionId } });
    if (!staff) throw new NotFoundException('Staff member not found');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await this.prisma.staffAttendance.findMany({
      where: {
        staffId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const summary = {
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      halfDay: records.filter(r => r.status === 'HALF_DAY').length,
      onLeave: records.filter(r => r.status === 'ON_LEAVE').length,
      totalDays: records.length,
    };

    return { staff, summary, records };
  }
}
