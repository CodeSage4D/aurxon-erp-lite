'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, KeyRound, ShieldCheck, Activity, Bell, Search, Database, 
  Save, Settings, User, CreditCard, ChevronRight, Menu, LogOut, CheckCircle, 
  XCircle, Play, ShieldAlert, Sparkles, RefreshCw, Layers, ArrowUpRight,
  UserCheck, HelpCircle, HardDrive
} from 'lucide-react';
import { 
  getFounderStatsApi, getRegistrationsApi, reviewRegistrationApi, 
  getFounderMetricsCurrentApi, getFounderMetricsHistoryApi, getFounderStorageStatsApi,
  getSecurityThreatsApi, resolveSecurityThreatApi, getBackupRecordsApi, triggerBackupApi,
  founderGlobalSearchApi, impersonateOrganizationApi, getBillingStatsApi,
  getPlanDefinitionsApi, createPlanDefinitionApi, getRbacMatrixApi, bulkUpdatePermissionsApi
} from '@/lib/api';

import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function FounderDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Loading states
  const [loading, setLoading] = useState(true);
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

  // Impersonation state
  const [selectedImpersonateOrg, setSelectedImpersonateOrg] = useState('');
  const [impersonateReason, setImpersonateReason] = useState('');
  const [impersonateTicket, setImpersonateTicket] = useState('');

  // Matrix edit state
  const [selectedMatrixRoleId, setSelectedMatrixRoleId] = useState('');
  const [matrixEdits, setMatrixEdits] = useState<Record<string, boolean>>({});

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    setMounted(true);
    // Verify user is super admin
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

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [regs, currMetrics, histMetrics, stor, threats, backups, bills, plns, rbac] = await Promise.all([
        getRegistrationsApi(),
        getFounderMetricsCurrentApi(),
        getFounderMetricsHistoryApi(12),
        getFounderStorageStatsApi(),
        getSecurityThreatsApi(),
        getBackupRecordsApi(),
        getBillingStatsApi(),
        getPlanDefinitionsApi(),
        getRbacMatrixApi()
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

      if (rbac?.roles?.length > 0) {
        setSelectedMatrixRoleId(rbac.roles[0].id);
        initializeMatrixEdits(rbac, rbac.roles[0].id);
      }
    } catch (err) {
      console.error('Failed to load founder data:', err);
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
      
      // Reload matrix
      const rbac = await getRbacMatrixApi();
      setRbacMatrix(rbac);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update matrix');
    } finally {
      setSubmitting(false);
    }
  };

  // Approve signup registration
  const handleApproveRegistration = async (id: string, notes?: string) => {
    setSubmitting(true);
    try {
      const result = await reviewRegistrationApi(id, 'APPROVED', notes || 'Approved via Command Center');
      triggerToast(`Provisioned successfully! Key: ${result.licenseKey}`);
      // Reload registrations and metrics
      const regs = await getRegistrationsApi();
      setRegistrations(regs);
    } catch (err: any) {
      triggerToast(err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Reject registration
  const handleRejectRegistration = async (id: string, notes?: string) => {
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'REJECTED', notes || 'Rejected during validation check');
      triggerToast('Registration rejected.');
      const regs = await getRegistrationsApi();
      setRegistrations(regs);
    } catch (err: any) {
      triggerToast(err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve Security Threat
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

  // Trigger manual system backup
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

  // Global search lookup
  const handleGlobalSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await founderGlobalSearchApi(val);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Launch Impersonation Support Session
  const handleLaunchImpersonation = async () => {
    if (!selectedImpersonateOrg) {
      triggerToast('Please select a target organization');
      return;
    }
    if (!impersonateReason || impersonateReason.trim().length < 5) {
      triggerToast('Imporsonating reason is too short');
      return;
    }

    setSubmitting(true);
    try {
      const originalToken = localStorage.getItem('aurxon_token');
      const result = await impersonateOrganizationApi(selectedImpersonateOrg, impersonateReason, impersonateTicket);
      
      // Store founder token, set impersonation keys, and reload dashboard
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

  const handleLogout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Platform Control Plane...</p>
        </div>
      </div>
    );
  }

  // Plan Distribution Pie Chart Data
  const planPieData = [
    { name: 'Trial', value: billingStats?.trialSubscriptions || 0, color: '#64748b' },
    { name: 'Professional', value: billingStats?.activeSubscriptions || 0, color: '#0284c7' },
  ];

  return (
    <div className="min-h-screen flex bg-[#060a12] text-zinc-300 font-sans relative overflow-hidden select-none">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-sky-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-sky-500/20 border border-sky-400 uppercase tracking-wide">
          <Sparkles className="h-4 w-4 text-sky-200 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      {/* Collapsible Left Sidebar */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/40 backdrop-blur-xl shrink-0 flex flex-col justify-between p-5 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-md">
              A
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-white">FOUNDER PORTAL</span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider px-2 block mb-2">Operations Center</span>
            {[
              { id: 'overview', label: 'Platform Overview', icon: Activity },
              { id: 'registrations', label: 'Pending Approvals', count: registrations.filter(r => r.status === 'PENDING_REVIEW').length, icon: UserCheck },
              { id: 'matrix', label: 'RBAC Policy Editor', icon: ShieldCheck },
              { id: 'security', label: 'Security threat logs', count: threatLogs.filter(t => !t.resolved).length, icon: ShieldAlert },
              { id: 'impersonate', label: 'Support Tunnel', icon: Play },
              { id: 'backups', label: 'Backup & DR', icon: Database },
              { id: 'plans', label: 'Licensing Definitions', icon: CreditCard },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-900/60 text-zinc-400'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {!!item.count && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${isActive ? 'bg-slate-900 text-indigo-200' : 'bg-slate-900 text-zinc-400'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-5 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-zinc-300">
              FD
            </div>
            <div>
              <p className="text-xs font-bold text-white">Founder Admin</p>
              <p className="text-[10px] text-zinc-500 font-mono">Platform Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative z-10 p-8 space-y-6">
        
        {/* Header toolbar */}
        <header className="flex justify-between items-center border-b border-slate-900 pb-5">
          <div>
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Enterprise Control Plane</span>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Founder Command Center</h1>
          </div>

          {/* Global search */}
          <div className="relative w-64 bg-slate-950/40 border border-slate-880 rounded-xl px-3.5 py-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-500 shrink-0" />
            <input 
              type="text"
              placeholder="Search tenants, orgs, users..."
              value={searchQuery}
              onChange={e => handleGlobalSearch(e.target.value)}
              className="bg-transparent text-xs text-white outline-none w-full placeholder:text-zinc-500"
            />
            
            {searchQuery && (
              <div className="absolute right-0 top-11 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1 max-h-60 overflow-y-auto">
                <p className="text-[9px] font-black uppercase text-zinc-500 px-2.5 py-1 border-b border-slate-800">Search Results</p>
                {searching ? (
                  <div className="p-3 text-center text-xs text-zinc-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setSelectedImpersonateOrg(res.id);
                        setActiveTab('impersonate');
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg text-xs transition space-y-0.5"
                    >
                      <div className="flex justify-between font-bold text-zinc-200">
                        <span>{res.label}</span>
                        <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-zinc-400 uppercase font-mono">{res.type}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{res.sublabel}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-zinc-500 italic">No matches found.</div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════════════════
            PLATFORM OVERVIEW TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Subscriptions', val: billingStats?.activeSubscriptions || 0, desc: 'Enterprise SaaS Tenants' },
                { label: 'Platform MRR', val: `₹${Number(billingStats?.mrr || 0).toLocaleString('en-IN')}`, desc: 'Monthly recurring revenue' },
                { label: 'Database Capacity', val: `${Number(metricsCurrent?.dbSizeGb || 0.05).toFixed(3)} GB`, desc: 'Active PG relational size' },
                { label: 'Average Response Time', val: `${metricsCurrent?.avgResponseMs || 45} ms`, desc: 'P95 latency performance' }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-slate-950/20 border border-slate-900 rounded-2xl p-5 shadow-lg space-y-3">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{kpi.label}</span>
                  <div className="text-xl font-black text-white">{kpi.val}</div>
                  <p className="text-[10px] text-zinc-400 font-semibold">{kpi.desc}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            {mounted && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Latency History Area Chart */}
                <div className="lg:col-span-2 bg-slate-950/20 border border-slate-900 rounded-3xl p-5 shadow-lg space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Requests Load & Latency Trends</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={metricsHistory}>
                      <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="capturedAt" tick={{ fill: '#4b5563', fontSize: 10 }} tickFormatter={time => new Date(time).toLocaleTimeString()} />
                      <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', color: '#f3f4f6', fontSize: 11 }} />
                      <Area type="monotone" dataKey="requestsPerMin" stroke="#818cf8" fillOpacity={1} fill="url(#colorLatency)" name="Requests/min" />
                      <Line type="monotone" dataKey="avgResponseMs" stroke="#38bdf8" name="Response Latency (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Plan Split Pie Chart */}
                <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-5 shadow-lg space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Plan Adoption</h3>
                  <div className="h-60 flex flex-col justify-between">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={planPieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {planPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', color: '#f3f4f6', fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs font-bold">
                      {planPieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Storage Usage & Health snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Tenant Storage snap */}
              <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Organization Storage Growth</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {storageStats.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl border border-slate-900 bg-slate-950/20">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{item.name}</span>
                        <span className="text-zinc-400">{Number(item.usedGb).toFixed(4)} GB / {item.quotaGb} GB</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full" 
                          style={{ width: `${Math.min(100, (item.usedGb / item.quotaGb) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Incidents & Threat feed */}
              <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Active Security Warnings</h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {threatLogs.filter(t => !t.resolved).length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500 font-semibold italic">No active threats logged. Security matrix verified.</div>
                  ) : (
                    threatLogs.filter(t => !t.resolved).map(threat => (
                      <div key={threat.id} className="p-3.5 rounded-xl border border-red-500/10 bg-red-500/[0.02] flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400">{threat.severity}</span>
                            <span className="text-xs font-bold text-zinc-200">{threat.threatType}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-normal">{threat.details}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">IP: {threat.ipAddress || 'Unknown'}</p>
                        </div>
                        <button 
                          onClick={() => handleResolveThreat(threat.id)}
                          className="px-3 py-1 rounded bg-slate-900 text-zinc-300 hover:text-white border border-slate-800 text-[10px] font-bold shrink-0 cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PENDING APPROVALS TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'registrations' && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-lg space-y-4 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Pending Organization Approvals</h3>
            <p className="text-xs text-zinc-400">Review organization requests. Approvals automatically bootstrap tenant databases and default RBAC templates.</p>
            
            {registrations.filter(r => r.status === 'PENDING_REVIEW').length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 italic font-semibold border border-dashed border-slate-800 rounded-2xl">
                No pending registrations to review.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registrations.filter(r => r.status === 'PENDING_REVIEW').map(reg => (
                  <div key={reg.id} className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">{reg.orgType}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Users: {reg.expectedUsers}</span>
                      </div>
                      <h4 className="text-sm font-black text-white">{reg.orgName}</h4>
                      <div className="text-xs space-y-1 text-zinc-400 font-semibold">
                        <p>✉️ {reg.email}</p>
                        <p>📞 {reg.phone}</p>
                        <p>📍 {[reg.city, reg.state].filter(Boolean).join(', ') || 'Address not listed'}</p>
                      </div>
                      {reg.requestedModules?.length > 0 && (
                        <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-1">
                          {reg.requestedModules.map((m: string) => (
                            <span key={m} className="px-2 py-0.5 bg-slate-900 rounded text-[9px] font-mono text-zinc-500 font-bold uppercase">{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-900 flex gap-2">
                      <button
                        onClick={() => handleApproveRegistration(reg.id)}
                        disabled={submitting}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectRegistration(reg.id)}
                        disabled={submitting}
                        className="flex-1 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold uppercase border border-red-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            RBAC POLICY MATRIX TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'matrix' && rbacMatrix && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-lg space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Global Role-Permission Matrix</h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Toggle default access policies for active roles within the tenant layer.</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedMatrixRoleId} 
                  onChange={e => handleMatrixRoleChange(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  {rbacMatrix.roles?.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
                <button
                  onClick={saveMatrixChanges}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 transition cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Policies
                </button>
              </div>
            </div>

            {/* Matrix Editor grid */}
            <div className="space-y-6">
              {rbacMatrix.groups?.map((group: any) => (
                <div key={group.id} className="rounded-2xl border border-slate-900 p-5 space-y-3">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-2">{group.label}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.permissions?.map((perm: any) => {
                      const key = `${perm.resource}:${perm.action}`;
                      const isChecked = !!matrixEdits[key];
                      return (
                        <div key={key} className="flex items-start justify-between p-3 rounded-xl border border-slate-900/50 bg-slate-950/10 hover:bg-slate-950/30 transition-all select-none">
                          <div className="space-y-1 pr-4">
                            <p className="text-xs font-bold text-zinc-200">{perm.label || perm.resource}</p>
                            <p className="text-[10px] text-zinc-500 leading-normal">{perm.description || `Action: ${perm.action}`}</p>
                          </div>
                          <div className="flex items-center pt-0.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleMatrixToggle(perm.resource, perm.action, e.target.checked)}
                              className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 accent-indigo-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            SECURITY Center TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-lg space-y-4 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Platform Security Operations Center</h3>
            <p className="text-xs text-zinc-400">Observe active network anomalies, failed login lockouts, and suspicious geolocation queries.</p>
            
            <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/10">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-slate-900">
                    <th className="p-3.5">Threat Level</th>
                    <th className="p-3.5">Threat Category</th>
                    <th className="p-3.5">Source IP</th>
                    <th className="p-3.5 font-bold">Event Details</th>
                    <th className="p-3.5">Logged At</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {threatLogs.map(threat => (
                    <tr key={threat.id} className="hover:bg-slate-950/30 transition">
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${threat.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : threat.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {threat.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-zinc-200">{threat.threatType}</td>
                      <td className="p-3.5 font-mono text-zinc-500">{threat.ipAddress || '—'}</td>
                      <td className="p-3.5 text-zinc-400 font-semibold max-w-xs truncate">{threat.details}</td>
                      <td className="p-3.5 text-zinc-500">{new Date(threat.createdAt).toLocaleString()}</td>
                      <td className="p-3.5">
                        {threat.resolved ? (
                          <span className="text-[10px] text-emerald-500 font-black uppercase">Resolved</span>
                        ) : (
                          <button
                            onClick={() => handleResolveThreat(threat.id)}
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            IMPERSONATION SUPPORT TUNNEL TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'impersonate' && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-lg space-y-4 animate-fade-in max-w-xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Founder Impersonation Gateway</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Establish a secure 15-minute diagnostic session to view an organization workspace in read-only diagnostics mode. All actions are logged under the platform audit trail.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Target Tenant / Organization ID</label>
                <input
                  type="text"
                  placeholder="Select or enter Institution ID"
                  value={selectedImpersonateOrg}
                  onChange={e => setSelectedImpersonateOrg(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Impersonation Diagnostic Reason *</label>
                <textarea
                  placeholder="Explain diagnostic reason (e.g. debug spreadsheet upload failure on CBSE grading scheme)"
                  value={impersonateReason}
                  onChange={e => setImpersonateReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Support Ticket Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TKT-2940-CBSE"
                  value={impersonateTicket}
                  onChange={e => setImpersonateTicket(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleLaunchImpersonation}
                disabled={submitting || !selectedImpersonateOrg || impersonateReason.trim().length < 5}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg disabled:opacity-50 transition cursor-pointer"
              >
                <Play className="h-4 w-4" /> Start Diagnosis Session
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            BACKUP & DR TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'backups' && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-lg space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">System Backup & DR Logs</h3>
                <p className="text-xs text-zinc-400">Trigger manual system snapshots or restore database templates.</p>
              </div>
              <button
                onClick={handleTriggerBackup}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                <Database className="h-4 w-4" /> Trigger System Backup
              </button>
            </div>

            <div className="space-y-4">
              {backupRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 italic">No backup records logged.</div>
              ) : (
                <div className="space-y-3">
                  {backupRecords.map(rec => (
                    <div key={rec.id} className="p-4 rounded-2xl border border-slate-900 bg-slate-950/30 flex justify-between items-center gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${rec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {rec.status}
                          </span>
                          <span className="text-xs font-bold text-zinc-200">{rec.backupType} Backup ({rec.sizeGb} GB)</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">Location: {rec.storedAt}</p>
                        {rec.notes && <p className="text-[11px] text-zinc-400 italic">Note: {rec.notes}</p>}
                      </div>
                      <div className="text-right text-[10px] text-zinc-500 font-mono">
                        <p>Created: {new Date(rec.createdAt).toLocaleString()}</p>
                        <p>Expires: {new Date(rec.expiresAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            LICENSING DEFINITIONS TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'plans' && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-lg space-y-5 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">SaaS Plans & Licensing Definitions</h3>
            <p className="text-xs text-zinc-400">Establish core parameters for billing plans. Limits are checked in API controllers at execution time.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{plan.code}</span>
                    <span className="text-xs font-black text-white">₹{plan.monthlyPrice} / mo</span>
                  </div>
                  <h4 className="text-base font-black text-white">{plan.name}</h4>
                  
                  <div className="text-xs space-y-1.5 text-zinc-400 border-t border-slate-900 pt-3 font-semibold">
                    <p>👥 Capacity: {plan.studentLimit} Students</p>
                    <p>💾 Storage Limit: {plan.storageLimitGb} GB</p>
                    <div className="pt-1 flex flex-wrap gap-1">
                      {plan.moduleAccess?.map((m: string) => (
                        <span key={m} className="px-2 py-0.5 bg-slate-900 rounded text-[9px] font-mono text-zinc-500 uppercase">{m.split('_')[0]}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
