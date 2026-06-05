'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, ArrowLeft, Check, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, GraduationCap, Stethoscope, Briefcase, Landmark } from 'lucide-react';
import { registerOrganizationApi } from '@/lib/api';

const ORG_TYPES = [
  { id: 'SCHOOL', label: 'School / K-12', icon: GraduationCap, description: 'CBSE, ICSE, and State Board schools' },
  { id: 'UNIVERSITY', label: 'University / College', icon: Landmark, description: 'Higher education academies and campuses' },
  { id: 'HOSPITAL', label: 'Hospital / Medical', icon: Stethoscope, description: 'Clinical and hospital administration' },
  { id: 'COMPANY', label: 'Enterprise / Corporate', icon: Briefcase, description: 'Businesses and corporate entities' },
  { id: 'NGO', label: 'NGO / Trust', icon: ShieldCheck, description: 'Non-profit and charity foundations' }
];

const AVAILABLE_MODULES = [
  { id: 'STUDENT_MANAGEMENT', label: 'Student Management & Admissions', description: 'Core student directory, admissions wizard, and academic profile mapping. (Required)', required: true },
  { id: 'ATTENDANCE', label: 'Attendance Management', description: 'Daily attendance logs, RFID/biometric tracking, and staff leaves.', required: false },
  { id: 'EXAMINATION', label: 'Exams & Gradebook', description: 'Configurable grading scales, exam creation, marks entry, and report cards.', required: false },
  { id: 'FINANCE', label: 'Finance & Fee Ledger', description: 'Fee structure setup, concessions, payment receipts, and staff payroll.', required: false }
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    orgName: '',
    orgType: 'SCHOOL',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    expectedUsers: 50,
    requestedModules: ['STUDENT_MANAGEMENT']
  });

  const updateField = (key: string, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const toggleModule = (modId: string) => {
    if (modId === 'STUDENT_MANAGEMENT') return; // Required
    setForm(prev => {
      const current = [...prev.requestedModules];
      if (current.includes(modId)) {
        return { ...prev, requestedModules: current.filter(id => id !== modId) };
      } else {
        return { ...prev, requestedModules: [...current, modId] };
      }
    });
  };

  const handleNext = () => {
    setError('');
    // Step validation
    if (step === 2) {
      if (!form.orgName.trim()) {
        setError('Organization Name is required');
        return;
      }
    } else if (step === 3) {
      if (!form.email.trim() || !form.phone.trim()) {
        setError('Email and Phone number are required');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerOrganizationApi(form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white p-6 relative overflow-hidden select-none">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 text-center shadow-2xl space-y-6 relative z-10">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-lg">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 uppercase">Application Submitted!</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your registration request for <span className="text-sky-400 font-bold">{form.orgName}</span> has been submitted to the platform founders.
          </p>
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800/60 p-5 text-left text-xs text-zinc-400 space-y-3 font-semibold">
            <p className="text-zinc-300 font-black">WHAT HAPPENS NEXT?</p>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>Our verification team will review your application details.</li>
              <li>Once approved, an activation link will be sent to <span className="text-indigo-400 font-mono font-bold">{form.email}</span>.</li>
              <li>You can complete the onboarding wizard and launch your workspace immediately after activation.</li>
            </ul>
          </div>
          <div className="pt-4">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all duration-300 transform active:scale-[0.98]"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070b13] text-white p-6 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto py-4 relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <div className="h-9 w-9 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md">
            A
          </div>
          <span className="text-sm font-black tracking-widest uppercase bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">AURXON</span>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs font-bold text-zinc-400 hover:text-zinc-200 transition"
        >
          Sign In
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10 w-full">
        <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative">
          
          {/* Top Progress bar */}
          <div className="mb-8 flex items-center justify-between gap-2 border-b border-slate-800/50 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Step {step} of 5</span>
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">
                {step === 1 && 'Select Workspace Type'}
                {step === 2 && 'Organization Profile'}
                {step === 3 && 'Administrative Contact'}
                {step === 4 && 'Activate Modules'}
                {step === 5 && 'Verify Details'}
              </h2>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <div
                  key={s}
                  className={`h-1.5 w-7 rounded-full transition-all duration-300 ${s <= step ? 'bg-sky-500' : 'bg-slate-800'}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex gap-3 text-xs text-red-400 font-semibold animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* STEP 1: ORG TYPE */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-3 animate-fade-in">
                {ORG_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = form.orgType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateField('orgType', type.id)}
                      className={`flex gap-4 p-4 text-left rounded-2xl border transition-all duration-300 select-none ${isSelected ? 'border-sky-500 bg-sky-500/10 shadow-lg' : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'}`}
                    >
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold transition-all ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-zinc-400'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-wider text-zinc-100">{type.label}</p>
                        <p className="text-[11px] text-zinc-400">{type.description}</p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-700 bg-transparent'}`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: ORG DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Organization / Campus Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Springdale International School"
                    value={form.orgName}
                    onChange={e => updateField('orgName', e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Expected Users / Students</label>
                    <input
                      type="number"
                      value={form.expectedUsers}
                      onChange={e => updateField('expectedUsers', parseInt(e.target.value) || 50)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi"
                      value={form.city}
                      onChange={e => updateField('city', e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">State *</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi"
                      value={form.state}
                      onChange={e => updateField('state', e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Physical Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector 4, Dwarka"
                      value={form.address}
                      onChange={e => updateField('address', e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@school.com"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  />
                  <p className="text-[10px] text-zinc-500">This email will receive the workspace activation link.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Official Mobile / Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-xs text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: MODULE SELECTION */}
            {step === 4 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[11px] text-zinc-400 mb-2">Select the modules you would like to activate for your organization context. You can change these later from the founder panel.</p>
                {AVAILABLE_MODULES.map(mod => {
                  const isSelected = form.requestedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      disabled={mod.required}
                      onClick={() => toggleModule(mod.id)}
                      className={`flex gap-4 p-4 text-left rounded-2xl border w-full transition-all duration-300 select-none ${isSelected ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-950/10 hover:border-slate-700'} ${mod.required ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-wider text-zinc-100">{mod.label}</p>
                          {mod.required && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Required</span>}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{mod.description}</p>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded border flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700 bg-transparent'}`}>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 5: REVIEW & SUBMIT */}
            {step === 5 && (
              <div className="space-y-4 animate-fade-in text-xs font-semibold">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-zinc-400 border-b border-slate-800 pb-2">Workspace Summary</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-black">Organization Name</span>
                      <p className="text-zinc-200 mt-0.5">{form.orgName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-black">Workspace Type</span>
                      <p className="text-zinc-200 mt-0.5">{form.orgType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-black">Contact Email</span>
                      <p className="text-zinc-200 mt-0.5 font-mono">{form.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-black">Contact Phone</span>
                      <p className="text-zinc-200 mt-0.5">{form.phone}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black">Location</span>
                    <p className="text-zinc-200 mt-0.5">
                      {[form.address, form.city, form.state].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black">Requested Modules</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {form.requestedModules.map(modId => {
                        const label = AVAILABLE_MODULES.find(m => m.id === modId)?.label || modId;
                        return (
                          <span key={modId} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700/50 text-[10px] text-zinc-300 font-bold uppercase">
                            {label.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950/30 p-4 border border-slate-800/40 text-[11px] text-zinc-400 flex gap-2">
                  <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>By submitting, you agree that this workspace request is subject to verification. The trial grants 30 days of free access with a 500 student capacity limit.</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800/50">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-zinc-400 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-black uppercase tracking-wider text-white shadow-lg transition"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-8 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all duration-300"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto py-4 text-center text-[10px] text-zinc-600 border-t border-slate-850/30 relative z-10">
        © 2026 AURXON ERP Lite. Dedicated to Enterprise Institutional Scaling.
      </footer>
    </div>
  );
}
