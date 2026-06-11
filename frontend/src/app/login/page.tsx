'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, switchContextApi } from '@/lib/api';
import { Shield, Sparkles, LogIn, AlertTriangle, HelpCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [toast, setToast] = useState('');

  // Branding states
  const [branding, setBranding] = useState<any>(null);
  const [loadingBranding, setLoadingBranding] = useState(true);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resolveBranding = async () => {
      const host = window.location.hostname;
      const parts = host.split('.');
      let slug = '';

      if (parts.length > 1) {
        const isLocalhost = host.includes('localhost');
        if (isLocalhost) {
          if (parts.length >= 2 && parts[1].startsWith('localhost')) {
            slug = parts[0];
          }
        } else {
          if (host.includes('aurxon')) {
            slug = parts[0];
          } else {
            slug = host; // custom domain resolution
          }
        }
      }

      if (slug && slug !== 'www') {
        try {
          const res = await fetch(`http://localhost:5000/auth/institution/${encodeURIComponent(slug)}`);
          if (res.ok) {
            const data = await res.json();
            setBranding(data);
            if (data.brandColor) {
              document.documentElement.style.setProperty('--primary', data.brandColor);
            }
          }
        } catch (e) {
          console.warn('Failed to resolve branding (offline). Using default branding.');
        } finally {
          setLoadingBranding(false);
        }
      } else {
        setLoadingBranding(false);
      }
    };

    resolveBranding();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginApi(email, password);
      
      if (data.user && (data.user.role === 'SUPER_ADMIN' || data.user.teamRole)) {
        setError('Access Denied: Administrative and founder credentials cannot log in on the public portal. Please navigate to the secure Founder portal.');
        localStorage.removeItem('aurxon_token');
        localStorage.removeItem('aurxon_user');
        localStorage.removeItem('aurxon_context');
        localStorage.removeItem('aurxon_memberships');
        return;
      }

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

  const getPortalTitle = () => {
    if (branding) {
      return branding.displayName;
    }
    return 'Secure Workspace Login';
  };

  const getPortalSubtitle = () => {
    if (branding) {
      return branding.portalTitle || 'Student & Staff Portal';
    }
    return 'Sign in to access your organization portal.';
  };

  // 1. RENDER LOADING SKELETON
  if (loadingBranding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 relative overflow-hidden">
        <div className="w-full max-w-md space-y-8 animate-pulse text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-secondary shadow-md" />
          <div className="h-7 bg-secondary rounded w-2/3 mx-auto" />
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
          <div className="glass rounded-3xl p-8 border border-border space-y-6">
            <div className="h-4 bg-secondary rounded w-1/4" />
            <div className="h-10 bg-secondary rounded-xl w-full" />
            <div className="h-4 bg-secondary rounded w-1/4" />
            <div className="h-10 bg-secondary rounded-xl w-full" />
            <div className="h-12 bg-secondary rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER SUSPENDED SCREEN
  if (branding && branding.status === 'SUSPENDED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 relative overflow-hidden">
        <div className="w-full max-w-md text-center space-y-6 z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500">
            <AlertTriangle className="h-8 w-8 animate-bounce" />
          </div>
          <div className="glass rounded-3xl p-8 border border-red-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Portal Suspended</h2>
            <p className="mt-4 text-xs font-semibold text-zinc-550 leading-relaxed">
              Access to <span className="text-red-500 font-bold">{branding.displayName}</span> has been temporarily suspended by the platform administrator.
            </p>
            <p className="mt-2 text-[10px] text-zinc-500 font-mono">
              Please contact support@aurxon.com or your institution administrator.
            </p>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">Powered by AURXON</p>
        </div>
      </div>
    );
  }

  // 3. RENDER EXPIRED SCREEN
  if (branding && branding.status === 'EXPIRED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 relative overflow-hidden">
        <div className="w-full max-w-md text-center space-y-6 z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <AlertTriangle className="h-8 w-8 animate-pulse" />
          </div>
          <div className="glass rounded-3xl p-8 border border-amber-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Licensing Expired</h2>
            <p className="mt-4 text-xs font-semibold text-zinc-550 leading-relaxed">
              The licensing quota for <span className="text-amber-500 font-bold">{branding.displayName}</span> has expired or remains inactive.
            </p>
            <p className="mt-2 text-[10px] text-zinc-500 font-mono">
              Workspace administration must renew the subscription to unlock access.
            </p>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">Powered by AURXON</p>
        </div>
      </div>
    );
  }

  // 4. RENDER NORMAL PORTAL LOGIN
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-500 sm:px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-text shadow-xl border border-primary/20 uppercase tracking-wide">
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
          {branding && branding.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt="School Logo" 
              className="mx-auto h-16 w-16 object-contain rounded-2xl bg-card p-1 shadow-lg hover-lift"
              onError={(e) => {
                // Fallback if logo fails to load
                (e.target as any).src = '';
                (e.target as any).className = 'hidden';
              }}
            />
          ) : (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-text shadow-lg shadow-primary/30 hover-lift">
              <Shield className="h-7 w-7" />
            </div>
          )}
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground animate-fade-in uppercase">
            {getPortalTitle()}
          </h2>
          <p className="mt-2 text-sm text-zinc-500 font-semibold uppercase tracking-tight">
            {getPortalSubtitle()}
          </p>
        </div>

        {/* Login form Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-650" />
          
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Dynamic Notice Banner */}
            {branding && branding.portalMessage && (
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary font-bold flex gap-2 items-start leading-relaxed">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="uppercase text-[9px] block text-zinc-500 tracking-wider">Notice Board</span>
                  {branding.portalMessage}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-550/10 p-3 text-xs font-semibold text-red-650 backdrop-blur-sm space-y-2">
                <p>{error}</p>
                {(error.toLowerCase().includes('founder') || email.trim().toLowerCase() === 'founder@aurxon.com') && (
                  <button
                    type="button"
                    onClick={() => router.push('/founder/login')}
                    className="w-full mt-1.5 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    Go to Founder Portal Login
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.edu"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-placeholder outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => triggerToast('Please contact your administrator to reset your password.')}
                  className="text-xs font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
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
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-placeholder outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-text shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
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

            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-2 text-[11px] font-semibold text-zinc-500">
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Register School
              </button>
              <span className="hidden sm:inline text-border">•</span>
              <button
                type="button"
                onClick={() => router.push('/founder/login')}
                className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-bold"
              >
                Founder Portal
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
          <p className="text-[10px] text-zinc-500 font-medium">
            Powered by <span className="font-bold text-foreground">AURXON</span>
            {branding && (
              <span> • {branding.displayName} ERP</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
