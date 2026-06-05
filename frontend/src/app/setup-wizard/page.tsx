'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Building2, Calendar, MapPin, Sliders, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getSetupStatusApi, submitSetupApi, refreshContextApi } from '@/lib/api';
import CountryPhoneInput from '@/01_Core/Dashboard/CountryPhoneInput';
import { INDIAN_STATES_AND_UTS } from '@/lib/indianData';

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    academicYear: '2026-2027',
    gradingSystem: 'CBSE',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    branch: {
      name: '',
      code: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
    }
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
    verifySetup();
  }, []);

  const verifySetup = async () => {
    try {
      const data = await getSetupStatusApi();
      setStatus(data);
      if (data.setupCompleted) {
        router.replace('/dashboard');
        return;
      }
      if (data.details) {
        setForm(prev => ({
          ...prev,
          academicYear: data.details.academicYear || '2026-2027',
          gradingSystem: data.details.gradingSystem || 'CBSE',
          timezone: data.details.timezone || 'Asia/Kolkata',
          currency: data.details.currency || 'INR',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.academicYear || !form.gradingSystem) {
        setError('Please fill in all academic configuration fields.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branch.name || !form.branch.code || !form.branch.phone) {
      setError('Please fill in all default branch parameters.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await submitSetupApi(form);
      await refreshContextApi();
      setStep(3);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Setup wizard failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
            Checking organization status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 transition-colors duration-500 sm:px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 z-10 relative">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Onboarding Setup Wizard
          </h2>
          <p className="mt-2 text-xs text-muted-foreground font-medium">
            Initialize your institution's control plane parameters.
          </p>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="flex items-center justify-between px-16">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full font-black text-xs border ${
            step >= 1 ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`flex items-center justify-center h-8 w-8 rounded-full font-black text-xs border ${
            step >= 2 ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground'
          }`}>
            2
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`flex items-center justify-center h-8 w-8 rounded-full font-black text-xs border ${
            step >= 3 ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground'
          }`}>
            3
          </div>
        </div>

        {/* Content Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-primary" />
                <span>Step 1: System Parameters & Timezones</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Academic Year</label>
                  <input
                    type="text"
                    required
                    value={form.academicYear}
                    onChange={e => setForm({ ...form, academicYear: e.target.value })}
                    placeholder="e.g. 2026-2027"
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Grading Affiliation Standard</label>
                  <select
                    value={form.gradingSystem}
                    onChange={e => setForm({ ...form, gradingSystem: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-bold"
                  >
                    <option value="CBSE">CBSE Board (CCE Grading System)</option>
                    <option value="PERCENTAGE">State Board / Marks Percentages</option>
                    <option value="GPA">ICSE Board (GPA Scale)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Biometric Clock Timezone</label>
                  <input
                    type="text"
                    required
                    value={form.timezone}
                    onChange={e => setForm({ ...form, timezone: e.target.value })}
                    placeholder="Asia/Kolkata"
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fee Billing Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-bold"
                  >
                    <option value="INR">INR (₹) - Indian Rupees</option>
                    <option value="USD">USD ($) - US Dollars</option>
                    <option value="EUR">EUR (€) - Euros</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover-lift"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-primary" />
                <span>Step 2: Initialize Primary Campus</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch / Campus Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramakrishna Mission Vidyapith Main Campus"
                    value={form.branch.name}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, name: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RKMVP-MAIN"
                    value={form.branch.code}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, code: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-mono uppercase"
                  />
                </div>

                <CountryPhoneInput
                  label="Campus Helpline Phone"
                  value={form.branch.phone}
                  onChange={val => setForm({ ...form, branch: { ...form.branch, phone: val } })}
                />

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Street Address</label>
                  <input
                    type="text"
                    placeholder="Vidyapith Road, Ramakrishna Sector"
                    value={form.branch.address}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, address: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">State</label>
                  <select
                    value={form.branch.state}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, state: e.target.value, city: '' } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
                  >
                    <option value="">Select State...</option>
                    {INDIAN_STATES_AND_UTS.map(item => (
                      <option key={item.state} value={item.state}>{item.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">City / District</label>
                  <select
                    value={form.branch.city}
                    disabled={!form.branch.state}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, city: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold disabled:opacity-50"
                  >
                    <option value="">Select City...</option>
                    {(() => {
                      const selectedStateObj = INDIAN_STATES_AND_UTS.find(item => item.state === form.branch.state);
                      return selectedStateObj 
                        ? Object.values(selectedStateObj.districts).flat().map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))
                        : [];
                    })()}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Postal PIN Code</label>
                  <input
                    type="text"
                    placeholder="700124"
                    value={form.branch.pinCode}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, pinCode: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-xl border border-border hover:bg-muted px-4 py-2.5 text-xs font-bold text-zinc-400 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover-lift disabled:opacity-50"
                >
                  <span>{submitting ? 'Initializing...' : 'Complete Setup'}</span>
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h3 className="text-lg font-black text-foreground">Organization Configured successfully!</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Default primary campus established, affiliation configurations loaded, and seed database keys created. Redirecting to workspace dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
