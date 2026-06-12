'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, KeyRound, ShieldCheck, Activity, Bell, Search, Database, 
  Save, Settings, User, CreditCard, ChevronRight, Menu, LogOut, CheckCircle, 
  XCircle, Play, ShieldAlert, Sparkles, RefreshCw, Layers, ArrowUpRight,
  UserCheck, HelpCircle, HardDrive, ShieldAlert as AlertIcon, Plus, Calendar
} from 'lucide-react';
import { 
  getRegistrationsApi, reviewRegistrationApi, 
  getSecurityThreatsApi, resolveSecurityThreatApi, getBackupRecordsApi, triggerBackupApi,
  founderGlobalSearchApi, impersonateOrganizationApi, getPlanDefinitionsApi, 
  createPlanDefinitionApi, getTeamsDashboardLayoutApi, getTeamsDashboardStatsApi, 
  getTeamsMemberProfileApi, technicalReviewRegistrationApi, provisionWorkspaceApi
} from '@/services/api';

import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ROLE_LABELS: Record<string, string> = {
  FOUNDER: 'Founder & Co-CEO',
  CO_FOUNDER: 'Co-Founder',
  PLATFORM_DIRECTOR: 'Platform Director',
  PRODUCT_MANAGER: 'Product Director',
  SUPPORT_MANAGER: 'Customer Support Manager',
  SALES_MANAGER: 'Sales Director',
  CUSTOMER_SUCCESS_MANAGER: 'Client Success Manager',
  FINANCE_MANAGER: 'Chief Financial Officer',
  TECHNICAL_ADMINISTRATOR: 'Technical Operations Admin'
};

const ALLOWED_TABS_MAP: Record<string, string[]> = {
  FOUNDER: ['overview', 'registrations', 'deployments', 'orgs', 'security', 'impersonate', 'backups', 'plans'],
  CO_FOUNDER: ['overview', 'registrations', 'deployments', 'orgs', 'security', 'impersonate', 'backups', 'plans'],
  PLATFORM_DIRECTOR: ['overview', 'registrations', 'deployments', 'orgs', 'security', 'impersonate', 'backups', 'plans'],
  PRODUCT_MANAGER: ['overview', 'plans'],
  SUPPORT_MANAGER: ['overview', 'security', 'impersonate', 'backups'],
  SALES_MANAGER: ['overview', 'registrations', 'orgs'],
  CUSTOMER_SUCCESS_MANAGER: ['overview', 'registrations', 'orgs'],
  FINANCE_MANAGER: ['overview', 'billing'],
  TECHNICAL_ADMINISTRATOR: ['overview', 'deployments', 'security', 'backups']
};

