'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  getBooksApi,
  createBookApi,
  updateBookApi,
  deleteBookApi,
  getIssuesApi,
  getStudentIssuesApi,
  issueBookApi,
  returnBookApi,
  getPayrollsApi
} from '@/lib/api';
import EmployeeModal from '@/components/hr/EmployeeModal';
import HireFormModal from '@/components/hr/HireFormModal';
import PayslipModal from '@/components/hr/PayslipModal';
import PayslipGeneratorModal from '@/components/hr/PayslipGeneratorModal';
import {

  LayoutDashboard, Users, CalendarCheck, CreditCard, GraduationCap, Briefcase, Megaphone, LogOut,
  Moon, Sun, Search, Plus, Trash2, Check, X, FileText, DollarSign, TrendingUp, Percent, Clock,
  ChevronRight, ShieldCheck, FileSpreadsheet, BookOpen, Book, Award, MessageSquare, BarChart2,
  Settings, HelpCircle, Send, Bell, ChevronLeft, UserCheck, Printer, Download, RefreshCw,
  Sliders, Database, Menu, Sparkles, Phone, ShieldAlert, BadgeInfo
} from 'lucide-react';

const ROLES_LIST = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { value: 'ACADEMIC_DIRECTOR', label: 'Academic Director' },
  { value: 'REGISTRAR', label: 'Registrar' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'HR_MANAGER', label: 'HR Manager' },
  { value: 'EXAM_CONTROLLER', label: 'Exam Controller' },
  { value: 'ATTENDANCE_OFFICER', label: 'Attendance Officer' },
  { value: 'COMMUNICATION_HEAD', label: 'Comms Head' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'COACHING_DIRECTOR', label: 'Coaching Director' },
  { value: 'INSTITUTE_ADMIN', label: 'Institute Admin' }
];

