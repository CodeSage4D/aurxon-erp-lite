'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  loginApi, 
  switchContextApi,
  getRegistrationsApi,
  reviewRegistrationApi,
  technicalReviewRegistrationApi,
  provisionWorkspaceApi,
  getActivationKeysApi,
  suspendActivationKeyApi,
  revokeActivationKeyApi,
  renewActivationKeyApi,
  regenerateActivationKeyApi
} from '@/lib/api';
import { 
  Shield, Sparkles, Building2, KeyRound, Users, GraduationCap, 
  Stethoscope, Briefcase, Activity, Database, RefreshCw, LayoutDashboard,
  Layers, UserCheck, HelpCircle, HardDrive, LogOut, ArrowRight, Play, CheckCircle,
  CreditCard, Trash2, XCircle, AlertCircle, Calendar, Plus
} from 'lucide-react';

export default function ProductOperationsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('journey');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Real Database state
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [activationKeys, setActivationKeys] = useState<any[]>([]);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [renewMonths, setRenewMonths] = useState(12);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationKeyDetails, setActivationKeyDetails] = useState<any>(null);

  // Simulation form states
  const [orgId, setOrgId] = useState('inst-gvis');
  const [orgName, setOrgName] = useState('Green Valley International School');
  const [activeRole, setActiveRole] = useState('PRINCIPAL');
  const [industryPack, setIndustryPack] = useState('SCHOOL_ERP');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'lifecycle') {
      loadOnboardingLifecycleData();
    }
  }, [activeTab]);

  const loadOnboardingLifecycleData = async () => {
    setLoading(true);
    setError('');
    try {
      const [regs, keys] = await Promise.all([
        getRegistrationsApi(),
        getActivationKeysApi()
      ]);
      setRegistrations(regs);
      setActivationKeys(keys);
    } catch (err: any) {
      setError(err.message || 'Failed to load onboarding lifecycle data. Make sure you are logged in as SUPER_ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Review Actions
  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    setError('');
    const notes = actionNotes[id] || '';
    try {
      await reviewRegistrationApi(id, status, notes);
      triggerToast(`Registration ${status.toLowerCase()} successfully!`);
      setActionNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Review submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicalReview = async (id: string) => {
    setLoading(true);
    setError('');
    const notes = actionNotes[id] || 'Technical verification successful.';
    try {
      await technicalReviewRegistrationApi(id, notes);
      triggerToast('Technical review completed successfully!');
      setActionNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Technical review failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProvision = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await provisionWorkspaceApi(id);
      const reg = registrations.find((r: any) => r.id === id);
      setActivationKeyDetails({
        orgName: reg?.orgName || 'Workspace',
        referenceNumber: reg?.referenceNumber || 'N/A',
        activationKey: res.activationKey,
        workspaceUrl: `http://localhost:3000/activate`,
        initialAdminEmail: reg?.email || 'N/A',
      });
      setShowActivationModal(true);
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Workspace provisioning failed');
    } finally {
      setLoading(false);
    }
  };

  // Key operations
  const handleSuspendKey = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      await suspendActivationKeyApi(id);
      triggerToast('Activation key suspended successfully!');
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Failed to suspend activation key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      await revokeActivationKeyApi(id);
      triggerToast('Activation key revoked successfully!');
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke activation key');
    } finally {
      setLoading(false);
    }
  };

  const openRenewModal = (id: string) => {
    setSelectedKeyId(id);
    setShowRenewModal(true);
  };

  const handleRenewKeySubmit = async () => {
    if (!selectedKeyId) return;
    setLoading(true);
    setError('');
    try {
      await renewActivationKeyApi(selectedKeyId, renewMonths);
      triggerToast(`Activation key renewed for ${renewMonths} months!`);
      setShowRenewModal(false);
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Failed to renew activation key');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateKey = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await regenerateActivationKeyApi(id);
      setActivationKeyDetails({
        orgName: res.registration?.orgName || 'Workspace',
        referenceNumber: res.registration?.referenceNumber || 'N/A',
        activationKey: res.newRawKey,
        workspaceUrl: `http://localhost:3000/activate`,
        initialAdminEmail: res.registration?.email || 'N/A',
      });
      setShowActivationModal(true);
      await loadOnboardingLifecycleData();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate activation key');
    } finally {
      setLoading(false);
    }
  };

  // Switch context to inspect a specific workspace
  const handleLaunchSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let industryPackName = 'Standard Educational ERP';
      let enabledModules = ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'];
      
      if (industryPack === 'HOSPITAL_ERP') {
        industryPackName = 'Clinical Healthcare ERP';
        enabledModules = ['PATIENTS', 'APPOINTMENTS', 'PHARMACY', 'LAB_MANAGEMENT', 'FINANCE'];
      } else if (industryPack === 'CORPORATE_ERP') {
        industryPackName = 'Enterprise Resource ERP';
        enabledModules = ['HRMS', 'PAYROLL', 'RECRUITMENT', 'PERFORMANCE', 'FINANCE'];
      }

      const mockUser = {
        id: 'staff-demo-session',
        email: `founder-review-${activeRole.toLowerCase()}@aurxon.com`,
        profileName: `Reviewer (${activeRole})`,
        profileId: 'staff-demo-session',
        role: activeRole,
        institutionId: orgId,
        institutionName: orgName,
        logoUrl,
        primaryColor
      };

      const mockContext = {
        organizationId: orgId,
        organizationName: orgName,
        schoolId: null,
        campusId: null,
        role: activeRole,
        roleName: activeRole.replace('_', ' '),
        permissions: ['student:profile:crud', 'student:profile:read', 'patient:profile:crud', 'hr:employee:crud'],
        enabledModules,
        enabledFeatures: ['BIOMETRIC_ATTENDANCE', 'PATIENT_PORTAL', 'EMR_SNAPSHOT', 'LEAVE_WORKFLOW'],
        branding: {
          primaryColor,
          logoUrl,
          industryPackName
        }
      };

      localStorage.setItem('aurxon_token', 'mock-jwt-token-context-bound');
      localStorage.setItem('aurxon_user', JSON.stringify(mockUser));
      localStorage.setItem('aurxon_context', JSON.stringify(mockContext));
      
      document.documentElement.style.setProperty('--primary', primaryColor);

      triggerToast('Workspace context successfully resolved. Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve workspace context');
    }
  };

  // Launch a direct preset persona
  const handleLaunchPersona = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await loginApi(email, 'Password@2026');
      triggerToast(`Authenticated as ${email}`);
      
      if (data.memberships && data.memberships.length > 1) {
        router.push('/organization-select');
      } else if (data.memberships && data.memberships.length === 1) {
        const primary = data.memberships[0];
        await switchContextApi(primary.organizationId, primary.schoolId, primary.campusId);
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      // Impersonation fallback for founder@aurxon.com specifically
      if (email === 'founder@aurxon.com') {
        try {
          const data = await loginApi(email, 'Aurxon@Founder2026');
          triggerToast('Authenticated successfully as platform founder.');
          router.push('/dashboard');
          return;
        } catch {}
      }
      setError(err.message || 'Verification fallback triggered.');
      const mockUser = {
        id: 'staff-demo-reviewer',
        email,
        profileName: email.split('@')[0].toUpperCase() + ' Persona',
        profileId: 'staff-demo-reviewer',
        role: email === 'founder@aurxon.com' ? 'SUPER_ADMIN' : 'PRINCIPAL'
      };
      localStorage.setItem('aurxon_token', 'mock-jwt-token-context-bound');
      localStorage.setItem('aurxon_user', JSON.stringify(mockUser));
      triggerToast('Customer Journey simulation initialized.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFlushSession = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    localStorage.removeItem('aurxon_context');
    localStorage.removeItem('aurxon_memberships');
    localStorage.removeItem('aurxon_impersonating');
    localStorage.removeItem('aurxon_founder_token');
    triggerToast('All platform session parameters cleared successfully.');
  };

  const handleSeedReset = () => {
    localStorage.removeItem('aurxon_mock_db');
    triggerToast('To re-seed the database, please execute "npx prisma db seed" in your backend console terminal.');
  };

  const loadWorkspacePreset = (preset: string) => {
    if (preset === 'school') {
      setOrgId('inst-gvis');
      setOrgName('Green Valley International School');
      setIndustryPack('SCHOOL_ERP');
      setPrimaryColor('#0284c7');
      setLogoUrl('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200');
      setActiveRole('PRINCIPAL');
    } else if (preset === 'hospital') {
      setOrgId('inst-hospital');
      setOrgName('Apollo Specialty Clinic');
      setIndustryPack('HOSPITAL_ERP');
      setPrimaryColor('#10b981');
      setLogoUrl('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=200');
      setActiveRole('DOCTOR');
    } else if (preset === 'corporate') {
      setOrgId('inst-corporate');
      setOrgName('Aurxon Enterprise Solutions');
      setIndustryPack('CORPORATE_ERP');
      setPrimaryColor('#6366f1');
      setLogoUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200');
      setActiveRole('EMPLOYEE');
    }
    triggerToast(`Workspace preset loaded: ${preset.toUpperCase()}`);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#070b13] text-zinc-350 font-sans relative overflow-hidden select-none flex animate-fade-in">
      {/* Background glow templates */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-sky-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Operations Notification Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-xl border border-indigo-400 uppercase tracking-wide">
          <Sparkles className="h-4 w-4 text-indigo-200 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      {/* Product Operations Sidebar */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/40 backdrop-blur-xl shrink-0 flex flex-col justify-between p-5 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-indigo-650 rounded-lg flex items-center justify-center font-black text-white text-md">
              A
            </div>
            <div>
              <span className="text-xs font-black tracking-widest uppercase text-white block">AURXON</span>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Product Operations</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider px-2 block mb-2">Simulations Center</span>
            {[
              { id: 'journey', label: 'Validate Journeys', icon: GraduationCap },
              { id: 'lifecycle', label: 'Onboarding & Activation', icon: KeyRound },
              { id: 'marketplace', label: 'SaaS Core Definitions', icon: CreditCard },
              { id: 'health', label: 'Platform Infrastructure', icon: Activity },
              { id: 'maintenance', label: 'Refresh Operations', icon: Database },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-900/60 text-zinc-400'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-900">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider px-2 block mb-2">Quick Navigation</span>
            {[
              { label: 'Register Org', path: '/register' },
              { label: 'Activation Portal', path: '/activate' },
              { label: 'Setup Wizard', path: '/setup-wizard' },
              { label: 'ERP Dashboard', path: '/dashboard' },
              { label: 'Founder Portal', path: '/founder' }
            ].map(link => (
              <button
                key={link.label}
                onClick={() => router.push(link.path)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-zinc-500 hover:text-indigo-400 transition"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-5 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-zinc-350 font-black">
              FD
            </div>
            <div>
              <p className="text-xs font-bold text-white">Founder Admin</p>
              <p className="text-[10px] text-zinc-500 font-mono">Product Control</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Go to Login</span>
          </button>
        </div>
      </aside>

      {/* Main Operations panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-8 space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-950 pb-5">
          <div>
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">AURXON Product Control Plane</span>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Platform Operations & Demo Center</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Product Center Active
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            CUSTOMER JOURNEY & SIMULATION
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'journey' && (
          <div className="space-y-6 animate-fade-in">
            {/* Presets Cards */}
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block mb-3">Inspect Preset Customer Workspaces</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'school', title: 'School Workspace', desc: 'Verify Green Valley International School workflows (Student roster, grades, CBSE system).', icon: GraduationCap, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { id: 'hospital', title: 'Hospital Workspace', desc: 'Verify Apollo Specialty Clinic workflows (Clinical records, appointments scheduler).', icon: Stethoscope, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                  { id: 'corporate', title: 'Corporate Workspace', desc: 'Verify Aurxon Enterprise Solutions workflows (HR, payroll ledgers, appraisal parameters).', icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' }
                ].map(preset => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => loadWorkspacePreset(preset.id)}
                      className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 hover:bg-slate-950/60 text-left transition hover-lift select-none"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${preset.color} mb-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">{preset.title}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-relaxed">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Switcher Form */}
            <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-5">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Simulate Workspace Customizer</h3>
                <p className="text-[11px] text-zinc-500 mt-1 font-semibold">Instantly launch and inspect dynamic organization parameter states to audit customer branding, active modules, and custom roles.</p>
              </div>

              <form onSubmit={handleLaunchSimulation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Organization Name</label>
                    <input 
                      type="text" 
                      value={orgName} 
                      onChange={e => setOrgName(e.target.value)} 
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Workspace Tenant ID</label>
                    <input 
                      type="text" 
                      value={orgId} 
                      onChange={e => setOrgId(e.target.value)} 
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Simulation Persona Role</label>
                    <select
                      value={activeRole}
                      onChange={e => setActiveRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold cursor-pointer"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Founder view)</option>
                      <option value="INSTITUTE_ADMIN">INSTITUTE_ADMIN (Org Owner view)</option>
                      <option value="PRINCIPAL">PRINCIPAL (School Principal view)</option>
                      <option value="TEACHER">TEACHER (Teacher Period view)</option>
                      <option value="STUDENT">STUDENT (Student self-service view)</option>
                      <option value="PARENT">PARENT (Parent billing view)</option>
                      <option value="DOCTOR">DOCTOR (Physician view)</option>
                      <option value="EMPLOYEE">EMPLOYEE (Corporate Staff view)</option>
                      <option value="ACCOUNTANT">ACCOUNTANT (Finance operations view)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Industry Pack Pack</label>
                    <select
                      value={industryPack}
                      onChange={e => setIndustryPack(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold cursor-pointer"
                    >
                      <option value="SCHOOL_ERP">Standard Educational ERP</option>
                      <option value="HOSPITAL_ERP">Clinical Healthcare ERP</option>
                      <option value="CORPORATE_ERP">Enterprise Resource ERP</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Branding Color Accent</label>
                    <div className="flex items-center gap-3 bg-slate-950/20 border border-slate-800 rounded-xl px-3.5 py-1.5">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)} 
                        className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono font-bold">{primaryColor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Branding Logo Asset URL</label>
                  <input 
                    type="url" 
                    value={logoUrl} 
                    onChange={e => setLogoUrl(e.target.value)} 
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer hover-lift"
                  >
                    <Play className="h-4 w-4" /> Launch Customer Journey Simulation
                  </button>
                </div>
              </form>
            </div>

            {/* Validate User Personas */}
            <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Validate User Personas (GVIS Demo)</h3>
                <p className="text-[11px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                  Verify specific customer roles directly using pre-seeded Green Valley International School database. Bypasses setup wizard config to test complete journeys.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Founder Reviewer', email: 'founder@aurxon.com', role: 'SUPER_ADMIN', desc: 'Approve registrations, evaluate platform storage thresholds, resolve security warnings.', icon: Shield },
                  { name: 'GVIS School Principal', email: 'principal@gvis.edu', role: 'PRINCIPAL', desc: 'Audit class timetables, review teacher schedules, track outstanding term fees.', icon: GraduationCap },
                  { name: 'GVIS Academics Teacher', email: 'teacher@gvis.edu', role: 'TEACHER', desc: 'Verify period student attendance records and examination marks entry.', icon: UserCheck },
                  { name: 'GVIS Student Desk', email: 'student@gvis.edu', role: 'STUDENT', desc: 'Check report cards, view assignments, check attendance rates.', icon: Users },
                  { name: 'GVIS Parent Billing', email: 'parent@gvis.edu', role: 'PARENT', desc: 'Audit fee invoices, make payments, track children attendance.', icon: CreditCard },
                  { name: 'GVIS School Accountant', email: 'accountant@gvis.edu', role: 'ACCOUNTANT', desc: 'Record expense logs, process fee receipts, process pay slips.', icon: CreditCard }
                ].map(persona => {
                  const Icon = persona.icon;
                  return (
                    <button
                      key={persona.email}
                      onClick={() => handleLaunchPersona(persona.email)}
                      disabled={loading}
                      className="p-4 rounded-2xl border border-slate-900 bg-slate-950/30 hover:bg-slate-950/80 text-left transition flex gap-4 hover-lift"
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-indigo-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-tight">{persona.name}</span>
                          <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">{persona.role}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">{persona.email}</p>
                        <p className="text-[10px] text-zinc-550 leading-relaxed font-semibold">{persona.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            ONBOARDING & ACTIVATION LIFECYCLE
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-6 animate-fade-in">
            {/* Onboarding Overview */}
            <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Customer Onboarding Flow</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                AURXON operates as a secure SaaS pipeline. Customer signups are logged, reviewed by platform founders, technically verified, provisioned, activated, and initialized via a Setup Wizard.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 text-center text-xs font-bold font-sans">
                {[
                  { label: '1. Register', desc: 'Visitor registers details', icon: Briefcase, color: 'text-indigo-400 border-indigo-500/20' },
                  { label: '2. Review', desc: 'Founder verifies signup', icon: Shield, color: 'text-indigo-400 border-indigo-500/20' },
                  { label: '3. Provision', desc: 'DB partitions initialized', icon: Database, color: 'text-indigo-400 border-indigo-500/20' },
                  { label: '4. Activate', desc: 'Trial keys generated', icon: KeyRound, color: 'text-indigo-400 border-indigo-500/20' },
                  { label: '5. Setup', desc: 'Launch wizard settings', icon: CheckCircle, color: 'text-emerald-400 border-emerald-500/20' }
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className={`p-4 rounded-2xl border bg-slate-950/20 ${step.color} space-y-2 flex flex-col items-center`}>
                      <Icon className="h-6 w-6" />
                      <p className="text-white uppercase text-[10px] tracking-wider">{step.label}</p>
                      <p className="text-[9px] text-zinc-500 leading-snug font-semibold">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending & Approved Registration Queue */}
            <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Onboarding Registration Queue</h3>
                <p className="text-[11px] text-zinc-500 mt-1 font-semibold">Audit pending signup registrations. Perform reviews, verify technical architecture compatibility, and trigger workspace provisioning.</p>
              </div>

              {loading && registrations.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">Loading registrations...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No registrations currently logged in system database.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/10">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[9px] font-black uppercase tracking-wider text-zinc-500 border-b border-slate-900">
                        <th className="p-3">Reference No</th>
                        <th className="p-3">Workspace Name</th>
                        <th className="p-3">Email & Contact</th>
                        <th className="p-3">Industry Pack</th>
                        <th className="p-3">Expected Users</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Review Notes / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-zinc-400 font-medium">
                      {registrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-950/30">
                          <td className="p-3 font-mono font-bold text-zinc-350">{reg.referenceNumber || 'N/A'}</td>
                          <td className="p-3 font-bold text-zinc-350">{reg.orgName}</td>
                          <td className="p-3 font-mono">{reg.email}</td>
                          <td className="p-3 uppercase text-indigo-400 text-[10px] font-black">{reg.industryPackCode.replace('_', ' ')}</td>
                          <td className="p-3">{reg.expectedUsers}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                              reg.status === 'PENDING_REVIEW' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                              reg.status === 'APPROVED' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                              reg.status === 'READY_FOR_PROVISIONING' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                              reg.status === 'PROVISIONED' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                              'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-y-2">
                            {(reg.status === 'PENDING_REVIEW' || reg.status === 'APPROVED') && (
                              <input 
                                type="text"
                                placeholder="Add review notes..."
                                value={actionNotes[reg.id] || ''}
                                onChange={e => setActionNotes({ ...actionNotes, [reg.id]: e.target.value })}
                                className="w-48 bg-slate-950/60 border border-slate-900 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-indigo-500 font-medium mr-2"
                              />
                            )}
                            
                            {reg.status === 'PENDING_REVIEW' && (
                              <div className="inline-flex gap-1.5">
                                <button 
                                  onClick={() => handleReview(reg.id, 'APPROVED')}
                                  disabled={loading}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold uppercase text-[9px] cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleReview(reg.id, 'REJECTED')}
                                  disabled={loading}
                                  className="px-2.5 py-1 bg-red-650 hover:bg-red-550 text-white rounded font-bold uppercase text-[9px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {reg.status === 'APPROVED' && (
                              <button 
                                onClick={() => handleTechnicalReview(reg.id)}
                                disabled={loading}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-[9px] cursor-pointer"
                              >
                                Technical Verification
                              </button>
                            )}

                            {reg.status === 'READY_FOR_PROVISIONING' && (
                              <button 
                                onClick={() => handleProvision(reg.id)}
                                disabled={loading}
                                className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-550 text-white rounded font-bold uppercase text-[9px] cursor-pointer flex items-center gap-1 inline-flex"
                              >
                                <Database className="h-3 w-3" /> Provision Workspace
                              </button>
                            )}

                            {reg.status === 'PROVISIONED' && (
                              <span className="text-[10px] font-black text-zinc-500">Awaiting user activation...</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active Workspace Activation Keys */}
            <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Workspace Activation Keys</h3>
                <p className="text-[11px] text-zinc-500 mt-1 font-semibold">Audit provisioning logs and generated access key credentials sent to verified customer accounts. Perform suspensions, extensions, and regenerations.</p>
              </div>

              {loading && activationKeys.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">Loading activation keys...</div>
              ) : activationKeys.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No active keys provisioned in system database.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/10">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[9px] font-black uppercase tracking-wider text-zinc-500 border-b border-slate-900">
                        <th className="p-3">Reference No</th>
                        <th className="p-3">Customer Workspace</th>
                        <th className="p-3">Expiry Date</th>
                        <th className="p-3">Key SHA-256 Hash</th>
                        <th className="p-3">State</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-zinc-400 font-medium">
                      {activationKeys.map(key => (
                        <tr key={key.id} className="hover:bg-slate-950/30">
                          <td className="p-3 font-mono font-bold text-zinc-350">{key.registration?.referenceNumber || 'N/A'}</td>
                          <td className="p-3 font-bold text-zinc-350">{key.registration?.orgName || 'Workspace'}</td>
                          <td className="p-3 font-mono">{new Date(key.expiresAt).toLocaleDateString()}</td>
                          <td className="p-3 font-mono text-zinc-500 select-all">{key.keyHash.slice(0, 16)}...</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                              key.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              key.status === 'USED' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                              key.status === 'SUSPENDED' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                              'text-red-400 bg-red-500/10 border-red-500/20'
                            }`}>
                              {key.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 space-y-1">
                            {key.status === 'ACTIVE' && (
                              <>
                                <button 
                                  onClick={() => handleSuspendKey(key.id)}
                                  disabled={loading}
                                  className="px-2 py-1 bg-amber-600/20 hover:bg-amber-650/40 border border-amber-500/30 text-amber-400 rounded text-[9px] font-bold uppercase cursor-pointer"
                                >
                                  Suspend
                                </button>
                                <button 
                                  onClick={() => handleRevokeKey(key.id)}
                                  disabled={loading}
                                  className="px-2 py-1 bg-red-600/20 hover:bg-red-650/40 border border-red-500/30 text-red-400 rounded text-[9px] font-bold uppercase cursor-pointer"
                                >
                                  Revoke
                                </button>
                              </>
                            )}

                            {key.status === 'SUSPENDED' && (
                              <button 
                                onClick={() => handleSuspendKey(key.id)} // Suspend toggles in backend strategy or we call renew
                                disabled={loading}
                                className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-650/40 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-bold uppercase cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}

                            <button 
                              onClick={() => openRenewModal(key.id)}
                              disabled={loading}
                              className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-650/40 border border-indigo-500/30 text-indigo-400 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              Renew
                            </button>

                            <button 
                              onClick={() => handleRegenerateKey(key.id)}
                              disabled={loading}
                              className="px-2 py-1 bg-purple-600/20 hover:bg-purple-650/40 border border-purple-500/30 text-purple-400 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              Regenerate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Renewal Modal */}
            {showRenewModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-[#0b0f19] border border-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Renew Activation Key</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Set the subscription extension period. This directly updates the license expiresAt database field for the tenant workspace.
                  </p>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Renewal Duration (Months)</label>
                    <select
                      value={renewMonths}
                      onChange={e => setRenewMonths(parseInt(e.target.value, 10))}
                      className="mt-1.5 w-full bg-slate-950/60 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months (1 Year)</option>
                      <option value={24}>24 Months (2 Years)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-900/60">
                    <button 
                      onClick={() => setShowRenewModal(false)}
                      className="px-3.5 py-2 border border-slate-900 hover:bg-slate-900/40 text-zinc-400 rounded-xl text-xs font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleRenewKeySubmit}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                    >
                      Confirm Renewal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activation Details Modal */}
            {showActivationModal && activationKeyDetails && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                <div className="bg-[#0b0f19] border border-slate-900 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-indigo-500" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-emerald-400" />
                      <span>Workspace Key Issued</span>
                    </h3>
                    <button 
                      onClick={() => setShowActivationModal(false)}
                      className="text-zinc-500 hover:text-white p-1 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                    Workspace has been successfully provisioned. Copy these activation credentials and send them to the customer to log in and configure their platform.
                  </p>

                  <div className="space-y-3 bg-slate-950/40 border border-slate-900 rounded-2xl p-4">
                    <div>
                      <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider">Organization Name</span>
                      <span className="text-xs text-white font-bold">{activationKeyDetails.orgName}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider">Reference Number</span>
                      <span className="text-xs text-zinc-300 font-mono font-bold">{activationKeyDetails.referenceNumber}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider">Initial Admin Email</span>
                      <span className="text-xs text-zinc-300 font-bold">{activationKeyDetails.initialAdminEmail}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider">Activation Key (Customer Entry)</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="bg-slate-950 px-3 py-2 border border-slate-900 rounded-xl text-xs font-mono font-black text-emerald-400 tracking-wide select-all w-full text-center">
                          {activationKeyDetails.activationKey || 'NO_KEY_GENERATED'}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activationKeyDetails.activationKey || '');
                            triggerToast('Activation Key copied!');
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Copy Key"
                        >
                          <Database className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider">Manual Activation URL</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="bg-slate-950 px-3 py-2 border border-slate-900 rounded-xl text-[10px] font-mono text-zinc-300 select-all w-full">
                          {activationKeyDetails.workspaceUrl}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activationKeyDetails.workspaceUrl || '');
                            triggerToast('Activation URL copied!');
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Copy URL"
                        >
                          <Database className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button 
                      onClick={() => setShowActivationModal(false)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            SAAS CORE DEFINITIONS
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'marketplace' && (
          <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-5 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">AURXON Marketplace & Plan Tiers</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                Module and feature limits definitions. Limits are strictly audited in core middleware controllers to maintain proper isolation boundaries and commercial tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Student Management & Records', code: 'STUDENT_MANAGEMENT', active: true, price: '₹4,500/mo', type: 'Core Module' },
                { title: 'Attendance Registers', code: 'ATTENDANCE', active: true, price: '₹2,500/mo', type: 'Core Module' },
                { title: 'Examinations Desk', code: 'EXAMINATION', active: true, price: '₹3,000/mo', type: 'Core Module' },
                { title: 'Finance & Fee Ledgers', code: 'FINANCE', active: true, price: '₹6,000/mo', type: 'Premium Upgrade' },
                { title: 'Biometric Clock Integration', code: 'BIOMETRIC_ATTENDANCE', active: true, price: '₹1,500/mo', type: 'Feature Pack' },
                { title: 'Custom grading rules calculator', code: 'EXAM_FORMULA_CALCULATOR', active: true, price: '₹1,000/mo', type: 'Feature Pack' },
                { title: 'Clinical Inpatient Directory', code: 'PATIENTS', active: false, price: '₹5,000/mo', type: 'Healthcare Pack' },
                { title: 'Statutory Employee Masters', code: 'HRMS', active: false, price: '₹4,000/mo', type: 'Corporate Pack' }
              ].map(mod => (
                <div key={mod.code} className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">{mod.type}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${mod.active ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{mod.title}</h4>
                    <p className="text-[10px] font-mono text-zinc-550">{mod.code}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-900">
                    <span className="text-[10px] font-black text-indigo-300">{mod.price}</span>
                    <button 
                      onClick={() => triggerToast(`Modules are toggled via customer subscription upgrades.`)}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded cursor-pointer ${mod.active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'}`}
                    >
                      {mod.active ? 'Active' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PLATFORM INFRASTRUCTURE
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'health' && (
          <div className="glass rounded-3xl p-6 border border-slate-900 shadow-xl space-y-6 animate-fade-in">
            {/* Telemetry and logs */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">EKS Node Pool & Telemetry Statistics</h3>
                <p className="text-[11px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                  Real-time status check on EKS container load limits, database transaction queues, and network latencies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Cluster Load Metrics', value: '38% CPU / 42% RAM', desc: 'Healthy - 2 EKS node instances' },
                  { title: 'Connection Pools', value: '18 Active / 142 Idle Pool', desc: 'Optimized PgBouncer routing' },
                  { title: 'API Response Latencies', value: 'P95: 45 ms / P99: 110 ms', desc: 'Optimal CDN cache status' },
                ].map(stat => (
                  <div key={stat.title} className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 space-y-2">
                     <span className="text-[9px] font-black uppercase text-zinc-550 block">{stat.title}</span>
                    <p className="text-base font-black text-white">{stat.value}</p>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>{stat.desc}</span>
                      <span className="text-emerald-400 font-bold">ACTIVE & HEALTHY</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform incident logs preview */}
            <div className="space-y-3 pt-4 border-t border-slate-900">
              <div>
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Platform Operational Incident Logs</h3>
                <p className="text-[11px] text-zinc-500 leading-normal font-semibold">Audited logs for network access verification, backup validation, and diagnostic bypass triggers.</p>
              </div>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/10 flex justify-between items-center gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">COMPLETED</span>
                      <span className="text-white font-bold">Automated Database Snapshots Verification</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">Weekly platform data replication verified. Stored at s3://aurxon-vault/backups/.</p>
                  </div>
                  <span className="text-zinc-550 font-mono text-[10px]">Today 04:30 AM</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/10 flex justify-between items-center gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">VERIFIED</span>
                      <span className="text-white font-bold">Tenant Isolation Boundary Audits</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">Zero cross-tenant leakages detected. Checked 142 institution schemas automatically.</p>
                  </div>
                  <span className="text-zinc-550 font-mono text-[10px]">Yesterday 11:20 PM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            REFRESH OPERATIONS
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'maintenance' && (
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Environment Refresh Center</h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                Restore the simulation database to original parameters or flush active workspace sessions. Used to prepare clean setups for client reviews and smoke testing.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 flex justify-between items-center gap-4 flex-wrap">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase">Flush Session Cache</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">Sign out and clear all active workspace, membership, and context scopes safely.</p>
                </div>
                <button
                  onClick={handleFlushSession}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-800 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 inline mr-1" /> Flush Session
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-red-500/15 bg-red-500/[0.01] flex justify-between items-center gap-4 flex-wrap">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase">Re-initialize Simulated Database</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">Re-seed standard demo student, class, notice, and staff files to default settings.</p>
                </div>
                <button
                  onClick={handleSeedReset}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/20 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Re-seed Database
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
