'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, Send, ArrowLeft, CheckCircle2, AlertTriangle,
  Activity, ShieldCheck, Mail, HelpCircle, Terminal, Clock, LifeBuoy
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';

export default function SupportPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch cached user email if present
    const cached = localStorage.getItem('aurxon_user');
    if (cached) {
      try {
        const user = JSON.parse(cached);
        if (user.email) setEmail(user.email);
      } catch (_) {}
    }
  }, []);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setSubject('');
      setMessage('');
    }, 1500);
  };

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-6 relative overflow-hidden transition-colors duration-500 font-sans ${
        isDark ? 'bg-[#07090f] text-zinc-150' : 'bg-[#f0f4ff] text-zinc-800'
      }`}
    >
      {/* Glow shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto py-4 relative z-10 border-b border-border/40 pb-4">
        <button
          onClick={() => router.push('/')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition border
            ${isDark
              ? 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              : 'bg-black/5 border-black/10 text-zinc-650 hover:bg-black/10 hover:text-zinc-900'
            }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Platform Directory</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-md shadow-sm">
            A
          </div>
          <span className={`text-xs font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>AURXON</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
          
          {/* Left panel - Diagnostics */}
          <div className={`rounded-3xl p-7 border flex flex-col justify-between shadow-2xl relative overflow-hidden
            ${isDark ? 'bg-white/[0.02] border-white/[0.06] backdrop-blur-xl' : 'bg-white border-zinc-200/80 backdrop-blur-xl'}`}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest
                  ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  <Terminal className="h-3.5 w-3.5 animate-pulse" />
                  <span>Interactive Telemetry</span>
                </div>
                <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  AURXON DIAGNOSTIC HUB
                </h1>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} leading-relaxed`}>
                  School-level node metrics, cloud cluster status logs, and active routing check systems.
                </p>
              </div>

              {/* Status Checker List */}
              <div className="space-y-3">
                {[
                  { name: 'API Gateway Tunnel', desc: 'Secure HTTPS/WSS cluster endpoints', latency: '24ms', status: 'ONLINE' },
                  { name: 'Neon Postgres Pool', desc: 'Statutory multi-tenant storage nodes', latency: '42ms', status: 'ONLINE' },
                  { name: 'Asymmetric JWT Security', desc: 'SHA-256 session token authorities', latency: '1.2ms', status: 'SECURE' },
                  { name: 'Notification Service Logs', desc: 'SMTP/SMS OTP verification queues', latency: '185ms', status: 'ONLINE' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between transition hover:scale-[1.01]
                    ${isDark ? 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]' : 'bg-zinc-50 border-zinc-150 hover:bg-zinc-100/60'}`}
                  >
                    <div className="space-y-1">
                      <span className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{item.name}</span>
                      <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1
                        ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                        {item.status}
                      </div>
                      <p className={`text-[9px] font-mono mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{item.latency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Help desk */}
            <div className={`mt-6 p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed
              ${isDark ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400/80' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
              <LifeBuoy className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase text-[9px] tracking-wider block mb-0.5">Automated Self-Healing</span>
                If you are locked out or cannot find your organization workspace URL, submit a ticket containing your registered business email and reference number.
              </div>
            </div>
          </div>

          {/* Right panel - Ticket Form */}
          <div className={`rounded-3xl p-7 border flex flex-col justify-between shadow-2xl relative
            ${isDark ? 'bg-white/[0.03] border-white/[0.07] backdrop-blur-xl' : 'bg-white border-zinc-200/80 backdrop-blur-xl'}`}
          >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl" />

            <form className="space-y-5" onSubmit={handleTicketSubmit}>
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Contact Desk</span>
                <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>SUBMIT SUPPORT TICKET</h2>
              </div>

              {error && (
                <div className={`flex gap-2.5 items-start p-3.5 rounded-xl border text-xs font-semibold
                  ${isDark ? 'bg-red-500/5 border-red-500/15 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={`flex gap-2.5 items-start p-3.5 rounded-xl border text-xs font-bold
                  ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-250 text-emerald-700'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="block uppercase text-[9px] mb-0.5">Ticket Dispatched!</span>
                    Your support request has been logged. Our diagnostic directors will respond shortly.
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>Registered Email Address *</label>
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className={`block w-full rounded-xl border py-3 px-4 text-xs font-medium outline-none transition-all
                    ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/15'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>Priority level</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className={`block w-full rounded-xl border py-3 px-3.5 text-xs font-bold outline-none transition-all
                      ${isDark ? 'bg-[#121520] border-white/[0.08] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  >
                    <option value="LOW">LOW (General Inquiry)</option>
                    <option value="MEDIUM">MEDIUM (Technical Question)</option>
                    <option value="HIGH">HIGH (Workspace Access Blocker)</option>
                    <option value="CRITICAL">CRITICAL (System Crash / Issue)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>Incident Category</label>
                  <select
                    className={`block w-full rounded-xl border py-3 px-3.5 text-xs font-bold outline-none transition-all
                      ${isDark ? 'bg-[#121520] border-white/[0.08] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  >
                    <option value="ACCESS">Workspace URL / Login issue</option>
                    <option value="ACTIVATION">Licence Key Verification</option>
                    <option value="BILLING">Billing / Subscription Renewal</option>
                    <option value="BUG">SaaS Interface Bug Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>Subject Description *</label>
                <input
                  type="text" required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Cannot verify activation key"
                  className={`block w-full rounded-xl border py-3 px-4 text-xs font-medium outline-none transition-all
                    ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/15'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15'
                    }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>Detailed Message Log *</label>
                <textarea
                  required rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe the steps to reproduce or details of the support requirement..."
                  className={`block w-full rounded-xl border py-3 px-4 text-xs font-medium outline-none transition-all resize-none
                    ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/15'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15'
                    }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2
                  ${isDark
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-550 hover:to-indigo-700 shadow-blue-600/30'
                  } disabled:opacity-50`}
              >
                {loading ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin" />
                    <span>Transmitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Diagnostic Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 relative z-10 border-t border-border/40 mt-4">
        <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          AURXON Cloud Diagnostics Desk v4.1 • SSL Encrypted
        </p>
      </footer>
    </div>
  );
}
