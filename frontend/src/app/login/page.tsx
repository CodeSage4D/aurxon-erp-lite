'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, switchContextApi } from '@/lib/api';
import { Shield, Sparkles, LogIn, UserCheck, Users, CreditCard, GraduationCap, Briefcase } from 'lucide-react';

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
      
      if (data.user && data.user.mustChangePassword) {
        router.push('/change-password');
        return;
      }

      if (data.memberships && data.memberships.length > 1) {
        router.push('/organization-select');
      } else if (data.memberships && data.memberships.length === 1) {
        const primary = data.memberships[0];
        await switchContextApi(primary.organizationId, primary.schoolId, primary.campusId);
        router.push('/dashboard');
      } else {
        setError('Your account does not have any active organization memberships.');
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
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground animate-fade-in">
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

        {/* Demo Accounts Panel */}
        <div className="glass rounded-3xl p-6 border border-border/80 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/30 to-accent/30" />
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Select a Demo Role Profile</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
            Click one of the profiles below to autofill verified multi-tenant accounts from our Neon DB database.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => autofill('founder@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors truncate">Founder / SaaS Admin</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">founder@aurxon.com</div>
              </div>
            </button>
            
            <button
              onClick={() => autofill('admin@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-purple-500 transition-colors truncate">Institute Admin (DPS)</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">admin@aurxon.com</div>
              </div>
            </button>

            <button
              onClick={() => autofill('principal@rkmvp.edu')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-rose-500 transition-colors truncate">Principal (RKMVP)</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">principal@rkmvp.edu</div>
              </div>
            </button>

            <button
              onClick={() => autofill('teacher@rkmvp.edu')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group"
            >
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-indigo-500 transition-colors truncate">Teacher (RKMVP)</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">teacher@rkmvp.edu</div>
              </div>
            </button>

            <button
              onClick={() => autofill('consultant@aurxon.com')}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/30 p-3 text-left transition hover:border-primary hover:bg-card/80 hover-lift group sm:col-span-2"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-foreground group-hover:text-emerald-500 transition-colors truncate">Multi-Member Consultant (RKMVP + KPPHS)</div>
                <div className="text-[10px] text-muted-foreground font-medium truncate">consultant@aurxon.com (Tests Selection Screen)</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
