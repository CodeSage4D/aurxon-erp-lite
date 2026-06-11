'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, ShieldCheck, KeyRound, LifeBuoy, ArrowRight, 
  Terminal, Activity, Sparkles, LogIn, ExternalLink, AlertTriangle 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function RootPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Resolve subdomain on client side
    const host = window.location.hostname;
    const parts = host.split('.');
    let sub = '';

    if (parts.length > 1) {
      const isLocalhost = host.includes('localhost');
      if (isLocalhost) {
        if (parts.length >= 2 && parts[1].startsWith('localhost')) {
          sub = parts[0];
        }
      } else {
        if (parts.length >= 3) {
          sub = parts[0];
        }
      }
    }

    sub = sub.trim().toLowerCase();
    setSubdomain(sub);

    // If on a workspace subdomain, run auth checks and redirect
    if (sub && !['portal', 'founder', 'register', 'activate', 'support', 'www', 'aurxon-erp-lite'].includes(sub)) {
      const token = localStorage.getItem('aurxon_token');
      const context = localStorage.getItem('aurxon_context');
      const user = localStorage.getItem('aurxon_user');

      if (!token || !user) {
        router.replace('/login');
      } else if (!context) {
        router.replace('/organization-select');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  const getAbsoluteSubdomainUrl = (sub: string, path: string) => {
    if (typeof window === 'undefined') return '';
    const host = window.location.host;
    const protocol = window.location.protocol;
    const parts = host.split('.');
    const isLocalhost = host.includes('localhost');
    
    let baseDomain = '';
    if (isLocalhost) {
      baseDomain = host.includes('.') ? parts.slice(1).join('.') : host;
    } else {
      baseDomain = parts.length >= 3 ? parts.slice(parts.length - 2).join('.') : host;
    }
    
    return `${protocol}//${sub}.${baseDomain}${path}`;
  };

  const handleAccessWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setSlugError('');

    const slug = workspaceSlug.trim().toLowerCase();
    if (!slug) {
      setSlugError('Workspace slug is required.');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Invalid workspace slug format. (Use letters, numbers, and hyphens only)');
      return;
    }

    if (['portal', 'founder', 'register', 'activate', 'support', 'www', 'aurxon-erp-lite'].includes(slug)) {
      setSlugError('Reserved workspace slug name.');
      return;
    }

    // Redirect to subdomain
    window.location.href = getAbsoluteSubdomainUrl(slug, '/login');
  };

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!mounted) return null;

  // Render loading indicator for tenant subdomain redirection
  if (subdomain && !['portal', 'founder', 'register', 'activate', 'support', 'www', 'aurxon-erp-lite'].includes(subdomain)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
            Resolving Workspace Session...
          </p>
        </div>
      </div>
    );
  }

  // Render Platform Directory for root domain visitors
  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-6 relative overflow-hidden transition-colors duration-500 font-sans ${
        isDark ? 'bg-[#07090f] text-zinc-155' : 'bg-[#f0f4ff] text-zinc-850'
      }`}
    >
      {/* Glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto py-4 relative z-10 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl flex items-center justify-center font-black text-white text-md shadow-sm">
            A
          </div>
          <span className={`text-xs font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>AURXON</span>
        </div>

        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-full border text-xs font-bold transition
            ${isDark
              ? 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              : 'bg-black/5 border-black/10 text-zinc-655 hover:bg-black/10 hover:text-zinc-900'
            }`}
        >
          <Activity className="h-3.5 w-3.5 text-primary animate-pulse inline mr-1.5" />
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </header>

      {/* Main Grid content */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full">
          
          {/* Platform Description & Directory Links */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Central Portal Hub</span>
              </div>
              <h1 className={`text-4xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                AURXON PLATFORM OS
              </h1>
              <p className={`text-sm ${isDark ? 'text-zinc-450' : 'text-zinc-550'} leading-relaxed max-w-lg`}>
                Enterprise-grade SaaS solution supporting educational institutions, medical sectors, and corporate work environments.
              </p>
            </div>

            {/* Portal Directory list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  name: 'Founder Portal', 
                  desc: 'Telemetry, billing, diagnostics overrides', 
                  sub: 'portal', 
                  path: '/founder/login',
                  icon: ShieldCheck, 
                  color: 'border-blue-500/20 text-blue-500 bg-blue-500/5' 
                },
                { 
                  name: 'Organization Signup', 
                  desc: 'Register institution profile & modules', 
                  sub: 'register', 
                  path: '/register',
                  icon: Building2, 
                  color: 'border-purple-500/20 text-purple-500 bg-purple-500/5' 
                },
                { 
                  name: 'Licence Activation', 
                  desc: 'Activate key & technical build setup', 
                  sub: 'activate', 
                  path: '/activate',
                  icon: KeyRound, 
                  color: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' 
                },
                { 
                  name: 'Diagnostic Support', 
                  desc: 'Self-help guides & troubleshoot tickets', 
                  sub: 'support', 
                  path: '/support',
                  icon: LifeBuoy, 
                  color: 'border-amber-500/20 text-amber-500 bg-amber-500/5' 
                }
              ].map((portal, idx) => {
                const Icon = portal.icon;
                return (
                  <a
                    key={idx}
                    href={getAbsoluteSubdomainUrl(portal.sub, portal.path)}
                    className={`p-5 rounded-2xl border flex flex-col justify-between text-left transition-all hover-lift
                      ${isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]' : 'bg-white border-zinc-200 hover:shadow-md'}`}
                  >
                    <div>
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${portal.color} mb-3`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <h3 className={`text-xs font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-zinc-900'}`}>{portal.name}</h3>
                      <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mt-1 leading-snug`}>{portal.desc}</p>
                    </div>
                    <div className="flex justify-end pt-3">
                      <ExternalLink className={`h-3 w-3 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right panel: Workspace Access Selector */}
          <div className={`rounded-3xl p-8 border flex flex-col justify-center shadow-2xl relative
            ${isDark ? 'bg-white/[0.03] border-white/[0.08] backdrop-blur-xl' : 'bg-white border-zinc-200/80 backdrop-blur-xl'}`}
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl" />

            <form onSubmit={handleAccessWorkspace} className="space-y-6">
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Customer access</span>
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>ACCESS YOUR WORKSPACE</h2>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Enter your unique organization slug prefix to load the login page.</p>
              </div>

              {slugError && (
                <div className={`flex gap-2.5 items-start p-3.5 rounded-xl border text-xs font-semibold
                  ${isDark ? 'bg-red-500/5 border-red-500/15 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{slugError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className={`block text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>Workspace Slug Prefix *</label>
                <div className="flex rounded-xl overflow-hidden border border-border bg-input/40 relative items-center">
                  <input
                    type="text" required
                    value={workspaceSlug}
                    onChange={e => setWorkspaceSlug(e.target.value)}
                    placeholder="e.g. gvis"
                    className={`block flex-1 border-0 bg-transparent py-3.5 px-4 text-xs font-bold outline-none text-foreground
                      ${isDark ? 'placeholder-zinc-650' : 'placeholder-zinc-400'}`}
                  />
                  <div className={`px-4 py-3 text-xs font-mono font-bold border-l border-border shrink-0 select-none
                    ${isDark ? 'bg-white/[0.02] text-zinc-500' : 'bg-zinc-50 text-zinc-450'}`}>
                    .aurxon.com
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2
                  ${isDark
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-550 hover:to-indigo-700 shadow-blue-600/30'
                  }`}
              >
                <span>Enter Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 relative z-10 border-t border-border/40 mt-4">
        <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-450'}`}>
          AURXON Platform OS V4.0 • Distributed Software Infrastructure
        </p>
      </footer>
    </div>
  );
}
