'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface AttendanceTabProps {
  classes: any[];
  selectedClass: string;
  loadAttendanceRoster: (classId: string) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  attendanceRecords: any[];
  setAttendanceRecords: (records: any[]) => void;
  handleSaveAttendance: () => void;
  rfidLogs: string[];
}

export default function AttendanceTab({
  classes,
  selectedClass,
  loadAttendanceRoster,
  attendanceDate,
  setAttendanceDate,
  attendanceRecords,
  setAttendanceRecords,
  handleSaveAttendance,
  rfidLogs
}: AttendanceTabProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        Biometric Attendance Register
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grade Class</label>
          <select
            value={selectedClass}
            onChange={e => loadAttendanceRoster(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
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
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-semibold"
          />
        </div>
      </div>

      {selectedClass ? (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((rec, idx) => (
                    <tr key={rec.studentId} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 transition">
                      <td className="p-3 text-zinc-500 font-mono">{rec.rollNumber}</td>
                      <td className="p-3 font-bold text-zinc-850 dark:text-zinc-200">{rec.firstName} {rec.lastName}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...attendanceRecords];
                            list[idx].status = 'PRESENT';
                            setAttendanceRecords(list);
                          }}
                          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${
                            rec.status === 'PRESENT' 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                          }`}
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
                          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${
                            rec.status === 'ABSENT' 
                              ? 'bg-rose-600 text-white shadow-sm' 
                              : 'bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                          }`}
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
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-zinc-400 italic">No students found in selected grade.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button 
            onClick={handleSaveAttendance} 
            className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
          >
            Submit Daily Register
          </button>
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-50/50 dark:bg-zinc-950/15 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-xs text-zinc-400 font-medium">Please select a class grade above to load the attendance register.</p>
        </div>
      )}

      {/* Real-time Biometric Terminal feed inside attendance panel too for visual consistency */}
      <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/10 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Terminal RFID Log Monitoring</h4>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {rfidLogs.slice(0, 3).map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/40 p-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
