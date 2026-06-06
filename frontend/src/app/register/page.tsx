'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, ArrowRight, ArrowLeft, Check, CheckCircle2, AlertCircle, Sparkles, 
  GraduationCap, Stethoscope, Briefcase, KeyRound, User, Eye, EyeOff, Copy
} from 'lucide-react';
import { registerOrganizationWithAdminApi } from '@/lib/api';

const INDUSTRY_PACKS = [
  { 
    id: 'SCHOOL_ERP', 
    label: 'Standard Educational ERP', 
    icon: GraduationCap, 
    description: 'Complete student directory, admissions wizard, academic profile mapping, gradebooks, attendance, and fee tracking.',
    defaultModules: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
    defaultModulesMetadata: [
      { id: 'STUDENT_MANAGEMENT', name: 'Student Management & Admissions', required: true, description: 'Core student profiles, scholar tracking and directory logs.' },
      { id: 'ATTENDANCE', name: 'Attendance Management', required: false, description: 'Student attendance registers and check-in logs.' },
      { id: 'EXAMINATION', name: 'Exams & Gradebook', required: false, description: 'Configurable grading scales, exam creation, and marks entry.' },
      { id: 'FINANCE', name: 'Finance & Fee Ledger', required: false, description: 'Fee structure setup, payment receipts, and billing.' }
    ]
  },
  { 
    id: 'HOSPITAL_ERP', 
    label: 'Clinical Healthcare ERP', 
    icon: Stethoscope, 
    description: 'Dynamic patient directory, consulting doctor scheduling, pharmacy drug catalogs, and laboratory diagnostic records.',
    defaultModules: ['PATIENTS', 'APPOINTMENTS', 'PHARMACY', 'LAB_MANAGEMENT', 'FINANCE'],
    defaultModulesMetadata: [
      { id: 'PATIENTS', name: 'Patient Records & Admissions', required: true, description: 'Statutory EMR logs, details, and inpatient directory.' },
      { id: 'APPOINTMENTS', name: 'Appointments & Scheduling', required: false, description: 'Consultation scheduling and doctor roster calendars.' },
      { id: 'PHARMACY', name: 'Pharmacy & Drug Catalog', required: false, description: 'Inventory management and digital prescriptions catalog.' },
      { id: 'LAB_MANAGEMENT', name: 'Laboratory Diagnostics', required: false, description: 'Lab requests, reports, and imaging archives.' },
      { id: 'FINANCE', name: 'Finance & Accounts', required: false, description: 'Bill compilation, ledger, and cash counters.' }
    ]
  },
  { 
    id: 'CORPORATE_ERP', 
    label: 'Enterprise Resource ERP', 
    icon: Briefcase, 
    description: 'Statutory HR master databases, employee directories, payroll structures, recruitment cycles, and appraisals.',
    defaultModules: ['HRMS', 'PAYROLL', 'RECRUITMENT', 'PERFORMANCE', 'FINANCE'],
    defaultModulesMetadata: [
      { id: 'HRMS', name: 'HRMS & Employee Records', required: true, description: 'Statutory employee files, master directory, and contract logs.' },
      { id: 'PAYROLL', name: 'Payroll & Compensation', required: false, description: 'Tax configurations, salary slips, and direct deposits.' },
      { id: 'RECRUITMENT', name: 'Recruitment & Hiring', required: false, description: 'Open positions listings, resumes tracker, and schedules.' },
      { id: 'PERFORMANCE', name: 'Performance & Appraisals', required: false, description: 'Feedback metrics and performance reviews.' },
      { id: 'FINANCE', name: 'Finance & Accounts', required: false, description: 'Expense tracking, corporate ledger, and budgets.' }
    ]
  }
];

const ORG_SIZES = [
  { id: 'SMALL', label: 'Small Campus / Clinic', desc: 'Less than 100 active members', range: '< 100' },
  { id: 'MEDIUM', label: 'Medium Institution', desc: '100 to 500 active members', range: '100 - 500' },
  { id: 'LARGE', label: 'Large Organization', desc: '500 to 2000 active members', range: '500 - 2000' },
  { id: 'ENTERPRISE', label: 'Enterprise Corporation', desc: 'More than 2000 active members', range: '> 2000' }
];

