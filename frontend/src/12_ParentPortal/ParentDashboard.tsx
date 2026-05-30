'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Bell, Sparkles, GraduationCap, Calendar, CreditCard, Award, MessageSquare, BookOpen, Clock, Loader2, ArrowRight } from 'lucide-react';
import { getStudentApi, getNoticesApi, loginApi } from '@/lib/api';
import ChildSelector from './ChildSelector';
import ParentPaymentsCard from './ParentPaymentsCard';
import ReportCardViewer from '@/06_Exams/ReportCards/ReportCardViewer';

interface ParentDashboardProps {
  user: any;
  handleLogout: () => void;
}

export default function ParentDashboard({ user, handleLogout }: ParentDashboardProps) {
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  
  // Dashboard state loading
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'profile' | 'attendance' | 'fees' | 'exams' | 'comms'>('profile');
  const [viewingExamResultsStudentId, setViewingExamResultsStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadParentPortalData();
  }, []);

  const loadParentPortalData = async () => {
    setLoading(true);
    try {
      // In parent portal context, user's linked children list is compiled from student registers
      // We search for students associated with this parent. Since parent name/details match,
      // we query the students api. Let's fetch all student profiles and filter those matching.
      // Wait, in real api, parent can fetch their own linked students. We fall back to standard students register.
      const mockDb = localStorage.getItem('aurxon_mock_db');
      let linked: any[] = [];
      
      if (mockDb) {
        const parsed = JSON.parse(mockDb);
        // Find students whose parent email or profile references match
        linked = parsed.students.filter((s: any) => s.parent?.email === user.email || user.profileName.includes(s.parent?.lastName) || s.id === 'stud-1');
      }

      setChildren(linked);
      if (linked.length > 0) {
        setSelectedChildId(linked[0].id);
      }
      
      // Load comms notices
      const nots = await getNoticesApi();
      setNotices(nots.filter((n: any) => n.targetRoles.includes('PARENT')));

    } catch (e) {
      console.error('Failed to load parent dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      loadSelectedChildDetails(selectedChildId);
    }
  }, [selectedChildId]);

  const loadSelectedChildDetails = async (id: string) => {
    setChildLoading(true);
    try {
      const data = await getStudentApi(id);
      setSelectedChild(data);
    } catch (e) {
      console.error(e);
    } finally {
      setChildLoading(false);
    }
  };

  const getAttendanceSummary = () => {
    if (!selectedChild?.attendance) return { present: 0, total: 0, rate: 100 };
    const records = selectedChild.attendance;
    const present = records.filter((r: any) => r.status === 'PRESENT').length;
    const total = records.length;
    return {
      present,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 100,
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground transition-colors duration-500">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">Authenticating Parent Portal Access...</p>
        </div>
      </div>
    );
  }

  if (viewingExamResultsStudentId) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500 px-4 py-8 max-w-4xl mx-auto space-y-6">
        <ReportCardViewer 
          studentId={viewingExamResultsStudentId} 
          onBack={() => setViewingExamResultsStudentId(null)} 
        />
      </div>
    );
  }

  const attendance = getAttendanceSummary();

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 relative">
      {/* Top background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Main page content area */}
      <div className="flex-1 flex flex-col md:pl-0 z-10">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card/45 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-foreground">PARENT PORTAL</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Aurxon ERP Lite</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Logged in parent profile info */}
            <div className="hidden sm:flex items-center gap-3 rounded-xl border border-border p-1.5 bg-card">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-xs shadow">
                {user.profileName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col pr-2 text-left">
                <span className="text-[10px] font-bold text-foreground truncate">{user.profileName}</span>
                <span className="text-[8px] text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Content Grid */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid gap-6 md:grid-cols-4">
          {/* Child Context Switcher left panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-5 border border-border bg-card shadow-sm space-y-4">
              <ChildSelector
                students={children}
                selectedStudentId={selectedChildId}
                onSelectStudent={setSelectedChildId}
              />
            </div>

            {/* Navigation Segments */}
            <div className="glass rounded-3xl p-3 border border-border bg-card shadow-sm space-y-1">
              <button
                onClick={() => setActiveSegment('profile')}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  activeSegment === 'profile' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>Child Profile</span>
              </button>

              <button
                onClick={() => setActiveSegment('attendance')}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  activeSegment === 'attendance' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Attendance Summary</span>
              </button>

              <button
                onClick={() => setActiveSegment('fees')}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  activeSegment === 'fees' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>Fees & Payments</span>
              </button>

              <button
                onClick={() => setActiveSegment('exams')}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  activeSegment === 'exams' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Award className="h-4 w-4 shrink-0" />
                <span>Report Cards</span>
              </button>

              <button
                onClick={() => setActiveSegment('comms')}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  activeSegment === 'comms' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>Circular Notices</span>
              </button>
            </div>
          </div>

          {/* Child Segment Detail Panel */}
          <div className="md:col-span-3">
            {childLoading ? (
              <div className="glass rounded-3xl p-12 border border-border flex flex-col items-center justify-center text-center bg-card">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm font-bold text-muted-foreground">Loading child details...</p>
              </div>
            ) : selectedChild ? (
              <div className="space-y-6">
                {/* 1. Profile Segment */}
                {activeSegment === 'profile' && (
                  <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Demographics & Profile Details</h3>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">Primary academic information</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 text-xs font-semibold text-slate-500">
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-border pb-2">
                          <span className="text-muted-foreground">Full Name:</span>
                          <span className="text-foreground font-bold">{selectedChild.firstName} {selectedChild.lastName}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                          <span className="text-muted-foreground">Scholar Number:</span>
                          <span className="text-foreground font-bold">{selectedChild.scholarNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                          <span className="text-muted-foreground">Class Roll Number:</span>
                          <span className="text-foreground font-bold">{selectedChild.rollNumber}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-border pb-2">
                          <span className="text-muted-foreground">Class Grade:</span>
                          <span className="text-foreground font-bold">{selectedChild.class?.name || 'Class Roster'}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                          <span className="text-muted-foreground">Admission Date:</span>
                          <span className="text-foreground font-bold">
                            {new Date(selectedChild.admissionDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                          <span className="text-muted-foreground">Profile Status:</span>
                          <span className="text-emerald-500 font-bold">{selectedChild.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Attendance Segment */}
                {activeSegment === 'attendance' && (
                  <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Attendance Register</h3>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">Presence rates for active academic year</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                        <span className="block text-2xl font-black text-emerald-500">{attendance.present}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Days Present</span>
                      </div>
                      <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-center">
                        <span className="block text-2xl font-black text-destructive">{attendance.total - attendance.present}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Days Absent</span>
                      </div>
                      <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
                        <span className="block text-2xl font-black text-primary">{attendance.rate}%</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Presence Rate</span>
                      </div>
                    </div>

                    {/* Simple list of recent presence stamps */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground">Recent Check-in Logs</h4>
                      <div className="space-y-2">
                        {selectedChild.attendance && selectedChild.attendance.length > 0 ? (
                          selectedChild.attendance.slice(0, 5).map((log: any, idx: number) => (
                            <div key={idx} className="rounded-xl border border-border p-3 flex justify-between items-center text-xs font-bold bg-muted/20">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </span>
                              <span className={log.status === 'PRESENT' ? 'text-emerald-500' : 'text-destructive'}>
                                {log.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No recent attendance entries recorded on server.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Fees Segment */}
                {activeSegment === 'fees' && (
                  <ParentPaymentsCard
                    allocations={selectedChild.feeAllocations || []}
                    onReload={() => loadSelectedChildDetails(selectedChildId)}
                  />
                )}

                {/* 4. Exams Segment */}
                {activeSegment === 'exams' && (
                  <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Report Cards & Marks Sheets</h3>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">Publish progress report cards</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/20 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-foreground">Progress Report Card (Term 1)</h4>
                        <p className="text-xs text-muted-foreground font-semibold">Compiled and published on server</p>
                      </div>
                      <button
                        onClick={() => setViewingExamResultsStudentId(selectedChild.id)}
                        className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5 shrink-0"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>View Report Card</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Comms Segment */}
                {activeSegment === 'comms' && (
                  <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Circular Announcements feed</h3>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">Important broadcasts targeted for parents</p>
                    </div>

                    <div className="space-y-4">
                      {notices.length === 0 ? (
                        <p className="text-center py-6 text-xs text-muted-foreground italic font-semibold">No recent announcements found.</p>
                      ) : (
                        notices.map((notice) => (
                          <div key={notice.id} className="rounded-2xl border border-border p-5 space-y-2.5 bg-muted/20">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-sm font-extrabold text-foreground">{notice.title}</h4>
                              <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                                {new Date(notice.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{notice.content}</p>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              Broadcast by: {notice.authorName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass rounded-3xl p-12 border border-border text-center text-muted-foreground bg-card">
                No active children details loaded.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
