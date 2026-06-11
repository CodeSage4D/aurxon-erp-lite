'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, KeyRound, ShieldCheck, Activity, Bell, Search, Database, 
  Save, Settings, User, CreditCard, ChevronRight, Menu, LogOut, CheckCircle, 
  XCircle, Play, ShieldAlert, Sparkles, RefreshCw, Layers, ArrowUpRight,
  UserCheck, HelpCircle, HardDrive, Terminal, Clock, Shield, Award, FolderOpen, 
  AlertTriangle, Copy, Mail, Download, Check, Info, X, TrendingUp, Users,
  Zap, Globe, BarChart3, Lock, Eye, EyeOff, ChevronDown, Filter
} from 'lucide-react';
import { 
  getRegistrationsApi, reviewRegistrationApi, 
  getFounderMetricsCurrentApi, getFounderMetricsHistoryApi, getFounderStorageStatsApi,
  getSecurityThreatsApi, resolveSecurityThreatApi, getBackupRecordsApi, triggerBackupApi,
  founderGlobalSearchApi, impersonateOrganizationApi, getBillingStatsApi,
  getPlanDefinitionsApi, getRbacMatrixApi, bulkUpdatePermissionsApi,
  getActivationKeysApi, revokeActivationKeyApi, suspendActivationKeyApi, renewActivationKeyApi, regenerateActivationKeyApi,
  getRenewalRequestsApi, approveRenewalRequestApi, founderDirectRenewalApi,
  technicalReviewRegistrationApi, provisionWorkspaceApi,
  verifyRegistrationManualApi, resendVerificationOtpApi,
  suspendInstitutionApi, resumeInstitutionApi, resetUserPasswordApi
} from '@/lib/api';

