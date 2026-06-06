import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Industry Packs and Team Members...');

  // 1. Seed missing Modules for Hospital and Corporate Pack
  const moduleDefs = [
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

  for (const mod of moduleDefs) {
    await prisma.module.upsert({
      where: { code: mod.code },
      update: { name: mod.name },
      create: { code: mod.code, name: mod.name }
    });
  }
  console.log('Modules Upserted.');

  // 2. Seed default Features for Modules
  const featureDefs = [
    { moduleCode: 'ATTENDANCE', code: 'MANUAL_ATTENDANCE', name: 'Manual Roster' },
    { moduleCode: 'ATTENDANCE', code: 'BIOMETRIC_ATTENDANCE', name: 'Biometric Integration' },
    { moduleCode: 'ATTENDANCE', code: 'QR_ATTENDANCE', name: 'QR Code Check-in' },
    { moduleCode: 'ATTENDANCE', code: 'GPS_ATTENDANCE', name: 'GPS Geofenced Punching' },

    { moduleCode: 'EXAMINATION', code: 'ONLINE_EXAMS', name: 'Online Portal' },
    { moduleCode: 'EXAMINATION', code: 'OMR_EVALUATION', name: 'OMR Evaluation' },
    { moduleCode: 'EXAMINATION', code: 'AI_EVALUATION', name: 'AI grading' },

    { moduleCode: 'PATIENTS', code: 'PATIENT_PORTAL', name: 'Patient Self Portal' },
    { moduleCode: 'PATIENTS', code: 'EMR_SNAPSHOT', name: 'Electronic Health Records' },

    { moduleCode: 'HRMS', code: 'EMPLOYEE_DIRECTORY', name: 'Employee Directory' },
    { moduleCode: 'HRMS', code: 'LEAVE_WORKFLOW', name: 'Leave Workflow' }
  ];

  for (const feat of featureDefs) {
    const parentModule = await prisma.module.findUnique({ where: { code: feat.moduleCode } });
    if (parentModule) {
      await prisma.feature.upsert({
        where: { code: feat.code },
        update: { name: feat.name },
        create: {
          code: feat.code,
          name: feat.name,
          moduleId: parentModule.id
        }
      });
    }
  }
  console.log('Features Upserted.');

  // 3. Seed Industry Packs (3 Priority Packs)
  const schoolDashboard = {
    PRINCIPAL: {
      sections: [
        {
          title: "Saffron Academy Performance Overview",
          gridCols: 4,
          widgets: [
            { id: "kpi-students", type: "kpi", title: "Total Students", valuePath: "studentCount", icon: "Users", color: "sky" },
            { id: "kpi-staff", type: "kpi", title: "Total Faculty", valuePath: "staffCount", icon: "GraduationCap", color: "indigo" },
            { id: "kpi-attendance", type: "kpi", title: "Daily Attendance", valuePath: "attendanceRate", icon: "CalendarCheck", color: "emerald" },
            { id: "kpi-collection", type: "kpi", title: "Term Collections", valuePath: "feeOverview.collectionRate", icon: "CreditCard", color: "rose", isPercentage: true }
          ]
        },
        {
          title: "Academic Operations Dashboard",
          gridCols: 2,
          widgets: [
            { id: "chart-finance", type: "chart", chartType: "line", title: "Fee Billings vs Receipts (INR)", dataPath: "feeOverview", dataKeys: ["totalDue", "totalPaid"], color: "#0284c7" },
            { id: "list-alerts", type: "list", listType: "weak_students", title: "Students Requiring Academic Intervention", dataPath: "weakStudents" }
          ]
        }
      ]
    },
    TEACHER: {
      sections: [
        {
          title: "Teacher Workspace Desk",
          gridCols: 3,
          widgets: [
            { id: "kpi-attendance", type: "kpi", title: "Class Attendance Rate", valuePath: "attendanceRate", icon: "CalendarCheck", color: "sky" },
            { id: "kpi-lesson", type: "kpi", title: "Lesson Plans In-Progress", value: "3", icon: "BookOpen", color: "indigo" },
            { id: "kpi-classes", type: "kpi", title: "Assigned Classes", valuePath: "classCount", icon: "Users", color: "emerald" }
          ]
        },
        {
          title: "Alerts & Feeds",
          gridCols: 1,
          widgets: [
            { id: "list-notices", type: "list", listType: "notices", title: "Recent Notices & Bulletins", dataPath: "recentNotices" }
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
            { id: "kpi-beds", type: "kpi", title: "Bed Occupancy", value: "84%", icon: "ShieldAlert", color: "rose" },
            { id: "kpi-revenue", type: "kpi", title: "Daily Collection", value: "₹1,43,900", icon: "CreditCard", color: "emerald" }
          ]
        },
        {
          title: "Ward Occupancy & Operations",
          gridCols: 2,
          widgets: [
            { id: "chart-patients", type: "chart", chartType: "bar", title: "Admissions by Department", data: [{ name: "Cardiology", count: 42 }, { name: "Pediatrics", count: 28 }, { name: "General Medicine", count: 56 }, { name: "Orthopedic", count: 16 }], dataKeys: ["count"], color: "#ea580c" },
            { id: "list-alerts", type: "list", listType: "critical_alerts", title: "Critical Patient Notifications", data: [{ label: "ICU Bed #4 Alert", desc: "Pulse fluctuations monitored" }, { label: "Blood Bank O- Low", desc: "Less than 3 units remaining" }] }
          ]
        }
      ]
    },
    DOCTOR: {
      sections: [
        {
          title: "Doctor Consulting Lounge",
          gridCols: 3,
          widgets: [
            { id: "kpi-appointments", type: "kpi", title: "Today's Appointments", value: "14 Slots", icon: "CalendarCheck", color: "sky" },
            { id: "kpi-consulted", type: "kpi", title: "Patients Diagnosed", value: "6 Patients", icon: "Users", color: "emerald" },
            { id: "kpi-critical", type: "kpi", title: "Critical Patients List", value: "2 Cases", icon: "ShieldAlert", color: "rose" }
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
            { id: "kpi-roles", type: "kpi", title: "Open Positions", value: "8 Openings", icon: "Briefcase", color: "indigo" },
            { id: "kpi-checkin", type: "kpi", title: "Check-in Compliance", value: "94.2%", icon: "CalendarCheck", color: "emerald" },
            { id: "kpi-payroll", type: "kpi", title: "Active Cost Center", value: "₹18,50,000", icon: "CreditCard", color: "rose" }
          ]
        },
        {
          title: "Corporate Cost Center Analytics",
          gridCols: 2,
          widgets: [
            { id: "chart-departments", type: "chart", chartType: "pie", title: "Headcount Share by Department", data: [{ name: "Engineering", value: 34 }, { name: "Sales & Marketing", value: 22 }, { name: "Finance", value: 8 }, { name: "Operations", value: 12 }], dataKeys: ["value"], color: "#4f46e5" },
            { id: "list-tasks", type: "list", listType: "pending_approvals", title: "Pending Administrative Approvals", data: [{ label: "Q3 Marketing budget allocation", desc: "Review request by HR Head" }, { label: "Salary escalation approval", desc: "Engineering manager proposal" }] }
          ]
        }
      ]
    }
  };

  const packs = [
    {
      code: 'SCHOOL_ERP',
      name: 'Educational ERP Standard Pack',
      description: 'Default template pack for schools, colleges, and university campuses. Features students records, admissions, attendance, and exam grades.',
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
      description: 'Template pack for clinics, nursing homes, and hospitals. Handles patient records, doctor consulting schedules, pharmacy catalogs, and diagnostic reports.',
      defaultModules: ['PATIENTS', 'APPOINTMENTS', 'PHARMACY', 'LAB_MANAGEMENT', 'FINANCE'],
      defaultRoles: [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' },
        { roleCode: 'HOSPITAL_DIRECTOR', roleName: 'Hospital Director' },
        { roleCode: 'DOCTOR', roleName: 'Consulting Doctor' },
        { roleCode: 'NURSE', roleName: 'Duty Nurse' },
        { roleCode: 'RECEPTIONIST', roleName: 'Receptionist' },
        { roleCode: 'LAB_TECH', roleName: 'Laboratory Technician' },
        { roleCode: 'PHARMACIST', roleName: 'Pharmacist' },
        { roleCode: 'PATIENT', roleName: 'Patient' }
      ],
      defaultPermissions: {
        INSTITUTE_ADMIN: [
          { resource: 'patient:profile', action: 'CRUD' },
          { resource: 'appointments:records', action: 'CRUD' },
          { resource: 'pharmacy:catalog', action: 'CRUD' },
          { resource: 'lab:diagnostics', action: 'CRUD' },
          { resource: 'finance:ledger', action: 'CRUD' }
        ],
        DOCTOR: [
          { resource: 'patient:profile', action: 'READ' },
          { resource: 'appointments:records', action: 'CRUD' },
          { resource: 'lab:diagnostics', action: 'CRUD' }
        ]
      },
      defaultDashboard: hospitalDashboard,
      defaultNavigation: [
        { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Daily Use' },
        { id: 'patients', label: 'Patient Directory', icon: 'Users', section: 'Daily Use', moduleCode: 'PATIENTS' },
        { id: 'appointments', label: 'Appointments Roster', icon: 'CalendarCheck', section: 'Daily Use', moduleCode: 'APPOINTMENTS' },
        { id: 'pharmacy', label: 'Pharmacy & Drug Desk', icon: 'Book', section: 'Daily Use', moduleCode: 'PHARMACY' },
        { id: 'labs', label: 'Laboratory Diagnostics', icon: 'ShieldAlert', section: 'Daily Use', moduleCode: 'LAB_MANAGEMENT' },
        { id: 'billing', label: 'Billing & Ledger', icon: 'CreditCard', section: 'Daily Use', moduleCode: 'FINANCE' },
        { id: 'comms', label: 'Patient Messages', icon: 'MessageSquare', section: 'Communication' },
        { id: 'settings', label: 'Settings', icon: 'Settings', section: 'Administration' }
      ]
    },
    {
      code: 'CORPORATE_ERP',
      name: 'Corporate Resource Management Pack',
      description: 'ERP template pack for corporate agencies and private institutions. Includes employee directories, payroll workflows, recruitment cycles, and performance appraisals.',
      defaultModules: ['HRMS', 'PAYROLL', 'RECRUITMENT', 'PERFORMANCE', 'FINANCE'],
      defaultRoles: [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' },
        { roleCode: 'CEO', roleName: 'Chief Executive Officer' },
        { roleCode: 'HR_MANAGER', roleName: 'HR Manager' },
        { roleCode: 'MANAGER', roleName: 'Department Manager' },
        { roleCode: 'EMPLOYEE', roleName: 'Employee' },
        { roleCode: 'FINANCE_OFFICER', roleName: 'Finance Officer' }
      ],
      defaultPermissions: {
        INSTITUTE_ADMIN: [
          { resource: 'employee:records', action: 'CRUD' },
          { resource: 'payroll:compensation', action: 'CRUD' },
          { resource: 'recruitment:hiring', action: 'CRUD' },
          { resource: 'finance:ledger', action: 'CRUD' }
        ],
        CEO: [
          { resource: 'employee:records', action: 'READ' },
          { resource: 'finance:ledger', action: 'READ' }
        ]
      },
      defaultDashboard: corporateDashboard,
      defaultNavigation: [
        { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Daily Use' },
        { id: 'employees', label: 'Employee Directory', icon: 'Users', section: 'Daily Use', moduleCode: 'HRMS' },
        { id: 'payroll', label: 'Payroll & Salaries', icon: 'CreditCard', section: 'Daily Use', moduleCode: 'PAYROLL' },
        { id: 'hiring', label: 'Recruitment Desk', icon: 'Briefcase', section: 'Daily Use', moduleCode: 'RECRUITMENT' },
        { id: 'appraisals', label: 'Performance Appraisals', icon: 'Award', section: 'Daily Use', moduleCode: 'PERFORMANCE' },
        { id: 'comms', label: 'Corporate Chat', icon: 'MessageSquare', section: 'Communication' },
        { id: 'settings', label: 'Settings', icon: 'Settings', section: 'Administration' }
      ]
    }
  ];

  for (const pack of packs) {
    await prisma.industryPack.upsert({
      where: { code: pack.code },
      update: {
        name: pack.name,
        description: pack.description,
        defaultModules: pack.defaultModules,
        defaultRoles: pack.defaultRoles,
        defaultPermissions: pack.defaultPermissions,
        defaultDashboard: pack.defaultDashboard,
        defaultNavigation: pack.defaultNavigation
      },
      create: {
        code: pack.code,
        name: pack.name,
        description: pack.description,
        defaultModules: pack.defaultModules,
        defaultRoles: pack.defaultRoles,
        defaultPermissions: pack.defaultPermissions,
        defaultDashboard: pack.defaultDashboard,
        defaultNavigation: pack.defaultNavigation
      }
    });
  }
  console.log('Industry Packs Seeded.');

  // 4. Update Existing Institutions to link to SCHOOL_ERP by default
  await prisma.institution.updateMany({
    where: { industryPackCode: null },
    data: { industryPackCode: 'SCHOOL_ERP' }
  });
  console.log('Existing Institutions linked to SCHOOL_ERP pack.');

  // 5. Seed internal team members for Teams Portal
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // Find standard super admin user or build default
  const defaultInst = await prisma.institution.findFirst();
  if (!defaultInst) {
    console.log('No default institution found, seeding aborted for team members.');
    return;
  }

  const teamEmails = [
    { email: 'founder@aurxon.com', role: 'FOUNDER' },
    { email: 'product@aurxon.com', role: 'PRODUCT_MANAGER' },
    { email: 'support@aurxon.com', role: 'SUPPORT_MANAGER' },
    { email: 'sales@aurxon.com', role: 'SALES_MANAGER' },
    { email: 'cs@aurxon.com', role: 'CUSTOMER_SUCCESS_MANAGER' },
    { email: 'finance@aurxon.com', role: 'FINANCE_MANAGER' },
    { email: 'techadmin@aurxon.com', role: 'TECHNICAL_ADMINISTRATOR' }
  ];

  for (const t of teamEmails) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: { role: 'SUPER_ADMIN', isActive: true },
      create: {
        email: t.email,
        passwordHash,
        role: 'SUPER_ADMIN',
        institutionId: defaultInst.id,
        mustChangePassword: false
      }
    });

    await prisma.aurxonTeamMember.upsert({
      where: { userId: user.id },
      update: { role: t.role },
      create: {
        userId: user.id,
        role: t.role
      }
    });
  }
  console.log('Aurxon Internal Team Members Seeded.');
  console.log('All seeds finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
