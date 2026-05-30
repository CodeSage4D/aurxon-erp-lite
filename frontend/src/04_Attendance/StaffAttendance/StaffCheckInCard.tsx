'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, Calendar, CheckCircle, AlertCircle, Loader2, Sparkles, History } from 'lucide-react';
import { recordStaffAttendanceApi, getStaffAttendanceSummaryApi } from '@/lib/api';

interface StaffCheckInCardProps {
  user: any;
}

export default function StaffCheckInCard({ user }: StaffCheckInCardProps) {
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const staffId = user?.profileId;
  const today = new Date();

  useEffect(() => {
    if (staffId) {
      loadAttendanceData();
    }
  }, [staffId]);

  const loadAttendanceData = async () => {
    setSummaryLoading(true);
    setError('');
    try {
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const data = await getStaffAttendanceSummaryApi(staffId, month, year);
      setSummary(data.summary);
      
      // Find today's check-in/out record from history
      const todayStr = today.toISOString().substring(0, 10);
      const foundToday = data.records.find((r: any) => r.date.startsWith(todayStr));
      setTodayRecord(foundToday || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance logs');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handlePunch = async (action: 'IN' | 'OUT') => {
    if (!staffId) return;
    setLoading(true);
    setError('');
    
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const payload: any = {
        staffId,
        status: 'PRESENT',
      };
      
      if (action === 'IN') {
        payload.clockIn = timeStr;
      } else {
        payload.clockOut = timeStr;
      }

      await recordStaffAttendanceApi(payload);
      setToast(action === 'IN' ? 'Clocked in successfully!' : 'Clocked out successfully!');
      setTimeout(() => setToast(''), 4000);
      await loadAttendanceData();
    } catch (err: any) {
      setError(err.message || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  if (!staffId) {
    return (
      <div className="glass rounded-3xl p-6 border border-border text-center text-muted-foreground">
        No active staff member profile linked to this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/25 border border-primary/20 flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4 w-4" />
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive backdrop-blur-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Check-In / Punch Card */}
        <div className="md:col-span-1 lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-border flex flex-col justify-between h-full relative overflow-hidden shadow-lg bg-card">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Self-Service Punch</span>
                  <h3 className="text-lg font-bold text-foreground">Digital Timecard</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <div className="text-3xl font-extrabold text-foreground">
                  {today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {today.toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>

              {/* Status indicators */}
              <div className="rounded-2xl bg-muted/30 border border-border p-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Clock In:</span>
                  <span className="text-foreground font-bold">{todayRecord?.clockIn || '--:--'}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Clock Out:</span>
                  <span className="text-foreground font-bold">{todayRecord?.clockOut || '--:--'}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Today's Status:</span>
                  <span className={`font-bold ${todayRecord ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {todayRecord ? todayRecord.status : 'NOT CHECKED IN'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handlePunch('IN')}
                disabled={loading || !!todayRecord?.clockIn}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                <span>Check In</span>
              </button>

              <button
                onClick={() => handlePunch('OUT')}
                disabled={loading || !todayRecord?.clockIn || !!todayRecord?.clockOut}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive text-white py-3.5 text-sm font-bold shadow-lg shadow-destructive/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Check Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Summary Statistics */}
        <div className="md:col-span-1 lg:col-span-2">
          <div className="glass rounded-3xl p-6 border border-border h-full flex flex-col justify-between shadow-lg bg-card">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Metrics</span>
                  <h3 className="text-lg font-bold text-foreground">Attendance analytics</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <History className="h-5 w-5" />
                </div>
              </div>

              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">Loading attendance logs...</p>
                </div>
              ) : summary ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                    <span className="block text-2xl font-black text-emerald-500">{summary.present}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Days Present</span>
                  </div>

                  <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-center">
                    <span className="block text-2xl font-black text-destructive">{summary.absent}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Days Absent</span>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                    <span className="block text-2xl font-black text-amber-500">{summary.halfDay}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Half Days</span>
                  </div>

                  <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
                    <span className="block text-2xl font-black text-primary">{summary.onLeave}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">On Leave</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
                  No attendance records exist for this month.
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-border pt-4 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 justify-end">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Biometric logs auto-synced with institutional server.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
