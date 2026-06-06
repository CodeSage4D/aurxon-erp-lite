'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, switchContextApi } from '@/lib/api';
import { Shield, Sparkles, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-500 sm:px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-xl border border-primary/20 uppercase tracking-wide">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

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
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground animate-fade-in">
            Secure Workspace Login
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Sign in to access your organization portal.
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
                placeholder="admin@yourschool.edu"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => triggerToast('Please contact your administrator to reset your password.')}
                  className="text-xs font-semibold text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Forgot Password?
                </button>
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
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

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 text-xs font-semibold text-muted-foreground">
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Register Organization
              </button>
              <span className="hidden sm:inline text-border">•</span>
              <button
                type="button"
                onClick={() => triggerToast('Demo request registered! Our team will reach out to you shortly.')}
                className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Request Demo
              </button>
            </div>
          </form>
        </div>

        {/* Powered by footer */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground/40 font-medium">
            Powered by <span className="font-bold">Aurxon</span>
          </p>
        </div>
      </div>
    </div>
  );
}
