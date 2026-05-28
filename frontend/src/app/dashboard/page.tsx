'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getDashboardStatsApi,
  getStudentsApi,
  getStudentApi,
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
  getClassesApi,
  getSubjectsApi,
  getClassAttendanceApi,
  submitAttendanceApi,
  getStudentAttendanceSummaryApi,
  getFeesOverviewApi,
  getFeesAllocationsApi,
  payFeeApi,
  getFeesStructuresApi,
  createFeeStructureApi,
  getExamsApi,
  createExamApi,
  getExamResultsApi,
  submitExamResultsApi,
  getStudentReportApi,
  getStaffApi,
  createStaffApi,
  getLeavesApi,
  submitLeaveApi,
  approveLeaveApi,
  getNoticesApi,
  createNoticeApi,
  // Indian ERP Extensions
  getPinCodeDetails,
  promoteStudentsApi,
  getFinanceOverviewApi,
  getExpensesApi,
  createExpenseApi,
  deleteExpenseApi,
  getLessonPlansApi,
  createLessonPlanApi,
  updateLessonPlanApi,
  deleteLessonPlanApi,
} from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Briefcase,
  Megaphone,
  LogOut,
  Moon,
  Sun,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  
  // Roster lists
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  
  // Selection states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    classId: '',
    dateOfBirth: '2010-01-01',
    gender: 'MALE',
    
    // Indian Demographics & IDs
    aadhaarNumber: '',
    samagraId: '',
    familyId: '',
    penNumber: '',
    birthCertificateNumber: '',
    bloodGroup: '',
    religion: '',
    casteCategory: 'GENERAL',
    nationality: 'Indian',
    motherTongue: '',

    // Parents details
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    annualIncome: '',

    // Banking credentials
    bankName: '',
    accHolderName: '',
    accNumber: '',
    ifscCode: '',
    bankBranch: '',

    // Structured Address
    houseNo: '',
    street: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',

    // TC Migration
    prevSchoolName: '',
    tcNumber: '',
    migrationCertNo: ''
  });
  const [feeForm, setFeeForm] = useState({ name: '', amount: '', dueDate: '', description: '' });
  const [examForm, setExamForm] = useState({ name: '', subjectId: '', maxMarks: '100', examDate: '' });
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', employeeId: '', designation: 'TEACHER', role: 'TEACHER', salary: '', phone: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', roles: [] as string[] });
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

  // Indian Educational ERP state additions
  const [financeData, setFinanceData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'OPERATIONAL', paymentMethod: 'CASH' });
  
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', subjectId: '', syllabusPercent: 0 });

  const [promotionSelectedStudents, setPromotionSelectedStudents] = useState<string[]>([]);
  const [promotionTargetClassId, setPromotionTargetClassId] = useState('');

  // Sub-tabs
  const [feesTab, setFeesTab] = useState<'allocations' | 'history' | 'structures' | 'ledger'>('allocations');
  const [examsTab, setExamsTab] = useState<'list' | 'entry'>('list');
  const [staffTab, setStaffTab] = useState<'list' | 'leaves'>('list');

  // Attendance Sheet
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Exam Marks Entry
  const [selectedExamId, setSelectedExamId] = useState('');
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [examStudents, setExamStudents] = useState<any[]>([]);

  // Individual Student view (student/parent role)
  const [studentReport, setStudentReport] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any>(null);
  
  // Payment Modal
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; allocId: string; studentName: string; amountDue: number; method: string; remarks: string } | null>(null);

  // Success message toasts
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Initial Load & Auth check
  useEffect(() => {
    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(cached);
    setUser(parsed);
    
    // Adjust default starting menu based on role
    if (parsed.role === 'STUDENT' || parsed.role === 'PARENT') {
      setActiveMenu('student-portal');
    } else if (parsed.role === 'ACCOUNTANT') {
      setActiveMenu('fees');
    } else if (parsed.role === 'TEACHER') {
      setActiveMenu('attendance');
    } else {
      setActiveMenu('overview');
    }

    loadDashboardData(parsed);
  }, []);

  const loadDashboardData = async (currentUser: any) => {
    try {
      const classList = await getClassesApi();
      setClasses(classList);
      if (classList.length > 0) setSelectedClass(classList[0].id);

      if (currentUser.role === 'STUDENT' || currentUser.role === 'PARENT') {
        const profileId = currentUser.profileId || 'stud-1';
        const report = await getStudentReportApi(profileId);
        setStudentReport(report);
        const attend = await getStudentAttendanceSummaryApi(profileId);
        setStudentAttendance(attend);
      } else {
        const statsData = await getDashboardStatsApi();
        setStats(statsData);
      }

      const noticeList = await getNoticesApi();
      setNotices(noticeList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    router.push('/');
  };

  // 2. Fetch specific roster collections on tab switch
  useEffect(() => {
    if (!user) return;
    if (activeMenu === 'students') {
      loadStudents();
    } else if (activeMenu === 'staff' || activeMenu === 'overview') {
      loadStaff();
    } else if (activeMenu === 'attendance') {
      loadAttendanceGrid();
    } else if (activeMenu === 'fees') {
      loadFeesAllocations();
    } else if (activeMenu === 'exams') {
      loadExams();
    } else if (activeMenu === 'lessons') {
      loadLessonPlans();
    } else if (activeMenu === 'promotions') {
      loadStudents();
    }
  }, [activeMenu, selectedClass, feesTab, staffTab, examsTab]);

  const loadStudents = async () => {
    const list = await getStudentsApi(selectedClass || undefined, searchQuery || undefined);
    setStudents(list);
  };

  const loadStaff = async () => {
    const list = await getStaffApi();
    setStaff(list);
    const leaveList = await getLeavesApi();
    setLeaves(leaveList);
  };

  const loadExams = async () => {
    const list = await getExamsApi();
    const subs = await getSubjectsApi();
    setSubjectsList(subs);
    if (list.length > 0) setSelectedExamId(list[0].id);
  };

  // Attendance triggers
  const loadAttendanceGrid = async () => {
    if (!selectedClass) return;
    const grid = await getClassAttendanceApi(selectedClass, attendanceDate);
    setAttendanceRecords(grid);
  };

  const toggleAttendance = (studentId: string, status: string) => {
    setAttendanceRecords(prev =>
      prev.map(r => r.studentId === studentId ? { ...r, status } : r)
    );
  };

  const submitAttendance = async () => {
    await submitAttendanceApi(selectedClass, attendanceDate, attendanceRecords);
    triggerToast('Attendance register successfully saved!');
    loadDashboardData(user);
  };

  const loadFinanceOverview = async () => {
    try {
      const data = await getFinanceOverviewApi();
      setFinanceData(data);
      const expList = await getExpensesApi();
      setExpenses(expList);
    } catch (e) {
      console.error('Error loading finance details:', e);
    }
  };

  const loadLessonPlans = async () => {
    try {
      const plans = await getLessonPlansApi();
      setLessonPlans(plans);
    } catch (e) {
      console.error('Error loading lesson plans:', e);
    }
  };

  // Fee Desk Triggers
  const [feeAllocations, setFeeAllocations] = useState<any[]>([]);
  const [feeHistory, setFeeHistory] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);

  const loadFeesAllocations = async () => {
    if (feesTab === 'allocations') {
      const list = await getFeesAllocationsApi(selectedClass || undefined);
      setFeeAllocations(list);
    } else if (feesTab === 'history') {
      const history = await getFeesAllocationsApi(); // Mock returns payments history
      setFeeHistory(history);
    } else if (feesTab === 'structures') {
      const list = await getFeesStructuresApi();
      setFeeStructures(list);
    } else if (feesTab === 'ledger') {
      await loadFinanceOverview();
    }
  };

  const openPaymentModal = (alloc: any) => {
    setPaymentModal({
      open: true,
      allocId: alloc.id,
      studentName: `${alloc.student.firstName} ${alloc.student.lastName}`,
      amountDue: alloc.amountDue - alloc.amountPaid,
      method: 'CASH',
      remarks: '',
    });
  };

  const submitPayment = async () => {
    if (!paymentModal) return;
    await payFeeApi(paymentModal.allocId, paymentModal.amountDue, paymentModal.method, paymentModal.remarks);
    setPaymentModal(null);
    triggerToast('Payment transaction captured successfully! Receipt printed.');
    loadFeesAllocations();
    loadDashboardData(user);
  };

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFeeStructureApi(feeForm);
    setFeeForm({ name: '', amount: '', dueDate: '', description: '' });
    triggerToast('New Fee Structure created successfully!');
    loadFeesAllocations();
  };

  // Exam Marks triggers
  useEffect(() => {
    if (examsTab === 'entry' && selectedExamId) {
      loadExamResultsGrid();
    }
  }, [examsTab, selectedExamId]);

  const loadExamResultsGrid = async () => {
    const list = await getExamResultsApi(selectedExamId);
    setExamStudents(list);
  };

  const updateMarks = (studentId: string, val: string) => {
    setExamStudents(prev =>
      prev.map(r => r.studentId === studentId ? { ...r, marksObtained: parseFloat(val) || 0 } : r)
    );
  };

  const updateRemarks = (studentId: string, val: string) => {
    setExamStudents(prev =>
      prev.map(r => r.studentId === studentId ? { ...r, remarks: val } : r)
    );
  };

  const submitExamResults = async () => {
    await submitExamResultsApi(selectedExamId, examStudents);
    triggerToast('Exam marks sheets successfully updated!');
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExamApi(examForm);
    setExamForm({ name: '', subjectId: subjectsList[0]?.id || '', maxMarks: '100', examDate: '' });
    triggerToast('New Exam scheduled successfully!');
    loadExams();
  };

  // Student CRUD forms
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudentApi(studentForm);
    setStudentForm({
      firstName: '',
      lastName: '',
      email: '',
      rollNumber: '',
      classId: selectedClass,
      dateOfBirth: '2010-01-01',
      gender: 'MALE',
      aadhaarNumber: '',
      samagraId: '',
      familyId: '',
      penNumber: '',
      birthCertificateNumber: '',
      bloodGroup: '',
      religion: '',
      casteCategory: 'GENERAL',
      nationality: 'Indian',
      motherTongue: '',
      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      motherOccupation: '',
      annualIncome: '',
      bankName: '',
      accHolderName: '',
      accNumber: '',
      ifscCode: '',
      bankBranch: '',
      houseNo: '',
      street: '',
      city: '',
      district: '',
      state: '',
      pinCode: '',
      prevSchoolName: '',
      tcNumber: '',
      migrationCertNo: ''
    });
    triggerToast('Student enrolled successfully!');
    loadStudents();
    loadDashboardData(user);
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Are you sure you want to delete this student profile?')) {
      await deleteStudentApi(id);
      triggerToast('Student record deleted successfully.');
      loadStudents();
      loadDashboardData(user);
    }
  };

  // Staff creation
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStaffApi(staffForm);
    setStaffForm({ firstName: '', lastName: '', email: '', employeeId: '', designation: 'TEACHER', role: 'TEACHER', salary: '', phone: '' });
    triggerToast('Staff profile registered successfully!');
    loadStaff();
    loadDashboardData(user);
  };

  const handleApproveLeave = async (id: string, status: string) => {
    await approveLeaveApi(id, status);
    triggerToast(`Leave request ${status.toLowerCase()} successfully.`);
    loadStaff();
  };

  // Leave Submit
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLeaveApi(leaveForm.startDate, leaveForm.endDate, leaveForm.reason);
    setLeaveForm({ startDate: '', endDate: '', reason: '' });
    triggerToast('Leave application submitted to administration.');
    const list = await getLeavesApi(user.profileId);
    setLeaves(list);
  };

  // Broadcast notices
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const roles = noticeForm.roles.length > 0 ? noticeForm.roles : ['ALL'];
    await createNoticeApi(noticeForm.title, noticeForm.content, roles);
    setNoticeForm({ title: '', content: '', roles: [] });
    triggerToast('Announcement circular successfully posted!');
    const noticeList = await getNoticesApi();
    setNotices(noticeList);
    loadDashboardData(user);
  };

  const toggleNoticeRole = (role: string) => {
    setNoticeForm(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  // 3. Indian Educational ERP Actions
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpenseApi({
      title: expenseForm.title,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      paymentMethod: expenseForm.paymentMethod
    });
    setExpenseForm({ title: '', amount: '', category: 'OPERATIONAL', paymentMethod: 'CASH' });
    triggerToast('Expense ledger transaction created successfully!');
    await loadFinanceOverview();
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this operational expense record from accounting ledgers?')) {
      await deleteExpenseApi(id);
      triggerToast('Expense record deleted.');
      await loadFinanceOverview();
    }
  };

  const handleCreateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLessonPlanApi({
      title: lessonForm.title,
      content: lessonForm.content,
      subjectId: lessonForm.subjectId || subjectsList[0]?.id,
      syllabusPercent: lessonForm.syllabusPercent
    });
    setLessonForm({ title: '', content: '', subjectId: subjectsList[0]?.id || '', syllabusPercent: 0 });
    triggerToast('Academic lesson plan created successfully!');
    await loadLessonPlans();
  };

  const handleUpdateLessonPercent = async (id: string, status: string, percent: number) => {
    await updateLessonPlanApi(id, { status, syllabusPercent: percent });
    triggerToast('Lesson syllabus progress updated.');
    await loadLessonPlans();
  };

  const handleDeleteLessonPlan = async (id: string) => {
    if (confirm('Delete this academic lesson plan?')) {
      await deleteLessonPlanApi(id);
      triggerToast('Lesson plan deleted.');
      await loadLessonPlans();
    }
  };

  const handlePromoteStudents = async () => {
    if (promotionSelectedStudents.length === 0) {
      alert('Please select at least one student for class promotion.');
      return;
    }
    if (!promotionTargetClassId) {
      alert('Please select a target class for promotion.');
      return;
    }
    const result = await promoteStudentsApi(promotionSelectedStudents, promotionTargetClassId);
    setPromotionSelectedStudents([]);
    triggerToast(`Bulk Academic Promotion complete! Promoted ${result.count} students.`);
    setActiveMenu('students');
  };

  if (!user) return <div className="p-8 text-center text-zinc-500">Checking auth token credentials...</div>;

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      
      {/* Dynamic Success Toast */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. NOTION-LIKE SIDEBAR */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900 md:flex">
        
        {/* Branch / Institute Brand branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold">
            A
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight truncate">{user.institutionName}</h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Lite ERP</p>
          </div>
        </div>

        {/* User Card badge */}
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 transition dark:bg-zinc-950/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600">
            {user.profileName.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold truncate">{user.profileName}</h4>
            <p className="text-[9px] font-medium text-zinc-400 uppercase">{user.role}</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="mt-8 flex-1 space-y-1">
          {/* Admin options */}
          {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN') && (
            <>
              <button
                onClick={() => setActiveMenu('overview')}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'overview' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setActiveMenu('students')}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'students' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
              >
                <Users className="h-4 w-4" />
                <span>Student Management</span>
              </button>

              <button
                onClick={() => setActiveMenu('staff')}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'staff' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Staff & HR Records</span>
              </button>
            </>
          )}

          {/* Teacher and Admin options */}
          {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'TEACHER') && (
            <>
              <button
                onClick={() => setActiveMenu('attendance')}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'attendance' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Daily Attendance</span>
              </button>
              
              <button
                onClick={() => setActiveMenu('lessons')}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'lessons' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Syllabus & Lessons</span>
              </button>
            </>
          )}

          {/* Accountant and Admin options */}
          {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'ACCOUNTANT') && (
            <button
              onClick={() => setActiveMenu('fees')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'fees' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Financials & Fees</span>
            </button>
          )}

          {/* Academic bulk promotion - admin only */}
          {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN') && (
            <button
              onClick={() => setActiveMenu('promotions')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'promotions' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Year-End Promotions</span>
            </button>
          )}

          {/* Exam options */}
          {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'TEACHER') && (
            <button
              onClick={() => setActiveMenu('exams')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'exams' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Exams & Grading</span>
            </button>
          )}

          {/* Student Portal for students and parents */}
          {(user.role === 'STUDENT' || user.role === 'PARENT') && (
            <button
              onClick={() => setActiveMenu('student-portal')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'student-portal' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student Profile Desk</span>
            </button>
          )}

          {/* Notices */}
          <button
            onClick={() => setActiveMenu('notices')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeMenu === 'notices' ? 'bg-sky-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'}`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Circular Alerts</span>
          </button>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. DYNAMIC CONTENT MAIN AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Dynamic header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8 dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">AURXON</span>
            <ChevronRight className="h-3 w-3 text-zinc-400" />
            <span className="text-xs font-bold capitalize text-sky-600 dark:text-sky-400">{activeMenu.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Display simple color branding */}
            <span className="text-xs font-medium text-zinc-400">Institutional Color:</span>
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: user.primaryColor || '#0284c7' }}
            />

            <button
              onClick={() => {
                const root = document.documentElement;
                root.classList.toggle('dark');
              }}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-800"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
          </div>
        </header>

        {/* 3. PANELS SECTION */}
        <div className="flex-1 p-8 space-y-8">

          {/* 3A. OVERVIEW PANEL */}
          {activeMenu === 'overview' && stats && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Core metrics cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Students Enrolled</span>
                    <Users className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold tracking-tight">{stats.studentCount}</h3>
                  <p className="mt-2 text-xs text-zinc-400">Active roster database size</p>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Staff Count</span>
                    <Briefcase className="h-5 w-5 text-violet-500" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold tracking-tight">{stats.staffCount}</h3>
                  <p className="mt-2 text-xs text-zinc-400">Teachers, accountants, admins</p>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fees Collection</span>
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold tracking-tight">${stats.feeOverview?.totalPaid}</h3>
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{stats.feeOverview?.collectionRate}% collected (${stats.feeOverview?.totalPending} pending)</p>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Attendance Rate</span>
                    <Percent className="h-5 w-5 text-cyan-500" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold tracking-tight">{stats.attendanceRate}%</h3>
                  <p className="mt-2 text-xs text-zinc-400">Average over past 7 school days</p>
                </div>
              </div>

              {/* Grid panel */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Enrolls per class */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400">Enrolled Batches / Classes</h4>
                  <div className="mt-6 space-y-4">
                    {stats.classes?.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-xs font-bold text-sky-600">
                            {c.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{c.name}</p>
                            <p className="text-[10px] text-zinc-400">Section {c.section || 'A'} • Head Teacher: {c.classTeacher || 'Assigned'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                            {c.studentCount} Students
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Predictions & Risk Alerts */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-sky-600 dark:text-sky-400">AI Predictive Risk Alerts</h4>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600">Active ML</span>
                  </div>
                  
                  <div className="mt-4 space-y-3.5 text-[11px] leading-relaxed">
                    {/* Attendance Risk */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-700 dark:text-rose-400">⚠️ Attendance Alert</span>
                        <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/40">Critical Risk</span>
                      </div>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Bob Johnson (Roll: 10A02) has 66% attendance.</p>
                      <p className="text-[10px] text-zinc-400 mt-1">AI Recommendation: Parent warning & remedial support.</p>
                    </div>

                    {/* Academic Performance Risk */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-700 dark:text-amber-400">📝 Academic Warning</span>
                        <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/40">Moderate Risk</span>
                      </div>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Charlie Brown (Roll: 11A01) scored 42% in Algebra.</p>
                      <p className="text-[10px] text-zinc-400 mt-1">AI Recommendation: Schedule math tutorials.</p>
                    </div>

                    {/* High Performer Eligibility */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">✨ Promotion Predictor</span>
                        <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 font-mono">Eligible</span>
                      </div>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Alice Miller: 94% marks average, 100% attendance.</p>
                      <p className="text-[10px] text-zinc-400 mt-1">AI Recommendation: Ready for Grade 11 promotion.</p>
                    </div>
                  </div>
                </div>

                {/* Circular announcements */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400">Circular Alerts</h4>
                  <div className="mt-6 space-y-4">
                    {stats.recentNotices?.map((notice: any) => (
                      <div key={notice.id} className="rounded-xl border border-zinc-200 p-4 transition hover:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950/20">
                        <h5 className="text-xs font-bold text-sky-600">{notice.title}</h5>
                        <p className="mt-2 text-[10px] text-zinc-500 leading-relaxed truncate">{notice.content}</p>
                        <div className="mt-3 flex items-center justify-between text-[9px] text-zinc-400">
                          <span>By {notice.authorName}</span>
                          <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* 3B. STUDENT MANAGEMENT PANEL */}
          {activeMenu === 'students' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Filter headers */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Batch Filter:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Search */}
                <div className="relative max-w-xs flex-1">
                  <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name or roll..."
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pr-4 pl-9 text-xs outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
                <button
                  onClick={loadStudents}
                  className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Apply Search
                </button>
              </div>

              {/* Grid content */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Enrolled Students list table */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 lg:col-span-2 overflow-x-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400">Class Roster Grid</h4>
                    <span className="text-xs text-zinc-500 font-semibold">{students.length} Registered</span>
                  </div>

                  <table className="w-full mt-4 text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                        <th className="pb-3 font-semibold uppercase">Roll No</th>
                        <th className="pb-3 font-semibold uppercase">Full Name</th>
                        <th className="pb-3 font-semibold uppercase">Gender</th>
                        <th className="pb-3 font-semibold uppercase">Parent / Phone</th>
                        <th className="pb-3 text-right font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                          <td className="py-3.5 font-bold text-indigo-500">{student.rollNumber}</td>
                          <td className="py-3.5 font-semibold">
                            <button
                              onClick={async () => {
                                const details = await getStudentApi(student.id);
                                setSelectedStudent(details);
                              }}
                              className="hover:underline text-left"
                            >
                              {student.firstName} {student.lastName}
                            </button>
                          </td>
                          <td className="py-3.5 text-zinc-400 capitalize">{student.gender.toLowerCase()}</td>
                          <td className="py-3.5">
                            <p className="font-semibold">{student.parent?.firstName} {student.parent?.lastName}</p>
                            <p className="text-[10px] text-zinc-400">{student.parent?.phone || 'No phone'}</p>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create Student Form */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Enroll New Student</h4>
                  <form onSubmit={handleCreateStudent} className="mt-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
                    {/* SECTION 1: Core Details */}
                    <div>
                      <h5 className="font-bold text-sky-600 dark:text-sky-400 uppercase text-[10px] tracking-wider mb-2">1. Academic & Core Details</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-zinc-400">First Name</label>
                          <input
                            type="text"
                            required
                            value={studentForm.firstName}
                            onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Last Name</label>
                          <input
                            type="text"
                            required
                            value={studentForm.lastName}
                            onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Email Address (Login ID)</label>
                          <input
                            type="email"
                            required
                            value={studentForm.email}
                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                            placeholder="student@aurxon.com"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Gender</label>
                          <select
                            value={studentForm.gender}
                            onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Class Allocation</label>
                          <select
                            value={studentForm.classId}
                            onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                            required
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="">Select Class...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Roll Number</label>
                          <input
                            type="text"
                            required
                            value={studentForm.rollNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                            placeholder="e.g. ROLL-10A-04"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Indian Identities */}
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4">
                      <h5 className="font-bold text-sky-600 dark:text-sky-400 uppercase text-[10px] tracking-wider mb-2">2. Indian Demographics & IDs</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-zinc-400">Aadhaar Card No.</label>
                          <input
                            type="text"
                            maxLength={12}
                            value={studentForm.aadhaarNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, aadhaarNumber: e.target.value })}
                            placeholder="12-digit Aadhaar Number"
                            className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none bg-zinc-50 dark:bg-zinc-950 ${studentForm.aadhaarNumber && !/^\d{12}$/.test(studentForm.aadhaarNumber) ? 'border-amber-500 focus:border-amber-500' : 'border-zinc-200 focus:border-sky-600 dark:border-zinc-800'}`}
                          />
                          {studentForm.aadhaarNumber && !/^\d{12}$/.test(studentForm.aadhaarNumber) && (
                            <p className="text-[10px] text-amber-500 mt-1">Must be exactly 12 numeric digits</p>
                          )}
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Samagra ID (SSSMID)</label>
                          <input
                            type="text"
                            maxLength={9}
                            value={studentForm.samagraId}
                            onChange={(e) => setStudentForm({ ...studentForm, samagraId: e.target.value })}
                            placeholder="9-digit Student ID"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Caste Category</label>
                          <select
                            value={studentForm.casteCategory}
                            onChange={(e) => setStudentForm({ ...studentForm, casteCategory: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="GENERAL">GENERAL</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Mother Tongue</label>
                          <input
                            type="text"
                            value={studentForm.motherTongue}
                            onChange={(e) => setStudentForm({ ...studentForm, motherTongue: e.target.value })}
                            placeholder="e.g. Hindi, Tamil, Punjabi"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Parents & Banking */}
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4">
                      <h5 className="font-bold text-sky-600 dark:text-sky-400 uppercase text-[10px] tracking-wider mb-2">3. Parentage & Finance</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-zinc-400">Father's Name</label>
                          <input
                            type="text"
                            value={studentForm.fatherName}
                            onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Mother's Name</label>
                          <input
                            type="text"
                            value={studentForm.motherName}
                            onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Annual Family Income (₹)</label>
                          <input
                            type="number"
                            value={studentForm.annualIncome}
                            onChange={(e) => setStudentForm({ ...studentForm, annualIncome: e.target.value })}
                            placeholder="e.g. 450000"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Bank Name</label>
                          <input
                            type="text"
                            value={studentForm.bankName}
                            onChange={(e) => setStudentForm({ ...studentForm, bankName: e.target.value })}
                            placeholder="e.g. State Bank of India"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Account Number</label>
                          <input
                            type="text"
                            value={studentForm.accNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, accNumber: e.target.value })}
                            placeholder="11 to 16 digit account"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Bank IFSC Code</label>
                          <input
                            type="text"
                            maxLength={11}
                            value={studentForm.ifscCode}
                            onChange={(e) => setStudentForm({ ...studentForm, ifscCode: e.target.value })}
                            placeholder="e.g. SBIN0004520"
                            className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none bg-zinc-50 dark:bg-zinc-950 ${studentForm.ifscCode && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(studentForm.ifscCode) ? 'border-amber-500 focus:border-amber-500' : 'border-zinc-200 focus:border-sky-600 dark:border-zinc-800'}`}
                          />
                          {studentForm.ifscCode && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(studentForm.ifscCode) && (
                            <p className="text-[10px] text-amber-500 mt-1">IFSC must match RBI layout (e.g. HDFC0001234)</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Address Details */}
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4">
                      <h5 className="font-bold text-sky-600 dark:text-sky-400 uppercase text-[10px] tracking-wider mb-2">4. Address & PIN Autofill</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-zinc-400">PIN Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={studentForm.pinCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              const details = getPinCodeDetails(val);
                              setStudentForm(prev => ({
                                ...prev,
                                pinCode: val,
                                ...(details ? { state: details.state, district: details.district, city: details.district } : {})
                              }));
                            }}
                            placeholder="e.g. 452001"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950 font-mono"
                          />
                          {studentForm.pinCode && studentForm.pinCode.length === 6 && getPinCodeDetails(studentForm.pinCode) && (
                            <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Location autofilled successfully</p>
                          )}
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">District</label>
                          <input
                            type="text"
                            value={studentForm.district}
                            onChange={(e) => setStudentForm({ ...studentForm, district: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">State</label>
                          <input
                            type="text"
                            value={studentForm.state}
                            onChange={(e) => setStudentForm({ ...studentForm, state: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">House No & Street</label>
                          <input
                            type="text"
                            value={studentForm.street}
                            onChange={(e) => setStudentForm({ ...studentForm, street: e.target.value })}
                            placeholder="e.g. 104, Royal Palace Apartment"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-500 mt-6"
                    >
                      Enlist Student
                    </button>
                  </form>
                </div>
              </div>

              {/* Student detail slide-over modal */}
              {selectedStudent && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
                  <div className="w-full max-w-lg bg-white p-8 shadow-2xl dark:bg-zinc-900 overflow-y-auto animate-in slide-in-from-right duration-200">
                    <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <h3 className="text-lg font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                        <p className="text-xs text-indigo-500 font-semibold">{selectedStudent.rollNumber} • {selectedStudent.class?.name}</p>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Timeline and fee status */}
                    <div className="mt-8 space-y-6 text-xs">
                      <div>
                        <h4 className="font-bold text-zinc-400 uppercase tracking-wide">Parent Information</h4>
                        <div className="mt-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950/40">
                          <p className="font-semibold">{selectedStudent.parent?.firstName} {selectedStudent.parent?.lastName}</p>
                          <p className="text-zinc-500">Phone: {selectedStudent.parent?.phone}</p>
                          <p className="text-zinc-500">Occupation: {selectedStudent.parent?.occupation || 'Not defined'}</p>
                          <p className="text-zinc-500">Address: {selectedStudent.parent?.address || 'Not defined'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-400 uppercase tracking-wide">Admission Timeline Milestones</h4>
                        <div className="mt-3 space-y-3">
                          {selectedStudent.timeline?.map((event: any) => (
                            <div key={event.id} className="flex gap-3">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                                <Clock className="h-3 w-3" />
                              </div>
                              <div>
                                <p className="font-semibold">{event.description}</p>
                                <p className="text-[10px] text-zinc-400">{new Date(event.eventDate).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-400 uppercase tracking-wide">Fees Structure Status</h4>
                        <div className="mt-3 space-y-2">
                          {selectedStudent.feeAllocations?.map((alloc: any) => (
                            <div key={alloc.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">
                              <div>
                                <p className="font-semibold">{alloc.feeStructure?.name}</p>
                                <p className="text-[10px] text-zinc-400">Due Date: {new Date(alloc.feeStructure?.dueDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">${alloc.amountPaid} / ${alloc.amountDue}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${alloc.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : alloc.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {alloc.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* 3C. ATTENDANCE PANEL */}
          {activeMenu === 'attendance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 uppercase">Batch Class:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 uppercase">Date:</span>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <button
                  onClick={loadAttendanceGrid}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Load Attendance Grid
                </button>
              </div>

              {/* Roster sheet */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-x-auto">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400">Class Roll Call Registry</h4>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Present: {attendanceRecords.filter(r => r.status === 'PRESENT').length}</span>
                    <span>Absent: {attendanceRecords.filter(r => r.status === 'ABSENT').length}</span>
                  </div>
                </div>

                {attendanceRecords.length === 0 ? (
                  <p className="mt-8 text-center text-xs text-zinc-400">Click Load Attendance Grid to view class roll call.</p>
                ) : (
                  <>
                    <table className="w-full mt-4 text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                          <th className="pb-3 font-semibold uppercase">Roll No</th>
                          <th className="pb-3 font-semibold uppercase">Student Name</th>
                          <th className="pb-3 font-semibold uppercase">Status Selector</th>
                          <th className="pb-3 font-semibold uppercase">Remarks / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                        {attendanceRecords.map((record) => (
                          <tr key={record.studentId}>
                            <td className="py-3 font-bold text-indigo-500">{record.rollNumber}</td>
                            <td className="py-3 font-semibold">{record.firstName} {record.lastName}</td>
                            <td className="py-3">
                              <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-950">
                                <button
                                  onClick={() => toggleAttendance(record.studentId, 'PRESENT')}
                                  className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${record.status === 'PRESENT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => toggleAttendance(record.studentId, 'ABSENT')}
                                  className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${record.status === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                                >
                                  Absent
                                </button>
                                <button
                                  onClick={() => toggleAttendance(record.studentId, 'LATE')}
                                  className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${record.status === 'LATE' ? 'bg-amber-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                                >
                                  Late
                                </button>
                              </div>
                            </td>
                            <td className="py-3">
                              <input
                                type="text"
                                value={record.remarks}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAttendanceRecords(prev =>
                                    prev.map(r => r.studentId === record.studentId ? { ...r, remarks: val } : r)
                                  );
                                }}
                                placeholder="Add notes (e.g. sick leave)..."
                                className="w-full max-w-xs rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                      <button
                        onClick={submitAttendance}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                      >
                        Submit Daily Register
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}


          {/* 3D. FEES PANEL */}
          {activeMenu === 'fees' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Fee Desk navigation */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setFeesTab('allocations')}
                  className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${feesTab === 'allocations' ? 'border-sky-600 text-sky-600' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                  Student Fee Allocations
                </button>
                <button
                  onClick={() => setFeesTab('structures')}
                  className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${feesTab === 'structures' ? 'border-sky-600 text-sky-600' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                  Create Fee Structures
                </button>
                {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'ACCOUNTANT') && (
                  <button
                    onClick={() => setFeesTab('ledger')}
                    className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${feesTab === 'ledger' ? 'border-sky-600 text-sky-600' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                  >
                    Financial P&L Ledger
                  </button>
                )}
              </div>

              {/* Allocations view */}
              {feesTab === 'allocations' && (
                <div className="space-y-6">
                  
                  {/* Select class filter */}
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Class filter:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <option value="">All Batches...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button
                      onClick={loadFeesAllocations}
                      className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Filter List
                    </button>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-x-auto">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Fees Allocation desk</h4>
                    <table className="w-full mt-4 text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                          <th className="pb-3 font-semibold uppercase">Student Name</th>
                          <th className="pb-3 font-semibold uppercase">Roll No</th>
                          <th className="pb-3 font-semibold uppercase">Structure Term</th>
                          <th className="pb-3 font-semibold uppercase">Amount Due</th>
                          <th className="pb-3 font-semibold uppercase">Amount Paid</th>
                          <th className="pb-3 font-semibold uppercase">Status</th>
                          <th className="pb-3 text-right font-semibold uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                        {feeAllocations.map((alloc) => (
                          <tr key={alloc.id}>
                            <td className="py-3 font-semibold">{alloc.student?.firstName} {alloc.student?.lastName}</td>
                            <td className="py-3 text-zinc-500 font-medium">{alloc.student?.rollNumber}</td>
                            <td className="py-3 font-semibold text-indigo-500">{alloc.feeStructure?.name}</td>
                            <td className="py-3 font-bold">${alloc.amountDue}</td>
                            <td className="py-3 font-bold">${alloc.amountPaid}</td>
                            <td className="py-3">
                              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${alloc.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : alloc.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {alloc.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {alloc.status !== 'PAID' && (
                                <button
                                  onClick={() => openPaymentModal(alloc)}
                                  className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-500 shadow-sm"
                                >
                                  Collect Fee
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Create structure view */}
              {feesTab === 'structures' && (
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Establish Fee structure</h4>
                    <form onSubmit={handleCreateFeeStructure} className="mt-6 space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-zinc-400">Structure Name</label>
                        <input
                          type="text"
                          required
                          value={feeForm.name}
                          onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                          placeholder="e.g. Annual Tuition Term 2"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Amount ($)</label>
                        <input
                          type="number"
                          required
                          value={feeForm.amount}
                          onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                          placeholder="e.g. 1500"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Due Date</label>
                        <input
                          type="date"
                          required
                          value={feeForm.dueDate}
                          onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Description</label>
                        <textarea
                          value={feeForm.description}
                          onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 h-24"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-indigo-500"
                      >
                        Create Fee Template
                      </button>
                    </form>
                  </div>

                  {/* Allocated lists */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Fee templates overview</h4>
                    <div className="mt-6 space-y-3">
                      {feeStructures.map(f => (
                        <div key={f.id} className="flex justify-between rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40 text-xs">
                          <div>
                            <p className="font-bold text-indigo-500">{f.name}</p>
                            <p className="text-zinc-400 mt-1">{f.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">${f.amount}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">Due {new Date(f.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Ledger view */}
              {feesTab === 'ledger' && financeData && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Ledger Metrics Cards */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue (Collections)</span>
                      <h3 className="mt-2 text-2xl font-bold text-emerald-600">₹{financeData.totalRevenue?.toLocaleString('en-IN')}</h3>
                      <p className="mt-1 text-[10px] text-zinc-400">Fee collections logged</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Staff Salaries Payout</span>
                      <h3 className="mt-2 text-2xl font-bold text-amber-600">₹{financeData.totalSalaries?.toLocaleString('en-IN')}</h3>
                      <p className="mt-1 text-[10px] text-zinc-400">Monthly base salary totals</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Operational Expenses</span>
                      <h3 className="mt-2 text-2xl font-bold text-rose-600">₹{financeData.totalExpenses?.toLocaleString('en-IN')}</h3>
                      <p className="mt-1 text-[10px] text-zinc-400">Utility, infrastructure, affiliation costs</p>
                    </div>
                    <div className={`rounded-2xl border p-6 shadow-sm ${financeData.netProfit >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Net Operational Balance (P&L)</span>
                      <h3 className={`mt-2 text-2xl font-bold ${financeData.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{financeData.netProfit?.toLocaleString('en-IN')}
                      </h3>
                      <p className="mt-1 text-[10px] text-zinc-400">Margin: {financeData.profitMargin}%</p>
                    </div>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-3">
                    {/* Log Expense Form */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <h4 className="text-xs font-bold tracking-tight uppercase text-zinc-400 pb-3 border-b border-zinc-200 dark:border-zinc-800">Log Operational Cost</h4>
                      <form onSubmit={handleCreateExpense} className="mt-4 space-y-4 text-xs">
                        <div>
                          <label className="block font-semibold text-zinc-400">Expense Title</label>
                          <input
                            type="text"
                            required
                            value={expenseForm.title}
                            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                            placeholder="e.g. CBSE Syllabus Booklets"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Amount (₹)</label>
                          <input
                            type="number"
                            required
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            placeholder="e.g. 15000"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Category</label>
                          <select
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="ACADEMIC">Academic / Syllabus</option>
                            <option value="UTILITY">Utility (Broadband, Water, Electric)</option>
                            <option value="OPERATIONAL">Operational Office Costs</option>
                            <option value="MAINTENANCE">Maintenance & Construction</option>
                            <option value="SALARY">Salary / Stipends</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Payment Channel</label>
                          <select
                            value={expenseForm.paymentMethod}
                            onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="CASH">Cash Drawer</option>
                            <option value="BANK_TRANSFER">Bank Net-banking / RTGS</option>
                            <option value="ONLINE">Corporate Card</option>
                            <option value="UPI">Unified Payments Interface (UPI)</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-500"
                        >
                          Commit Transaction
                        </button>
                      </form>
                    </div>

                    {/* Expense Register List */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 lg:col-span-2 overflow-x-auto">
                      <h4 className="text-xs font-bold tracking-tight uppercase text-zinc-400 pb-3 border-b border-zinc-200 dark:border-zinc-800">Operational Expense Register</h4>
                      <table className="w-full mt-4 text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                            <th className="pb-2 font-semibold uppercase">Date</th>
                            <th className="pb-2 font-semibold uppercase">Expense Particulars</th>
                            <th className="pb-2 font-semibold uppercase">Category</th>
                            <th className="pb-2 font-semibold uppercase">Channel</th>
                            <th className="pb-2 text-right font-semibold uppercase">Amount</th>
                            <th className="pb-2 text-right font-semibold uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                          {expenses.map((exp) => (
                            <tr key={exp.id}>
                              <td className="py-2.5 text-zinc-400">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                              <td className="py-2.5 font-semibold">{exp.title}</td>
                              <td className="py-2.5">
                                <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                                  {exp.category}
                                </span>
                              </td>
                              <td className="py-2.5 font-medium text-zinc-500 uppercase">{exp.paymentMethod}</td>
                              <td className="py-2.5 text-right font-bold text-rose-500">₹{exp.amount?.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 text-right">
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="text-zinc-400 hover:text-red-500 rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* 3E. EXAMINATION PANEL */}
          {activeMenu === 'exams' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setExamsTab('list')}
                  className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${examsTab === 'list' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                  Scheduled Exams
                </button>
                <button
                  onClick={() => setExamsTab('entry')}
                  className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${examsTab === 'entry' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                  Marks Entry Desk
                </button>
              </div>

              {/* List tab */}
              {examsTab === 'list' && (
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Schedule new exam</h4>
                    <form onSubmit={handleCreateExam} className="mt-6 space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-zinc-400">Exam Title</label>
                        <input
                          type="text"
                          required
                          value={examForm.name}
                          onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                          placeholder="e.g. Mid-Term Geometry Quiz"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Subject Course</label>
                        <select
                          value={examForm.subjectId}
                          onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <option value="">Select Subject...</option>
                          {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Max Score Marks</label>
                        <input
                          type="number"
                          required
                          value={examForm.maxMarks}
                          onChange={(e) => setExamForm({ ...examForm, maxMarks: e.target.value })}
                          placeholder="100"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Exam Date</label>
                        <input
                          type="date"
                          required
                          value={examForm.examDate}
                          onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-indigo-500"
                      >
                        Schedule Exam
                      </button>
                    </form>
                  </div>

                  {/* Active exams schedule */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-x-auto">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Current active exams</h4>
                    <div className="mt-6 space-y-3">
                      {examsList.map(e => (
                        <div key={e.id} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-indigo-500">{e.name}</span>
                            <span>Max Marks: {e.maxMarks}</span>
                          </div>
                          <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
                            <span>Course: {e.subject?.name} ({e.subject?.class?.name})</span>
                            <span>Date: {new Date(e.examDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Marks entry sheet */}
              {examsTab === 'entry' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40 text-xs font-semibold">
                    <span className="text-zinc-400 uppercase">Select Exam Paper:</span>
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {examsList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-x-auto">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Grades Evaluation sheet</h4>
                    {examStudents.length === 0 ? (
                      <p className="mt-8 text-center text-xs text-zinc-400">Select an exam paper to edit student scores.</p>
                    ) : (
                      <>
                        <table className="w-full mt-4 text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                              <th className="pb-3 font-semibold uppercase">Roll No</th>
                              <th className="pb-3 font-semibold uppercase">Student Name</th>
                              <th className="pb-3 font-semibold uppercase">Marks Obtained</th>
                              <th className="pb-3 font-semibold uppercase">Auditor Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                            {examStudents.map((record) => (
                              <tr key={record.studentId}>
                                <td className="py-3 font-bold text-indigo-500">{record.rollNumber}</td>
                                <td className="py-3 font-semibold">{record.firstName} {record.lastName}</td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    value={record.marksObtained}
                                    onChange={(e) => updateMarks(record.studentId, e.target.value)}
                                    placeholder="0"
                                    className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="text"
                                    value={record.remarks}
                                    onChange={(e) => updateRemarks(record.studentId, e.target.value)}
                                    placeholder="Outstanding performance..."
                                    className="w-full max-w-sm rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                          <button
                            onClick={submitExamResults}
                            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                          >
                            Submit Scoresheet
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* 3F. STAFF & HR PANEL */}
          {activeMenu === 'staff' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setStaffTab('list')}
                  className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${staffTab === 'list' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                  Employee Directory
                </button>
                <button
                  onClick={() => setStaffTab('leaves')}
                  className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${staffTab === 'leaves' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                  Leave Requests
                </button>
              </div>

              {/* Directory list */}
              {staffTab === 'list' && (
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 lg:col-span-2 overflow-x-auto">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Institutional Employees roster</h4>
                    <table className="w-full mt-4 text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                          <th className="pb-3 font-semibold uppercase">ID</th>
                          <th className="pb-3 font-semibold uppercase">Staff Name</th>
                          <th className="pb-3 font-semibold uppercase">Designation</th>
                          <th className="pb-3 font-semibold uppercase">Phone</th>
                          <th className="pb-3 font-semibold uppercase">Joining Date</th>
                          <th className="pb-3 text-right font-semibold uppercase">Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                        {staff.map((employee) => (
                          <tr key={employee.id}>
                            <td className="py-3 font-bold text-indigo-500">{employee.employeeId}</td>
                            <td className="py-3 font-semibold">{employee.firstName} {employee.lastName}</td>
                            <td className="py-3">
                              <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                {employee.designation}
                              </span>
                            </td>
                            <td className="py-3 text-zinc-500">{employee.phone}</td>
                            <td className="py-3 text-zinc-400">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                            <td className="py-3 text-right font-bold">${employee.salary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Staff form */}
                  {user.role === 'INSTITUTE_ADMIN' && (
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Register Staff Member</h4>
                      <form onSubmit={handleCreateStaff} className="mt-6 space-y-4 text-xs">
                        <div>
                          <label className="block font-semibold text-zinc-400">First Name</label>
                          <input
                            type="text"
                            required
                            value={staffForm.firstName}
                            onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Last Name</label>
                          <input
                            type="text"
                            required
                            value={staffForm.lastName}
                            onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Email Address (Login ID)</label>
                          <input
                            type="email"
                            required
                            value={staffForm.email}
                            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Employee ID Code</label>
                          <input
                            type="text"
                            required
                            value={staffForm.employeeId}
                            onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                            placeholder="e.g. EMP004"
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Department Role</label>
                          <select
                            value={staffForm.designation}
                            onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value, role: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="TEACHER">Teacher / Academic Staff</option>
                            <option value="ACCOUNTANT">Accountant / Treasurer</option>
                            <option value="STAFF">Office Assistant</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-400">Base Salary ($)</label>
                          <input
                            type="number"
                            required
                            value={staffForm.salary}
                            onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-indigo-500"
                        >
                          Enlist Employee
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Leaves review */}
              {staffTab === 'leaves' && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-x-auto">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Leave applications board</h4>
                  <table className="w-full mt-4 text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                        <th className="pb-3 font-semibold uppercase">Staff Member</th>
                        <th className="pb-3 font-semibold uppercase">Duration Dates</th>
                        <th className="pb-3 font-semibold uppercase">Reason / Justification</th>
                        <th className="pb-3 font-semibold uppercase">Status</th>
                        {user.role === 'INSTITUTE_ADMIN' && <th className="pb-3 text-right font-semibold uppercase">Approvals</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                      {leaves.map((l) => (
                        <tr key={l.id}>
                          <td className="py-3 font-semibold">
                            <p>{l.staff?.firstName} {l.staff?.lastName}</p>
                            <p className="text-[9px] text-zinc-400">{l.staff?.designation}</p>
                          </td>
                          <td className="py-3 text-zinc-500">
                            {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-zinc-400 max-w-xs truncate">{l.reason}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {l.status}
                            </span>
                          </td>
                          {user.role === 'INSTITUTE_ADMIN' && (
                            <td className="py-3 text-right space-x-1.5">
                              {l.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveLeave(l.id, 'APPROVED')}
                                    className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-500"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleApproveLeave(l.id, 'REJECTED')}
                                    className="rounded bg-red-600 p-1 text-white hover:bg-red-500"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-zinc-400">Processed</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3I. ACADEMIC SYLLABUS & LESSON PLANS */}
          {activeMenu === 'lessons' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Log/Create Lesson Plan form */}
                {(user.role === 'TEACHER' || user.role === 'INSTITUTE_ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Establish Lesson Plan</h4>
                    <form onSubmit={handleCreateLessonPlan} className="mt-6 space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-zinc-400">Lesson / Topic Title</label>
                        <input
                          type="text"
                          required
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          placeholder="e.g. Organic Chemistry - Hydrocarbons"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Syllabus Details & Description</label>
                        <textarea
                          required
                          value={lessonForm.content}
                          onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                          placeholder="Log syllabus topics, reading assignments..."
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-sky-600 dark:border-zinc-800 dark:bg-zinc-950 h-24"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Subject Course</label>
                        <select
                          value={lessonForm.subjectId}
                          onChange={(e) => setLessonForm({ ...lessonForm, subjectId: e.target.value })}
                          required
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <option value="">Select Subject...</option>
                          {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Syllabus Completion ({lessonForm.syllabusPercent}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={lessonForm.syllabusPercent}
                          onChange={(e) => setLessonForm({ ...lessonForm, syllabusPercent: parseInt(e.target.value) })}
                          className="mt-2 w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:bg-zinc-800"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-500"
                      >
                        Publish Lesson Plan
                      </button>
                    </form>
                  </div>
                )}

                {/* Lesson plans grid list */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Syllabus Completion Tracker</h4>
                  
                  {lessonPlans.length === 0 ? (
                    <p className="text-center text-xs text-zinc-400 py-8">No lesson plans created yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {lessonPlans.map((plan) => (
                        <div key={plan.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 text-xs space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-sky-600 text-sm">{plan.title}</h5>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Subject: {plan.subject?.name} • Class: {plan.subject?.class?.name} • Teacher: {plan.teacher?.firstName} {plan.teacher?.lastName}</p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${plan.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : plan.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                                {plan.status}
                              </span>
                              {(user.role === 'TEACHER' || user.role === 'INSTITUTE_ADMIN') && (
                                <button
                                  onClick={() => handleDeleteLessonPlan(plan.id)}
                                  className="text-zinc-400 hover:text-red-500 rounded p-0.5"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{plan.content}</p>
                          
                          {/* Syllabus progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                              <span>Syllabus Completion Rate</span>
                              <span>{plan.syllabusPercent}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2 dark:bg-zinc-800">
                              <div
                                className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${plan.syllabusPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick progress slider edit */}
                          {(user.role === 'TEACHER' || user.role === 'INSTITUTE_ADMIN') && (
                            <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-[10px] text-zinc-400 font-semibold">Adjust Completion:</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={plan.syllabusPercent}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    const nextStatus = val === 100 ? 'COMPLETED' : val > 0 ? 'IN_PROGRESS' : 'PENDING';
                                    handleUpdateLessonPercent(plan.id, nextStatus, val);
                                  }}
                                  className="h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:bg-zinc-800 flex-1 max-w-[150px]"
                                />
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleUpdateLessonPercent(plan.id, 'IN_PROGRESS', 50)}
                                  className="rounded border border-zinc-200 px-2 py-1 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                  Halfway (50%)
                                </button>
                                <button
                                  onClick={() => handleUpdateLessonPercent(plan.id, 'COMPLETED', 100)}
                                  className="rounded bg-sky-600 px-2 py-1 text-[9px] font-bold text-white hover:bg-sky-500"
                                >
                                  Mark Completed
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3J. YEAR-END ACADEMIC PROMOTIONS */}
          {activeMenu === 'promotions' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                <h4 className="text-sm font-bold tracking-tight uppercase text-sky-600 dark:text-sky-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  Bulk Year-End Promotions & Roll Reset
                </h4>
                
                <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-2 leading-relaxed">
                  <p className="font-bold">⚠️ IEEE Standard 1012 Validation Rules on Academic Transition:</p>
                  <p>Promoting students will shift their core enrollment profile to the next academic level, archive their old roll number under milestone logs, and auto-generate new roll numbers based on the target class roster size.</p>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2 text-xs font-semibold">
                  <div>
                    <label className="block font-semibold text-zinc-400 uppercase">1. Select Class to Promote From</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setPromotionSelectedStudents([]);
                      }}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                    >
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-400 uppercase">2. Select Target Promotion Class</label>
                    <select
                      value={promotionTargetClassId}
                      onChange={(e) => setPromotionTargetClassId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                    >
                      <option value="">Choose class...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <div className="flex justify-between items-center pb-4">
                    <h5 className="font-bold text-xs uppercase text-zinc-400">Class Roster Promotion Selection ({promotionSelectedStudents.length} selected)</h5>
                    <button
                      onClick={() => {
                        if (promotionSelectedStudents.length === students.length) {
                          setPromotionSelectedStudents([]);
                        } else {
                          setPromotionSelectedStudents(students.map(s => s.id));
                        }
                      }}
                      className="text-xs text-sky-600 hover:underline font-bold"
                    >
                      Toggle Select All
                    </button>
                  </div>

                  <table className="w-full text-left border-collapse text-xs mt-2">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                        <th className="pb-2 font-semibold uppercase w-12">Select</th>
                        <th className="pb-2 font-semibold uppercase">Roll No</th>
                        <th className="pb-2 font-semibold uppercase">Student Name</th>
                        <th className="pb-2 font-semibold uppercase">Scholar Number</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                          <td className="py-2.5">
                            <input
                              type="checkbox"
                              checked={promotionSelectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPromotionSelectedStudents([...promotionSelectedStudents, student.id]);
                                } else {
                                  setPromotionSelectedStudents(promotionSelectedStudents.filter(id => id !== student.id));
                                }
                              }}
                              className="rounded text-sky-600 focus:ring-sky-500"
                            />
                          </td>
                          <td className="py-2.5 font-bold text-zinc-500">{student.rollNumber}</td>
                          <td className="py-2.5 font-semibold">{student.firstName} {student.lastName}</td>
                          <td className="py-2.5 font-mono text-zinc-400">{student.scholarNumber || 'Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                    <button
                      onClick={handlePromoteStudents}
                      className="rounded-lg bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-sky-500"
                    >
                      Confirm Bulk Graduation / Promotion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* 3G. NOTICES CIRCULARS FEED PANEL */}
          {activeMenu === 'notices' && (
            <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in duration-300">
              
              {/* Notices Feed */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 lg:col-span-2 space-y-4">
                <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Circular notice board</h4>
                {notices.map((n) => (
                  <div key={n.id} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 dark:bg-zinc-950/20 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-indigo-500 text-sm">{n.title}</span>
                      <span className="text-zinc-400 text-[10px]">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-3 text-zinc-600 dark:text-zinc-300 leading-relaxed">{n.content}</p>
                    <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800/85 flex justify-between text-[10px] text-zinc-400">
                      <span>Posted by {n.authorName}</span>
                      <span className="uppercase tracking-wider font-semibold">Targets: {n.targetRoles}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notice creation */}
              {(user.role === 'SUPER_ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'TEACHER') && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 text-xs">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Broadcast Announcement</h4>
                  <form onSubmit={handleCreateNotice} className="mt-6 space-y-4">
                    <div>
                      <label className="block font-semibold text-zinc-400">Announcement Title</label>
                      <input
                        type="text"
                        required
                        value={noticeForm.title}
                        onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                        placeholder="e.g. Schedule for Sports Day Practice"
                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-400">Notice Body Content</label>
                      <textarea
                        required
                        value={noticeForm.content}
                        onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 h-32"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-400 mb-2">Target Roles audience</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['STUDENT', 'PARENT', 'TEACHER', 'STAFF', 'ACCOUNTANT'].map((r) => (
                          <label key={r} className="flex items-center gap-2 font-medium">
                            <input
                              type="checkbox"
                              checked={noticeForm.roles.includes(r)}
                              onChange={() => toggleNoticeRole(r)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{r.toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-indigo-500"
                    >
                      Broadcast Notice
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}


          {/* 3H. STUDENT / PARENT PORTAL PANEL */}
          {activeMenu === 'student-portal' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Profile Card Header */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{user.profileName}</h3>
                  <p className="text-xs text-indigo-500 font-semibold">Registered Academic Roll: {user.profileId}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              {/* Sub grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Academic results card */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 md:col-span-2">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-4 border-b border-zinc-200 dark:border-zinc-800">Academic Marks Report Card</h4>
                  
                  {studentReport.length === 0 ? (
                    <p className="mt-8 text-center text-xs text-zinc-400">No examination scores published yet.</p>
                  ) : (
                    <table className="w-full mt-4 text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                          <th className="pb-3 font-semibold uppercase">Exam Description</th>
                          <th className="pb-3 font-semibold uppercase">Course Subject</th>
                          <th className="pb-3 font-semibold uppercase">Marks Obtained</th>
                          <th className="pb-3 font-semibold uppercase">Grade</th>
                          <th className="pb-3 font-semibold uppercase">Auditor Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                        {studentReport.map((res, i) => (
                          <tr key={i}>
                            <td className="py-3 font-semibold text-indigo-500">{res.examName}</td>
                            <td className="py-3 font-medium">{res.subjectName}</td>
                            <td className="py-3 font-bold">{res.marksObtained} / {res.maxMarks}</td>
                            <td className="py-3">
                              <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                {res.grade}
                              </span>
                            </td>
                            <td className="py-3 text-zinc-400">{res.remarks || 'No notes'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Individual stats widget */}
                <div className="space-y-6">
                  {/* Attendance Rate */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Attendance Rate</h5>
                    {studentAttendance ? (
                      <>
                        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-indigo-500">{studentAttendance.rate}%</h2>
                        <div className="mt-4 text-[10px] text-zinc-400 space-y-1 font-medium">
                          <p>Total recorded days: {studentAttendance.total}</p>
                          <p>Present days: {studentAttendance.present} • Absents: {studentAttendance.absent}</p>
                        </div>
                      </>
                    ) : (
                      <p className="mt-4 text-xs text-zinc-400">Loading attendance summaries...</p>
                    )}
                  </div>

                  {/* Submit staff leave requests inside portal */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                    <h4 className="text-sm font-bold tracking-tight uppercase text-zinc-400 pb-3 border-b border-zinc-200 dark:border-zinc-800">Apply Staff Leave</h4>
                    <form onSubmit={handleLeaveSubmit} className="mt-4 space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-zinc-400">Start Date</label>
                        <input
                          type="date"
                          required
                          value={leaveForm.startDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">End Date</label>
                        <input
                          type="date"
                          required
                          value={leaveForm.endDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-400">Reason</label>
                        <input
                          type="text"
                          required
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                          placeholder="e.g. Family medical appointment"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow hover:bg-indigo-500"
                      >
                        Submit Leave Application
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. PAYMENT POPUP MODAL */}
      {paymentModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Record Fee Collection</h3>
              <button
                onClick={() => setPaymentModal(null)}
                className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <span className="font-semibold text-zinc-400">Payer Student:</span>
                <p className="font-bold text-sm mt-1">{paymentModal.studentName}</p>
              </div>

              <div>
                <label className="block font-semibold text-zinc-400">Amount Collected ($)</label>
                <input
                  type="number"
                  value={paymentModal.amountDue}
                  onChange={(e) => setPaymentModal({ ...paymentModal, amountDue: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400">Payment Channel</label>
                <select
                  value={paymentModal.method}
                  onChange={(e) => setPaymentModal({ ...paymentModal, method: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                >
                  <option value="CASH">Cash Desk Payment</option>
                  <option value="CARD">Swipe Credit Card</option>
                  <option value="ONLINE">Online Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-400">Audit Remarks / Notes</label>
                <input
                  type="text"
                  value={paymentModal.remarks}
                  onChange={(e) => setPaymentModal({ ...paymentModal, remarks: e.target.value })}
                  placeholder="Receipt handed to parent..."
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPayment}
                  className="rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white shadow hover:bg-indigo-500"
                >
                  Confirm payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Temporary items matching state compilation checks
const examsList = [
  { id: 'exam-1', name: 'Mid-Term Algebra Exam', maxMarks: 100, examDate: '2026-04-10', subject: { name: 'Advanced Mathematics', class: { name: 'Grade 10-A' } } }
];
