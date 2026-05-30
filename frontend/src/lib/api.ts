const API_URL = 'http://localhost:5000';

// Helper to get headers
function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aurxon_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Local mock storage key
const MOCK_STORAGE_KEY = 'aurxon_mock_db';

// Default mock data initialized on first load
const DEFAULT_MOCK_DB = {
  institutionName: 'Aurxon International Academy',
  primaryColor: '#6366f1',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
  
  classes: [
    { id: 'class-1', name: 'Grade 10-A', section: 'A', studentCount: 2, classTeacher: 'Sarah Connor', classTeacherId: 'staff-1' },
    { id: 'class-2', name: 'Grade 11-A', section: 'A', studentCount: 1, classTeacher: 'John Keating', classTeacherId: 'staff-2' }
  ],
  
  subjects: [
    { id: 'subj-1', name: 'Advanced Mathematics', code: 'MATH101', classId: 'class-1', class: { name: 'Grade 10-A' }, teacher: { firstName: 'Sarah', lastName: 'Connor' } },
    { id: 'subj-2', name: 'Introductory Physics', code: 'PHYS101', classId: 'class-1', class: { name: 'Grade 10-A' }, teacher: { firstName: 'John', lastName: 'Keating' } },
    { id: 'subj-3', name: 'English Literature', code: 'LIT201', classId: 'class-2', class: { name: 'Grade 11-A' }, teacher: { firstName: 'John', lastName: 'Keating' } }
  ],

  students: [
    {
      id: 'stud-1',
      rollNumber: 'ROLL-10A-01',
      firstName: 'Alice',
      lastName: 'Miller',
      email: 'student@aurxon.com',
      dateOfBirth: '2010-05-14',
      gender: 'FEMALE',
      classId: 'class-1',
      class: { id: 'class-1', name: 'Grade 10-A' },
      parent: { firstName: 'David', lastName: 'Miller', phone: '+1 555-0201', occupation: 'Software Architect', address: '742 Evergreen Terrace, Springfield' },
      status: 'ACTIVE',
      timeline: [
        { id: 't1', type: 'ADMISSION', description: 'Admitted to Grade 10-A with parents linked successfully.', eventDate: new Date('2026-05-25').toISOString() }
      ],
      documents: [
        { id: 'd1', name: 'Admission_Form.pdf', fileUrl: '#' },
        { id: 'd2', name: 'Birth_Certificate.pdf', fileUrl: '#' }
      ]
    },
    {
      id: 'stud-2',
      rollNumber: 'ROLL-10A-02',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'student2@aurxon.com',
      dateOfBirth: '2010-11-22',
      gender: 'MALE',
      classId: 'class-1',
      class: { id: 'class-1', name: 'Grade 10-A' },
      parent: { firstName: 'Mark', lastName: 'Johnson', phone: '+1 555-0202', occupation: 'Civil Engineer', address: '123 Main St, Springfield' },
      status: 'ACTIVE',
      timeline: [
        { id: 't2', type: 'ADMISSION', description: 'Admitted to Grade 10-A.', eventDate: new Date('2026-05-25').toISOString() }
      ],
      documents: []
    },
    {
      id: 'stud-3',
      rollNumber: 'ROLL-11A-01',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'student3@aurxon.com',
      dateOfBirth: '2009-02-28',
      gender: 'MALE',
      classId: 'class-2',
      class: { id: 'class-2', name: 'Grade 11-A' },
      parent: { firstName: 'Sally', lastName: 'Brown', phone: '+1 555-0203', occupation: 'Manager', address: '456 Oak Ave, Springfield' },
      status: 'ACTIVE',
      timeline: [
        { id: 't3', type: 'ADMISSION', description: 'Admitted to Grade 11-A.', eventDate: new Date('2026-05-25').toISOString() }
      ],
      documents: []
    }
  ],

  staff: [
    {
      id: 'staff-1',
      employeeId: 'EMP001',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '+1 555-0101',
      designation: 'TEACHER',
      joiningDate: '2024-08-15',
      salary: 45000,
      status: 'ACTIVE',
      user: { email: 'teacher1@aurxon.com', isActive: true },
      aadhaarNumber: '394082049284',
      panNumber: 'ABCDE1234F',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      experience: 8,
      gender: 'FEMALE',
      bloodGroup: 'O+',
      fatherSpouseName: 'James Connor',
      permanentAddress: '742 Evergreen Terrace, Springfield',
      bankName: 'State Bank of India',
      bankBranch: 'Main Branch',
      accNumber: '10002930492',
      ifscCode: 'SBIN0000001',
      pfNumber: 'PF-2026-904',
      esiNumber: 'ESI-302-840',
      emergencyContactName: 'John Connor',
      emergencyContactPhone: '+1 555-0199',
      degrees: ['B.Sc. Mathematics', 'M.Sc. Mathematics', 'B.Ed.'],
      skills: ['Calculus', 'Algebra', 'Geometry'],
      certifications: ['National Board Certified Teacher'],
      subjectsExpertise: ['Advanced Mathematics', 'Mathematics']
    },
    {
      id: 'staff-2',
      employeeId: 'EMP002',
      firstName: 'John',
      lastName: 'Keating',
      phone: '+1 555-0102',
      designation: 'TEACHER',
      joiningDate: '2025-01-10',
      salary: 48000,
      status: 'ACTIVE',
      user: { email: 'teacher2@aurxon.com', isActive: true },
      aadhaarNumber: '562180429402',
      panNumber: 'FGHIJ5678K',
      qualification: 'M.A. English Literature',
      experience: 12,
      gender: 'MALE',
      bloodGroup: 'A+',
      fatherSpouseName: 'Arthur Keating',
      permanentAddress: 'Welton Academy Quarters, Vermont',
      bankName: 'HDFC Bank',
      bankBranch: 'City Center',
      accNumber: '50019283049',
      ifscCode: 'HDFC0000124',
      pfNumber: 'PF-2026-905',
      esiNumber: 'ESI-302-841',
      emergencyContactName: 'Todd Anderson',
      emergencyContactPhone: '+1 555-0188',
      degrees: ['B.A. English', 'M.A. English Literature'],
      skills: ['Poetry', 'Creative Writing', 'Public Speaking'],
      certifications: ['TKT Cambridge'],
      subjectsExpertise: ['English Literature', 'Introductory Physics']
    },
    {
      id: 'staff-3',
      employeeId: 'EMP003',
      firstName: 'Robert',
      lastName: 'Kiyosaki',
      phone: '+1 555-0103',
      designation: 'ACCOUNTANT',
      joiningDate: '2024-09-01',
      salary: 40000,
      status: 'ACTIVE',
      user: { email: 'accountant@aurxon.com', isActive: true },
      aadhaarNumber: '894082049285',
      panNumber: 'KLMNO9012L',
      qualification: 'B.Com, Chartered Accountant',
      experience: 15,
      gender: 'MALE',
      bloodGroup: 'B+',
      fatherSpouseName: 'Richard Kiyosaki',
      permanentAddress: '88 Financial Plaza, Mumbai',
      bankName: 'ICICI Bank',
      bankBranch: 'Finance Row',
      accNumber: '60029304925',
      ifscCode: 'ICIC0000045',
      pfNumber: 'PF-2026-906',
      esiNumber: 'ESI-302-842',
      emergencyContactName: 'Kim Kiyosaki',
      emergencyContactPhone: '+1 555-0177',
      degrees: ['B.Com', 'Chartered Accountant'],
      skills: ['Financial Analysis', 'Auditing', 'Excel'],
      certifications: ['ICAI Fellow'],
      subjectsExpertise: ['Accountancy']
    }
  ],

  attendance: [
    // format key: studentId_date
    { studentId: 'stud-1', date: '2026-05-25', status: 'PRESENT', remarks: 'On time' },
    { studentId: 'stud-2', date: '2026-05-25', status: 'PRESENT', remarks: 'On time' },
    { studentId: 'stud-1', date: '2026-05-26', status: 'PRESENT', remarks: 'On time' },
    { studentId: 'stud-2', date: '2026-05-26', status: 'ABSENT', remarks: 'Sick leave' },
    { studentId: 'stud-1', date: '2026-05-27', status: 'PRESENT', remarks: 'On time' },
    { studentId: 'stud-2', date: '2026-05-27', status: 'PRESENT', remarks: 'On time' }
  ],

  feeStructures: [
    { id: 'fee-1', name: 'Term 1 Tuition Fee', amount: 1500, dueDate: '2026-06-15', description: 'Standard tuition fee for Term 1 academics' },
    { id: 'fee-2', name: 'Final Term Exam Fee', amount: 250, dueDate: '2026-06-30', description: 'Examination evaluation and operations cost' }
  ],

  feeAllocations: [
    { id: 'alloc-1', studentId: 'stud-1', feeStructureId: 'fee-1', amountDue: 1500, amountPaid: 1500, status: 'PAID', payments: [{ amount: 1500, paymentDate: '2026-05-27T10:00:00.000Z', paymentMethod: 'ONLINE', receiptNumber: 'RCPT-2026-001', remarks: 'Paid in full via Stripe Sandbox' }] },
    { id: 'alloc-2', studentId: 'stud-2', feeStructureId: 'fee-1', amountDue: 1500, amountPaid: 500, status: 'PARTIAL', payments: [{ amount: 500, paymentDate: '2026-05-27T11:00:00.000Z', paymentMethod: 'CASH', receiptNumber: 'RCPT-2026-002', remarks: 'Partial cash payment at school reception desk' }] },
    { id: 'alloc-3', studentId: 'stud-3', feeStructureId: 'fee-1', amountDue: 1500, amountPaid: 0, status: 'UNPAID', payments: [] },
    { id: 'alloc-4', studentId: 'stud-1', feeStructureId: 'fee-2', amountDue: 250, amountPaid: 0, status: 'UNPAID', payments: [] }
  ],

  exams: [
    { id: 'exam-1', name: 'Mid-Term Algebra Exam', subjectId: 'subj-1', maxMarks: 100, examDate: '2026-04-10', subject: { name: 'Advanced Mathematics', class: { name: 'Grade 10-A' } } }
  ],

  examResults: [
    { id: 'res-1', examId: 'exam-1', studentId: 'stud-1', marksObtained: 94, remarks: 'Outstanding performance in calculus' },
    { id: 'res-2', examId: 'exam-1', studentId: 'stud-2', marksObtained: 76, remarks: 'Shows good improvement. Needs practice in linear graphs' }
  ],

  notices: [
    { id: 'not-1', title: 'Annual Summer Vacation Announcement', content: 'Please note that the institution will remain closed for summer vacation from June 1st, 2026 to July 5th, 2026. Regular classes will resume on July 6th.', targetRoles: 'STUDENT,PARENT,TEACHER,STAFF,ACCOUNTANT', authorName: 'Sarah Connor', createdAt: new Date('2026-05-27T08:00:00.000Z').toISOString() },
    { id: 'not-2', title: 'Term 1 Tuition Fee Collection Due Date', content: 'Reminder to all parents: The tuition fee collection deadline for Term 1 is June 15th, 2026. Late fees will apply post-deadline.', targetRoles: 'PARENT,ACCOUNTANT', authorName: 'Robert Kiyosaki', createdAt: new Date('2026-05-27T09:00:00.000Z').toISOString() }
  ],

  leaves: [
    { id: 'leave-1', staffId: 'staff-2', startDate: '2026-06-10', endDate: '2026-06-12', reason: 'Personal medical appointment checkup', status: 'PENDING', staff: { firstName: 'John', lastName: 'Keating', designation: 'TEACHER' }, createdAt: new Date().toISOString() }
  ],
  expenses: [
    { id: 'exp-1', title: 'CBSE Affiliation Fee Renewal', amount: 45000, category: 'ACADEMIC', paymentMethod: 'ONLINE', expenseDate: new Date('2026-05-20').toISOString() },
    { id: 'exp-2', title: 'High-speed Fiber Broadband Internet', amount: 5600, category: 'UTILITY', paymentMethod: 'BANK_TRANSFER', expenseDate: new Date('2026-05-22').toISOString() },
    { id: 'exp-3', title: 'Office Stationery & Printing Paper Reams', amount: 8400, category: 'OPERATIONAL', paymentMethod: 'CASH', expenseDate: new Date('2026-05-24').toISOString() }
  ],
  lessonPlans: [
    { id: 'lp-1', title: 'Calculus - Integration Methods', content: 'Definite integrals and substitution method applications.', status: 'IN_PROGRESS', syllabusPercent: 40, subjectId: 'subj-1', teacherId: 'staff-1', createdAt: new Date('2026-05-25').toISOString(), subject: { name: 'Advanced Mathematics', code: 'MATH101', class: { name: 'Grade 10-A' } }, teacher: { firstName: 'Sarah', lastName: 'Connor' } },
    { id: 'lp-2', title: 'Classical Mechanics - Laws of Motion', content: 'Newtonian principles and free body diagram calculations.', status: 'COMPLETED', syllabusPercent: 100, subjectId: 'subj-2', teacherId: 'staff-2', createdAt: new Date('2026-05-26').toISOString(), subject: { name: 'Introductory Physics', code: 'PHYS101', class: { name: 'Grade 10-A' } }, teacher: { firstName: 'John', lastName: 'Keating' } }
  ],
  books: [
    { id: 'book-1', title: 'Fundamentals of Physics', author: 'Halliday & Resnick', isbn: '978-0470801833', totalCopies: 5, availableCopies: 4 },
    { id: 'book-2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', totalCopies: 3, availableCopies: 3 },
    { id: 'book-3', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', isbn: '978-8174091955', totalCopies: 10, availableCopies: 10 }
  ],
  bookIssues: [
    { id: 'issue-1', studentId: 'stud-1', bookId: 'book-1', issueDate: '2026-05-26T10:00:00.000Z', returnDate: null, status: 'ISSUED', book: { title: 'Fundamentals of Physics', author: 'Halliday & Resnick', isbn: '978-0470801833' }, student: { firstName: 'Alice', lastName: 'Miller', scholarNumber: 'SCH-2026-001', rollNumber: 'ROLL-10A-01' } }
  ],
  payrolls: [
    {
      id: 'pay-1',
      staffId: 'staff-1',
      month: 'May 2026',
      baseSalary: 45000,
      hra: 8000,
      da: 5000,
      allowances: 2000,
      deductions: 1500,
      netPay: 58500,
      paymentDate: '2026-05-25T10:00:00.000Z',
      paymentMethod: 'BANK_TRANSFER',
      receiptNumber: 'PAY-820492-901',
      status: 'PAID',
      staff: { id: 'staff-1', employeeId: 'EMP001', firstName: 'Sarah', lastName: 'Connor', designation: 'TEACHER' }
    },
    {
      id: 'pay-2',
      staffId: 'staff-2',
      month: 'May 2026',
      baseSalary: 48000,
      hra: 8000,
      da: 5000,
      allowances: 3000,
      deductions: 2000,
      netPay: 62000,
      paymentDate: '2026-05-25T10:30:00.000Z',
      paymentMethod: 'BANK_TRANSFER',
      receiptNumber: 'PAY-820492-902',
      status: 'PAID',
      staff: { id: 'staff-2', employeeId: 'EMP002', firstName: 'John', lastName: 'Keating', designation: 'TEACHER' }
    }
  ],
  visitors: [
    { id: 'vis-1', name: 'Dr. Rajesh Sharma', phone: '9876543210', purpose: 'Parent-Teacher Meeting', hostName: 'Sarah Connor', entryTime: '2026-05-28T09:15:00.000Z', exitTime: '2026-05-28T10:30:00.000Z', passNumber: 'PASS-804928-11' },
    { id: 'vis-2', name: 'Amit Kumar', phone: '9988776655', purpose: 'Consumables Delivery', hostName: 'Robert Kiyosaki', entryTime: '2026-05-28T11:00:00.000Z', exitTime: null, passNumber: 'PASS-804928-12' }
  ],
  inventory: [
    { id: 'inv-1', name: 'A4 Printing Paper Reams', category: 'STATIONERY', quantity: 25, unit: 'REAMS', status: 'IN_STOCK', vendor: 'Century Papers Ltd.' },
    { id: 'inv-2', name: 'Wooden Classroom Chairs', category: 'FURNITURE', quantity: 4, unit: 'PCS', status: 'LOW_STOCK', vendor: 'DecoWood Furnishers' },
    { id: 'inv-3', name: 'Digital Vernier Caliper', category: 'LAB_EQUIPMENT', quantity: 0, unit: 'PCS', status: 'OUT_OF_STOCK', vendor: 'Scientific Instruments Corp.' }
  ]
};

// Access mock database helpers
function getMockDb() {
  if (typeof window === 'undefined') return DEFAULT_MOCK_DB;
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_DB));
    return DEFAULT_MOCK_DB;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_MOCK_DB;
  }
}

