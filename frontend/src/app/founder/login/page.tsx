'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { founderLoginApi } from '@/lib/api';
import { Shield, Sparkles, LogIn, AlertTriangle, Eye, EyeOff, Lock, Mail, Terminal, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function FounderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const { theme, toggleTheme } = useTheme();

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleFounderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await founderLoginApi(email, password);
      
      // Store credentials inside standard local keys
      localStorage.setItem('aurxon_token', data.access_token);
      localStorage.setItem('aurxon_user', JSON.stringify(data.user));
      localStorage.setItem('aurxon_memberships', JSON.stringify(data.memberships || []));
      localStorage.removeItem('aurxon_context');
      localStorage.removeItem('aurxon_impersonating');

      triggerToast('Founder Authenticated! Entering CommandCenter...');
      
      setTimeout(() => {
        router.push('/founder');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 px-4 transition-colors duration-500 sm:px-6 relative overflow-hidden font-sans">
      {/* Premium glowing background blobs */}
      <div className="absolute top-[-15%] left-[-15%] h-[50%] w-[50%] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] h-[50%] w-[50%] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] h-[30%] w-[30%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-bold text-zinc-950 shadow-2xl border border-cyan-400/20 uppercase tracking-wider animate-bounce">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>{toast}</span>
        </div>
      )}

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-zinc-400 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 transition-all hover:translate-x-[-2px] cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Workspace Login</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-8 z-10 relative">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-650 text-white shadow-xl shadow-cyan-500/10 border border-cyan-400/30 hover:scale-105 transition-transform duration-300">
            <Shield className="h-8 w-8 text-cyan-200" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-white uppercase bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">
            AURXON OS
          </h2>
          <p className="mt-2 text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-cyan-500" />
            Founder Command Cockpit
          </p>
        </div>

        {/* Login form Card */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-zinc-800/80">
          {/* Top colored line indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500" />
          
          <form className="space-y-6" onSubmit={handleFounderLogin}>
            
            {/* Warning Message Banner */}
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400 font-medium flex gap-2 items-start leading-relaxed">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="uppercase text-[9px] font-bold block text-amber-500 tracking-wider">Restricted Channel</span>
                Access exclusively authorized for the AURXON Board of Directors and core platform administrators. Every authorization attempt is statefully logged.
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400 backdrop-blur-sm flex gap-2 items-start animate-fade-in">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <div>{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Founder ID / Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ backgroundColor: '#09090b9a', color: '#ffffff', borderColor: '#27272a' }}
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-3 text-xs font-medium text-white placeholder-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    placeholder="name@aurxon.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Master Encryption Passphrase
                  </label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ backgroundColor: '#09090b9a', color: '#ffffff', borderColor: '#27272a' }}
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-10 text-xs font-medium text-white placeholder-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-950/25 transition-all hover:translate-y-[-1px] active:translate-y-[0px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Decrypting Key...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Authenticate & Command</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-zinc-500 font-mono">
            AURXON OS Control-Plane Layer V4.0
          </p>
          <p className="text-[9px] text-zinc-650">
            Authorized connection. Handshakes are authenticated via asymmetric RSA certificates.
          </p>
        </div>
      </div>
    </div>
  );
}