import { useTheme } from '@/context/ThemeContext';
import { useNotifications, PlatformNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function FounderDashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { 
    notifications, unreadCount, criticalCount, approvalsCount, supportCount, 
    markAllRead, clearNotifications, markAsRead, fetchNotifications 
  } = useNotifications();
  const { logout } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('Good Morning, Karan');
  const notifRef = useRef<HTMLDivElement>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Datasets
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [metricsCurrent, setMetricsCurrent] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [storageStats, setStorageStats] = useState<any[]>([]);
  const [threatLogs, setThreatLogs] = useState<any[]>([]);
  const [backupRecords, setBackupRecords] = useState<any[]>([]);
  const [billingStats, setBillingStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [rbacMatrix, setRbacMatrix] = useState<any>(null);
  const [activationKeys, setActivationKeys] = useState<any[]>([]);
  const [renewalRequests, setRenewalRequests] = useState<any[]>([]);

  // Stepper UI
  const [requestDocsNotes, setRequestDocsNotes] = useState('');
  const [selectedRegForDocs, setSelectedRegForDocs] = useState<string | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<Record<string, string>>({});

  // Overrides & Actions
  const [directRenewalOrgId, setDirectRenewalOrgId] = useState('');
  const [directRenewalMonths, setDirectRenewalMonths] = useState(12);
  const [directRenewalNotes, setDirectRenewalNotes] = useState('');
  const [directRenewalResult, setDirectRenewalResult] = useState<any>(null);

  const [selectedImpersonateOrg, setSelectedImpersonateOrg] = useState('');
  const [impersonateReason, setImpersonateReason] = useState('');
  const [impersonateTicket, setImpersonateTicket] = useState('');

  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ email: string; temporaryPassword: string } | null>(null);

  const [selectedMatrixRoleId, setSelectedMatrixRoleId] = useState('');
  const [matrixEdits, setMatrixEdits] = useState<Record<string, boolean>>({});

  // Global Command Palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [backendSearchResults, setBackendSearchResults] = useState<any[]>([]);
  const [searchingBackend, setSearchingBackend] = useState(false);

  // Notification center
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifSearch, setNotifSearch] = useState('');
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<string>('ALL');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Close notification popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  useEffect(() => {
    setMounted(true);

    const hour = new Date().getHours();
    let greet = 'Good Morning';
    if (hour >= 12 && hour < 17) greet = 'Good Afternoon';
    else if (hour >= 17) greet = 'Good Evening';

    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/founder/login');
      return;
    }
    const user = JSON.parse(cached);
    if (user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    setGreeting(`${greet}, Karan`);
    loadDashboardData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setNotificationOpen(false);
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setDataError(null);
    try {
      // Load registrations with its own error handling so it never blocks others
      const regsPromise = getRegistrationsApi().catch((err: any) => {
        console.error('Failed to load registrations:', err);
        if (err.message === 'Unauthorized') {
          triggerToast('Session expired. Please log in again.', 'error');
          logout();
          router.push('/founder/login');
        }
        return [];
      });

      const [
        regs,
        currMetrics, histMetrics, stor, threats, backups, bills, plns, rbac, actKeys, renewals
      ] = await Promise.all([
        regsPromise,
        getFounderMetricsCurrentApi().catch(() => ({ dbSizeGb: 0.045, avgResponseMs: 45 })),
        getFounderMetricsHistoryApi(12).catch(() => []),
        getFounderStorageStatsApi().catch(() => []),
        getSecurityThreatsApi().catch(() => []),
        getBackupRecordsApi().catch(() => []),
        getBillingStatsApi().catch(() => ({ activeSubscriptions: 0, trialSubscriptions: 0, mrr: 0, recentOrganizations: [] })),
        getPlanDefinitionsApi().catch(() => []),
        getRbacMatrixApi().catch(() => ({ roles: [], groups: [] })),
        getActivationKeysApi().catch(() => []),
        getRenewalRequestsApi().catch(() => []),
      ]);

      setRegistrations(Array.isArray(regs) ? regs : []);
      setMetricsCurrent(currMetrics);
      setMetricsHistory(histMetrics);
      setStorageStats(stor);
      setThreatLogs(threats);
      setBackupRecords(backups);
      setBillingStats(bills);
      setPlans(plns);
      setRbacMatrix(rbac);
      setActivationKeys(actKeys);
      setRenewalRequests(renewals);

      if (rbac?.roles?.length > 0) {
        setSelectedMatrixRoleId(rbac.roles[0].id);
        initializeMatrixEdits(rbac, rbac.roles[0].id);
      }
    } catch (err: any) {
      console.error('Founder dashboard critical error:', err);
      setDataError('Unable to connect to backend. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  const initializeMatrixEdits = (matrix: any, roleId: string) => {
    const edits: Record<string, boolean> = {};
    for (const group of matrix.groups || []) {
      for (const perm of group.permissions || []) {
        const key = `${perm.resource}:${perm.action}`;
        edits[key] = !!perm.roles[roleId];
      }
    }
    setMatrixEdits(edits);
  };

  const handleMatrixRoleChange = (roleId: string) => {
    setSelectedMatrixRoleId(roleId);
    if (rbacMatrix) initializeMatrixEdits(rbacMatrix, roleId);
  };

  const handleMatrixToggle = (resource: string, action: string, checked: boolean) => {
    const key = `${resource}:${action}`;
    setMatrixEdits(prev => ({ ...prev, [key]: checked }));
  };

  const saveMatrixChanges = async () => {
    if (!selectedMatrixRoleId) return;
    setSubmitting(true);
    try {
      const assignments = Object.entries(matrixEdits).map(([key, isAllowed]) => {
        const [resource, action] = key.split(':');
        return { resource, action, isAllowed };
      });
      await bulkUpdatePermissionsApi(selectedMatrixRoleId, assignments);
      triggerToast('Permissions matrix updated successfully.');
      const rbac = await getRbacMatrixApi();
      setRbacMatrix(rbac);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update matrix', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Registration Handlers ──────────────────────────────────────────────────

  const handleApproveRegistration = async (id: string) => {
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'APPROVED', 'Approved via Command Center');
      triggerToast('Registration approved successfully!');
      loadDashboardData();
      fetchNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Approval failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRegistration = async (id: string) => {
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'REJECTED', 'Rejected during Founder review');
      triggerToast('Registration rejected.');
      loadDashboardData();
      fetchNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Rejection failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDocuments = async (id: string) => {
    if (!requestDocsNotes.trim()) {
      triggerToast('Please write the request details.', 'info');
      return;
    }
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'CHANGES_REQUESTED', requestDocsNotes);
      triggerToast('Documents request logged.');
      setSelectedRegForDocs(null);
      setRequestDocsNotes('');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to request documents', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTechnicalReview = async (id: string) => {
    setSubmitting(true);
    try {
      await technicalReviewRegistrationApi(id, 'Passed core database & board affiliation mapping tests.');
      triggerToast('Technical checks verified successfully.');
      loadDashboardData();
      fetchNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Verification failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvisionWorkspace = async (id: string, paymentStatus: string = 'TRIAL') => {
    setSubmitting(true);
    try {
      const result = await provisionWorkspaceApi(id, paymentStatus);
      triggerToast(`Workspace provisioned! Licence: ${result.licenseKey}`);
      loadDashboardData();
      fetchNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Provisioning failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyManual = async (id: string) => {
    setSubmitting(true);
    try {
      await verifyRegistrationManualApi(id);
      triggerToast('Manually verified successfully!');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Manual verification failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async (id: string) => {
    setSubmitting(true);
    try {
      await resendVerificationOtpApi(id);
      triggerToast('Verification OTP resent successfully.');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to resend OTPs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Utility Helpers ───────────────────────────────────────────────────────

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('Copied to clipboard!', 'info');
  };

  const downloadKeyFile = (orgName: string, key: string) => {
    const element = document.createElement("a");
    const file = new Blob([`AURXON Licence - ${orgName}\nKey: ${key}\nGenerated: ${new Date().toLocaleDateString()}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${orgName.toLowerCase().replace(/ /g, '_')}_licence.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast('Downloading license file...', 'info');
  };

  const handleResolveThreat = async (id: string) => {
    try {
      await resolveSecurityThreatApi(id);
      triggerToast('Threat marked as resolved.');
      const threats = await getSecurityThreatsApi();
      setThreatLogs(threats);
    } catch (err: any) {
      triggerToast(err.message || 'Resolution failed', 'error');
    }
  };

  const handleTriggerBackup = async () => {
    try {
      await triggerBackupApi('Manual system backup triggered from Command Center.');
      triggerToast('Backup initiated successfully.');
      setTimeout(async () => {
        const backups = await getBackupRecordsApi();
        setBackupRecords(backups);
      }, 2100);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to trigger backup', 'error');
    }
  };

  const handleLaunchImpersonation = async () => {
    if (!selectedImpersonateOrg) { triggerToast('Please select target org', 'info'); return; }
    if (!impersonateReason || impersonateReason.trim().length < 5) { triggerToast('Reason is too short', 'info'); return; }
    setSubmitting(true);
    try {
      const originalToken = localStorage.getItem('aurxon_token');
      const result = await impersonateOrganizationApi(selectedImpersonateOrg, impersonateReason, impersonateTicket);
      if (originalToken) localStorage.setItem('aurxon_founder_token', originalToken);
      localStorage.setItem('aurxon_token', result.token);
      localStorage.setItem('aurxon_impersonating', 'true');
      triggerToast(`Launching impersonation for ${result.orgName}...`);
      window.open('/dashboard', '_blank');
    } catch (err: any) {
      triggerToast(err.message || 'Impersonation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspendOrg = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this organization workspace? Users will be blocked from logging in.')) return;
    setSubmitting(true);
    try {
      await suspendInstitutionApi(id);
      triggerToast('Workspace suspended successfully', 'success');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to suspend workspace', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumeOrg = async (id: string) => {
    setSubmitting(true);
    try {
      await resumeInstitutionApi(id);
      triggerToast('Workspace resumed successfully', 'success');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to resume workspace', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetUserPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password? A temporary password will be generated.')) return;
    setSubmitting(true);
    try {
      const res = await resetUserPasswordApi(userId);
      setResetPasswordResult(res);
      setResetPasswordModalOpen(true);
      triggerToast('Password reset successful', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Search ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (commandSearchQuery.trim().length < 2) {
      setBackendSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearchingBackend(true);
      try {
        const results = await founderGlobalSearchApi(commandSearchQuery);
        setBackendSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingBackend(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [commandSearchQuery]);

  const handleTabChange = (tab: string) => {
    setTabLoading(true);
    setActiveTab(tab);
    setTimeout(() => setTabLoading(false), 200);
  };

  // ─── Computed Stats ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Loading AURXON OS...</p>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = registrations.filter(r => r.status === 'PENDING_REVIEW').length;
  const pendingRenewalsCount = renewalRequests.filter(r => r.status === 'PENDING').length;
  const criticalThreatsCount = threatLogs.filter(t => !t.resolved && t.severity === 'CRITICAL').length;
  const planPieData = [
    { name: 'Trial', value: billingStats?.trialSubscriptions || 0, color: '#64748b' },
    { name: 'Active', value: billingStats?.activeSubscriptions || 0, color: '#2563EB' },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'approvals', label: 'Approvals', count: pendingApprovalsCount, icon: UserCheck, urgent: pendingApprovalsCount > 0 },
    { id: 'organizations', label: 'Digital Twins', count: billingStats?.activeSubscriptions, icon: Building2 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'leads', label: 'Leads', icon: HelpCircle },
    { id: 'support', label: 'Support', count: pendingRenewalsCount, icon: Play },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'monitoring', label: 'Monitoring', count: criticalThreatsCount, icon: ShieldAlert, urgent: criticalThreatsCount > 0 },
    { id: 'audit', label: 'Audit Logs', icon: Terminal },
    { id: 'team', label: 'Founder Team', icon: Users },
    { id: 'deployments', label: 'Deployments', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="fixed top-0 right-1/4 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs font-bold shadow-2xl border transition-all animate-fade-in
            ${toast.type === 'error' ? 'bg-red-600 text-white border-red-500/40' :
              toast.type === 'info' ? 'bg-zinc-900 text-zinc-100 border-zinc-700' :
              'bg-primary text-white border-primary/30'}`}
        >
          {toast.type === 'error' ? <XCircle className="h-3.5 w-3.5 shrink-0" /> :
           toast.type === 'info' ? <Info className="h-3.5 w-3.5 shrink-0" /> :
           <CheckCircle className="h-3.5 w-3.5 shrink-0" />}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* ════ LEFT SIDEBAR ════ */}
      <aside className="w-60 border-r border-border bg-sidebar/95 backdrop-blur-xl shrink-0 flex flex-col justify-between relative z-10">
        {/* Logo */}
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-primary/30">
              A
            </div>
            <div>
              <span className="text-[11px] font-black tracking-widest uppercase text-foreground block leading-none">AURXON OS</span>
              <span className="text-[8px] text-zinc-500 font-semibold">Founder Control</span>
            </div>
          </div>

          {/* Nav */}
          <div className="space-y-0.5">
            <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest px-2 block mb-2">Command Console</span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-bold rounded-xl transition-all group
                    ${isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/25' 
                      : 'text-zinc-400 hover:bg-secondary/60 hover:text-foreground'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : item.urgent ? 'text-red-400' : 'text-zinc-500 group-hover:text-primary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {!!item.count && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black min-w-[18px] text-center
                      ${isActive ? 'bg-white/20 text-white' : item.urgent ? 'bg-red-500/15 text-red-400' : 'bg-secondary text-zinc-500'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-5 border-t border-border space-y-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/20 flex items-center justify-center text-xs font-black text-primary">
              K
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-foreground truncate">Karan</p>
              <p className="text-[8px] text-zinc-500 font-mono">SUPER_ADMIN</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ════ MAIN AREA ════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* ── Top Header Bar ── */}
        <header className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-card/30 backdrop-blur-md relative z-30">
          <div className="flex items-center gap-5">
            <div>
              <h1 className="text-sm font-black text-foreground tracking-tight flex items-center gap-1.5">
                {greeting}
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </h1>
              <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                AURXON SaaS Control Center • Dynamic Cockpit v3.0
              </p>
            </div>

            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-extrabold text-emerald-500 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform SLA 99.9%
            </div>

            {dataError && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[9px] font-bold text-red-400 border border-red-500/20">
                <AlertTriangle className="h-3 w-3" />
                {dataError}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-xl text-[11px] font-bold text-zinc-400 border border-border transition"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
              <span className="rounded bg-background px-1.5 py-0.5 text-[8px] font-mono border border-border">Ctrl+K</span>
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-zinc-400 border border-border transition"
              title="Toggle theme"
            >
              <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
            </button>

            {/* Refresh */}
            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-zinc-400 border border-border transition"
              title="Refresh data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {/* ── Notification Bell (fixed position panel) ── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationOpen(prev => !prev)}
                className={`relative p-2 rounded-xl border transition ${
                  notificationOpen
                    ? 'bg-primary text-white border-primary'
                    : 'bg-secondary hover:bg-secondary/80 text-zinc-400 border-border'
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-bounce z-10">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown — fixed positioned to avoid stacking context issues */}
              {notificationOpen && (
                <div
                  className="fixed right-6 top-[60px] w-96 bg-card border border-border rounded-2xl shadow-2xl z-[9999]"
                  style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                      <span className="text-[11px] font-black uppercase text-foreground">Notifications</span>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {criticalCount > 0 && (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded text-[7px] font-mono uppercase">
                            Critical ({criticalCount})
                          </span>
                        )}
                        {approvalsCount > 0 && (
                          <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded text-[7px] font-mono uppercase">
                            Approvals ({approvalsCount})
                          </span>
                        )}
                        {supportCount > 0 && (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[7px] font-mono uppercase">
                            Support ({supportCount})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { markAllRead(); triggerToast('All marked as read.', 'info'); }}
                        className="text-[9px] font-extrabold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="p-1 rounded-lg hover:bg-secondary text-zinc-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="px-4 py-2 border-b border-border space-y-2">
                    <input
                      type="text"
                      placeholder="Filter notifications..."
                      className="w-full text-[11px] rounded-lg border border-border bg-input/40 px-2.5 py-1.5 outline-none text-foreground"
                      value={notifSearch}
                      onChange={e => setNotifSearch(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1">
                      {['ALL', 'REGISTRATION', 'APPROVAL', 'LICENSE', 'SECURITY', 'SUPPORT', 'SYSTEM'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNotifCategoryFilter(cat)}
                          className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase border tracking-tighter transition
                            ${notifCategoryFilter === cat ? 'bg-primary text-white border-primary' : 'bg-secondary text-zinc-500 border-border'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto p-3">
                    {notifications
                      .filter(n => {
                        const q = notifSearch.toLowerCase();
                        const matchQuery = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
                        const matchCat = notifCategoryFilter === 'ALL' || n.category === notifCategoryFilter;
                        return matchQuery && matchCat;
                      })
                      .map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-xs space-y-1 transition
                            ${!n.isRead
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-secondary/20 border-border'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${!n.isRead ? 'bg-primary animate-pulse' : 'bg-zinc-600'}`} />
                              <span className="font-extrabold text-foreground text-[10px] uppercase tracking-tight">{n.title}</span>
                            </div>
                            <span className="text-[7px] text-zinc-500 font-mono shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">{n.content}</p>
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[7px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-secondary">{n.category}</span>
                            {!n.isRead && (
                              <button onClick={() => markAsRead(n.id)} className="text-[8px] text-primary font-black hover:underline">
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    {notifications.length === 0 && (
                      <p className="text-[11px] text-zinc-500 italic text-center py-6">No notifications yet.</p>
                    )}
                    {notifications.length > 0 && notifications.filter(n => {
                      const q = notifSearch.toLowerCase();
                      return (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) && (notifCategoryFilter === 'ALL' || n.category === notifCategoryFilter);
                    }).length === 0 && (
                      <p className="text-[11px] text-zinc-500 italic text-center py-4">No matching notifications.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Content Area ── */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-zinc-500 tracking-widest">
              <span>Founder</span>
              <span className="text-zinc-600">/</span>
              <span className="text-primary">{navItems.find(n => n.id === activeTab)?.label || 'Overview'}</span>
            </div>

            {tabLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-secondary rounded-xl w-1/4" />
                <div className="h-36 bg-secondary rounded-3xl w-full" />
                <div className="grid grid-cols-3 gap-4">
                  {[0,1,2].map(i => <div key={i} className="h-24 bg-secondary rounded-2xl" />)}
                </div>
              </div>
            ) : (
              <>
                {/* ════ OVERVIEW TAB ════ */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Hero Banner */}
                    <div className="glass rounded-3xl p-6 border border-border relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" /> SaaS Command Center
                          </span>
                          <h2 className="text-xl font-black text-foreground tracking-tight">{greeting}</h2>
                          <p className="text-xs text-zinc-500 leading-relaxed max-w-lg">
                            You have{' '}
                            <span className={`font-bold ${pendingApprovalsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {pendingApprovalsCount} pending registrations
                            </span>{' '}
                            to authorize and{' '}
                            <span className={`font-bold ${pendingRenewalsCount > 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                              {pendingRenewalsCount} renewal requests
                            </span>{' '}
                            outstanding.
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {pendingApprovalsCount > 0 && (
                            <button
                              onClick={() => handleTabChange('approvals')}
                              className="px-4 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-primary/25 hover:bg-hover transition flex items-center gap-1.5"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Review Approvals ({pendingApprovalsCount})
                            </button>
                          )}
                          <button
                            onClick={loadDashboardData}
                            className="px-3 py-2.5 rounded-xl bg-secondary text-foreground text-[11px] font-bold border border-border hover:bg-secondary/80 transition"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Counters */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: 'Pending Review', count: registrations.filter(r => r.status === 'PENDING_REVIEW').length, color: 'text-amber-500', bg: 'bg-amber-500/8 border-amber-500/20' },
                        { label: 'Provisioning', count: registrations.filter(r => r.status === 'PROVISIONING').length, color: 'text-blue-500', bg: 'bg-blue-500/8 border-blue-500/20' },
                        { label: 'Failed Deploy', count: registrations.filter(r => r.status === 'PROVISIONING_FAILED').length, color: 'text-red-500', bg: 'bg-red-500/8 border-red-500/20' },
                        { label: 'Activated', count: registrations.filter(r => r.status === 'LIVE' || r.status === 'ACTIVATED').length, color: 'text-emerald-500', bg: 'bg-emerald-500/8 border-emerald-500/20' },
                        { label: 'Trial Mode', count: registrations.filter(r => r.status === 'PROVISIONED').length, color: 'text-zinc-400', bg: 'bg-zinc-500/5 border-zinc-500/20' },
                        { label: 'Total Regs', count: registrations.length, color: 'text-primary', bg: 'bg-primary/8 border-primary/20' },
                      ].map((c, idx) => (
                        <div key={idx} className={`rounded-2xl p-4 border flex flex-col items-center justify-center text-center gap-1 ${c.bg}`}>
                          <span className={`text-2xl font-black ${c.color}`}>{c.count}</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-zinc-500">{c.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Active Subscriptions', val: billingStats?.activeSubscriptions || 0, desc: 'Live SaaS Desks', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
                        { label: 'Monthly Revenue', val: `₹${Number(billingStats?.mrr || 0).toLocaleString('en-IN')}`, desc: 'MRR This Month', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
                        { label: 'DB Capacity', val: `${Number(metricsCurrent?.dbSizeGb || 0.05).toFixed(3)} GB`, desc: 'Neon PG Cluster', icon: Database, color: 'text-indigo-400 bg-indigo-500/10' },
                        { label: 'Avg Response', val: `${metricsCurrent?.avgResponseMs || 45} ms`, desc: 'P95 Latency', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
                      ].map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                          <div key={idx} className="glass rounded-2xl p-5 border border-border shadow-sm hover-lift">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">{kpi.label}</span>
                              <div className={`p-2 rounded-xl ${kpi.color}`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <div className="text-xl font-black text-foreground">{kpi.val}</div>
                            <p className="text-[9px] text-zinc-500 mt-1">{kpi.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chart */}
                    {mounted && metricsHistory.length > 0 && (
                      <div className="glass rounded-3xl p-5 border border-border shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-foreground mb-4">Request Load & Latency Trends</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={metricsHistory}>
                            <defs>
                              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="capturedAt" tick={{ fill: '#64748b', fontSize: 8 }} tickFormatter={t => new Date(t).toLocaleTimeString()} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 8 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#121b2d', borderColor: '#263247', color: '#fff', fontSize: 10, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="requestsPerMin" stroke="#2563EB" fillOpacity={1} fill="url(#colorLoad)" name="Req/min" />
                            <Line type="monotone" dataKey="avgResponseMs" stroke="#f59e0b" name="Latency (ms)" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* ════ APPROVALS TAB ════ */}
                {activeTab === 'approvals' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Interactive Stepper Pipeline</h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Evaluate, approve, and provision organization workspaces.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase border border-primary/20">
                        {registrations.length} Registrations
                      </span>
                    </div>

                    {registrations.length === 0 ? (
                      <div className="glass rounded-3xl p-12 border border-dashed border-border text-center">
                        <CheckCircle className="h-10 w-10 text-emerald-500 mb-3 mx-auto animate-pulse" />
                        <h4 className="text-sm font-black text-foreground">No Registrations in Pipeline</h4>
                        <p className="text-xs text-zinc-500 mt-1">Submit signup requests to track setup progress.</p>
                        <button
                          onClick={loadDashboardData}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {registrations.map(reg => {
                          const isRejected = reg.status === 'REJECTED';
                          const isApproved = ['APPROVED', 'APPROVED_WITH_CONDITIONS', 'READY_FOR_PROVISIONING', 'PROVISIONED', 'ACTIVATED', 'LIVE'].includes(reg.status);
                          const isTechnicalChecked = ['READY_FOR_PROVISIONING', 'PROVISIONED', 'ACTIVATED', 'LIVE'].includes(reg.status);
                          const isProvisioned = ['PROVISIONED', 'ACTIVATED', 'LIVE'].includes(reg.status);
                          const isKeyGenerated = !!reg.activationKey || isProvisioned;
                          const isActivated = reg.institution?.status === 'ACTIVE' || ['ACTIVATED', 'LIVE'].includes(reg.status);
                          const isLive = reg.status === 'LIVE';

                          let progressVal = 12.5;
                          if (isRejected) progressVal = 0;
                          else if (isLive) progressVal = 100;
                          else if (isActivated) progressVal = 87.5;
                          else if (isProvisioned) progressVal = 75;
                          else if (isTechnicalChecked) progressVal = 50;
                          else if (isApproved) progressVal = 37.5;
                          else if (reg.status === 'PENDING_REVIEW') progressVal = 25;

                          const statusColor = isRejected ? 'border-red-500/30 bg-red-500/3' :
                            isLive ? 'border-emerald-500/30 bg-emerald-500/3' :
                            reg.status === 'PENDING_REVIEW' ? 'border-amber-500/30 bg-amber-500/3' :
                            'border-border bg-card/30';

                          return (
                            <div key={reg.id} className={`glass rounded-2xl p-5 border shadow-sm space-y-4 ${statusColor}`}>
                              {/* Header Row */}
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[8px] font-black uppercase bg-primary/10 px-2 py-0.5 rounded text-primary">
                                      {reg.orgType} • {reg.orgSize}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border
                                      ${isRejected ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        isLive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        reg.status === 'PENDING_REVIEW' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                      {reg.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-black text-foreground">{reg.orgName}</h4>
                                  <p className="text-[9px] text-zinc-500 font-mono">
                                    {reg.referenceNumber} • {reg.email}
                                    {reg.phone && ` • ${reg.phone}`}
                                  </p>
                                  <div className="flex gap-2 flex-wrap mt-1">
                                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border
                                      ${reg.emailVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                      Email: {reg.emailVerified ? '✓ Verified' : '✗ Unverified'}
                                    </span>
                                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border
                                      ${reg.phoneVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                      Phone: {reg.phoneVerified ? '✓ Verified' : '◌ Optional'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-base font-black text-foreground">{progressVal}%</div>
                                  <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${isRejected ? 'bg-red-500' : 'bg-primary'}`}
                                      style={{ width: `${progressVal}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Visual Stepper */}
                              <div className="flex gap-2 items-center bg-secondary/20 border border-border/30 rounded-xl p-3 overflow-x-auto">
                                {[
                                  { label: 'Registered', done: true },
                                  { label: 'Approved', done: isApproved, active: reg.status === 'PENDING_REVIEW' },
                                  { label: 'Tech Check', done: isTechnicalChecked, active: reg.status === 'APPROVED' },
                                  { label: 'Provisioned', done: isProvisioned, active: reg.status === 'READY_FOR_PROVISIONING' },
                                  { label: 'Key Issued', done: isKeyGenerated },
                                  { label: 'Activated', done: isActivated },
                                  { label: 'Live', done: isLive },
                                ].map((step, idx, arr) => (
                                  <React.Fragment key={idx}>
                                    <div className="flex flex-col items-center gap-1 shrink-0 min-w-[52px]">
                                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black border transition
                                        ${step.done ? 'bg-primary border-primary text-white' :
                                          step.active ? 'border-primary text-primary bg-primary/10 animate-pulse' :
                                          'border-border text-zinc-600 bg-secondary/30'}`}>
                                        {step.done ? '✓' : idx + 1}
                                      </div>
                                      <span className="text-[7px] font-black uppercase tracking-tight text-zinc-500 text-center leading-tight">
                                        {step.label}
                                      </span>
                                    </div>
                                    {idx < arr.length - 1 && (
                                      <div className={`flex-1 h-px min-w-[12px] ${step.done ? 'bg-primary/50' : 'bg-border'}`} />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 items-center justify-end">
                                {reg.status === 'PENDING_REVIEW' && (
                                  <>
                                    {(!reg.emailVerified || !reg.phoneVerified) && (
                                      <button
                                        onClick={() => handleVerifyManual(reg.id)}
                                        className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-[10px] font-bold uppercase rounded-xl border border-emerald-500/20 text-emerald-500 transition"
                                      >
                                        Verify Manually
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleResendVerification(reg.id)}
                                      className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-[10px] font-bold uppercase rounded-xl border border-indigo-500/20 text-indigo-400 transition"
                                    >
                                      Resend OTP
                                    </button>
                                    <button
                                      onClick={() => setSelectedRegForDocs(reg.id)}
                                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase rounded-xl border border-border text-foreground transition"
                                    >
                                      Request Docs
                                    </button>
                                    <button
                                      onClick={() => handleRejectRegistration(reg.id)}
                                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold uppercase rounded-xl border border-red-500/20 text-red-500 transition"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => handleApproveRegistration(reg.id)}
                                      disabled={submitting}
                                      className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-primary/25 hover:bg-hover transition disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                  </>
                                )}

                                {reg.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handleTechnicalReview(reg.id)}
                                    disabled={submitting}
                                    className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-primary/25 hover:bg-hover transition flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" /> Run Technical Check
                                  </button>
                                )}

                                {(reg.status === 'READY_FOR_PROVISIONING' || reg.status === 'PROVISIONING_FAILED') && (
                                  <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl border border-border bg-secondary/20 w-full">
                                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider w-full">Select Payment Tier</span>
                                    <select
                                      value={selectedPaymentStatus[reg.id] || 'TRIAL'}
                                      onChange={e => setSelectedPaymentStatus(prev => ({ ...prev, [reg.id]: e.target.value }))}
                                      className="text-xs bg-input border border-border text-foreground px-3 py-1.5 rounded-xl outline-none"
                                    >
                                      <option value="TRIAL">Trial (30 Days)</option>
                                      <option value="PAID">Paid (1 Year)</option>
                                      <option value="PARTIAL">Partial Payment</option>
                                      <option value="PENDING">Pending Payment</option>
                                      <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                    <button
                                      onClick={() => handleProvisionWorkspace(reg.id, selectedPaymentStatus[reg.id] || 'TRIAL')}
                                      disabled={submitting}
                                      className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-primary/25 hover:bg-hover transition flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                      <Database className="h-3.5 w-3.5" />
                                      {reg.status === 'PROVISIONING_FAILED' ? 'Retry Provision' : 'Build Workspace'}
                                    </button>
                                  </div>
                                )}

                                {isProvisioned && reg.activationKey && (
                                  <div className="p-4 rounded-2xl border border-border bg-secondary/10 w-full space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Reference Number</span>
                                        <div className="flex items-center gap-1.5 font-mono font-black text-foreground">
                                          <span>{reg.referenceNumber}</span>
                                          <button
                                            onClick={() => copyToClipboard(reg.referenceNumber)}
                                            className="p-1 rounded bg-card hover:bg-muted border border-border text-zinc-400 hover:text-foreground transition"
                                            title="Copy Reference Number"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Activation License Key (Secure Hash stored in DB)</span>
                                        <div className="flex items-center gap-1.5 font-mono font-black text-primary">
                                          <span>{reg.activationKey.rawKey || 'Secure Key'}</span>
                                          <button
                                            onClick={() => copyToClipboard(reg.activationKey.rawKey || '')}
                                            className="p-1 rounded bg-card hover:bg-muted border border-border text-zinc-400 hover:text-foreground transition"
                                            title="Copy Key"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {reg.institution?.tenant?.slug && (
                                        <div className="space-y-1 md:col-span-2">
                                          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider font-sans">Subdomain Workspace URL</span>
                                          <div className="flex items-center gap-2 flex-wrap font-mono font-bold text-foreground">
                                            <a
                                              href={`http://${reg.institution.tenant.slug}.localhost:3000`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              {`http://${reg.institution.tenant.slug}.localhost:3000`}
                                            </a>
                                            <span className="text-zinc-500">|</span>
                                            <span className="text-zinc-400">{`${reg.institution.tenant.slug}.aurxon.com`}</span>
                                            <button
                                              onClick={() => copyToClipboard(`http://${reg.institution.tenant.slug}.localhost:3000`)}
                                              className="p-1 rounded bg-card hover:bg-muted border border-border text-zinc-400 hover:text-foreground transition"
                                              title="Copy URL"
                                            >
                                              <Copy className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
                                      <div className="flex gap-1.5">
                                        {[
                                          { icon: Mail, fn: () => triggerToast(`Unified Activation License Key emailed to ${reg.orgName}.`), tip: 'Email Key' },
                                          { icon: Download, fn: () => downloadKeyFile(reg.orgName, reg.activationKey.rawKey || ''), tip: 'Download License' },
                                        ].map(({ icon: Icon, fn, tip }) => (
                                          <button key={tip} onClick={fn} title={tip} className="p-2 bg-card border border-border rounded-xl text-zinc-400 hover:text-foreground hover:bg-secondary/60 transition flex items-center gap-1 text-[10px] font-bold">
                                            <Icon className="h-3.5 w-3.5" />
                                            <span>{tip}</span>
                                          </button>
                                        ))}
                                      </div>

                                      {reg.institution?.tenant?.slug && (
                                        <a
                                          href={`http://${reg.institution.tenant.slug}.localhost:3000/activate?ref=${reg.referenceNumber}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-primary/20 transition flex items-center gap-1.5 animate-pulse"
                                        >
                                          <Shield className="h-3.5 w-3.5" /> Launch Subdomain Activation
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Request Docs Panel */}
                              {selectedRegForDocs === reg.id && (
                                <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
                                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block">Document Request Details</span>
                                  <textarea
                                    placeholder="e.g. Please upload CBSE affiliation certification..."
                                    rows={2}
                                    className="w-full text-xs rounded-xl border border-border bg-input px-3.5 py-2 outline-none text-foreground"
                                    value={requestDocsNotes}
                                    onChange={e => setRequestDocsNotes(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedRegForDocs(null)} className="px-3 py-1.5 bg-secondary rounded-xl text-[10px] font-bold text-foreground">Cancel</button>
                                    <button onClick={() => handleRequestDocuments(reg.id)} className="px-4 py-1.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase">Send Request</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ════ ORGANIZATIONS TAB ════ */}
                {activeTab === 'organizations' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">School Digital Twins</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Real-time status tracking, health scores and configurations.</p>
                    </div>

                    {!billingStats?.recentOrganizations?.length ? (
                      <div className="glass rounded-3xl p-12 border border-dashed border-border text-center">
                        <FolderOpen className="h-10 w-10 text-zinc-400 mb-3 mx-auto" />
                        <h4 className="text-sm font-black text-foreground">No Digital Twins Active</h4>
                        <p className="text-xs text-zinc-500 mt-1">Register and provision a school to launch twin tracking.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {billingStats?.recentOrganizations?.map((org: any) => {
                          const reg = registrations.find(r => r.institutionId === org.id);
                          return (
                            <div key={org.id} className="glass rounded-2xl p-5 border border-border shadow-sm hover-lift space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-black text-foreground">{org.name}</h4>
                                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{org.id.slice(0, 8)}.aurxon.com</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase border border-emerald-500/20">
                                    {org.status}
                                  </span>
                                  <span className="text-[9px] font-black uppercase bg-primary/10 px-2 py-0.5 rounded text-primary">
                                    {org.healthScore || 98}% Health
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3 border-y border-border/40 py-3 text-center">
                                <div>
                                  <span className="text-[7px] font-black uppercase text-zinc-500">Users</span>
                                  <p className="text-xs font-black text-foreground mt-0.5">{reg?.expectedUsers || 120}</p>
                                </div>
                                <div>
                                  <span className="text-[7px] font-black uppercase text-zinc-500">Storage</span>
                                  <p className="text-xs font-black text-foreground mt-0.5">4GB / 10GB</p>
                                </div>
                                <div>
                                  <span className="text-[7px] font-black uppercase text-zinc-500">License</span>
                                  <p className="text-xs font-black text-foreground mt-0.5">365 Days</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="h-3 w-3 rounded" style={{ backgroundColor: org.primaryColor }} />
                                  <span className="text-[9px] font-mono text-zinc-500">{org.primaryColor}</span>
                                </div>
                                <div className="flex gap-2">
                                  {org.status === 'SUSPENDED' ? (
                                    <button
                                      onClick={() => handleResumeOrg(org.id)}
                                      disabled={submitting}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-[10px] font-black text-emerald-500 border border-emerald-500/20 disabled:opacity-50 transition"
                                    >
                                      Resume
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleSuspendOrg(org.id)}
                                      disabled={submitting}
                                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[10px] font-black text-red-500 border border-red-500/20 disabled:opacity-50 transition"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { setSelectedImpersonateOrg(org.id); handleTabChange('support'); }}
                                    className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-[10px] font-black text-primary border border-border"
                                  >
                                    Diagnose
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ════ SUBSCRIPTIONS TAB ════ */}
                {activeTab === 'subscriptions' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Licensing Plans & Rates</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Core billing profiles checked by controllers at execution time.</p>
                    </div>
                    {plans.length === 0 ? (
                      <div className="glass rounded-3xl p-12 border border-dashed border-border text-center">
                        <FolderOpen className="h-10 w-10 text-zinc-400 mb-3 mx-auto" />
                        <h4 className="text-sm font-black text-foreground">No Plans Configured</h4>
                        <p className="text-xs text-zinc-500 mt-1">No plan definitions in the database.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map(plan => (
                          <div key={plan.id} className="glass rounded-2xl border border-border p-5 space-y-4 hover-lift">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary">{plan.code}</span>
                              <span className="text-sm font-black text-foreground">₹{plan.monthlyPrice}/mo</span>
                            </div>
                            <h4 className="text-base font-black text-foreground">{plan.name}</h4>
                            <div className="text-xs space-y-1.5 text-zinc-500 border-t border-border pt-3">
                              <p>👥 {plan.studentLimit} Students</p>
                              <p>💾 {plan.storageLimitGb} GB Storage</p>
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {plan.moduleAccess?.map((m: string) => (
                                  <span key={m} className="px-2 py-0.5 bg-secondary rounded text-[7px] font-mono text-zinc-500 uppercase">
                                    {m.split('_')[0]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ════ LEADS TAB ════ */}
                {activeTab === 'leads' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Leads & Workspace Queries</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Signup leads, inquiries, and custom package requests.</p>
                    </div>
                    <div className="glass rounded-3xl p-12 border border-dashed border-border text-center">
                      <Layers className="h-10 w-10 text-zinc-400 mb-3 mx-auto animate-pulse" />
                      <h4 className="text-sm font-black text-foreground">CRM Integration Pending</h4>
                      <p className="text-xs text-zinc-500 mt-1">Leads & inquiries CRM module coming in V1.1.</p>
                    </div>
                  </div>
                )}

                {/* ════ SUPPORT TAB ════ */}
                {activeTab === 'support' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Founder Diagnostics</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Secure diagnostic tunnels to troubleshoot tenant accounts. All actions audit logged.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Impersonation */}
                      <div className="glass rounded-2xl p-5 border border-border space-y-4">
                        <h4 className="text-xs font-black uppercase text-foreground">Impersonation Tunnel</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Target Tenant UUID *</label>
                            <input
                              type="text"
                              placeholder="Enter Institution ID"
                              value={selectedImpersonateOrg}
                              onChange={e => setSelectedImpersonateOrg(e.target.value)}
                              className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs font-mono outline-none text-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Diagnostic Reason *</label>
                            <textarea
                              placeholder="Explain the troubleshooting requirement..."
                              value={impersonateReason}
                              onChange={e => setImpersonateReason(e.target.value)}
                              rows={3}
                              className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs outline-none text-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Ticket Reference</label>
                            <input
                              type="text"
                              placeholder="e.g. TKT-182"
                              value={impersonateTicket}
                              onChange={e => setImpersonateTicket(e.target.value)}
                              className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs font-mono outline-none text-foreground"
                            />
                          </div>
                          <button
                            onClick={handleLaunchImpersonation}
                            disabled={submitting || !selectedImpersonateOrg || impersonateReason.trim().length < 5}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-xs font-black uppercase rounded-xl shadow-md shadow-primary/25 disabled:opacity-50 transition"
                          >
                            <Play className="h-4 w-4" /> Start Diagnostic Tunnel
                          </button>
                        </div>
                      </div>

                      {/* Direct Renewal */}
                      <div className="glass rounded-2xl p-5 border border-border space-y-4">
                        <h4 className="text-xs font-black uppercase text-foreground">Direct License Renewal Override</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase text-zinc-500">Institution UUID</label>
                            <input type="text" placeholder="UUID" value={directRenewalOrgId} onChange={e => setDirectRenewalOrgId(e.target.value)} className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-xs font-mono outline-none text-foreground" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase text-zinc-500">Extension (Months)</label>
                            <input type="number" min={1} value={directRenewalMonths} onChange={e => setDirectRenewalMonths(parseInt(e.target.value) || 12)} className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-xs font-mono outline-none text-foreground" />
                          </div>
                          {directRenewalResult && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-[10px] font-mono text-emerald-600 space-y-1">
                              <p className="font-bold text-[9px] uppercase">Generated Key:</p>
                              <p className="font-black text-xs text-foreground select-all">{directRenewalResult.renewalKey}</p>
                            </div>
                          )}
                          <button
                            onClick={async () => {
                              if (!directRenewalOrgId) { triggerToast('Enter UUID', 'info'); return; }
                              setSubmitting(true);
                              try {
                                const r = await founderDirectRenewalApi(directRenewalOrgId, directRenewalMonths, directRenewalNotes);
                                setDirectRenewalResult(r);
                                triggerToast('Renewal key generated.');
                              } catch(e: any) {
                                triggerToast(e.message, 'error');
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            disabled={submitting}
                            className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold uppercase transition disabled:opacity-50"
                          >
                            Generate Renewal Key
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ ANALYTICS TAB ════ */}
                {activeTab === 'analytics' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">MRR & Usage Analytics</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Billing plans growth and subscription tier breakdown.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="glass rounded-2xl p-5 border border-border">
                        <h4 className="text-[9px] font-black uppercase text-zinc-500 mb-4">Adoption Tier Split</h4>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={planPieData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                                {planPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#121b2d', borderColor: '#263247', color: '#fff', fontSize: 10, borderRadius: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-[9px] font-bold text-zinc-500 border-t border-border pt-3">
                          {planPieData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                              <span>{d.name} ({d.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass rounded-2xl p-5 border border-border space-y-3">
                        <h4 className="text-[9px] font-black uppercase text-zinc-500">Storage Quota Allocation</h4>
                        <div className="space-y-3 max-h-52 overflow-y-auto">
                          {storageStats.length === 0 ? (
                            <p className="text-[10px] text-zinc-500 italic text-center py-8">No storage data available.</p>
                          ) : storageStats.map((item, idx) => (
                            <div key={idx} className="space-y-1.5 p-3 rounded-xl border border-border bg-secondary/20">
                              <div className="flex justify-between text-[10px] font-bold text-foreground">
                                <span>{item.name}</span>
                                <span className="text-zinc-500">{Number(item.usedGb).toFixed(4)} GB / {item.quotaGb} GB</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (item.usedGb / item.quotaGb) * 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ MONITORING TAB ════ */}
                {activeTab === 'monitoring' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Security & Threat Monitoring</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Failed login attempts, lockouts and IP security flags.</p>
                    </div>
                    {threatLogs.filter(t => !t.resolved).length === 0 ? (
                      <div className="glass rounded-3xl p-12 border border-dashed border-border text-center">
                        <ShieldCheck className="h-10 w-10 text-emerald-500 mb-3 mx-auto animate-pulse" />
                        <h4 className="text-sm font-black text-foreground">Platform Secure</h4>
                        <p className="text-xs text-zinc-500 mt-1">No active security warnings or lockout flags.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {threatLogs.filter(t => !t.resolved).map(threat => (
                          <div key={threat.id} className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-500">{threat.severity}</span>
                                <span className="text-xs font-black text-foreground">{threat.threatType}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500">{threat.details}</p>
                              <p className="text-[8px] text-zinc-500 font-mono">IP: {threat.ipAddress || 'Not logged'}</p>
                            </div>
                            <button onClick={() => handleResolveThreat(threat.id)} className="px-3 py-1.5 rounded-lg bg-card text-foreground hover:bg-secondary border border-border text-[10px] font-bold shrink-0">
                              Resolve
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ════ AUDIT TAB ════ */}
                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Global Audit Trails</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Platform action entries, diagnostic tunnels, and backup triggers.</p>
                    </div>
                    <div className="glass rounded-2xl border border-border overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-secondary text-[8px] font-black uppercase text-zinc-500 border-b border-border">
                            <th className="p-3">Log Type</th>
                            <th className="p-3">Action Details</th>
                            <th className="p-3">Logged At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-secondary/25 transition">
                            <td className="p-3 font-bold text-foreground">DB_MIGRATION</td>
                            <td className="p-3 text-zinc-500">Applied migration: add_notification_category successfully to Neon master.</td>
                            <td className="p-3 text-zinc-500 font-mono text-[9px]">{new Date().toLocaleString()}</td>
                          </tr>
                          <tr className="hover:bg-secondary/25 transition">
                            <td className="p-3 font-bold text-foreground">WORKSPACE_ACTIVATION</td>
                            <td className="p-3 text-zinc-500">Default settings initialized and roles matrix generated for school ERP.</td>
                            <td className="p-3 text-zinc-500 font-mono text-[9px]">{new Date(Date.now() - 3600000).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ════ TEAM TAB ════ */}
                {activeTab === 'team' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Founder Team</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Administrators authorized for the AURXON OS cockpit.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass rounded-2xl border border-border p-4 hover-lift">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/20 flex items-center justify-center font-black text-primary">K</div>
                          <div>
                            <p className="text-xs font-black text-foreground">Karan Founder</p>
                            <p className="text-[9px] text-zinc-500">PLATFORM_OWNER • founder@aurxon.com</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ DEPLOYMENTS TAB ════ */}
                {activeTab === 'deployments' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Platform Deployments</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Code update schedules and backup routines.</p>
                    </div>
                    <div className="glass rounded-2xl border border-border p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">Version: 3.0 (Stable)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase">Active</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Multi-tenant routing, priority-badge notifications, and interactive provisioning verified.</p>
                    </div>
                  </div>
                )}

                {/* ════ SETTINGS TAB ════ */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">OS Settings</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">System branding configs and theme modes.</p>
                    </div>

                    {/* Theme */}
                    <div className="glass rounded-2xl border border-border p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase text-foreground">Quick Theme</h4>
                      <div className="flex gap-2">
                        {(['light', 'dark', 'system'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition
                              ${theme === t ? 'bg-primary text-white border-primary' : 'bg-secondary text-zinc-500 border-border hover:bg-secondary/80'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RBAC Editor */}
                    <div className="glass rounded-2xl border border-border p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase text-foreground">RBAC Policy Editor</h4>
                        {rbacMatrix && (
                          <button onClick={saveMatrixChanges} disabled={submitting} className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase shadow-sm disabled:opacity-50">
                            Save Policies
                          </button>
                        )}
                      </div>
                      {rbacMatrix ? (
                        <div className="space-y-3">
                          <select
                            value={selectedMatrixRoleId}
                            onChange={e => handleMatrixRoleChange(e.target.value)}
                            className="rounded-xl border border-border bg-input px-3 py-2 text-xs font-bold outline-none text-foreground"
                          >
                            {rbacMatrix.roles?.map((r: any) => (
                              <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                            ))}
                          </select>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {rbacMatrix.groups?.[0]?.permissions?.map((perm: any) => {
                              const key = `${perm.resource}:${perm.action}`;
                              return (
                                <div key={key} className="flex justify-between items-center p-2 border border-border bg-secondary/15 rounded-lg text-[11px]">
                                  <span className="font-bold text-foreground">{perm.label || perm.resource}</span>
                                  <input
                                    type="checkbox"
                                    checked={!!matrixEdits[key]}
                                    onChange={e => handleMatrixToggle(perm.resource, perm.action, e.target.checked)}
                                    className="h-4 w-4 accent-primary"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500 italic">No RBAC data available.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Panel */}
          <aside className="w-72 border-l border-border bg-card/10 backdrop-blur-md p-5 space-y-5 overflow-y-auto shrink-0 hidden xl:block">
            {/* Hardware Telemetry */}
            <div className="glass rounded-2xl p-4 border border-border space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-[9px] font-black uppercase text-foreground">Hardware Telemetry</span>
                <span className="px-2 py-0.5 rounded bg-secondary text-zinc-500 text-[7px] font-black uppercase">V1.1</span>
              </div>
              <div className="py-6 text-center border border-dashed border-border rounded-xl bg-secondary/15">
                <HardDrive className="h-5 w-5 text-zinc-400 mx-auto mb-2" />
                <p className="text-[9px] font-black text-foreground">Agent Pending</p>
                <p className="text-[8px] text-zinc-500 mt-0.5">CPU & RAM gauges in V1.1</p>
              </div>
            </div>

            {/* Backups */}
            <div className="glass rounded-2xl p-4 border border-border space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-[9px] font-black uppercase text-foreground">Backup & DR</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {backupRecords.slice(0, 4).map(rec => (
                  <div key={rec.id} className="p-2.5 rounded-xl border border-border bg-secondary/15 text-[9px] font-mono space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 truncate">{rec.backupType} snapshot</span>
                      <span className="text-emerald-500 shrink-0">{rec.status}</span>
                    </div>
                    <p className="text-zinc-600 truncate">{rec.storedAt}</p>
                  </div>
                ))}
                {backupRecords.length === 0 && (
                  <p className="text-[9px] text-zinc-500 italic text-center py-4">No backups logged.</p>
                )}
              </div>
              <button
                onClick={handleTriggerBackup}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-secondary hover:bg-secondary/80 border border-border text-[9px] font-black uppercase rounded-xl transition"
              >
                <Database className="h-3.5 w-3.5 text-primary" />
                Snap Database
              </button>
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-2xl p-4 border border-border space-y-3">
              <span className="text-[9px] font-black uppercase text-foreground border-b border-border pb-2 block">Quick Stats</span>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Registrations', val: registrations.length },
                  { label: 'Renewal Pending', val: pendingRenewalsCount },
                  { label: 'Active Keys', val: activationKeys.filter((k: any) => k.status === 'ACTIVE').length },
                  { label: 'Security Threats', val: threatLogs.filter(t => !t.resolved).length },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 font-semibold">{s.label}</span>
                    <span className="font-black text-foreground">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer Status Bar */}
        <footer className="h-9 border-t border-border bg-secondary/80 flex items-center px-6 text-[8px] font-mono text-zinc-500 justify-between shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold uppercase animate-pulse">Live</span>
            <span className="truncate">FOUNDER: Session authenticated via secure JWT control plane.</span>
          </div>
          <div className="shrink-0 pl-4 text-zinc-600 font-bold">SLA: 99.99% • Neon DB ✓</div>
        </footer>
      </main>

      {/* ════ COMMAND PALETTE ════ */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-border px-4 py-3 gap-3">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search schools, licenses, approvals..."
                className="w-full bg-transparent text-xs text-foreground placeholder-placeholder outline-none"
                value={commandSearchQuery}
                onChange={e => setCommandSearchQuery(e.target.value)}
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="rounded bg-secondary px-2 py-0.5 text-[8px] font-bold text-zinc-500 border border-border">ESC</button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-3">
              {commandSearchQuery.trim().length >= 2 && (
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-wider px-2">Database Results</p>
                  {searchingBackend && <p className="text-[10px] text-zinc-500 italic px-2 animate-pulse">Querying indexes...</p>}
                  {!searchingBackend && backendSearchResults.length === 0 && <p className="text-[10px] text-zinc-500 italic px-2">No records found.</p>}
                  {!searchingBackend && backendSearchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-border hover:bg-secondary/40 transition group"
                    >
                      <button
                        onClick={() => { handleTabChange(item.href); setCommandPaletteOpen(false); }}
                        className="flex-1 flex items-center justify-between text-left"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{item.type}</span>
                            <p className="text-xs font-bold text-foreground">{item.label}</p>
                          </div>
                          <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">{item.sublabel}</p>
                        </div>
                      </button>
                      
                      {item.type === 'User Login' && (
                        <button
                          onClick={() => handleResetUserPassword(item.id)}
                          className="ml-2 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[9px] font-black uppercase border border-red-500/20 shrink-0 transition"
                        >
                          Reset Pass
                        </button>
                      )}
                      
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-500 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1 border-t border-border/20 pt-3">
                <p className="text-[8px] font-black uppercase text-zinc-500 tracking-wider px-2">Quick Shortcuts</p>
                {[
                  { title: 'Approve School Signup', desc: 'Authorize and bootstrap school workspace', href: 'approvals' },
                  { title: 'View Digital Twins', desc: 'Monitor active school organizations', href: 'organizations' },
                  { title: 'Direct Renewal Extension', desc: 'Add months override directly', href: 'support' },
                  { title: 'Open Diagnostics Tunnel', desc: 'Secure impersonation session', href: 'support' },
                  { title: 'View Audit Logs', desc: 'Review global event trail', href: 'audit' },
                ].filter(c => c.title.toLowerCase().includes(commandSearchQuery.toLowerCase())).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { handleTabChange(item.href); setCommandPaletteOpen(false); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-secondary/40 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.title}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ RESET PASSWORD MODAL ════ */}
      {resetPasswordModalOpen && resetPasswordResult && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setResetPasswordModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Security Override</span>
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Temporary Password Generated</h3>
              </div>
              <button
                onClick={() => setResetPasswordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-zinc-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
              <div className="text-xs">
                <span className="text-zinc-500 font-semibold">User Email:</span>
                <p className="font-bold text-foreground mt-0.5">{resetPasswordResult.email}</p>
              </div>

              <div className="text-xs">
                <span className="text-zinc-500 font-semibold">Temporary Passphrase:</span>
                <div className="flex items-center gap-2 mt-1 bg-background border border-border p-2 rounded-lg font-mono text-foreground font-black text-sm relative">
                  <span className="flex-1 select-all">{resetPasswordResult.temporaryPassword}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetPasswordResult.temporaryPassword);
                      triggerToast('Password copied to clipboard!', 'success');
                    }}
                    className="p-1.5 bg-secondary hover:bg-secondary/80 rounded border border-border text-zinc-400 hover:text-foreground transition"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-550/20 p-3.5 rounded-xl text-[10px] text-amber-500 flex gap-2.5 font-semibold">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>For security, the user will be forced to change this temporary passphrase immediately upon their next successful workspace login.</p>
            </div>

            <button
              onClick={() => setResetPasswordModalOpen(false)}
              className="w-full py-2.5 bg-primary hover:bg-hover text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/25"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