const OPTIONAL_FEATURES: Record<string, { code: string; label: string; desc: string }[]> = {
  ATTENDANCE: [
    { code: 'BIOMETRIC_ATTENDANCE', label: 'Biometric Integration', desc: 'Link attendance checks to facial or fingerprint readers.' },
    { code: 'QR_ATTENDANCE', label: 'QR Code Check-in', desc: 'Enable quick QR code checks via parent/student scanning.' },
    { code: 'GPS_ATTENDANCE', label: 'GPS Geofenced Punching', desc: 'Restrict staff clock-ins to coordinates geofenced boundaries.' }
  ],
  EXAMINATION: [
    { code: 'ONLINE_EXAMS', label: 'Online Assessments Portal', desc: 'Submit exams and assessments directly via student terminals.' },
    { code: 'OMR_EVALUATION', label: 'OMR Evaluator Integration', desc: 'Scan OMR sheets and automatically extract exam marks.' },
    { code: 'AI_EVALUATION', label: 'AI Evaluation Assistant', desc: 'Use AI grading models to score written/essay sections.' }
  ],
  PATIENTS: [
    { code: 'PATIENT_PORTAL', label: 'Patient Self Service Booking', desc: 'Patients can schedule appointments online.' },
    { code: 'EMR_SNAPSHOT', label: 'Electronic Medical Record Snapshots', desc: 'Unified medical timelines for all diagnoses.' }
  ],
  HRMS: [
    { code: 'EMPLOYEE_DIRECTORY', label: 'Employee Directory master', desc: 'Central statutory employee log.' },
    { code: 'LEAVE_WORKFLOW', label: 'Leaves Workflow Routing', desc: 'Automatic routing of leave requests to managers.' }
  ]
};

