import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SaaS control plane and demo organizations...');

  // 1. Clean existing records in cascade order
  await prisma.permission.deleteMany({});
  await prisma.organizationMembership.deleteMany({});
  await prisma.impersonationSession.deleteMany({});
  await prisma.activationToken.deleteMany({});
  await prisma.licenseEvent.deleteMany({});
  await prisma.securityThreatLog.deleteMany({});
  await prisma.backupRecord.deleteMany({});
  await prisma.activationKey.deleteMany({});
  await prisma.renewalKey.deleteMany({});
  await prisma.renewalRequest.deleteMany({});
  await prisma.organizationRegistration.deleteMany({});
  await prisma.todoTask.deleteMany({});
  await prisma.diaryEntry.deleteMany({});
  await prisma.plannerActivity.deleteMany({});
  await prisma.assignedTask.deleteMany({});
  await prisma.studentStatusHistory.deleteMany({});
  await prisma.aurxonTeamMember.deleteMany({});
  await prisma.securityEventLog.deleteMany({});

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
  await prisma.organizationSetupStatus.deleteMany({});
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
  await prisma.tenant.deleteMany({});
  await prisma.industryPack.deleteMany({});
  await prisma.planDefinition.deleteMany({});
  await prisma.aurxonTeamMember.deleteMany({});

  console.log('Cleaned database tables.');

  // 2. Seed Modules and Features
  const modules = [
    { code: 'STUDENT_MANAGEMENT', name: 'Student Management' },
    { code: 'ATTENDANCE', name: 'Attendance Management' },
    { code: 'EXAMINATION', name: 'Examinations' },
    { code: 'FINANCE', name: 'Finance & Accounts' },
    { code: 'PATIENTS', name: 'Patient Records & Admissions' },
    { code: 'APPOINTMENTS', name: 'Appointments & Scheduling' },
    { code: 'PHARMACY', name: 'Pharmacy & Drug Catalog' },
    { code: 'LAB_MANAGEMENT', name: 'Laboratory Diagnostics' },
    { code: 'HRMS', name: 'HRMS & Employee Records' },
    { code: 'PAYROLL', name: 'Payroll & Compensation' },
    { code: 'RECRUITMENT', name: 'Recruitment & Hiring' },
    { code: 'PERFORMANCE', name: 'Performance & Appraisals' }
  ];

  for (const mod of modules) {
    await prisma.module.create({ data: mod });
  }

  const attendanceMod = await prisma.module.findUnique({ where: { code: 'ATTENDANCE' } });
  const examsMod = await prisma.module.findUnique({ where: { code: 'EXAMINATION' } });
  const patientsMod = await prisma.module.findUnique({ where: { code: 'PATIENTS' } });
  const hrmsMod = await prisma.module.findUnique({ where: { code: 'HRMS' } });

  await prisma.feature.create({ data: { moduleId: attendanceMod!.id, code: 'BIOMETRIC_ATTENDANCE', name: 'Biometric Attendance' } });
  await prisma.feature.create({ data: { moduleId: examsMod!.id, code: 'EXAM_FORMULA_CALCULATOR', name: 'Configurable Exam Formulas' } });
  await prisma.feature.create({ data: { moduleId: patientsMod!.id, code: 'EMR_SNAPSHOT', name: 'Electronic Health Records' } });
  await prisma.feature.create({ data: { moduleId: hrmsMod!.id, code: 'LEAVE_WORKFLOW', name: 'Leave Workflow' } });

  console.log('Modules & Features seeded.');

  // 3. Seed Industry Packs
  const schoolDashboard = {
    PRINCIPAL: {
      sections: [
        {
          title: "School Performance Overview",
          gridCols: 4,
          widgets: [
            { id: "kpi-students", type: "kpi", title: "Total Students", valuePath: "studentCount", icon: "Users", color: "sky" },
            { id: "kpi-staff", type: "kpi", title: "Total Faculty", valuePath: "staffCount", icon: "GraduationCap", color: "indigo" },
            { id: "kpi-attendance", type: "kpi", title: "Daily Attendance", valuePath: "attendanceRate", icon: "CalendarCheck", color: "emerald" },
            { id: "kpi-collection", type: "kpi", title: "Term Collections", valuePath: "feeOverview.collectionRate", icon: "CreditCard", color: "rose", isPercentage: true }
          ]
        }
      ]
    }
  };

  const hospitalDashboard = {
    HOSPITAL_DIRECTOR: {
      sections: [
        {
          title: "Hospital Operational Overview",
          gridCols: 4,
          widgets: [
            { id: "kpi-patients", type: "kpi", title: "In-Patients Count", value: "142", icon: "Users", color: "sky" },
            { id: "kpi-doctors", type: "kpi", title: "On-Duty Doctors", value: "19", icon: "Briefcase", color: "indigo" },
            { id: "kpi-beds", type: "kpi", title: "Bed Occupancy", value: "84%", icon: "ShieldAlert", color: "rose" }
          ]
        }
      ]
    }
  };

  const corporateDashboard = {
    CEO: {
      sections: [
        {
          title: "Enterprise Ecosystem Dashboard",
          gridCols: 4,
          widgets: [
            { id: "kpi-employees", type: "kpi", title: "Headcount", value: "76 Employees", icon: "Users", color: "sky" },
            { id: "kpi-payroll", type: "kpi", title: "Active Cost Center", value: "₹18,50,000", icon: "CreditCard", color: "rose" }
          ]
        }
      ]
    }
  };

  const packs = [
    {
      code: 'SCHOOL_ERP',
      name: 'Educational ERP Standard Pack',
      description: 'Default template pack for schools, colleges, and university campuses.',
      defaultModules: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
      defaultRoles: [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' },
        { roleCode: 'PRINCIPAL', roleName: 'Principal' },
        { roleCode: 'TEACHER', roleName: 'Teacher' },
        { roleCode: 'STAFF', roleName: 'Staff' },
        { roleCode: 'ACCOUNTANT', roleName: 'Accountant' },
        { roleCode: 'STUDENT', roleName: 'Student' },
        { roleCode: 'PARENT', roleName: 'Parent / Guardian' }
      ],
      defaultPermissions: {
        INSTITUTE_ADMIN: [
          { resource: 'student:profile', action: 'CRUD' },
          { resource: 'finance:ledger', action: 'CRUD' },
          { resource: 'exams:setup', action: 'CRUD' },
          { resource: 'attendance:records', action: 'CRUD' },
          { resource: 'organization:settings', action: 'CRUD' }
        ],
        PRINCIPAL: [
          { resource: 'student:profile', action: 'CRUD' },
          { resource: 'exams:setup', action: 'CRUD' },
          { resource: 'attendance:records', action: 'CRUD' },
          { resource: 'finance:ledger', action: 'READ' }
        ],
        TEACHER: [
          { resource: 'student:profile', action: 'READ' },
          { resource: 'attendance:records', action: 'CRUD' },
          { resource: 'exams:setup', action: 'CRUD' }
        ]
      },
      defaultDashboard: schoolDashboard,
      defaultNavigation: [
        { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Daily Use' },
        { id: 'academic', label: 'Academic Desk', icon: 'BookOpen', section: 'Daily Use', moduleCode: 'STUDENT_MANAGEMENT' },
        { id: 'students', label: 'Student Desk', icon: 'Users', section: 'Daily Use', moduleCode: 'STUDENT_MANAGEMENT' },
        { id: 'exams', label: 'Exams & Grades', icon: 'Award', section: 'Daily Use', moduleCode: 'EXAMINATION' },
        { id: 'attendance', label: 'Attendance', icon: 'CalendarCheck', section: 'Daily Use', moduleCode: 'ATTENDANCE' },
        { id: 'fees', label: 'Fees & Finance', icon: 'CreditCard', section: 'Daily Use', moduleCode: 'FINANCE' },
        { id: 'comms', label: 'Comms Hub', icon: 'MessageSquare', section: 'Communication' },
        { id: 'settings', label: 'Settings', icon: 'Settings', section: 'Administration' }
      ]
    },
    {
      code: 'HOSPITAL_ERP',
      name: 'Clinical Health ERP Pack',
      description: 'Template pack for clinics and hospitals.',
      defaultModules: ['PATIENTS', 'APPOINTMENTS', 'PHARMACY', 'LAB_MANAGEMENT', 'FINANCE'],
      defaultRoles: [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' },
        { roleCode: 'HOSPITAL_DIRECTOR', roleName: 'Hospital Director' },
        { roleCode: 'DOCTOR', roleName: 'Consulting Doctor' },
        { roleCode: 'NURSE', roleName: 'Duty Nurse' },
        { roleCode: 'PHARMACIST', roleName: 'Pharmacist' },
        { roleCode: 'PATIENT', roleName: 'Patient' }
      ],
      defaultPermissions: {
        INSTITUTE_ADMIN: [
          { resource: 'patient:profile', action: 'CRUD' },
          { resource: 'appointments:records', action: 'CRUD' },
          { resource: 'finance:ledger', action: 'CRUD' }
        ]
      },
      defaultDashboard: hospitalDashboard,
      defaultNavigation: [
        { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Daily Use' },
        { id: 'patients', label: 'Patient Directory', icon: 'Users', section: 'Daily Use', moduleCode: 'PATIENTS' },
        { id: 'appointments', label: 'Appointments', icon: 'CalendarCheck', section: 'Daily Use', moduleCode: 'APPOINTMENTS' },
        { id: 'billing', label: 'Billing & Ledger', icon: 'CreditCard', section: 'Daily Use', moduleCode: 'FINANCE' },
        { id: 'settings', label: 'Settings', icon: 'Settings', section: 'Administration' }
      ]
    },
    {
      code: 'CORPORATE_ERP',
      name: 'Corporate Resource Management Pack',
      description: 'ERP template pack for corporate agencies.',
      defaultModules: ['HRMS', 'PAYROLL', 'RECRUITMENT', 'PERFORMANCE', 'FINANCE'],
      defaultRoles: [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' },
        { roleCode: 'CEO', roleName: 'Chief Executive Officer' },
        { roleCode: 'HR_MANAGER', roleName: 'HR Manager' },
        { roleCode: 'EMPLOYEE', roleName: 'Employee' }
      ],
      defaultPermissions: {
        INSTITUTE_ADMIN: [
          { resource: 'employee:records', action: 'CRUD' },
          { resource: 'payroll:compensation', action: 'CRUD' }
        ]
      },
      defaultDashboard: corporateDashboard,
      defaultNavigation: [
        { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Daily Use' },
        { id: 'employees', label: 'Employee Directory', icon: 'Users', section: 'Daily Use', moduleCode: 'HRMS' },
        { id: 'payroll', label: 'Payroll & Salaries', icon: 'CreditCard', section: 'Daily Use', moduleCode: 'PAYROLL' },
        { id: 'settings', label: 'Settings', icon: 'Settings', section: 'Administration' }
      ]
    }
  ];

  for (const pack of packs) {
    await prisma.industryPack.create({ data: pack });
  }
  console.log('Industry Packs seeded.');

  // 4. Seed default plan definitions
  await prisma.planDefinition.create({
    data: {
      code: 'TRIAL',
      name: 'Trial Subscription',
      monthlyPrice: 0,
      studentLimit: 500,
      storageLimitGb: 10,
      moduleAccess: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
    }
  });
  await prisma.planDefinition.create({
    data: {
      code: 'PROFESSIONAL',
      name: 'Professional Subscription',
      monthlyPrice: 15000,
      studentLimit: 2000,
      storageLimitGb: 50,
      moduleAccess: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
    }
  });
  await prisma.planDefinition.create({
    data: {
      code: 'ENTERPRISE',
      name: 'Enterprise Contract',
      monthlyPrice: 50000,
      studentLimit: 10000,
      storageLimitGb: 500,
      moduleAccess: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
    }
  });

  console.log('Plans seeded.');

  // 5. Seed Core Founder & Team Accounts (separate from client organizations)
  // We need to map a dummy organization specifically for Aurxon Team logins to comply with the 1-to-1 User-Institution schema
  const aurxonCorp = await prisma.institution.create({
    data: {
      name: 'Aurxon Corp Operations',
      logoUrl: '',
      primaryColor: '#6366f1',
      status: 'ACTIVE',
      orgType: 'CORPORATE'
    }
  });

  const founderHash = await bcrypt.hash('AurxonFuture$136', 10);
  const founderUser = await prisma.user.create({
    data: {
      email: 'founder@aurxon.com',
      passwordHash: founderHash,
      role: 'SUPER_ADMIN',
      institutionId: aurxonCorp.id,
      mustChangePassword: false,
    }
  });

  await prisma.aurxonTeamMember.create({
    data: {
      userId: founderUser.id,
      role: 'FOUNDER'
    }
  });

  const teamMembers = [
    { email: 'ceo@aurxon.com', password: 'CEO@Aurxon2026', role: 'CEO' },
    { email: 'coo@aurxon.com', password: 'COO@Aurxon2026', role: 'COO' },
    { email: 'finance@aurxon.com', password: 'Finance@Aurxon2026', role: 'FINANCE_MANAGER' },
    { email: 'support@aurxon.com', password: 'Support@Aurxon2026', role: 'SUPPORT_MANAGER' },
    { email: 'sales@aurxon.com', password: 'Sales@Aurxon2026', role: 'SALES_MANAGER' },
    { email: 'techadmin@aurxon.com', password: 'TechAdmin@Aurxon2026', role: 'TECHNICAL_ADMINISTRATOR' },
    { email: 'product@aurxon.com', password: 'Product@Aurxon2026', role: 'PRODUCT_MANAGER' },
  ];

  for (const t of teamMembers) {
    const tHash = await bcrypt.hash(t.password, 10);
    const u = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash: tHash,
        role: 'SUPER_ADMIN',
        institutionId: aurxonCorp.id,
        mustChangePassword: false,
      }
    });
    await prisma.aurxonTeamMember.create({
      data: {
        userId: u.id,
        role: t.role
      }
    });
  }

  console.log('Aurxon Operations Team seeded.');

  // 6. Seed the 4 Demo Organizations + 2 Validation Organizations
  const demoOrgs = [
    {
      name: 'Green Valley International School',
      email: 'admin@gvis.edu',
      password: 'GVIS@2026',
      subdomain: 'greenvalley.aurxon.com',
      ownerName: 'Rajesh Sharma',
      principalName: 'Anita Verma',
      phone: '+91 9876543210',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      board: 'CBSE',
      primaryColor: '#0284c7'
    },
    {
      name: 'Bright Future Academy',
      email: 'admin@bfa.edu',
      password: 'BFA@2026',
      subdomain: 'brightfuture.aurxon.com',
      ownerName: 'Sanjay Gupta',
      principalName: 'Priya Singh',
      phone: '+91 9988776655',
      city: 'Delhi',
      state: 'Delhi',
      board: 'CBSE',
      primaryColor: '#0284c7'
    },
    {
      name: 'Delhi Heights Public School',
      email: 'admin@dhps.edu',
      password: 'DHPS@2026',
      subdomain: 'delhiheights.aurxon.com',
      ownerName: 'Vivek Kapoor',
      principalName: 'Neha Arora',
      phone: '+91 8877665544',
      city: 'Delhi',
      state: 'Delhi',
      board: 'CBSE',
      primaryColor: '#0284c7'
    },
    {
      name: 'Scholars World School',
      email: 'admin@sws.edu',
      password: 'SWS@2026',
      subdomain: 'scholarsworld.aurxon.com',
      ownerName: 'Ashok Jain',
      principalName: 'Ritika Sharma',
      phone: '+91 7766554433',
      city: 'Jaipur',
      state: 'Rajasthan',
      board: 'CBSE',
      primaryColor: '#0284c7'
    },
    {
      name: 'Ramakrishna Mission Vidyapith',
      email: 'admin@rkmvp.edu',
      password: 'Password@2026',
      subdomain: 'rkmvp.aurxon.com',
      ownerName: 'Swami Vivekananda',
      principalName: 'Swami Shivananda',
      phone: '+91 9444455555',
      city: 'Belur',
      state: 'West Bengal',
      board: 'CBSE',
      primaryColor: '#ea580c'
    },
    {
      name: 'Kalyani Public School',
      email: 'admin@kpphs.edu',
      password: 'Password@2026',
      subdomain: 'kpphs.aurxon.com',
      ownerName: 'Dr. Sen',
      principalName: 'Mrs. Sen',
      phone: '+91 9333344444',
      city: 'Kalyani',
      state: 'West Bengal',
      board: 'CBSE',
      primaryColor: '#0284c7'
    }
  ];

  for (const org of demoOrgs) {
    console.log(`Seeding ${org.name}...`);
    // 6a. Create Tenant
    const baseSlug = org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tenant = await prisma.tenant.create({
      data: {
        name: org.name,
        slug: baseSlug,
        status: 'ACTIVE',
        plan: 'PROFESSIONAL'
      }
    });

    // 6b. Create Institution
    const inst = await prisma.institution.create({
      data: {
        name: org.name,
        tenantId: tenant.id,
        orgType: 'SCHOOL',
        status: 'ACTIVE',
        primaryColor: org.primaryColor || '#0284c7',
        industryPackCode: 'SCHOOL_ERP'
      }
    });

    // Create TenantDomain Subdomain mapping
    await prisma.tenantDomain.create({
      data: {
        domain: org.subdomain,
        organizationId: inst.id,
        isPrimary: true,
        sslStatus: 'ACTIVE'
      }
    });

    // Create Branding
    await prisma.organizationBranding.create({
      data: {
        organizationId: inst.id,
        primaryColor: org.primaryColor || '#0284c7',
        secondaryColor: '#0f172a'
      }
    });

    // Create roles for this institution
    const defaultSchoolRoles = [
      { code: 'SUPER_ADMIN', name: 'Super Admin' },
      { code: 'INSTITUTE_ADMIN', name: 'Institute Admin' },
      { code: 'PRINCIPAL', name: 'Principal' },
      { code: 'TEACHER', name: 'Teacher' },
      { code: 'STAFF', name: 'Staff' },
      { code: 'ACCOUNTANT', name: 'Accountant' },
      { code: 'STUDENT', name: 'Student' },
      { code: 'PARENT', name: 'Parent / Guardian' }
    ];

    const rolesMap: Record<string, string> = {};
    for (const rDef of defaultSchoolRoles) {
      const createdRole = await prisma.role.create({
        data: {
          name: rDef.name,
          code: rDef.code,
          isSystem: true,
          institutionId: inst.id
        }
      });
      rolesMap[rDef.code] = createdRole.id;
    }

    // Enable Modules
    const schoolModules = ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'];
    await prisma.organizationModule.createMany({
      data: schoolModules.map(m => ({
        organizationId: inst.id,
        moduleCode: m,
        isEnabled: true
      }))
    });

    // Enable Features
    await prisma.organizationFeature.createMany({
      data: [
        { organizationId: inst.id, featureCode: 'BIOMETRIC_ATTENDANCE', isEnabled: true },
        { organizationId: inst.id, featureCode: 'EXAM_FORMULA_CALCULATOR', isEnabled: true }
      ]
    });

    // Subscriptions and Licensing
    await prisma.subscription.create({
      data: {
        organizationId: inst.id,
        planCode: 'PROFESSIONAL',
        status: 'ACTIVE',
        studentLimit: 2000,
        storageLimitGb: 50.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    const licenseKey = `LIC-PROD-${baseSlug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.license.create({
      data: {
        organizationId: inst.id,
        licenseKey,
        licenseType: 'SUBSCRIPTION',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    // Default Settings
    await prisma.settings.create({
      data: {
        institutionId: inst.id,
        academicYear: '2026-2027',
        gradingSystem: 'CBSE',
        timezone: 'Asia/Kolkata',
        currency: 'INR'
      }
    });

    const settingGroup = await prisma.organizationSetting.create({
      data: {
        organizationId: inst.id,
        groupCode: 'ACADEMIC_RULES'
      }
    });

    await prisma.configurationItem.createMany({
      data: [
        { settingId: settingGroup.id, key: 'board_affiliation', value: org.board },
        { settingId: settingGroup.id, key: 'grading_system', value: 'CBSE' }
      ]
    });

    // Default branch
    await prisma.branch.create({
      data: {
        institutionId: inst.id,
        name: `${org.name} Main Campus`,
        code: `${org.name.slice(0, 3).toUpperCase()}-MAIN`,
        phone: org.phone,
        city: org.city,
        state: org.state,
        pinCode: '462001'
      }
    });

    // Organization setup status as COMPLETED
    await prisma.organizationSetupStatus.create({
      data: {
        institutionId: inst.id,
        setupStarted: true,
        setupCompleted: true,
        setupCompletedAt: new Date(),
        currentStep: 3
      }
    });

    // 6c. Generate all 10 persona users for this organization
    const personas = [
      { roleCode: 'INSTITUTE_ADMIN', name: org.ownerName, email: org.email, password: org.password },
      { roleCode: 'PRINCIPAL', name: org.principalName, email: `principal@${org.email.split('@')[1]}`, password: 'Password@2026' },
      { roleCode: 'TEACHER', name: 'Alok Sen', email: `teacher@${org.email.split('@')[1]}`, password: 'Password@2026' },
      { roleCode: 'STUDENT', name: 'Rahul Sharma', email: `student@${org.email.split('@')[1]}`, password: 'Password@2026' },
      { roleCode: 'PARENT', name: 'Karan Sharma', email: `parent@${org.email.split('@')[1]}`, password: 'Password@2026' },
      { roleCode: 'ACCOUNTANT', name: 'Vikas Kumar', email: `accountant@${org.email.split('@')[1]}`, password: 'Password@2026' },
      // The remaining 5 personas (mapped to STAFF role in membership but tracking different designations in profiles)
      { roleCode: 'STAFF', name: 'Sunita Roy', email: `reception@${org.email.split('@')[1]}`, password: 'Password@2026', designation: 'RECEPTIONIST' },
      { roleCode: 'STAFF', name: 'Amit Verma', email: `hr@${org.email.split('@')[1]}`, password: 'Password@2026', designation: 'HR' },
      { roleCode: 'STAFF', name: 'Rohit Joshi', email: `library@${org.email.split('@')[1]}`, password: 'Password@2026', designation: 'LIBRARY' },
      { roleCode: 'STAFF', name: 'Manoj Singh', email: `transport@${org.email.split('@')[1]}`, password: 'Password@2026', designation: 'TRANSPORT' },
      { roleCode: 'STAFF', name: 'Sanjay Rawat', email: `admission@${org.email.split('@')[1]}`, password: 'Password@2026', designation: 'ADMISSION_OFFICER' }
    ];

    // Create a default Class for student mappings
    const defaultClass = await prisma.class.create({
      data: {
        institutionId: inst.id,
        name: 'Class 10-A',
        section: 'A',
        stream: 'General',
        board: org.board
      }
    });

    let createdStudentId = '';
    let createdParentId = '';

    for (const p of personas) {
      const pHash = await bcrypt.hash(p.password, 10);
      const user = await prisma.user.create({
        data: {
          email: p.email,
          passwordHash: pHash,
          role: p.roleCode === 'INSTITUTE_ADMIN' ? 'INSTITUTE_ADMIN' : 'TEACHER', // Base routing role
          institutionId: inst.id,
          mustChangePassword: false
        }
      });

      await prisma.organizationMembership.create({
        data: {
          userId: user.id,
          institutionId: inst.id,
          roleId: rolesMap[p.roleCode],
          isPrimary: true,
          status: 'ACTIVE'
        }
      });

      // Profiles
      if (p.roleCode === 'PRINCIPAL' || p.roleCode === 'TEACHER' || p.roleCode === 'ACCOUNTANT' || p.roleCode === 'STAFF') {
        const designation = p.designation || p.roleCode;
        await prisma.staff.create({
          data: {
            userId: user.id,
            employeeId: `EMP-${inst.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            firstName: p.name.split(' ')[0],
            lastName: p.name.split(' ')[1] || '',
            phone: org.phone,
            designation,
            joiningDate: new Date(),
            salary: 45000,
            institutionId: inst.id
          }
        });
      } else if (p.roleCode === 'STUDENT') {
        const student = await prisma.student.create({
          data: {
            userId: user.id,
            scholarNumber: `SCH-${inst.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            rollNumber: '1',
            firstName: p.name.split(' ')[0],
            lastName: p.name.split(' ')[1] || '',
            dateOfBirth: new Date('2011-04-12'),
            gender: 'MALE',
            classId: defaultClass.id,
            institutionId: inst.id
          }
        });
        createdStudentId = student.id;
      } else if (p.roleCode === 'PARENT') {
        const parent = await prisma.parent.create({
          data: {
            userId: user.id,
            firstName: p.name.split(' ')[0],
            lastName: p.name.split(' ')[1] || '',
            phone: org.phone
          }
        });
        createdParentId = parent.id;
      }
    }

    // Link parent and student if both created
    if (createdStudentId && createdParentId) {
      await prisma.student.update({
        where: { id: createdStudentId },
        data: { parentId: createdParentId }
      });
    }

    // Link founder to this organization as SUPER_ADMIN
    await prisma.organizationMembership.create({
      data: {
        userId: founderUser.id,
        institutionId: inst.id,
        roleId: rolesMap['SUPER_ADMIN'],
        status: 'ACTIVE',
        isPrimary: false,
      }
    });
  }

  // Seed Consultant user and memberships for KPPHS & RKMVP (Scenario 10, 15)
  console.log('Seeding consultant user...');
  const consultantHash = await bcrypt.hash('password123', 10);
  const consultantUser = await prisma.user.create({
    data: {
      email: 'consultant@aurxon.com',
      passwordHash: consultantHash,
      role: 'TEACHER', // Base routing role
      institutionId: aurxonCorp.id,
      mustChangePassword: false,
    }
  });

  const rkmvpInst = await prisma.institution.findFirst({
    where: { name: { contains: 'Ramakrishna' } }
  });
  if (rkmvpInst) {
    const rkmvpRole = await prisma.role.findFirst({
      where: { institutionId: rkmvpInst.id, code: 'TEACHER' }
    });
    if (rkmvpRole) {
      await prisma.organizationMembership.create({
        data: {
          userId: consultantUser.id,
          institutionId: rkmvpInst.id,
          roleId: rkmvpRole.id,
          status: 'ACTIVE',
          isPrimary: true,
        }
      });
    }
  }

  const kpphsInst = await prisma.institution.findFirst({
    where: { name: { contains: 'Kalyani' } }
  });
  if (kpphsInst) {
    const kpphsRole = await prisma.role.findFirst({
      where: { institutionId: kpphsInst.id, code: 'TEACHER' }
    });
    if (kpphsRole) {
      await prisma.organizationMembership.create({
        data: {
          userId: consultantUser.id,
          institutionId: kpphsInst.id,
          roleId: kpphsRole.id,
          status: 'ACTIVE',
          isPrimary: false,
        }
      });
    }
  }

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
