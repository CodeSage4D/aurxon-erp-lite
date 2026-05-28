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
    { id: 'class-1', name: 'Grade 10-A', section: 'A', studentCount: 2, classTeacher: 'Sarah Connor' },
    { id: 'class-2', name: 'Grade 11-A', section: 'A', studentCount: 1, classTeacher: 'John Keating' }
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
    { id: 'staff-1', employeeId: 'EMP001', firstName: 'Sarah', lastName: 'Connor', phone: '+1 555-0101', designation: 'TEACHER', joiningDate: '2024-08-15', salary: 4500, status: 'ACTIVE', user: { email: 'teacher1@aurxon.com', isActive: true } },
    { id: 'staff-2', employeeId: 'EMP002', firstName: 'John', lastName: 'Keating', phone: '+1 555-0102', designation: 'TEACHER', joiningDate: '2025-01-10', salary: 4800, status: 'ACTIVE', user: { email: 'teacher2@aurxon.com', isActive: true } },
    { id: 'staff-3', employeeId: 'EMP003', firstName: 'Robert', lastName: 'Kiyosaki', phone: '+1 555-0103', designation: 'ACCOUNTANT', joiningDate: '2024-09-01', salary: 4000, status: 'ACTIVE', user: { email: 'accountant@aurxon.com', isActive: true } }
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

export async function getLeavesApi(staffId?: string) {
  try {
    const query = staffId ? `?staffId=${staffId}` : '';
    const res = await fetch(`${API_URL}/staff/leaves${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    let list = db.leaves;
    if (staffId) list = list.filter(l => l.staffId === staffId || l.staff?.id === staffId);
    return list;
  }
}

export async function submitLeaveApi(startDate: string, endDate: string, reason: string) {
  try {
    const res = await fetch(`${API_URL}/staff/leaves`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ startDate, endDate, reason }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    const db = getMockDb();
    const userStr = localStorage.getItem('aurxon_user');
    const user = userStr ? JSON.parse(userStr) : { profileId: 'staff-1', profileName: 'Staff User' };
    
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
    const res = await fetch(`${API_URL}/staff/leaves/${leaveId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
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
