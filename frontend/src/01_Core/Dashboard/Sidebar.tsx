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
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (val: boolean) => void;
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
  mobileSidebarOpen,
  setMobileSidebarOpen,
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
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300
        w-64 md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
      `}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover-lift">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-foreground">AURXON</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">ERP Lite</span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setMobileSidebarOpen(false);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Role Switcher Area */}
      <div className="p-4 border-b border-border bg-muted/30">
        {sidebarCollapsed ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
              {currentRole.slice(0, 2)}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Access Role
            </label>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary glass"
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
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setMobileSidebarOpen(false);
              }}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform duration-200" />
              {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
                <span className="truncate group-hover:translate-x-1 transition-transform duration-200">{cat.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & Control Actions */}
      <div className="p-4 border-t border-border bg-muted/30 space-y-3">
        {/* Notifications Shortcut */}
        <button
          onClick={() => {
            setNotificationsOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4 shrink-0" />
          {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 overflow-hidden rounded-xl border border-border p-2 bg-card glass">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
            {user?.profileName ? user.profileName.slice(0, 2).toUpperCase() : 'UR'}
          </div>
          {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {user?.profileName || 'Active User'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email || 'user@aurxon.com'}
              </span>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            handleLogout();
            setMobileSidebarOpen(false);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span>Secure Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