const SIDEBAR_CATEGORIES = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
  { id: 'academic', label: 'Academic Desk', icon: BookOpen, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'COACHING_DIRECTOR', 'REGISTRAR', 'EXAM_CONTROLLER', 'INSTITUTE_ADMIN'] },
  { id: 'students', label: 'Student Desk', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'REGISTRAR', 'COACHING_DIRECTOR', 'INSTITUTE_ADMIN'] },
  { id: 'teachers', label: 'Teacher Desk', icon: UserCheck, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'COACHING_DIRECTOR', 'INSTITUTE_ADMIN'] },
  { id: 'exams', label: 'Exams & Grades', icon: Award, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'EXAM_CONTROLLER', 'COACHING_DIRECTOR', 'INSTITUTE_ADMIN'] },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'ATTENDANCE_OFFICER', 'INSTITUTE_ADMIN'] },
  { id: 'fees', label: 'Fees & Finance', icon: CreditCard, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'INSTITUTE_ADMIN'] },
  { id: 'comms', label: 'Comms Hub', icon: MessageSquare, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'COMMUNICATION_HEAD', 'TEACHER', 'STUDENT', 'PARENT', 'INSTITUTE_ADMIN'] },
  { id: 'library', label: 'Library Desk', icon: Book, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'LIBRARIAN', 'TEACHER', 'STUDENT', 'PARENT', 'INSTITUTE_ADMIN'] },
  { id: 'hr', label: 'HR System', icon: Briefcase, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'ACCOUNTANT', 'INSTITUTE_ADMIN', 'TEACHER', 'LIBRARIAN'] },
  { id: 'analytics', label: 'Analytics Desk', icon: BarChart2, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'INSTITUTE_ADMIN'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'INSTITUTE_ADMIN'] }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState('STUDENT');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  
  // Dialog controls
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Datasets
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [bookIssues, setBookIssues] = useState<any[]>([]);
  
  // Selection states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tab states
  const [feesTab, setFeesTab] = useState<'allocations' | 'history' | 'structures' | 'ledger'>('allocations');
  const [examsTab, setExamsTab] = useState<'list' | 'entry'>('list');
  const [staffTab, setStaffTab] = useState<'list' | 'leaves'>('list');
  const [academicTab, setAcademicTab] = useState<'timetable' | 'lessons'>('timetable');
  const [studentTab, setStudentTab] = useState<'list' | 'admission' | 'promotions'>('list');
  
  // Library Form & State
  const [librarySubTab, setLibrarySubTab] = useState<'inventory' | 'checkout' | 'issues'>('inventory');
  const [bookSearch, setBookSearch] = useState('');
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', totalCopies: '5' });
  const [issueForm, setIssueForm] = useState({ studentId: '', bookId: '' });

  // Indian Admissions Form Fields
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    classId: '',
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
    houseNo: '',
    street: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    bankName: '',
    accHolderName: '',
    accNumber: '',
    ifscCode: '',
    bankBranch: '',
    prevSchoolName: '',
    tcNumber: '',
    migrationCertNo: ''
  });

  // Exams / Grading States
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examForm, setExamForm] = useState({ name: '', subjectId: '', maxMarks: '100', examDate: '', examType: 'UNIT_TEST' });
  const [examStudents, setExamStudents] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Indian HR and Leaves States
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', employeeId: '', designation: 'TEACHER', role: 'TEACHER', salary: '', phone: '' });
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [payrollStaffId, setPayrollStaffId] = useState('');
  const [payrollAllowances, setPayrollAllowances] = useState({ hra: 8000, da: 5000, tax: 200 });
  const [payslipData, setPayslipData] = useState<any>(null);

  // Advanced HR states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [payrollGeneratorOpen, setPayrollGeneratorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [hrTab, setHrTab] = useState<'employees' | 'payroll' | 'leaves'>('employees');
  const [payrollSearchQuery, setPayrollSearchQuery] = useState('');

  // Communications & Circular States
  const [circularForm, setCircularForm] = useState({ title: '', content: '', targetRoles: [] as string[] });
  const [whatsappGroup, setWhatsappGroup] = useState('PARENTS_ALL');
  const [whatsappText, setWhatsappText] = useState('');
  const [broadcastProgress, setBroadcastProgress] = useState<{ active: boolean; current: number; total: number; log: string[] } | null>(null);

  // Settings & DB Backup
  const [rbacRules, setRbacRules] = useState<Record<string, string[]>>({});
  const [backupLog, setBackupLog] = useState<string[]>([]);
  const [backupRunning, setBackupRunning] = useState(false);

  // RFID Biometric Simulator Logs
  const [rfidLogs, setRfidLogs] = useState<string[]>([
    "RFID scan at 10:45:12 AM: Student Alice Miller (ROLL-10A-01) checked in at Main Gate - PRESENT",
    "RFID scan at 10:48:44 AM: Student Bob Johnson (ROLL-10A-02) checked in at Main Gate - PRESENT",
    "Biometric scan at 10:52:19 AM: Teacher Sarah Connor checked in at Academic Block - PRESENT"
  ]);

  // AI Assistant Chat Messages
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<any[]>([
    { sender: 'assistant', text: "Hello! I am your AI Institutional Assistant. Ask me anything about syllabus completion, attendance rates, finance collections, or library inventory." }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  // Promotion States
  const [promotionSelectedStudents, setPromotionSelectedStudents] = useState<string[]>([]);
  const [promotionTargetClassId, setPromotionTargetClassId] = useState('');

  // Payment states
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; allocId: string; studentName: string; amountDue: number; method: string; remarks: string } | null>(null);
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'OPERATIONAL', paymentMethod: 'CASH' });

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Term 1 Fee Overdue Alert', desc: '5 students in Grade 10-A have pending tuition payments.', time: '10m ago', role: 'ACCOUNTANT' },
    { id: 2, title: 'Library Return Overdue', desc: 'Alice Miller holds "Fundamentals of Physics" past return limit.', time: '35m ago', role: 'LIBRARIAN' },
    { id: 3, title: 'RFID Gate Connection Active', desc: 'Biometric terminals synchronized successfully with cloud server.', time: '1h ago', role: 'SUPER_ADMIN' },
    { id: 4, title: 'New Circular Broadcasted', desc: 'Summer Vacation announcement published to all parents.', time: '2h ago', role: 'ALL' }
  ]);

  const [toastMessage, setToastMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Check Auth and Initial load
  useEffect(() => {
    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(cached);
    setUser(parsed);
    setCurrentRole(parsed.role);
    
    // Load initial datasets
    loadDashboardStats();
    loadStudents();
    loadClasses();
    loadStaff();
    loadNotices();
    loadLeaves();
    loadLessonPlans();
    loadExpenses();
    loadFinanceOverview();
    loadBooks();
    loadIssues();
    loadPayrolls();

    // Key listener for Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Biometric Real-time Tick Simulator
  useEffect(() => {
    const rfidTimer = setInterval(() => {
      const names = ["Alice Miller", "Bob Johnson", "Charlie Brown", "Sarah Connor", "John Keating", "Robert Kiyosaki"];
      const locations = ["Main Gate Entry", "Library Entrance Portal", "Academic Block punch", "Science Lab Scan"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRfidLogs(prev => [
        `RFID scan at ${timeStr}: ${randomName} verified at ${randomLoc} - MARKED PRESENT`,
        ...prev.slice(0, 10)
      ]);
    }, 18000);

    return () => clearInterval(rfidTimer);
  }, []);

  // PIN Code Auto-Lookup
  useEffect(() => {
    if (studentForm.pinCode.length === 6) {
      const pinDetails = getPinCodeDetails(studentForm.pinCode);
      if (pinDetails) {
        setStudentForm(prev => ({
          ...prev,
          state: pinDetails.state,
          district: pinDetails.district,
          city: pinDetails.district
        }));
        triggerToast(`PIN Code mapped: ${pinDetails.district}, ${pinDetails.state}`);
      }
    }
  }, [studentForm.pinCode]);

  useEffect(() => {
    if (aiAssistantOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatMessages, aiAssistantOpen]);

  // Load routines
  const loadDashboardStats = async () => {
    const data = await getDashboardStatsApi();
    setStats(data);
  };
  const loadStudents = async () => {
    const data = await getStudentsApi();
    setStudents(data);
  };
  const loadClasses = async () => {
    const data = await getClassesApi();
    setClasses(data);
  };
  const loadStaff = async () => {
    const data = await getStaffApi();
    setStaff(data);
  };
  const loadNotices = async () => {
    const data = await getNoticesApi();
    setNotices(data);
  };
  const loadLeaves = async () => {
    const data = await getLeavesApi();
    setLeaves(data);
  };
  const loadLessonPlans = async () => {
    const data = await getLessonPlansApi();
    setLessonPlans(data);
  };
  const loadExpenses = async () => {
    const data = await getExpensesApi();
    setExpenses(data);
  };
  const loadFinanceOverview = async () => {
    const data = await getFinanceOverviewApi();
    setFinanceData(data);
  };
  const loadBooks = async () => {
    const data = await getBooksApi(bookSearch);
    setBooks(data);
  };
  const loadIssues = async () => {
    const data = await getIssuesApi();
    setBookIssues(data);
  };
  const loadPayrolls = async () => {
    const data = await getPayrollsApi();
    setPayrolls(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    router.push('/');
  };

  // Role switching defense
  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    triggerToast(`Switched active view scope to: ${role}`);
    
    // Auto redirect to category if current category isn't allowed
    const category = SIDEBAR_CATEGORIES.find(c => c.id === activeCategory);
    if (category && category.roles[0] !== '*') {
      const allowed = category.roles.includes(role);
      if (!allowed) {
        setActiveCategory('overview');
      }
    }
  };

  // Create Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentForm.aadhaarNumber && studentForm.aadhaarNumber.length !== 12) {
      alert('Aadhaar Number must be exactly 12 digits.');
      return;
    }
    if (studentForm.samagraId && studentForm.samagraId.length !== 9) {
      alert('Samagra Id must be exactly 9 digits.');
      return;
    }
    try {
      const data = {
        ...studentForm,
        rollNumber: studentForm.rollNumber || `ROLL-${Date.now().toString().slice(-4)}`
      };
      await createStudentApi(data);
      triggerToast('Indian scholar record successfully registered!');
      setStudentForm({
        firstName: '', lastName: '', email: '', rollNumber: '', classId: '', dateOfBirth: '2010-01-01', gender: 'MALE',
        aadhaarNumber: '', samagraId: '', familyId: '', penNumber: '', birthCertificateNumber: '', bloodGroup: '',
        religion: '', casteCategory: 'GENERAL', nationality: 'Indian', motherTongue: '', fatherName: '', motherName: '',
        fatherOccupation: '', motherOccupation: '', annualIncome: '', houseNo: '', street: '', city: '', district: '',
        state: '', pinCode: '', bankName: '', accHolderName: '', accNumber: '', ifscCode: '', bankBranch: '',
        prevSchoolName: '', tcNumber: '', migrationCertNo: ''
      });
      loadStudents();
      setStudentTab('list');
    } catch (err: any) {
      alert(err.message || 'Admissions failed.');
    }
  };

  // Add Book
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBookApi({
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        totalCopies: parseInt(bookForm.totalCopies) || 1
      });
      triggerToast('New library book catalogued successfully!');
      setBookForm({ title: '', author: '', isbn: '', totalCopies: '5' });
      loadBooks();
    } catch (err: any) {
      alert(err.message || 'Failed to add book');
    }
  };

  // Issue book
  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.studentId || !issueForm.bookId) {
      alert('Select student and book');
      return;
    }
    try {
      await issueBookApi(issueForm.studentId, issueForm.bookId);
      triggerToast('Book issue checkout record created!');
      setIssueForm({ studentId: '', bookId: '' });
      loadBooks();
      loadIssues();
    } catch (err: any) {
      alert(err.message || 'Check out failed');
    }
  };

  // Return Book
  const handleReturnBook = async (id: string) => {
    try {
      await returnBookApi(id);
      triggerToast('Book returned to rack. Inventory updated.');
      loadBooks();
      loadIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to process return');
    }
  };

  // Create Exam
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExamApi(examForm);
      triggerToast('Exam schedule and grading parameters defined.');
      setExamForm({ name: '', subjectId: '', maxMarks: '100', examDate: '', examType: 'UNIT_TEST' });
      loadDashboardStats();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule exam');
    }
  };

  // Exam Marks loading
  const loadExamMarksSheet = async (examId: string) => {
    setSelectedExamId(examId);
    if (!examId) return;
    const studentsList = await getExamResultsApi(examId);
    setExamStudents(studentsList);
    setExamsTab('entry');
  };

  // Submit Exam Results
  const handleSaveExamResults = async () => {
    try {
      await submitExamResultsApi(selectedExamId, examStudents);
      triggerToast('Examination marks list saved and graded!');
      setExamsTab('list');
    } catch (err: any) {
      alert(err.message || 'Failed to save results');
    }
  };

  // Calculate CBSE grade letter
  const getGrade = (marks: number, max: number) => {
    const pct = (marks / max) * 100;
    if (pct >= 91) return 'A1';
    if (pct >= 81) return 'A2';
    if (pct >= 71) return 'B1';
    if (pct >= 61) return 'B2';
    if (pct >= 51) return 'C1';
    if (pct >= 41) return 'C2';
    if (pct >= 33) return 'D';
    return 'E/Fail';
  };

  // Submit Attendance
  const handleSaveAttendance = async () => {
    try {
      await submitAttendanceApi(selectedClass, attendanceDate, attendanceRecords);
      triggerToast('Daily attendance roster submitted successfully!');
    } catch (err) {
      alert('Attendance save error');
    }
  };

  const loadAttendanceRoster = async (classId: string) => {
    setSelectedClass(classId);
    if (!classId) return;
    const data = await getClassAttendanceApi(classId, attendanceDate);
    setAttendanceRecords(data);
  };

  // Promote students
  const handlePromoteStudents = async () => {
    if (promotionSelectedStudents.length === 0) {
      alert('Select students to promote');
      return;
    }
    if (!promotionTargetClassId) {
      alert('Select target class');
      return;
    }
    try {
      await promoteStudentsApi(promotionSelectedStudents, promotionTargetClassId);
      triggerToast(`Successfully promoted ${promotionSelectedStudents.length} students to new grade!`);
      setPromotionSelectedStudents([]);
      loadStudents();
      setStudentTab('list');
    } catch (err) {
      alert('Promotion failure');
    }
  };

  // Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpenseApi({
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        paymentMethod: expenseForm.paymentMethod
      });
      triggerToast('Operating expense debited successfully!');
      setExpenseForm({ title: '', amount: '', category: 'OPERATIONAL', paymentMethod: 'CASH' });
      loadExpenses();
      loadFinanceOverview();
    } catch (err) {
      alert('Expense creation failed');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpenseApi(id);
      triggerToast('Expense item deleted');
      loadExpenses();
      loadFinanceOverview();
    } catch (err) {
      alert('Expense deletion failed');
    }
  };

  // Pay fee
  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;
    try {
      await payFeeApi(paymentModal.allocId, paymentModal.amountDue, paymentModal.method, paymentModal.remarks);
      triggerToast('Fee receipt generated! Collection recorded.');
      setPaymentModal(null);
      loadFinanceOverview();
      loadDashboardStats();
    } catch (err) {
      alert('Payment submission failed');
    }
  };

  // Staff creation
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaffApi(staffForm);
      triggerToast('New employee profile and credentials active.');
      setStaffForm({ firstName: '', lastName: '', email: '', employeeId: '', designation: 'TEACHER', role: 'TEACHER', salary: '', phone: '' });
      loadStaff();
    } catch (err) {
      alert('Employee save error');
    }
  };

  // Leave submission
  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeaveApi(leaveForm.startDate, leaveForm.endDate, leaveForm.reason);
      triggerToast('Leave request submitted to principal desk.');
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      loadLeaves();
    } catch (err) {
      alert('Leave submission error');
    }
  };

  // Leave approval
  const handleApproveLeave = async (id: string, status: string) => {
    try {
      await approveLeaveApi(id, status);
      triggerToast(`Leave request marked ${status}`);
      loadLeaves();
    } catch (err) {
      alert('Leave evaluation error');
    }
  };

  // Payslip Generator
  const generatePayslip = (sId: string) => {
    const employee = staff.find(s => s.id === sId);
    if (!employee) {
      alert('Select an employee');
      return;
    }
    const base = parseFloat(employee.salary) || 30000;
    const hra = allowances.hra;
    const da = allowances.da;
    const tax = allowances.tax;
    const net = base + hra + da - tax;
    setPayslipData({
      name: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      designation: employee.designation,
      baseSalary: base,
      hra,
      da,
      tax,
      netPay: net,
      period: 'May 2026',
      receiptNo: `PAY-${Date.now().toString().slice(-6)}`
    });
    triggerToast('Payslip preview calculated!');
  };

  const [allowances, setAllowances] = useState({ hra: 8000, da: 5000, tax: 200 });

  // Broadcast Circular Notices
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = circularForm.targetRoles.length > 0 ? circularForm.targetRoles : ['ALL'];
    try {
      await createNoticeApi(circularForm.title, circularForm.content, target);
      triggerToast('Circular notification broadcasted to all terminals!');
      setCircularForm({ title: '', content: '', targetRoles: [] });
      loadNotices();
    } catch (err) {
      alert('Circular create error');
    }
  };

  const toggleCircularRole = (role: string) => {
    setCircularForm(prev => {
      const roles = prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role];
      return { ...prev, targetRoles: roles };
    });
  };

  // WhatsApp/SMS simulated broadcaster
  const handleWhatsappBroadcast = () => {
    if (!whatsappText) {
      alert('Please enter message text');
      return;
    }
    let count = 0;
    let list: string[] = [];
    if (whatsappGroup === 'PARENTS_ALL') {
      list = students.map(s => `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)} (Parent of ${s.firstName})`);
    } else if (whatsappGroup === 'TEACHERS_ALL') {
      list = staff.filter(s => s.designation === 'TEACHER').map(s => `+91 ${s.phone || '9988776655'} (${s.firstName})`);
    } else {
      list = [`+91 9876543210 (Principal Desk)`, `+91 9998887776 (Registrar)`];
    }

    setBroadcastProgress({
      active: true,
      current: 0,
      total: list.length,
      log: [`Broadcaster initialized for ${list.length} targets...`]
    });

    const runSim = (idx: number) => {
      if (idx >= list.length) {
        setBroadcastProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            log: [...prev.log, `Broadcast finished successfully. ${list.length} messages delivered.`]
          };
        });
        triggerToast('WhatsApp / SMS Broadcast completed!');
        setWhatsappText('');
        return;
      }
      setTimeout(() => {
        setBroadcastProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            current: idx + 1,
            log: [...prev.log, `Delivered: "${whatsappText.substring(0, 15)}..." to ${list[idx]}`]
          };
        });
        runSim(idx + 1);
      }, 500);
    };
    runSim(0);
  };

  // AI assistant prompt triggers
  const triggerAiQuery = (query: string) => {
    setAiChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setAiTyping(true);

    setTimeout(() => {
      let reply = "";
      const q = query.toLowerCase();
      
      if (q.includes('health') || q.includes('report') || q.includes('analytics')) {
        reply = `**AURXON ERP Institutional Health Analysis:**
- Academic Roster: **${students.length} students** enrolled across **${classes.length} grades**.
- Term Fees Collections: **${stats?.feeOverview?.collectionRate || 85}%** collection rate. Net collections ₹${stats?.feeOverview?.totalPaid || 0}.
- Attendance Rate: **${stats?.attendanceRate || 95.8}%** biometric check-ins active today.
- Overall Rating: **Grade A+ Elite**`;
      } else if (q.includes('book') || q.includes('library') || q.includes('overdue')) {
        const issued = bookIssues.filter(i => i.status === 'ISSUED');
        reply = `**Library Circulation Audit:**
- catalogued inventory: **${books.length} titles** available.
- Checked out: **${issued.length} books** currently with students.
- Overdue logs: **1 alert** pending return check for student Alice Miller (ROLL-10A-01).`;
      } else if (q.includes('absent') || q.includes('attendance')) {
        reply = `**Biometric attendance log summary:**
- Today's rate: **${stats?.attendanceRate || 95.8}%** present.
- Absent flags: **1 student** flagged (Bob Johnson, Grade 10-A, sick leave).
- Biometric terminals online: **4/4 gates operational**.`;
      } else if (q.includes('fee') || q.includes('financial')) {
        reply = `**Financial Collections Ledger:**
- Total Due: **₹${stats?.feeOverview?.totalDue || 0}**
- Total Collected: **₹${stats?.feeOverview?.totalPaid || 0}**
- Pending Balance: **₹${stats?.feeOverview?.totalPending || 0}**
- Cash Desk: ₹${expenses.reduce((sum, e) => sum + e.amount, 0)} operating expense recorded.`;
      } else {
        reply = `I have received your request. Here are the core statistics for Aurxon:
- **Students**: ${students.length}
- **Staff**: ${staff.length}
- **Attendance**: ${stats?.attendanceRate || 95.8}%
- **Fees collection**: ${stats?.feeOverview?.collectionRate || 85}%
Type "financial health" or "attendance" to get detailed lists.`;
      }

      setAiChatMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
      setAiTyping(false);
    }, 1200);
  };

  // Settings DB Backup Sim
  const runDbBackup = () => {
    setBackupRunning(true);
    setBackupLog(["[INFO] Initializing system vault backup...", "[INFO] Exporting PostgreSQL schemas from Neon serverless pooler..."]);
    
    setTimeout(() => {
      setBackupLog(prev => [...prev, "[INFO] Compressing tables: student, staff, book, payment, attendance...", "[INFO] Database dump created (4.82MB, GZIP compression active)."]);
    }, 1000);

    setTimeout(() => {
      const filename = `aurxon-erp-backup-${new Date().toISOString().substring(0,10)}.sql`;
      setBackupLog(prev => [...prev, `[SUCCESS] Secure tunnel transmission completed.`, `[SUCCESS] Dump file "${filename}" vaulted in AWS S3 Symmetrical Cloud storage.`]);
      setBackupRunning(false);
      triggerToast('Database backup successfully vaulted!');
    }, 2500);
  };

  if (!user) return <div className="p-8 text-center text-zinc-500 font-medium">Authorizing credentials. Syncing ERP modules...</div>;

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-sky-500/20 animate-fade-in border border-sky-400">
          <Sparkles className="h-4 w-4 text-sky-200 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* COMMAND PALETTE POPUP */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center border-b border-zinc-100 px-4 dark:border-zinc-800">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search command shortcuts... (e.g. library, admit student, principal)"
                className="w-full border-none bg-transparent px-3 py-4 text-sm text-zinc-900 outline-none placeholder-zinc-400 dark:text-white"
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 dark:bg-zinc-800">ESC</button>
            </div>
            
            {/* Filtered options list */}
            <div className="max-h-72 overflow-y-auto p-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Actions & Navigation</p>
              {[
                { title: "Dashboard Overview", action: () => { setActiveCategory('overview'); setCommandPaletteOpen(false); }, desc: "View key metrics and RFID logs" },
                { title: "Admit Student Form", action: () => { setActiveCategory('students'); setStudentTab('admission'); setCommandPaletteOpen(false); }, desc: "Enroll new pupil with Indian demographic IDs" },
                { title: "Issue a Library Book", action: () => { setActiveCategory('library'); setLibrarySubTab('checkout'); setCommandPaletteOpen(false); }, desc: "Borrow register checkout slips" },
                { title: "Quick Switch Role: Principal", action: () => { handleRoleChange('PRINCIPAL'); setCommandPaletteOpen(false); }, desc: "Change ERP permission view" },
                { title: "Quick Switch Role: Accountant", action: () => { handleRoleChange('ACCOUNTANT'); setCommandPaletteOpen(false); }, desc: "Access Fees ledger" },
                { title: "Quick Switch Role: Librarian", action: () => { handleRoleChange('LIBRARIAN'); setCommandPaletteOpen(false); }, desc: "Borrow lists and book inventory" },
                { title: "Ask AI Assistant", action: () => { setAiAssistantOpen(true); setCommandPaletteOpen(false); }, desc: "Open side chat dialog box" },
                { title: "Simulate DB Backup Vault", action: () => { setActiveCategory('settings'); setCommandPaletteOpen(false); }, desc: "Neon postgres backup simulation" },
                { title: "Dark Theme Toggle", action: () => { document.documentElement.classList.toggle('dark'); setCommandPaletteOpen(false); }, desc: "Toggle color modes" }
              ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                >
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</p>
                    <p className="text-[10px] text-zinc-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC COLLAPSIBLE SIDEBAR */}
      <aside className={`flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} h-full shrink-0`}>
        {/* Branding header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white font-extrabold shadow-md shadow-sky-500/25">
            A
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-extrabold tracking-tight truncate dark:text-white">{user.institutionName}</h1>
              <p className="text-[9px] uppercase tracking-wider font-bold text-sky-600 dark:text-sky-400">Mini Lite ERP</p>
            </div>
          )}
        </div>

        {/* Current profile badge */}
        {!sidebarCollapsed ? (
          <div className="mx-4 mt-6 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600">
                {user.profileName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold truncate text-zinc-700 dark:text-zinc-300">{user.profileName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-zinc-400 truncate uppercase">{currentRole.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mt-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600">
              {user.profileName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {SIDEBAR_CATEGORIES.map((cat) => {
            const isAllowed = cat.roles.includes('*') || cat.roles.includes(currentRole);
            if (!isAllowed) return null;
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20 dark:bg-sky-500 dark:shadow-sky-500/10'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/40'
                }`}
                title={cat.label}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                {!sidebarCollapsed && <span className="truncate">{cat.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-bold text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* DYNAMIC CONTENT MAIN DESK */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
              <span className="uppercase">AURXON</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-sky-600 dark:text-sky-400 capitalize">{activeCategory} desk</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Global search command triggers */}
            <div className="relative hidden sm:block">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search commands... (Ctrl+K)"
                readOnly
                onClick={() => setCommandPaletteOpen(true)}
                className="w-56 cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-4 text-xs font-medium text-zinc-800 placeholder-zinc-400 outline-none transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-white"
              />
            </div>

            {/* AI Assistant Chat toggle button */}
            <button
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-400 transition"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden md:inline">Ask AI Assistant</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Real-time alerts</p>
                    <button className="text-[10px] font-bold text-sky-600 dark:text-sky-400" onClick={() => setNotificationsOpen(false)}>Close</button>
                  </div>
                  <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950/40 border border-zinc-100/50 dark:border-zinc-800/30 text-xs">
                        <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                          <span>{n.title}</span>
                          <span className="text-[9px] font-medium text-zinc-400">{n.time}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Glacier Theme toggler */}
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition"
            >
              <Sun className="h-4.5 w-4.5 hidden dark:block" />
              <Moon className="h-4.5 w-4.5 dark:hidden" />
            </button>

            {/* DYNAMIC ROLE SWITCHER */}
            <div className="relative">
              <select
                value={currentRole}
                onChange={e => handleRoleChange(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 outline-none shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {ROLES_LIST.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

          </div>
        </header>

        {/* WORKSPACE PANELS CONTAINER */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* A. OVERVIEW PANEL */}
          {activeCategory === 'overview' && stats && (
            <div className="space-y-6">
              
              {/* Header metrics strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Students</span>
                    <Users className="h-4 w-4 text-sky-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black">{students.length}</h3>
                  <p className="mt-1 text-[10px] font-medium text-emerald-500">+2 new admissions today</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Staff Roster</span>
                    <Briefcase className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black">{staff.length}</h3>
                  <p className="mt-1 text-[10px] font-medium text-zinc-400">3 designation tiers</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
                    <CalendarCheck className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black">{stats.attendanceRate || 95.8}%</h3>
                  <p className="mt-1 text-[10px] font-medium text-emerald-500">Live RFID syncing active</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Fee Collections</span>
                    <Percent className="h-4 w-4 text-sky-500" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black">{stats.feeOverview?.collectionRate || 85}%</h3>
                  <p className="mt-1 text-[10px] font-medium text-sky-600 dark:text-sky-400">₹{stats.feeOverview?.totalPaid || 0} collected</p>
                </div>
              </div>

              {/* Main content grid: RFID scan log + notices */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* RFID Biometric scans stream */}
                <div className="lg:col-span-2 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Biometric / RFID Scan Logger (Simulated)</h4>
                    </div>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400">Live feed</span>
                  </div>
                  <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                    {rfidLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl bg-zinc-50/60 p-3 text-xs dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 animate-slide-in">
                        <Clock className="mt-0.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <p className="text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">{log}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circular alert board */}
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3 dark:border-zinc-800">Circular Announcements</h4>
                  <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
                    {notices.map((notice) => (
                      <div key={notice.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-950/25">
                        <h5 className="font-bold text-xs dark:text-white">{notice.title}</h5>
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{notice.content}</p>
                        <div className="mt-3 flex justify-between items-center text-[10px] text-zinc-400 font-medium border-t border-zinc-100/50 pt-2 dark:border-zinc-800/50">
                          <span>By: {notice.authorName}</span>
                          <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* B. ACADEMIC MANAGEMENT */}
          {activeCategory === 'academic' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Academic & Syllabus Desk</h3>
                <div className="flex gap-2">
                  <button onClick={() => setAcademicTab('timetable')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${academicTab === 'timetable' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Weekly Timetable</button>
                  <button onClick={() => setAcademicTab('lessons')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${academicTab === 'lessons' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Syllabus Logs</button>
                </div>
              </div>

              {academicTab === 'timetable' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Grade 10-A Timetable Matrix</h4>
                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Day</th>
                          <th className="p-3">Period 1 (09:00 AM)</th>
                          <th className="p-3">Period 2 (10:00 AM)</th>
                          <th className="p-3">Period 3 (11:00 AM)</th>
                          <th className="p-3">Period 4 (12:00 PM)</th>
                          <th className="p-3">Period 5 (02:00 PM)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        <tr>
                          <td className="p-3 font-bold bg-zinc-50/55 dark:bg-zinc-950/20">Monday</td>
                          <td className="p-3">Advanced Mathematics</td>
                          <td className="p-3">Introductory Physics</td>
                          <td className="p-3 bg-zinc-100/50 dark:bg-zinc-800/20">Library hour</td>
                          <td className="p-3">Chemistry</td>
                          <td className="p-3">Physical Ed.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold bg-zinc-50/55 dark:bg-zinc-950/20">Tuesday</td>
                          <td className="p-3">Chemistry</td>
                          <td className="p-3">English Literature</td>
                          <td className="p-3 bg-zinc-100/50 dark:bg-zinc-800/20">Self study</td>
                          <td className="p-3">Advanced Mathematics</td>
                          <td className="p-3">Social Science</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold bg-zinc-50/55 dark:bg-zinc-950/20">Wednesday</td>
                          <td className="p-3">Advanced Mathematics</td>
                          <td className="p-3">Introductory Physics</td>
                          <td className="p-3 bg-zinc-100/50 dark:bg-zinc-800/20">Library hour</td>
                          <td className="p-3">English Literature</td>
                          <td className="p-3">Computer Science</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold bg-zinc-50/55 dark:bg-zinc-950/20">Thursday</td>
                          <td className="p-3">Social Science</td>
                          <td className="p-3">Chemistry</td>
                          <td className="p-3 bg-zinc-100/50 dark:bg-zinc-800/20">Library hour</td>
                          <td className="p-3">Advanced Mathematics</td>
                          <td className="p-3">Biology</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold bg-zinc-50/55 dark:bg-zinc-950/20">Friday</td>
                          <td className="p-3">Introductory Physics</td>
                          <td className="p-3">Biology</td>
                          <td className="p-3 bg-zinc-100/50 dark:bg-zinc-800/20">Computer Science</td>
                          <td className="p-3">Social Science</td>
                          <td className="p-3">English Literature</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {academicTab === 'lessons' && (
                <div className="space-y-6">
                  {/* Create Lesson plan */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const title = (e.target as any).elements.title.value;
                    const content = (e.target as any).elements.content.value;
                    const classId = selectedClass || 'class-1';
                    // Find matching subject
                    const subjs = subjectsList.length > 0 ? subjectsList : [{id: 'subj-1'}];
                    await createLessonPlanApi({ title, content, subjectId: subjs[0].id, syllabusPercent: 0 });
                    triggerToast('Syllabus item plan created!');
                    (e.target as any).reset();
                    loadLessonPlans();
                  }} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Lesson Title</label>
                      <input name="title" required placeholder="e.g. Organic Chemistry Carbon compounds" className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Scope Details</label>
                      <input name="content" required placeholder="Syllabus chapter guidelines" className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500">
                        <Plus className="h-4 w-4" />
                        <span>Add Chapter plan</span>
                      </button>
                    </div>
                  </form>

                  {/* List of plans with syllabus sliders */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Syllabus Completion & Lesson Tracker</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lessonPlans.map((plan) => (
                        <div key={plan.id} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 uppercase">{plan.subject?.name || 'Academics'}</span>
                              <h5 className="mt-2 text-xs font-black text-zinc-800 dark:text-white">{plan.title}</h5>
                            </div>
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{plan.status}</span>
                          </div>
                          
                          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{plan.content}</p>
                          
                          {/* Syllabus progress bar + slider */}
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                              <span>Syllabus Covered</span>
                              <span>{plan.syllabusPercent}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                              <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${plan.syllabusPercent}%` }} />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={plan.syllabusPercent}
                              onChange={async (e) => {
                                const val = parseInt(e.target.value);
                                const status = val === 100 ? 'COMPLETED' : val > 0 ? 'IN_PROGRESS' : 'PENDING';
                                await updateLessonPlanApi(plan.id, { syllabusPercent: val, status });
                                loadLessonPlans();
                              }}
                              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer range-xs dark:bg-zinc-700 accent-sky-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* C. STUDENT DESK */}
          {activeCategory === 'students' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Student & Scholar Registry</h3>
                <div className="flex gap-2">
                  <button onClick={() => setStudentTab('list')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${studentTab === 'list' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Roster List</button>
                  <button onClick={() => setStudentTab('admission')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${studentTab === 'admission' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Admission Desk</button>
                  <button onClick={() => setStudentTab('promotions')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${studentTab === 'promotions' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Promotions</button>
                </div>
              </div>

              {/* Roster list */}
              {studentTab === 'list' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Scholar No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Roll No</th>
                          <th className="p-3">Grade</th>
                          <th className="p-3">Aadhaar (Indian UID)</th>
                          <th className="p-3">PEN No</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="p-3">
                              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                                {student.scholarNumber || `SCH-${student.id.substring(5,9).toUpperCase()}`}
                              </span>
                            </td>
                            <td className="p-3 font-bold">{student.firstName} {student.lastName}</td>
                            <td className="p-3 text-zinc-500">{student.rollNumber}</td>
                            <td className="p-3">{student.class?.name}</td>
                            <td className="p-3 text-zinc-500 font-mono">{student.aadhaarNumber || '12-digit UID Not Linked'}</td>
                            <td className="p-3">
                              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                {student.penNumber || 'PEN Pending'}
                              </span>
                            </td>
                            <td className="p-3">
                              <button onClick={() => {
                                if (confirm('Remove student record?')) {
                                  deleteStudentApi(student.id);
                                  loadStudents();
                                }
                              }} className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Admission Desk form */}
              {studentTab === 'admission' && (
                <form onSubmit={handleCreateStudent} className="space-y-6">
                  
                  {/* Basic section */}
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-4">1. Primary demographic details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">First Name</label>
                        <input required value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Last Name</label>
                        <input required value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Email Address</label>
                        <input type="email" required value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Class Stream</label>
                        <select required value={studentForm.classId} onChange={e => setStudentForm({...studentForm, classId: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950">
                          <option value="">Select Grade</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Demographic & Indian Identity Details */}
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-4">2. Demographic & Indian Identity Verification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Aadhaar (UIDAI - 12 digits)</label>
                        <input maxLength={12} placeholder="e.g. 562180429402" value={studentForm.aadhaarNumber} onChange={e => setStudentForm({...studentForm, aadhaarNumber: e.target.value.replace(/\D/g, '')})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Samagra ID (State SSSMID - 9 digits)</label>
                        <input maxLength={9} placeholder="e.g. 194029401" value={studentForm.samagraId} onChange={e => setStudentForm({...studentForm, samagraId: e.target.value.replace(/\D/g, '')})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">PEN (Permanent Education Number)</label>
                        <input placeholder="e.g. PEN202610425" value={studentForm.penNumber} onChange={e => setStudentForm({...studentForm, penNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Caste Category</label>
                        <select value={studentForm.casteCategory} onChange={e => setStudentForm({...studentForm, casteCategory: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950">
                          <option value="GENERAL">General</option>
                          <option value="OBC">OBC (Other Backward Classes)</option>
                          <option value="SC">SC (Scheduled Caste)</option>
                          <option value="ST">ST (Scheduled Tribe)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Indian Pin code Lookup Address */}
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-4">3. Postal Address (Automatic Pin Code Lookup)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Pin Code (India)</label>
                        <input maxLength={6} placeholder="e.g. 560001 (Bengaluru)" value={studentForm.pinCode} onChange={e => setStudentForm({...studentForm, pinCode: e.target.value.replace(/\D/g, '')})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">House / Street Address</label>
                        <input value={studentForm.street} onChange={e => setStudentForm({...studentForm, street: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">District / City</label>
                        <input readOnly value={studentForm.district} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">State</label>
                        <input readOnly value={studentForm.state} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400" />
                      </div>
                    </div>
                  </div>

                  {/* Banking credentials */}
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-4">4. Banking Credentials (Scholarship routing)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Name</label>
                        <input placeholder="State Bank of India" value={studentForm.bankName} onChange={e => setStudentForm({...studentForm, bankName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">IFSC Code (11 digits)</label>
                        <input maxLength={11} placeholder="SBIN0000001" value={studentForm.ifscCode} onChange={e => setStudentForm({...studentForm, ifscCode: e.target.value.toUpperCase()})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Account Number</label>
                        <input placeholder="394020942042" value={studentForm.accNumber} onChange={e => setStudentForm({...studentForm, accNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">UPI Address (optional)</label>
                        <input placeholder="scholar@sbi" value={studentForm.prevSchoolName} onChange={e => setStudentForm({...studentForm, prevSchoolName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="rounded-xl bg-sky-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-sky-500">Submit Admission Record</button>
                </form>
              )}

              {/* Promotions desk */}
              {studentTab === 'promotions' && (
                <div className="space-y-6">
                  <div className="rounded-xl bg-sky-500/10 p-4 border border-sky-400/30 text-xs">
                    <h4 className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Year-End Bulk Academic Promotions</span>
                    </h4>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Select students below and choose a target class. The system will automatically promote classes and increment roll credentials in CBSE standard format.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Selector list */}
                    <div className="md:col-span-2 border border-zinc-100 rounded-xl p-4 dark:border-zinc-800 max-h-96 overflow-y-auto space-y-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Students</h4>
                      {students.map((student) => {
                        const isChecked = promotionSelectedStudents.includes(student.id);
                        return (
                          <div key={student.id} className="flex items-center gap-3 rounded-lg bg-zinc-50/50 p-2.5 text-xs dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setPromotionSelectedStudents(prev =>
                                  isChecked ? prev.filter(id => id !== student.id) : [...prev, student.id]
                                );
                              }}
                              className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
                            />
                            <div className="flex-1 font-medium">
                              <p className="font-bold">{student.firstName} {student.lastName}</p>
                              <p className="text-[10px] text-zinc-400">Roll No: {student.rollNumber} | Class: {student.class?.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Target Grade */}
                    <div className="bg-zinc-50/40 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Promotion Target</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400">Target Grade</label>
                        <select
                          value={promotionTargetClassId}
                          onChange={e => setPromotionTargetClassId(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-white dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <option value="">Select Grade</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <button
                        onClick={handlePromoteStudents}
                        className="w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white hover:bg-sky-500 shadow-md"
                      >
                        Execute Batch Promotion ({promotionSelectedStudents.length} selected)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* D. TEACHER PANEL */}
          {activeCategory === 'teachers' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4 dark:border-zinc-800">Teacher & Workload Desk</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workload log list */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Teacher Weekly Lecture Workload</h4>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah Connor", designation: "Mathematics Head", hours: 24, max: 30, color: "bg-sky-500" },
                      { name: "John Keating", designation: "Literature & Arts Lead", hours: 18, max: 30, color: "bg-indigo-500" },
                      { name: "Robert Kiyosaki", designation: "Accountant / Econ Desk", hours: 12, max: 20, color: "bg-emerald-500" }
                    ].map((t, idx) => (
                      <div key={idx} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <div>
                            <p className="font-bold">{t.name}</p>
                            <p className="text-[10px] text-zinc-400 font-medium">{t.designation}</p>
                          </div>
                          <span>{t.hours} hrs / week</span>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div className={`h-full ${t.color}`} style={{ width: `${(t.hours / t.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timetable schedule preview */}
                <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Teacher Schedule Block</h4>
                  <div className="text-xs space-y-3 font-medium">
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Mon (09:00 AM)</span>
                      <span>Math (Grade 10-A)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Mon (10:00 AM)</span>
                      <span>Physics (Grade 10-A)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Tue (12:00 PM)</span>
                      <span>Math (Grade 10-A)</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>Wed (09:00 AM)</span>
                      <span>Math (Grade 10-A)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. EXAMINATIONS PANEL */}
          {activeCategory === 'exams' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Exams & CBSE Grading Desk</h3>
                <div className="flex gap-2">
                  <button onClick={() => setExamsTab('list')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${examsTab === 'list' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Exams List</button>
                  <button onClick={() => setExamsTab('entry')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${examsTab === 'entry' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Marks Entry</button>
                </div>
              </div>

              {examsTab === 'list' && (
                <div className="space-y-6">
                  {/* Create exam form */}
                  <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exam Title</label>
                      <input required placeholder="Term 1 Algebra Test" value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subject ID</label>
                      <input required placeholder="subj-1" value={examForm.subjectId} onChange={e => setExamForm({...examForm, subjectId: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Max Marks</label>
                      <input type="number" required placeholder="100" value={examForm.maxMarks} onChange={e => setExamForm({...examForm, maxMarks: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500">
                        <Plus className="h-4 w-4" />
                        <span>Schedule Exam</span>
                      </button>
                    </div>
                  </form>

                  {/* List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Evaluations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats?.recentNotices && (
                        <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                          <div className="flex justify-between items-center text-xs">
                            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-bold text-sky-600 uppercase">Algebra Mid-term</span>
                            <span className="font-bold text-zinc-400">Max Marks: 100</span>
                          </div>
                          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Subject: Advanced Mathematics | Class: Grade 10-A</p>
                          <button onClick={() => loadExamMarksSheet('exam-1')} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <span>Open Marks Grader</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {examsTab === 'entry' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <h4>CBSE Roster Marks Entry</h4>
                    <span className="rounded bg-sky-500/10 px-2 py-0.5 text-sky-600 uppercase">Exam ID: {selectedExamId}</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Roll No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Theory Marks (Max 80)</th>
                          <th className="p-3">Internal/Practical (Max 20)</th>
                          <th className="p-3">Total Obtained (Max 100)</th>
                          <th className="p-3">CBSE Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        {examStudents.map((stud, idx) => {
                          const total = parseFloat(stud.marksObtained || 0);
                          const theory = Math.round(total * 0.8);
                          const practical = Math.round(total * 0.2);
                          return (
                            <tr key={stud.studentId}>
                              <td className="p-3 text-zinc-500">{stud.rollNumber}</td>
                              <td className="p-3 font-bold">{stud.firstName} {stud.lastName}</td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={theory}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const newRecords = [...examStudents];
                                    newRecords[idx].marksObtained = Math.min(100, Math.round(val + practical));
                                    setExamStudents(newRecords);
                                  }}
                                  className="w-20 rounded border border-zinc-200 p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={practical}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const newRecords = [...examStudents];
                                    newRecords[idx].marksObtained = Math.min(100, Math.round(theory + val));
                                    setExamStudents(newRecords);
                                  }}
                                  className="w-20 rounded border border-zinc-200 p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                />
                              </td>
                              <td className="p-3 font-bold">{total} / 100</td>
                              <td className="p-3">
                                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                  {getGrade(total, 100)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleSaveExamResults} className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500">Save Marks & Grade Sheet</button>
                    <button onClick={() => setExamsTab('list')} className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* F. ATTENDANCE PANEL */}
          {activeCategory === 'attendance' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4 dark:border-zinc-800">Biometric Attendance Register</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grade Class</label>
                  <select
                    value={selectedClass}
                    onChange={e => loadAttendanceRoster(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <option value="">Select Grade</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Attendance Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={e => setAttendanceDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {selectedClass && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Roll No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        {attendanceRecords.map((rec, idx) => (
                          <tr key={rec.studentId}>
                            <td className="p-3 text-zinc-500">{rec.rollNumber}</td>
                            <td className="p-3 font-bold">{rec.firstName} {rec.lastName}</td>
                            <td className="p-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...attendanceRecords];
                                  list[idx].status = 'PRESENT';
                                  setAttendanceRecords(list);
                                }}
                                className={`rounded px-2.5 py-1 text-[10px] font-bold transition ${rec.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...attendanceRecords];
                                  list[idx].status = 'ABSENT';
                                  setAttendanceRecords(list);
                                }}
                                className={`rounded px-2.5 py-1 text-[10px] font-bold transition ${rec.status === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}
                              >
                                Absent
                              </button>
                            </td>
                            <td className="p-3">
                              <input
                                placeholder="Add remarks..."
                                value={rec.remarks || ''}
                                onChange={(e) => {
                                  const list = [...attendanceRecords];
                                  list[idx].remarks = e.target.value;
                                  setAttendanceRecords(list);
                                }}
                                className="w-full rounded border border-zinc-200 p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button onClick={handleSaveAttendance} className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500">Submit Daily Register</button>
                </div>
              )}
            </div>
          )}

          {/* G. FEES & FINANCE PANEL */}
          {activeCategory === 'fees' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Fees Collections & Financial Ledger</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFeesTab('allocations')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${feesTab === 'allocations' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Fee Desk</button>
                  <button onClick={() => setFeesTab('structures')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${feesTab === 'structures' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Fee Structures</button>
                  <button onClick={() => setFeesTab('ledger')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${feesTab === 'ledger' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>P&L Financial Ledger</button>
                </div>
              </div>

              {feesTab === 'allocations' && (
                <div className="space-y-4">
                  {/* List of allocations */}
                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Particulars</th>
                          <th className="p-3">Amount Due</th>
                          <th className="p-3">Amount Paid</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        {[
                          { id: "alloc-1", studentName: "Alice Miller", feeName: "Term 1 Tuition Fee", due: 1500, paid: 1500, status: "PAID" },
                          { id: "alloc-2", studentName: "Bob Johnson", feeName: "Term 1 Tuition Fee", due: 1500, paid: 500, status: "PARTIAL" },
                          { id: "alloc-3", studentName: "Charlie Brown", feeName: "Term 1 Tuition Fee", due: 1500, paid: 0, status: "UNPAID" }
                        ].map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-bold">{item.studentName}</td>
                            <td className="p-3 text-zinc-500">{item.feeName}</td>
                            <td className="p-3 font-mono">₹{item.due}</td>
                            <td className="p-3 font-mono">₹{item.paid}</td>
                            <td className="p-3">
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' :
                                item.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                              }`}>{item.status}</span>
                            </td>
                            <td className="p-3">
                              {item.status !== 'PAID' && (
                                <button
                                  onClick={() => setPaymentModal({ open: true, allocId: item.id, studentName: item.studentName, amountDue: item.due - item.paid, method: 'ONLINE', remarks: '' })}
                                  className="rounded bg-sky-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-sky-500"
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

                  {paymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-sm">
                      <form onSubmit={handlePayFee} className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Collect payment receipt</h4>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">Student Name</label>
                          <input readOnly value={paymentModal.studentName} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">Amount (₹)</label>
                          <input type="number" required value={paymentModal.amountDue} onChange={e => setPaymentModal({...paymentModal, amountDue: parseFloat(e.target.value) || 0})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">Method</label>
                          <select value={paymentModal.method} onChange={e => setPaymentModal({...paymentModal, method: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950">
                            <option value="CASH">Cash Desk</option>
                            <option value="ONLINE">Online bank transfer</option>
                            <option value="UPI">UPI (BHIM, GPay)</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500">Collect Receipt</button>
                          <button type="button" onClick={() => setPaymentModal(null)} className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {feesTab === 'structures' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const name = (e.target as any).elements.name.value;
                  const amount = (e.target as any).elements.amount.value;
                  const dueDate = (e.target as any).elements.dueDate.value;
                  await createFeeStructureApi({ name, amount, dueDate });
                  triggerToast('Fee structure scheduled!');
                  (e.target as any).reset();
                  loadDashboardStats();
                }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Structure Title</label>
                    <input name="name" required placeholder="Term 2 Tuition Fee" className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Amount (₹)</label>
                    <input name="amount" type="number" required placeholder="3500" className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Due Date</label>
                    <input name="dueDate" type="date" required className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500">
                      <Plus className="h-4 w-4" />
                      <span>Define Fee Structure</span>
                    </button>
                  </div>
                </form>
              )}

              {feesTab === 'ledger' && financeData && (
                <div className="space-y-6">
                  
                  {/* Expense Form */}
                  <form onSubmit={handleCreateExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Expense Title</label>
                      <input required placeholder="Office printer cartridge replacement" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Debit Amount (₹)</label>
                      <input type="number" required placeholder="4200" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Debit Category</label>
                      <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950">
                        <option value="UTILITY">Broadband & Utilities</option>
                        <option value="MAINTENANCE">Academic block maintenance</option>
                        <option value="SALARY">Salaries</option>
                        <option value="OPERATIONAL">Operational costs</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-md hover:bg-red-500">
                        <Plus className="h-4 w-4" />
                        <span>Record Debit Expense</span>
                      </button>
                    </div>
                  </form>

                  {/* Profit & Loss Table */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Profit & Loss (P&L) Statement</h4>
                    <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 p-4 dark:bg-zinc-950/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="font-bold border-b border-zinc-200 pb-2 dark:border-zinc-800">
                            <th className="pb-2">Account Particulars</th>
                            <th className="pb-2 text-right">Income (Credits)</th>
                            <th className="pb-2 text-right">Expense (Debits)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                          <tr>
                            <td className="py-2.5">Tuition & Term Exam Fees Collected</td>
                            <td className="py-2.5 text-right text-emerald-600 font-bold">₹{financeData.totalRevenue}</td>
                            <td className="py-2.5 text-right">-</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Teachers & Employees Base Salaries</td>
                            <td className="py-2.5 text-right">-</td>
                            <td className="py-2.5 text-right text-red-600">₹{financeData.totalSalaries}</td>
                          </tr>
                          {expenses.map(e => (
                            <tr key={e.id}>
                              <td className="py-2.5">{e.title} ({e.category})</td>
                              <td className="py-2.5 text-right">-</td>
                              <td className="py-2.5 text-right text-red-600 flex justify-end items-center gap-1">
                                <span>₹{e.amount}</span>
                                <button onClick={() => handleDeleteExpense(e.id)} className="text-zinc-400 hover:text-red-500 ml-2">
                                  <X className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-zinc-300 font-bold bg-white dark:bg-zinc-950">
                            <td className="py-3">Net Institutional Surplus (Profit)</td>
                            <td colSpan={2} className="py-3 text-right text-sky-600 dark:text-sky-400 font-black text-sm">
                              ₹{financeData.netProfit} ({financeData.profitMargin}% surplus margin)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* H. COMMS HUB */}
          {activeCategory === 'comms' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4 dark:border-zinc-800">Communications Hub</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Circular announcements target selection */}
                <form onSubmit={handleCreateNotice} className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Publish Circular Notice</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Circular Title</label>
                    <input required placeholder="Term exam syllabus distribution details" value={circularForm.title} onChange={e => setCircularForm({...circularForm, title: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Message Content</label>
                    <textarea required placeholder="Write broadcast text..." rows={4} value={circularForm.content} onChange={e => setCircularForm({...circularForm, content: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Target Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {['STUDENT', 'PARENT', 'TEACHER', 'STAFF', 'ACCOUNTANT'].map((r) => {
                        const isSelected = circularForm.targetRoles.includes(r);
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => toggleCircularRole(r)}
                            className={`rounded-full px-3 py-1 text-[10px] font-bold border transition ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit" className="rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white hover:bg-sky-500">Broadcast Circular Notice</button>
                </form>

                {/* WhatsApp & SMS Broadcaster Simulator */}
                <div className="bg-zinc-50/40 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">WhatsApp & SMS Broadcast Simulator</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Target Audience</label>
                    <select value={whatsappGroup} onChange={e => setWhatsappGroup(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-white dark:border-zinc-800 dark:bg-zinc-950">
                      <option value="PARENTS_ALL">All Parents circular (SMS list)</option>
                      <option value="TEACHERS_ALL">All Teachers Block (WhatsApp group)</option>
                      <option value="OFFICE_STAFF">Office staff (WhatsApp group)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">WhatsApp Message Text</label>
                    <textarea placeholder="e.g. Dear Parents, please note that the terminal fees due date is extended..." rows={3} value={whatsappText} onChange={e => setWhatsappText(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-white dark:border-zinc-800 dark:bg-zinc-950" />
                  </div>
                  <button type="button" onClick={handleWhatsappBroadcast} className="w-full rounded-xl bg-indigo-600 py-3.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md">
                    Initiate Delivery Simulation
                  </button>

                  {/* Progress panel */}
                  {broadcastProgress && (
                    <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] space-y-2">
                      <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Delivery Rate</span>
                        <span>{broadcastProgress.current} / {broadcastProgress.total} sent</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 dark:bg-indigo-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(broadcastProgress.current / broadcastProgress.total) * 100}%` }} />
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        {broadcastProgress.log.map((l, i) => <p key={i}>{l}</p>)}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* I. LIBRARY PANEL */}
          {activeCategory === 'library' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Library & Book Circulation Desk</h3>
                <div className="flex gap-2">
                  <button onClick={() => setLibrarySubTab('inventory')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${librarySubTab === 'inventory' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Book Inventory</button>
                  <button onClick={() => setLibrarySubTab('checkout')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${librarySubTab === 'checkout' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Issue Checkout Slip</button>
                  <button onClick={() => setLibrarySubTab('issues')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${librarySubTab === 'issues' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>Active Issues</button>
                </div>
              </div>

              {librarySubTab === 'inventory' && (
                <div className="space-y-6">
                  {/* Create book form */}
                  <form onSubmit={handleCreateBook} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Book Title</label>
                      <input required placeholder="Introduction to Algorithms" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Author</label>
                      <input required placeholder="Thomas H. Cormen" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">ISBN Code</label>
                      <input required placeholder="978-0262033848" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500">
                        <Plus className="h-4 w-4" />
                        <span>Catalogue Book</span>
                      </button>
                    </div>
                  </form>

                  {/* Search and list */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search books in catalogue..."
                        value={bookSearch}
                        onChange={e => { setBookSearch(e.target.value); getBooksApi(e.target.value).then(setBooks); }}
                        className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-4 text-xs font-medium outline-none dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                            <th className="p-3">Title</th>
                            <th className="p-3">Author</th>
                            <th className="p-3">ISBN</th>
                            <th className="p-3">Total Copies</th>
                            <th className="p-3">Available Copies</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                          {books.map((book) => (
                            <tr key={book.id}>
                              <td className="p-3 font-bold">{book.title}</td>
                              <td className="p-3 text-zinc-500">{book.author}</td>
                              <td className="p-3 font-mono">{book.isbn}</td>
                              <td className="p-3">{book.totalCopies}</td>
                              <td className="p-3">
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${book.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                  {book.availableCopies} available
                                </span>
                              </td>
                              <td className="p-3">
                                <button onClick={() => { deleteBookApi(book.id); loadBooks(); }} className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
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

              {librarySubTab === 'checkout' && (
                <form onSubmit={handleIssueBook} className="w-full max-w-md rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/20 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Generate Book Checkout Slip</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Student</label>
                    <select
                      value={issueForm.studentId}
                      onChange={e => setIssueForm({...issueForm, studentId: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.rollNumber})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Book Title</label>
                    <select
                      value={issueForm.bookId}
                      onChange={e => setIssueForm({...issueForm, bookId: e.target.value})}
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <option value="">Select Catalogued Book</option>
                      {books.filter(b => b.availableCopies > 0).map(b => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} left)</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white hover:bg-sky-500 shadow-md">
                    Generate Checkout Slip
                  </button>
                </form>
              )}

              {librarySubTab === 'issues' && (
                <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-3">Book Title</th>
                        <th className="p-3">Issued To</th>
                        <th className="p-3">Issue Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                      {bookIssues.map((issue) => (
                        <tr key={issue.id}>
                          <td className="p-3 font-bold">{issue.book?.title}</td>
                          <td className="p-3">{issue.student?.firstName} {issue.student?.lastName} ({issue.student?.rollNumber})</td>
                          <td className="p-3 text-zinc-500">{new Date(issue.issueDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              issue.status === 'ISSUED' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                            }`}>{issue.status}</span>
                          </td>
                          <td className="p-3">
                            {issue.status === 'ISSUED' && (
                              <button onClick={() => handleReturnBook(issue.id)} className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500">
                                Return Book
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* J. HR & EMPLOYEE SYSTEM */}
          {activeCategory === 'hr' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              
              {/* Header Tab Switcher */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-4 dark:border-zinc-800 gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">HR, Staff Leaves & Payroll Desk</h3>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Manage contracts, salary vouchers, and leave rosters.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setHrTab('employees')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${hrTab === 'employees' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                  >
                    Employees Directory
                  </button>
                  <button 
                    onClick={() => setHrTab('payroll')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${hrTab === 'payroll' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                  >
                    Payroll Slip Vault
                  </button>
                  <button 
                    onClick={() => setHrTab('leaves')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${hrTab === 'leaves' ? 'bg-sky-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                  >
                    Leaves Desk
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: Employees Directory */}
              {hrTab === 'employees' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search employees by name, ID or designation..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-4 text-xs font-medium outline-none dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'INSTITUTE_ADMIN'].includes(currentRole) && (
                      <button
                        onClick={() => setHireModalOpen(true)}
                        className="flex justify-center items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Hire Employee</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Employee ID</th>
                          <th className="p-3">Employee Name</th>
                          <th className="p-3">Designation</th>
                          <th className="p-3">Joining Date</th>
                          <th className="p-3">Monthly Salary</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        {staff.filter(s => {
                          const q = searchQuery.toLowerCase();
                          return s.firstName.toLowerCase().includes(q) ||
                                 s.lastName.toLowerCase().includes(q) ||
                                 s.employeeId.toLowerCase().includes(q) ||
                                 s.designation.toLowerCase().includes(q);
                        }).map((employee) => (
                          <tr key={employee.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                            <td className="p-3">
                              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 font-mono uppercase">
                                {employee.employeeId}
                              </span>
                            </td>
                            <td className="p-3 font-bold">{employee.firstName} {employee.lastName}</td>
                            <td className="p-3 text-zinc-500 text-[11px]">{employee.designation}</td>
                            <td className="p-3 text-zinc-400">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                            <td className="p-3 font-mono font-bold">₹{employee.salary}</td>
                            <td className="p-3">
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                employee.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-500'
                              }`}>{employee.status}</span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedEmployeeId(employee.id)}
                                className="rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-500"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Payroll Slip Vault */}
              {hrTab === 'payroll' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search payslips by employee name or period..."
                        value={payrollSearchQuery}
                        onChange={e => setPayrollSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-4 text-xs font-medium outline-none dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'ACCOUNTANT', 'INSTITUTE_ADMIN'].includes(currentRole) && (
                      <button
                        onClick={() => setPayrollGeneratorOpen(true)}
                        className="flex justify-center items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Generate Salary Slip</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-3">Period</th>
                          <th className="p-3">Employee Name</th>
                          <th className="p-3">Designation</th>
                          <th className="p-3">Voucher Ref</th>
                          <th className="p-3">Base Salary</th>
                          <th className="p-3">Net Take-Home</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                        {payrolls.filter(p => {
                          // If standard staff, filter by their profileId
                          if (['TEACHER', 'LIBRARIAN'].includes(currentRole) && user.profileId) {
                            if (p.staffId !== user.profileId) return false;
                          }
                          const q = payrollSearchQuery.toLowerCase();
                          const staffName = p.staff ? `${p.staff.firstName} ${p.staff.lastName}`.toLowerCase() : '';
                          return staffName.includes(q) || p.month.toLowerCase().includes(q) || p.receiptNumber.toLowerCase().includes(q);
                        }).map((payroll) => (
                          <tr key={payroll.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                            <td className="p-3 font-bold">{payroll.month}</td>
                            <td className="p-3 font-bold">{payroll.staff ? `${payroll.staff.firstName} ${payroll.staff.lastName}` : 'Employee'}</td>
                            <td className="p-3 text-zinc-500 text-[11px]">{payroll.staff?.designation || 'Staff'}</td>
                            <td className="p-3 font-mono text-zinc-400">{payroll.receiptNumber}</td>
                            <td className="p-3 font-mono">₹{payroll.baseSalary}</td>
                            <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">₹{payroll.netPay}</td>
                            <td className="p-3">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 uppercase">
                                {payroll.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedPayroll(payroll)}
                                className="rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-500"
                              >
                                View Slip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Leaves Desk */}
              {hrTab === 'leaves' && (
                <div className="space-y-6">
                  
                  {/* Staff view: Apply form */}
                  {['TEACHER', 'LIBRARIAN', 'STAFF'].includes(currentRole) && (
                    <form onSubmit={handleCreateLeave} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Start Date</label>
                        <input
                          type="date"
                          required
                          value={leaveForm.startDate}
                          onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})}
                          className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">End Date</label>
                        <input
                          type="date"
                          required
                          value={leaveForm.endDate}
                          onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})}
                          className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reason / Details</label>
                        <input
                          required
                          placeholder="Medical appointment / Personal reasons..."
                          value={leaveForm.reason}
                          onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                          className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button type="submit" className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-500">
                          Submit Leave Request
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of leaves */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Leave Applications Desk</h4>
                    <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                            <th className="p-3">Staff Name</th>
                            <th className="p-3">Designation</th>
                            <th className="p-3">Reason</th>
                            <th className="p-3">Interval</th>
                            <th className="p-3">Status</th>
                            {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'INSTITUTE_ADMIN'].includes(currentRole) && <th className="p-3 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                          {leaves.filter(leave => {
                            // If standard staff, filter by profileId
                            if (['TEACHER', 'LIBRARIAN'].includes(currentRole) && user.profileId) {
                              return leave.staffId === user.profileId || leave.staff?.id === user.profileId;
                            }
                            return true;
                          }).map((leave) => (
                            <tr key={leave.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                              <td className="p-3 font-bold">{leave.staff ? `${leave.staff.firstName} ${leave.staff.lastName}` : 'Staff'}</td>
                              <td className="p-3 text-zinc-500 text-[11px]">{leave.staff?.designation}</td>
                              <td className="p-3">{leave.reason}</td>
                              <td className="p-3 text-zinc-400">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</td>
                              <td className="p-3">
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                                  leave.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                                }`}>{leave.status}</span>
                              </td>
                              {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'INSTITUTE_ADMIN'].includes(currentRole) && (
                                <td className="p-3 text-right flex justify-end gap-2">
                                  {leave.status === 'PENDING' && (
                                    <>
                                      <button 
                                        onClick={() => handleApproveLeave(leave.id, 'APPROVED')} 
                                        className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleApproveLeave(leave.id, 'REJECTED')} 
                                        className="rounded bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-500"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </td>
                              )}
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

          {/* K. ANALYTICS PANEL */}
          {activeCategory === 'analytics' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Institutional health analytics</h3>
                <button onClick={() => window.print()} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400">
                  <Printer className="h-4 w-4" />
                  <span>Download Health Report</span>
                </button>
              </div>

              {/* Analytics grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* School Health Report */}
                <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">AI Institutional Audit</h4>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600 uppercase tracking-wider">A+ Standard</span>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Syllabus Completion Index", value: "74.8%", color: "bg-sky-500" },
                      { title: "Biometric attendance Rate", value: "95.8%", color: "bg-indigo-500" },
                      { title: "Library Book Circulation", value: "82.5%", color: "bg-emerald-500" },
                      { title: "Financial collection Rate", value: "85.2%", color: "bg-sky-500" }
                    ].map((idx, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{idx.title}</span>
                          <span>{idx.value}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div className={`h-full ${idx.color}`} style={{ width: idx.value }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit recommendation */}
                <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Operations Suggestion</h4>
                  <div className="rounded-xl bg-white p-4 border border-zinc-100 text-xs dark:bg-zinc-900 dark:border-zinc-800 font-medium leading-relaxed space-y-3">
                    <p className="text-zinc-600 dark:text-zinc-300">
                      💡 **Collections Alert**: ₹{stats?.feeOverview?.totalPending || 0} in tuition fees is currently overdue. Sending WhatsApp notices in Comms Hub is recommended.
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      💡 **Biometric Sync**: Biometric punch rates are peak at 08:45 AM. Terminal network load is nominal.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* L. SETTINGS PANEL */}
          {activeCategory === 'settings' && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4 dark:border-zinc-800">Settings & Administration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* DB Backup Simulator */}
                <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Database Backup Console</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Backup your schema and institutional records securely to cloud vault dumps.</p>
                  
                  <button
                    disabled={backupRunning}
                    onClick={runDbBackup}
                    className="flex justify-center items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white hover:bg-sky-500 shadow-md disabled:opacity-50"
                  >
                    {backupRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    <span>{backupRunning ? 'Backing up records...' : 'Initiate Secure Dump Backup'}</span>
                  </button>

                  {backupLog.length > 0 && (
                    <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-[10px] font-mono text-zinc-400 space-y-1.5">
                      {backupLog.map((log, i) => (
                        <p key={i} className={log.includes('SUCCESS') ? 'text-emerald-500' : 'text-sky-400'}>{log}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Role Permission manager */}
                <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role Access Controls Matrix</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Configure terminal visibility of sub-desks for your roles.</p>
                  <div className="text-xs space-y-3 font-bold text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Super Admin</span>
                      <span className="text-[10px] text-sky-600">All access</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Librarian</span>
                      <span className="text-[10px] text-sky-600">Dashboard, Library</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Accountant</span>
                      <span className="text-[10px] text-sky-600">Dashboard, Fees, HR payroll</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                      <span>Student</span>
                      <span className="text-[10px] text-sky-600">Dashboard, Academics, Comms</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* AI ASSISTANT SLIDE-OUT PANEL */}
      {aiAssistantOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white border-l border-zinc-200 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 flex flex-col transition-all duration-300 animate-slide-left">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-white">AI Operations Desk</h4>
            </div>
            <button onClick={() => setAiAssistantOpen(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {aiChatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white font-medium'
                    : 'bg-zinc-50 text-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 border border-zinc-100/50 dark:border-zinc-800/40'
                }`}>
                  {msg.text.split('\n').map((line: string, lineIdx: number) => {
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={lineIdx} className="ml-2 list-disc">{line.replace(/^[-*]\s*/, '')}</li>;
                    }
                    return <p key={lineIdx} className="mb-1">{line}</p>;
                  })}
                </div>
              </div>
            ))}
            
            {aiTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 bg-zinc-50 text-zinc-400 dark:bg-zinc-950/40 border border-zinc-100/50 dark:border-zinc-800/40 text-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Presets & Input */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                "Institutional health report",
                "Overdue library books",
                "Who is absent today?",
                "Analyze collections balance"
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerAiQuery(p)}
                  className="rounded-lg border border-zinc-200 px-2 py-1 text-[9px] font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400"
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!aiChatQuery) return;
              triggerAiQuery(aiChatQuery);
              setAiChatQuery('');
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask assistant query..."
                value={aiChatQuery}
                onChange={e => setAiChatQuery(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
              <button type="submit" className="rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-500 shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Advanced HR Overlays & Modals */}
      {selectedEmployeeId && (
        <EmployeeModal
          employeeId={selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
          onSaved={() => { loadStaff(); }}
        />
      )}
      {hireModalOpen && (
        <HireFormModal
          onClose={() => setHireModalOpen(false)}
          onSaved={() => { loadStaff(); }}
        />
      )}
      {payrollGeneratorOpen && (
        <PayslipGeneratorModal
          staffList={staff}
          onClose={() => setPayrollGeneratorOpen(false)}
          onSaved={() => { loadPayrolls(); loadFinanceOverview(); loadDashboardStats(); }}
        />
      )}
      {selectedPayroll && (
        <PayslipModal
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}

    </div>
  );
}
