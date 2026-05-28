import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records (optional, but good for idempotent runs)
  await prisma.auditLog.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.examResult.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.studentFeeAllocation.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institution.deleteMany({});

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'Aurxon International Academy',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#6366f1', // Beautiful Indigo
    },
  });
  console.log(`Created institution: ${institution.name}`);

  // 3. Create Users & Profiles
  // 3a. Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@aurxon.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      institutionId: institution.id,
    },
  });

  // 3b. Institute Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aurxon.com',
      passwordHash,
      role: 'INSTITUTE_ADMIN',
      institutionId: institution.id,
    },
  });

  // 3c. Teachers (Staff)
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'teacher1@aurxon.com',
      passwordHash,
      role: 'TEACHER',
      institutionId: institution.id,
    },
  });

  const teacherStaff1 = await prisma.staff.create({
    data: {
      userId: teacherUser1.id,
      employeeId: 'EMP001',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '+1 555-0101',
      designation: 'TEACHER',
      joiningDate: new Date('2024-08-15'),
      salary: 4500,
      institutionId: institution.id,
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'teacher2@aurxon.com',
      passwordHash,
      role: 'TEACHER',
      institutionId: institution.id,
    },
  });

  const teacherStaff2 = await prisma.staff.create({
    data: {
      userId: teacherUser2.id,
      employeeId: 'EMP002',
      firstName: 'John',
      lastName: 'Keating',
      phone: '+1 555-0102',
      designation: 'TEACHER',
      joiningDate: new Date('2025-01-10'),
      salary: 4800,
      institutionId: institution.id,
    },
  });

  // 3d. Accountant (Staff)
  const accountantUser = await prisma.user.create({
    data: {
      email: 'accountant@aurxon.com',
      passwordHash,
      role: 'ACCOUNTANT',
      institutionId: institution.id,
    },
  });

  const accountantStaff = await prisma.staff.create({
    data: {
      userId: accountantUser.id,
      employeeId: 'EMP003',
      firstName: 'Robert',
      lastName: 'Kiyosaki',
      phone: '+1 555-0103',
      designation: 'ACCOUNTANT',
      joiningDate: new Date('2024-09-01'),
      salary: 4000,
      institutionId: institution.id,
    },
  });

  // 4. Create Classes
  const class10A = await prisma.class.create({
    data: {
      name: 'Grade 10-A',
      section: 'A',
      classTeacherId: teacherStaff1.id,
      institutionId: institution.id,
    },
  });

  const class11A = await prisma.class.create({
    data: {
      name: 'Grade 11-A',
      section: 'A',
      classTeacherId: teacherStaff2.id,
      institutionId: institution.id,
    },
  });

  // 5. Create Subjects
  const math = await prisma.subject.create({
    data: {
      name: 'Advanced Mathematics',
      code: 'MATH101',
      classId: class10A.id,
      teacherId: teacherStaff1.id,
    },
  });

  const physics = await prisma.subject.create({
    data: {
      name: 'Introductory Physics',
      code: 'PHYS101',
      classId: class10A.id,
      teacherId: teacherStaff2.id,
    },
  });

  const literature = await prisma.subject.create({
    data: {
      name: 'English Literature',
      code: 'LIT201',
      classId: class11A.id,
      teacherId: teacherStaff2.id,
    },
  });

  // 6. Create Parents and Students
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@aurxon.com',
      passwordHash,
      role: 'PARENT',
      institutionId: institution.id,
    },
  });

  const parentProfile = await prisma.parent.create({
    data: {
      userId: parentUser.id,
      firstName: 'David',
      lastName: 'Miller',
      phone: '+1 555-0201',
      occupation: 'Software Architect',
      address: '742 Evergreen Terrace, Springfield',
    },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@aurxon.com',
      passwordHash,
      role: 'STUDENT',
      institutionId: institution.id,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      rollNumber: 'ROLL-10A-01',
      firstName: 'Alice',
      lastName: 'Miller',
      dateOfBirth: new Date('2010-05-14'),
      gender: 'FEMALE',
      parentId: parentProfile.id,
      classId: class10A.id,
      institutionId: institution.id,
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student2@aurxon.com',
      passwordHash,
      role: 'STUDENT',
      institutionId: institution.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      rollNumber: 'ROLL-10A-02',
      firstName: 'Bob',
      lastName: 'Johnson',
      dateOfBirth: new Date('2010-11-22'),
      gender: 'MALE',
      classId: class10A.id,
      institutionId: institution.id,
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'student3@aurxon.com',
      passwordHash,
      role: 'STUDENT',
      institutionId: institution.id,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      rollNumber: 'ROLL-11A-01',
      firstName: 'Charlie',
      lastName: 'Brown',
      dateOfBirth: new Date('2009-02-28'),
      gender: 'MALE',
      classId: class11A.id,
      institutionId: institution.id,
    },
  });

  // 7. Seed Student Timeline Event
  await prisma.timelineEvent.create({
    data: {
      studentId: student1.id,
      type: 'ADMISSION',
      description: 'Admitted to Grade 10-A with parents linked successfully.',
    },
  });

  // 8. Seed Attendance Records (past 3 days for students 1 and 2)
  const attendanceDates = [
    new Date('2026-05-25'),
    new Date('2026-05-26'),
    new Date('2026-05-27'),
  ];

  for (const date of attendanceDates) {
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        date,
        status: 'PRESENT',
        remarks: 'On time',
        recordedById: teacherStaff1.id,
      },
    });

    await prisma.attendance.create({
      data: {
        studentId: student2.id,
        date,
        status: date.getDate() === 26 ? 'ABSENT' : 'PRESENT',
        remarks: date.getDate() === 26 ? 'Sick leave' : 'On time',
        recordedById: teacherStaff1.id,
      },
    });
  }

  // 9. Seed Fee Structures & Allocations
  const tuitionFee = await prisma.feeStructure.create({
    data: {
      name: 'Term 1 Tuition Fee',
      amount: 1500,
      dueDate: new Date('2026-06-15'),
      description: 'Standard tuition fee for Term 1 academics',
      institutionId: institution.id,
    },
  });

  const examFee = await prisma.feeStructure.create({
    data: {
      name: 'Final Term Exam Fee',
      amount: 250,
      dueDate: new Date('2026-06-30'),
      description: 'Examination evaluation and operations cost',
      institutionId: institution.id,
    },
  });

  // Allocations
  const alloc1 = await prisma.studentFeeAllocation.create({
    data: {
      studentId: student1.id,
      feeStructureId: tuitionFee.id,
      amountDue: 1500,
      amountPaid: 1500,
      status: 'PAID',
    },
  });

  const alloc2 = await prisma.studentFeeAllocation.create({
    data: {
      studentId: student2.id,
      feeStructureId: tuitionFee.id,
      amountDue: 1500,
      amountPaid: 500,
      status: 'PARTIAL',
    },
  });

  const alloc3 = await prisma.studentFeeAllocation.create({
    data: {
      studentId: student3.id,
      feeStructureId: tuitionFee.id,
      amountDue: 1500,
      amountPaid: 0,
      status: 'UNPAID',
    },
  });

  // Seeding Exam Fee Allocations (Unpaid for all)
  await prisma.studentFeeAllocation.create({
    data: {
      studentId: student1.id,
      feeStructureId: examFee.id,
      amountDue: 250,
      amountPaid: 0,
      status: 'UNPAID',
    },
  });

  // Payments History
  await prisma.payment.create({
    data: {
      allocationId: alloc1.id,
      amount: 1500,
      paymentMethod: 'ONLINE',
      receiptNumber: 'RCPT-2026-001',
      remarks: 'Paid in full via Stripe Sandbox',
    },
  });

  await prisma.payment.create({
    data: {
      allocationId: alloc2.id,
      amount: 500,
      paymentMethod: 'CASH',
      receiptNumber: 'RCPT-2026-002',
      remarks: 'Partial cash payment at school reception desk',
    },
  });

  // 10. Seed Exams & Results
  const midtermMath = await prisma.exam.create({
    data: {
      name: 'Mid-Term Algebra Exam',
      subjectId: math.id,
      maxMarks: 100,
      examDate: new Date('2026-04-10'),
    },
  });

  await prisma.examResult.create({
    data: {
      examId: midtermMath.id,
      studentId: student1.id,
      marksObtained: 94,
      remarks: 'Outstanding performance in calculus',
    },
  });

  await prisma.examResult.create({
    data: {
      examId: midtermMath.id,
      studentId: student2.id,
      marksObtained: 76,
      remarks: 'Shows good improvement. Needs practice in linear graphs',
    },
  });

  // 11. Seed In-app Notice Board circulars
  await prisma.notice.create({
    data: {
      title: 'Annual Summer Vacation Announcement',
      content: 'Please note that the institution will remain closed for summer vacation from June 1st, 2026 to July 5th, 2026. Regular classes will resume on July 6th.',
      targetRoles: 'STUDENT,PARENT,TEACHER,STAFF,ACCOUNTANT',
      institutionId: institution.id,
      authorName: 'Sarah Connor',
    },
  });

  await prisma.notice.create({
    data: {
      title: 'Term 1 Tuition Fee Collection Due Date',
      content: 'Reminder to all parents: The tuition fee collection deadline for Term 1 is June 15th, 2026. Late fees will apply post-deadline.',
      targetRoles: 'PARENT,ACCOUNTANT',
      institutionId: institution.id,
      authorName: 'Robert Kiyosaki',
    },
  });

  // 12. Seed Staff Leaves Requests
  await prisma.leaveRequest.create({
    data: {
      staffId: teacherStaff2.id,
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-12'),
      reason: 'Personal medical appointment checkup',
      status: 'PENDING',
    },
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
