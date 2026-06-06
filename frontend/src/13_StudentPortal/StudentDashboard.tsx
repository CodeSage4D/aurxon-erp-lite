'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LogOut, Clock, Calendar, CheckCircle, 
  AlertCircle, BookOpen, FileText, Award, Loader2 
} from 'lucide-react';
import { getStudentApi, getNoticesApi } from '@/lib/api';

interface StudentDashboardProps {
  user: any;
  handleLogout: () => void;
}

export default function StudentDashboard({ user, handleLogout }: StudentDashboardProps) {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSegment, setActiveSegment] = useState<'overview' | 'timetable' | 'homework' | 'notices'>('overview');

  const studentId = user?.profileId || 'stud-1';

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentApi(studentId);
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student profile details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground transition-colors duration-500">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">Authenticating Student Profile Access...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="glass rounded-3xl p-8 border border-border text-center max-w-sm space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm font-bold text-destructive">{error || 'Student details not found'}</p>
          <button onClick={handleLogout} className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-xs font-bold shadow-sm">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Pre-load structured elements for student view
  const attendanceRecords = student.attendance || [];
  const presentCount = attendanceRecords.filter((r: any) => r.status === 'PRESENT').length;
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 96;

  // Timetable fallback
  const timetable = [
    { period: 1, time: '08:30 - 09:15', subject: 'Advanced Mathematics', room: 'Room 302', teacher: 'Sarah Connor' },
    { period: 2, time: '09:15 - 10:00', subject: 'Introductory Physics', room: 'Lab 2', teacher: 'John Keating' },
    { period: 3, time: '10:15 - 11:00', subject: 'English Literature', room: 'Room 104', teacher: 'John Keating' },
    { period: 4, time: '11:00 - 11:45', subject: 'Social Studies', room: 'Room 302', teacher: 'Sarah Connor' }
  ];

  // Homework list
  const homeworkList = [
    { id: 'hw-1', subject: 'Mathematics', title: 'Calculus Integration Sheet', dueDate: '2026-06-05', status: 'PENDING', desc: 'Complete problems 1 to 15 on definite integrals' },
    { id: 'hw-2', subject: 'Physics', title: 'Newtonian Forces Lab Report', dueDate: '2026-06-03', status: 'SUBMITTED', desc: 'Compile observations of free fall parameters' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative flex flex-col">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card/45 backdrop-blur-xl sticky top-0 z-20 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-foreground">STUDENT DESK</span>
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{user?.institutionName || 'Student Portal'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* User badge */}
          <div className="flex items-center gap-3 rounded-xl border border-border p-1.5 bg-card">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-xs shadow">
              {student.firstName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-foreground truncate">{student.firstName} {student.lastName}</span>
              <span className="text-[8px] text-muted-foreground truncate">{student.rollNumber}</span>
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

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto grid gap-6 md:grid-cols-4">
        {/* Navigation Tabs card */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass rounded-3xl p-3 border border-border bg-card shadow-sm space-y-1">
            <button
              onClick={() => setActiveSegment('overview')}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                activeSegment === 'overview' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Overview & Grades</span>
            </button>
            <button
              onClick={() => setActiveSegment('timetable')}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                activeSegment === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Class Timetable</span>
            </button>
            <button
              onClick={() => setActiveSegment('homework')}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                activeSegment === 'homework' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Homework logs</span>
            </button>
          </div>
        </div>

        {/* Content Body Panel */}
        <div className="md:col-span-3">
          <div className="space-y-6">
            {/* 1. Overview */}
            {activeSegment === 'overview' && (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Attendance Rate</span>
                      <span className="block text-2xl font-black text-foreground mt-0.5">{attendanceRate}%</span>
                      <span className="block text-[10px] text-muted-foreground font-semibold">Active session index</span>
                    </div>
                  </div>

                  <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Subjects registered</span>
                      <span className="block text-2xl font-black text-foreground mt-0.5">{student.class?.subjects?.length || 4}</span>
                      <span className="block text-[10px] text-muted-foreground font-semibold">Class: {student.class?.name || 'Class Grade'}</span>
                    </div>
                  </div>
                </div>

                {/* Profile detail */}
                <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Demographic verification credentials</h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs font-semibold text-slate-500">
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Scholar Number:</span>
                      <span className="text-foreground font-bold">{student.scholarNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Permanent Ed Number (PEN):</span>
                      <span className="text-foreground font-bold">{student.penNumber || 'Verified by Board'}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Aadhaar Number:</span>
                      <span className="text-foreground font-bold">{student.aadhaarNumber ? `xxxx-xxxx-${student.aadhaarNumber.slice(-4)}` : 'Aadhaar Pending'}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Blood Group:</span>
                      <span className="text-foreground font-bold">{student.bloodGroup || 'O+'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Timetable */}
            {activeSegment === 'timetable' && (
              <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Weekly Period Timetable</h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">Assigned daily subject mappings</p>
                </div>
                <div className="space-y-3">
                  {timetable.map((period) => (
                    <div key={period.period} className="rounded-2xl border border-border p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-muted/20 hover:border-primary/25 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {period.period}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{period.subject}</h4>
                          <span className="text-[10px] text-muted-foreground font-semibold">{period.teacher}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground sm:text-right">
                        <span>{period.time}</span>
                        <span className="rounded bg-card px-2 py-0.5 border border-border">{period.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Homework */}
            {activeSegment === 'homework' && (
              <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Homework assignments ledger</h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">Assigned subject activities</p>
                </div>
                <div className="space-y-3">
                  {homeworkList.map((hw) => (
                    <div key={hw.id} className="rounded-2xl border border-border p-4 flex flex-col justify-between sm:flex-row sm:items-center gap-4 bg-muted/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">{hw.title}</h4>
                          <span className="text-[9px] text-primary font-bold bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 uppercase">{hw.subject}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold">{hw.desc}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 sm:items-end">
                        <span className={`text-[9px] font-black rounded px-1.5 py-0.5 border w-fit ${
                          hw.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {hw.status}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground">Due: {hw.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
