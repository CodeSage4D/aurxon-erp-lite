'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, CalendarCheck, Percent, Clock, Sparkles, ChevronRight, AlertTriangle, 
  MessageSquare, ShieldAlert, Award, FileText, Landmark, CheckCircle2, XCircle, BookOpen, 
  ClipboardList, Trash2, Calendar, ShieldCheck, CreditCard, ArrowUpRight, Check, Play, UserPlus, 
  FileSignature, HelpCircle, Activity, Megaphone, ArrowUp, ArrowDown, Download, Layers, TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

interface OverviewTabProps {
  stats: any;
  students: any[];
  staff: any[];
  classes: any[];
  rfidLogs: string[];
  notices: any[];
  triggerToast: (msg: string) => void;
  setActiveCategory: (cat: string) => void;
  setStudentTab: (tab: 'list' | 'admission' | 'promotions') => void;
  setAdmissionWizardStep: (step: number) => void;
  setLibrarySubTab: (tab: 'inventory' | 'checkout' | 'issues') => void;
  setFeesTab: (tab: 'allocations' | 'structures' | 'ledger') => void;
  setExamsTab: (tab: 'list' | 'entry') => void;
  setAcademicTab: (tab: 'timetable' | 'lessons') => void;
  setAttendanceDate: (date: string) => void;
  setSelectedClass: (classId: string) => void;
  loadAttendanceRoster: (classId: string) => void;
  setFeeForm: (form: any) => void;
  setPromotionTargetClassId: (classId: string) => void;
  setPromotionSelectedStudents: (students: string[]) => void;
  setStudentForm: (form: any) => void;
  currentRole: string;
  user: any;
}

