'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound, ArrowRight, CheckCircle2, AlertCircle, Shield,
  Loader2, Copy, Check, LogIn, Building2
} from 'lucide-react';
import { verifyActivationKeyApi } from '@/lib/api';

export default function ActivatePage() {
  const router = useRouter();

  const [referenceNumber, setReferenceNumber] = useState('');
  const [activationKey, setActivationKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activationData, setActivationData] = useState<any>(null);
  const [copied, setCopied] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!referenceNumber.trim()) {
      setError('Please enter your Reference Number.');
      return;
    }
    if (!activationKey.trim()) {
      setError('Please enter your Activation Key.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyActivationKeyApi(referenceNumber.trim(), activationKey.trim());
      setActivationData(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Activation verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  if (success && activationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-xl bg-white border border-gray-100 rounded-3xl shadow-2xl p-10 space-y-6 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm">
              A
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-gray-800">AURXON</span>
          </div>

          {/* Success icon */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800 uppercase">
              Activation Package Verified
            </h1>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Your workspace for <span className="text-indigo-600 font-extrabold">{activationData.orgName}</span> has been verified successfully. Below is your activation package summary.
            </p>
          </div>

          {/* Package Details */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {[
              { label: 'Reference Number', value: activationData.referenceNumber, copyKey: 'ref' },
              { label: 'Organization', value: activationData.orgName },
              { label: 'Industry Pack', value: activationData.industry },
              { label: 'Subscription Plan', value: activationData.subscription },
              { label: 'Workspace URL', value: activationData.workspaceUrl, copyKey: 'url' },
              { label: 'Issue Date', value: activationData.issueDate ? new Date(activationData.issueDate).toLocaleDateString() : '—' },
              { label: 'Expiry Date', value: activationData.expiryDate ? new Date(activationData.expiryDate).toLocaleDateString() : '—' },
            ].map(({ label, value, copyKey }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 group">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800 font-mono">{value || '—'}</span>
                  {copyKey && value && (
                    <button
                      onClick={() => copyToClipboard(value, copyKey)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === copyKey
                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                        : <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-indigo-500" />
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modules */}
          {activationData.modules?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">Enabled Modules</p>
              <div className="flex flex-wrap gap-2">
                {activationData.modules.map((mod: string) => (
                  <span key={mod} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              Proceed to Login
            </button>
            <p className="text-center text-xs text-gray-400 font-medium">
              Use the credentials you configured during registration to log in to your workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-sky-100/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm">
              A
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-gray-800">AURXON</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition"
          >
            Sign In
          </button>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">
              Workspace Activation
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
              Enter your Reference Number and Activation Key sent by the AURXON platform team after workspace provisioning.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
          <Shield className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-700 font-medium leading-relaxed">
            Your activation key is a one-time secure access token. Keep it confidential and do not share it with anyone outside your organization.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700 font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500">
              Reference Number
            </label>
            <input
              id="reference-number-input"
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value.toUpperCase())}
              placeholder="AURX-2026-SCH-000145"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500">
              Activation Key
            </label>
            <input
              id="activation-key-input"
              type="text"
              value={activationKey}
              onChange={e => setActivationKey(e.target.value.toUpperCase())}
              placeholder="AURX-ACT-XXXX-XXXX-XXXX"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            id="verify-activation-btn"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Package…
              </>
            ) : (
              <>
                Verify & Unlock Workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={() => router.push('/register')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-500 transition"
          >
            <Building2 className="h-3.5 w-3.5" />
            Register Organization
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-gray-400 hover:text-indigo-500 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
