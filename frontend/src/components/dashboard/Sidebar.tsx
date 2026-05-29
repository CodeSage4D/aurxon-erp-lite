'use client';

import React from 'react';
import { 
  LayoutDashboard, Users, CalendarCheck, CreditCard, GraduationCap, Briefcase, Megaphone, LogOut,
  Moon, Sun, ShieldCheck, BookOpen, Book, Award, MessageSquare, BarChart2,
  Settings, Bell, Menu, Sparkles, ShieldAlert, ChevronLeft, ChevronRight
} from 'lucide-react';

const ROLES_LIST = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { value: 'ACADEMIC_DIRECTOR', label: 'Academic Director' },
  { value: 'REGISTRAR', label: 'Registrar' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'HR_MANAGER', label: 'HR Manager' },
  { value: 'EXAM_CONTROLLER', label: 'Exam Controller' },
  { value: 'ATTENDANCE_OFFICER', label: 'Attendance Officer' },
  { value: 'COMMUNICATION_HEAD', label: 'Comms Head' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'COACHING_DIRECTOR', label: 'Coaching Director' },
  { value: 'INSTITUTE_ADMIN', label: 'Institute Admin' }
];

const SIDEBAR_CATEGORIES = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
  { id: 'academic', label: 'Academic Desk', icon: BookOpen, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'COACHING_DIRECTOR', 'REGISTRAR', 'EXAM_CONTROLLER', 'INSTITUTE_ADMIN'] },
  { id: 'students', label: 'Student Desk', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'REGISTRAR', 'COACHING_DIRECTOR', 'INSTITUTE_ADMIN'] },
  { id: 'exams', label: 'Exams & Grades', icon: Award, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'EXAM_CONTROLLER', 'COACHING_DIRECTOR', 'INSTITUTE_ADMIN'] },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'ATTENDANCE_OFFICER', 'INSTITUTE_ADMIN'] },
  { id: 'fees', label: 'Fees & Finance', icon: CreditCard, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'INSTITUTE_ADMIN'] },
  { id: 'comms', label: 'Comms Hub', icon: MessageSquare, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'COMMUNICATION_HEAD', 'TEACHER', 'STUDENT', 'PARENT', 'INSTITUTE_ADMIN'] },
  { id: 'library', label: 'Library Desk', icon: Book, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'LIBRARIAN', 'TEACHER', 'STUDENT', 'PARENT', 'INSTITUTE_ADMIN'] },
  { id: 'gate', label: 'Visitor Gate Desk', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'INSTITUTE_ADMIN', 'STAFF'] },
  { id: 'inventory', label: 'Inventory Desk', icon: BarChart2, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'STAFF'] },
  { id: 'hr', label: 'HR System', icon: Briefcase, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'ACCOUNTANT', 'INSTITUTE_ADMIN', 'TEACHER', 'LIBRARIAN'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'INSTITUTE_ADMIN'] }
];

interface SidebarProps {
  user: any;
  currentRole: string;
  onRoleChange: (role: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  notifications: any[];
  setNotificationsOpen: (val: boolean) => void;
  handleLogout: () => void;
}

export default function Sidebar({
  user,
  currentRole,
  onRoleChange,
  activeCategory,
  setActiveCategory,
  sidebarCollapsed,
  setSidebarCollapsed,
  notifications,
  setNotificationsOpen,
  handleLogout
}: SidebarProps) {
  const unreadCount = notifications.length;

  const filteredCategories = SIDEBAR_CATEGORIES.filter(cat => {
    if (cat.roles.includes('*')) return true;
    return cat.roles.includes(currentRole);
  });

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col border-r border-zinc-200/80 bg-white transition-all duration-300 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:backdrop-blur-md ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/10">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">AURXON</span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">ERP Lite</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Role Switcher Area */}
      <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        {sidebarCollapsed ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {currentRole.slice(0, 2)}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Active Access Role
            </label>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-800 outline-none transition focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-indigo-500"
            >
              {ROLES_LIST.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{cat.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & Control Actions */}
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
        {/* Notifications Shortcut */}
        <button
          onClick={() => setNotificationsOpen(true)}
          className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-white"
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            {user?.profileName ? user.profileName.slice(0, 2).toUpperCase() : 'UR'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {user?.profileName || 'Active User'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email || 'user@aurxon.com'}
              </span>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
