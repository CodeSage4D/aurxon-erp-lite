'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, Trash2, Calendar, BookOpen, UserCheck, AlertCircle, 
  CheckCircle, Clock, Tag, MessageSquare, ChevronRight, FileText, Check, ShieldAlert
} from 'lucide-react';
import { 
  getTodoTasksApi, createTodoTaskApi, updateTodoTaskApi, deleteTodoTaskApi,
  getDiaryEntriesApi, getSharedDiaryEntriesApi, createDiaryEntryApi, updateDiaryEntryApi, deleteDiaryEntryApi,
  getPlannerActivitiesApi, createPlannerActivityApi, updatePlannerActivityApi, deletePlannerActivityApi,
  getAssignedTasksApi, createAssignedTaskApi, updateAssignedTaskApi, escalateAssignedTaskApi
} from '@/lib/api';

interface ProductivityTabProps {
  user: any;
  currentRole: string;
  staff: any[];
  triggerToast: (msg: string) => void;
}

type SubTabType = 'todos' | 'planner' | 'diary' | 'tasks';

export default function ProductivityTab({
  user,
  currentRole,
  staff,
  triggerToast
}: ProductivityTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('todos');

  // To-Do lists state
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', dueDate: '' });

  // Planner state
  const [plannerEvents, setPlannerEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', activityDate: '', startTime: '09:00', endTime: '10:00', category: 'ACTIVITY' });

  // Diary state
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [sharedEntries, setSharedEntries] = useState<any[]>([]);
  const [newDiary, setNewDiary] = useState({ title: '', content: '', category: 'PERSONAL', isShared: false });

  // Assigned Tasks state
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' });
  const [taskFeedback, setTaskFeedback] = useState<{ [taskId: string]: string }>({});

  // Unified loader
  const loadProductivityData = async () => {
    try {
      if (activeSubTab === 'todos') {
        setTodos(await getTodoTasksApi());
      } else if (activeSubTab === 'planner') {
        setPlannerEvents(await getPlannerActivitiesApi());
      } else if (activeSubTab === 'diary') {
        setDiaryEntries(await getDiaryEntriesApi());
        setSharedEntries(await getSharedDiaryEntriesApi());
      } else if (activeSubTab === 'tasks') {
        setAssignedTasks(await getAssignedTasksApi());
      }
    } catch (err) {
      console.error('Failed to load productivity data', err);
    }
  };

  useEffect(() => {
    loadProductivityData();
  }, [activeSubTab]);

  // ----------------------------------------------------
  // To-Dos Handlers
  // ----------------------------------------------------
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title) return;
    try {
      await createTodoTaskApi(newTodo);
      triggerToast('Task catalogued in your personal checklist!');
      setNewTodo({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', dueDate: '' });
      loadProductivityData();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await updateTodoTaskApi(id, { completed });
      triggerToast(completed ? 'Item marked complete!' : 'Item reopened.');
      loadProductivityData();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodoTaskApi(id);
      triggerToast('Task deleted.');
      loadProductivityData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // ----------------------------------------------------
  // Planner Handlers
  // ----------------------------------------------------
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.activityDate) return;
    try {
      await createPlannerActivityApi(newEvent);
      triggerToast('Activity published to your daily agenda!');
      setNewEvent({ title: '', description: '', activityDate: '', startTime: '09:00', endTime: '10:00', category: 'ACTIVITY' });
      loadProductivityData();
    } catch (err) {
      alert('Failed to publish activity');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deletePlannerActivityApi(id);
      triggerToast('Activity removed.');
      loadProductivityData();
    } catch (err) {
      alert('Failed to remove event');
    }
  };

  // ----------------------------------------------------
  // Diary Handlers
  // ----------------------------------------------------
  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiary.title || !newDiary.content) return;
    try {
      await createDiaryEntryApi(newDiary);
      triggerToast(newDiary.isShared ? 'Diary entry posted to shared faculty feeds!' : 'Diary entry catalogued privately.');
      setNewDiary({ title: '', content: '', category: 'PERSONAL', isShared: false });
      loadProductivityData();
    } catch (err) {
      alert('Failed to create diary entry');
    }
  };

  const handleToggleShareDiary = async (id: string, isShared: boolean) => {
    try {
      await updateDiaryEntryApi(id, { isShared });
      triggerToast(isShared ? 'Notes now shared with other faculty.' : 'Notes retracted to private.');
      loadProductivityData();
    } catch (err) {
      alert('Failed to toggle share state');
    }
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      await deleteDiaryEntryApi(id);
      triggerToast('Diary entry deleted.');
      loadProductivityData();
    } catch (err) {
      alert('Failed to delete diary entry');
    }
  };

  // ----------------------------------------------------
  // Assigned Tasks Handlers
  // ----------------------------------------------------
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigneeId) {
      alert('Please fill in title and select assignee');
      return;
    }
    try {
      await createAssignedTaskApi(newTask);
      triggerToast('Delegated task dispatched to recipient successfully!');
      setNewTask({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' });
      loadProductivityData();
    } catch (err) {
      alert('Failed to dispatch task');
    }
  };

  const handleUpdateTaskStatusLocal = async (id: string, status: string) => {
    try {
      const feedback = taskFeedback[id] || '';
      await updateAssignedTaskApi(id, { status, feedback });
      triggerToast(`Task status updated: ${status}`);
      loadProductivityData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleEscalateTaskLocal = async (id: string) => {
    try {
      await escalateAssignedTaskApi(id);
      triggerToast('Task escalated. Operations alert raised.');
      loadProductivityData();
    } catch (err) {
      alert('Failed to escalate task');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      
      {/* Head Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-4 dark:border-zinc-800 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Teacher Productivity Suite</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Manage personal tasks, journals, timelines, and delegated responsibilities.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveSubTab('todos')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'todos' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            To-Do Checklists
          </button>
          <button 
            onClick={() => setActiveSubTab('planner')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'planner' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Daily Planner
          </button>
          <button 
            onClick={() => setActiveSubTab('diary')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'diary' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Personal Diary
          </button>
          <button 
            onClick={() => setActiveSubTab('tasks')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'tasks' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Assigned Tasks
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          Sub-Tab 1: To-Do Checklists
          ---------------------------------------------------- */}
      {activeSubTab === 'todos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Todo Form */}
          <div className="lg:col-span-1 rounded-2xl bg-zinc-50/50 p-5 border border-zinc-150/40 dark:bg-zinc-950/20 dark:border-zinc-800/80 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Catalogue Planner Checklist</h4>
            <form onSubmit={handleCreateTodo} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Grade 10 Math worksheet grading"
                  value={newTodo.title}
                  onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Description</label>
                <textarea 
                  placeholder="Additional notes/criteria..."
                  value={newTodo.description}
                  onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Category</label>
                  <select 
                    value={newTodo.category}
                    onChange={e => setNewTodo({ ...newTodo, category: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100"
                  >
                    <option value="GENERAL">General</option>
                    <option value="GRADING">Grading</option>
                    <option value="LESSON_PLAN">Lesson Plan</option>
                    <option value="MEETING">Meeting</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Priority</label>
                  <select 
                    value={newTodo.priority}
                    onChange={e => setNewTodo({ ...newTodo, priority: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 font-bold"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Due Date</label>
                <input 
                  type="date"
                  value={newTodo.dueDate}
                  onChange={e => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-bold"
                />
              </div>
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task Item</span>
              </button>
            </form>
          </div>

          {/* Todo List View */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Your Personal To-Do Roster</h4>
            {todos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 text-zinc-400">
                <ClipboardList className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">All Completed!</h5>
                <p className="text-[10px] text-zinc-400">You have no pending checklist action items.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                {todos.map((todo) => {
                  const isUrgent = todo.priority === 'URGENT';
                  const isHigh = todo.priority === 'HIGH';

                  return (
                    <div 
                      key={todo.id} 
                      className={`rounded-2xl border p-4 flex items-start gap-4 transition-all hover-lift ${
                        todo.completed 
                          ? 'bg-zinc-50/40 border-zinc-100 opacity-60 dark:bg-zinc-950/10 dark:border-zinc-900' 
                          : 'bg-card border-zinc-150/60 dark:border-zinc-800 shadow-sm'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={todo.completed}
                        onChange={(e) => handleToggleTodo(todo.id, e.target.checked)}
                        className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500 h-4.5 w-4.5 cursor-pointer mt-0.5"
                      />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className={`text-xs font-black text-foreground truncate ${todo.completed ? 'line-through text-zinc-450' : ''}`}>{todo.title}</h5>
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase ${
                            todo.completed ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800' :
                            todo.category === 'GRADING' ? 'bg-indigo-500/10 text-indigo-600' :
                            todo.category === 'LESSON_PLAN' ? 'bg-amber-500/10 text-amber-600' :
                            todo.category === 'MEETING' ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {todo.category}
                          </span>
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase ${
                            todo.completed ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800' :
                            isUrgent ? 'bg-rose-500/10 text-rose-600 animate-pulse border border-rose-500/20' :
                            isHigh ? 'bg-orange-500/10 text-orange-600' : 'bg-zinc-100 text-zinc-550 dark:bg-zinc-800'
                          }`}>
                            {todo.priority}
                          </span>
                        </div>
                        {todo.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-semibold">{todo.description}</p>
                        )}
                        {todo.dueDate && (
                          <div className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Deadline: {new Date(todo.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 transition shrink-0 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          Sub-Tab 2: Daily Planner Agenda
          ---------------------------------------------------- */}
      {activeSubTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Add Event Form */}
          <div className="lg:col-span-1 rounded-2xl bg-zinc-50/50 p-5 border border-zinc-150/40 dark:bg-zinc-950/20 dark:border-zinc-800/80 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Schedule Planner Event</h4>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Event Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Substitute chemistry lecture"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Description</label>
                <textarea 
                  placeholder="Venue, reference points, etc..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 h-16"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Activity Date</label>
                <input 
                  type="date"
                  required
                  value={newEvent.activityDate}
                  onChange={e => setNewEvent({ ...newEvent, activityDate: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Start Time</label>
                  <input 
                    type="time"
                    required
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">End Time</label>
                  <input 
                    type="time"
                    required
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Category Type</label>
                <select 
                  value={newEvent.category}
                  onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100"
                >
                  <option value="ACTIVITY">Activity</option>
                  <option value="SCHEDULE">Class Schedule</option>
                  <option value="MEETING">Meeting</option>
                  <option value="ACADEMIC_WORK">Academic Work</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-sm transition"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Event</span>
              </button>
            </form>
          </div>

          {/* Agenda List View */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Scheduled Daily Agenda</h4>
            {plannerEvents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 text-zinc-400">
                <Calendar className="h-10 w-10 mx-auto text-zinc-300 mb-2 animate-pulse" />
                <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Agenda Clear</h5>
                <p className="text-[10px] text-zinc-400">No scheduled activities for this session period.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                {plannerEvents.map((evt) => (
                  <div key={evt.id} className="rounded-2xl border border-zinc-150/60 bg-card p-4 flex items-center justify-between gap-4 shadow-sm hover-lift">
                    <div className="flex gap-4 items-start">
                      <div className="rounded-xl bg-sky-600/10 border border-sky-600/20 text-sky-600 p-2.5 shrink-0 flex flex-col justify-center items-center font-black h-14 w-14">
                        <span className="text-[10px] uppercase">{new Date(evt.activityDate).toLocaleDateString([], { month: 'short' })}</span>
                        <span className="text-sm">{new Date(evt.activityDate).getDate()}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs font-black text-foreground leading-snug">{evt.title}</h5>
                          <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase ${
                            evt.category === 'MEETING' ? 'bg-purple-500/10 text-purple-600' :
                            evt.category === 'SCHEDULE' ? 'bg-indigo-500/10 text-indigo-600' :
                            evt.category === 'ACADEMIC_WORK' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {evt.category}
                          </span>
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-semibold">{evt.description}</p>
                        )}
                        <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 pt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{evt.startTime} - {evt.endTime}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="text-red-500 hover:text-red-700 transition shrink-0 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          Sub-Tab 3: Personal Diary Notes
          ---------------------------------------------------- */}
      {activeSubTab === 'diary' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          {/* Add Diary Note Form */}
          <div className="xl:col-span-1 rounded-2xl bg-zinc-50/50 p-5 border border-zinc-150/40 dark:bg-zinc-950/20 dark:border-zinc-800/80 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Record Teaching Reflection</h4>
            <form onSubmit={handleCreateDiary} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Note Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Student remarks regarding calculus understanding"
                  value={newDiary.title}
                  onChange={e => setNewDiary({ ...newDiary, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Content / Teaching Observation</label>
                <textarea 
                  required
                  placeholder="Write your private notes or observations here..."
                  value={newDiary.content}
                  onChange={e => setNewDiary({ ...newDiary, content: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 h-28 leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Observation Class</label>
                  <select 
                    value={newDiary.category}
                    onChange={e => setNewDiary({ ...newDiary, category: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100"
                  >
                    <option value="PERSONAL">Personal note</option>
                    <option value="PRIVATE_NOTE">Private reflection</option>
                    <option value="OBSERVATION">Student observation</option>
                    <option value="REMARK">Student remark</option>
                    <option value="ACADEMIC">Academic note</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="shareCheck"
                    checked={newDiary.isShared}
                    onChange={e => setNewDiary({ ...newDiary, isShared: e.target.checked })}
                    className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="shareCheck" className="text-[10px] font-bold text-zinc-500 uppercase cursor-pointer">Share with School</label>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-sm transition"
              >
                <BookOpen className="h-4 w-4" />
                <span>Catalogue Entry</span>
              </button>
            </form>
          </div>

          {/* Diary Sheets View */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Private Notes */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Your Private Diary Pages</h4>
              {diaryEntries.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 text-zinc-400">
                  <FileText className="h-8 w-8 mx-auto text-zinc-300 mb-1.5" />
                  <p className="text-[10px] text-zinc-400">Your private pages are empty.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {diaryEntries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-zinc-150/60 bg-card p-4 shadow-sm space-y-3 relative hover-lift">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[8.5px] font-black uppercase text-sky-600">
                            {entry.category}
                          </span>
                          <h5 className="text-xs font-black text-foreground pt-1 leading-snug">{entry.title}</h5>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleToggleShareDiary(entry.id, !entry.isShared)}
                            className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase border transition ${
                              entry.isShared 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-850 dark:border-zinc-800'
                            }`}
                          >
                            {entry.isShared ? 'Shared' : 'Share'}
                          </button>
                          <button 
                            onClick={() => handleDeleteDiary(entry.id)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-semibold whitespace-pre-wrap">{entry.content}</p>
                      <div className="text-[9px] font-bold text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                        Recorded: {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Faculty Insights */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Shared Faculty Feed</h4>
              {sharedEntries.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 text-zinc-400">
                  <MessageSquare className="h-8 w-8 mx-auto text-zinc-300 mb-1.5" />
                  <p className="text-[10px] text-zinc-400">No shared faculty feed entries currently online.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {sharedEntries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.01] p-4 shadow-sm space-y-3 hover-lift">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[8.5px] font-black uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {entry.category}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-bold">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-foreground pt-1 leading-snug">{entry.title}</h5>
                      </div>
                      <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-semibold whitespace-pre-wrap">{entry.content}</p>
                      
                      <div className="flex items-center gap-2 pt-2.5 border-t border-emerald-500/10 text-[9px] font-bold text-zinc-450 dark:text-gray-400">
                        <div className="h-5 w-5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-full flex items-center justify-center text-white shrink-0">
                          {entry.user?.staffProfile?.firstName?.slice(0, 1) || 'F'}
                        </div>
                        <span>Author: {entry.user?.staffProfile?.firstName} {entry.user?.staffProfile?.lastName} ({entry.user?.staffProfile?.designation})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          Sub-Tab 4: Assigned Tasks & Workflows
          ---------------------------------------------------- */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Dispatch Task Form (Principals / Admins / HODs) */}
          <div className="xl:col-span-1 rounded-2xl bg-zinc-50/50 p-5 border border-zinc-150/40 dark:bg-zinc-950/20 dark:border-zinc-800/80 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Delegate Professional Task</h4>
            {['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'INSTITUTE_ADMIN'].includes(currentRole) ? (
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Assignee Employee</label>
                  <select 
                    value={newTask.assigneeId}
                    onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 font-semibold"
                  >
                    <option value="">Select Staff recipient</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.userId || s.id}>{s.firstName} {s.lastName} ({s.designation})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Task Objective</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Schedule syllabus review meeting"
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Description / Details</label>
                  <textarea 
                    placeholder="Provide specific guidelines, deadlines or criteria..."
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 font-semibold">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400">Due Date</label>
                    <input 
                      type="date"
                      value={newTask.dueDate}
                      onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-850 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-bold"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-sm transition"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Dispatch Task</span>
                </button>
              </form>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  Only the **Principal, Vice Principal, or Admin** hold administrative clearance to dispatch delegated statutory tasks to staff members.
                </p>
              </div>
            )}
          </div>

          {/* Tasks List and Status Meters */}
          <div className="xl:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Delegation Task Roster</h4>
            {assignedTasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 text-zinc-400">
                <ClipboardList className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Roster Empty</h5>
                <p className="text-[10px] text-zinc-400">No delegated tasks are currently mapped in this institution.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {assignedTasks.map((task) => {
                  const isAssigner = task.assignerId === user.id;
                  const isAssignee = task.assigneeId === user.id || (task.assignee?.email === user.email);

                  return (
                    <div 
                      key={task.id} 
                      className={`rounded-2xl border p-4 bg-card shadow-sm space-y-3 relative hover-lift transition ${
                        task.status === 'COMPLETED' ? 'border-emerald-500/20 bg-emerald-500/[0.005]' : 
                        task.status === 'ESCALATED' ? 'border-rose-500/20 bg-rose-500/[0.005]' : 
                        task.status === 'ACCEPTED' ? 'border-sky-500/20' : 'border-zinc-150/60 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${
                              task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                              task.status === 'ACCEPTED' ? 'bg-sky-500/10 text-sky-600 animate-pulse' :
                              task.status === 'ESCALATED' ? 'bg-rose-500/10 text-rose-600 animate-pulse border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-600'
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-[9px] font-black bg-zinc-100 text-zinc-550 dark:bg-zinc-850 px-2 py-0.5 rounded">
                              Priority: {task.priority}
                            </span>
                          </div>
                          <h5 className="text-xs font-black text-foreground pt-1 leading-snug">{task.title}</h5>
                        </div>

                        {/* Action buttons based on Role mapping */}
                        {isAssignee && task.status === 'PENDING' && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleUpdateTaskStatusLocal(task.id, 'ACCEPTED')}
                              className="rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[9px] px-2 py-1 shadow-sm transition"
                            >
                              Accept Task
                            </button>
                            <button 
                              onClick={() => handleUpdateTaskStatusLocal(task.id, 'REJECTED')}
                              className="rounded border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-[9px] px-2 py-1 transition dark:bg-zinc-800 dark:border-zinc-750 dark:text-zinc-200"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {isAssignee && ['ACCEPTED', 'IN_PROGRESS'].includes(task.status) && (
                          <div className="flex gap-1.5 items-center">
                            <input 
                              type="text" 
                              placeholder="Feedback / Results..."
                              value={taskFeedback[task.id] || ''}
                              onChange={e => setTaskFeedback({ ...taskFeedback, [task.id]: e.target.value })}
                              className="rounded border border-zinc-200 px-2 py-1 text-[9px] outline-none w-32 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150"
                            />
                            <button 
                              onClick={() => handleUpdateTaskStatusLocal(task.id, 'COMPLETED')}
                              className="rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] px-2.5 py-1.5 shadow-sm transition flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>Complete</span>
                            </button>
                          </div>
                        )}

                        {isAssigner && task.status === 'PENDING' && (
                          <button 
                            onClick={() => handleEscalateTaskLocal(task.id)}
                            className="rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-[9px] px-2 py-1 border border-rose-500/20 transition flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span>Escalate Priority</span>
                          </button>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-semibold">{task.description}</p>
                      )}

                      {task.feedback && (
                        <div className="bg-zinc-50 border border-zinc-100 p-2.5 rounded-xl text-[10px] font-medium leading-relaxed text-zinc-650 dark:bg-zinc-950/20 dark:border-zinc-800/80">
                          <span className="font-extrabold text-foreground block mb-0.5">Assignee Feedback/Response:</span>
                          {task.feedback}
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-4 text-[9px] font-bold text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div>
                          From: <span className="text-zinc-600 dark:text-zinc-350">{task.assigner?.staffProfile ? `${task.assigner.staffProfile.firstName} ${task.assigner.staffProfile.lastName}` : 'Admin'}</span>
                        </div>
                        <div>
                          To: <span className="text-zinc-600 dark:text-zinc-350">{task.assignee?.staffProfile ? `${task.assignee.staffProfile.firstName} ${task.assignee.staffProfile.lastName}` : 'Staff'}</span>
                        </div>
                        {task.dueDate && (
                          <span className="text-rose-500 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
