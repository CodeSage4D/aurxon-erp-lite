'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { changePasswordApi, switchContextApi } from '@/lib/api';
import { Shield, Sparkles, Key, Lock, ArrowRight } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. Call password change API
      await changePasswordApi(currentPassword, newPassword);
      setSuccess('Password changed successfully! Redirecting...');

      // Update the user stored in localStorage to mustChangePassword: false
      const storedUser = localStorage.getItem('aurxon_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.mustChangePassword = false;
        localStorage.setItem('aurxon_user', JSON.stringify(parsed));
      }

      // 2. Check memberships to determine where to redirect
      setTimeout(async () => {
        const membershipsStr = localStorage.getItem('aurxon_memberships');
        if (membershipsStr) {
          const memberships = JSON.parse(membershipsStr);
          if (memberships.length > 1) {
            router.push('/organization-select');
          } else if (memberships.length === 1) {
            const primary = memberships[0];
            try {
              await switchContextApi(primary.organizationId, primary.schoolId, primary.campusId);
              router.push('/dashboard');
            } catch (err) {
              router.push('/login');
            }
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-500 sm:px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10 relative animate-fade-in">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30 hover-lift">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Password Reset <span className="text-amber-500">Required</span>
          </h2>
          <p className="mt-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Institutional Access Security Gating
          </p>
        </div>

        {/* Change password card */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
          
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-500 leading-relaxed">
            Your account is currently flagged for a mandatory password change on first login. You must configure a secure personal password to unlock dashboard systems.
          </div>

          <form className="space-y-6" onSubmit={handleChangePassword}>
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-500 backdrop-blur-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Temporary / Current Password</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter temporary password"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 glass font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 glass font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 glass font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Activate My Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
