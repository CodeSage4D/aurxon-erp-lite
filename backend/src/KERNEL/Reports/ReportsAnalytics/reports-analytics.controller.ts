// AURXON ERP Lite — Reports & Analytics Controller
// IEEE 42010 compliant: merged 09_Reports + 10_Analytics sprint
// Provides aggregated data exports and risk analytics for administrators

import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../Authentication/jwt-auth.guard';
import { Roles, RolesGuard } from '../../Authentication/roles.guard';
import { PrismaService } from '../../../SHARED/Prisma/prisma.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'TEACHER')
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Student Reports ────────────────────────────────────────

  @Get('students')
  async studentRegister(
    @Request() req: any,
    @Query('classId') classId?: string,
    @Query('status') status?: string,
  ) {
    return this.prisma.student.findMany({
      where: {
        institutionId: req.user.institutionId,
        ...(classId ? { classId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        class: { select: { name: true, board: true, stream: true } },
        parent: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: [{ class: { name: 'asc' } }, { rollNumber: 'asc' }],
    });
  }

  // ── Attendance Reports ─────────────────────────────────────

  @Get('attendance/monthly')
  async monthlyAttendance(
    @Request() req: any,
    @Query('classId') classId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const records = await this.prisma.attendance.findMany({
      where: {
        student: { institutionId: req.user.institutionId, ...(classId ? { classId } : {}) },
        date: { gte: startDate, lte: endDate },
      },
      include: {
        student: { select: { firstName: true, lastName: true, rollNumber: true, scholarNumber: true } },
      },
      orderBy: [{ student: { rollNumber: 'asc' } }, { date: 'asc' }],
    });

    // Group by student for summary
    const byStudent: Record<string, any> = {};
    for (const r of records) {
      if (!byStudent[r.studentId]) {
        byStudent[r.studentId] = {
          student: r.student,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        };
      }
      byStudent[r.studentId][r.status.toLowerCase()]++;
      byStudent[r.studentId].total++;
    }

    return { month, year, summary: Object.values(byStudent), raw: records };
  }

  // ── Fee Reports ────────────────────────────────────────────

  @Get('fees/defaulters')
  async feeDefaulters(@Request() req: any, @Query('classId') classId?: string) {
    return this.prisma.studentFeeAllocation.findMany({
      where: {
        status: { in: ['UNPAID', 'PARTIAL'] },
        student: {
          institutionId: req.user.institutionId,
          ...(classId ? { classId } : {}),
        },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            scholarNumber: true,
            rollNumber: true,
            class: { select: { name: true } },
            parent: { select: { phone: true, firstName: true, lastName: true } },
          },
        },
        feeStructure: { select: { name: true, dueDate: true, amount: true } },
      },
      orderBy: { feeStructure: { dueDate: 'asc' } },
    });
  }

  @Get('fees/collection-summary')
  async feeCollectionSummary(@Request() req: any) {
    const [totalDue, totalPaid, unpaid, partial] = await Promise.all([
      this.prisma.studentFeeAllocation.aggregate({
        where: { student: { institutionId: req.user.institutionId } },
        _sum: { amountDue: true },
      }),
      this.prisma.studentFeeAllocation.aggregate({
        where: { student: { institutionId: req.user.institutionId } },
        _sum: { amountPaid: true },
      }),
      this.prisma.studentFeeAllocation.count({
        where: { status: 'UNPAID', student: { institutionId: req.user.institutionId } },
      }),
      this.prisma.studentFeeAllocation.count({
        where: { status: 'PARTIAL', student: { institutionId: req.user.institutionId } },
      }),
    ]);

    const totalDueVal = totalDue._sum.amountDue || 0;
    const totalPaidVal = totalPaid._sum.amountPaid || 0;
    const outstanding = totalDueVal - totalPaidVal;
    const collectionPct = totalDueVal > 0 ? Math.round((totalPaidVal / totalDueVal) * 100) : 0;

    return {
      totalDue: totalDueVal,
      totalCollected: totalPaidVal,
      outstanding,
      collectionPercentage: collectionPct,
      unpaidCount: unpaid,
      partialCount: partial,
    };
  }

  // ── Exam / Academic Reports ────────────────────────────────

  @Get('exams/class-performance/:examId')
  async classPerformance(@Request() req: any, @Param('examId') examId: string) {
    const results = await this.prisma.examResult.findMany({
      where: {
        examId,
        student: { institutionId: req.user.institutionId },
      },
      include: {
        student: { select: { firstName: true, lastName: true, rollNumber: true } },
        exam: { select: { name: true, maxMarks: true, subject: { select: { name: true } } } },
      },
      orderBy: { marksObtained: 'desc' },
    });

    if (!results.length) return { results: [], stats: null };

    const marks = results.map(r => r.marksObtained);
    const maxMarks = results[0]?.exam?.maxMarks || 100;
    const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const passing = marks.filter(m => (m / maxMarks) * 100 >= 33).length;

    return {
      results,
      stats: {
        average: Math.round(avg * 100) / 100,
        highest,
        lowest,
        passCount: passing,
        failCount: marks.length - passing,
        passPercentage: Math.round((passing / marks.length) * 100),
        totalStudents: marks.length,
      },
    };
  }

  // ── Analytics / Risk Flags ─────────────────────────────────

  @Get('analytics/at-risk')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  async atRiskStudents(@Request() req: any) {
    // Students with attendance < 75% in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const students = await this.prisma.student.findMany({
      where: { institutionId: req.user.institutionId, status: 'ACTIVE' },
      include: {
        class: { select: { name: true } },
        attendance: {
          where: { date: { gte: thirtyDaysAgo } },
          select: { status: true },
        },
        feeAllocations: {
          where: { status: { in: ['UNPAID', 'PARTIAL'] } },
          select: { amountDue: true, amountPaid: true, feeStructure: { select: { dueDate: true } } },
        },
      },
    });

    const atRisk = students
      .map(s => {
        const total = s.attendance.length;
        const present = s.attendance.filter(a => a.status === 'PRESENT').length;
        const attendancePct = total > 0 ? Math.round((present / total) * 100) : null;
        const overdueFees = s.feeAllocations.filter(f => new Date(f.feeStructure.dueDate) < new Date());

        const risks: string[] = [];
        if (attendancePct !== null && attendancePct < 75) risks.push(`Low attendance (${attendancePct}%)`);
        if (overdueFees.length > 0) risks.push(`${overdueFees.length} overdue fee(s)`);

        return {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          scholarNumber: s.scholarNumber,
          class: s.class.name,
          attendancePct,
          overdueFeesCount: overdueFees.length,
          risks,
          riskLevel: risks.length >= 2 ? 'HIGH' : risks.length === 1 ? 'MEDIUM' : 'LOW',
        };
      })
      .filter(s => s.risks.length > 0)
      .sort((a, b) => b.risks.length - a.risks.length);

    return { atRisk, total: atRisk.length };
  }

  @Get('analytics/dashboard')
  async analyticsDashboard(@Request() req: any) {
    const institutionId = req.user.institutionId;

    const [
      totalStudents,
      activeStudents,
      totalStaff,
      todayAttendance,
    ] = await Promise.all([
      this.prisma.student.count({ where: { institutionId } }),
      this.prisma.student.count({ where: { institutionId, status: 'ACTIVE' } }),
      this.prisma.staff.count({ where: { institutionId, status: 'ACTIVE' } }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          student: { institutionId },
        },
        _count: true,
      }),
    ]);

    const attendanceMap = Object.fromEntries(todayAttendance.map(a => [a.status, a._count]));

    return {
      enrollment: { total: totalStudents, active: activeStudents },
      staff: { active: totalStaff },
      todayAttendance: {
        present: attendanceMap['PRESENT'] || 0,
        absent: attendanceMap['ABSENT'] || 0,
        late: attendanceMap['LATE'] || 0,
      },
    };
  }
}
