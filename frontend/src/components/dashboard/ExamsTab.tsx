'use client';

import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';

interface ExamsTabProps {
  examsTab: 'list' | 'entry';
  setExamsTab: (tab: 'list' | 'entry') => void;
  examForm: { name: string; subjectId: string; maxMarks: string; examDate: string; examType: string };
  setExamForm: (form: any) => void;
  handleCreateExam: (e: React.FormEvent) => void;
  stats: any;
  loadExamMarksSheet: (examId: string) => void;
  selectedExamId: string;
  examStudents: any[];
  setExamStudents: (students: any[]) => void;
  handleSaveExamResults: () => void;
}

export default function ExamsTab({
  examsTab,
  setExamsTab,
  examForm,
  setExamForm,
  handleCreateExam,
  stats,
  loadExamMarksSheet,
  selectedExamId,
  examStudents,
  setExamStudents,
  handleSaveExamResults
}: ExamsTabProps) {

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

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Exams & CBSE Grading Desk</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setExamsTab('list')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              examsTab === 'list' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Exams List
          </button>
          <button 
            onClick={() => setExamsTab('entry')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              examsTab === 'entry' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Marks Entry
          </button>
        </div>
      </div>

      {examsTab === 'list' && (
        <div className="space-y-6">
          {/* Create exam form */}
          <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exam Title</label>
              <input 
                required 
                placeholder="Term 1 Algebra Test" 
                value={examForm.name} 
                onChange={e => setExamForm({...examForm, name: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subject ID</label>
              <input 
                required 
                placeholder="subj-1" 
                value={examForm.subjectId} 
                onChange={e => setExamForm({...examForm, subjectId: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Max Marks</label>
              <input 
                type="number" 
                required 
                placeholder="100" 
                value={examForm.maxMarks} 
                onChange={e => setExamForm({...examForm, maxMarks: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" 
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule Exam</span>
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Evaluations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20 hover-lift">
                <div className="flex justify-between items-center text-xs">
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-bold text-sky-600 dark:text-sky-400 uppercase">
                    Algebra Mid-term
                  </span>
                  <span className="font-bold text-zinc-400">Max Marks: 100</span>
                </div>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-450">Subject: Advanced Mathematics | Class: Grade 10-A</p>
                <button 
                  onClick={() => loadExamMarksSheet('exam-1')} 
                  className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <span>Open Marks Grader</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {examsTab === 'entry' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <h4>CBSE Roster Marks Entry</h4>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-sky-600 dark:text-sky-400 uppercase font-mono">
              Exam ID: {selectedExamId}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Theory Marks (Max 80)</th>
                  <th className="p-3">Internal/Practical (Max 20)</th>
                  <th className="p-3">Total Obtained (Max 100)</th>
                  <th className="p-3">CBSE Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {examStudents.length > 0 ? (
                  examStudents.map((stud, idx) => {
                    const total = parseFloat(stud.marksObtained || 0);
                    const theory = Math.round(total * 0.8);
                    const practical = Math.round(total * 0.2);
                    return (
                      <tr key={stud.studentId} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 transition">
                        <td className="p-3 text-zinc-500 font-mono">{stud.rollNumber}</td>
                        <td className="p-3 font-bold text-zinc-800 dark:text-zinc-100">{stud.firstName} {stud.lastName}</td>
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
                            className="w-20 rounded border border-zinc-200 p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-center font-bold"
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
                            className="w-20 rounded border border-zinc-200 p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-center font-bold"
                          />
                        </td>
                        <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">{total} / 100</td>
                        <td className="p-3">
                          <span className="rounded bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 font-mono">
                            {getGrade(total, 100)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-zinc-400 italic">No student result registers loaded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleSaveExamResults} 
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
            >
              Save Marks & Grade Sheet
            </button>
            <button 
              onClick={() => setExamsTab('list')} 
              className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
