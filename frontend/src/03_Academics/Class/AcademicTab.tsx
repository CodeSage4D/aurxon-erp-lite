'use client';

import React from 'react';
import { 
  BadgeInfo, Sliders, RefreshCw, CalendarCheck, Clock, Plus, Trash2 
} from 'lucide-react';
import { 
  saveTimetableApi, 
  generateTimetableApi, 
  createLessonPlanApi, 
  updateLessonPlanApi, 
  deleteLessonPlanApi 
} from '@/lib/api';

interface AcademicTabProps {
  classes: any[];
  selectedAcademicClassId: string;
  setSelectedAcademicClassId: (val: string) => void;
  timetablePreview: any[] | null;
  setTimetablePreview: (val: any[] | null) => void;
  timetableEntries: any[];
  loadTimetable: (classId: string) => void;
  schedulerConfig: { periodsPerDay: number; durationMin: number; startTime: string };
  setSchedulerConfig: (val: any) => void;
  currentRole: string;
  user: any;
  triggerToast: (msg: string) => void;
  academicTab: 'timetable' | 'lessons';
  setAcademicTab: (tab: 'timetable' | 'lessons') => void;
  selectedClass: string;
  subjectsList: any[];
  lessonPlans: any[];
  loadLessonPlans: () => void;
}

