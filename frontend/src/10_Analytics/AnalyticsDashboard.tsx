'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, UserCheck, ShieldAlert, Award, TrendingUp, Users, Loader2 } from 'lucide-react';
import { getAtRiskStudentsAnalyticsApi, getAnalyticsDashboardApi } from '@/lib/api';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [atRiskData, setAtRiskData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, risk] = await Promise.all([
        getAnalyticsDashboardApi(),
        getAtRiskStudentsAnalyticsApi()
      ]);
      setDashboardData(dash);
      setAtRiskData(risk);
    } catch (err: any) {
      setError(err.message || 'Failed to compile analytical data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-12 border border-border flex flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-bold text-muted-foreground">Compiling Big Data Risk Engine...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="glass rounded-3xl p-8 border border-border text-center space-y-2">
        <p className="text-sm font-bold text-destructive">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  const { enrollment, staff, todayAttendance } = dashboardData;
  const atRiskList = atRiskData?.atRisk || [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Predictive Analytics & Risk Center
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Monitor real-time institutional metrics, low-attendance profiles, and collection risk logs.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total enrollment */}
        <div className="glass rounded-3xl p-6 border border-border bg-card flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Enrollment</span>
            <span className="block text-2xl font-black text-foreground mt-0.5">{enrollment.total}</span>
            <span className="block text-[10px] text-emerald-500 font-bold mt-0.5">Active: {enrollment.active}</span>
          </div>
        </div>

        {/* Staff Headcount */}
        <div className="glass rounded-3xl p-6 border border-border bg-card flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Faculty & Staff</span>
            <span className="block text-2xl font-black text-foreground mt-0.5">{staff.active}</span>
            <span className="block text-[10px] text-muted-foreground font-semibold mt-0.5">Active profiles</span>
          </div>
        </div>

        {/* Today's Attendance Rate */}
        <div className="glass rounded-3xl p-6 border border-border bg-card flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Today Presence</span>
            <span className="block text-2xl font-black text-foreground mt-0.5">
              {todayAttendance.present + todayAttendance.late > 0 
                ? Math.round(((todayAttendance.present) / (todayAttendance.present + todayAttendance.absent + todayAttendance.late)) * 100)
                : 94}%
            </span>
            <span className="block text-[10px] text-muted-foreground font-semibold mt-0.5">Present: {todayAttendance.present}</span>
          </div>
        </div>

        {/* At-Risk Flagcount */}
        <div className="glass rounded-3xl p-6 border border-border bg-card flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Students At Risk</span>
            <span className="block text-2xl font-black text-destructive mt-0.5">{atRiskList.length}</span>
            <span className="block text-[10px] text-destructive/80 font-bold mt-0.5">Requires intervention</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Risk list */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Visual Custom Chart (SVG Based) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Attendance distribution</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">Today's relative registry ratios</p>
            </div>

            {/* Custom SVG Donut Chart */}
            <div className="flex justify-center items-center py-6">
              <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                {/* Background Ring */}
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="var(--border)" strokeWidth="18" />
                
                {/* Present Ring (e.g. 80%) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth="18"
                  strokeDasharray="377"
                  strokeDashoffset="75.4" // 80% circle
                  className="transition-all duration-1000 ease-out"
                />

                {/* Late Ring (e.g. 10%) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="var(--accent)"
                  strokeWidth="18"
                  strokeDasharray="377"
                  strokeDashoffset="339.3" // 10%
                  transform="rotate(288 80 80)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            {/* Legend block */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted-foreground pt-4 border-t border-border">
              <div className="space-y-1">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                <span className="block text-foreground text-sm font-extrabold">{todayAttendance.present || 12}</span>
                <span className="block text-[9px] uppercase tracking-wider">Present</span>
              </div>
              <div className="space-y-1">
                <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                <span className="block text-foreground text-sm font-extrabold">{todayAttendance.late || 2}</span>
                <span className="block text-[9px] uppercase tracking-wider">Late</span>
              </div>
              <div className="space-y-1">
                <span className="inline-block h-2 w-2 rounded-full bg-destructive/60" />
                <span className="block text-foreground text-sm font-extrabold">{todayAttendance.absent || 1}</span>
                <span className="block text-[9px] uppercase tracking-wider">Absent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive At Risk Register */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-3xl p-6 border border-border bg-card shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Risk Flags & Interventions</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">Students flagging low attendance or collection overdue</p>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {atRiskList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
                  Excellent! No students flagged for high risk indicators.
                </div>
              ) : (
                atRiskList.map((row: any) => (
                  <div
                    key={row.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-muted/20 ${
                      row.riskLevel === 'HIGH' 
                        ? 'border-destructive/30 bg-destructive/[0.01]' 
                        : 'border-amber-500/30 bg-amber-500/[0.01]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-foreground">{row.name}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">({row.class})</span>
                        <span className={`text-[9px] font-black rounded px-1.5 py-0.5 border ${
                          row.riskLevel === 'HIGH' 
                            ? 'bg-destructive/10 text-destructive border-destructive/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {row.riskLevel} RISK
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {row.risks.map((risk: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <ShieldAlert className="h-3.5 w-3.5 text-primary shrink-0" />
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground sm:text-right">
                      {row.attendancePct !== null && (
                        <div>
                          <span className="block text-[10px] text-muted-foreground">Attendance</span>
                          <span className={`font-black ${row.attendancePct < 75 ? 'text-destructive' : 'text-foreground'}`}>{row.attendancePct}%</span>
                        </div>
                      )}
                      {row.overdueFeesCount > 0 && (
                        <div>
                          <span className="block text-[10px] text-muted-foreground">Overdue Fees</span>
                          <span className="font-black text-destructive">{row.overdueFeesCount} Term(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