const TOTAL_STEPS = 8;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [form, setForm] = useState({
    orgName: '',
    industryPackCode: 'SCHOOL_ERP',
    orgType: 'SCHOOL',
    orgSize: 'SMALL',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    expectedUsers: 50,
    requestedModules: ['STUDENT_MANAGEMENT'],
    requestedFeatures: [] as string[],
    adminName: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    primaryColor: '#6366f1',
    logoUrl: '',
  });

  const activePack = INDUSTRY_PACKS.find(p => p.id === form.industryPackCode) || INDUSTRY_PACKS[0];

  const updateField = (key: string, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const selectIndustryPack = (code: string) => {
    const pack = INDUSTRY_PACKS.find(p => p.id === code)!;
    const requiredModule = pack.defaultModulesMetadata.find(m => m.required)!.id;
    let orgType = 'SCHOOL';
    if (code === 'HOSPITAL_ERP') orgType = 'HOSPITAL';
    if (code === 'CORPORATE_ERP') orgType = 'COMPANY';
    setForm(prev => ({
      ...prev,
      industryPackCode: code,
      orgType,
      requestedModules: [requiredModule],
      requestedFeatures: []
    }));
  };

  const toggleModule = (modId: string) => {
    const meta = activePack.defaultModulesMetadata.find(m => m.id === modId);
    if (meta?.required) return;
    setForm(prev => {
      const current = [...prev.requestedModules];
      if (current.includes(modId)) {
        const featuresToRemove = OPTIONAL_FEATURES[modId]?.map(f => f.code) || [];
        return {
          ...prev,
          requestedModules: current.filter(id => id !== modId),
          requestedFeatures: prev.requestedFeatures.filter(f => !featuresToRemove.includes(f))
        };
      } else {
        return { ...prev, requestedModules: [...current, modId] };
      }
    });
  };

  const toggleFeature = (featCode: string) => {
    setForm(prev => {
      const current = [...prev.requestedFeatures];
      if (current.includes(featCode)) {
        return { ...prev, requestedFeatures: current.filter(c => c !== featCode) };
      } else {
        return { ...prev, requestedFeatures: [...current, featCode] };
      }
    });
  };

  const handleNext = () => {
    setError('');
    if (step === 3) {
      if (!form.orgName.trim()) { setError('Organization / Campus Name is required'); return; }
      if (!form.city.trim() || !form.state.trim()) { setError('City and State are required fields'); return; }
    } else if (step === 4) {
      if (!form.email.trim() || !form.phone.trim()) { setError('Official Email and Phone number are required'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return; }
    } else if (step === 7) {
      if (!form.adminName.trim()) { setError('Administrator full name is required'); return; }
      if (!form.adminPassword || form.adminPassword.length < 8) { setError('Password must be at least 8 characters long'); return; }
      if (form.adminPassword !== form.adminPasswordConfirm) { setError('Passwords do not match'); return; }
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

    let usersCount = 50;
    if (form.orgSize === 'SMALL') usersCount = 50;
    if (form.orgSize === 'MEDIUM') usersCount = 300;
    if (form.orgSize === 'LARGE') usersCount = 1200;
    if (form.orgSize === 'ENTERPRISE') usersCount = 5000;

    try {
      const result = await registerOrganizationWithAdminApi({
        orgName: form.orgName.trim(),
        orgType: form.orgType,
        orgSize: form.orgSize,
        industryPackCode: form.industryPackCode,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        expectedUsers: usersCount,
        requestedModules: form.requestedModules,
        requestedFeatures: form.requestedFeatures,
        adminName: form.adminName || undefined,
        adminPassword: form.adminPassword,
        primaryColor: form.primaryColor || '#6366f1',
        logoUrl: form.logoUrl || undefined,
      });
      setReferenceNumber(result.referenceNumber || '');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyRefNumber = () => {
    if (referenceNumber) {
      navigator.clipboard.writeText(referenceNumber).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const STEP_LABELS = [
    '1. Select Industry Pack',
    '2. Choose Campus Size',
    '3. Organization Details',
    '4. Contact Information',
    '5. Select Modules',
    '6. Feature Toggles',
    '7. Administrator Setup',
    '8. Review & Submit',
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 p-6 relative overflow-hidden select-none font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-xl bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-xl space-y-6 relative z-10">
          <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800 uppercase">Registration Submitted!</h1>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Your SaaS registration for <span className="text-indigo-600 font-extrabold">{form.orgName}</span> has been submitted to the AURXON platform team for review.
          </p>

          {/* Reference Number Highlight */}
          {referenceNumber && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Your Reference Number</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono font-black text-indigo-700 tracking-widest">{referenceNumber}</span>
                <button
                  onClick={copyRefNumber}
                  className="p-2 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 transition"
                >
                  {copied
                    ? <Check className="h-4 w-4 text-emerald-500" />
                    : <Copy className="h-4 w-4 text-indigo-400" />
                  }
                </button>
              </div>
              <p className="text-xs text-indigo-600 font-semibold leading-relaxed">
                Save this reference number. You will need it along with your Activation Key to launch your workspace.
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-left text-xs text-gray-600 space-y-4 font-semibold">
            <p className="text-gray-800 font-black tracking-wider uppercase">What Happens Next?</p>
            <ul className="list-disc pl-4 space-y-2 leading-relaxed">
              <li>Our founders will review your organization details within 1-2 business days.</li>
              <li>Upon approval, the platform team will technically verify and provision your workspace.</li>
              <li>You will receive an <span className="text-indigo-600 font-bold">Activation Key</span> at <span className="text-indigo-600 font-mono font-bold">{form.email}</span>.</li>
              <li>Use your Reference Number + Activation Key at <button onClick={() => router.push('/activate')} className="text-indigo-600 font-bold underline hover:text-indigo-700">aurxon.com/activate</button> to launch your workspace.</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/activate')}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all duration-300 active:scale-[0.98]"
            >
              Go to Activation Portal
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-wider transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-850 p-6 relative overflow-hidden select-none font-sans">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-sky-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto py-4 relative z-10 border-b border-gray-100">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-indigo-650 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm">
            A
          </div>
          <span className="text-sm font-black tracking-widest uppercase text-gray-800">AURXON</span>
        </div>
        <button onClick={() => router.push('/')} className="text-xs font-bold text-gray-400 hover:text-gray-650 transition">
          Sign In
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10 w-full">
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl p-8 shadow-xl relative">
          
          {/* Progress bar */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Step {step} of {TOTAL_STEPS}</span>
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-800">{STEP_LABELS[step - 1]}</h2>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
                <div
                  key={s}
                  className={`h-1.5 w-5 rounded-full transition-all duration-300 ${s <= step ? 'bg-indigo-500' : 'bg-gray-100'}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 flex gap-3 text-xs text-rose-600 font-semibold animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* STEP 1: INDUSTRY PACK */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 animate-fade-in">
                {INDUSTRY_PACKS.map(pack => {
                  const Icon = pack.icon;
                  const isSelected = form.industryPackCode === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => selectIndustryPack(pack.id)}
                      className={`flex gap-4 p-5 text-left rounded-2xl border transition-all duration-350 select-none ${
                        isSelected 
                          ? 'border-indigo-200 bg-indigo-50/30 shadow-md ring-1 ring-indigo-200/50' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'bg-gradient-to-tr from-indigo-500 to-indigo-650 text-white shadow-sm' : 'bg-gray-50 text-gray-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-800">{pack.label}</p>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{pack.description}</p>
                      </div>
                      <div className="ml-auto flex items-center shrink-0">
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-200 bg-transparent'
                        }`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: ORG SIZE */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {ORG_SIZES.map(size => {
                  const isSelected = form.orgSize === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => updateField('orgSize', size.id)}
                      className={`flex flex-col p-5 text-left rounded-2xl border transition-all duration-300 select-none ${
                        isSelected 
                          ? 'border-indigo-200 bg-indigo-50/20 shadow-md ring-1 ring-indigo-200/30' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-gray-50 text-gray-450 border border-gray-100">
                          {size.range}
                        </span>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-250 bg-transparent'
                        }`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider text-gray-800">{size.label}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-snug">{size.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 3: ORG DETAILS */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Organization / Campus Name *</label>
                  <input
                    type="text" required
                    placeholder="e.g. Saffron Academy Campus"
                    value={form.orgName}
                    onChange={e => updateField('orgName', e.target.value)}
                    className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">City *</label>
                    <input
                      type="text" required
                      placeholder="e.g. New Delhi"
                      value={form.city}
                      onChange={e => updateField('city', e.target.value)}
                      className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">State *</label>
                    <input
                      type="text" required
                      placeholder="e.g. Delhi"
                      value={form.state}
                      onChange={e => updateField('state', e.target.value)}
                      className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Physical Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 4, Dwarka Hub"
                    value={form.address}
                    onChange={e => updateField('address', e.target.value)}
                    className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: CONTACT INFO */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Official Email *</label>
                  <input
                    type="email" required
                    placeholder="e.g. administrator@campus.com"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                  />
                  <p className="text-[10px] text-gray-400 font-semibold">The workspace approval keys and instructions will be sent here.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Official Phone / Mobile *</label>
                  <input
                    type="text" required
                    placeholder="e.g. +91 98765 43210"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: MODULES */}
            {step === 5 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[11px] text-gray-450 font-semibold mb-2">Select modules to bootstrap. System core modules are auto-checked.</p>
                {activePack.defaultModulesMetadata.map(mod => {
                  const isSelected = form.requestedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      disabled={mod.required}
                      onClick={() => toggleModule(mod.id)}
                      className={`flex gap-4 p-4 text-left rounded-2xl border w-full transition select-none ${
                        isSelected ? 'border-indigo-150 bg-indigo-50/10' : 'border-gray-100 bg-white hover:border-gray-200'
                      } ${mod.required ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-wider text-gray-800">{mod.name}</p>
                          {mod.required && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200">Required</span>}
                        </div>
                        <p className="text-[10px] text-gray-450 leading-relaxed font-semibold">{mod.description}</p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-200 bg-transparent'
                        }`}>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 6: FEATURES */}
            {step === 6 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-[11px] text-gray-450 font-semibold mb-2">Toggle optional capabilities for your enabled modules.</p>
                {form.requestedModules.map(modId => {
                  const features = OPTIONAL_FEATURES[modId];
                  if (!features || features.length === 0) return null;
                  const modName = activePack.defaultModulesMetadata.find(m => m.id === modId)?.name || modId;
                  return (
                    <div key={modId} className="rounded-2xl border border-gray-100 p-5 space-y-3.5">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-1.5">{modName}</h4>
                      <div className="space-y-3">
                        {features.map(feat => {
                          const isChecked = form.requestedFeatures.includes(feat.code);
                          return (
                            <button
                              key={feat.code}
                              type="button"
                              onClick={() => toggleFeature(feat.code)}
                              className="flex items-start gap-3 text-left w-full select-none"
                            >
                              <div className={`mt-0.5 shrink-0 h-4 w-4 rounded border flex items-center justify-center ${
                                isChecked ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300'
                              }`}>
                                {isChecked && <Check className="h-2.5 w-2.5" />}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black text-gray-800 leading-snug">{feat.label}</p>
                                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{feat.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {form.requestedModules.every(m => !OPTIONAL_FEATURES[m]?.length) && (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 text-xs text-gray-400 font-medium">
                    No optional features available for the selected modules.
                  </div>
                )}
              </div>
            )}

            {/* STEP 7: ADMIN CREDENTIALS */}
            {step === 7 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-start gap-3 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                  <KeyRound className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-700 font-semibold leading-relaxed">
                    Set up your workspace administrator credentials. These will be used to access your organization's workspace after activation.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">
                    <User className="h-3 w-3 inline mr-1" />
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={form.adminName}
                    onChange={e => updateField('adminName', e.target.value)}
                    className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Admin Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.adminPassword}
                      onChange={e => updateField('adminPassword', e.target.value)}
                      className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.adminPasswordConfirm}
                      onChange={e => updateField('adminPasswordConfirm', e.target.value)}
                      className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Primary Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.primaryColor}
                        onChange={e => updateField('primaryColor', e.target.value)}
                        className="h-10 w-10 rounded-xl border border-gray-200 cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-gray-600">{form.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-450">Logo URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={form.logoUrl}
                      onChange={e => updateField('logoUrl', e.target.value)}
                      className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3.5 text-xs text-gray-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/10 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: REVIEW & SUBMIT */}
            {step === 8 && (
              <div className="space-y-4 animate-fade-in text-xs font-semibold text-gray-600">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5 shadow-sm">
                  <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-50 pb-2">Workspace Package Details</h4>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Institution Name</span>
                      <p className="text-gray-800 mt-1 font-bold">{form.orgName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Workspace Size</span>
                      <p className="text-gray-800 mt-1 font-bold">{ORG_SIZES.find(o => o.id === form.orgSize)?.label}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Contact Email</span>
                      <p className="text-gray-800 mt-1 font-mono font-bold">{form.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Industry Pack</span>
                      <p className="text-gray-800 mt-1 font-bold">{activePack.label}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Administrator</span>
                      <p className="text-gray-800 mt-1 font-bold">{form.adminName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">City / State</span>
                      <p className="text-gray-800 mt-1 font-bold">{form.city}{form.state ? `, ${form.state}` : ''}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Requested Modules</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.requestedModules.map(modId => {
                        const name = activePack.defaultModulesMetadata.find(m => m.id === modId)?.name || modId;
                        return (
                          <span key={modId} className="px-2.5 py-1 rounded bg-gray-50 border border-gray-100 text-[9px] text-gray-500 font-extrabold uppercase tracking-wide">
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {form.requestedFeatures.length > 0 && (
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Toggled Features</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.requestedFeatures.map(featCode => {
                          const allFeats = Object.values(OPTIONAL_FEATURES).flat();
                          const label = allFeats.find(f => f.code === featCode)?.label || featCode;
                          return (
                            <span key={featCode} className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-[9px] text-indigo-650 font-extrabold uppercase tracking-wide">
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color preview */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl border border-gray-100 shadow-sm" style={{ backgroundColor: form.primaryColor }} />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Brand Color: <span className="font-mono text-gray-700">{form.primaryColor}</span></span>
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-50/30 p-4 border border-indigo-100/50 text-[11px] text-indigo-650 flex gap-2.5">
                  <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">Your trial includes 30 days of free access. After platform team approval, you will receive your Activation Key at the registered email. No credit card required.</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-400 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-black uppercase tracking-wider text-white shadow-md transition"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  id="submit-registration-btn"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-600 hover:to-indigo-700 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all duration-300 disabled:opacity-60"
                >
                  {loading ? 'Submitting…' : 'Submit Registration'}
                </button>
              )}
            </div>

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto py-4 text-center text-[10px] text-gray-450 border-t border-gray-100 relative z-10 font-bold">
        © 2026 AURXON ERP Lite. Enterprise-grade SaaS Operating System.
      </footer>
    </div>
  );
}
