'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api';
import { ShieldCheck, Sparkles, LogIn, Lock, Mail, Users, ArrowRight } from 'lucide-react';

export default function TeamsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ensure light mode is applied for this white theme
    document.documentElement.classList.remove('dark');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginApi(email, password);
      
      // Check if user is an internal team member
      if (data.user && data.user.teamRole) {
        localStorage.setItem('aurxon_token', data.token);
        localStorage.setItem('aurxon_user', JSON.stringify(data.user));
        router.push('/teams/dashboard');
      } else {
        setError('Access Denied: Your account does not have internal team access permissions.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  const demoTeamMembers = [
    { email: 'founder@aurxon.com', label: 'Founder & Co-CEO', color: 'from-blue-600 via-indigo-600 to-slate-800' },
    { email: 'product@aurxon.com', label: 'Product Director', color: 'from-sky-500 to-indigo-600' },
    { email: 'support@aurxon.com', label: 'Support Manager', color: 'from-emerald-400 to-teal-600' },
    { email: 'sales@aurxon.com', label: 'Sales Executive', color: 'from-purple-500 to-indigo-500' },
    { email: 'cs@aurxon.com', label: 'Customer Success', color: 'from-slate-500 to-slate-700' },
    { email: 'finance@aurxon.com', label: 'Finance Manager', color: 'from-blue-500 via-slate-600 to-indigo-800' },
    { email: 'techadmin@aurxon.com', label: 'Technical Admin', color: 'from-indigo-500 via-purple-600 to-blue-700' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Dynamic background shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-slate-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-sky-400/10 via-blue-500/10 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition duration-300">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              AURXON <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TEAMS</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">SaaS Command Center Platform</p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Official Email</label>
              <div className="relative flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/10 transition-all duration-200">
                <Mail className="h-4.5 w-4.5 text-slate-400 absolute left-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aurxon.com"
                  className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Security Password</label>
              <div className="relative flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/10 transition-all duration-200">
                <Lock className="h-4.5 w-4.5 text-slate-400 absolute left-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Console...</span>
              ) : (
                <>
                  <span>Enter Security Control Plane</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts List */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" />
            <span>Autofill Team Member Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-0.5">
            {demoTeamMembers.map((member, idx) => (
              <button
                key={idx}
                onClick={() => autofill(member.email)}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/20 p-3 text-left transition hover:border-pink-500/50 hover:bg-slate-50 hover-lift group"
              >
                <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${member.color} p-0.5 shrink-0`}>
                  <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase group-hover:text-pink-500">
                    TM
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{member.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{member.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
