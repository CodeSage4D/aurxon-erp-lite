'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Sparkles, Bell, Sun, Moon, ChevronRight } from 'lucide-react';

import {
  getDashboardStatsApi,
  getStudentsApi,
  getClassesApi,
  getStaffApi,
  getNoticesApi,
  getLeavesApi,
  getLessonPlansApi,
  getExpensesApi,
  getFinanceOverviewApi,
  getBooksApi,
  getIssuesApi,
  getPayrollsApi,
  getVisitorsApi,
  getInventoryApi,
  getSettingsApi,
  getBranchesApi,
  getNotificationsApi,
  markNotificationsReadApi,
  getPromotionHistoryApi,
  getTimetableApi,
  getClassAttendanceApi,
  submitAttendanceApi,
  payFeeApi,
  createStudentApi,
  createBookApi,
  issueBookApi,
  returnBookApi,
  createExamApi,
  getExamResultsApi,
  submitExamResultsApi,
  promoteStudentsApi,
  createExpenseApi,
  updateSettingsApi,
  createBranchApi
} from '@/lib/api';

// Overlay Modals
import EmployeeModal from '@/components/hr/EmployeeModal';
import HireFormModal from '@/components/hr/HireFormModal';
import PayslipModal from '@/components/hr/PayslipModal';
import PayslipGeneratorModal from '@/components/hr/PayslipGeneratorModal';

// Sub-components Tab Sheets
import Sidebar from '@/components/dashboard/Sidebar';
import CommandPalette from '@/components/dashboard/CommandPalette';
import AiAssistant from '@/components/dashboard/AiAssistant';
import OverviewTab from '@/components/dashboard/OverviewTab';
import AcademicTab from '@/components/dashboard/AcademicTab';
import StudentsTab from '@/components/dashboard/StudentsTab';
import ExamsTab from '@/components/dashboard/ExamsTab';
import AttendanceTab from '@/components/dashboard/AttendanceTab';
import FeesTab from '@/components/dashboard/FeesTab';
import CommsTab from '@/components/dashboard/CommsTab';
import LibraryTab from '@/components/dashboard/LibraryTab';
import GateTab from '@/components/dashboard/GateTab';
import CertificatesTab from '@/components/dashboard/CertificatesTab';
import InventoryTab from '@/components/dashboard/InventoryTab';
import HrTab from '@/components/dashboard/HrTab';
import SettingsTab from '@/components/dashboard/SettingsTab';

