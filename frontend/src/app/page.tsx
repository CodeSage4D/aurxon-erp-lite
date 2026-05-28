'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api';
import { Shield, Sparkles, LogIn, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  // Apply default theme to body class
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
      await loginApi(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper autofill credentials
  const autofill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 transition-colors duration-300 dark:bg-zinc-950 sm:px-6">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/35 dark:shadow-indigo-500/15">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            AURXON <span className="text-indigo-600 dark:text-indigo-400">ERP Lite</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enterprise power with elegant simplicity
          </p>
        </div>

        {/* Login form Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurxon.com"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-zinc-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-zinc-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:shadow-indigo-500/10"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick login shortcuts for testing */}
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>Developer Quick Login Profiles</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => autofill('admin@aurxon.com')}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 shadow-sm transition hover:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50"
            >
              <span>Admin Desk</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
            </button>
            <button
              onClick={() => autofill('teacher1@aurxon.com')}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 shadow-sm transition hover:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50"
            >
              <span>Teacher Desk</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
            </button>
            <button
              onClick={() => autofill('accountant@aurxon.com')}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 shadow-sm transition hover:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50"
            >
              <span>Accountant Desk</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
            </button>
            <button
              onClick={() => autofill('student@aurxon.com')}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 shadow-sm transition hover:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50"
            >
              <span>Student Profile</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
            </button>
          </div>
          <p className="mt-3.5 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
            Password: <code className="rounded bg-zinc-200 px-1 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">password123</code> for all accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