function saveMockDb(db: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  }
}

// 1. Auth Call
export async function loginApi(email: string, pass: string) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Authentication failed');
    }
    const data = await res.json();
    localStorage.setItem('aurxon_token', data.token);
    localStorage.setItem('aurxon_user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.warn('Backend offline, using fallback client-side validation...');
    // Fallback Mock Validation
    const db = getMockDb();
    
    // Check roles
    let role = '';
    let profileName = 'Administrator';
    let profileId = '';

    if (email === 'superadmin@aurxon.com') {
      role = 'SUPER_ADMIN';
    } else if (email === 'admin@aurxon.com') {
      role = 'INSTITUTE_ADMIN';
    } else if (email === 'teacher1@aurxon.com') {
      role = 'TEACHER';
      profileName = 'Sarah Connor';
      profileId = 'staff-1';
    } else if (email === 'teacher2@aurxon.com') {
      role = 'TEACHER';
      profileName = 'John Keating';
      profileId = 'staff-2';
    } else if (email === 'accountant@aurxon.com') {
      role = 'ACCOUNTANT';
      profileName = 'Robert Kiyosaki';
      profileId = 'staff-3';
    } else if (email === 'student@aurxon.com') {
      role = 'STUDENT';
      profileName = 'Alice Miller';
      profileId = 'stud-1';
    } else if (email === 'parent@aurxon.com') {
      role = 'PARENT';
      profileName = 'David Miller';
      profileId = 'parent-1';
    } else {
      // General check inside database
      const foundStudent = db.students.find((s) => s.email === email);
      if (foundStudent) {
        role = 'STUDENT';
        profileName = `${foundStudent.firstName} ${foundStudent.lastName}`;
        profileId = foundStudent.id;
      } else {
        const foundStaff = db.staff.find((s) => s.user.email === email);
        if (foundStaff) {
          role = foundStaff.designation;
          profileName = `${foundStaff.firstName} ${foundStaff.lastName}`;
          profileId = foundStaff.id;
        } else {
          throw new Error('Invalid email or password (offline validation)');
        }
      }
    }

    if (pass !== 'password123') {
      throw new Error('Invalid password (hint: use password123)');
    }

    const payload = {
      token: 'mock-jwt-token-aurxon-2026',
      user: {
        id: 'mock-user-id',
        email,
        role,
        profileName,
        profileId,
        institutionId: 'inst-1',
        institutionName: db.institutionName,
        logoUrl: db.logoUrl,
        primaryColor: db.primaryColor,
      },
    };

    localStorage.setItem('aurxon_token', payload.token);
    localStorage.setItem('aurxon_user', JSON.stringify(payload.user));
    return payload;
  }
}