export default function OverviewTab({
  stats,
  students,
  staff,
  classes,
  rfidLogs,
  notices,
  triggerToast,
  setActiveCategory,
  setStudentTab,
  setAdmissionWizardStep,
  setLibrarySubTab,
  setFeesTab,
  setExamsTab,
  setAcademicTab,
  setAttendanceDate,
  setSelectedClass,
  loadAttendanceRoster,
  setFeeForm,
  setPromotionTargetClassId,
  setPromotionSelectedStudents,
  setStudentForm,
  currentRole,
  user
}: OverviewTabProps) {
  
  // Theme state check for charts styling
  const [isDarkMode, setIsDarkMode] = useState(true);
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    // Monitor class changes on body
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Chart theme configurations
  const themeColors = {
    primary: '#2563EB',
    accent: '#818CF8',
    grid: isDarkMode ? '#263247' : '#E2E8F0',
    tooltipBg: isDarkMode ? '#121B2D' : '#FFFFFF',
    tooltipBorder: isDarkMode ? '#263247' : '#E2E8F0',
    text: isDarkMode ? '#94A3B8' : '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  // ==========================================
  // STATE DEFINITIONS FOR INTERACTIVE ACTIONS
  // ==========================================
  
  // Principal/Admin leaves approval queue
  const [leavesList, setLeavesList] = useState([
    { id: 'leave-1', name: 'Dr. Aditya Sharma', role: 'Senior Physics Head', type: 'Casual Leave (CL)', duration: '2 days (June 2 - June 3)', reason: 'Attending family wedding ceremony', status: 'PENDING' },
    { id: 'leave-2', name: 'Sarah Connor', role: 'Mathematics Department', type: 'Earned Leave (EL)', duration: '1 day (June 5)', reason: 'Annual banking and personal registration tasks', status: 'PENDING' }
  ]);

  // Principal/Admin pending admissions
  const [pendingAdmissions, setPendingAdmissions] = useState([
    { id: 'padm-1', name: 'Devendra Patel', class: 'Grade 10-A', board: 'CBSE', docStatus: 'Pending Verification', date: '2026-05-30', scholarId: '' },
    { id: 'padm-2', name: 'Priya Nair', class: 'Grade 11-A', board: 'ICSE', docStatus: 'Verified', date: '2026-05-29', scholarId: '' }
  ]);

  // Document security stamp simulation
  const [unsecuredCount, setUnsecuredCount] = useState(3);
  const [securitySigning, setSecuritySigning] = useState(false);

  // Todo-List
  const [todos, setTodos] = useState<string[]>([
    "Review Grade 10-A Algebra syllabus logs",
    "Submit Term 1 CBSE Grading sheets to Principal office",
    "Prepare substitute planner for Tuesday Casual Leave (CL)"
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Teacher homework evaluation
  const [homeworksList, setHomeworksList] = useState([
    { 
      id: 'hw-1', 
      title: 'Calculus Integration Worksheet', 
      class: 'Grade 10-A', 
      subject: 'Advanced Mathematics', 
      submissions: [
        { studentId: 'stud-1', studentName: 'Alice Miller', score: '' },
        { studentId: 'stud-2', studentName: 'Bob Johnson', score: '' }
      ],
      completedCount: 0
    },
    { 
      id: 'hw-2', 
      title: 'Newtonian Laws Free Body Diagrams', 
      class: 'Grade 10-A', 
      subject: 'Introductory Physics', 
      submissions: [
        { studentId: 'stud-2', studentName: 'Bob Johnson', score: '' }
      ],
      completedCount: 0
    }
  ]);
  const [activeGradingHw, setActiveGradingHw] = useState<string | null>(null);
  const [activeGradingSubIdx, setActiveGradingSubIdx] = useState<number>(-1);
  const [hwScoreInput, setHwScoreInput] = useState('');

  // Parent Fee simulation
  const [feeDues, setFeeDues] = useState(1800);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentSimulating, setPaymentSimulating] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState('');

  // Student Homework submission
  const [studentHomeworks, setStudentHomeworks] = useState([
    { id: 'shw-1', title: 'Quadratic Integration Worksheet', subject: 'Advanced Mathematics', dueDate: 'Tomorrow', status: 'PENDING' },
    { id: 'shw-2', title: 'Electromagnetic Field Inductions', subject: 'Introductory Physics', dueDate: 'In 3 days', status: 'PENDING' }
  ]);
  const [homeworkModalOpen, setHomeworkModalOpen] = useState<string | null>(null);
  const [submittingHw, setSubmittingHw] = useState(false);

  // Operations runbooks state (collapsible at bottom)
  const [activeRunbook, setActiveRunbook] = useState<'admission' | 'attendance' | 'fees' | 'promotion'>('admission');
  const [activeRunbookStep, setActiveRunbookStep] = useState(0);

  // Executive Analytics sub-tabs
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'academic' | 'financial' | 'staff' | 'operational'>('academic');
  const [exportingReport, setExportingReport] = useState<'pdf' | 'excel' | null>(null);

  const runbooksData = {
    admission: {
      title: 'Student Admission Runbook',
      subtitle: 'Statutory Indian Scholar Enrollment Flow (CBSE / ICSE Compliant)',
      steps: [
        { name: 'Add Basic Info', desc: 'Collect scholar first name, last name, date of birth, and verify email credentials.', dest: 'students', tab: 'admission' },
        { name: 'Add Academic Info', desc: 'Select academic grade/class and board credentials (CBSE/ICSE/State Board).', dest: 'students', tab: 'admission' },
        { name: 'Add Parent Info', desc: 'Input father/mother details, occupations, emergency phones, and annual income.', dest: 'students', tab: 'admission' },
        { name: 'Add Address & Bank Info', desc: 'Enter residential address, districts, PIN codes, Aadhaar, Samagra ID, and bank details for Direct Benefit Transfers (DBT).', dest: 'students', tab: 'admission' },
        { name: 'Upload Documents', desc: 'Scan and upload transfer certificates, proof of birth, and identity cards.', dest: 'students', tab: 'admission' },
        { name: 'Welcome Notification', desc: 'Trigger welcome notices to student and parent email terminals.', dest: 'comms', tab: 'circulars' },
        { name: 'Assign Class & Roll No', desc: 'Assign final CBSE section stream and unique roll number cards.', dest: 'students', tab: 'list' },
        { name: 'Create Login Credentials', desc: 'Generate individual logins automatically with secure defaults (password123).', dest: 'settings', tab: 'general' },
        { name: 'Generate Scholar Number', desc: 'Validate and push unique permanent scholar index numbers (e.g. SCH-2026-X).', dest: 'students', tab: 'list' }
      ]
    },
    attendance: {
      title: 'Daily Attendance Runbook',
      subtitle: 'Statutory School Roll-Call & Biometric Synced Roster',
      steps: [
        { name: 'Teacher Login', desc: 'Authenticated teacher logs into the ERP with active teacher scope.', dest: 'overview', tab: 'live' },
        { name: 'Select Class & Subject', desc: 'Choose target class roster and active subject period.', dest: 'attendance', tab: 'roster' },
        { name: 'Mark Attendance Status', desc: 'Select student records and set statuses (Present, Absent, Late).', dest: 'attendance', tab: 'roster' },
        { name: 'Submit Attendance', desc: 'Finalize and submit the attendance register to locking tables.', dest: 'attendance', tab: 'roster' },
        { name: 'Real-Time Database Sync', desc: 'Automatically commit daily logs to Neon PostgreSQL server.', dest: 'overview', tab: 'live' },
        { name: 'Compile Daily Reports', desc: 'ERP calculations run to update institutional health statistics.', dest: 'analytics', tab: 'reports' },
        { name: 'Notification to Parents', desc: 'ERP triggers SMS/Notice alerts to parents for absent students.', dest: 'comms', tab: 'whatsapp' },
        { name: 'Dashboard Analytics Update', desc: 'Active charts and graphs populate average metrics in the Principal view.', dest: 'analytics', tab: 'reports' }
      ]
    },
    fees: {
      title: 'Fee Collection Runbook',
      subtitle: 'Statutory CBSE Ledger & Invoice Settlement Cycle',
      steps: [
        { name: 'Create Fee Structure', desc: 'Define institutional fee components (tuition, transport, library, laboratory).', dest: 'fees', tab: 'structures' },
        { name: 'Assign Fee Allocations', desc: 'Apply created structures to classes or individual scholars.', dest: 'fees', tab: 'allocations' },
        { name: 'Generate Invoices', desc: 'Compute due balances and generate permanent payment vouchers.', dest: 'fees', tab: 'allocations' },
        { name: 'Record Payments (Online/Offline)', desc: 'Collect dues via cash, card, netbanking, or UPI gateways.', dest: 'fees', tab: 'allocations' },
        { name: 'Record S3 Transaction Logs', desc: 'Log encrypted audit trails for payments in compliance database tables.', dest: 'fees', tab: 'ledger' },
        { name: 'Generate Statutory Receipts', desc: 'Print or export thermal P&L invoices containing official transaction IDs.', dest: 'fees', tab: 'allocations' },
        { name: 'Real-time Dues Update', desc: 'Dues status dynamically updates from UNPAID to PARTIAL or PAID.', dest: 'fees', tab: 'allocations' },
        { name: 'Update Financial Reports', desc: 'Ledger registers collections into global institutional profits & losses sheets.', dest: 'analytics', tab: 'reports' }
      ]
    },
    promotion: {
      title: 'Year-End Promotion Runbook',
      subtitle: 'CBSE Academic Year Transition & Student Rollover',
      steps: [
        { name: 'Select Current Academic Year', desc: 'Verify previous student grades, sections, and subjects.', dest: 'students', tab: 'promotions' },
        { name: 'Select Eligible Students', desc: 'Check the names of students advancing to the next standard grade.', dest: 'students', tab: 'promotions' },
        { name: 'System Eligibility Check', desc: 'ERP checks that selected students have zero pending fees and passed all exams.', dest: 'students', tab: 'promotions' },
        { name: 'Promote Student Roster', desc: 'Advance student records to their new class grade in the database.', dest: 'students', tab: 'promotions' },
        { name: 'Reset Roll Numbers', desc: 'Sort student lists alphabetically and generate new CBSE roll numbers.', dest: 'students', tab: 'promotions' },
        { name: 'Archive Preceding Year Data', desc: 'Safely backup past student report cards and attendance records to archives.', dest: 'students', tab: 'list' },
        { name: 'Generate New Academic Structure', desc: 'Setup classes, sections, timetables, and teachers for the new session.', dest: 'academic', tab: 'timetable' },
        { name: 'Notify Parents & Students', desc: 'Publish circular announcements regarding standard promotions.', dest: 'comms', tab: 'circulars' },
        { name: 'Update System Dashboards', desc: 'Recalculate average scholar statistics and class sizes.', dest: 'overview', tab: 'live' }
      ]
    }
  };

  const currentRunbook = runbooksData[activeRunbook];
  const steps = currentRunbook.steps;
  const activeStep = steps[activeRunbookStep];

  // ==========================================
  // HELPER FUNCTIONS FOR ACTIONS
  // ==========================================

  // Todo-List helpers
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, newTodo.trim()]);
    setNewTodo('');
    triggerToast('New planner task registered successfully!');
  };

  const removeTodo = (idx: number) => {
    const next = [...todos];
    next.splice(idx, 1);
    setTodos(next);
    triggerToast('Task marked as completed!');
  };

  // Leave approval simulation
  const handleLeaveAction = (id: string, action: 'APPROVED' | 'REJECTED', name: string) => {
    setLeavesList(prev => prev.map(leave => leave.id === id ? { ...leave, status: action } : leave));
    triggerToast(`Leave request ${action.toLowerCase()} for ${name}. Dispatched notification.`);
  };

  // Assign Scholar ID
  const handleAssignScholarId = (id: string, name: string) => {
    const randomScholarId = `SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPendingAdmissions(prev => prev.map(a => a.id === id ? { ...a, scholarId: randomScholarId } : a));
    triggerToast(`Scholar ID ${randomScholarId} assigned to ${name}!`);
  };

  // Run document check simulation
  const runSecurityHashChecks = () => {
    setSecuritySigning(true);
    setTimeout(() => {
      setSecuritySigning(false);
      setUnsecuredCount(0);
      triggerToast('All document uploads verified and stamped with SHA-256 signatures!');
    }, 1200);
  };

  // Homework grading helpers
  const startHomeworkGrading = (hwId: string, subIdx: number) => {
    setActiveGradingHw(hwId);
    setActiveGradingSubIdx(subIdx);
    setHwScoreInput('');
  };

  const submitHomeworkGrade = (hwId: string, subIdx: number) => {
    if (!hwScoreInput || isNaN(parseFloat(hwScoreInput))) {
      alert('Please enter a valid marks score.');
      return;
    }
    setHomeworksList(prev => prev.map(hw => {
      if (hw.id === hwId) {
        const nextSubs = [...hw.submissions];
        nextSubs[subIdx].score = hwScoreInput;
        const nextHw = { ...hw, submissions: nextSubs };
        const gradedCount = nextSubs.filter(s => s.score !== '').length;
        nextHw.completedCount = gradedCount;
        return nextHw;
      }
      return hw;
    }));
    const hwTitle = homeworksList.find(h => h.id === hwId)?.title;
    const studName = homeworksList.find(h => h.id === hwId)?.submissions[subIdx].studentName;
    triggerToast(`Graded ${studName}: ${hwScoreInput}/100 in ${hwTitle}!`);
    setActiveGradingHw(null);
    setActiveGradingSubIdx(-1);
  };

  // Parent payment simulation
  const runPaymentSimulation = () => {
    setPaymentSimulating(true);
    setTimeout(() => {
      setPaymentSimulating(false);
      setFeeDues(0);
      const generatedReceipt = `RCPT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setPaymentReceipt(generatedReceipt);
      triggerToast(`Payment successful! Receipt ${generatedReceipt} issued.`);
    }, 1500);
  };

  // Student Homework submission simulation
  const submitStudentHomework = (id: string) => {
    setSubmittingHw(true);
    setTimeout(() => {
      setSubmittingHw(false);
      setStudentHomeworks(prev => prev.map(h => h.id === id ? { ...h, status: 'SUBMITTED' } : h));
      setHomeworkModalOpen(null);
      const hwTitle = studentHomeworks.find(h => h.id === id)?.title;
      triggerToast(`Homework turned in: "${hwTitle}" is pending teacher evaluation.`);
    }, 1200);
  };

  // Handle PDF/Excel reports export
  const triggerReportExport = (type: 'pdf' | 'excel') => {
    setExportingReport(type);
    setTimeout(() => {
      setExportingReport(null);
      triggerToast(`Executive ${type.toUpperCase()} analytics report successfully generated and saved!`);
    }, 1500);
  };

  // Role mappings checking
  const isAdminOrPrincipal = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'INSTITUTE_ADMIN'].includes(currentRole);
  const isTeacher = currentRole === 'TEACHER';
  const isParent = currentRole === 'PARENT';
  const isStudent = currentRole === 'STUDENT';

  // Fallbacks for analytics charts data
  const fallbackAnalytics = {
    attendanceTrend: [
      { date: '1 May', rate: 94 },
      { date: '5 May', rate: 96 },
      { date: '10 May', rate: 95.8 },
      { date: '15 May', rate: 97.2 },
      { date: '20 May', rate: 96.5 },
      { date: '25 May', rate: 98 },
      { date: '30 May', rate: 97.4 }
    ],
    feeCollectionsTrend: [
      { month: 'Dec', collected: 8200, outstanding: 1200 },
      { month: 'Jan', collected: 12400, outstanding: 1800 },
      { month: 'Feb', collected: 15600, outstanding: 1400 },
      { month: 'Mar', collected: 10200, outstanding: 2500 },
      { month: 'Apr', collected: 18100, outstanding: 1900 },
      { month: 'May', collected: 22000, outstanding: 3500 }
    ],
    admissionsGrowth: [
      { year: '2024', count: 62 },
      { year: '2025', count: 84 },
      { year: '2026', count: students.length || 100 }
    ],
    examPerformanceTrend: [
      { term: 'CBSE Term 1', average: 68 },
      { term: 'CBSE Term 2', average: 85 }
    ],
    teacherAttendanceTrend: [
      { month: 'Jan', rate: 97.2 },
      { month: 'Feb', rate: 96.5 },
      { month: 'Mar', rate: 98.1 },
      { month: 'Apr', rate: 95.8 },
      { month: 'May', rate: 97.5 }
    ],
    studentPerformanceDistribution: [
      { grade: 'A1 (91-100)', count: 28 },
      { grade: 'A2 (81-90)', count: 32 },
      { grade: 'B1/B2 (71-80)', count: 24 },
      { grade: 'C1/C2 (51-70)', count: 12 },
      { grade: 'D (40-50)', count: 2 },
      { grade: 'F (< 40)', count: stats?.weakStudents?.length || 2 }
    ],
    classWisePerformance: [
      { grade: 'Grade 6-A', average: 78 },
      { grade: 'Grade 7-A', average: 82 },
      { grade: 'Grade 8-A', average: 75 },
      { grade: 'Grade 9-A', average: 84 },
      { grade: 'Grade 10-A', average: 80 }
    ],
    leaveAnalytics: [
      { type: 'Casual (CL)', count: 8 },
      { type: 'Earned (EL)', count: 4 },
      { type: 'Medical (SL)', count: 3 }
    ]
  };

  const chartData = stats?.analytics || fallbackAnalytics;

  // Render announcement notice board (Standardized across roles)
  const renderAnnouncementBoard = () => (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
        <Megaphone className="h-4.5 w-4.5 text-primary" />
        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Circular Announcements</h4>
      </div>
      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar flex-1 pr-1">
        {notices.map((notice) => (
          <div key={notice.id} className="rounded-2xl border border-border bg-muted/20 p-4 transition hover:bg-muted/40 relative">
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <h5 className="font-extrabold text-xs text-foreground leading-snug">{notice.title}</h5>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">Circular</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed mb-3">{notice.content}</p>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/60 pt-2 font-medium">
              <span>By: {notice.authorName}</span>
              <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">No circular announcements posted recently.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. PRINCIPAL & ADMIN COCKPIT */}
      {/* ========================================================================= */}
      {isAdminOrPrincipal && (
        <>
          {/* Greeting Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-primary/20">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Good morning, {user?.profileName || 'Principal'}</span>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{user?.institutionName || 'Your Organization'} — Cockpit Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
                Demo Session Active
              </span>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TIER 1: ATTENTION CENTER ("What needs attention today?") */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Leaves approvals queue */}
            <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-primary animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Leaves Pending Review ({leavesList.filter(l => l.status === 'PENDING').length})
                  </h4>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-extrabold text-primary uppercase">
                  Action Required
                </span>
              </div>

              <div className="space-y-3">
                {leavesList.filter(l => l.status === 'PENDING').map((leave) => (
                  <div key={leave.id} className="rounded-2xl border border-border bg-muted/10 p-4 transition hover:bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground">{leave.name}</span>
                          <span className="text-[9px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                            {leave.role}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          {leave.type} • <span className="text-primary">{leave.duration}</span>
                        </p>
                        <p className="text-[11px] font-medium text-foreground bg-muted/40 p-2 rounded-lg mt-1 italic border-l-2 border-primary/30">
                          "{leave.reason}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'REJECTED', leave.name)}
                          className="rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 px-3 py-1.5 text-[10px] font-black text-muted-foreground hover:text-destructive transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'APPROVED', leave.name)}
                          className="rounded-lg bg-primary hover:bg-primary/90 px-3 py-1.5 text-[10px] font-black text-white shadow-sm flex items-center gap-1 transition"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {leavesList.filter(l => l.status === 'PENDING').length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold">All leaves processed successfully!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document safety alerts */}
            <div className="rounded-3xl border border-primary/20 bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <ShieldAlert className="h-4.5 w-4.5 text-primary animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Document Security Check</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/25">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                    <div className="space-y-1.5 flex-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">Aadhaar & Scholar PII Checks</div>
                      <div className="text-xs font-black text-foreground">
                        {unsecuredCount > 0 ? `${unsecuredCount} Public Uploads Unchecked` : 'All Documents Verified'}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {unsecuredCount > 0 
                          ? 'Unsecured PDF folders flagged. Run automated validation checks.'
                          : 'Cryptographic SHA-256 signatures successfully generated for all files.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {unsecuredCount > 0 && (
                <button
                  onClick={runSecurityHashChecks}
                  disabled={securitySigning}
                  className="mt-6 w-full rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] tracking-wide uppercase py-3 transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {securitySigning ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Verifying Files...</span>
                    </>
                  ) : (
                    <>
                      <FileSignature className="h-4 w-4" />
                      <span>Stamp Document Signatures</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TIER 2: DECISION CENTER & EXECUTIVE KPI CARDS */}
          {/* ──────────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Executive Decision Metrics</h4>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              
              {/* Card 1: Total Students */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Total Students</div>
                <div className="text-2xl font-black text-foreground mt-2">{students.length || 100}</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+4.2% MoM</span>
                </div>
              </div>

              {/* Card 2: Attendance Rate */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Attendance Rate</div>
                <div className="text-2xl font-black text-foreground mt-2">{stats?.attendanceRate || 95.8}%</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+0.5% MoM</span>
                </div>
              </div>

              {/* Card 3: Monthly Fee Collection */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Monthly Fees</div>
                <div className="text-2xl font-black text-foreground mt-2">₹22K</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+12.4% MoM</span>
                </div>
              </div>

              {/* Card 4: Outstanding Fees */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Outstanding Dues</div>
                <div className="text-2xl font-black text-rose-500 mt-2">₹3.5K</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1">
                  <ArrowDown className="h-3 w-3" />
                  <span>-15.2% MoM</span>
                </div>
              </div>

              {/* Card 5: Teacher Attendance */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Staff Attendance</div>
                <div className="text-2xl font-black text-foreground mt-2">97.5%</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+0.2% MoM</span>
                </div>
              </div>

              {/* Card 6: Admissions This Month */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Admissions (May)</div>
                <div className="text-2xl font-black text-foreground mt-2">16</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+17.1% ToT</span>
                </div>
              </div>

            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TIER 3: ANALYTICS CENTER & RECHARTS INSIGHTS */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Real-Time Executive Insights</h3>
              </div>

              {/* Export actions and tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => triggerReportExport('pdf')}
                  disabled={exportingReport !== null}
                  className="rounded-lg border border-border hover:bg-muted py-1.5 px-3 text-[10px] font-bold text-foreground flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {exportingReport === 'pdf' ? (
                    <Activity className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => triggerReportExport('excel')}
                  disabled={exportingReport !== null}
                  className="rounded-lg border border-border hover:bg-muted py-1.5 px-3 text-[10px] font-bold text-foreground flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {exportingReport === 'excel' ? (
                    <Activity className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs selection */}
            <div className="flex gap-1 border-b border-border/60 pb-2 overflow-x-auto">
              {[
                { id: 'academic', label: 'Academic Performance' },
                { id: 'financial', label: 'Financial Collections' },
                { id: 'staff', label: 'Staff Operations' },
                { id: 'operational', label: 'School Enrollment' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAnalyticsTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
                    activeAnalyticsTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Charts View Area */}
            <div className="h-80 w-full min-h-[300px]">
              
              {activeAnalyticsTab === 'academic' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Chart A: Class wise performance averages */}
                  <div className="space-y-2 h-full flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Class-wise Term Results Comparison</div>
                    <div className="flex-1 min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.classWisePerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                          <XAxis dataKey="grade" stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <YAxis stroke={themeColors.text} fontSize={10} domain={[0, 100]} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }} 
                            labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Bar dataKey="average" fill={themeColors.primary} radius={[4, 4, 0, 0]} name="Class Average Marks %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart B: Distribution grades ranges */}
                  <div className="space-y-2 h-full flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Student Performance Distribution</div>
                    <div className="flex-1 min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.studentPerformanceDistribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                          <XAxis type="number" stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <YAxis dataKey="grade" type="category" stroke={themeColors.text} fontSize={10} tickLine={false} width={80} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }}
                            labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Bar dataKey="count" fill={themeColors.accent} radius={[0, 4, 4, 0]} name="Students Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === 'financial' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Chart A: Monthly Fee Collection vs outstanding */}
                  <div className="space-y-2 h-full flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Fee Collection Trends (Monthly)</div>
                    <div className="flex-1 min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.feeCollectionsTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                          <XAxis dataKey="month" stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <YAxis stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }}
                            labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="collected" fill={themeColors.success} stackId="a" name="Settled Payments" />
                          <Bar dataKey="outstanding" fill={themeColors.danger} stackId="a" name="Outstanding Dues" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart B: Dues Collection stats */}
                  <div className="flex flex-col justify-center items-center h-full bg-muted/20 border border-border rounded-2xl p-6 text-center">
                    <Percent className="h-10 w-10 text-emerald-500 mb-2" />
                    <h5 className="text-xs font-black text-foreground">84.0% Collection Settlement Rate</h5>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 max-w-sm">
                      Outstanding dues collections remain locked under Stripe Sandbox merchant gateway routines. Automatic SMS/Notice alerts are outstanding for defaulters.
                    </p>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === 'staff' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Chart A: Teacher Attendance trends monthly */}
                  <div className="space-y-2 h-full flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Teacher Daily Attendance Trends</div>
                    <div className="flex-1 min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.teacherAttendanceTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                          <XAxis dataKey="month" stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <YAxis stroke={themeColors.text} fontSize={10} tickLine={false} domain={[90, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }}
                            labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Line type="monotone" dataKey="rate" stroke={themeColors.primary} strokeWidth={3} dot={{ r: 4 }} name="Teacher Attendance %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart B: Leaves categories pie chart */}
                  <div className="space-y-2 h-full flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Staff Leave Categories Allocation</div>
                    <div className="flex-1 min-h-[220px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={chartData.leaveAnalytics} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="count" 
                            nameKey="type"
                          >
                            <Cell fill={themeColors.primary} />
                            <Cell fill={themeColors.success} />
                            <Cell fill={themeColors.warning} />
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === 'operational' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Chart A: Admissions Growth Trends */}
                  <div className="space-y-2 h-full flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Yearly Scholar Admissions Growth</div>
                    <div className="flex-1 min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.admissionsGrowth}>
                          <defs>
                            <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={themeColors.primary} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={themeColors.primary} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                          <XAxis dataKey="year" stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <YAxis stroke={themeColors.text} fontSize={10} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }}
                            labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Area type="monotone" dataKey="count" stroke={themeColors.primary} fillOpacity={1} fill="url(#colorAdmissions)" strokeWidth={3} name="Total Registered Students" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart B: Enrollment capacity gauges */}
                  <div className="flex flex-col justify-center items-center h-full bg-muted/20 border border-border rounded-2xl p-6 text-center">
                    <Users className="h-10 w-10 text-primary mb-2" />
                    <h5 className="text-xs font-black text-foreground">66.7% Seat Enrollment Capacity</h5>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 max-w-sm">
                      {user?.institutionName || 'Your institution'} active capacity: 100 enrolled out of 150 total allocated branch classroom desks.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Academic Alerts list & RFID scans logger */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Admissions Pipeline Alerts */}
            <div className="lg:col-span-2 rounded-3xl border border-rose-500/20 bg-rose-500/[0.01] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    CBSE Attendance & Academic Alerts
                  </h4>
                </div>
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-extrabold text-rose-600 dark:text-rose-450 uppercase">
                  Flagged Scholars
                </span>
              </div>
              
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mb-4">
                Warning triggers automatically when scholar average attendance is &lt; 70% AND assessment results avg is &lt; 40%.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.weakStudents && stats.weakStudents.map((ws: any) => (
                  <div key={ws.studentId} className="rounded-xl border border-border bg-card p-4 hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-foreground">{ws.name}</span>
                      <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{ws.className}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-muted/30 border border-border p-2 rounded-lg text-center">
                        <div className="text-[9px] font-extrabold uppercase text-muted-foreground">Attendance</div>
                        <div className="text-xs font-black text-rose-500 mt-0.5">{ws.attendanceRate}%</div>
                      </div>
                      <div className="bg-muted/30 border border-border p-2 rounded-lg text-center">
                        <div className="text-[9px] font-extrabold uppercase text-muted-foreground">Exam Avg</div>
                        <div className="text-xs font-black text-rose-500 mt-0.5">{ws.examAverage}%</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        triggerToast(`Drafted parent notification letter for ${ws.name}.`);
                        setActiveCategory('comms');
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 py-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 transition"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Notify Parents</span>
                    </button>
                  </div>
                ))}
                {(!stats?.weakStudents || stats.weakStudents.length === 0) && (
                  <div className="col-span-2 text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/15">
                    No scholars are currently flagged as weak. All parameters compliant!
                  </div>
                )}
              </div>
            </div>

            {/* Biometric RFID Logger card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Biometric Check-In Feed</h4>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {rfidLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-xl bg-muted/30 p-3 text-[10px] font-mono border border-border">
                    <Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <p className="text-foreground leading-relaxed">{log}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER CLASSROOM HUB */}
      {/* ========================================================================= */}
      {isTeacher && (
        <>
          {/* Greeting Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-primary/20">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Welcome back, {user?.profileName || 'Teacher'}</span>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Teacher Classroom Hub — Daily lessons & grading</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
              Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TIER 1: ATTENTION CENTER */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily attendance register outstanding notice */}
            <div className="lg:col-span-2 rounded-3xl border border-rose-500/25 bg-rose-500/[0.02] p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mt-0.5">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-rose-500 uppercase tracking-wide">Daily Attendance Sheet Outstanding</h4>
                  <h3 className="text-sm font-bold text-foreground">Grade 10-A Daily Roll-Call Outstanding</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Biometric attendance tracking rate metrics rely on daily submissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAttendanceDate(new Date().toISOString().substring(0, 10));
                  setSelectedClass('class-6a'); // first class Grade 6-A
                  loadAttendanceRoster('class-6a');
                  setActiveCategory('attendance');
                  triggerToast('Loading daily attendance register...');
                }}
                className="mt-6 self-start rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] tracking-wide uppercase px-4 py-2.5 transition shadow-sm"
              >
                Take Attendance Now
              </button>
            </div>

            {/* Homework Evaluation card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Homework Evaluation Queue
                  </h4>
                </div>
              </div>

              <div className="space-y-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {homeworksList.map((hw) => (
                  <div key={hw.id} className="rounded-xl border border-border bg-muted/10 p-3 text-xs">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-black text-foreground truncate">{hw.title}</span>
                      <span className="text-[9px] font-bold text-muted-foreground shrink-0">{hw.completedCount} Graded</span>
                    </div>
                    {hw.submissions.map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-card border border-border p-2 rounded-lg mt-1 text-[11px]">
                        <span className="font-semibold text-foreground">{sub.studentName}</span>
                        {sub.score ? (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {sub.score}/100
                          </span>
                        ) : (
                          <>
                            {activeGradingHw === hw.id && activeGradingSubIdx === idx ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder="Marks"
                                  value={hwScoreInput}
                                  onChange={e => setHwScoreInput(e.target.value)}
                                  className="w-12 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] outline-none"
                                />
                                <button onClick={() => submitHomeworkGrade(hw.id, idx)} className="p-0.5 rounded bg-primary text-white">
                                  <Check className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startHomeworkGrading(hw.id, idx)}
                                className="text-[9px] font-bold text-primary hover:underline"
                              >
                                Grade
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TIER 2 & 3: DECISION & TEACHER ANALYTICS */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart A: Class Attendance % */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Class Attendance Rates</div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Grade 6-A', rate: 96.5 },
                    { name: 'Grade 7-A', rate: 95.8 },
                    { name: 'Grade 8-A', rate: 94.2 },
                    { name: 'Grade 9-A', rate: 97.4 },
                    { name: 'Grade 10-A', rate: 95.0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                    <XAxis dataKey="name" stroke={themeColors.text} fontSize={9} tickLine={false} />
                    <YAxis stroke={themeColors.text} fontSize={9} tickLine={false} domain={[90, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }} />
                    <Bar dataKey="rate" fill={themeColors.primary} radius={[4, 4, 0, 0]} name="Attendance Avg %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart B: Homework completion donut */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Homework Completion Rate</div>
              <div className="h-44 w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: 92 },
                        { name: 'Pending Evaluation', value: 8 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill={themeColors.success} />
                      <Cell fill={themeColors.warning} />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground border-t border-border pt-3">
                <span className="text-emerald-500">92% Completed</span>
                <span className="text-amber-500">8% Outstanding</span>
              </div>
            </div>

            {/* Teaching Schedule */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Today's Class Periods</h4>
              </div>
              
              <div className="space-y-3">
                {[
                  { period: 'Period 1', time: '08:30 AM', subject: 'Advanced Algebra', room: 'Grade 10-A', status: 'COMPLETED' },
                  { period: 'Period 2', time: '09:30 AM', subject: 'Newtonian Physics', room: 'Grade 10-A', status: 'CURRENT' },
                  { period: 'Period 3', time: '11:30 AM', subject: 'Shakespearean Plays', room: 'Grade 11-A', status: 'UPCOMING' }
                ].map((per, idx) => (
                  <div key={idx} className={`rounded-xl border p-2.5 flex justify-between items-center text-xs ${
                    per.status === 'CURRENT' ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 opacity-75'
                  }`}>
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-foreground">{per.period} <span className="text-[10px] text-muted-foreground font-semibold">({per.time})</span></div>
                      <h5 className="font-bold text-foreground">{per.subject} • <span className="text-primary">{per.room}</span></h5>
                    </div>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {per.status === 'CURRENT' && <span className="bg-primary/20 text-primary animate-pulse">Active</span>}
                      {per.status === 'COMPLETED' && <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Done</span>}
                      {per.status === 'UPCOMING' && <span className="bg-muted text-muted-foreground border border-border">Pending</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Announcements */}
            <div className="lg:col-span-2">
              {renderAnnouncementBoard()}
            </div>

            {/* Todo checklist */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <ClipboardList className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Planner Checklist</h4>
              </div>

              <form onSubmit={addTodo} className="flex gap-1.5 mb-4">
                <input
                  type="text"
                  placeholder="Add syllabus checklist..."
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs outline-none text-foreground focus:border-primary transition"
                />
                <button type="submit" className="rounded-xl bg-primary text-white font-extrabold px-3 text-xs">Add</button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {todos.map((todo, idx) => (
                  <div key={idx} className="flex items-start justify-between rounded-xl bg-muted/30 border border-border p-2 text-xs">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" onChange={() => removeTodo(idx)} className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer mt-0.5 shrink-0" />
                      <span className="font-bold text-foreground leading-snug">{todo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. PARENT FAMILY PORTAL */}
      {/* ========================================================================= */}
      {isParent && (
        <>
          {/* Greeting Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-primary/20">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Welcome, {user?.profileName || 'Parent'}</span>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Parent Family Portal — Track child standing</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              Scholar: Rohan Sharma
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Column 1 & 2: Overdue fees & Child academics */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Fee dues alert & simulation */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Outstanding Dues Ledger</h4>
                </div>

                <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.02] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">CBSE Term 2 Tuition Fee Dues</span>
                        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-500 uppercase">Overdue</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Scholar Account: <span className="font-extrabold text-foreground">Rohan Sharma (Grade 10-A)</span> • Due: June 15, 2026
                      </p>
                      <h3 className="text-2xl font-black text-rose-500 mt-2">
                        {feeDues > 0 ? `₹${feeDues}.00` : '₹0.00 (All Cleared)'}
                      </h3>
                    </div>

                    {feeDues > 0 ? (
                      <button
                        onClick={() => setPaymentModalOpen(true)}
                        className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs tracking-wide uppercase px-5 py-3 transition self-end sm:self-center shadow-lg shadow-rose-500/10"
                      >
                        Pay Tuition Dues Securely
                      </button>
                    ) : (
                      <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="h-4.5 w-4.5" />
                        <span>Settle Compliant</span>
                      </span>
                    )}
                  </div>
                </div>

                {paymentReceipt && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Sandbox Fee Settlement Completed</span>
                      Receipt voucher generated successfully: <span className="font-extrabold underline">{paymentReceipt}</span>.
                    </div>
                  </div>
                )}
              </div>

              {/* Child's Academic & Attendance Gauge */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Scholar Standings</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance Area Trend */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Attendance Rate Trend</div>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.attendanceTrend}>
                          <defs>
                            <linearGradient id="colorAttParent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={themeColors.success} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={themeColors.success} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke={themeColors.text} fontSize={8} tickLine={false} />
                          <YAxis stroke={themeColors.text} fontSize={8} domain={[90, 100]} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }} />
                          <Area type="monotone" dataKey="rate" stroke={themeColors.success} fillOpacity={1} fill="url(#colorAttParent)" name="Attendance Rate %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Academic Average Line Trend */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">Exam Results Progression</div>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.examPerformanceTrend}>
                          <XAxis dataKey="term" stroke={themeColors.text} fontSize={8} tickLine={false} />
                          <YAxis stroke={themeColors.text} fontSize={8} domain={[50, 100]} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder }} />
                          <Line type="monotone" dataKey="average" stroke={themeColors.primary} strokeWidth={2.5} name="Term Exam Average %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Performance table */}
                <div className="mt-6 border-t border-border pt-4">
                  <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground mb-3">Academic Marksheet</h5>
                  <div className="rounded-xl border border-border overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-muted p-2 font-extrabold text-muted-foreground">
                      <span>Subject Area</span>
                      <span className="text-center">Score</span>
                      <span className="text-right">Grade Scale</span>
                    </div>
                    {[
                      { subject: 'Advanced Algebra (MATH101)', score: '94 / 100', grade: 'A1 (Outstanding)' },
                      { subject: 'Introductory Physics (PHYS101)', score: '76 / 100', grade: 'B2 (Very Good)' },
                      { subject: 'Shakespearean Plays (LIT201)', score: '88 / 100', grade: 'A2 (Excellent)' }
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 p-3 border-t border-border hover:bg-muted/10 transition-colors">
                        <span className="font-bold text-foreground">{row.subject}</span>
                        <span className="text-center font-extrabold text-foreground">{row.score}</span>
                        <span className="text-right text-primary font-bold">{row.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Announcements */}
            <div className="space-y-6">
              {renderAnnouncementBoard()}
            </div>

          </div>

          {/* Secure payment simulator modal */}
          {paymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-scale-up space-y-4">
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Statutory Payment Checkout</h3>
                    <p className="text-[10px] text-muted-foreground">Secure payment simulator</p>
                  </div>
                  <button onClick={() => setPaymentModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">Cancel</button>
                </div>

                <div className="space-y-3 bg-muted/40 p-4 rounded-xl text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scholar Name:</span>
                    <span className="text-foreground">Rohan Sharma (10-A)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allocated Invoice:</span>
                    <span className="text-foreground">CBSE Term 2 Tuition Fee</span>
                  </div>
                  <div className="flex justify-between border-t border-border/80 pt-2 font-black text-sm">
                    <span className="text-foreground">Total Dues Payment:</span>
                    <span className="text-rose-500">₹1,800.00</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment mode</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                    <option value="CARD">Debit/Credit Card Credentials</option>
                  </select>
                </div>

                <button
                  onClick={runPaymentSimulation}
                  disabled={paymentSimulating}
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 text-xs font-black text-white shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  {paymentSimulating ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Simulating Sandbox Gateway...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authorize Payment Sandbox</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. STUDENT ACADEMICS DESK */}
      {/* ========================================================================= */}
      {isStudent && (
        <>
          {/* Greeting Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-primary/20">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Hello, {user?.profileName || 'Student'}</span>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Student Academics Desk — View schedules & assignments</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              Scholar: Active
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Timetable, homeworks */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Daily homework tracker */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4.5 w-4.5 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Homework Assignments Due
                    </h4>
                  </div>
                </div>

                <div className="space-y-4">
                  {studentHomeworks.map((hw) => (
                    <div key={hw.id} className="rounded-2xl border border-border bg-muted/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-black text-foreground">{hw.title}</h5>
                          <span className="text-[9px] font-extrabold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {hw.subject}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Deadline: <span className="text-rose-500 font-bold">{hw.dueDate}</span>
                        </p>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        {hw.status === 'SUBMITTED' ? (
                          <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Submitted</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setHomeworkModalOpen(hw.id)}
                            className="rounded-lg bg-primary hover:bg-primary/90 px-3 py-1.5 text-[10px] font-black text-white shadow-sm flex items-center gap-1 transition"
                          >
                            <span>Turn In PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class Schedule Periods */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <Calendar className="h-4.5 w-4.5 text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Today's Class Schedule</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { period: 'Period 1', time: '08:30 AM', subject: 'Advanced Algebra', room: 'Classroom 10-A', teacher: 'Sarah Connor' },
                    { period: 'Period 2', time: '09:30 AM', subject: 'Newtonian Physics', room: 'Classroom 10-A', teacher: 'John Keating' },
                    { period: 'Period 3', time: '11:30 AM', subject: 'Shakespearean Plays', room: 'Auditorium West', teacher: 'John Keating' }
                  ].map((per, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-muted/20 p-4 hover-lift">
                      <div className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1">{per.period} ({per.time})</div>
                      <h5 className="font-extrabold text-xs text-foreground mb-1">{per.subject}</h5>
                      <p className="text-[10px] text-muted-foreground mb-3">{per.room}</p>
                      <div className="text-[9px] font-bold text-primary flex items-center gap-1 pt-2 border-t border-border/60">
                        <Users className="h-3 w-3" />
                        <span>Teacher: {per.teacher}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Notice Board */}
            <div className="space-y-6">
              {renderAnnouncementBoard()}
            </div>

          </div>

          {/* Homework PDF submission simulation modal */}
          {homeworkModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-scale-up space-y-4">
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Turn In Scholar Assignment</h3>
                    <p className="text-[10px] text-muted-foreground">Upload worksheet PDF</p>
                  </div>
                  <button onClick={() => setHomeworkModalOpen(null)} className="text-muted-foreground hover:text-foreground text-xs font-bold">Cancel</button>
                </div>

                <div className="space-y-2 bg-muted/40 p-4 rounded-xl text-xs font-medium">
                  <div>
                    <span className="text-muted-foreground">Subject:</span>{' '}
                    <span className="font-bold text-primary">
                      {studentHomeworks.find(h => h.id === homeworkModalOpen)?.subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assignment:</span>{' '}
                    <span className="font-bold text-foreground">
                      {studentHomeworks.find(h => h.id === homeworkModalOpen)?.title}
                    </span>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center text-xs">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                  <span className="font-bold block text-foreground">scholar_calculus_worksheet.pdf</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Size: 1.4 MB • Ready to upload</span>
                </div>

                <button
                  onClick={() => submitStudentHomework(homeworkModalOpen)}
                  disabled={submittingHw}
                  className="w-full rounded-2xl bg-primary hover:bg-primary/95 disabled:opacity-50 py-3 text-xs font-black text-white shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  {submittingHw ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Uploading turned in files...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Turn In Scholar Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. COLLAPSIBLE OPERATIONS RUNBOOKS SECTION */}
      {/* ========================================================================= */}
      {isAdminOrPrincipal && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Core School Operations Runbooks</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Statutory school operations runbooks mapped step-by-step to system database architecture.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-extrabold text-primary tracking-widest uppercase">
              Operations
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left selector */}
            <div className="space-y-2">
              {[
                { id: 'admission', label: 'Student Admission', desc: '9 steps CBSE scholar onboarding' },
                { id: 'attendance', label: 'Daily Attendance', desc: '8 steps biometric/roster roll-call' },
                { id: 'fees', label: 'Fee Collection Cycle', desc: '8 steps statutory invoice-to-receipt' },
                { id: 'promotion', label: 'Year-End Promotion', desc: '9 steps rollover & promotions' }
              ].map(runbook => (
                <button
                  key={runbook.id}
                  onClick={() => {
                    setActiveRunbook(runbook.id as any);
                    setActiveRunbookStep(0);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    activeRunbook === runbook.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="text-xs font-black">{runbook.label}</div>
                  <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{runbook.desc}</div>
                </button>
              ))}
            </div>

            {/* Step Wizard Detail */}
            <div className="lg:col-span-3 bg-muted/20 border border-border rounded-2xl p-5 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-5">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>{currentRunbook.title}</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{currentRunbook.subtitle}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Step {activeRunbookStep + 1} of {steps.length}
                    </span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((activeRunbookStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Steps strip */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-border/60">
                  {steps.map((step, idx) => {
                    const isDone = idx < activeRunbookStep;
                    const isActive = idx === activeRunbookStep;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveRunbookStep(idx)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : isDone
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {idx + 1}. {step.name}
                      </button>
                    );
                  })}
                </div>

                {/* Guidance detail card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-card border border-border p-4 rounded-xl">
                  <div className="md:col-span-2 space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary tracking-wider">
                      Active Step {activeRunbookStep + 1} Guidance
                    </span>
                    <h5 className="text-xs font-extrabold text-foreground">{activeStep.name}</h5>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                      {activeStep.desc}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={() => {
                        setActiveCategory(activeStep.dest);
                        if (activeStep.dest === 'students') {
                          setStudentTab(activeStep.tab as any);
                          if (activeStep.tab === 'admission') {
                            if (activeRunbookStep === 0) setAdmissionWizardStep(1);
                            else if (activeRunbookStep === 1) setAdmissionWizardStep(2);
                            else if (activeRunbookStep === 2) setAdmissionWizardStep(3);
                            else if (activeRunbookStep === 3) setAdmissionWizardStep(4);
                            else if (activeRunbookStep === 4) setAdmissionWizardStep(6);
                            else if (activeRunbookStep === 5) setAdmissionWizardStep(6);
                          }
                        } else if (activeStep.dest === 'library') {
                          setLibrarySubTab(activeStep.tab as any);
                        } else if (activeStep.dest === 'fees') {
                          setFeesTab(activeStep.tab as any);
                        } else if (activeStep.dest === 'exams') {
                          setExamsTab(activeStep.tab as any);
                        } else if (activeStep.dest === 'academic') {
                          setAcademicTab(activeStep.tab as any);
                        }
                        triggerToast(`Navigated to ${activeStep.name} target form desk.`);
                      }}
                      className="flex justify-center items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 text-xs transition shadow-md shadow-primary/10 animate-pulse"
                    >
                      <span>Go to Desk Form</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>

                    <button
                      onClick={() => {
                        if (activeRunbook === 'admission') {
                          setStudentForm({
                            firstName: 'Aditya',
                            lastName: 'Sharma',
                            email: 'aditya.sharma@example.com',
                            rollNumber: 'ROLL-10A-15',
                            classId: 'class-1',
                            dateOfBirth: '2011-04-12',
                            gender: 'MALE',
                            aadhaarNumber: '984028401928',
                            samagraId: '120384910',
                            familyId: '90284910',
                            penNumber: 'PEN-904291',
                            birthCertificateNumber: 'BC-2026-9048',
                            bloodGroup: 'B+',
                            religion: 'HINDUISM',
                            casteCategory: 'OBC',
                            nationality: 'Indian',
                            motherTongue: 'Hindi',
                            fatherName: 'Rajesh Sharma',
                            motherName: 'Sunita Sharma',
                            fatherOccupation: 'Government Employee',
                            motherOccupation: 'Homemaker',
                            annualIncome: '450000',
                            houseNo: 'Flat 402, Block C',
                            street: 'MG Road, Indira Nagar',
                            city: 'Bengaluru',
                            district: 'Bengaluru Urban',
                            state: 'Karnataka',
                            pinCode: '560001',
                            bankName: 'State Bank of India',
                            accHolderName: 'Aditya Sharma',
                            accNumber: '302948291039',
                            ifscCode: 'SBIN0000001',
                            bankBranch: 'Indira Nagar Main Branch',
                            prevSchoolName: 'St. Mary School',
                            tcNumber: 'TC-2026-0045',
                            migrationCertNo: 'MC-3029'
                          });
                          if (activeRunbookStep === 0) setAdmissionWizardStep(1);
                          else if (activeRunbookStep === 1) setAdmissionWizardStep(2);
                          else if (activeRunbookStep === 2) setAdmissionWizardStep(3);
                          else if (activeRunbookStep === 3) setAdmissionWizardStep(4);
                          else if (activeRunbookStep === 4) setAdmissionWizardStep(6);
                          else if (activeRunbookStep === 5) setAdmissionWizardStep(6);
                          triggerToast('Prefilled CBSE Scholar admissions flow form data!');
                        } else if (activeRunbook === 'attendance') {
                          setAttendanceDate(new Date().toISOString().substring(0, 10));
                          setSelectedClass('class-6a');
                          loadAttendanceRoster('class-6a');
                          triggerToast('Roster loaded for Grade 6-A daily attendance!');
                        } else if (activeRunbook === 'fees') {
                          setFeesTab('structures');
                          setFeeForm({
                            name: 'CBSE Term 2 Tuition Fee',
                            amount: '1800',
                            dueDate: '2026-10-15'
                          });
                          triggerToast('Prefilled CBSE Tuition Fee form fields!');
                        } else if (activeRunbook === 'promotion') {
                          setSelectedClass('class-6a');
                          setPromotionTargetClassId('class-7a');
                          setPromotionSelectedStudents(['stud-1', 'stud-2']);
                          triggerToast('Eligible Grade 6-A student records queued for promotion rollover!');
                        }
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition text-center underline"
                    >
                      Prefill data for this step flow
                    </button>
                  </div>
                </div>

              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
                <button
                  disabled={activeRunbookStep === 0}
                  onClick={() => setActiveRunbookStep(prev => Math.max(0, prev - 1))}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                >
                  Previous Step
                </button>
                <button
                  disabled={activeRunbookStep === steps.length - 1}
                  onClick={() => setActiveRunbookStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2 text-xs font-bold text-white shadow-sm transition"
                >
                  Next Step
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
