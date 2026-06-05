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

    // Deterministic Rule: Attendance < 70% AND Exam Marks < 40%
    const studentsWithRecords = await this.prisma.student.findMany({
      where: { institutionId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        scholarNumber: true,
        class: { select: { name: true } },
        attendance: { select: { status: true } },
        examResults: {
          select: {
            marksObtained: true,
            exam: { select: { maxMarks: true } },
          },
        },
      },
    });

    const weakStudents: any[] = [];
    for (const student of studentsWithRecords) {
      const sTotalAttendance = student.attendance.length;
      const sPresentCount = student.attendance.filter(
        (r) => r.status === 'PRESENT' || r.status === 'LATE',
      ).length;
      const sAttendanceRate = sTotalAttendance > 0 ? (sPresentCount / sTotalAttendance) * 100 : 100;

      let totalMaxMarks = 0;
      let totalMarksObtained = 0;
      for (const res of student.examResults) {
        totalMaxMarks += res.exam.maxMarks;
        totalMarksObtained += res.marksObtained;
      }
      const examPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 100;

      if (sAttendanceRate < 70 && examPercentage < 40) {
        weakStudents.push({
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          scholarNumber: student.scholarNumber,
          rollNumber: student.rollNumber,
          className: student.class?.name || 'Unassigned',
          attendanceRate: Math.round(sAttendanceRate * 10) / 10,
          examAverage: Math.round(examPercentage * 10) / 10,
          reason: 'Attendance < 70% and Marks < 40%',
        });
      }
    }

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
      weakStudents,
    };
  }

  async getFounderStats() {
    const totalOrganizations = await this.prisma.institution.count();
    const totalUsers = await this.prisma.user.count();
    const totalMemberships = await this.prisma.organizationMembership.count();

    const subscriptions = await this.prisma.subscription.findMany({
      select: {
        planCode: true,
        status: true,
        studentLimit: true,
        storageLimitGb: true,
      },
    });

    const planBreakdown: Record<string, number> = {};
    let activeSubscriptions = 0;
    let totalStorageLimit = 0;
    let totalStudentLimit = 0;

    for (const sub of subscriptions) {
      planBreakdown[sub.planCode] = (planBreakdown[sub.planCode] || 0) + 1;
      if (sub.status === 'ACTIVE') {
        activeSubscriptions++;
      }
      totalStorageLimit += Number(sub.storageLimitGb) || 0;
      totalStudentLimit += sub.studentLimit || 0;
    }

    const activeLicenses = await this.prisma.license.count({
      where: { status: 'ACTIVE' },
    });

    const recentOrganizations = await this.prisma.institution.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        primaryColor: true,
        createdAt: true,
      },
    });

    const modules = await this.prisma.module.findMany({
      include: {
        orgModules: {
          where: { isEnabled: true },
        },
      },
    });

    const moduleUsage = modules.map((m) => ({
      code: m.code,
      name: m.name,
      activeCount: m.orgModules.length,
    }));

    return {
      totalOrganizations,
      totalUsers,
      totalMemberships,
      activeSubscriptions,
      totalStorageLimit,
      totalStudentLimit,
      activeLicenses,
      planBreakdown,
      recentOrganizations,
      moduleUsage,
    };
  }
}