// 2. Dashboard Analytics
export async function getDashboardStatsApi() {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    
    // Computations
    const studentCount = db.students.length;
    const staffCount = db.staff.length;
    const classCount = db.classes.length;

    // Fees computations
    let totalDue = 0;
    let totalPaid = 0;
    for (const a of db.feeAllocations) {
      totalDue += a.amountDue;
      totalPaid += a.amountPaid;
    }

    // Attendance rate
    const totalAttend = db.attendance.length;
    const presentCount = db.attendance.filter(r => r.status === 'PRESENT').length;
    const attendanceRate = totalAttend > 0 ? (presentCount / totalAttend) * 100 : 96.5;

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
      recentNotices: db.notices.slice(0, 3),
      classes: db.classes,
    };
  }
}

// 3. Students CRUD
export async function getStudentsApi(classId?: string, search?: string) {
  try {
    const query = new URLSearchParams();
    if (classId) query.append('classId', classId);
    if (search) query.append('search', search);
    
    const res = await fetch(`${API_URL}/students?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let filtered = [...db.students];
    if (classId) {
      filtered = filtered.filter(s => s.classId === classId);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.firstName.toLowerCase().includes(q) || 
        s.lastName.toLowerCase().includes(q) || 
        s.rollNumber.toLowerCase().includes(q)
      );
    }
    return filtered;
  }
}

export async function getStudentApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/students/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const student = db.students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    
    // Attach allocations
    const allocations = db.feeAllocations
      .filter(a => a.studentId === id)
      .map(a => ({
        ...a,
        feeStructure: db.feeStructures.find(fs => fs.id === a.feeStructureId)
      }));

    return {
      ...student,
      feeAllocations: allocations,
    };
  }
}

export async function createStudentApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const newStudent = {
      id: `stud-${Date.now()}`,
      rollNumber: data.rollNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      classId: data.classId,
      class: db.classes.find(c => c.id === data.classId) || { id: data.classId, name: 'Assigned Class' },
      status: 'ACTIVE',
      timeline: [{ id: `t-${Date.now()}`, type: 'ADMISSION', description: 'Admitted online successfully.', eventDate: new Date().toISOString() }],
      documents: [],
      parent: { firstName: data.parentName || 'Guardian', phone: data.parentPhone || '' }
    };
    db.students.push(newStudent);
    saveMockDb(db);
    return newStudent;
  }
}

export async function updateStudentApi(id: string, data: any) {
  try {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const index = db.students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    db.students[index] = {
      ...db.students[index],
      firstName: data.firstName,
      lastName: data.lastName,
      rollNumber: data.rollNumber,
      classId: data.classId,
      class: db.classes.find(c => c.id === data.classId) || db.students[index].class,
    };
    saveMockDb(db);
    return db.students[index];
  }
}

export async function deleteStudentApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    db.students = db.students.filter(s => s.id !== id);
    db.feeAllocations = db.feeAllocations.filter(a => a.studentId !== id);
    db.attendance = db.attendance.filter(r => r.studentId !== id);
    db.examResults = db.examResults.filter(r => r.studentId !== id);
    saveMockDb(db);
    return { id };
  }
}

// 4. Classes
export async function getClassesApi() {
  try {
    const res = await fetch(`${API_URL}/classes`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.classes;
  }
}

export async function getSubjectsApi(classId?: string) {
  try {
    const query = classId ? `?classId=${classId}` : '';
    const res = await fetch(`${API_URL}/classes/subjects${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.subjects;
    if (classId) list = list.filter(s => s.classId === classId);
    return list;
  }
}

// 5. Attendance
export async function getClassAttendanceApi(classId: string, date: string) {
  try {
    const res = await fetch(`${API_URL}/attendance?classId=${classId}&date=${date}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const dateOnly = date.substring(0, 10);
    const students = db.students.filter(s => s.classId === classId);
    
    return students.map((student) => {
      const record = db.attendance.find(r => r.studentId === student.id && r.date.startsWith(dateOnly));
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNumber: student.rollNumber,
        status: record ? record.status : 'PRESENT',
        remarks: record ? record.remarks : '',
      };
    });
  }
}

export async function submitAttendanceApi(classId: string, date: string, records: any[]) {
  try {
    const res = await fetch(`${API_URL}/attendance/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ classId, date, records }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const dateOnly = date.substring(0, 10);
    
    for (const record of records) {
      db.attendance = db.attendance.filter(
        r => !(r.studentId === record.studentId && r.date.startsWith(dateOnly))
      );
      db.attendance.push({
        studentId: record.studentId,
        date: dateOnly,
        status: record.status,
        remarks: record.remarks || '',
      });
    }
    saveMockDb(db);
    return { success: true };
  }
}

export async function getStudentAttendanceSummaryApi(studentId: string) {
  try {
    const res = await fetch(`${API_URL}/attendance/student/${studentId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const records = db.attendance.filter(r => r.studentId === studentId);
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const rate = total > 0 ? (present / total) * 100 : 100;
    
    return {
      total,
      present,
      absent: total - present,
      rate: Math.round(rate * 10) / 10,
      history: records,
    };
  }
}

// 6. Fees
export async function getFeesOverviewApi() {
  try {
    const res = await fetch(`${API_URL}/fees/overview`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let totalDue = 0;
    let totalPaid = 0;
    for (const a of db.feeAllocations) {
      totalDue += a.amountDue;
      totalPaid += a.amountPaid;
    }
    return {
      totalDue,
      totalPaid,
      totalPending: totalDue - totalPaid,
      collectedRate: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 90,
      countPaid: db.feeAllocations.filter(a => a.status === 'PAID').length,
      countPartial: db.feeAllocations.filter(a => a.status === 'PARTIAL').length,
      countUnpaid: db.feeAllocations.filter(a => a.status === 'UNPAID').length,
    };
  }
}

export async function getFeesAllocationsApi(classId?: string, status?: string) {
  try {
    const query = new URLSearchParams();
    if (classId) query.append('classId', classId);
    if (status) query.append('status', status);
    
    const res = await fetch(`${API_URL}/fees/allocations?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.feeAllocations.map(a => {
      const student = db.students.find(s => s.id === a.studentId) || { firstName: 'Alice', lastName: 'Miller', rollNumber: 'ROLL-1', class: { name: 'Class' } };
      const feeStructure = db.feeStructures.find(f => f.id === a.feeStructureId) || { name: 'Tuition Fee' };
      return {
        ...a,
        student: {
          ...student,
          class: { name: (student.class as any)?.name || 'Grade 10-A' }
        },
        feeStructure,
      };
    });

    if (classId) {
      list = list.filter(a => (a.student as any).classId === classId || (a.student as any).class?.id === classId);
    }
    if (status) {
      list = list.filter(a => a.status === status);
    }
    return list;
  }
}

export async function payFeeApi(allocationId: string, amount: number, paymentMethod: string, remarks?: string) {
  try {
    const res = await fetch(`${API_URL}/fees/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ allocationId, amount, paymentMethod, remarks }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const index = db.feeAllocations.findIndex(a => a.id === allocationId);
    if (index === -1) throw new Error('Allocation record not found');
    
    const alloc = db.feeAllocations[index];
    const newPaid = alloc.amountPaid + parseFloat(amount as any);
    let status = 'PARTIAL';
    if (newPaid >= alloc.amountDue) status = 'PAID';
    
    const receiptNumber = `RCPT-${Date.now().toString().slice(-6)}`;
    const newPayment = {
      amount: parseFloat(amount as any),
      paymentDate: new Date().toISOString(),
      paymentMethod,
      receiptNumber,
      remarks: remarks || '',
    };
    
    db.feeAllocations[index] = {
      ...alloc,
      amountPaid: newPaid,
      status,
      payments: [...(alloc.payments || []), newPayment] as any
    };
    
    saveMockDb(db);
    return newPayment;
  }
}

export async function getFeesStructuresApi() {
  try {
    const res = await fetch(`${API_URL}/fees/structures`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.feeStructures;
  }
}

export async function createFeeStructureApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/fees/structures`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const newFs = {
      id: `fee-${Date.now()}`,
      name: data.name,
      amount: parseFloat(data.amount),
      dueDate: data.dueDate,
      description: data.description || '',
    };
    db.feeStructures.push(newFs);
    saveMockDb(db);
    return newFs;
  }
}

// 7. Examination
export async function getExamsApi(subjectId?: string) {
  try {
    const query = subjectId ? `?subjectId=${subjectId}` : '';
    const res = await fetch(`${API_URL}/exams${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.exams.map((exam) => {
      const subject = db.subjects.find(s => s.id === exam.subjectId) || { name: 'Subject', class: { name: 'Class 1' } };
      return {
        ...exam,
        subject,
      };
    });
  }
}

export async function createExamApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/exams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const newExam = {
      id: `exam-${Date.now()}`,
      name: data.name,
      subjectId: data.subjectId,
      maxMarks: parseFloat(data.maxMarks),
      examDate: data.examDate,
    };
    db.exams.push(newExam);
    saveMockDb(db);
    return newExam;
  }
}

export async function getExamResultsApi(examId: string) {
  try {
    const res = await fetch(`${API_URL}/exams/${examId}/results`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const exam = db.exams.find(e => e.id === examId);
    if (!exam) throw new Error('Exam not found');
    
    // Filter students by that class
    const subject = db.subjects.find(s => s.id === exam.subjectId);
    const students = db.students.filter(s => s.classId === subject?.classId);
    
    return students.map((student) => {
      const resRecord = db.examResults.find(r => r.examId === examId && r.studentId === student.id);
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNumber: student.rollNumber,
        marksObtained: resRecord ? resRecord.marksObtained : 0,
        remarks: resRecord ? resRecord.remarks : '',
      };
    });
  }
}

export async function submitExamResultsApi(examId: string, results: any[]) {
  try {
    const res = await fetch(`${API_URL}/exams/${examId}/results/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ results }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    
    for (const record of results) {
      db.examResults = db.examResults.filter(r => !(r.examId === examId && r.studentId === record.studentId));
      db.examResults.push({
        id: `res-${Date.now()}-${Math.random()}`,
        examId,
        studentId: record.studentId,
        marksObtained: parseFloat(record.marksObtained),
        remarks: record.remarks || '',
      });
    }
    saveMockDb(db);
    return { success: true };
  }
}

export async function getStudentReportApi(studentId: string) {
  try {
    const res = await fetch(`${API_URL}/exams/student/${studentId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const results = db.examResults.filter(r => r.studentId === studentId);
    
    return results.map((r) => {
      const exam = db.exams.find(e => e.id === r.examId) || { name: 'Term Exam', maxMarks: 100, subjectId: 'subj-1' };
      const subject = db.subjects.find(s => s.id === exam.subjectId) || { name: 'Mathematics' };
      const percentage = (r.marksObtained / exam.maxMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      return {
        examId: r.examId,
        examName: exam.name,
        subjectName: subject.name,
        marksObtained: r.marksObtained,
        maxMarks: exam.maxMarks,
        percentage: Math.round(percentage),
        grade,
        remarks: r.remarks,
      };
    });
  }
}

// 8. Staff
export async function getStaffApi(designation?: string) {
  try {
    const query = designation ? `?designation=${designation}` : '';
    const res = await fetch(`${API_URL}/staff${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.staff;
    if (designation) list = list.filter(s => s.designation === designation);
    return list;
  }
}

export async function createStaffApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/staff`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const newStaff = {
      id: `staff-${Date.now()}`,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      designation: data.designation,
      joiningDate: data.joiningDate || new Date().toISOString(),
      salary: parseFloat(data.salary || 0),
      status: 'ACTIVE',
      user: { email: data.email, isActive: true },
    };
    db.staff.push(newStaff);
    saveMockDb(db);
    return newStaff;
  }
}

export async function getLeavesApi(staffId?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (staffId) params.append('staffId', staffId);
    if (status) params.append('status', status);
    const res = await fetch(`${API_URL}/leaves?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.leaves;
    if (staffId) list = list.filter(l => l.staffId === staffId || l.staff?.id === staffId);
    if (status) list = list.filter(l => l.status === status);
    return list;
  }
}

export async function submitLeaveApi(startDate: string, endDate: string, reason: string) {
  try {
    const res = await fetch(`${API_URL}/leaves`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ startDate, endDate, reason }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const userCached = localStorage.getItem('aurxon_user');
    const user = userCached ? JSON.parse(userCached) : { profileId: 'staff-1', profileName: 'Sarah Connor', role: 'TEACHER' };
    
    const newLeave = {
      id: `leave-${Date.now()}`,
      staffId: user.profileId,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
      staff: { firstName: user.profileName.split(' ')[0], lastName: user.profileName.split(' ')[1] || '', designation: user.role },
      createdAt: new Date().toISOString(),
    };
    db.leaves.push(newLeave);
    saveMockDb(db);
    return newLeave;
  }
}

export async function approveLeaveApi(leaveId: string, status: string) {
  try {
    const endpoint = status === 'APPROVED' ? 'approve' : 'reject';
    const res = await fetch(`${API_URL}/leaves/${leaveId}/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const index = db.leaves.findIndex(l => l.id === leaveId);
    if (index === -1) throw new Error('Leave request not found');
    
    db.leaves[index].status = status;
    saveMockDb(db);
    return db.leaves[index];
  }
}

// 9. Notices
export async function getNoticesApi() {
  try {
    const res = await fetch(`${API_URL}/notices`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const userStr = localStorage.getItem('aurxon_user');
    const user = userStr ? JSON.parse(userStr) : { role: 'STUDENT' };
    
    return db.notices.filter((n) => {
      const roles = n.targetRoles.split(',');
      return roles.includes(user.role) || roles.includes('ALL') || user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN';
    });
  }
}

export async function createNoticeApi(title: string, content: string, targetRoles: string[]) {
  try {
    const res = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, content, targetRoles }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const userStr = localStorage.getItem('aurxon_user');
    const user = userStr ? JSON.parse(userStr) : { profileName: 'Administrator' };
    
    const newNotice = {
      id: `not-${Date.now()}`,
      title,
      content,
      targetRoles: targetRoles.join(','),
      authorName: user.profileName,
      createdAt: new Date().toISOString(),
    };
    db.notices.unshift(newNotice);
    saveMockDb(db);
    return newNotice;
  }
}

// 10. Indian PIN Code Autofill lookup helper
export function getPinCodeDetails(pin: string) {
  if (!pin || pin.length < 2) return null;
  const pinPrefix = pin.substring(0, 2);
  const mapping: Record<string, { state: string; district: string }> = {
    '11': { state: 'Delhi', district: 'New Delhi' },
    '12': { state: 'Haryana', district: 'Gurugram' },
    '13': { state: 'Haryana', district: 'Ambala' },
    '14': { state: 'Punjab', district: 'Ludhiana' },
    '16': { state: 'Punjab', district: 'Chandigarh' },
    '20': { state: 'Uttar Pradesh', district: 'Noida' },
    '22': { state: 'Uttar Pradesh', district: 'Lucknow' },
    '30': { state: 'Rajasthan', district: 'Jaipur' },
    '36': { state: 'Gujarat', district: 'Rajkot' },
    '38': { state: 'Gujarat', district: 'Ahmedabad' },
    '39': { state: 'Gujarat', district: 'Surat' },
    '40': { state: 'Maharashtra', district: 'Mumbai' },
    '41': { state: 'Maharashtra', district: 'Pune' },
    '44': { state: 'Maharashtra', district: 'Nagpur' },
    '45': { state: 'Madhya Pradesh', district: 'Indore' },
    '46': { state: 'Madhya Pradesh', district: 'Bhopal' },
    '50': { state: 'Telangana', district: 'Hyderabad' },
    '56': { state: 'Karnataka', district: 'Bengaluru' },
    '57': { state: 'Karnataka', district: 'Mysore' },
    '60': { state: 'Tamil Nadu', district: 'Chennai' },
    '62': { state: 'Tamil Nadu', district: 'Madurai' },
    '68': { state: 'Kerala', district: 'Kochi' },
    '70': { state: 'West Bengal', district: 'Kolkata' },
    '75': { state: 'Odisha', district: 'Bhubaneswar' },
    '80': { state: 'Bihar', district: 'Patna' },
  };
  return mapping[pinPrefix] || null;
}

// 11. bulk academic promotion API
export async function promoteStudentsApi(studentIds: string[], targetClassId: string) {
  try {
    const res = await fetch(`${API_URL}/students/promote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentIds, targetClassId }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    console.warn('Backend promote endpoint offline, falling back to mock database...');
    const db = getMockDb();
    const targetClass = db.classes.find(c => c.id === targetClassId);
    if (!targetClass) throw new Error('Target class not found');
    
    if (!(db as any).promotions) (db as any).promotions = [];
    let count = 0;
    db.students = db.students.map((student) => {
      if (studentIds.includes(student.id)) {
        count++;
        const classDigits = targetClass.name.replace(/\D/g, '') || '0';
        const nextRoll = `${classDigits}1${String(count).padStart(2, '0')}`;
        
        const timeline = student.timeline || [];
        timeline.unshift({
          id: `t-${Date.now()}-${count}`,
          type: 'PROMOTION',
          description: `Promoted automatically to ${targetClass.name} under Roll No. ${nextRoll}.`,
          eventDate: new Date().toISOString()
        });

        (db as any).promotions.push({
          id: `prom-${Date.now()}-${student.id}`,
          student: { firstName: student.firstName, lastName: student.lastName, scholarNumber: student.scholarNumber || 'SCH' },
          fromClass: { name: student.class?.name || 'Previous Grade' },
          toClass: { name: targetClass.name },
          academicYear: '2026-2027',
          promotedAt: new Date().toISOString(),
          promotedBy: { email: 'admin@aurxon.com' }
        });
        
        return {
          ...student,
          classId: targetClassId,
          class: { id: targetClassId, name: targetClass.name },
          rollNumber: nextRoll,
          timeline,
        };
      }
      return student;
    });
    saveMockDb(db);
    return { success: true, count };
  }
}

// 12. P&L financial ledger API
export async function getFinanceOverviewApi() {
  try {
    const res = await fetch(`${API_URL}/fees/finance/overview`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    console.warn('Backend finance overview offline, falling back to mock calculations...');
    const db = getMockDb();
    
    // Fee revenues
    const totalRevenue = db.feeAllocations.reduce((sum, a) => sum + a.amountPaid, 0);
    
    // Operational expenses
    const expenses = db.expenses || [];
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Staff Salaries (in INR)
    const totalSalaries = db.staff.reduce((sum, s) => sum + s.salary, 0) * 80; // Scaled to INR
    
    const netProfit = totalRevenue - totalExpenses - totalSalaries;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    
    return {
      totalRevenue,
      totalExpenses,
      totalSalaries,
      netProfit,
      profitMargin,
      currency: 'INR',
      currencySymbol: '₹',
      recentExpenses: expenses,
    };
  }
}

// 13. Expense management API
export async function getExpensesApi() {
  try {
    const res = await fetch(`${API_URL}/fees/expenses`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.expenses || [];
  }
}

export async function createExpenseApi(data: { title: string; amount: number; category: string; paymentMethod: string }) {
  try {
    const res = await fetch(`${API_URL}/fees/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const newExpense = {
      id: `exp-${Date.now()}`,
      title: data.title,
      amount: parseFloat(data.amount as any),
      category: data.category,
      paymentMethod: data.paymentMethod || 'CASH',
      expenseDate: new Date().toISOString(),
    };
    if (!db.expenses) db.expenses = [];
    db.expenses.unshift(newExpense);
    saveMockDb(db);
    return newExpense;
  }
}

export async function deleteExpenseApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/fees/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (db.expenses) {
      db.expenses = db.expenses.filter((e: any) => e.id !== id);
    }
    saveMockDb(db);
    return { id };
  }
}

// 14. Lesson Planner and Syllabus tracker API
export async function getLessonPlansApi(teacherId?: string, subjectId?: string) {
  try {
    const query = new URLSearchParams();
    if (teacherId) query.append('teacherId', teacherId);
    if (subjectId) query.append('subjectId', subjectId);
    const res = await fetch(`${API_URL}/lessons?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let plans = db.lessonPlans || [];
    if (teacherId) {
      plans = plans.filter((p: any) => p.teacherId === teacherId);
    }
    if (subjectId) {
      plans = plans.filter((p: any) => p.subjectId === subjectId);
    }
    return plans;
  }
}

export async function createLessonPlanApi(data: { title: string; content: string; subjectId: string; syllabusPercent: number }) {
  try {
    const res = await fetch(`${API_URL}/lessons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const userStr = localStorage.getItem('aurxon_user');
    const user = userStr ? JSON.parse(userStr) : { profileId: 'staff-1', profileName: 'Sarah Connor' };
    
    const subject = db.subjects.find((s: any) => s.id === data.subjectId) || { name: 'Subject', code: 'SUB', class: { name: 'Class' } };
    
    const newPlan = {
      id: `lp-${Date.now()}`,
      title: data.title,
      content: data.content,
      status: 'PENDING',
      syllabusPercent: parseInt(data.syllabusPercent as any || '0'),
      subjectId: data.subjectId,
      teacherId: user.profileId,
      createdAt: new Date().toISOString(),
      subject,
      teacher: { firstName: user.profileName.split(' ')[0], lastName: user.profileName.split(' ')[1] || '' }
    };
    if (!db.lessonPlans) db.lessonPlans = [];
    db.lessonPlans.unshift(newPlan);
    saveMockDb(db);
    return newPlan;
  }
}

export async function updateLessonPlanApi(id: string, data: { status: string; syllabusPercent: number }) {
  try {
    const res = await fetch(`${API_URL}/lessons/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (db.lessonPlans) {
      const idx = db.lessonPlans.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        db.lessonPlans[idx] = {
          ...db.lessonPlans[idx],
          status: data.status,
          syllabusPercent: parseInt(data.syllabusPercent as any || '0'),
        };
      }
    }
    saveMockDb(db);
    return { id };
  }
}

export async function deleteLessonPlanApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/lessons/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (db.lessonPlans) {
      db.lessonPlans = db.lessonPlans.filter((p: any) => p.id !== id);
    }
    saveMockDb(db);
    return { id };
  }
}

// 15. Library Management API
export async function getBooksApi(search?: string) {
  try {
    const query = search ? `?search=${search}` : '';
    const res = await fetch(`${API_URL}/library/books${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.books || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b: any) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q)
      );
    }
    return list;
  }
}

export async function createBookApi(data: { title: string; author: string; isbn: string; totalCopies: number }) {
  try {
    const res = await fetch(`${API_URL}/library/books`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.books) db.books = [];
    const existing = db.books.find((b: any) => b.isbn === data.isbn);
    if (existing) throw new Error('A book with this ISBN already exists');

    const newBook = {
      id: `book-${Date.now()}`,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      totalCopies: parseInt(data.totalCopies as any || 1),
      availableCopies: parseInt(data.totalCopies as any || 1),
    };
    db.books.push(newBook);
    saveMockDb(db);
    return newBook;
  }
}

export async function updateBookApi(id: string, data: any) {
  try {
    const res = await fetch(`${API_URL}/library/books/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (db.books) {
      const idx = db.books.findIndex((b: any) => b.id === id);
      if (idx !== -1) {
        const book = db.books[idx];
        const total = data.totalCopies !== undefined ? parseInt(data.totalCopies) : book.totalCopies;
        const diff = total - book.totalCopies;
        const available = Math.max(0, book.availableCopies + diff);
        db.books[idx] = {
          ...book,
          title: data.title !== undefined ? data.title : book.title,
          author: data.author !== undefined ? data.author : book.author,
          isbn: data.isbn !== undefined ? data.isbn : book.isbn,
          totalCopies: total,
          availableCopies: available,
        };
      }
    }
    saveMockDb(db);
    return { id };
  }
}

export async function deleteBookApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/library/books/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (db.books) {
      db.books = db.books.filter((b: any) => b.id !== id);
    }
    saveMockDb(db);
    return { id };
  }
}

export async function getIssuesApi() {
  try {
    const res = await fetch(`${API_URL}/library/issues`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.bookIssues || [];
  }
}

export async function getStudentIssuesApi(studentId: string) {
  try {
    const res = await fetch(`${API_URL}/library/issues/student/${studentId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return (db.bookIssues || []).filter((i: any) => i.studentId === studentId);
  }
}

export async function issueBookApi(studentId: string, bookId: string) {
  try {
    const res = await fetch(`${API_URL}/library/issue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentId, bookId }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.books) db.books = [];
    if (!db.bookIssues) db.bookIssues = [];

    const bookIdx = db.books.findIndex((b: any) => b.id === bookId);
    if (bookIdx === -1) throw new Error('Book not found');
    if (db.books[bookIdx].availableCopies <= 0) throw new Error('No copies available');

    const student = db.students.find((s: any) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const existingIssue = db.bookIssues.find((i: any) => i.studentId === studentId && i.bookId === bookId && i.status === 'ISSUED');
    if (existingIssue) throw new Error('This book is already issued to this student');

    const newIssue = {
      id: `issue-${Date.now()}`,
      studentId,
      bookId,
      issueDate: new Date().toISOString(),
      returnDate: null,
      status: 'ISSUED',
      book: { ...db.books[bookIdx] },
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        scholarNumber: student.scholarNumber || `SCH-${Date.now().toString().slice(-4)}`,
        rollNumber: student.rollNumber,
        class: student.class ? { name: student.class.name } : { name: 'Grade 10-A' }
      }
    };

    db.books[bookIdx].availableCopies -= 1;
    db.bookIssues.push(newIssue);
    saveMockDb(db);
    return newIssue;
  }
}

export async function returnBookApi(issueId: string) {
  try {
    const res = await fetch(`${API_URL}/library/return/${issueId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.bookIssues) db.bookIssues = [];

    const issueIdx = db.bookIssues.findIndex((i: any) => i.id === issueId);
    if (issueIdx === -1) throw new Error('Issue record not found');
    if (db.bookIssues[issueIdx].status === 'RETURNED') throw new Error('Already returned');

    db.bookIssues[issueIdx].status = 'RETURNED';
    db.bookIssues[issueIdx].returnDate = new Date().toISOString();

    const bookIdx = db.books.findIndex((b: any) => b.id === db.bookIssues[issueIdx].bookId);
    if (bookIdx !== -1) {
      db.books[bookIdx].availableCopies += 1;
    }

    saveMockDb(db);
    return db.bookIssues[issueIdx];
  }
}

export async function getStaffByIdApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/staff/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const staff = db.staff.find((s: any) => s.id === id);
    if (!staff) throw new Error('Staff member not found');
    
    const payrolls = (db.payrolls || []).filter((p: any) => p.staffId === id);
    const leaves = (db.leaves || []).filter((l: any) => l.staffId === id);
    
    return {
      ...staff,
      payrolls,
      leaves
    };
  }
}

export async function updateStaffApi(id: string, data: any) {
  try {
    const res = await fetch(`${API_URL}/staff/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const idx = db.staff.findIndex((s: any) => s.id === id);
    if (idx === -1) throw new Error('Staff member not found');
    
    db.staff[idx] = {
      ...db.staff[idx],
      ...data,
      salary: data.salary !== undefined ? parseFloat(data.salary) : db.staff[idx].salary,
      experience: data.experience !== undefined ? parseInt(data.experience) : db.staff[idx].experience,
      degrees: data.degrees !== undefined ? data.degrees : db.staff[idx].degrees || [],
      skills: data.skills !== undefined ? data.skills : db.staff[idx].skills || [],
      certifications: data.certifications !== undefined ? data.certifications : db.staff[idx].certifications || [],
      subjectsExpertise: data.subjectsExpertise !== undefined ? data.subjectsExpertise : db.staff[idx].subjectsExpertise || [],
    };
    saveMockDb(db);
    return db.staff[idx];
  }
}

export async function getPayrollsApi(month?: string) {
  try {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`${API_URL}/payroll${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.payrolls || [];
    if (month) {
      list = list.filter((p: any) => p.month === month);
    }
    return list;
  }
}

export async function getStaffPayrollsApi(staffId: string) {
  try {
    const res = await fetch(`${API_URL}/payroll/staff/${staffId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return (db.payrolls || []).filter((p: any) => p.staffId === staffId);
  }
}

export async function getPayrollByIdApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/payroll/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const payroll = (db.payrolls || []).find((p: any) => p.id === id);
    if (!payroll) throw new Error('Payroll record not found');
    const staff = db.staff.find((s: any) => s.id === payroll.staffId);
    return {
      ...payroll,
      staff
    };
  }
}

export async function createPayrollApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/payroll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.payrolls) db.payrolls = [];
    
    const staff = db.staff.find((s: any) => s.id === data.staffId);
    if (!staff) throw new Error('Staff member not found');
    
    const existing = db.payrolls.find((p: any) => p.staffId === data.staffId && p.month === data.month);
    if (existing) throw new Error(`Salary slip for ${data.month} already generated for this employee`);
    
    const baseSalary = parseFloat(data.baseSalary) || staff.salary;
    const hra = parseFloat(data.hra) || 0;
    const da = parseFloat(data.da) || 0;
    const allowances = parseFloat(data.allowances) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    const netPay = baseSalary + hra + da + allowances - deductions;
    
    const receiptNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    
    const newPayroll = {
      id: `pay-${Date.now()}`,
      staffId: data.staffId,
      month: data.month,
      baseSalary,
      hra,
      da,
      allowances,
      deductions,
      netPay,
      paymentDate: new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
      receiptNumber,
      status: 'PAID',
      staff: {
        id: staff.id,
        employeeId: staff.employeeId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        designation: staff.designation
      }
    };
    
    db.payrolls.push(newPayroll);
    saveMockDb(db);
    return newPayroll;
  }
}

export async function updatePayrollStatusApi(id: string, status: string) {
  try {
    const res = await fetch(`${API_URL}/payroll/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.payrolls) db.payrolls = [];
    const idx = db.payrolls.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error('Payroll record not found');
    
    db.payrolls[idx].status = status;
    saveMockDb(db);
    return db.payrolls[idx];
  }
}

// 16. Visitor Gate Desk APIs
export async function getVisitorsApi() {
  try {
    const res = await fetch(`${API_URL}/visitors`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.visitors || [];
  }
}

export async function createVisitorApi(data: { name: string; phone: string; purpose: string; hostName: string }) {
  try {
    const res = await fetch(`${API_URL}/visitors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.visitors) db.visitors = [];
    const newVisitor = {
      id: `vis-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      purpose: data.purpose,
      hostName: data.hostName,
      entryTime: new Date().toISOString(),
      exitTime: null,
      passNumber: `PASS-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`,
    };
    db.visitors.unshift(newVisitor);
    saveMockDb(db);
    return newVisitor;
  }
}

export async function checkoutVisitorApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/visitors/${id}/checkout`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.visitors) db.visitors = [];
    const idx = db.visitors.findIndex((v: any) => v.id === id);
    if (idx !== -1) {
      db.visitors[idx].exitTime = new Date().toISOString();
    }
    saveMockDb(db);
    return db.visitors[idx];
  }
}

// 17. Inventory APIs
export async function getInventoryApi() {
  try {
    const res = await fetch(`${API_URL}/inventory`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return db.inventory || [];
  }
}

export async function createInventoryItemApi(data: { name: string; category: string; quantity: number; unit: string; vendor?: string }) {
  try {
    const res = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.inventory) db.inventory = [];
    const qty = parseInt(data.quantity as any) || 0;
    const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
    const newItem = {
      id: `inv-${Date.now()}`,
      name: data.name,
      category: data.category,
      quantity: qty,
      unit: data.unit || 'PCS',
      status,
      vendor: data.vendor || null,
    };
    db.inventory.unshift(newItem);
    saveMockDb(db);
    return newItem;
  }
}

export async function updateInventoryItemApi(id: string, data: any) {
  try {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!db.inventory) db.inventory = [];
    const idx = db.inventory.findIndex((item: any) => item.id === id);
    if (idx !== -1) {
      const item = db.inventory[idx];
      const qty = data.quantity !== undefined ? parseInt(data.quantity) : item.quantity;
      const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
      db.inventory[idx] = {
        ...item,
        name: data.name !== undefined ? data.name : item.name,
        category: data.category !== undefined ? data.category : item.category,
        quantity: qty,
        unit: data.unit !== undefined ? data.unit : item.unit,
        status,
        vendor: data.vendor !== undefined ? data.vendor : item.vendor,
      };
    }
     saveMockDb(db);
    return db.inventory[idx];
  }
}

