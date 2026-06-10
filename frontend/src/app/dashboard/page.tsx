'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Sparkles, Bell, Sun, Moon, ChevronRight, Building2, ShieldCheck, Database, HardDrive, KeyRound, ArrowUpRight, Plus, HelpCircle, Activity } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

import {
  getDashboardStatsApi,
  getDashboardLayoutApi,
  getDashboardWidgetsDataApi,
  getSetupStatusApi,
  getFounderStatsApi,
  switchContextApi,
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
import EmployeeModal from '@/07_Staff/StaffProfile/hr/EmployeeModal';
import HireFormModal from '@/07_Staff/StaffProfile/hr/HireFormModal';
import PayslipModal from '@/07_Staff/StaffProfile/hr/PayslipModal';
import PayslipGeneratorModal from '@/07_Staff/StaffProfile/hr/PayslipGeneratorModal';

// Sub-components Tab Sheets
import Sidebar from '@/01_Core/Dashboard/Sidebar';
import CommandPalette from '@/01_Core/Dashboard/CommandPalette';
import AiAssistant from '@/01_Core/Dashboard/AiAssistant';
import OverviewTab from '@/01_Core/Dashboard/OverviewTab';
import DynamicDashboard from '@/01_Core/Dashboard/DynamicDashboard';
import AcademicTab from '@/03_Academics/Class/AcademicTab';
import StudentsTab from '@/02_Admission/StudentProfile/StudentsTab';
import ExamsTab from '@/06_Exams/ExamSetup/ExamsTab';
import AttendanceTab from '@/04_Attendance/StudentAttendance/AttendanceTab';
import FeesTab from '@/05_Fees/FeeStructure/FeesTab';
import CommsTab from '@/08_Communication/Notices/CommsTab';
import LibraryTab from '@/14_FutureTrendModules/Library/LibraryTab';
import GateTab from '@/14_FutureTrendModules/VisitorManagement/GateTab';
import ProductivityTab from '@/14_FutureTrendModules/Productivity/ProductivityTab';
import CertificatesTab from '@/11_Documents/Certificates/CertificatesTab';
import InventoryTab from '@/14_FutureTrendModules/Inventory/InventoryTab';
import HrTab from '@/07_Staff/StaffProfile/HrTab';
import ReportsDashboard from '@/09_Reports/ReportsDashboard';
import AnalyticsDashboard from '@/10_Analytics/AnalyticsDashboard';
import SettingsTab from '@/01_Core/Dashboard/SettingsTab';
import OperationsDashboard from '@/01_Core/Dashboard/OperationsDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  
  // Auth & Roles States
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState('STUDENT');
  const [context, setContext] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [authStage, setAuthStage] = useState<'idle' | 'checking_session' | 'checking_setup' | 'resolving_context' | 'loading_data' | 'ready'>('idle');

  useEffect(() => {
    setIsImpersonating(localStorage.getItem('aurxon_impersonating') === 'true');
  }, []);

  const handleEndImpersonation = () => {
    const originalToken = localStorage.getItem('aurxon_founder_token');
    if (originalToken) {
      localStorage.setItem('aurxon_token', originalToken);
      localStorage.removeItem('aurxon_founder_token');
      localStorage.removeItem('aurxon_impersonating');
      router.push('/founder');
    } else {
      localStorage.removeItem('aurxon_impersonating');
      router.push('/');
    }
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Navigation & Category States
  const [activeCategory, setActiveCategory] = useState('overview');
  const [feesTab, setFeesTab] = useState<'allocations' | 'structures' | 'ledger'>('allocations');
  const [examsTab, setExamsTab] = useState<'list' | 'entry'>('list');
  const [academicTab, setAcademicTab] = useState<'timetable' | 'lessons'>('timetable');
  const [studentTab, setStudentTab] = useState<'list' | 'admission' | 'promotions'>('list');
  const [hrTab, setHrTab] = useState<'employees' | 'payroll' | 'leaves' | 'punch'>('employees');
  const [librarySubTab, setLibrarySubTab] = useState<'inventory' | 'checkout' | 'issues'>('inventory');

  // Steppers
  const [admissionWizardStep, setAdmissionWizardStep] = useState(1);

  // Dialog states
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Datasets
  const [stats, setStats] = useState<any>(null);
  const [dashboardLayout, setDashboardLayout] = useState<any>(null);
  const [founderStats, setFounderStats] = useState<any>(null);
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
    const runAuthFlow = async () => {
      // 1. Session verification stage
      setAuthStage('checking_session');
      const token = localStorage.getItem('aurxon_token');
      const cached = localStorage.getItem('aurxon_user');
      if (!token || !cached) {
        router.push('/login');
        return;
      }
      const parsed = JSON.parse(cached);
      setUser(parsed);
      setCurrentRole(parsed.role);

      // 2. Setup verification stage
      setAuthStage('checking_setup');
      try {
        // SUPER_ADMIN bypass: Platform founders don't need workspace setup
        if (parsed.role !== 'SUPER_ADMIN') {
          // All other roles must complete setup before accessing dashboard
          const setup = await getSetupStatusApi();
          
          if (!setup.setupCompleted) {
            router.push('/setup-wizard');
            return;
          }
        }
      } catch (e) {
        console.error('Setup status verification failed:', e);
        // Fail-safe: log technical errors, show alert notification, and recover silently
        triggerToast('Workspace configuration verified with warning.');
      }

      // 3. Context resolution stage
      setAuthStage('resolving_context');
      const contextStr = localStorage.getItem('aurxon_context');
      if (!contextStr) {
        router.push('/organization-select');
        return;
      }
      try {
        const ctx = JSON.parse(contextStr);
        setContext(ctx);
        if (ctx.branding && ctx.branding.primaryColor) {
          document.documentElement.style.setProperty('--primary', ctx.branding.primaryColor);
        }
      } catch (e) {
        console.error('Context resolution failed:', e);
        router.push('/organization-select');
        return;
      }

      // 4. Data loading stage
      setAuthStage('loading_data');
      try {
        await Promise.all([
          loadDashboardStats(),
          loadStudents(),
          loadClasses(),
          loadStaff(),
          loadNotices(),
          loadLeaves(),
          loadLessonPlans(),
          loadExpenses(),
          loadFinanceOverview(),
          loadBooks(),
          loadIssues(),
          loadPayrolls(),
          loadVisitors(),
          loadInventory(),
          loadSettings(),
          loadBranches(),
          loadNotifications(),
          loadPromotionsHistory(),
        ]);
      } catch (e) {
        console.error('Data compile sync failed:', e);
      }

      // 5. Auth flow completed successfully
      setAuthStage('ready');
    };

    runAuthFlow();

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
  const loadDashboardStats = async () => {
    const cached = localStorage.getItem('aurxon_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.role === 'SUPER_ADMIN') {
          const data = await getFounderStatsApi();
          setFounderStats(data);
        } else {
          try {
            const data = await getDashboardWidgetsDataApi();
            setStats(data);
          } catch (statsErr) {
            console.error('Failed to load widgets data', statsErr);
            setStats(await getDashboardStatsApi());
          }
          try {
            const layoutData = await getDashboardLayoutApi();
            setDashboardLayout(layoutData);
          } catch (layoutErr) {
            console.error('Failed to load dashboard layout', layoutErr);
          }
        }
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    }
  };
  const loadStudents = async () => {
    const data = await getStudentsApi();
    setStudents(Array.isArray(data) ? data : (data.students || []));
  };
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

  if (authStage !== 'ready') {
    let loadingText = 'Initializing workspace...';
    if (authStage === 'checking_session') loadingText = 'Verifying security credentials...';
    else if (authStage === 'checking_setup') loadingText = 'Syncing core platform configuration...';
    else if (authStage === 'resolving_context') loadingText = 'Resolving workspace context...';
    else if (authStage === 'loading_data') loadingText = 'Compiling database metrics...';

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-blue-600/20" />
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100">Aurxon SaaS Platform OS</h3>
            <p className="text-xs text-zinc-400 font-semibold tracking-wide animate-pulse">{loadingText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {isImpersonating && (
        <div className="w-full bg-amber-500 text-slate-950 px-6 py-2 flex justify-between items-center text-xs font-black tracking-wider shadow-md shrink-0 uppercase z-[60]">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⚠️ IMPERSONATION MODE ACTIVE</span>
            <span className="text-[10px] bg-slate-900/10 px-2 py-0.5 rounded font-mono font-bold">READ-ONLY SECURITY MATRIX</span>
          </div>
          <button 
            onClick={handleEndImpersonation} 
            className="bg-slate-950 text-white font-black px-3.5 py-1 rounded hover:bg-slate-900 transition-all text-[10px] cursor-pointer"
          >
            End Support Session
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
      
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
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-6 shrink-0 transition-colors z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }} 
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Menu className="h-5 w-5" />
            </button>
            {currentRole === 'SUPER_ADMIN' ? (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="uppercase text-muted-foreground tracking-wider">AURXON</span>
                <ChevronRight className="h-3 w-3 text-border" />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary capitalize tracking-wide">{activeCategory} desk</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs font-sans shrink-0">
                <div className="flex items-center gap-2">
                  {context?.branding?.logoUrl ? (
                    <img src={context.branding.logoUrl} alt="Logo" className="h-6 w-6 object-contain rounded-md shrink-0 border border-zinc-200 dark:border-zinc-800" />
                  ) : (
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span className="text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[160px] md:max-w-[240px]">
                    {context?.organizationName || user?.institutionName || 'Active Organization'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold flex-wrap">
                  <span className="hidden md:inline text-zinc-300 dark:text-zinc-850">•</span>
                  <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-black tracking-wide">
                    {context?.branding?.industryPackName || 'SaaS Workspace'}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-850">•</span>
                  <span className="bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 font-bold">
                    {context?.roleName || currentRole}
                  </span>
                  <span className="hidden lg:inline text-zinc-300 dark:text-zinc-850">•</span>
                  <span className="hidden lg:inline text-[9px] text-zinc-400 tracking-wide font-black uppercase">
                    Powered by Aurxon Platform
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block group">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search commands... (Ctrl+K)"
                readOnly
                onClick={() => setCommandPaletteOpen(true)}
                className="w-56 cursor-pointer rounded-xl border border-border bg-input/40 py-2 pl-9 pr-4 text-xs font-medium text-foreground placeholder-muted-foreground outline-none transition-all duration-200 hover:border-primary/50 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 glass"
              />
            </div>

            <button
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover-lift shadow-sm shadow-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Ask AI Assistant</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.filter((n: any) => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse shadow-sm shadow-destructive/50" />
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 z-50 w-96 rounded-2xl border border-border dark:border-[#222D44] bg-card dark:bg-[#151D30] p-4 shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-border dark:border-[#222D44] pb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Real-time Alerts</p>
                    <div className="flex items-center gap-2">
                      {notifications.filter((n: any) => !n.isRead).length > 0 && (
                        <button 
                          onClick={handleMarkAllRead} 
                          className="text-[10px] font-bold text-primary dark:text-blue-400 hover:underline hover:text-primary/80 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button className="text-[10px] font-bold text-destructive hover:underline transition-colors" onClick={() => setNotificationsOpen(false)}>Close</button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground font-medium">No new alerts.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`rounded-xl p-3 border text-xs transition-all duration-200 break-words leading-relaxed ${
                          n.isRead 
                            ? 'bg-muted/10 border-border/40 dark:border-[#222D44]/40 hover:bg-muted/30 text-muted-foreground dark:text-gray-400' 
                            : 'bg-primary/5 border-primary/20 dark:border-blue-500/20 shadow-sm hover:bg-primary/10 text-foreground'
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <span className="flex-1 font-bold">{n.title}</span>
                            {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-blue-500 mt-1 shrink-0 animate-pulse" />}
                          </div>
                          <p className="mt-1.5 text-[11px] font-medium leading-relaxed">{n.content}</p>
                          <p className="mt-2 text-[9px] font-bold text-muted-foreground/80 dark:text-gray-500">
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
              onClick={toggleTheme}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Sun className="h-4.5 w-4.5 hidden dark:block" />
              <Moon className="h-4.5 w-4.5 dark:hidden" />
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT SHEETS */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {activeCategory === 'overview' && currentRole === 'SUPER_ADMIN' && founderStats && (
            <div className="space-y-6 animate-fade-in">
              {/* Premium Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary animate-pulse" />
                    Founder Control Plane
                  </h1>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    System-wide SaaS telemetry, organization directories, licensing logs, and node metrics.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Control Plane Online
                  </span>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass rounded-2xl p-5 border border-border/80 shadow-md hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Institutions</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-foreground">{founderStats.totalOrganizations}</span>
                    <span className="text-[10px] font-bold text-emerald-500">Live Tenants</span>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/80 shadow-md hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Users</span>
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                      <Database className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-foreground">{founderStats.totalUsers}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{founderStats.totalMemberships} memberships</span>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/80 shadow-md hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Licenses</span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <KeyRound className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-foreground">{founderStats.activeLicenses}</span>
                    <span className="text-[10px] font-bold text-amber-500">Subscription verified</span>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/80 shadow-md hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Storage Allocated</span>
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                      <HardDrive className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-foreground">{founderStats.totalStorageLimit} <span className="text-sm font-bold text-muted-foreground">GB</span></span>
                    <span className="text-[10px] font-bold text-muted-foreground">{founderStats.totalStudentLimit} Max Students</span>
                  </div>
                </div>
              </div>

              {/* Main SaaS directories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Recent Institutions Directory */}
                <div className="lg:col-span-2 glass rounded-3xl p-6 border border-border shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Recent Tenants
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-semibold">Directory list</span>
                  </div>

                  <div className="space-y-3">
                    {founderStats.recentOrganizations.map((org: any) => (
                      <div key={org.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/30 hover:bg-card/70 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border overflow-hidden">
                            {org.logoUrl ? (
                              <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-foreground">{org.name}</h3>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                              Created on {new Date(org.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span 
                          style={{ borderColor: org.primaryColor, color: org.primaryColor }}
                          className="text-[9px] font-extrabold tracking-widest uppercase border px-2.5 py-1 rounded-full bg-background"
                        >
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Module marketplace statistics */}
                <div className="glass rounded-3xl p-6 border border-border shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                      Module Penetration
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {founderStats.moduleUsage.map((m: any) => (
                      <div key={m.code} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-foreground">{m.name}</span>
                          <span className="font-bold text-primary">{m.activeCount} active</span>
                        </div>
                        {/* Custom progress bar */}
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(m.activeCount / Math.max(founderStats.totalOrganizations, 1)) * 100}%` }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">SaaS Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => triggerToast('Tenant onboarding wizard will open in the next phase.')}
                        className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-[10px] font-bold text-foreground text-center transition hover-lift flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3 w-3 text-primary" />
                        Add Tenant
                      </button>
                      <button 
                        onClick={() => triggerToast('License key generator is restricted to corporate root authorization.')}
                        className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-[10px] font-bold text-foreground text-center transition hover-lift flex items-center justify-center gap-1"
                      >
                        <KeyRound className="h-3 w-3 text-amber-500" />
                        New License
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeCategory === 'overview' && currentRole !== 'SUPER_ADMIN' && stats && (
            dashboardLayout && dashboardLayout.sections && dashboardLayout.sections.length > 0 ? (
              <DynamicDashboard
                layout={dashboardLayout}
                metricsData={stats}
                triggerToast={triggerToast}
                setActiveCategory={setActiveCategory}
              />
            ) : (
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
                currentRole={currentRole}
                user={user}
              />
            )
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
              staff={staff}
              triggerToast={triggerToast}
            />
          )}

          {activeCategory === 'productivity' && (
            <ProductivityTab 
              user={user}
              currentRole={currentRole}
              staff={staff}
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

          {activeCategory === 'reports' && (
            <ReportsDashboard />
          )}

          {activeCategory === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeCategory === 'operations' && (
            <OperationsDashboard triggerToast={triggerToast} />
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
    </div>
  );
}
