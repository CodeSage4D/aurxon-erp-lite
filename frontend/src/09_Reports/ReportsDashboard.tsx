'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Users, CreditCard, Calendar, Award, Printer, ArrowRight, Loader2 } from 'lucide-react';
import {
  getStudentRegisterReportApi,
  getMonthlyAttendanceReportApi,
  getFeeDefaultersReportApi,
  getFeeCollectionSummaryReportApi,
  getClassPerformanceReportApi,
  getClassesApi,
  getExamsApi
} from '@/lib/api';

export default function ReportsDashboard() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);

  // Filters
  const [classId, setClassId] = useState('');
  const [examId, setExamId] = useState('');
  const [month, setMonth] = useState('5');
  const [year, setYear] = useState('2026');

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const cls = await getClassesApi();
      setClasses(cls);
      if (cls.length > 0) setClassId(cls[0].id);

      const ex = await getExamsApi();
      setExams(ex);
      if (ex.length > 0) setExamId(ex[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchReport = async (reportType: string) => {
    setActiveReport(reportType);
    setLoading(true);
    setData(null);

    try {
      let res: any = null;
      if (reportType === 'students') {
        res = await getStudentRegisterReportApi(classId || undefined);
      } else if (reportType === 'attendance') {
        res = await getMonthlyAttendanceReportApi(classId, parseInt(month), parseInt(year));
      } else if (reportType === 'defaulters') {
        res = await getFeeDefaultersReportApi(classId || undefined);
      } else if (reportType === 'fees') {
        res = await getFeeCollectionSummaryReportApi();
      } else if (reportType === 'exams') {
        res = await getClassPerformanceReportApi(examId);
      }
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="glass rounded-3xl p-12 border border-border flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-bold text-muted-foreground">Running SQL aggregates...</p>
        </div>
      );
    }

    if (!data) return null;

    switch (activeReport) {
      case 'students':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center print:hidden">
              <h4 className="text-sm font-bold text-foreground">Student Registry Register</h4>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground">
                <Printer className="h-3.5 w-3.5" />
                Print Register
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card/50 glass">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Scholar #</th>
                    <th className="px-4 py-3">Roll #</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Parent Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground font-semibold">
                  {data.map((student: any) => (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-bold text-primary">{student.scholarNumber}</td>
                      <td className="px-4 py-3">{student.rollNumber}</td>
                      <td className="px-4 py-3 font-extrabold">{student.firstName} {student.lastName}</td>
                      <td className="px-4 py-3">{student.class?.name}</td>
                      <td className="px-4 py-3">{student.parent?.firstName} {student.parent?.lastName}</td>
                      <td className="px-4 py-3">{student.parent?.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center print:hidden">
              <h4 className="text-sm font-bold text-foreground">Monthly Attendance Register ({month}/{year})</h4>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground">
                <Printer className="h-3.5 w-3.5" />
                Print Register
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card/50 glass">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Scholar #</th>
                    <th className="px-4 py-3">Roll #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 text-center">Present</th>
                    <th className="px-4 py-3 text-center">Absent</th>
                    <th className="px-4 py-3 text-center">Late</th>
                    <th className="px-4 py-3 text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground font-semibold">
                  {data.summary.map((row: any) => {
                    const rate = row.total > 0 ? Math.round((row.present / row.total) * 100) : 100;
                    return (
                      <tr key={row.student.scholarNumber} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-bold text-primary">{row.student.scholarNumber}</td>
                        <td className="px-4 py-3">{row.student.rollNumber}</td>
                        <td className="px-4 py-3 font-extrabold">{row.student.firstName} {row.student.lastName}</td>
                        <td className="px-4 py-3 text-center text-emerald-500">{row.present}</td>
                        <td className="px-4 py-3 text-center text-destructive">{row.absent}</td>
                        <td className="px-4 py-3 text-center text-amber-500">{row.late}</td>
                        <td className="px-4 py-3 text-center font-bold">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'defaulters':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center print:hidden">
              <h4 className="text-sm font-bold text-foreground">Outstanding Fee Defaulters</h4>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground">
                <Printer className="h-3.5 w-3.5" />
                Print List
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card/50 glass">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Scholar #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Fee Structure</th>
                    <th className="px-4 py-3 text-right">Waived / Due</th>
                    <th className="px-4 py-3 text-right">Amount Paid</th>
                    <th className="px-4 py-3">Parent Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground font-semibold">
                  {data.map((row: any) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-bold text-primary">{row.student.scholarNumber}</td>
                      <td className="px-4 py-3 font-extrabold">{row.student.firstName} {row.student.lastName}</td>
                      <td className="px-4 py-3">{row.student.class?.name}</td>
                      <td className="px-4 py-3">{row.feeStructure.name}</td>
                      <td className="px-4 py-3 text-right text-destructive font-bold">₹{row.amountDue.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-emerald-500">₹{row.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{row.student.parent?.phone || 'No phone linked'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <h4 className="text-sm font-bold text-foreground">Fee Collection Journal Summary</h4>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground">
                <Printer className="h-3.5 w-3.5" />
                Print Journal
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-2xl p-5 border border-border bg-card">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Allocated</span>
                <span className="block text-xl font-black text-foreground mt-1">₹{data.totalDue.toLocaleString('en-IN')}</span>
              </div>
              <div className="glass rounded-2xl p-5 border border-border bg-card">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Collected</span>
                <span className="block text-xl font-black text-emerald-500 mt-1">₹{data.totalCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="glass rounded-2xl p-5 border border-border bg-card">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Outstanding Balance</span>
                <span className="block text-xl font-black text-destructive mt-1">₹{data.outstanding.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 border border-border bg-card flex items-center justify-between">
              <div>
                <h5 className="text-sm font-bold text-foreground">Collection Progress</h5>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">Real-time collections rate</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">{data.collectionPercentage}%</span>
              </div>
            </div>
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <h4 className="text-sm font-bold text-foreground">Class Academic Performance</h4>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground">
                <Printer className="h-3.5 w-3.5" />
                Print Performance
              </button>
            </div>
            
            {data.stats && (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div className="glass rounded-2xl p-4 border border-border text-center bg-card">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Score</span>
                  <span className="block text-xl font-black text-foreground mt-1">{data.stats.average}%</span>
                </div>
                <div className="glass rounded-2xl p-4 border border-border text-center bg-card">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Highest Marks</span>
                  <span className="block text-xl font-black text-emerald-500 mt-1">{data.stats.highest}</span>
                </div>
                <div className="glass rounded-2xl p-4 border border-border text-center bg-card">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pass Rate</span>
                  <span className="block text-xl font-black text-primary mt-1">{data.stats.passPercentage}%</span>
                </div>
                <div className="glass rounded-2xl p-4 border border-border text-center bg-card">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Evaluated</span>
                  <span className="block text-xl font-black text-foreground mt-1">{data.stats.totalStudents}</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-border bg-card/50 glass">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Roll #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Exam Name</th>
                    <th className="px-4 py-3 text-right">Max Marks</th>
                    <th className="px-4 py-3 text-right">Obtained Marks</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground font-semibold">
                  {data.results.map((row: any) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{row.student.rollNumber}</td>
                      <td className="px-4 py-3 font-extrabold">{row.student.firstName} {row.student.lastName}</td>
                      <td className="px-4 py-3">{row.exam.name}</td>
                      <td className="px-4 py-3 text-right">{row.exam.maxMarks}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{row.marksObtained}</td>
                      <td className="px-4 py-3 italic text-muted-foreground">{row.remarks || 'Good attempt'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Institutional Reports Desk
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Compile registry registers, financial collection summaries, and academic registers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 print:hidden">
        {/* Category card selector */}
        <div className="md:col-span-1 space-y-3">
          <button
            onClick={() => handleFetchReport('students')}
            className={`w-full text-left glass rounded-2xl p-4 border flex items-center justify-between transition-all ${
              activeReport === 'students' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border hover:border-primary/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Student Registry</h4>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Registry & enrollment lists</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleFetchReport('attendance')}
            className={`w-full text-left glass rounded-2xl p-4 border flex items-center justify-between transition-all ${
              activeReport === 'attendance' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border hover:border-primary/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Attendance Register</h4>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Monthly presence registers</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleFetchReport('defaulters')}
            className={`w-full text-left glass rounded-2xl p-4 border flex items-center justify-between transition-all ${
              activeReport === 'defaulters' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border hover:border-primary/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Fee Defaulters</h4>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Outstanding collection logs</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleFetchReport('fees')}
            className={`w-full text-left glass rounded-2xl p-4 border flex items-center justify-between transition-all ${
              activeReport === 'fees' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border hover:border-primary/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Collection Journal</h4>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Aggregated payments journal</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleFetchReport('exams')}
            className={`w-full text-left glass rounded-2xl p-4 border flex items-center justify-between transition-all ${
              activeReport === 'exams' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border hover:border-primary/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Exam Performance</h4>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Subject class performance</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Filter configuration */}
        <div className="md:col-span-2">
          <div className="glass rounded-3xl p-6 border border-border bg-card space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Report parameters</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Class / Grade</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary glass"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {activeReport === 'exams' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Exam Schedule</label>
                  <select
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary glass"
                  >
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              )}

              {activeReport === 'attendance' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary glass"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2026, i, 1).toLocaleString(undefined, { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary glass"
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report display container */}
      <div className="glass rounded-3xl p-6 border border-border bg-card/30 print:border-none print:bg-transparent print:p-0">
        {activeReport ? renderReportContent() : (
          <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
            Select a report format from the sidebar categories to compile the data.
          </div>
        )}
      </div>
    </div>
  );
}
