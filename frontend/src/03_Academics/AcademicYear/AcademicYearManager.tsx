'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, Power, AlertTriangle, Trash2, CalendarDays, Loader2, Sparkles } from 'lucide-react';
import { getAcademicYearsApi, createAcademicYearApi, activateAcademicYearApi, closeAcademicYearApi, deleteAcademicYearApi } from '@/lib/api';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
}

export default function AcademicYearManager() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    setLoading(true);
    try {
      const data = await getAcademicYearsApi();
      setAcademicYears(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    setSubmitting(true);
    setError('');
    try {
      const newYear = await createAcademicYearApi({ name, startDate, endDate });
      setAcademicYears((prev) => [newYear, ...prev]);
      setName('');
      setStartDate('');
      setEndDate('');
      triggerToast(`Academic Year "${name}" created successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to create academic year');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to activate academic year "${name}"? This will set all other years to inactive.`)) return;

    try {
      await activateAcademicYearApi(id);
      await loadAcademicYears();
      triggerToast(`Academic Year "${name}" is now ACTIVE.`);
    } catch (err: any) {
      setError(err.message || 'Failed to activate academic year');
    }
  };

  const handleClose = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to close academic year "${name}"? Closed years cannot be reactivated.`)) return;

    try {
      await closeAcademicYearApi(id);
      await loadAcademicYears();
      triggerToast(`Academic Year "${name}" closed.`);
    } catch (err: any) {
      setError(err.message || 'Failed to close academic year');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete academic year "${name}"? This operation is permanent.`)) return;

    try {
      await deleteAcademicYearApi(id);
      setAcademicYears((prev) => prev.filter((y) => y.id !== id));
      triggerToast(`Academic Year "${name}" deleted.`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete academic year');
    }
  };

  const getStatusBadge = (status: string, active: boolean) => {
    if (active) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20 shadow-sm animate-pulse">
          <Check className="h-3 w-3" />
          ACTIVE
        </span>
      );
    }
    switch (status) {
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive border border-destructive/20 shadow-sm">
            CLOSED
          </span>
        );
      case 'PLANNED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/20 shadow-sm">
            PLANNED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/25 border border-primary/20 flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Academic Year Manager
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Configure, deploy, and archive academic years. Only one year can be active at a time.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive backdrop-blur-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-border space-y-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Create Academic Year</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                Initialize a new term structure
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Academic Year Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-2027"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 glass"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Year
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List and Management */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="glass rounded-3xl p-12 border border-border flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
              <p className="text-sm font-bold text-muted-foreground">Loading Academic Years...</p>
            </div>
          ) : academicYears.length === 0 ? (
            <div className="glass rounded-3xl p-12 border border-border flex flex-col items-center justify-center text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm font-bold text-muted-foreground">No Academic Years created yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Get started by creating one on the left panel.</p>
            </div>
          ) : (
            academicYears.map((year) => (
              <div
                key={year.id}
                className={`glass rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between md:flex-row md:items-center gap-4 ${
                  year.isActive
                    ? 'border-emerald-500/40 shadow-md bg-emerald-500/[0.01]'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {year.isActive && (
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-foreground">{year.name}</span>
                    {getStatusBadge(year.status, year.isActive)}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Starts: {new Date(year.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-accent" />
                      Ends: {new Date(year.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  {!year.isActive && year.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleActivate(year.id, year.name)}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      <Power className="h-3.5 w-3.5" />
                      Activate
                    </button>
                  )}
                  {year.isActive && (
                    <button
                      onClick={() => handleClose(year.id, year.name)}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                    >
                      <Power className="h-3.5 w-3.5" />
                      Close Year
                    </button>
                  )}
                  {!year.isActive && (
                    <button
                      onClick={() => handleDelete(year.id, year.name)}
                      className="flex items-center justify-center h-9 w-9 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
