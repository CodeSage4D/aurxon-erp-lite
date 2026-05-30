'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api';
import { Shield, Sparkles, LogIn, ArrowRight, UserCheck, Users, CreditCard, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setTheme('light');
    } else {
      root.classList.add('dark');
      setTheme('dark');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginApi(email, password);
      if (data.user.role === 'PARENT') {
        router.push('/parent');
      } else if (data.user.role === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-500 sm:px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground shadow-sm hover-lift transition-all"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-8 z-10 relative">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover-lift">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground">
            AURXON <span className="text-primary">ERP Lite</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Next-Generation Educational Management
          </p>
        </div>

        {/* Login form Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurxon.com"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Secure Sign In</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Premium Onboarding & School Sales Demo Portal */}
        <div className="glass rounded-3xl p-6 border border-border/80 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/30 to-accent/30" />
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Explore AURXON Demo School</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
            Bypass standard login credential pools. Click a role profile below to explore simplified dashboards, live roll-call operations, Stripe fee checkouts, and executive Recharts compliance trends in our simulated campus.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => autofill('admin@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors truncate">Principal Cockpit</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">Oversee school analytics</div>
              </div>
            </button>
            
            <button
              onClick={() => autofill('teacher1@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-emerald-500 transition-colors truncate">Teacher Desk</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">Grade tasks & take roll-call</div>
              </div>
            </button>

            <button
              onClick={() => autofill('parent@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-rose-500 transition-colors truncate">Parent Portal</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">Track children & pay dues</div>
              </div>
            </button>

            <button
              onClick={() => autofill('student@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-indigo-500 transition-colors truncate">Student Desk</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">Check timetables & homework</div>
              </div>
            </button>

            <button
              onClick={() => autofill('accountant@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group sm:col-span-2"
            >
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors truncate">Finance Desk</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">Oversee school expense ledgers & statutory audits</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