export async function deleteInventoryItemApi(id: string) {
  try {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (db.inventory) {
      db.inventory = db.inventory.filter((item: any) => item.id !== id);
    }
    saveMockDb(db);
    return { id };
  }
}

// 18. Timetable APIs
export async function getTimetableApi(classId: string) {
  try {
    const res = await fetch(`${API_URL}/timetable/${classId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const entries = (db.timetable || []).filter((e: any) => e.classId === classId);
    return entries.map((e: any) => {
      const subject = db.subjects.find((s: any) => s.id === e.subjectId) || { id: e.subjectId, name: 'Subject', code: 'SUB' };
      const teacher = db.staff.find((t: any) => t.id === e.teacherId) || { id: e.teacherId, firstName: 'Teacher', lastName: '' };
      return {
        ...e,
        subject,
        teacher
      };
    });
  }
}

export async function generateTimetableApi(classId: string, periodsPerDay: number, durationMin: number, startTime: string) {
  try {
    const res = await fetch(`${API_URL}/timetable/${classId}/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ periodsPerDay, durationMin, startTime }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'API failed');
    }
    return await res.json();
  } catch (error: any) {
    console.warn('Backend timetable generator offline, using mock client-side scheduler...');
    const db = getMockDb();
    const subjects = db.subjects.filter((s: any) => s.classId === classId);
    if (subjects.length === 0) {
      throw new Error('This class has no subjects registered. Please add subjects first.');
    }

    const teachers = db.staff || [];
    const otherEntries = (db.timetable || []).filter((e: any) => e.classId !== classId);

    const busyMap: { [day: string]: { [period: number]: Set<string> } } = {};
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    days.forEach(day => {
      busyMap[day] = {};
      for (let p = 1; p <= periodsPerDay; p++) {
        busyMap[day][p] = new Set<string>();
      }
    });

    otherEntries.forEach((entry: any) => {
      if (busyMap[entry.dayOfWeek] && busyMap[entry.dayOfWeek][entry.periodNumber]) {
        busyMap[entry.dayOfWeek][entry.periodNumber].add(entry.teacherId);
      }
    });

    const addMinutes = (timeStr: string, mins: number) => {
      const [h, m] = timeStr.split(':').map(Number);
      const totalMins = h * 60 + m + mins;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const isExpert = (teacher: any, subjectName: string) => {
      const expArray = teacher.subjectsExpertise || [];
      return expArray.some((exp: string) => 
        exp.toLowerCase().includes(subjectName.toLowerCase()) || 
        subjectName.toLowerCase().includes(exp.toLowerCase())
      );
    };

    const generatedEntries: any[] = [];

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];

      for (let p = 1; p <= periodsPerDay; p++) {
        const pStartTime = addMinutes(startTime, (p - 1) * durationMin);
        const pEndTime = addMinutes(pStartTime, durationMin);

        const subjectIndex = (dayIndex * periodsPerDay + (p - 1)) % subjects.length;
        let selectedSubject = subjects[subjectIndex];
        
        let teacherMatch = teachers.find(t => 
          selectedSubject.teacher && 
          t.firstName === selectedSubject.teacher.firstName && 
          t.lastName === selectedSubject.teacher.lastName
        );
        let assignedTeacherId = teacherMatch ? teacherMatch.id : (teachers[0]?.id || 'staff-1');
        let assignedTeacher = teachers.find(t => t.id === assignedTeacherId);

        const isBusy = assignedTeacherId ? busyMap[day][p].has(assignedTeacherId) : true;

        if (isBusy || !assignedTeacherId) {
          let backupTeacher = teachers.find(t => 
            t.id !== assignedTeacherId && 
            !busyMap[day][p].has(t.id) && 
            isExpert(t, selectedSubject.name)
          );

          if (backupTeacher) {
            assignedTeacherId = backupTeacher.id;
            assignedTeacher = backupTeacher;
          } else {
            let selfStudySubject = db.subjects.find((s: any) => s.classId === classId && s.name.toLowerCase() === 'self study');
            if (!selfStudySubject) {
              selfStudySubject = {
                id: 'SELF-STUDY-TEMP',
                name: 'Self Study',
                code: 'SELF-STUDY',
                classId,
                class: { name: 'Self Study' },
                teacher: { firstName: 'Supervisor', lastName: '' }
              };
            }
            selectedSubject = selfStudySubject;

            const freeTeacher = teachers.find(t => !busyMap[day][p].has(t.id));
            if (freeTeacher) {
              assignedTeacherId = freeTeacher.id;
              assignedTeacher = freeTeacher;
            } else {
              assignedTeacher = teachers[0];
              assignedTeacherId = teachers[0]?.id || 'staff-1';
            }
          }
        }

        if (assignedTeacherId) {
          busyMap[day][p].add(assignedTeacherId);
        }

        generatedEntries.push({
          dayOfWeek: day,
          periodNumber: p,
          startTime: pStartTime,
          endTime: pEndTime,
          subjectId: selectedSubject.id,
          subject: {
            id: selectedSubject.id,
            name: selectedSubject.name,
            code: selectedSubject.code,
          },
          teacherId: assignedTeacherId,
          teacher: {
            id: assignedTeacher?.id || '',
            firstName: assignedTeacher?.firstName || '',
            lastName: assignedTeacher?.lastName || '',
          }
        });
      }
    }

    return generatedEntries;
  }
}

