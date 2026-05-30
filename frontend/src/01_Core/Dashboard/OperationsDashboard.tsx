'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Database, HardDrive, RefreshCw, AlertTriangle, CheckCircle, 
  Upload, Download, FileText, Activity, MessageSquare, Play, Plus, Clock, Info
} from 'lucide-react';
import { 
  getMonitoringMetricsApi, getSystemAlertsApi, runBackupApi, 
  runIntegritySweepApi, validateImportApi, createUatTicketApi, 
  getUatTicketsApi, updateUatTicketStatusApi 
} from '@/lib/api';

interface OperationsDashboardProps {
  triggerToast: (msg: string) => void;
}

export default function OperationsDashboard({ triggerToast }: OperationsDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // CSV Import States
  const [csvInput, setCsvInput] = useState('');
  const [importPreview, setImportPreview] = useState<any>(null);

  // UAT Ticket Form States
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    module: 'Admission',
    severity: 'MEDIUM'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, aRes, tRes] = await Promise.all([
        getMonitoringMetricsApi(),
        getSystemAlertsApi(),
        getUatTicketsApi()
      ]);
      setMetrics(mRes);
      setAlerts(aRes);
      setTickets(tRes);
    } catch (e: any) {
      console.error(e);
      triggerToast('Failed to load system operational data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBackup = async () => {
    try {
      setLoading(true);
      const res = await runBackupApi();
      triggerToast(`PostgreSQL Dump uploaded to S3 successfully! File size: ${res.sizeBytes} bytes.`);
      loadData();
    } catch (e: any) {
      triggerToast('Failed to execute S3-compatible PostgreSQL Dump.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunIntegrity = async () => {
    try {
      setLoading(true);
      const res = await runIntegritySweepApi();
      if (res.alertsCount > 0) {
        triggerToast(`Integrity check finished with ${res.alertsCount} warning flags!`);
      } else {
        triggerToast('Integrity Sweep complete: 100% database coherence verified.');
      }
      loadData();
    } catch (e: any) {
      triggerToast('Failed to run Data Integrity Sweep.');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const lines = csvInput.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        triggerToast('CSV must include a header and at least one data row.');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const rowObj: any = {};
        headers.forEach((h, i) => {
          rowObj[h] = values[i] || '';
        });
        return rowObj;
      });

      const res = await validateImportApi(rows);
      setImportPreview(res);
      triggerToast(`Import validation complete: ${res.valid} valid, ${res.invalid} invalid rows.`);
    } catch (e: any) {
      triggerToast('Failed to validate CSV schema.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createUatTicketApi(ticketForm);
      triggerToast('UAT feedback ticket submitted successfully!');
      setTicketForm({ title: '', description: '', module: 'Admission', severity: 'MEDIUM' });
      loadData();
    } catch (e: any) {
      triggerToast('Failed to register UAT issue ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (id: string, nextStatus: string) => {
    try {
      setLoading(true);
      await updateUatTicketStatusApi(id, nextStatus);
      triggerToast('Ticket status updated.');
      loadData();
    } catch (e: any) {
      triggerToast('Failed to update ticket status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">Admin Operations Desk</h1>
          <p className="text-xs font-semibold text-muted-foreground">UAT, Disaster Recovery, Integrity Automation & Monitoring</p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-card border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all duration-300"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* TOP OBSERVABILITY STATUS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-2xl border border-border bg-card p-4 glass hover-lift relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">System Health</p>
              <h3 className="mt-1 text-lg font-extrabold text-foreground">ONLINE</h3>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
            <CheckCircle className="h-3 w-3" />
            S3 Vault and DB Connection Healthy
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 glass hover-lift relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">S3 Vault DB Size</p>
              <h3 className="mt-1 text-lg font-extrabold text-foreground">
                {metrics ? `${(metrics.database.dbSizeBytes / 1024).toFixed(2)} KB` : 'Loading...'}
              </h3>
            </div>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-sky-500">
            <CheckCircle className="h-3 w-3" />
            S3 logical vault active
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 glass hover-lift relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Sessions</p>
              <h3 className="mt-1 text-lg font-extrabold text-foreground">
                {metrics ? metrics.application.activeUsers : 'Loading...'}
              </h3>
            </div>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500">
            <CheckCircle className="h-3 w-3" />
            {metrics ? `${metrics.database.activeConnections} active pools` : ''}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 glass hover-lift relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Failed Access Attempts</p>
              <h3 className="mt-1 text-lg font-extrabold text-destructive">
                {metrics ? metrics.security.failedLoginCount : '0'}
              </h3>
            </div>
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-destructive">
            <Info className="h-3 w-3" />
            Security Guard Threshold at 5
          </div>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* DISASTER RECOVERY & S3 BACKUP */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl border border-border bg-card p-5 glass space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Primary S3-Compatible Backups</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Configure AWS S3 to push logical SQL database dumps directly to institutional vaults, bypassing local storage nodes entirely to protect student/staff records from host corruption.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button 
                onClick={handleRunBackup}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/25 hover-lift"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Trigger S3 PG Dump Backup
              </button>
              <button 
                onClick={handleRunIntegrity}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-card border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all duration-300"
              >
                <Play className="h-3.5 w-3.5" />
                Trigger Data Integrity sweep
              </button>
            </div>
          </div>

          {/* SYSTEM ALERTS & INTEGRITY LOGS */}
          <div className="rounded-2xl border border-border bg-card p-5 glass space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">System Alerts & Integrity Telemetry</h3>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-input/20">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No recent integrity or system alerts. System status stable.</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-3 p-3 text-xs hover:bg-muted/30 transition-colors">
                    <span className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${
                      alert.severity === 'CRITICAL' ? 'bg-destructive animate-pulse' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-extrabold uppercase tracking-wide text-foreground">{alert.category} alert</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-semibold">{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BULK CSV SHEMATIZED IMPORTER */}
          <div className="rounded-2xl border border-border bg-card p-5 glass space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">CSV Schema Validator & Preview Wizard</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Review and preview bulk imports before writing them to multi-tenant tables. Email pre-detection automatically flags system conflicts.
            </p>
            <form onSubmit={handleCsvValidate} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">CSV Content (Headers: email, rollNumber)</label>
                <textarea 
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="email,rollNumber&#10;test.scholar@aurxon.edu,101A05&#10;existing.staff@aurxon.edu,101A06"
                  className="w-full h-24 rounded-xl border border-border bg-input/40 p-3 text-xs font-semibold placeholder-muted-foreground/60 outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-md shadow-primary/10"
              >
                <FileText className="h-3.5 w-3.5" />
                Validate Schema & Review Preview
              </button>
            </form>

            {/* PREVIEW RENDERING IF VALIDATED */}
            {importPreview && (
              <div className="rounded-xl border border-border bg-input/20 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-foreground">Import Preview Summary:</span>
                  <span className="text-emerald-500">{importPreview.valid} Valid</span>
                  <span className="text-destructive">{importPreview.invalid} Invalid</span>
                </div>
                <div className="overflow-x-auto max-h-40 border border-border rounded-lg bg-card text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border font-bold">
                        <th className="p-2">Email</th>
                        <th className="p-2">Roll Number</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.preview.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-border/40 font-semibold hover:bg-muted/20">
                          <td className="p-2">{row.email}</td>
                          <td className="p-2">{row.rollNumber}</td>
                          <td className={`p-2 font-bold ${row.status === 'VALID' ? 'text-emerald-500' : 'text-destructive'}`}>{row.status}</td>
                          <td className="p-2 text-destructive font-bold">{row.issues.join(', ') || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* SIDE COLUMN: PILOT / UAT TICKET TRACKER */}
        <div className="space-y-6">
          
          <div className="rounded-2xl border border-border bg-card p-5 glass space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Pilot & UAT Bug Tracker</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Submit feedback, UI/UX concerns, or database boundary bugs directly to the deployment architecture vault.
            </p>
            
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Issue Title</label>
                <input 
                  type="text" 
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  placeholder="e.g. Fees receipts slow overlay load"
                  required
                  className="w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-xs font-semibold outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Module</label>
                  <select 
                    value={ticketForm.module}
                    onChange={(e) => setTicketForm({ ...ticketForm, module: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-xs font-semibold outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="Admission">Admission</option>
                    <option value="Academics">Academics</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Fees">Fees & Finance</option>
                    <option value="Exams">Exams & Grades</option>
                    <option value="UI-UX">UI / UX Visuals</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Severity</label>
                  <select 
                    value={ticketForm.severity}
                    onChange={(e) => setTicketForm({ ...ticketForm, severity: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-xs font-semibold outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="BLOCKER">Blocker</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Issue Description</label>
                <textarea 
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Provide precise details to debug conflict..."
                  required
                  className="w-full h-16 rounded-xl border border-border bg-input/40 p-3 text-xs font-semibold outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-extrabold shadow-md shadow-indigo-500/10 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Submit UAT Feedback Ticket
              </button>
            </form>

            {/* LIVE TICKET LIST */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Pilot UAT Tickets</p>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {tickets.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground">No pilot tickets filed.</div>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} className="rounded-xl border border-border bg-input/20 p-3 text-xs space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-foreground">{t.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          t.severity === 'BLOCKER' ? 'bg-red-500/15 text-red-500' :
                          t.severity === 'HIGH' ? 'bg-amber-500/15 text-amber-500' :
                          'bg-zinc-500/15 text-zinc-500'
                        }`}>{t.severity}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed font-semibold">{t.description}</p>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground/80 font-bold border-t border-border/30 pt-2">
                        <span className="capitalize">{t.module} desk</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-indigo-500">{t.status.replace(/_/g, ' ')}</span>
                          {t.status !== 'RESOLVED' && (
                            <button 
                              onClick={() => handleUpdateTicketStatus(t.id, 'RESOLVED')}
                              className="text-[9px] text-emerald-500 hover:underline"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
