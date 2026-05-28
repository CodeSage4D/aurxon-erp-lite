import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats(institutionId: string) {
    const studentCount = await this.prisma.student.count({ where: { institutionId } });
    const staffCount = await this.prisma.staff.count({ where: { institutionId } });
    const classCount = await this.prisma.class.count({ where: { institutionId } });

    const notices = await this.prisma.notice.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const allocations = await this.prisma.studentFeeAllocation.findMany({
      where: { student: { institutionId } },
      select: { amountDue: true, amountPaid: true },
    });

    let totalDue = 0;
    let totalPaid = 0;
    for (const alloc of allocations) {
      totalDue += alloc.amountDue;
      totalPaid += alloc.amountPaid;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        date: { gte: sevenDaysAgo },
        student: { institutionId },
      },
      select: { status: true },
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 96.5;

    const classes = await this.prisma.class.findMany({
      where: { institutionId },
      select: {
        id: true,
        name: true,
        _count: { select: { students: true } },
      },
    });

    return {
      studentCount,
      staffCount,
      classCount,
      feeOverview: {
        totalDue,
        totalPaid,
        totalPending: totalDue - totalPaid,
        collectionRate: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 90,
      },
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      recentNotices: notices,
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        studentCount: c._count.students,
      })),
    };
  }
}
