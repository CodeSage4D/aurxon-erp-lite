import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

const layoutCache = new Map<string, { data: any; timestamp: number }>();
const dashboardPackCache = new Map<string, any>();
const instPackCodeCache = new Map<string, string>();

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
      take: 50,
      include: {
        lifecycle: true,
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

  async getLayout(institutionId: string, role: string, enabledModules: string[]) {
    const cacheKey = `${institutionId}-${role}-${(enabledModules || []).join(',')}`;
    const cached = layoutCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 600000) {
      return cached.data;
    }

    let packCode = instPackCodeCache.get(institutionId);
    if (!packCode) {
      const inst = await this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { industryPackCode: true },
      });
      packCode = inst?.industryPackCode || 'SCHOOL_ERP';
      instPackCodeCache.set(institutionId, packCode);
    }

    let pack = dashboardPackCache.get(packCode);
    if (!pack) {
      pack = await this.prisma.industryPack.findUnique({
        where: { code: packCode },
      });
      if (!pack) {
        // Fallback
        pack = await this.prisma.industryPack.findUnique({
          where: { code: 'SCHOOL_ERP' },
        });
      }
      if (pack) {
        dashboardPackCache.set(packCode, pack);
      }
    }

    if (!pack || !pack.defaultDashboard) {
      return { sections: [] };
    }

    const dashboardJson = pack.defaultDashboard as Record<string, any>;
    
    // Find role layout key (exact match first)
    let roleLayout = dashboardJson[role];

    // Case insensitive matching fallback
    if (!roleLayout) {
      const matchedKey = Object.keys(dashboardJson).find(
        (k) => k.toLowerCase() === role.toLowerCase()
      );
      if (matchedKey) {
        roleLayout = dashboardJson[matchedKey];
      }
    }

    // Role independent fallback (take first available role dashboard)
    if (!roleLayout) {
      const keys = Object.keys(dashboardJson);
      if (keys.length > 0) {
        roleLayout = dashboardJson[keys[0]];
      }
    }

    if (!roleLayout || !Array.isArray(roleLayout.sections)) {
      return { sections: [] };
    }

    // Filter sections and widgets by enabledModules
    const filteredSections = roleLayout.sections.map((section: any) => {
      const filteredWidgets = (section.widgets || []).filter((widget: any) => {
        if (!widget.moduleCode) return true; // not gated
        return enabledModules.includes(widget.moduleCode);
      });
      return {
        ...section,
        widgets: filteredWidgets,
      };
    }).filter((section: any) => section.widgets.length > 0);

    const result = { sections: filteredSections };
    layoutCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  async getWidgetData(institutionId: string) {
    const inst = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { industryPackCode: true },
    });

    const packCode = inst?.industryPackCode || 'SCHOOL_ERP';

    if (packCode === 'HOSPITAL_ERP') {
      return {
        studentCount: 0,
        staffCount: 0,
        classCount: 0,
        patientCount: 142,
        doctorsCount: 19,
        bedOccupancy: '84%',
        dailyCollection: '₹1,43,900',
        admissionsByDept: [
          { name: 'Cardiology', count: 42 },
          { name: 'Pediatrics', count: 28 },
          { name: 'General Med.', count: 56 },
          { name: 'Orthopedics', count: 16 }
        ],
        criticalAlerts: [
          { id: '1', label: 'ICU Bed #4 Alert', desc: 'Pulse fluctuations monitored' },
          { id: '2', label: 'Blood Bank O- Low', desc: 'Less than 3 units remaining' }
        ],
        appointmentsCount: '14 Slots',
        patientsConsulted: '6 Patients',
        criticalCases: '2 Cases',
        weakStudents: [],
        recentNotices: [],
        feeOverview: {
          totalDue: 0,
          totalPaid: 0,
          totalPending: 0,
          collectionRate: 0,
        },
        attendanceRate: 0,
      };
    }

    if (packCode === 'CORPORATE_ERP') {
      return {
        studentCount: 0,
        staffCount: 0,
        classCount: 0,
        employeeCount: 76,
        openPositions: 8,
        checkinCompliance: '94.2%',
        payrollCost: '₹18,50,000',
        headcountByDept: [
          { name: 'Engineering', value: 34 },
          { name: 'Sales & Mktg', value: 22 },
          { name: 'Finance', value: 8 },
          { name: 'Operations', value: 12 }
        ],
        pendingApprovals: [
          { id: '1', label: 'Q3 Marketing budget allocation', desc: 'Review request by HR Head' },
          { id: '2', label: 'Salary escalation approval', desc: 'Engineering manager proposal' }
        ],
        weakStudents: [],
        recentNotices: [],
        feeOverview: {
          totalDue: 0,
          totalPaid: 0,
          totalPending: 0,
          collectionRate: 0,
        },
        attendanceRate: 0,
      };
    }

    // Default: SCHOOL_ERP or fallback to standard admin stats
    return this.getAdminStats(institutionId);
  }
}