export async function saveTimetableApi(classId: string, entries: any[]) {
  try {
    const res = await fetch(`${API_URL}/timetable/${classId}/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'API failed');
    }
    return await res.json();
  } catch (error: any) {
    console.warn('Backend save timetable offline, falling back to mock storage...');
    const db = getMockDb();
    
    for (const entry of entries) {
      const conflict = (db.timetable || []).find((e: any) => 
        e.classId !== classId && 
        e.dayOfWeek === entry.dayOfWeek && 
        e.periodNumber === parseInt(entry.periodNumber) && 
        e.teacherId === entry.teacherId
      );
      if (conflict) {
        const busyTeacher = db.staff.find((t: any) => t.id === entry.teacherId);
        const conflictClass = db.classes.find((c: any) => c.id === conflict.classId);
        throw new Error(
          `Conflict: Teacher ${busyTeacher?.firstName || 'Teacher'} is already assigned to ${conflictClass?.name || 'another class'} on ${entry.dayOfWeek} Period ${entry.periodNumber}`
        );
      }
    }

    if (!db.timetable) db.timetable = [];
    db.timetable = db.timetable.filter((e: any) => e.classId !== classId);
    
    entries.forEach((entry: any) => {
      let finalSubjectId = entry.subjectId;
      if (entry.subjectId === 'SELF-STUDY-TEMP') {
        let selfStudy = db.subjects.find((s: any) => s.classId === classId && s.name === 'Self Study');
        if (!selfStudy) {
          selfStudy = {
            id: `subj-self-study-${Date.now()}`,
            name: 'Self Study',
            code: 'SELF-STUDY',
            classId,
            class: db.classes.find((c: any) => c.id === classId) || { name: 'Class' },
            teacher: { firstName: entry.teacher.firstName, lastName: entry.teacher.lastName }
          };
          db.subjects.push(selfStudy);
        }
        finalSubjectId = selfStudy.id;
      }

      db.timetable.push({
        id: `t-entry-${Date.now()}-${Math.random()}`,
        classId,
        subjectId: finalSubjectId,
        teacherId: entry.teacherId,
        dayOfWeek: entry.dayOfWeek,
        periodNumber: parseInt(entry.periodNumber),
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    });
    
    saveMockDb(db);
    return { success: true };
  }
}

// ==========================================
// NEW MODULES — BRANCHES, SETTINGS, NOTIFICATIONS, PROMOTIONS
// ==========================================

export async function getBranchesApi() {
  try {
    const res = await fetch(`${API_URL}/branches`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!(db as any).branches) {
      (db as any).branches = [
        { id: 'branch-1', name: 'Delhi Public School Dwarka Campus', code: 'DPS-DWK', address: 'Sector 4, Dwarka', city: 'New Delhi', state: 'Delhi', pinCode: '110078', phone: '+91 11 25074472' }
      ];
      saveMockDb(db);
    }
    return (db as any).branches;
  }
}

export async function createBranchApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/branches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!(db as any).branches) (db as any).branches = [];
    const newBranch = {
      id: `branch-${Date.now()}`,
      name: data.name,
      code: data.code || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      pinCode: data.pinCode || null,
      phone: data.phone || null,
    };
    (db as any).branches.push(newBranch);
    saveMockDb(db);
    return newBranch;
  }
}

export async function getSettingsApi() {
  try {
    const res = await fetch(`${API_URL}/settings`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!(db as any).settings) {
      (db as any).settings = {
        academicYear: '2026-2027',
        gradingSystem: 'CBSE',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      };
      saveMockDb(db);
    }
    return (db as any).settings;
  }
}

export async function updateSettingsApi(data: any) {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    (db as any).settings = {
      ...(db as any).settings,
      ...data,
    };
    saveMockDb(db);
    return (db as any).settings;
  }
}

export async function getNotificationsApi() {
  try {
    const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if (!(db as any).notifications) {
      (db as any).notifications = [
        { id: 'notif-1', title: 'Welcome to AURXON ERP Lite', content: 'Your school management platform is ready. Dwarka main branch registered successfully.', isRead: false, createdAt: new Date().toISOString() }
      ];
      saveMockDb(db);
    }
    return (db as any).notifications;
  }
}

export async function markNotificationsReadApi() {
  try {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    if ((db as any).notifications) {
      (db as any).notifications = (db as any).notifications.map((n: any) => ({ ...n, isRead: true }));
      saveMockDb(db);
    }
    return { success: true };
  }
}


export async function getPromotionHistoryApi() {
  try {
    const res = await fetch(`${API_URL}/students/promotions/history`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    return (db as any).promotions || [];
  }
}

// ─────────────────────────────────────────────
// 01_Core & Auth Extensions
// ─────────────────────────────────────────────

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Change password failed');
  }
  return await res.json();
}

export async function getAuditLogsApi() {
  const res = await fetch(`${API_URL}/audit-logs`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return await res.json();
}

export async function getInstitutionApi() {
  const res = await fetch(`${API_URL}/institution`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch institution profile');
  return await res.json();
}

export async function updateInstitutionApi(data: any) {
  const res = await fetch(`${API_URL}/institution`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update institution');
  return await res.json();
}

export async function getRbacRolesApi() {
  const res = await fetch(`${API_URL}/rbac/roles`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch RBAC roles');
  return await res.json();
}

// ─────────────────────────────────────────────
// 02_Admission - Address Lookup & Parents
// ─────────────────────────────────────────────

export async function lookupPincodeApi(pin: string) {
  const res = await fetch(`${API_URL}/admission/address/pincode/${pin}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('PIN code lookup failed');
  return await res.json();
}

export async function getParentsApi(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_URL}/parents${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch parents');
  return await res.json();
}

export async function getParentApi(id: string) {
  const res = await fetch(`${API_URL}/parents/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch parent');
  return await res.json();
}

export async function createParentApi(data: any) {
  const res = await fetch(`${API_URL}/parents`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create parent');
  return await res.json();
}

export async function updateParentApi(id: string, data: any) {
  const res = await fetch(`${API_URL}/parents/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update parent');
  return await res.json();
}

export async function linkStudentToParentApi(parentId: string, studentId: string) {
  const res = await fetch(`${API_URL}/parents/${parentId}/link-student/${studentId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to link student');
  return await res.json();
}

export async function unlinkStudentFromParentApi(parentId: string, studentId: string) {
  const res = await fetch(`${API_URL}/parents/${parentId}/unlink-student/${studentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to unlink student');
  return await res.json();
}

// ─────────────────────────────────────────────
// 03_Academics - Academic Years & Subjects
// ─────────────────────────────────────────────

export async function getAcademicYearsApi() {
  const res = await fetch(`${API_URL}/academic-years`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch academic years');
  return await res.json();
}

export async function createAcademicYearApi(data: { name: string; startDate: string; endDate: string }) {
  const res = await fetch(`${API_URL}/academic-years`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create academic year');
  return await res.json();
}

export async function activateAcademicYearApi(id: string) {
  const res = await fetch(`${API_URL}/academic-years/${id}/activate`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to activate academic year');
  return await res.json();
}

export async function closeAcademicYearApi(id: string) {
  const res = await fetch(`${API_URL}/academic-years/${id}/close`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to close academic year');
  return await res.json();
}

export async function deleteAcademicYearApi(id: string) {
  const res = await fetch(`${API_URL}/academic-years/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete academic year');
  return await res.json();
}

export async function createSubjectApi(data: { name: string; code: string; classId: string; teacherId?: string }) {
  const res = await fetch(`${API_URL}/subjects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create subject');
  return await res.json();
}

export async function updateSubjectApi(id: string, data: any) {
  const res = await fetch(`${API_URL}/subjects/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update subject');
  return await res.json();
}

export async function deleteSubjectApi(id: string) {
  const res = await fetch(`${API_URL}/subjects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete subject');
  return await res.json();
}

// ─────────────────────────────────────────────
// 04_Attendance - Staff Attendance
// ─────────────────────────────────────────────

export async function getStaffAttendanceByDateApi(date: string) {
  const res = await fetch(`${API_URL}/staff-attendance/date/${date}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch staff attendance');
  return await res.json();
}

export async function getStaffAttendanceSummaryApi(staffId: string, month: number, year: number) {
  const res = await fetch(`${API_URL}/staff-attendance/summary/${staffId}?month=${month}&year=${year}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch staff attendance summary');
  return await res.json();
}

export async function recordStaffAttendanceApi(data: { staffId: string; status: string; clockIn?: string; clockOut?: string; remarks?: string; branchId?: string }) {
  const res = await fetch(`${API_URL}/staff-attendance/record`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to record staff attendance');
  return await res.json();
}

export async function bulkRecordStaffAttendanceApi(date: string, records: any[]) {
  const res = await fetch(`${API_URL}/staff-attendance/bulk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ date, records }),
  });
  if (!res.ok) throw new Error('Failed to bulk record staff attendance');
  return await res.json();
}

// ─────────────────────────────────────────────
// 07_Staff - Leaves
// ─────────────────────────────────────────────

export async function getLeaveBalancesApi(staffId: string) {
  const res = await fetch(`${API_URL}/leaves/balances/${staffId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch leave balances');
  return await res.json();
}

export async function createLeaveRequestApi(data: any) {
  const res = await fetch(`${API_URL}/leaves`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create leave request');
  return await res.json();
}

// ─────────────────────────────────────────────
// 05_Fees - Extended (Receipts & Concessions)
// ─────────────────────────────────────────────

export async function getFeeReceiptApi(paymentId: string) {
  const res = await fetch(`${API_URL}/fees/receipts/${paymentId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch fee receipt');
  return await res.json();
}

export async function getFeeConcessionsApi() {
  const res = await fetch(`${API_URL}/fees/concessions`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch fee concessions');
  return await res.json();
}

export async function createFeeConcessionApi(data: { allocationId: string; concessionType: string; amountWaived: number; justification?: string }) {
  const res = await fetch(`${API_URL}/fees/concessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to apply fee concession');
  return await res.json();
}

// ─────────────────────────────────────────────
// 09_Reports & 10_Analytics
// ─────────────────────────────────────────────

export async function getStudentRegisterReportApi(classId?: string, status?: string) {
  const params = new URLSearchParams();
  if (classId) params.append('classId', classId);
  if (status) params.append('status', status);
  const res = await fetch(`${API_URL}/reports/students?${params.toString()}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch student register report');
  return await res.json();
}

export async function getMonthlyAttendanceReportApi(classId: string, month: number, year: number) {
  const res = await fetch(`${API_URL}/reports/attendance/monthly?classId=${classId}&month=${month}&year=${year}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch monthly attendance report');
  return await res.json();
}

export async function getFeeDefaultersReportApi(classId?: string) {
  const query = classId ? `?classId=${classId}` : '';
  const res = await fetch(`${API_URL}/reports/fees/defaulters${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch fee defaulters report');
  return await res.json();
}

export async function getFeeCollectionSummaryReportApi() {
  const res = await fetch(`${API_URL}/reports/fees/collection-summary`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch fee collection summary report');
  return await res.json();
}

export async function getClassPerformanceReportApi(examId: string) {
  const res = await fetch(`${API_URL}/reports/exams/class-performance/${examId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch class performance report');
  return await res.json();
}

export async function getAtRiskStudentsAnalyticsApi() {
  const res = await fetch(`${API_URL}/reports/analytics/at-risk`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch at-risk students analytics');
  return await res.json();
}

export async function getAnalyticsDashboardApi() {
  const res = await fetch(`${API_URL}/reports/analytics/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch analytics dashboard');
  return await res.json();
}

// ─────────────────────────────────────────────
// 11_Documents / Certificates
// ─────────────────────────────────────────────

export async function getIssuedDocumentsApi(targetId?: string) {
  const query = targetId ? `?targetId=${targetId}` : '';
  const res = await fetch(`${API_URL}/certificates${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch certificates');
  return await res.json();
}

export async function issueCertificateApi(data: { docType: string; targetType: string; targetId: string; documentNumber: string }) {
  const res = await fetch(`${API_URL}/certificates`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to issue certificate');
  return await res.json();
}