export default function TeamsDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Member profile & role info
  const [teamMember, setTeamMember] = useState<any>(null);
  const [teamRole, setTeamRole] = useState<string>('');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Telemetry statistics
  const [telemetry, setTelemetry] = useState<any>(null);
  const [historyMetrics, setHistoryMetrics] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [threatLogs, setThreatLogs] = useState<any[]>([]);
  const [backupRecords, setBackupRecords] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<any>(null);

  // New Plan Creation
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    code: '', name: '', monthlyPrice: 4999, studentLimit: 250, storageLimitGb: 5, moduleAccess: ['STUDENT_MANAGEMENT']
  });

  // Impersonation state
  const [selectedImpersonateOrg, setSelectedImpersonateOrg] = useState('');
  const [impersonateReason, setImpersonateReason] = useState('');
  const [impersonateTicket, setImpersonateTicket] = useState('');

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
    
    // Verify user credentials
    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/teams/login');
      return;
    }
    
    const user = JSON.parse(cached);
    if (!user.teamRole) {
      router.push('/login'); // Redirect standard users to default login
      return;
    }

    setTeamRole(user.teamRole);
    loadDashboardData(user.teamRole);
  }, []);

  const loadDashboardData = async (role: string) => {
    setLoading(true);
    try {
      // Fetch dynamic layout and dashboard stats
      const [profile, layout, stats, plansList] = await Promise.all([
        getTeamsMemberProfileApi(),
        getTeamsDashboardLayoutApi(),
        getTeamsDashboardStatsApi(),
        getPlanDefinitionsApi().catch(() => [])
      ]);

      setTeamMember(profile);
      setLayoutConfig(layout);
      setTelemetry(stats);
      setPlans(plansList);

      // Verify if current active tab is allowed, if not fallback to overview
      const allowed = ALLOWED_TABS_MAP[role] || ['overview'];
      if (!allowed.includes(activeTab)) {
        setActiveTab('overview');
      }

      // Fetch role-specific subsets
      if (allowed.includes('registrations')) {
        const regs = await getRegistrationsApi();
        setRegistrations(regs);
      }
      if (allowed.includes('security')) {
        const threats = await getSecurityThreatsApi();
        setThreatLogs(threats);
      }
      if (allowed.includes('backups')) {
        const backups = await getBackupRecordsApi();
        setBackupRecords(backups);
      }

    } catch (err) {
      console.error('Failed to load Teams Control telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRegistration = async (id: string) => {
    setSubmitting(true);
    try {
      const result = await reviewRegistrationApi(id, 'APPROVED', 'Approved by Teams Control Center');
      triggerToast(`Provisioned successfully! Key: ${result.licenseKey}`);
      // Refresh
      const regs = await getRegistrationsApi();
      setRegistrations(regs);
      const stats = await getTeamsDashboardStatsApi();
      setTelemetry(stats);
    } catch (err: any) {
      triggerToast(err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRegistration = async (id: string) => {
    setSubmitting(true);
    try {
      await reviewRegistrationApi(id, 'REJECTED', 'Rejected during registration checks.');
      triggerToast('Registration rejected.');
      // Refresh
      const regs = await getRegistrationsApi();
      setRegistrations(regs);
      const stats = await getTeamsDashboardStatsApi();
      setTelemetry(stats);
    } catch (err: any) {
      triggerToast(err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveThreat = async (id: string) => {
    try {
      await resolveSecurityThreatApi(id);
      triggerToast('Anomaly resolved successfully.');
      const threats = await getSecurityThreatsApi();
      setThreatLogs(threats);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to resolve threat log');
    }
  };

  const handleTriggerBackup = async () => {
    try {
      await triggerBackupApi('Manual snapshot triggered from Teams Dashboard console.');
      triggerToast('Backup process initialized.');
      setTimeout(async () => {
        const backups = await getBackupRecordsApi();
        setBackupRecords(backups);
      }, 2100);
    } catch (err: any) {
      triggerToast('Failed to trigger backup process');
    }
  };

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

  const handleLaunchImpersonation = async () => {
    if (!selectedImpersonateOrg) return;
    if (!impersonateReason || impersonateReason.trim().length < 5) {
      triggerToast('Please write a detailed impersonation reason.');
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
      triggerToast(err.message || 'Impersonation tunnel failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPlanDefinitionApi(newPlan);
      triggerToast('Custom pricing plan definition created successfully.');
      setShowAddPlan(false);
      const plns = await getPlanDefinitionsApi();
      setPlans(plns);
    } catch (err) {
      triggerToast('Failed to create new plan definition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    router.push('/teams/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-pink-500 animate-spin mx-auto" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Synchronizing SaaS Control Plane...</p>
        </div>
      </div>
    );
  }

  const allowedTabs = ALLOWED_TABS_MAP[teamRole] || ['overview'];

  // Plan Distribution Pie Chart Data
  const planPieData = [
    { name: 'Professional Plan', value: telemetry?.billing?.activeSubscriptions || 0, color: '#ec4899' },
    { name: 'Trial Workspace', value: telemetry?.billing?.trialSubscriptions || 0, color: '#f59e0b' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex relative overflow-hidden select-none">
      
      {/* Background decoration elements */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-pink-500/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* Toast Alert popup */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 text-xs font-black text-white shadow-xl animate-fade-in uppercase tracking-widest">
          <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      {/* Collapsible Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shrink-0 flex flex-col justify-between p-5 relative z-10">
        <div className="space-y-6">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-1">
            <div className="h-9 w-9 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shadow-pink-500/10">
              A
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-800 uppercase">AURXON</p>
              <p className="text-[9px] font-black uppercase text-pink-500 tracking-wider">Teams Control</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-2 block mb-2">Control Desks</span>
            
            {[
              { id: 'overview', label: 'Telemetry Overview', icon: Activity },
              { id: 'registrations', label: 'Pending Approvals', count: registrations.filter(r => r.status === 'PENDING_REVIEW').length, icon: UserCheck },
              { id: 'deployments', label: 'Deployment Queue', count: registrations.filter(r => r.status === 'APPROVED').length, icon: HardDrive },
              { id: 'orgs', label: 'Client Directory', icon: Building2 },
              { id: 'security', label: 'Security Threats Log', count: threatLogs.filter(t => !t.resolved).length, icon: ShieldAlert },
              { id: 'impersonate', label: 'Support Impersonation', icon: Play },
              { id: 'backups', label: 'Backup & Recovery', icon: Database },
              { id: 'plans', label: 'Pricing Definitions', icon: CreditCard },
              { id: 'billing', label: 'Billing & Invoices', icon: Sparkles }
            ].filter(item => allowedTabs.includes(item.id)).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-2xl transition duration-200 ${isActive ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-md shadow-pink-500/10' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {!!item.count && (
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Card & Logout */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-1">
            {/* Premium enterprise avatar outline */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5">
              <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-xs font-black text-slate-700">
                {teamMember?.user?.email?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">{teamMember?.user?.email?.split('@')[0]}</p>
              <p className="text-[9px] text-slate-400 font-semibold truncate uppercase">{ROLE_LABELS[teamRole] || teamRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Console Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10 flex flex-col">
        
        {/* Header bar */}
        <header className="relative z-40 flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <span className="text-[9px] font-black uppercase text-pink-500 tracking-wider">Console Security Workspace</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Teams Dashboard</h1>
          </div>

          {/* Global search */}
          <div className="relative w-64 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 flex items-center gap-2 focus-within:border-pink-500 transition duration-200">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={e => handleGlobalSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400 font-semibold"
            />
            {searchQuery && (
              <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1 max-h-60 overflow-y-auto">
                <p className="text-[9px] font-black uppercase text-slate-400 px-2.5 py-1 border-b border-slate-100">Workspaces & Logins</p>
                {searching ? (
                  <div className="p-3 text-center text-xs text-slate-400">Searching DB...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setSelectedImpersonateOrg(res.id);
                        setActiveTab('impersonate');
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-xl text-xs transition duration-200 space-y-0.5"
                    >
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{res.label}</span>
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-500 uppercase font-mono">{res.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{res.sublabel}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 italic">No matches found.</div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════════════════
            TELEMETRY OVERVIEW TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Active Organizations', val: telemetry?.overview?.activeOrganizations || 0, desc: 'Live Multi-Tenant Workspaces' },
                { label: 'Platform Monthly Cost', val: `₹${Number(telemetry?.billing?.mrr || 0).toLocaleString('en-IN')}`, desc: 'Total MRR subscription collections' },
                { label: 'Provision Approvals', val: telemetry?.overview?.registrationsCount || 0, desc: 'Pending visitor signups review' },
                { label: 'Active Security Incidents', val: telemetry?.overview?.threatsCount || 0, desc: 'Unresolved threat logs recorded' }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-pink-500 via-red-500 to-yellow-500" />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{kpi.label}</span>
                  <div className="text-2xl font-black text-slate-800">{kpi.val}</div>
                  <p className="text-[10px] text-slate-500 font-semibold">{kpi.desc}</p>
                </div>
              ))}
            </div>

            {/* Dynamic layout engine showcase sections */}
            {layoutConfig?.sections?.map((section: any, secIdx: number) => (
              <div key={secIdx} className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{section.title}</h3>
                
                <div className={`grid grid-cols-1 lg:grid-cols-${section.gridCols} gap-6`}>
                  {section.widgets?.map((widget: any, widIdx: number) => {
                    
                    // Render KPI Widget
                    if (widget.type === 'kpi') {
                      return (
                        <div key={widIdx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{widget.title}</span>
                          <div className="text-xl font-black text-slate-800">
                            {widget.isCurrency ? '₹' : ''}
                            {widget.value || (widget.valuePath && widget.valuePath.split('.').reduce((o: any, i: string) => o?.[i], telemetry)) || '0'}
                            {widget.isPercentage ? '%' : ''}
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold">Consolidated Telemetry Data</p>
                        </div>
                      );
                    }

                    // Render Chart Widget
                    if (widget.type === 'chart' && mounted) {
                      return (
                        <div key={widIdx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 col-span-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">{widget.title}</h4>
                          <div className="h-60">
                            {widget.chartType === 'area' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{capturedAt: '01:00', requestsPerMin: 124}, {capturedAt: '02:00', requestsPerMin: 184}, {capturedAt: '03:00', requestsPerMin: 142}, {capturedAt: '04:00', requestsPerMin: 210}, {capturedAt: '05:00', requestsPerMin: 285}]}>
                                  <defs>
                                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                  <XAxis dataKey="capturedAt" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: 11 }} />
                                  <Area type="monotone" dataKey="requestsPerMin" stroke="#ec4899" fillOpacity={1} fill="url(#colorArea)" name="Requests/min" />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}

                            {widget.chartType === 'pie' && (
                              <div className="h-full flex flex-col justify-between">
                                <ResponsiveContainer width="100%" height="80%">
                                  <PieChart>
                                    <Pie
                                      data={planPieData}
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      {planPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: 11 }} />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 text-[10px] font-bold">
                                  {planPieData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                      <span>{d.name} ({d.value})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}

            {/* Storage growth snapshots */}
            {allowedTabs.includes('orgs') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Workspace Storage Volumes</h3>
                  <div className="space-y-3.5 max-h-60 overflow-y-auto">
                    {telemetry?.storageStats?.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-1.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/30">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{item.name}</span>
                          <span className="text-slate-500">{Number(item.usedGb).toFixed(4)} GB / {item.quotaGb} GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 rounded-full" 
                            style={{ width: `${Math.min(100, (item.usedGb / item.quotaGb) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">SaaS Administrative Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setActiveTab('registrations')}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-pink-500/20 hover:bg-slate-50 transition text-left space-y-1.5 hover-lift"
                    >
                      <UserCheck className="h-5 w-5 text-pink-500" />
                      <p className="text-xs font-black text-slate-800">Pending Signups</p>
                      <p className="text-[10px] text-slate-400">Review visitor registrations</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('impersonate')}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-pink-500/20 hover:bg-slate-50 transition text-left space-y-1.5 hover-lift"
                    >
                      <Play className="h-5 w-5 text-indigo-500" />
                      <p className="text-xs font-black text-slate-800">Diagnostics Tunnel</p>
                      <p className="text-[10px] text-slate-400">Secure tenant impersonation</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PENDING APPROVALS TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'registrations' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Pending Registrations reviewer</h3>
            <p className="text-xs text-slate-400">Review new signup requests from public visitors. Approval automatically registers default schemas and license metrics.</p>

            {registrations.filter(r => r.status === 'PENDING_REVIEW').length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 italic font-semibold border border-dashed border-slate-200 rounded-2xl">
                No pending registrations to review.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {registrations.filter(r => r.status === 'PENDING_REVIEW').map(reg => (
                  <div key={reg.id} className="rounded-3xl border border-slate-200 bg-slate-50/30 p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase bg-pink-100 px-2.5 py-1 rounded-lg text-pink-600">{reg.orgType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Size: {reg.orgSize || 'SMALL'}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800">{reg.orgName}</h4>
                      <div className="text-xs space-y-1 text-slate-500 font-semibold">
                        <p>✉️ {reg.email}</p>
                        <p>📞 {reg.phone}</p>
                        <p>📍 {[reg.city, reg.state].filter(Boolean).join(', ')}</p>
                      </div>
                      {reg.requestedModules?.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                          {reg.requestedModules.map((m: string) => (
                            <span key={m} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono text-slate-400 font-bold uppercase">{m.replace('_', ' ')}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex gap-2">
                      <button
                        onClick={() => handleApproveRegistration(reg.id)}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-xs font-black uppercase transition duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-pink-500/10"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRegistration(reg.id)}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase border border-slate-200 transition duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            ORGANIZATION REGISTRY TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orgs' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Organization registry database</h3>
            <p className="text-xs text-slate-400">View and manage all active client organization workspaces across multi-tenant contexts.</p>
            
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <th className="p-3.5">Organization Name</th>
                    <th className="p-3.5">Workspace Pack</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Registration ID</th>
                    <th className="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {telemetry?.storageStats?.map((org: any) => (
                    <tr key={org.institutionId} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-bold text-slate-800">{org.name}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-lg uppercase">
                          {org.industryPackCode || 'SCHOOL_ERP'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-600">
                          Active
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{org.institutionId.slice(0, 8)}...</td>
                      <td className="p-3.5 text-slate-400">June 5, 2026</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            SECURITY THREAT LOGS TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Security Operations Intrusion alerts</h3>
            <p className="text-xs text-slate-400">Observe security Lockouts, IP geolocation queries, and escalate suspicious access records.</p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <th className="p-3.5">Threat Level</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Source IP</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {threatLogs.map(threat => (
                    <tr key={threat.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${threat.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          {threat.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{threat.threatType}</td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{threat.details}</td>
                      <td className="p-3.5 font-mono text-slate-400">{threat.ipAddress || '—'}</td>
                      <td className="p-3.5">
                        {threat.resolved ? (
                          <span className="text-[10px] text-emerald-500 font-black uppercase">Resolved</span>
                        ) : (
                          <button
                            onClick={() => handleResolveThreat(threat.id)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-[10px] font-bold cursor-pointer"
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
            SUPPORT IMPERSONATION TUNNEL TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'impersonate' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in max-w-xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Diagnostics impersonation portal</h3>
            <p className="text-xs text-slate-400">Launch a secure 15-minute diagnostic session to view the workspace as an active tenant administrator.</p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Target Organization / Tenant ID</label>
                <input
                  type="text"
                  placeholder="Paste Organization ID..."
                  value={selectedImpersonateOrg}
                  onChange={e => setSelectedImpersonateOrg(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-800 outline-none focus:border-pink-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Impersonation Reason *</label>
                <textarea
                  placeholder="Explain diagnostic reason..."
                  value={impersonateReason}
                  onChange={e => setImpersonateReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-800 outline-none focus:border-pink-500 transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Support Ticket Reference</label>
                <input
                  type="text"
                  placeholder="e.g. TKT-2940-HOSP"
                  value={impersonateTicket}
                  onChange={e => setImpersonateTicket(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-800 outline-none focus:border-pink-500 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleLaunchImpersonation}
                disabled={submitting || !selectedImpersonateOrg || impersonateReason.trim().length < 5}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-500/20 disabled:opacity-50 cursor-pointer"
              >
                Launch Support Tunnel
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            BACKUP & RECOVERY TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'backups' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Backup snapshots recovery log</h3>
                <p className="text-xs text-slate-400">Trigger manual system data snapshots or download recent log outputs.</p>
              </div>
              <button
                onClick={handleTriggerBackup}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-pink-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Trigger Backup
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <th className="p-3.5">Backup Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Size (GB)</th>
                    <th className="p-3.5">Destination Bucket</th>
                    <th className="p-3.5">Triggered By</th>
                    <th className="p-3.5">Triggered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {backupRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-bold text-slate-800">{rec.backupType}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{rec.sizeGb} GB</td>
                      <td className="p-3.5 font-mono text-slate-400 truncate max-w-xs">{rec.storedAt}</td>
                      <td className="p-3.5 text-slate-500">{rec.triggeredBy?.email || 'System'}</td>
                      <td className="p-3.5 text-slate-400">{new Date(rec.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            LICENSING definitions TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'plans' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">SaaS Plan pricing definitions</h3>
                <p className="text-xs text-slate-400">Configure client tenant constraints including pricing, student limit, and modules access.</p>
              </div>
              <button
                onClick={() => setShowAddPlan(!showAddPlan)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-pink-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create Custom Plan
              </button>
            </div>

            {showAddPlan && (
              <form onSubmit={handleCreatePlan} className="bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-4 max-w-xl">
                <h4 className="text-xs font-black uppercase text-slate-600">New Plan Properties</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500">Plan Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STARTER_NEW"
                      value={newPlan.code}
                      onChange={e => setNewPlan(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500">Display Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Starter New Pack"
                      value={newPlan.name}
                      onChange={e => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500">Monthly Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={newPlan.monthlyPrice}
                      onChange={e => setNewPlan(prev => ({ ...prev, monthlyPrice: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500">Capacity Limit</label>
                    <input
                      type="number"
                      required
                      value={newPlan.studentLimit}
                      onChange={e => setNewPlan(prev => ({ ...prev, studentLimit: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500">Storage Quota (GB)</label>
                    <input
                      type="number"
                      required
                      value={newPlan.storageLimitGb}
                      onChange={e => setNewPlan(prev => ({ ...prev, storageLimitGb: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider"
                >
                  Save Definition
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map(p => (
                <div key={p.id} className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase bg-pink-100 px-2.5 py-1 rounded-lg text-pink-600 font-mono">{p.code}</span>
                    <h4 className="text-sm font-black text-slate-800 pt-1">{p.name}</h4>
                    <p className="text-2xl font-black text-slate-900">₹{p.monthlyPrice.toLocaleString('en-IN')}<span className="text-xs text-slate-500 font-medium">/mo</span></p>
                    <div className="text-xs space-y-1 text-slate-500 pt-2 font-semibold">
                      <p>👥 User Capacity: {p.studentLimit} max</p>
                      <p>💾 Disk Quota: {p.storageLimitGb} GB</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ DEPLOYMENT QUEUE TAB ════ */}
        {activeTab === 'deployments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Technical Deployment Queue</h3>
                  <p className="text-xs text-slate-400 mt-1">Organizations that have passed Founder review and are ready for technical verification and workspace provisioning.</p>
                </div>
                <button
                  onClick={async () => { const regs = await getRegistrationsApi(); setRegistrations(regs); triggerToast('Queue refreshed.'); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>

              {/* Awaiting Technical Review */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Awaiting Technical Verification</h4>
                {registrations.filter(r => r.status === 'APPROVED').length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium italic border border-dashed border-slate-200 rounded-2xl">No registrations pending technical verification.</div>
                ) : (
                  <div className="space-y-3">
                    {registrations.filter(r => r.status === 'APPROVED').map((reg: any) => (
                      <div key={reg.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-800">{reg.orgName}</p>
                            <p className="text-[10px] font-mono text-pink-500">{reg.referenceNumber}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{reg.industryPackCode} · {reg.city}, {reg.state}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{reg.email}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-200 shrink-0">Approved</span>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={async () => {
                              setSubmitting(true);
                              try {
                                await technicalReviewRegistrationApi(reg.id, 'Technical verification completed by platform team.');
                                triggerToast('Technical review completed. Ready for provisioning.');
                                const regs = await getRegistrationsApi();
                                setRegistrations(regs);
                              } catch (err: any) { triggerToast(err.message); }
                              finally { setSubmitting(false); }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[10px] font-black text-blue-600 hover:bg-blue-100 transition"
                          >
                            ✓ Mark Technical Verified
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ready for Provisioning */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Ready for Workspace Provisioning</h4>
                {registrations.filter(r => r.status === 'READY_FOR_PROVISIONING').length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium italic border border-dashed border-slate-200 rounded-2xl">No workspaces queued for provisioning.</div>
                ) : (
                  <div className="space-y-3">
                    {registrations.filter(r => r.status === 'READY_FOR_PROVISIONING').map((reg: any) => (
                      <div key={reg.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-800">{reg.orgName}</p>
                            <p className="text-[10px] font-mono text-pink-500">{reg.referenceNumber}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{reg.industryPackCode} · {reg.orgSize}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-200 shrink-0">Ready</span>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-emerald-100">
                          <button
                            onClick={async () => {
                              setSubmitting(true);
                              try {
                                const result = await provisionWorkspaceApi(reg.id);
                                triggerToast(`Workspace provisioned! Key: ${result.activationKey || result.rawKey || 'Generated'}`);
                                const regs = await getRegistrationsApi();
                                setRegistrations(regs);
                              } catch (err: any) { triggerToast(err.message); }
                              finally { setSubmitting(false); }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 text-[10px] font-black text-white hover:bg-emerald-600 transition shadow-sm"
                          >
                            🚀 Provision Workspace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recently Provisioned */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Recently Provisioned (Live)</h4>
                {registrations.filter(r => r.status === 'PROVISIONED' || r.status === 'LIVE').length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium italic">No provisioned workspaces yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {registrations.filter(r => r.status === 'PROVISIONED' || r.status === 'LIVE').map((reg: any) => (
                      <div key={reg.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-slate-800">{reg.orgName}</p>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-sky-50 text-sky-600 border border-sky-200">{reg.status}</span>
                        </div>
                        <p className="text-[10px] font-mono text-pink-500">{reg.referenceNumber}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{reg.industryPackCode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
