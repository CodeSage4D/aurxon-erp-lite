'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Building2, Calendar, MapPin, Sliders, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { getSetupStatusApi, submitSetupApi, saveSetupDraftApi, refreshContextApi } from '@/lib/api';
import CountryPhoneInput from '@/01_Core/Dashboard/CountryPhoneInput';
import { INDIAN_STATES_AND_UTS } from '@/lib/indianData';

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [industryPackCode, setIndustryPackCode] = useState('SCHOOL_ERP');

  // Form State
  const [form, setForm] = useState({
    academicYear: '2026-2027',
    gradingSystem: 'CBSE',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    departments: '',
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('dark');
    verifySetup();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved configuration changes. Are you sure you want to exit onboarding?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!mounted) return null;

  const verifySetup = async () => {
    try {
      // SUPER_ADMIN bypass: skip setup wizard entirely for platform founders
      const userStr = localStorage.getItem('aurxon_user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user && user.role === 'SUPER_ADMIN') {
        router.replace('/founder');
        return;
      }

      const data = await getSetupStatusApi();
      setStatus(data);
      
      // If setup is already completed, redirect to dashboard immediately
      if (data.setupCompleted) {
        router.replace('/dashboard');
        return;
      }
      
      setIndustryPackCode(data.industryPackCode || 'SCHOOL_ERP');
      
      // Support resuming steps: if user revisits, show the step they were on
      if (data.currentStep && data.currentStep > 0) {
        setStep(data.currentStep);
      }

      // Restore saved form data from previous session
      if (data.details) {
        setForm(prev => ({
          ...prev,
          academicYear: data.details.academicYear || (data.industryPackCode === 'CORPORATE_ERP' ? 'FY-2026' : '2026-2027'),
          gradingSystem: data.details.gradingSystem || (data.industryPackCode === 'SCHOOL_ERP' ? 'CBSE' : 'STANDARD'),
          timezone: data.details.timezone || 'Asia/Kolkata',
          currency: data.details.currency || 'INR',
          departments: data.details.departments || '',
          branch: data.details.branch ? {
            name: data.details.branch.name || '',
            code: data.details.branch.code || '',
            phone: data.details.branch.phone || '',
            address: data.details.branch.address || '',
            city: data.details.branch.city || '',
            state: data.details.branch.state || '',
            pinCode: data.details.branch.pinCode || '',
          } : prev.branch
        }));
      }
    } catch (err) {
      console.error('Failed to verify setup wizard status:', err);
      // On error, allow user to continue with setup
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validation based on industry pack
      if (industryPackCode === 'SCHOOL_ERP') {
        if (!form.academicYear || !form.gradingSystem) {
          setError('Please fill in all academic configuration fields.');
          return;
        }
      } else if (industryPackCode === 'HOSPITAL_ERP') {
        if (!form.departments || !form.timezone) {
          setError('Please fill in all hospital configuration fields.');
          return;
        }
      } else if (industryPackCode === 'CORPORATE_ERP') {
        if (!form.academicYear || !form.departments) {
          setError('Please fill in all corporate configuration fields.');
          return;
        }
      }

      setError('');
      setSubmitting(true);
      try {
        // Auto-save Step 1 to database draft
        await saveSetupDraftApi(1, {
          academicYear: form.academicYear,
          gradingSystem: form.gradingSystem,
          timezone: form.timezone,
          currency: form.currency,
          departments: form.departments,
        });
        setStep(2);
      } catch (err: any) {
        setError(err.message || 'Failed to save progress. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = async () => {
    setError('');
    setSubmitting(true);
    try {
      // Auto-save current Step 2 values as draft
      await saveSetupDraftApi(2, {
        branch: form.branch,
      });
      // Move currentStep back to 1
      await saveSetupDraftApi(0, {}); // Triggers currentStep to set to 1
      setStep(1);
    } catch (err) {
      console.error('Failed to save back draft:', err);
      setStep(1);
    } finally {
      setSubmitting(false);
    }
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
      // Submit setup configuration to backend
      await submitSetupApi(form);
      
      // Wait briefly for backend to persist state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify submission was successful by checking setup status
      const verifyStatus = await getSetupStatusApi();
      if (!verifyStatus.setupCompleted) {
        throw new Error('Setup status was not confirmed. Please try again.');
      }
      
      // Refresh context with new setup completion status
      await refreshContextApi();
      
      setStep(3);
      
      // Redirect to dashboard once setup is verified complete
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Setup wizard submission failed:', err);
      setError(err.message || 'Setup wizard failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            Initialize your organization's control plane parameters.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-black uppercase text-primary">
            {industryPackCode.replace('_', ' ')} Pack
          </div>
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
        <div className="glass rounded-3xl p-8 shadow-2xl border border-border relative overflow-hidden bg-slate-900/40 backdrop-blur-xl">
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
                {/* SCHOOL_ERP Industry Fields */}
                {industryPackCode === 'SCHOOL_ERP' && (
                  <>
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
                  </>
                )}

                {/* HOSPITAL_ERP Industry Fields */}
                {industryPackCode === 'HOSPITAL_ERP' && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Medical Departments</label>
                      <input
                        type="text"
                        required
                        value={form.departments}
                        onChange={e => setForm({ ...form, departments: e.target.value })}
                        placeholder="e.g. Emergency, Cardiology, Pediatrics, General Medicine, OPD"
                        className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
                      />
                      <p className="mt-1 text-[9px] text-muted-foreground">Provide a comma-separated list of clinical departments to set up in the clinic database.</p>
                    </div>
                  </>
                )}

                {/* CORPORATE_ERP Industry Fields */}
                {industryPackCode === 'CORPORATE_ERP' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fiscal Year</label>
                      <input
                        type="text"
                        required
                        value={form.academicYear}
                        onChange={e => setForm({ ...form, academicYear: e.target.value })}
                        placeholder="e.g. FY-2026"
                        className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Corporate Departments</label>
                      <input
                        type="text"
                        required
                        value={form.departments}
                        onChange={e => setForm({ ...form, departments: e.target.value })}
                        placeholder="e.g. Engineering, Sales, Product, Marketing, Finance, HR"
                        className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
                      />
                      <p className="mt-1 text-[9px] text-muted-foreground">Provide a comma-separated list of company organizational departments.</p>
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timezone Setting</label>
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Local Currency</label>
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
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover-lift disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving draft...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-primary" />
                <span>Step 2: Initialize Default Branch / Campus Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch / Site Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Headquarters or Campus 1"
                    value={form.branch.name}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, name: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch / Site Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-MAIN"
                    value={form.branch.code}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, code: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground font-mono uppercase"
                  />
                </div>

                <CountryPhoneInput
                  label="Helpline Helpline Phone"
                  value={form.branch.phone}
                  onChange={val => setForm({ ...form, branch: { ...form.branch, phone: val } })}
                />

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Physical Street Address</label>
                  <input
                    type="text"
                    placeholder="Sector 5, Salt Lake City"
                    value={form.branch.address}
                    onChange={e => setForm({ ...form, branch: { ...form.branch, address: e.target.value } })}
                    className="mt-2 w-full rounded-xl border border-border bg-input/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">State / Province</label>
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
                    placeholder="700091"
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
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl border border-border hover:bg-muted px-4 py-2.5 text-xs font-bold text-zinc-400 transition disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover-lift disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Completing setup...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h3 className="text-lg font-black text-foreground">Organization Configured successfully!</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Default site established, industry pack options finalized, and configuration entries saved. Redirecting to workspace dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