export default function DashboardPage() {
  const router = useRouter();
  
  // Auth & Roles States
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState('STUDENT');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Navigation & Category States
  const [activeCategory, setActiveCategory] = useState('overview');
  const [feesTab, setFeesTab] = useState<'allocations' | 'structures' | 'ledger'>('allocations');
  const [examsTab, setExamsTab] = useState<'list' | 'entry'>('list');
  const [academicTab, setAcademicTab] = useState<'timetable' | 'lessons'>('timetable');
  const [studentTab, setStudentTab] = useState<'list' | 'admission' | 'promotions'>('list');
  const [hrTab, setHrTab] = useState<'employees' | 'payroll' | 'leaves'>('employees');
  const [librarySubTab, setLibrarySubTab] = useState<'inventory' | 'checkout' | 'issues'>('inventory');

  // Steppers
  const [admissionWizardStep, setAdmissionWizardStep] = useState(1);

  // Dialog states
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
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ academicYear: '2026-2027', gradingSystem: 'CBSE', timezone: 'Asia/Kolkata', currency: 'INR' });
  const [branches, setBranches] = useState<any[]>([]);
  const [promotionsHistory, setPromotionsHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Selection states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Forms / Intermediates
  const [studentForm, setStudentForm] = useState({
    firstName: '', lastName: '', email: '', rollNumber: '', classId: '', dateOfBirth: '2010-01-01', gender: 'MALE',
    aadhaarNumber: '', samagraId: '', familyId: '', penNumber: '', birthCertificateNumber: '', bloodGroup: '',
    religion: '', casteCategory: 'GENERAL', nationality: 'Indian', motherTongue: '', fatherName: '', motherName: '',
    fatherOccupation: '', motherOccupation: '', annualIncome: '', houseNo: '', street: '', city: '', district: '',
    state: '', pinCode: '', bankName: '', accHolderName: '', accNumber: '', ifscCode: '', bankBranch: '',
    prevSchoolName: '', tcNumber: '', migrationCertNo: '', parentPhone: ''
  });
  const [examForm, setExamForm] = useState({ name: '', subjectId: '', maxMarks: '100', examDate: '', examType: 'UNIT_TEST' });
  const [feeForm, setFeeForm] = useState({ name: '', amount: '', dueDate: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'OPERATIONAL', paymentMethod: 'CASH' });
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examStudents, setExamStudents] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  // Timetable
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState('');
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [timetablePreview, setTimetablePreview] = useState<any[] | null>(null);
  const [schedulerConfig, setSchedulerConfig] = useState({ periodsPerDay: 6, durationMin: 45, startTime: '08:30' });

  // Attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Advanced HR Overlays
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [payrollGeneratorOpen, setPayrollGeneratorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);

  // Promotions
  const [promotionSelectedStudents, setPromotionSelectedStudents] = useState<string[]>([]);
  const [promotionTargetClassId, setPromotionTargetClassId] = useState('');

  // RFID Biometric Logs
  const [rfidLogs, setRfidLogs] = useState<string[]>([
    "RFID scan at 10:45:12 AM: Student Alice Miller (ROLL-10A-01) checked in at Main Gate - PRESENT",
    "RFID scan at 10:48:44 AM: Student Bob Johnson (ROLL-10A-02) checked in at Main Gate - PRESENT",
    "Biometric scan at 10:52:19 AM: Teacher Sarah Connor checked in at Academic Block - PRESENT"
  ]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Auth Guard & Core Loader
  useEffect(() => {
    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(cached);
    setUser(parsed);
    setCurrentRole(parsed.role);

    // Initial sync
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
    loadVisitors();
    loadInventory();
    loadSettings();
    loadBranches();
    loadNotifications();
    loadPromotionsHistory();

    // Setup command shortcut (Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Biometric Real-time Simulator
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

  // Sync Timetable on Class change
  useEffect(() => {
    if (selectedAcademicClassId) {
      loadTimetable(selectedAcademicClassId);
    }
  }, [selectedAcademicClassId]);

  // Loader implementations
  const loadDashboardStats = async () => setStats(await getDashboardStatsApi());
  const loadStudents = async () => setStudents(await getStudentsApi());
  const loadClasses = async () => {
    const data = await getClassesApi();
    setClasses(data);
    if (data.length > 0) {
      setSelectedAcademicClassId(prev => prev || data[0].id);
    }
  };
  const loadStaff = async () => setStaff(await getStaffApi());
  const loadNotices = async () => setNotices(await getNoticesApi());
  const loadLeaves = async () => setLeaves(await getLeavesApi());
  const loadLessonPlans = async () => setLessonPlans(await getLessonPlansApi());
  const loadExpenses = async () => setExpenses(await getExpensesApi());
  const loadFinanceOverview = async () => setFinanceData(await getFinanceOverviewApi());
  const loadBooks = async () => setBooks(await getBooksApi(bookSearch));
  const loadIssues = async () => setBookIssues(await getIssuesApi());
  const loadPayrolls = async () => setPayrolls(await getPayrollsApi());
  const loadVisitors = async () => setVisitors(await getVisitorsApi());
  const loadInventory = async () => setInventory(await getInventoryApi());
  const loadSettings = async () => setSettings(await getSettingsApi());
  const loadBranches = async () => setBranches(await getBranchesApi());
  const loadNotifications = async () => setNotifications(await getNotificationsApi());
  const loadPromotionsHistory = async () => setPromotionsHistory(await getPromotionHistoryApi());

  const loadTimetable = async (classId: string) => {
    if (!classId) return;
    try {
      const data = await getTimetableApi(classId);
      setTimetableEntries(data);
      setTimetablePreview(null);
    } catch (err) {
      console.error('Failed to load timetable', err);
    }
  };

  const loadAttendanceRoster = async (classId: string) => {
    setSelectedClass(classId);
    if (!classId) return;
    const data = await getClassAttendanceApi(classId, attendanceDate);
    setAttendanceRecords(data);
  };

  const loadExamMarksSheet = async (examId: string) => {
    setSelectedExamId(examId);
    if (!examId) return;
    const studentsList = await getExamResultsApi(examId);
    setExamStudents(studentsList);
    setExamsTab('entry');
  };

  // Mutator Actions
  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    triggerToast(`Switched active view scope to: ${role}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsReadApi();
      loadNotifications();
      triggerToast('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    router.push('/');
  };

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
        prevSchoolName: '', tcNumber: '', migrationCertNo: '', parentPhone: ''
      });
      loadStudents();
      setStudentTab('list');
      setAdmissionWizardStep(1);
    } catch (err: any) {
      alert(err.message || 'Admissions failed.');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      await submitAttendanceApi(selectedClass, attendanceDate, attendanceRecords);
      triggerToast('Daily attendance roster submitted successfully!');
    } catch (err) {
      alert('Attendance save error');
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExamApi(examForm);
      triggerToast('Exam scheduled and grading parameters defined.');
      setExamForm({ name: '', subjectId: '', maxMarks: '100', examDate: '', examType: 'UNIT_TEST' });
      loadDashboardStats();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule exam');
    }
  };

  const handleSaveExamResults = async () => {
    try {
      await submitExamResultsApi(selectedExamId, examStudents);
      triggerToast('Examination marks saved and graded!');
      setExamsTab('list');
    } catch (err: any) {
      alert(err.message || 'Failed to save results');
    }
  };

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
      loadPromotionsHistory();
      setStudentTab('promotions');
    } catch (err) {
      alert('Promotion failure');
    }
  };

  if (!user) {
    return <div className="p-8 text-center text-zinc-500 font-medium">Authorizing credentials. Syncing ERP modules...</div>;
  }

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
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        setActiveCategory={setActiveCategory}
        setStudentTab={setStudentTab}
        setLibrarySubTab={setLibrarySubTab}
        handleRoleChange={handleRoleChange}
        setAiAssistantOpen={setAiAssistantOpen}
      />

      {/* SIDEBAR FOR DESKTOP */}
      <Sidebar 
        user={user}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        notifications={notifications}
        setNotificationsOpen={setNotificationsOpen}
        handleLogout={handleLogout}
      />

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-zinc-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* DYNAMIC CONTENT MAIN AREA */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        
        {/* HEADER */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }} 
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
              <span className="uppercase">AURXON</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-sky-600 dark:text-sky-400 capitalize">{activeCategory} desk</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
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

            <button
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-400 transition"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden md:inline">Ask AI Assistant</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.filter((n: any) => !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Real-time Alerts</p>
                    <div className="flex items-center gap-2">
                      {notifications.filter((n: any) => !n.isRead).length > 0 && (
                        <button 
                          onClick={handleMarkAllRead} 
                          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline" onClick={() => setNotificationsOpen(false)}>Close</button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-4 font-medium">No alerts at the moment.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`rounded-lg p-2.5 border text-xs transition ${
                          n.isRead 
                            ? 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-100/50 dark:border-zinc-850' 
                            : 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100/40 dark:border-indigo-900/30'
                        }`}>
                          <div className="flex justify-between items-start font-bold text-zinc-800 dark:text-zinc-200 gap-2">
                            <span className="flex-1 font-bold">{n.title}</span>
                            {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1" />}
                          </div>
                          <p className="mt-1 text-[11px] text-zinc-550 dark:text-zinc-400 leading-normal">{n.content}</p>
                          <p className="mt-1.5 text-[9px] text-zinc-450 font-medium">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition"
            >
              <Sun className="h-4.5 w-4.5 hidden dark:block" />
              <Moon className="h-4.5 w-4.5 dark:hidden" />
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT SHEETS */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {activeCategory === 'overview' && stats && (
            <OverviewTab
              stats={stats}
              students={students}
              staff={staff}
              classes={classes}
              rfidLogs={rfidLogs}
              notices={notices}
              triggerToast={triggerToast}
              setActiveCategory={setActiveCategory}
              setStudentTab={setStudentTab}
              setAdmissionWizardStep={setAdmissionWizardStep}
              setLibrarySubTab={setLibrarySubTab}
              setFeesTab={setFeesTab}
              setExamsTab={setExamsTab}
              setAcademicTab={setAcademicTab}
              setAttendanceDate={setAttendanceDate}
              setSelectedClass={setSelectedClass}
              loadAttendanceRoster={loadAttendanceRoster}
              setFeeForm={setFeeForm}
              setPromotionTargetClassId={setPromotionTargetClassId}
              setPromotionSelectedStudents={setPromotionSelectedStudents}
              setStudentForm={setStudentForm}
            />
          )}

          {activeCategory === 'academic' && (
            <AcademicTab 
              classes={classes}
              selectedAcademicClassId={selectedAcademicClassId}
              setSelectedAcademicClassId={setSelectedAcademicClassId}
              timetablePreview={timetablePreview}
              setTimetablePreview={setTimetablePreview}
              timetableEntries={timetableEntries}
              loadTimetable={loadTimetable}
              schedulerConfig={schedulerConfig}
              setSchedulerConfig={setSchedulerConfig}
              currentRole={currentRole}
              user={user}
              triggerToast={triggerToast}
              academicTab={academicTab}
              setAcademicTab={setAcademicTab}
              selectedClass={selectedClass}
              subjectsList={subjectsList}
              lessonPlans={lessonPlans}
              loadLessonPlans={loadLessonPlans}
            />
          )}

          {activeCategory === 'students' && (
            <StudentsTab 
              students={students}
              classes={classes}
              studentTab={studentTab}
              setStudentTab={setStudentTab}
              admissionWizardStep={admissionWizardStep}
              setAdmissionWizardStep={setAdmissionWizardStep}
              studentForm={studentForm}
              setStudentForm={setStudentForm}
              handleCreateStudent={handleCreateStudent}
              promotionSelectedStudents={promotionSelectedStudents}
              setPromotionSelectedStudents={setPromotionSelectedStudents}
              promotionTargetClassId={promotionTargetClassId}
              setPromotionTargetClassId={setPromotionTargetClassId}
              handlePromoteStudents={handlePromoteStudents}
              promotionsHistory={promotionsHistory}
              loadStudents={loadStudents}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'exams' && (
            <ExamsTab 
              examsTab={examsTab}
              setExamsTab={setExamsTab}
              examForm={examForm}
              setExamForm={setExamForm}
              handleCreateExam={handleCreateExam}
              stats={stats}
              loadExamMarksSheet={loadExamMarksSheet}
              selectedExamId={selectedExamId}
              examStudents={examStudents}
              setExamStudents={setExamStudents}
              handleSaveExamResults={handleSaveExamResults}
            />
          )}

          {activeCategory === 'attendance' && (
            <AttendanceTab 
              classes={classes}
              selectedClass={selectedClass}
              loadAttendanceRoster={loadAttendanceRoster}
              attendanceDate={attendanceDate}
              setAttendanceDate={setAttendanceDate}
              attendanceRecords={attendanceRecords}
              setAttendanceRecords={setAttendanceRecords}
              handleSaveAttendance={handleSaveAttendance}
              rfidLogs={rfidLogs}
            />
          )}

          {activeCategory === 'fees' && financeData && (
            <FeesTab 
              feesTab={feesTab}
              setFeesTab={setFeesTab}
              financeData={financeData}
              expenses={expenses}
              expenseForm={expenseForm}
              setExpenseForm={setExpenseForm}
              loadExpenses={loadExpenses}
              loadFinanceOverview={loadFinanceOverview}
              loadDashboardStats={loadDashboardStats}
              triggerToast={triggerToast}
              feeForm={feeForm}
              setFeeForm={setFeeForm}
            />
          )}

          {activeCategory === 'comms' && (
            <CommsTab 
              staff={staff}
              students={students}
              loadNotices={loadNotices}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'library' && (
            <LibraryTab 
              librarySubTab={librarySubTab}
              setLibrarySubTab={setLibrarySubTab}
              students={students}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'gate' && (
            <GateTab 
              staff={staff}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'certificates' && (
            <CertificatesTab 
              students={students}
              staff={staff}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'inventory' && (
            <InventoryTab 
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'hr' && (
            <HrTab 
              hrTab={hrTab}
              setHrTab={setHrTab}
              currentRole={currentRole}
              user={user}
              staff={staff}
              loadStaff={loadStaff}
              payrolls={payrolls}
              loadPayrolls={loadPayrolls}
              leaves={leaves}
              loadLeaves={loadLeaves}
              setSelectedEmployeeId={setSelectedEmployeeId}
              setHireModalOpen={setHireModalOpen}
              setPayrollGeneratorOpen={setPayrollGeneratorOpen}
              setSelectedPayroll={setSelectedPayroll}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'settings' && (
            <SettingsTab 
              settings={settings}
              setSettings={setSettings}
              branches={branches}
              loadBranches={loadBranches}
              promotionsHistory={promotionsHistory}
              loadPromotionsHistory={loadPromotionsHistory}
              triggerToast={triggerToast}
            />
          )}

        </div>
      </main>

      {/* AI ASSISTANT SLIDE-OUT PANEL */}
      <AiAssistant 
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        students={students}
        classes={classes}
        staff={staff}
        books={books}
        bookIssues={bookIssues}
        stats={stats}
        expenses={expenses}
      />

      {/* ADVANCED HR OVERLAYS & MODALS */}
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
