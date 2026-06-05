import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('Seeding SaaS control plane data...');

  // 1. Clean existing records in cascade order
  await prisma.permission.deleteMany({});
  await prisma.organizationMembership.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.tenantDomain.deleteMany({});
  await prisma.organizationBranding.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.license.deleteMany({});
  await prisma.organizationFeature.deleteMany({});
  await prisma.organizationModule.deleteMany({});
  await prisma.feature.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.configurationItem.deleteMany({});
  await prisma.organizationSetting.deleteMany({});

  await prisma.promotionHistory.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.settings.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.examResult.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.studentFeeAllocation.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.lessonPlan.deleteMany({});
  await prisma.bookIssue.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.visitor.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.timetableEntry.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institution.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Core Institutions (Organizations)
  const dps = await prisma.institution.create({
    data: {
      name: 'Delhi Public School, Sector 4',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#0284c7',
    },
  });

  const rkmvp = await prisma.institution.create({
    data: {
      name: 'Ramakrishna Mission Vidyapith',
      logoUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f880?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#ea580c', // Orange brand theme
    },
  });

  const kpphs = await prisma.institution.create({
    data: {
      name: 'Kalyani Priyanath High School',
      logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#16a34a', // Green brand theme
    },
  });

  console.log('Institutions created.');

  // 3. Create SaaS Modules and Features
  const modStudent = await prisma.module.create({
    data: { name: 'Student Management', code: 'STUDENT_MANAGEMENT' },
  });
  const modAttendance = await prisma.module.create({
    data: { name: 'Attendance Management', code: 'ATTENDANCE' },
  });
  const modExams = await prisma.module.create({
    data: { name: 'Examinations', code: 'EXAMINATION' },
  });
  const modFinance = await prisma.module.create({
    data: { name: 'Finance & Accounts', code: 'FINANCE' },
  });

  // Features
  await prisma.feature.create({
    data: { moduleId: modAttendance.id, name: 'Biometric Attendance', code: 'BIOMETRIC_ATTENDANCE' },
  });
  await prisma.feature.create({
    data: { moduleId: modExams.id, name: 'Configurable Exam Formulas', code: 'EXAM_FORMULA_CALCULATOR' },
  });

  // Enable Modules for RKMVP
  await prisma.organizationModule.createMany({
    data: [
      { organizationId: rkmvp.id, moduleCode: 'STUDENT_MANAGEMENT', isEnabled: true },
      { organizationId: rkmvp.id, moduleCode: 'ATTENDANCE', isEnabled: true },
      { organizationId: rkmvp.id, moduleCode: 'EXAMINATION', isEnabled: true },
    ],
  });

  // Enable Modules for DPS (All Modules)
  await prisma.organizationModule.createMany({
    data: [
      { organizationId: dps.id, moduleCode: 'STUDENT_MANAGEMENT', isEnabled: true },
      { organizationId: dps.id, moduleCode: 'ATTENDANCE', isEnabled: true },
      { organizationId: dps.id, moduleCode: 'EXAMINATION', isEnabled: true },
      { organizationId: dps.id, moduleCode: 'FINANCE', isEnabled: true },
    ],
  });

  console.log('Modules & Marketplace seeded.');

  // 4. Create Roles and Permissions for each Institution
  const rolesData = [
    { code: 'SUPER_ADMIN', name: 'Super Admin', isSystem: true },
    { code: 'INSTITUTE_ADMIN', name: 'Institute Admin', isSystem: true },
    { code: 'PRINCIPAL', name: 'Principal', isSystem: true },
    { code: 'TEACHER', name: 'Teacher', isSystem: true },
    { code: 'CONSULTANT', name: 'Consultant', isSystem: false },
  ];

  const spawnedRoles: Record<string, Record<string, string>> = {}; // InstId -> RoleCode -> RoleId

  for (const inst of [dps, rkmvp, kpphs]) {
    spawnedRoles[inst.id] = {};
    for (const r of rolesData) {
      const createdRole = await prisma.role.create({
        data: {
          name: r.name,
          code: r.code,
          isSystem: r.isSystem,
          institutionId: inst.id,
        },
      });
      spawnedRoles[inst.id][r.code] = createdRole.id;

      // Seed core permissions
      await prisma.permission.create({
        data: {
          roleId: createdRole.id,
          resource: 'student:profile',
          action: r.code === 'TEACHER' ? 'READ' : 'CRUD',
        },
      });
    }
  }

  console.log('Roles & Permissions generated.');

  // 5. Create Users & Memberships
  // 5a. founder@aurxon.com
  const founderUser = await prisma.user.create({
    data: {
      email: 'founder@aurxon.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      institutionId: dps.id, // Legacy default mapping
      mustChangePassword: false,
    },
  });
  await prisma.organizationMembership.create({
    data: {
      userId: founderUser.id,
      institutionId: dps.id,
      roleId: spawnedRoles[dps.id]['SUPER_ADMIN'],
      isPrimary: true,
    },
  });

  // 5b. admin@aurxon.com
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aurxon.com',
      passwordHash,
      role: 'INSTITUTE_ADMIN',
      institutionId: dps.id,
      mustChangePassword: false,
    },
  });
  await prisma.organizationMembership.create({
    data: {
      userId: adminUser.id,
      institutionId: dps.id,
      roleId: spawnedRoles[dps.id]['INSTITUTE_ADMIN'],
      isPrimary: true,
    },
  });

  // 5c. principal@rkmvp.edu
  const principalUser = await prisma.user.create({
    data: {
      email: 'principal@rkmvp.edu',
      passwordHash,
      role: 'TEACHER',
      institutionId: rkmvp.id,
      mustChangePassword: false,
    },
  });
  await prisma.organizationMembership.create({
    data: {
      userId: principalUser.id,
      institutionId: rkmvp.id,
      roleId: spawnedRoles[rkmvp.id]['PRINCIPAL'],
      isPrimary: true,
    },
  });

  // 5d. teacher@rkmvp.edu
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@rkmvp.edu',
      passwordHash,
      role: 'TEACHER',
      institutionId: rkmvp.id,
      mustChangePassword: false,
    },
  });
  await prisma.organizationMembership.create({
    data: {
      userId: teacherUser.id,
      institutionId: rkmvp.id,
      roleId: spawnedRoles[rkmvp.id]['TEACHER'],
      isPrimary: true,
    },
  });

  // 5e. consultant@aurxon.com (Has memberships in RKMVP and KPPHS)
  const consultantUser = await prisma.user.create({
    data: {
      email: 'consultant@aurxon.com',
      passwordHash,
      role: 'TEACHER',
      institutionId: rkmvp.id,
      mustChangePassword: false,
    },
  });
  // Membership in RKMVP (Primary)
  await prisma.organizationMembership.create({
    data: {
      userId: consultantUser.id,
      institutionId: rkmvp.id,
      roleId: spawnedRoles[rkmvp.id]['CONSULTANT'],
      isPrimary: true,
    },
  });
  // Membership in KPPHS
  await prisma.organizationMembership.create({
    data: {
      userId: consultantUser.id,
      institutionId: kpphs.id,
      roleId: spawnedRoles[kpphs.id]['CONSULTANT'],
      isPrimary: false,
    },
  });

  console.log('Users & Memberships successfully seeded.');

  // 6. Subscriptions & Licensing
  for (const inst of [dps, rkmvp, kpphs]) {
    await prisma.subscription.create({
      data: {
        organizationId: inst.id,
        planCode: inst.id === dps.id ? 'ENTERPRISE' : 'PROFESSIONAL',
        status: 'ACTIVE',
        studentLimit: 1000,
        storageLimitGb: 50.0,
        endDate: new Date('2027-06-01'),
      },
    });

    await prisma.license.create({
      data: {
        organizationId: inst.id,
        licenseKey: `LIC-KEY-${inst.name.slice(0, 3).toUpperCase()}-2026`,
        licenseType: 'SUBSCRIPTION',
        status: 'ACTIVE',
        expiresAt: new Date('2027-06-01'),
      },
    });
  }

  // 7. Organizations Settings
  for (const inst of [dps, rkmvp]) {
    const setting = await prisma.organizationSetting.create({
      data: {
        organizationId: inst.id,
        groupCode: 'ACADEMIC_RULES',
      },
    });

    await prisma.configurationItem.createMany({
      data: [
        { settingId: setting.id, key: 'board_affiliation', value: 'CBSE' },
        { settingId: setting.id, key: 'grading_system', value: 'CCE_100_MARK_PERCENT' },
      ],
    });
  }

  console.log('Billing, Licensing & Configs completed.');
  console.log('Neon Multi-Tenant database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
