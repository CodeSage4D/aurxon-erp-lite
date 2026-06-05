'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, RefreshCw, KeyRound, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { validateActivationTokenApi, activateOrganizationApi } from '@/lib/api';

export default function ActivatePage() {
  const params = useParams();
  const router = useRouter();
  const rawToken = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orgDetails, setOrgDetails] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!rawToken) return;

    const validateToken = async () => {
      try {
        const details = await validateActivationTokenApi(rawToken);
        setOrgDetails(details);
      } catch (err: any) {
        setError(err.message || 'The activation link is invalid, has expired, or was already used.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [rawToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setActivating(true);

    try {
      await activateOrganizationApi(rawToken, password);
      setActivated(true);
      setTimeout(() => {
        router.push('/');
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Activation failed. Please try again.');
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white select-none relative">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Verifying Activation Token...</p>
        </div>
      </div>
    );
  }

  if (error && !activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white select-none p-6">
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="h-14 w-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Activation Error</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-bold text-zinc-400 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white select-none p-6">
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            <CheckCircle2 className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Workspace Activated!</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your workspace for <span className="text-sky-400 font-bold">{orgDetails?.orgName}</span> is now active.
          </p>
          <p className="text-[10px] text-zinc-500 animate-pulse">
            Redirecting to login portal in a few seconds...
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-black uppercase tracking-wider text-white transition"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070b13] text-white p-6 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-sky-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto py-4 relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <div className="h-9 w-9 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md">
            A
          </div>
          <span className="text-sm font-black tracking-widest uppercase bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">AURXON</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10 w-full">
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/50 pb-4">
            <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-lg shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-100">Setup Admin Password</h2>
              <p className="text-[10px] text-zinc-400">Activate your scaling corporate ERP workspace</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/40 border border-slate-800/60 p-4 space-y-2.5 text-[11px] font-semibold text-zinc-400">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-black">Institution Name</span>
              <p className="text-zinc-200 mt-0.5">{orgDetails?.orgName}</p>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-black">Administrator Email</span>
              <p className="text-indigo-400 font-mono font-bold mt-0.5">{orgDetails?.email}</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 flex gap-2.5 text-xs text-red-400 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Choose Admin Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-3 text-xs text-white outline-none focus:border-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3.5 top-[27px] text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Confirm Admin Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-3 text-xs text-white outline-none focus:border-sky-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={activating || !password || !confirmPassword}
              className="w-full mt-4 flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-black uppercase tracking-wider text-white shadow-lg disabled:opacity-50 transition-all duration-300 transform active:scale-[0.98]"
            >
              {activating ? 'Activating Workspace...' : 'Activate Workspace'}
              {!activating && <ChevronRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto py-4 text-center text-[10px] text-zinc-600 border-t border-slate-850/30 relative z-10">
        © 2026 AURXON ERP Lite. Secure Activation Gateway.
      </footer>
    </div>
  );
}
