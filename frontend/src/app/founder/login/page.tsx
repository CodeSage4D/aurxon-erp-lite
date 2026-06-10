'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { founderLoginApi } from '@/lib/api';
import {
  Shield, Sparkles, LogIn, AlertTriangle, Eye, EyeOff,
  Lock, Mail, Terminal, ArrowLeft, Check, Zap, Globe, Activity
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function FounderLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('founder@aurxon.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in as founder
    const cached = localStorage.getItem('aurxon_user');
    if (cached) {
      try {
        const user = JSON.parse(cached);
        if (user.role === 'SUPER_ADMIN') {
          router.replace('/founder');
          return;
        }
      } catch (_) {}
    }
  }, []);

  const handleFounderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your credentials.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await founderLoginApi(email.trim(), password);

      localStorage.setItem('aurxon_token', data.access_token);
      localStorage.setItem('aurxon_user', JSON.stringify(data.user));
      localStorage.setItem('aurxon_memberships', JSON.stringify(data.memberships || []));
      localStorage.removeItem('aurxon_context');
      localStorage.removeItem('aurxon_impersonating');

      setSuccess(true);
      setTimeout(() => router.push('/founder'), 1200);
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed.';
      if (msg.includes('fetch') || msg.includes('Network')) {
        setError('Cannot reach server. Ensure the backend is running on port 5000.');
      } else if (msg.includes('Unauthorized') || msg.includes('credentials') || msg.includes('401')) {
        setError('Invalid credentials. Check your email and password.');
      } else if (msg.includes('Access denied') || msg.includes('forbidden') || msg.includes('403')) {
        setError('Access denied. Only AURXON platform founders are authorized.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? 'bg-[#07090f]'
          : 'bg-[#f0f4ff]'
      }`}
    >
      {/* ── Animated background glows ── */}
      {isDark ? (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-600/12 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-sky-500/5 blur-[100px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-500/12 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.04),transparent_70%)] pointer-events-none" />
        </>
      )}

      {/* Grid overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${isDark ? 'opacity-[0.03]' : 'opacity-[0.04]'}`}
        style={{
          backgroundImage: `linear-gradient(${isDark ? '#ffffff' : '#2563eb'} 1px, transparent 1px), linear-gradient(to right, ${isDark ? '#ffffff' : '#2563eb'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
        <button
          onClick={() => router.push('/login')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all group border
            ${isDark
              ? 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              : 'bg-black/5 border-black/10 text-zinc-600 hover:bg-black/10 hover:text-zinc-900'
            }`}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Workspace Login</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-bold uppercase border
            ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Online
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-bold transition
              ${isDark
                ? 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                : 'bg-black/5 border-black/10 text-zinc-500 hover:bg-black/10'
              }`}
            title="Toggle theme"
          >
            <Activity className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="w-full max-w-md z-10 relative space-y-7">

        {/* Branding */}
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="mx-auto relative w-fit">
            <div className={`h-[72px] w-[72px] mx-auto rounded-[20px] flex items-center justify-center shadow-2xl border relative overflow-hidden
              ${isDark
                ? 'bg-gradient-to-br from-blue-600/80 to-indigo-700/80 border-blue-500/30 shadow-blue-500/20'
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400/30 shadow-blue-600/30'
              }`}
            >
              {/* Shield glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
              <Shield className="h-9 w-9 text-white relative z-10" strokeWidth={1.5} />
            </div>
            {/* Pulse rings */}
            <div className={`absolute inset-[-8px] rounded-[26px] border animate-ping pointer-events-none opacity-20
              ${isDark ? 'border-blue-500' : 'border-blue-600'}`}
              style={{ animationDuration: '3s' }}
            />
          </div>

          <div className="space-y-1.5">
            <h1 className={`text-3xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              AURXON OS
            </h1>
            <div className={`flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
              ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              <Terminal className="h-3 w-3" />
              <span>Founder Command Cockpit</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className={`rounded-3xl p-7 relative overflow-hidden border shadow-2xl
          ${isDark
            ? 'bg-white/[0.03] border-white/[0.07] shadow-black/60 backdrop-blur-xl'
            : 'bg-white border-zinc-200/80 shadow-zinc-200/60 backdrop-blur-xl'
          }`}
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl" />

          <form className="space-y-5" onSubmit={handleFounderLogin} noValidate>

            {/* Restricted Channel Banner */}
            <div className={`flex gap-2.5 items-start p-3.5 rounded-xl border text-xs leading-relaxed
              ${isDark
                ? 'bg-amber-500/5 border-amber-500/15 text-amber-400/80'
                : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${isDark ? 'text-amber-500' : 'text-amber-500'}`} />
              <div>
                <span className={`block text-[9px] font-black uppercase tracking-wider mb-0.5
                  ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>
                  Restricted Channel
                </span>
                Access exclusively authorized for the AURXON Board of Directors. All authentication attempts are statefully logged.
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className={`flex gap-2.5 items-start p-3.5 rounded-xl border text-xs font-medium leading-relaxed animate-fade-in
                ${isDark
                  ? 'bg-red-500/8 border-red-500/20 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className={`flex gap-2.5 items-center p-3.5 rounded-xl border text-xs font-bold animate-fade-in
                ${isDark
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Authenticated. Loading Command Center...</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Founder ID / Email Address
              </label>
              <div className="relative group">
                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors
                  ${isDark ? 'text-zinc-600 group-focus-within:text-blue-400' : 'text-zinc-400 group-focus-within:text-blue-500'}`}>
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="founder@aurxon.com"
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all
                    ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/15'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15'
                    }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Master Encryption Passphrase
              </label>
              <div className="relative group">
                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors
                  ${isDark ? 'text-zinc-600 group-focus-within:text-blue-400' : 'text-zinc-400 group-focus-within:text-blue-500'}`}>
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••••••"
                  className={`block w-full rounded-xl border py-3 pl-10 pr-12 text-sm font-medium outline-none transition-all
                    ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/15'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors
                    ${isDark ? 'text-zinc-600 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className={`relative w-full py-3.5 rounded-xl text-sm font-black tracking-wider uppercase text-white transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg active:scale-[0.99]
                ${success
                  ? 'bg-emerald-600 shadow-emerald-600/25 focus:ring-emerald-500/40'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25 hover:shadow-blue-600/40 hover:shadow-xl hover:-translate-y-0.5'
                }
                ${isDark ? 'focus:ring-offset-[#07090f]' : 'focus:ring-offset-white'}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : success ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Authenticate &amp; Command</span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { icon: Shield, label: 'Encrypted Channel' },
            { icon: Globe, label: 'Audit Logged' },
            { icon: Zap, label: 'JWT Secured' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase border tracking-wider
                ${isDark
                  ? 'bg-white/[0.03] border-white/[0.06] text-zinc-500'
                  : 'bg-black/[0.03] border-black/[0.06] text-zinc-500'
                }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            AURXON OS Control-Plane Layer V4.0
          </p>
          <p className={`text-[9px] ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
            Connections authenticated via asymmetric JWT certificates.
          </p>
        </div>
      </div>
    </div>
  );
}