export default function AcademicTab({
  classes,
  selectedAcademicClassId,
  setSelectedAcademicClassId,
  timetablePreview,
  setTimetablePreview,
  timetableEntries,
  loadTimetable,
  schedulerConfig,
  setSchedulerConfig,
  currentRole,
  user,
  triggerToast,
  academicTab,
  setAcademicTab,
  selectedClass,
  subjectsList,
  lessonPlans,
  loadLessonPlans
}: AcademicTabProps) {
  const currentClass = classes.find(c => c.id === selectedAcademicClassId);
  const isClassIncharge = currentClass && (
    currentRole === 'SUPER_ADMIN' || 
    currentRole === 'INSTITUTE_ADMIN' || 
    (currentRole === 'TEACHER' && user?.profileId === currentClass.classTeacherId)
  );

  const activeEntries = timetablePreview || timetableEntries || [];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  
  // Get unique period list
  const uniquePeriods = Array.from(new Set(activeEntries.map(e => e.periodNumber)))
    .sort((a, b) => Number(a) - Number(b));

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Academic & Syllabus Desk</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setAcademicTab('timetable')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              academicTab === 'timetable' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Weekly Timetable
          </button>
          <button 
            onClick={() => setAcademicTab('lessons')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              academicTab === 'lessons' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Syllabus Logs
          </button>
        </div>
      </div>

      {academicTab === 'timetable' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Class Scope</label>
                <select
                  value={selectedAcademicClassId}
                  onChange={(e) => {
                    setSelectedAcademicClassId(e.target.value);
                    setTimetablePreview(null);
                  }}
                  className="mt-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 min-w-[180px] font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.section || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {currentClass && (
                <div className="text-xs bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800/60 mt-4 md:mt-0">
                  <span className="text-zinc-400 font-medium">Class Teacher: </span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{currentClass.classTeacher || 'Not Assigned'}</span>
                </div>
              )}
            </div>

            {/* Preview Indicator */}
            {timetablePreview && (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30 px-4 py-2 rounded-xl text-xs font-semibold animate-fade-in">
                <BadgeInfo className="h-4 w-4 animate-pulse text-amber-600 dark:text-amber-400" />
                <span>Draft Preview Mode (Unsaved)</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-extrabold animate-pulse">
                  ✓ CONFLICT-FREE CHECKED
                </span>
                <div className="flex gap-1.5 ml-2">
                  <button
                    onClick={async () => {
                      try {
                        await saveTimetableApi(selectedAcademicClassId, timetablePreview);
                        triggerToast('Timetable published to database successfully!');
                        loadTimetable(selectedAcademicClassId);
                      } catch (err: any) {
                        alert(err.message || 'Failed to save timetable');
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTimetablePreview(null);
                      triggerToast('Draft discarded.');
                    }}
                    className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg font-bold transition"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scheduler Setup (Only for Class Incharge or Admin) */}
          {isClassIncharge ? (
            <div className="bg-sky-50/40 dark:bg-sky-950/10 border border-sky-100/50 dark:border-sky-950/20 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  <span>Intelligent Auto-Scheduler Controls</span>
                </h5>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-850 dark:bg-sky-900/50 dark:text-sky-350 px-2 py-0.5 rounded-full">Authorized: Class Incharge</span>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const data = await generateTimetableApi(
                      selectedAcademicClassId,
                      schedulerConfig.periodsPerDay,
                      schedulerConfig.durationMin,
                      schedulerConfig.startTime
                    );
                    setTimetablePreview(data);
                    triggerToast('Draft timetable generated! Previewing weekly slots below.');
                  } catch (err: any) {
                    alert(err.message || 'Auto-scheduling failed');
                  }
                }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Periods / Day</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={schedulerConfig.periodsPerDay}
                    onChange={(e) => setSchedulerConfig({ ...schedulerConfig, periodsPerDay: Number(e.target.value) })}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 font-medium text-zinc-800 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Duration (mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={schedulerConfig.durationMin}
                    onChange={(e) => setSchedulerConfig({ ...schedulerConfig, durationMin: Number(e.target.value) })}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 font-medium text-zinc-800 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Start Time</label>
                  <input
                    type="time"
                    value={schedulerConfig.startTime}
                    onChange={(e) => setSchedulerConfig({ ...schedulerConfig, startTime: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 font-medium text-zinc-800 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-sm transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Auto-Generate Draft</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 p-4 rounded-2xl flex items-center gap-3">
              <Clock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-650 dark:text-zinc-300">Timetable Management Locked.</span> Only the Class Incharge (<b>{currentClass?.classTeacher || 'assigned teacher'}</b>) or an Administrator can auto-generate or publish schedules for this class.
              </div>
            </div>
          )}

          {/* Matrix Grid */}
          {activeEntries.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50/45 dark:bg-zinc-950/10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
              <CalendarCheck className="h-10 w-10 text-zinc-300 mx-auto" />
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Timetable Found</h4>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                There are no scheduled timetable periods for this class yet.
                {isClassIncharge && " Use the auto-scheduler above to create one."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100/60 dark:bg-zinc-950/60 font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-3.5 text-zinc-500 uppercase tracking-wider text-[10px] w-24">Day</th>
                    {uniquePeriods.map((p) => {
                      const periodSample = activeEntries.find(e => e.periodNumber === p);
                      return (
                        <th key={p} className="p-3.5 text-zinc-700 dark:text-zinc-300 min-w-[140px]">
                          <div className="font-black text-[11px] text-zinc-800 dark:text-zinc-200">Period {p}</div>
                          {periodSample && (
                            <div className="text-[10px] text-zinc-455 font-normal mt-0.5">
                              ({periodSample.startTime} - {periodSample.endTime})
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                  {days.map((day) => (
                    <tr key={day} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition">
                      <td className="p-3.5 font-black uppercase text-[10px] text-zinc-400 bg-zinc-100/20 dark:bg-zinc-950/20 border-r border-zinc-100 dark:border-zinc-800/60">
                        {day}
                      </td>
                      {uniquePeriods.map((p) => {
                        const entry = activeEntries.find(
                          (e) => e.dayOfWeek === day && e.periodNumber === p
                        );

                        if (!entry) {
                          return <td key={p} className="p-3.5 text-zinc-400 italic">Free Period</td>;
                        }

                        const isSelfStudy = entry.subject?.name?.toLowerCase() === 'self study';

                        return (
                          <td key={p} className="p-3.5">
                            <div className="space-y-2">
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                isSelfStudy
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                                  : 'bg-sky-100 text-sky-850 dark:bg-sky-950/30 dark:text-sky-300'
                              }`}>
                                {entry.subject?.name}
                              </span>
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 space-y-1 font-medium">
                                <div className="flex items-center gap-1">
                                  <span>👨‍🏫 {entry.teacher?.firstName} {entry.teacher?.lastName}</span>
                                </div>
                                {entry.room && (
                                  <div className="flex items-center">
                                    <span className="text-[10px] text-emerald-650 dark:text-emerald-450 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-250 dark:border-emerald-900/30 w-max">
                                      🏢 Room: {entry.room}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {isClassIncharge && timetablePreview ? (
                                <div className="mt-2 pt-1 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold">Room Alloc</label>
                                  <input
                                    type="text"
                                    value={entry.room || ''}
                                    onChange={(e) => {
                                      const updated = timetablePreview.map((item) => {
                                        if (item.dayOfWeek === day && item.periodNumber === p) {
                                          return { ...item, room: e.target.value };
                                        }
                                        return item;
                                      });
                                      setTimetablePreview(updated);
                                    }}
                                    placeholder="e.g. Room 10A"
                                    className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-[10px] outline-none dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                                  />
                                </div>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {academicTab === 'lessons' && (
        <div className="space-y-6">
          {/* Create Lesson plan */}
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const title = (e.target as any).elements.title.value;
              const content = (e.target as any).elements.content.value;
              
              // Find matching subject
              const subjs = subjectsList.length > 0 ? subjectsList : [{ id: 'subj-1' }];
              await createLessonPlanApi({ title, content, subjectId: subjs[0].id, syllabusPercent: 0 });
              triggerToast('Syllabus item plan created!');
              (e.target as any).reset();
              loadLessonPlans();
            }} 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Lesson Title</label>
              <input 
                name="title" 
                required 
                placeholder="e.g. Organic Chemistry Carbon compounds" 
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Scope Details</label>
              <input 
                name="content" 
                required 
                placeholder="Syllabus chapter guidelines" 
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100" 
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Chapter plan</span>
              </button>
            </div>
          </form>

          {/* List of plans with syllabus sliders */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Syllabus Completion & Lesson Tracker</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonPlans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 uppercase">
                        {plan.subject?.name || 'Academics'}
                      </span>
                      <h5 className="mt-2 text-xs font-black text-zinc-800 dark:text-white">{plan.title}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {plan.status}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this lesson plan?')) {
                            try {
                              await deleteLessonPlanApi(plan.id);
                              triggerToast('Lesson plan deleted successfully.');
                              loadLessonPlans();
                            } catch (err: any) {
                              alert(err.message || 'Failed to delete');
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{plan.content}</p>
                  
                  {/* Syllabus progress bar + slider */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                      <span>Syllabus Covered</span>
                      <span>{plan.syllabusPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 transition-all duration-300" 
                        style={{ width: `${plan.syllabusPercent}%` }} 
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={plan.syllabusPercent}
                      onChange={async (e) => {
                        const val = parseInt(e.target.value);
                        const status = val === 100 ? 'COMPLETED' : val > 0 ? 'IN_PROGRESS' : 'PENDING';
                        await updateLessonPlanApi(plan.id, { syllabusPercent: val, status });
                        loadLessonPlans();
                      }}
                      className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer range-xs dark:bg-zinc-700 accent-sky-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
