'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, KeyRound, ShieldCheck, Activity, Bell, Search, Database, 
  Save, Settings, User, CreditCard, ChevronRight, Menu, LogOut, CheckCircle, 
  XCircle, Play, ShieldAlert, Sparkles, RefreshCw, Layers, ArrowUpRight,
  UserCheck, HelpCircle, HardDrive, Terminal, Clock, Shield, Award, FolderOpen, 
  AlertTriangle, Copy, Mail, Download, Check, Info
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
  verifyRegistrationManualApi, resendVerificationOtpApi
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
  const { theme, toggleTheme } = useTheme();
  const { 
    notifications, unreadCount, criticalCount, approvalsCount, supportCount, 
    markAllRead, clearNotifications, markAsRead, fetchNotifications 
  } = useNotifications();
  const { logout } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Greeting state
  const [greeting, setGreeting] = useState('Good Morning, Karan');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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

  // Stepper UI simulations & inputs
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

  const [selectedMatrixRoleId, setSelectedMatrixRoleId] = useState('');
  const [matrixEdits, setMatrixEdits] = useState<Record<string, boolean>>({});

  // Global Command Palette search
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [backendSearchResults, setBackendSearchResults] = useState<any[]>([]);
  const [searchingBackend, setSearchingBackend] = useState(false);

  // Notification center popup state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifSearch, setNotifSearch] = useState('');
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<string>('ALL');

  // Toast
  const [toast, setToast] = useState('');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    setMounted(true);

    const hour = new Date().getHours();
    let greet = 'Good Morning';
    if (hour >= 12 && hour < 17) greet = 'Good Afternoon';
    else if (hour >= 17) greet = 'Good Evening';

    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/');
      return;
    }
    const user = JSON.parse(cached);
    if (user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    setGreeting(`${greet}, Karan`);
    loadDashboardData();

    // Listen for keys: CTRL+K for Command Palette, ESC to close dropdowns
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
    try {
      const [regs, currMetrics, histMetrics, stor, threats, backups, bills, plns, rbac, actKeys, renewals] = await Promise.all([
        getRegistrationsApi().catch(() => []),
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

      setRegistrations(regs);
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
      console.warn('Founder dashboard data offline: Using local mock/cached telemetry.');
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
    if (rbacMatrix) {
      initializeMatrixEdits(rbacMatrix, roleId);
    }
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
      triggerToast(err.message || 'Failed to update matrix');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Interactive Stepper Handlers ──────────────────────────────────────────

  const handleApproveRegistration = async (id: string) => {
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'APPROVED', 'Approved via Command Center');
      triggerToast('Registration approved successfully!');
      loadDashboardData();
      fetchNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Approval failed');
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
      triggerToast(err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDocuments = async (id: string) => {
    if (!requestDocsNotes.trim()) {
      triggerToast('Please write the request details.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'CHANGES_REQUESTED', requestDocsNotes);
      triggerToast('Documents request email logged.');
      setSelectedRegForDocs(null);
      setRequestDocsNotes('');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to request documents');
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
      triggerToast(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvisionWorkspace = async (id: string, paymentStatus: string = 'TRIAL') => {
    setSubmitting(true);
    try {
      const result = await provisionWorkspaceApi(id, paymentStatus);
      triggerToast(`Workspace database provisioned! Licence: ${result.licenseKey}`);
      loadDashboardData();
      fetchNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Provisioning failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyManual = async (id: string) => {
    setSubmitting(true);
    try {
      await verifyRegistrationManualApi(id);
      triggerToast('Registration email & mobile manually verified successfully!');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Manual verification override failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async (id: string) => {
    setSubmitting(true);
    try {
      await resendVerificationOtpApi(id);
      triggerToast('Verification OTP requests resent successfully.');
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to resend verification OTPs.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Key Actions Helpers ───────────────────────────────────────────────────

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('Copied to clipboard!');
  };

  const mockEmailTrigger = (orgName: string, key: string) => {
    triggerToast(`Email dispatched containing Licence Key package to ${orgName} Admin.`);
  };

  const downloadKeyFile = (orgName: string, key: string) => {
    const element = document.createElement("a");
    const file = new Blob([`AURXON Licence - ${orgName}\nKey: ${key}\nGenerated: ${new Date().toLocaleDateString()}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${orgName.toLowerCase().replace(/ /g, '_')}_licence.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast('Downloading license credentials...');
  };

  // ─── Support Actions ───────────────────────────────────────────────────────

  const handleResolveThreat = async (id: string) => {
    try {
      await resolveSecurityThreatApi(id);
      triggerToast('Threat marked as resolved.');
      const threats = await getSecurityThreatsApi();
      setThreatLogs(threats);
    } catch (err: any) {
      triggerToast(err.message || 'Resolution failed');
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
      triggerToast(err.message || 'Failed to trigger backup');
    }
  };

  const handleLaunchImpersonation = async () => {
    if (!selectedImpersonateOrg) {
      triggerToast('Please select a target organization');
      return;
    }
    if (!impersonateReason || impersonateReason.trim().length < 5) {
      triggerToast('Impersonating reason is too short');
      return;
    }

    setSubmitting(true);
    try {
      const originalToken = localStorage.getItem('aurxon_token');
      const result = await impersonateOrganizationApi(selectedImpersonateOrg, impersonateReason, impersonateTicket);
      
      if (originalToken) {
        localStorage.setItem('aurxon_founder_token', originalToken);
      }
      localStorage.setItem('aurxon_token', result.token);
      localStorage.setItem('aurxon_impersonating', 'true');
      
      triggerToast(`Launching impersonation session for ${result.orgName}...`);
      window.open('/dashboard', '_blank');
    } catch (err: any) {
      triggerToast(err.message || 'Impersonation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Search Queries ────────────────────────────────────────────────────────

  useEffect(() => {
    if (commandSearchQuery.trim().length < 2) {
      setBackendSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
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

    return () => clearTimeout(delayDebounceFn);
  }, [commandSearchQuery]);

  const handleTabChange = (tab: string) => {
    setTabLoading(true);
    setActiveTab(tab);
    setTimeout(() => setTabLoading(false), 250);
  };

  const getBreadcrumbs = () => {
    const items = ['Founder'];
    if (activeTab === 'overview') items.push('Overview');
    else if (activeTab === 'organizations') items.push('Digital Twins');
    else if (activeTab === 'approvals') items.push('Pending Approvals');
    else if (activeTab === 'subscriptions') items.push('Subscriptions');
    else if (activeTab === 'leads') items.push('Leads & Signups');
    else if (activeTab === 'support') items.push('Diagnostics Tunnel');
    else if (activeTab === 'analytics') items.push('Billing Analytics');
    else if (activeTab === 'monitoring') items.push('System Monitoring');
    else if (activeTab === 'audit') items.push('Security Audit');
    else if (activeTab === 'team') items.push('Founder Team');
    else if (activeTab === 'deployments') items.push('Deployments');
    else if (activeTab === 'settings') items.push('Console Settings');

    return (
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-zinc-650">/</span>}
            <span className={index === items.length - 1 ? 'text-primary' : ''}>{item}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-450 uppercase tracking-widest">Booting Operating Control Plane...</p>
        </div>
      </div>
    );
  }

  const planPieData = [
    { name: 'Trial Subscriptions', value: billingStats?.trialSubscriptions || 0, color: '#64748b' },
    { name: 'Active Subscriptions', value: billingStats?.activeSubscriptions || 0, color: '#0284c7' },
  ];

  const pendingApprovalsCount = registrations.filter(r => r.status === 'PENDING_REVIEW').length;
  const pendingRenewalsCount = renewalRequests.filter(r => r.status === 'PENDING').length;
  const criticalThreatsCount = threatLogs.filter(t => !t.resolved && t.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans relative overflow-hidden select-none">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* OS Toast Box */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-text shadow-xl border border-primary/20 uppercase tracking-wide">
          <Sparkles className="h-4 w-4 text-sky-200 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      {/* Left Navigation Panel (Daily Tasks First) */}
      <aside className="w-64 border-r border-border bg-sidebar/95 backdrop-blur-xl shrink-0 flex flex-col justify-between p-5 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 bg-gradient-to-tr from-primary to-indigo-650 rounded-lg flex items-center justify-center font-black text-white text-md">
              A
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-card-text">AURXON OS</span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider px-2 block mb-2">Command Console</span>
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'organizations', label: 'Digital Twins', count: billingStats?.activeSubscriptions, icon: Building2 },
              { id: 'approvals', label: 'Approvals', count: pendingApprovalsCount, icon: UserCheck },
              { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
              { id: 'leads', label: 'Leads', icon: HelpCircle },
              { id: 'support', label: 'Support', count: pendingRenewalsCount, icon: Play },
              { id: 'analytics', label: 'Analytics', icon: Layers },
              { id: 'monitoring', label: 'Monitoring', count: criticalThreatsCount, icon: ShieldAlert },
              { id: 'audit', label: 'Audit Logs', icon: Terminal },
              { id: 'team', label: 'Founder Team', icon: User },
              { id: 'deployments', label: 'Deployments', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${isActive ? 'bg-primary text-primary-text shadow-lg' : 'hover:bg-secondary/60 text-zinc-400'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {!!item.count && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${isActive ? 'bg-black/20 text-white' : 'bg-secondary text-zinc-550'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-5 border-t border-border space-y-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-zinc-300">
              K
            </div>
            <div>
              <p className="text-xs font-bold text-card-text">Karan Admin</p>
              <p className="text-[9px] text-zinc-500 font-mono">Platform Founder</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main OS Command Board */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top OS Status Bar */}
        <header className="relative z-40 flex items-center justify-between border-b border-border px-8 py-4 bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                {greeting}
                <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              </h1>
              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                AURXON SaaS Control Center • Dynamic Cockpit
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold text-emerald-600 border border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Healthy (SLA 99.9%)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search shortcut button */}
            <button 
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold text-zinc-400 border border-border transition"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search Platform...</span>
              <span className="rounded bg-background px-1.5 py-0.5 text-[9px] font-mono border border-border">Ctrl+K</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-zinc-400 border border-border transition"
              title="Toggle theme mode"
            >
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </button>

            {/* Notification drop center */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-zinc-400 border border-border transition"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Priority Badges Header Section */}
              {notificationOpen && (
                <div className="absolute right-0 top-11 w-96 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 space-y-3 z-notification">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-foreground">Notification Drawer</span>
                      <div className="flex gap-2 mt-1">
                        {criticalCount > 0 && <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-1 rounded text-[7px] font-mono uppercase tracking-tight">Critical ({criticalCount})</span>}
                        {approvalsCount > 0 && <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1 rounded text-[7px] font-mono uppercase tracking-tight">Approvals ({approvalsCount})</span>}
                        {supportCount > 0 && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded text-[7px] font-mono uppercase tracking-tight">Support ({supportCount})</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => { markAllRead(); triggerToast('All notifications marked as read.'); }}
                      className="text-[9px] font-extrabold text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* Search and Category Filters Inside Panel */}
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Filter alerts..." 
                      className="w-full text-[11px] rounded-lg border border-border bg-input/40 px-2 py-1 outline-none text-foreground"
                      value={notifSearch}
                      onChange={e => setNotifSearch(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1">
                      {['ALL', 'REGISTRATION', 'APPROVAL', 'LICENSE', 'SECURITY', 'SUPPORT', 'DEPLOYMENT', 'SYSTEM'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNotifCategoryFilter(cat)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase border border-border tracking-tighter ${notifCategoryFilter === cat ? 'bg-primary text-primary-text' : 'bg-secondary text-zinc-500'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {notifications
                      .filter(n => {
                        const matchQuery = n.title.toLowerCase().includes(notifSearch.toLowerCase()) || n.content.toLowerCase().includes(notifSearch.toLowerCase());
                        const matchCat = notifCategoryFilter === 'ALL' || n.category === notifCategoryFilter;
                        return matchQuery && matchCat;
                      })
                      .map(n => (
                        <div key={n.id} className={`p-2.5 rounded-xl border border-border bg-secondary/20 text-xs space-y-1 relative group transition ${!n.isRead ? 'border-primary/20 bg-primary/5' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${!n.isRead ? 'bg-primary animate-pulse' : 'bg-zinc-650'}`} />
                              <span className="font-extrabold text-foreground uppercase tracking-tight text-[11px]">{n.title}</span>
                            </div>
                            <span className="text-[7px] text-zinc-500 font-mono">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-normal">{n.content}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-border/10">
                            <span className="text-[8px] font-mono text-zinc-500 tracking-tighter uppercase px-1 rounded bg-secondary/80">{n.category}</span>
                            {!n.isRead && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                className="text-[8px] text-primary font-black uppercase hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-zinc-500 italic text-center py-4">No notifications registered.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Central OS Desk Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Active content grid (Left side) */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {getBreadcrumbs()}

            {tabLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-secondary rounded-xl w-1/4" />
                <div className="h-40 bg-secondary rounded-3xl w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-secondary rounded-2xl" />
                  <div className="h-24 bg-secondary rounded-2xl" />
                </div>
              </div>
            ) : (
              <>
                {/* ════ OVERVIEW TAB ════ */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Welcome banner center OS */}
                    <div className="glass rounded-3xl p-6 border border-border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">SaaS Command Center</span>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{greeting}</h2>
                        <p className="text-xs text-zinc-550 leading-relaxed max-w-lg font-semibold">
                          Your tenant platform has <span className="text-primary font-bold">{pendingApprovalsCount} pending registrations</span> to authorize, and <span className="text-primary font-bold">{pendingRenewalsCount} renewal requests</span> outstanding.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleTabChange('approvals')}
                          className="px-4 py-2.5 rounded-xl bg-primary text-primary-text text-xs font-black uppercase tracking-wider hover-lift transition"
                        >
                          Review Approvals ({pendingApprovalsCount})
                        </button>
                      </div>
                    </div>

                    {/* Platform Lifecycle Quick Counters */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {[
                        { label: 'Pending Review', count: registrations.filter(r => r.status === 'PENDING_REVIEW').length, color: 'text-amber-500 bg-amber-500/5' },
                        { label: 'Provisioning', count: registrations.filter(r => r.status === 'PROVISIONING').length, color: 'text-blue-500 bg-blue-500/5 animate-pulse' },
                        { label: 'Failed Deploy', count: registrations.filter(r => r.status === 'PROVISIONING_FAILED').length, color: 'text-red-500 bg-red-500/5' },
                        { label: 'Activated', count: registrations.filter(r => r.status === 'LIVE' || r.status === 'ACTIVATED').length, color: 'text-emerald-500 bg-emerald-500/5' },
                        { label: 'Trial Mode', count: registrations.filter(r => r.status === 'PROVISIONED' && r.activationKey && r.activationKey.id.includes('TRIAL')).length, color: 'text-zinc-400 bg-zinc-500/5' },
                        { label: 'Paid / Enterprise', count: registrations.filter(r => r.status === 'PROVISIONED' && r.activationKey && r.activationKey.id.includes('PROD')).length, color: 'text-indigo-400 bg-indigo-500/5' }
                      ].map((c, idx) => (
                        <div key={idx} className={`glass rounded-2xl p-4 border border-border shadow-sm flex flex-col items-center justify-center text-center ${c.color}`}>
                          <span className="text-[20px] font-black">{c.count}</span>
                          <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 mt-1">{c.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Operational KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Active Subscriptions', val: billingStats?.activeSubscriptions || 0, desc: 'Live SaaS Desks' },
                        { label: 'Monthly Revenue (MRR)', val: `₹${Number(billingStats?.mrr || 0).toLocaleString('en-IN')}`, desc: 'Collections current month' },
                        { label: 'Database Capacity', val: `${Number(metricsCurrent?.dbSizeGb || 0.05).toFixed(3)} GB`, desc: 'Active Neon PG capacity' },
                        { label: 'Average Response Time', val: `${metricsCurrent?.avgResponseMs || 45} ms`, desc: 'P95 latency performance' }
                      ].map((kpi, idx) => (
                        <div key={idx} className="glass rounded-2xl p-5 border border-border shadow-md space-y-3">
                          <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">{kpi.label}</span>
                          <div className="text-xl font-black text-foreground">{kpi.val}</div>
                          <p className="text-[10px] text-zinc-450 font-semibold">{kpi.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart load metrics */}
                    {mounted && (
                      <div className="glass rounded-3xl p-5 border border-border shadow-md space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Requests Load & Latency Trends</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={metricsHistory}>
                            <defs>
                              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#263247" />
                            <XAxis dataKey="capturedAt" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={time => new Date(time).toLocaleTimeString()} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#121b2d', borderColor: '#263247', color: '#ffffff', fontSize: 10 }} />
                            <Area type="monotone" dataKey="requestsPerMin" stroke="#818cf8" fillOpacity={1} fill="url(#colorLatency)" name="Requests/min" />
                            <Line type="monotone" dataKey="avgResponseMs" stroke="#38bdf8" name="Latency (ms)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                  </div>
                )}

                {/* ════ ORGANIZATIONS TAB (SCHOOL DIGITAL TWIN CARDS) ════ */}
                {activeTab === 'organizations' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="glass rounded-3xl p-6 border border-border space-y-4 shadow-sm">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-foreground">School Digital Twins</h3>
                        <p className="text-[10px] text-zinc-550 font-semibold mt-0.5">Real-time status tracking, configurations, database metrics, and health scores.</p>
                      </div>

                      {billingStats?.recentOrganizations?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-3xl bg-secondary/15 text-center">
                          <FolderOpen className="h-8 w-8 text-zinc-400 mb-3" />
                          <h4 className="text-sm font-black text-foreground">No Digital Twins Active</h4>
                          <p className="text-xs text-zinc-550 mt-1">Register and provision a school to launch a twin tracker.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {billingStats?.recentOrganizations?.map((org: any) => {
                            // Find active registration if matched
                            const reg = registrations.find(r => r.institutionId === org.id);
                            
                            // Mock scoring metrics or pull from structures
                            const licenseDays = 365;
                            const activeUsers = reg?.expectedUsers || 120;
                            const activeStorage = '4GB';
                            const healthScore = org.healthScore || 98;

                            return (
                              <div key={org.id} className="glass rounded-3xl p-6 border border-border shadow-lg relative overflow-hidden flex flex-col justify-between hover-lift">
                                <div className="space-y-4">
                                  {/* Twin Header */}
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{org.name}</h4>
                                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{org.id.slice(0, 8)}.aurxon.com</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase border border-emerald-500/20">
                                        {org.status}
                                      </span>
                                      <span className="text-[9px] font-black uppercase bg-primary/10 px-2 py-0.5 rounded text-primary">
                                        {healthScore}% Health
                                      </span>
                                    </div>
                                  </div>

                                  {/* KPI Metrics */}
                                  <div className="grid grid-cols-3 gap-3 border-y border-border/40 py-3 text-center">
                                    <div>
                                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Active Users</span>
                                      <p className="text-xs font-black text-foreground mt-0.5">{activeUsers} Users</p>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Neon Storage</span>
                                      <p className="text-xs font-black text-foreground mt-0.5">{activeStorage} / 10GB</p>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">License validity</span>
                                      <p className="text-xs font-black text-foreground mt-0.5">{licenseDays} Days</p>
                                    </div>
                                  </div>

                                  {/* Dynamic Timelines & Checklist */}
                                  <div className="space-y-2">
                                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block">Autoconfig Database Timelines</span>
                                    <div className="space-y-1.5 text-[9px] font-semibold text-zinc-400">
                                      <div className="flex items-center gap-1.5 text-emerald-500">
                                        <Check className="h-3 w-3" />
                                        <span>Registered & Approved (Auth Checkmarks)</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-emerald-500">
                                        <Check className="h-3 w-3" />
                                        <span>Workspace Provisioned (Licence LIC-TRIALGenerated)</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-emerald-500">
                                        <Check className="h-3 w-3" />
                                        <span>Setup Autoconfigured (Grading CBSEAffiliation)</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-emerald-500">
                                        <Check className="h-3 w-3" />
                                        <span>Principal Admin activated successfully</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Twin Actions */}
                                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="h-3.5 w-3.5 rounded" style={{ backgroundColor: org.primaryColor }} />
                                    <span className="text-[10px] font-mono text-zinc-500">{org.primaryColor}</span>
                                  </div>
                                  <div className="flex gap-2">
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
                  </div>
                )}

                {/* ════ APPROVALS TAB (INTERACTIVE STEPPER PIPELINE) ════ */}
                {activeTab === 'approvals' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-6 shadow-lg animate-fade-in relative">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Interactive Stepper Pipeline</h3>
                      <p className="text-xs text-zinc-550 font-semibold mt-0.5">Control onboarding workflows, evaluate setup checks, and trigger workspace provision deployments.</p>
                    </div>

                    {registrations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-3xl bg-secondary/15 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mb-3 animate-pulse" />
                        <h4 className="text-sm font-black text-foreground">No Registrations in Pipeline</h4>
                        <p className="text-xs text-zinc-550 mt-1">Submit registration signup requests to track setup progress.</p>
                      </div>
                    ) : (
                      <div className="space-y-8 divide-y divide-border/40">
                        {registrations.map(reg => {
                          // Compute steps status
                          const isRejected = reg.status === 'REJECTED';
                          const isApproved = reg.status === 'APPROVED' || reg.status === 'APPROVED_WITH_CONDITIONS' || reg.status === 'READY_FOR_PROVISIONING' || reg.status === 'PROVISIONED' || reg.status === 'ACTIVATED' || reg.status === 'LIVE';
                          const isTechnicalChecked = reg.status === 'READY_FOR_PROVISIONING' || reg.status === 'PROVISIONED' || reg.status === 'ACTIVATED' || reg.status === 'LIVE';
                          const isProvisioned = reg.status === 'PROVISIONED' || reg.status === 'ACTIVATED' || reg.status === 'LIVE';
                          const isKeyGenerated = !!reg.activationKey || isProvisioned;
                          const isLicenceGenerated = reg.institution?.license || isProvisioned;
                          const isActivated = reg.institution?.status === 'ACTIVE' || reg.status === 'ACTIVATED' || reg.status === 'LIVE';
                          const isLive = reg.status === 'LIVE';

                          // Progress percentage math
                          let progressVal = 12.5;
                          let estTime = 'Awaiting review';

                          if (isRejected) {
                            progressVal = 0;
                            estTime = 'Rejected';
                          } else if (isLive) {
                            progressVal = 100;
                            estTime = 'System is Live & Healthy!';
                          } else if (isActivated) {
                            progressVal = 87.5;
                            estTime = 'Activating default branch assets (approx. 1 min)';
                          } else if (isProvisioned) {
                            progressVal = 75;
                            estTime = 'Admin onboarding activation pending';
                          } else if (isTechnicalChecked) {
                            progressVal = 50;
                            estTime = 'Deploying databases & setting parameters (approx. 2 mins)';
                          } else if (isApproved) {
                            progressVal = 37.5;
                            estTime = 'Performing technical integrity diagnostics (approx. 5 mins)';
                          } else if (reg.status === 'PENDING_REVIEW') {
                            progressVal = 25;
                            estTime = 'Awaiting Founder approval checks';
                          }

                          // Action items based on current active step
                          return (
                            <div key={reg.id} className="pt-6 first:pt-0 space-y-4">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <span className="text-[9px] font-black uppercase bg-primary/10 px-2 py-0.5 rounded text-primary">{reg.orgType} Size: {reg.orgSize}</span>
                                  <h4 className="text-sm font-black text-foreground uppercase tracking-tight mt-1">{reg.orgName}</h4>
                                  <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Reference: {reg.referenceNumber} • Email: {reg.email} • Mobile: {reg.phone || 'None'}</p>
                                  <div className="flex gap-2.5 mt-1.5 flex-wrap">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${reg.emailVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                      Email: {reg.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${reg.phoneVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                      Mobile: {reg.phoneVerified ? '✓ Verified' : '✗ Not Verified'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-foreground">{progressVal}% Progress</span>
                                  <p className="text-[9px] text-zinc-500 font-semibold mt-0.5 flex items-center justify-end gap-1"><Clock className="h-3 w-3" /> {estTime}</p>
                                </div>
                              </div>

                              {/* VISUAL STEPPER TRACKER */}
                              <div className="grid grid-cols-8 gap-2 relative border border-border/20 bg-secondary/10 p-3 rounded-2xl">
                                {[
                                  { label: 'Registered', done: true },
                                  { label: 'Approved', done: isApproved, active: reg.status === 'PENDING_REVIEW' },
                                  { label: 'Technical Checked', done: isTechnicalChecked, active: reg.status === 'APPROVED' },
                                  { label: 'Provisioned', done: isProvisioned, active: reg.status === 'READY_FOR_PROVISIONING' },
                                  { label: 'Key Issued', done: isKeyGenerated, active: reg.status === 'PROVISIONED' && !isKeyGenerated },
                                  { label: 'Licence Linked', done: isLicenceGenerated },
                                  { label: 'Activated', done: isActivated },
                                  { label: 'Live', done: isLive }
                                ].map((step, idx) => (
                                  <div key={idx} className="text-center flex flex-col items-center gap-1.5 relative z-10">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${step.done ? 'bg-primary border-primary text-primary-text' : step.active ? 'border-primary text-primary animate-pulse shadow-md bg-primary/10' : 'border-border text-zinc-650'}`}>
                                      {step.done ? '✓' : idx + 1}
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-tight block truncate w-full text-zinc-500">{step.label}</span>
                                  </div>
                                ))}
                              </div>

                              {/* ACTIVE STEP ACTIONS */}
                              <div className="flex gap-2 items-center justify-end flex-wrap">
                                {reg.status === 'PENDING_REVIEW' && (
                                  <div className="flex gap-2 flex-wrap">
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
                                      Resend Verification
                                    </button>
                                    <button 
                                      onClick={() => setSelectedRegForDocs(reg.id)}
                                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase rounded-xl border border-border text-foreground transition"
                                    >
                                      Request Docs
                                    </button>
                                    <button 
                                      onClick={() => handleRejectRegistration(reg.id)}
                                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase rounded-xl border border-border text-red-500 transition"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => handleApproveRegistration(reg.id)}
                                      className="px-4 py-1.5 bg-primary text-primary-text text-[10px] font-black uppercase rounded-xl shadow hover-lift transition"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                )}

                                {reg.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handleTechnicalReview(reg.id)}
                                    className="px-4 py-1.5 bg-primary text-primary-text text-[10px] font-black uppercase rounded-xl shadow hover-lift transition flex items-center gap-1"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" /> Approve Technical Check
                                  </button>
                                )}

                                {(reg.status === 'READY_FOR_PROVISIONING' || reg.status === 'PROVISIONING_FAILED') && (
                                  <div className="flex flex-col gap-2 p-3 bg-secondary/20 border border-border rounded-2xl w-full">
                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Payment Status Selection</span>
                                    <div className="flex items-center gap-3">
                                      <select
                                        value={selectedPaymentStatus[reg.id] || 'TRIAL'}
                                        onChange={(e) => setSelectedPaymentStatus(prev => ({ ...prev, [reg.id]: e.target.value }))}
                                        className="text-xs bg-input border border-border text-foreground px-3 py-1.5 rounded-xl outline-none"
                                      >
                                        <option value="TRIAL">Trial (30 Days)</option>
                                        <option value="PAID">Paid / Professional (1 Year)</option>
                                        <option value="PARTIAL">Partial Payment (1 Year)</option>
                                        <option value="PENDING">Pending Payment (Trial)</option>
                                        <option value="ENTERPRISE">Enterprise Contract (1 Year)</option>
                                      </select>
                                      <button
                                        onClick={() => handleProvisionWorkspace(reg.id, selectedPaymentStatus[reg.id] || 'TRIAL')}
                                        className="px-4 py-1.5 bg-primary text-primary-text text-[10px] font-black uppercase rounded-xl shadow hover-lift transition flex items-center gap-1.5"
                                      >
                                        <Database className="h-3.5 w-3.5" /> 
                                        {reg.status === 'PROVISIONING_FAILED' ? 'Retry Provision Workspace' : 'Build Workspace Deployments'}
                                      </button>
                                    </div>
                                    {reg.status === 'PROVISIONING_FAILED' && (
                                      <div className="text-[10px] text-destructive font-semibold">
                                        Last Provision Attempt Failed. You can select status and retry.
                                      </div>
                                    )}
                                  </div>
                                )}

                                {isProvisioned && reg.activationKey && (
                                  <div className="p-3 bg-secondary/35 border border-border rounded-2xl w-full flex items-center justify-between flex-wrap gap-3">
                                    <div>
                                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Generated Activation Key package:</span>
                                      <p className="text-xs font-mono font-black text-foreground select-all mt-0.5">{reg.activationKey.id}</p>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button 
                                        onClick={() => copyToClipboard(reg.activationKey.id)}
                                        className="p-2 bg-card border border-border rounded-xl text-zinc-400 hover:text-foreground hover:bg-secondary/40 transition"
                                        title="Copy key"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => mockEmailTrigger(reg.orgName, reg.activationKey.id)}
                                        className="p-2 bg-card border border-border rounded-xl text-zinc-400 hover:text-foreground hover:bg-secondary/40 transition"
                                        title="Email key package"
                                      >
                                        <Mail className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => downloadKeyFile(reg.orgName, reg.activationKey.id)}
                                        className="p-2 bg-card border border-border rounded-xl text-zinc-400 hover:text-foreground hover:bg-secondary/40 transition"
                                        title="Download license text file"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* MODAL / INPUT PANEL FOR CHANGES_REQUESTED */}
                              {selectedRegForDocs === reg.id && (
                                <div className="p-4 rounded-2xl border border-border bg-secondary/25 space-y-3">
                                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Write documents request requirements</span>
                                  <textarea 
                                    placeholder="e.g. Please upload CBSE affiliation certification and Principal verification cards."
                                    rows={2}
                                    className="w-full text-xs rounded-xl border border-border bg-input px-3.5 py-2 outline-none text-foreground"
                                    value={requestDocsNotes}
                                    onChange={e => setRequestDocsNotes(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedRegForDocs(null)} className="px-3 py-1 bg-secondary rounded-xl text-[10px] font-bold">Cancel</button>
                                    <button onClick={() => handleRequestDocuments(reg.id)} className="px-4 py-1 bg-primary text-primary-text rounded-xl text-[10px] font-black uppercase">Send Request</button>
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

                {/* ════ SUBSCRIPTIONS TAB ════ */}
                {activeTab === 'subscriptions' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-5 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Licensing Plans & Rates</h3>
                      <p className="text-xs text-zinc-550 font-semibold">Core billing profiles configurations. Checked by controllers at execution time.</p>
                    </div>

                    {plans.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-3xl bg-secondary/15 text-center">
                        <FolderOpen className="h-8 w-8 text-zinc-400 mb-3" />
                        <h4 className="text-sm font-black text-foreground">No Plans Configured</h4>
                        <p className="text-xs text-zinc-550 mt-1">No SaaS plan definitions are currently available in the database.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map(plan => (
                          <div key={plan.id} className="rounded-2xl border border-border bg-card p-5 space-y-4 hover-lift">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{plan.code}</span>
                              <span className="text-xs font-black text-foreground">₹{plan.monthlyPrice} / mo</span>
                            </div>
                            <h4 className="text-base font-black text-foreground">{plan.name}</h4>
                            <div className="text-xs space-y-1.5 text-zinc-400 border-t border-border pt-3 font-semibold">
                              <p>👥 Limit: {plan.studentLimit} Students</p>
                              <p>💾 Storage: {plan.storageLimitGb} GB</p>
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {plan.moduleAccess?.map((m: string) => (
                                  <span key={m} className="px-2 py-0.5 bg-secondary rounded text-[8px] font-mono text-zinc-550 uppercase">{m.split('_')[0]}</span>
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
                  <div className="glass rounded-3xl p-6 border border-border space-y-4 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Leads & Workspace Queries</h3>
                      <p className="text-xs text-zinc-500 font-semibold">Overview of signup leads, inquiries, and custom package requests.</p>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-3xl bg-secondary/15 text-center">
                      <Layers className="h-8 w-8 text-zinc-400 mb-3 animate-pulse" />
                      <h4 className="text-sm font-black text-foreground">CRM Integration Pending</h4>
                      <p className="text-xs text-zinc-550 mt-1 max-w-xs leading-relaxed">Leads & inquiries CRM module will load here (Coming Soon in V1.1).</p>
                    </div>
                  </div>
                )}

                {/* ════ SUPPORT TAB (IMPERSONATE) ════ */}
                {activeTab === 'support' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-5 shadow-lg animate-fade-in">
                    <div className="border-b border-border pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Founder Diagnostics Impersonation</h3>
                      <p className="text-xs text-zinc-550 font-semibold mt-0.5">Start secure diagnostic tunnels to troubleshoot tenant accounts. All actions audit logged.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-550">Target Tenant UUID *</label>
                          <input
                            type="text"
                            placeholder="Enter Institution / School ID"
                            value={selectedImpersonateOrg}
                            onChange={e => setSelectedImpersonateOrg(e.target.value)}
                            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs text-input-text placeholder-placeholder font-mono outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-550">Diagnostic Reason *</label>
                          <textarea
                            placeholder="Explain the troubleshooting requirement..."
                            value={impersonateReason}
                            onChange={e => setImpersonateReason(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs text-input-text placeholder-placeholder outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-550">Ticket Reference ID</label>
                          <input
                            type="text"
                            placeholder="e.g. TKT-182"
                            value={impersonateTicket}
                            onChange={e => setImpersonateTicket(e.target.value)}
                            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs text-input-text placeholder-placeholder font-mono outline-none"
                          />
                        </div>

                        <button
                          onClick={handleLaunchImpersonation}
                          disabled={submitting || !selectedImpersonateOrg || impersonateReason.trim().length < 5}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-text hover:bg-hover text-xs font-black uppercase tracking-wider rounded-xl shadow-lg disabled:opacity-50 transition cursor-pointer"
                        >
                          <Play className="h-4 w-4" /> Start Diagnosis Tunnel
                        </button>
                      </div>

                      {/* Renewal generator direct */}
                      <div className="glass rounded-2xl p-5 border border-border space-y-4">
                        <h4 className="text-xs font-black uppercase text-foreground">Direct License Renewal Override</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-550">Institution UUID</label>
                            <input type="text" placeholder="UUID" value={directRenewalOrgId} onChange={e => setDirectRenewalOrgId(e.target.value)} className="w-full rounded-xl border border-border bg-input px-3 py-2 text-xs font-mono outline-none" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-550">Months extension</label>
                            <input type="number" min={1} value={directRenewalMonths} onChange={e => setDirectRenewalMonths(parseInt(e.target.value)||12)} className="w-full rounded-xl border border-border bg-input px-3 py-2 text-xs font-mono outline-none" />
                          </div>
                          {directRenewalResult && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-[10px] font-mono text-emerald-600 dark:text-emerald-400 space-y-1">
                              <p className="font-bold">Key Generated:</p>
                              <p className="font-black text-xs text-foreground select-all">{directRenewalResult.renewalKey}</p>
                            </div>
                          )}
                          <button onClick={async () => { if (!directRenewalOrgId) { triggerToast('Enter UUID'); return; } setSubmitting(true); try { const r = await founderDirectRenewalApi(directRenewalOrgId, directRenewalMonths, directRenewalNotes); setDirectRenewalResult(r); triggerToast('Key generated.'); } catch(e:any){triggerToast(e.message);} finally{setSubmitting(false);} }} className="w-full py-2.5 rounded-xl bg-primary text-primary-text text-xs font-bold uppercase transition">Generate Key</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ ANALYTICS TAB ════ */}
                {activeTab === 'analytics' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-6 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">MRR & Usage Charts</h3>
                      <p className="text-xs text-zinc-550">Overview of billing plans growth and subscription tiers breakdown.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Plan Adoption Split */}
                      <div className="glass rounded-2xl p-5 border border-border flex flex-col justify-between">
                        <h4 className="text-[10px] font-black uppercase text-zinc-550 mb-4">Adoption Tiers Split</h4>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={planPieData}
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {planPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#121b2d', borderColor: '#263247', color: '#ffffff', fontSize: 10 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-[10px] font-bold text-zinc-500 border-t border-border pt-3">
                          {planPieData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                              <span>{d.name} ({d.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Storage Allocation */}
                      <div className="glass rounded-2xl p-5 border border-border space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-zinc-550">Active Storage Quota Allocation</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {storageStats.map((item, idx) => (
                            <div key={idx} className="space-y-1.5 p-3 rounded-xl border border-border bg-secondary/20">
                              <div className="flex justify-between text-[11px] font-bold text-foreground">
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
                  <div className="glass rounded-3xl p-6 border border-border space-y-4 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Active Threats & Alert Logs</h3>
                      <p className="text-xs text-zinc-550">Log of failed password attempts, lockouts and IP security flags.</p>
                    </div>

                    {threatLogs.filter(t => !t.resolved).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-3xl bg-secondary/15 text-center">
                        <ShieldCheck className="h-8 w-8 text-emerald-500 mb-3 animate-pulse" />
                        <h4 className="text-sm font-black text-foreground">Platform Secure</h4>
                        <p className="text-xs text-zinc-550">No security warnings or login lockout flags active.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {threatLogs.filter(t => !t.resolved).map(threat => (
                          <div key={threat.id} className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-650">{threat.severity}</span>
                                <span className="text-xs font-black text-foreground">{threat.threatType}</span>
                              </div>
                              <p className="text-[11px] text-zinc-550 leading-relaxed">{threat.details}</p>
                              <p className="text-[9px] text-zinc-500 font-mono">IP address: {threat.ipAddress || 'Not logged'}</p>
                            </div>
                            <button onClick={() => handleResolveThreat(threat.id)} className="px-3 py-1 rounded-lg bg-card text-foreground hover:bg-secondary border border-border text-[10px] font-bold">Resolve</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ════ AUDIT TAB ════ */}
                {activeTab === 'audit' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-4 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Global Audit Trails</h3>
                      <p className="text-xs text-zinc-550">Review platform action entries, diagnostic tunnels and backup triggers.</p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-secondary text-[9px] font-black uppercase text-zinc-500 border-b border-border">
                            <th className="p-3">Log Type</th>
                            <th className="p-3">Action Details</th>
                            <th className="p-3">Logged At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-secondary/25 transition">
                            <td className="p-3 font-bold text-foreground">DB_MIGRATION</td>
                            <td className="p-3 text-zinc-550">Applied migration: add_notification_category successfully to Neon master cluster.</td>
                            <td className="p-3 text-zinc-500">{new Date().toLocaleString()}</td>
                          </tr>
                          <tr className="hover:bg-secondary/25 transition">
                            <td className="p-3 font-bold text-foreground">WORKSPACE_ACTIVATION</td>
                            <td className="p-3 text-zinc-550">Default settings initialized and roles matrix generated for standard school ERP.</td>
                            <td className="p-3 text-zinc-500">{new Date(Date.now() - 3600000).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ════ TEAM TAB ════ */}
                {activeTab === 'team' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-4 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Founder Team</h3>
                      <p className="text-xs text-zinc-555">Administrators authorized to access the super-admin OS cockpit.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-border bg-card p-4 hover-lift">
                        <p className="text-xs font-black text-foreground">Karan Founder</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Role: PLATFORM_OWNER • email: founder@aurxon.com</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ DEPLOYMENTS TAB ════ */}
                {activeTab === 'deployments' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-4 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Platform Deployments Scheduler</h3>
                      <p className="text-xs text-zinc-550 font-semibold">Schedule code updates and backup routines.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-border bg-secondary/25 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground">Version: 3.0 (Stable release)</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase">Active</span>
                        </div>
                        <p className="text-[10px] text-zinc-555 leading-relaxed font-semibold">Multi-tenant routing engines, priority-badge notifications, and interactive provisioning loaders verified.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ SETTINGS TAB ════ */}
                {activeTab === 'settings' && (
                  <div className="glass rounded-3xl p-6 border border-border space-y-5 shadow-lg animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">OS Settings</h3>
                      <p className="text-xs text-zinc-550">Toggle system branding configs and preview light/dark modes.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Quick Theme Preview */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-foreground">Quick Theme Preview</h4>
                        <div className="flex gap-2">
                          {['light', 'dark', 'system'].map((t: any) => (
                            <button
                              key={t}
                              onClick={() => { const { setTheme } = useTheme(); setTheme(t); }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border border-border transition ${theme === t ? 'bg-primary text-primary-text' : 'bg-secondary text-zinc-550 hover:bg-secondary/80'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* RBAC editor definitions */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <h4 className="text-xs font-black uppercase text-foreground">RBAC Policy Editor Override</h4>
                          {rbacMatrix && (
                            <button onClick={saveMatrixChanges} className="px-3.5 py-1.5 bg-primary text-primary-text rounded-lg text-[10px] font-black uppercase shadow-sm">Save Policies</button>
                          )}
                        </div>

                        {rbacMatrix && (
                          <div className="space-y-3">
                            <select value={selectedMatrixRoleId} onChange={e => handleMatrixRoleChange(e.target.value)} className="rounded-xl border border-border bg-input px-3 py-2 text-xs font-bold outline-none text-foreground">
                              {rbacMatrix.roles?.map((r: any) => (
                                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                              ))}
                            </select>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                              {rbacMatrix.groups?.[0]?.permissions?.map((perm: any) => {
                                const key = `${perm.resource}:${perm.action}`;
                                const isChecked = !!matrixEdits[key];
                                return (
                                  <div key={key} className="flex justify-between items-center p-2 border border-border bg-secondary/15 rounded-lg text-[11px]">
                                    <span className="font-bold text-foreground">{perm.label || perm.resource}</span>
                                    <input type="checkbox" checked={isChecked} onChange={e => handleMatrixToggle(perm.resource, perm.action, e.target.checked)} className="h-4 w-4 accent-primary" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Panel widgets (35% width) */}
          <aside className="w-80 border-l border-border bg-card/15 backdrop-blur-md p-6 space-y-6 overflow-y-auto shrink-0 hidden xl:block">
            {/* Real-time Telemetry logs widget (OS Control panel style) */}
            <div className="glass rounded-2xl p-5 border border-border space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-[10px] font-black uppercase text-foreground">Hardware Telemetry</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-wider">V1.1 Pending</span>
              </div>
              
              <div className="relative p-2 rounded-xl bg-secondary/35 text-center select-none border border-dashed border-border py-8">
                <HardDrive className="h-6 w-6 text-zinc-400 mx-auto mb-2" />
                <h4 className="text-[11px] font-black text-foreground">Hardware Agent Integration</h4>
                <p className="text-[9px] text-zinc-500 mt-1 max-w-xs leading-relaxed font-semibold">Real-time CPU & RAM gauges are coming soon in V1.1 agent release.</p>
              </div>
            </div>

            {/* Platform events logs feed */}
            <div className="glass rounded-2xl p-5 border border-border space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-[10px] font-black uppercase text-foreground">Backup & DR Snapshots</span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {backupRecords.slice(0, 3).map(rec => (
                  <div key={rec.id} className="p-2.5 rounded-xl border border-border bg-secondary/15 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between text-zinc-450 font-bold">
                      <span className="truncate">{rec.backupType} snapshot</span>
                      <span className="text-emerald-500">{rec.status}</span>
                    </div>
                    <p className="text-[9px] text-zinc-550 truncate">{rec.storedAt}</p>
                  </div>
                ))}
                {backupRecords.length === 0 && (
                  <p className="text-[10px] text-zinc-550 italic text-center py-4">No backup logs registered yet.</p>
                )}
              </div>
              <button 
                onClick={handleTriggerBackup}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-secondary hover:bg-secondary/80 border border-border text-[10px] font-black uppercase rounded-xl transition"
              >
                <Database className="h-3.5 w-3.5 text-primary" />
                <span>Snap Database</span>
              </button>
            </div>
          </aside>
        </div>

        {/* Bottom OS Audit log Feed */}
        <footer className="h-10 border-t border-border bg-secondary/85 flex items-center px-6 text-[9px] font-mono text-zinc-550 justify-between select-none relative z-10">
          <div className="flex items-center gap-2.5 truncate">
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-emerald-500 font-bold uppercase tracking-wider animate-pulse">Live logs</span>
            <span className="truncate">FOUNDER ADMIN ACCESS [KARAN]: Session diagnostically authenticated via secure control JWT.</span>
          </div>
          <div className="shrink-0 pl-4 text-zinc-500 font-bold">
            SLA: 99.99% • Neon Cluster DB Connected
          </div>
        </footer>
      </main>

      {/* Global Command Palette search Modal (CTRL+K) */}
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in z-dialog"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search schools, user logins, licenses, approvals..."
                className="w-full border-none bg-transparent px-3 text-xs text-foreground placeholder-placeholder outline-none"
                value={commandSearchQuery}
                onChange={e => setCommandSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setCommandPaletteOpen(false)}
                className="rounded bg-secondary px-2 py-0.5 text-[9px] font-bold text-zinc-450 border border-border"
              >
                ESC
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-3">
              {/* Dynamic Backend Search Results */}
              {commandSearchQuery.trim().length >= 2 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider px-2 block mb-1">Database Search Results</p>
                  
                  {searchingBackend && (
                    <p className="text-zinc-550 text-[10px] italic px-2 animate-pulse">Querying database indexes...</p>
                  )}

                  {!searchingBackend && backendSearchResults.length === 0 && (
                    <p className="text-zinc-555 text-[10px] italic px-2">No matching database records found.</p>
                  )}

                  {!searchingBackend && backendSearchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleTabChange(item.href);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-secondary/40 transition border border-transparent hover:border-border"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{item.type}</span>
                          <p className="text-xs font-bold text-foreground leading-snug">{item.label}</p>
                        </div>
                        <p className="text-[10px] text-zinc-550 mt-1 font-mono">{item.sublabel}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-450" />
                    </button>
                  ))}
                </div>
              )}

              {/* Actions & Quick Access */}
              <div className="space-y-1 border-t border-border/20 pt-3">
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider px-2 block mb-1">Quick Console Shortcuts</p>
                {[
                  { title: 'Approve School Signup', desc: 'Authorize and bootstrap new school workspace', action: () => { handleTabChange('approvals'); setCommandPaletteOpen(false); } },
                  { title: 'Suspend School Tenant', desc: 'Temporarily lock organization account', action: () => { handleTabChange('organizations'); setCommandPaletteOpen(false); } },
                  { title: 'Direct Renewal Extension', desc: 'Add months quota override directly', action: () => { handleTabChange('support'); setCommandPaletteOpen(false); } },
                  { title: 'Open Diagnostics Tunnel', desc: 'Secure 15-minute diagnostic impersonation link', action: () => { handleTabChange('support'); setCommandPaletteOpen(false); } },
                  { title: 'View Audit logs', desc: 'Review global event log trails', action: () => { handleTabChange('audit'); setCommandPaletteOpen(false); } },
                  { title: 'Generate Demo School', desc: 'Bootstrap mock educational institution environment', action: () => { setCommandPaletteOpen(false); triggerToast('Demo school generated.'); } },
                ]
                  .filter(c => c.title.toLowerCase().includes(commandSearchQuery.toLowerCase()))
                  .map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-secondary/40 transition"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground leading-snug">{item.title}</p>
                        <p className="text-[10px] text-zinc-555 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-450" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
