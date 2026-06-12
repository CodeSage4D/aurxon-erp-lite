'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Plus, Database, RefreshCw, Sliders, ShieldCheck, History, Server, Globe, Check, ChevronDown } from 'lucide-react';
import { updateSettingsApi, createBranchApi } from '@/services/api';
import CountryPhoneInput from './CountryPhoneInput';
import { INDIAN_STATES_AND_UTS } from '@/utils/indianData';
import AcademicYearManager from '@/modules/INDUSTRY_PACKS/SCHOOL/Academics/AcademicYearManager';
import PermissionMatrix from './PermissionMatrix';
import MembershipManager from './MembershipManager';
import MarketplaceTab from './MarketplaceTab';

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch(value || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative space-y-1.5 flex-1 w-full" ref={containerRef}>
      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/40 disabled:text-zinc-400"
        />
        <ChevronDown 
          className="absolute right-3 top-4 h-4 w-4 text-zinc-400 cursor-pointer pointer-events-none" 
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />

        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 mt-1.5 z-[90] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setSearch(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition ${
                    value === opt
                      ? "bg-sky-500/10 text-sky-600 dark:bg-sky-500/5 dark:text-sky-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-zinc-400 italic text-[11px]">
                No options match query.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


interface SettingsTabProps {
  settings: any;
  setSettings: React.Dispatch<React.SetStateAction<any>>;
  branches: any[];
  loadBranches: () => void;
  promotionsHistory: any[];
  loadPromotionsHistory: () => void;
  triggerToast: (msg: string) => void;
}

export default function SettingsTab({
  settings,
  setSettings,
  branches,
  loadBranches,
  promotionsHistory,
  loadPromotionsHistory,
  triggerToast
}: SettingsTabProps) {
  // Sub-tabs: config, years, branches, promotion-logs, backup, rbac, memberships, marketplace
  const [subTab, setSubTab] = useState<'config' | 'years' | 'branches' | 'promotions' | 'backup' | 'rbac' | 'memberships' | 'marketplace'>('config');

  // Branch Form
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });

  // Backup Console State
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupLogs, setBackupLogs] = useState<string[]>([]);
  const [backupProgress, setBackupProgress] = useState(0);

  const handleUpdateSettingsLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsApi(settings);
      triggerToast('Institutional configuration updated successfully.');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleCreateBranchLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.code) {
      alert('Branch Name and Code are required.');
      return;
    }
    try {
      await createBranchApi(branchForm);
      triggerToast(`Branch "${branchForm.name}" registered successfully.`);
      setBranchForm({ name: '', code: '', address: '', city: '', state: '', pinCode: '', phone: '' });
      loadBranches();
    } catch (err) {
      alert('Failed to register branch');
    }
  };

  const runBackupSimulation = () => {
    if (backupRunning) return;
    setBackupRunning(true);
    setBackupProgress(0);
    setBackupLogs([]);

    const steps = [
      { prg: 10, log: 'Initializing secure handshake with database server...' },
      { prg: 25, log: 'Checking table integrity (18 core ERP schema tables detected)...' },
      { prg: 45, log: 'Exporting CBSE Grading configurations, RFID logs, and Scholar registries...' },
      { prg: 65, log: 'Generating consolidated SQL transaction log dump...' },
      { prg: 80, log: 'Compressing archive using GZIP (aurxon_lite_backup_2026.tar.gz) - 14.8 MB...' },
      { prg: 95, log: 'Pushing encrypted backup blob to secure remote S3 AWS vaults...' },
      { prg: 100, log: 'Backup successfully written! Checksum MD5: 9a8c7b6f5d4e3c2b1a' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const item = steps[currentStep];
        setBackupProgress(item.prg);
        setBackupLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${item.log}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setBackupRunning(false);
        triggerToast('System backup completed successfully.');
      }
    }, 1000);
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      
      {/* Header Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-4 dark:border-zinc-800 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Institutional Settings & Console</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Control academic sessions, campuses, rollbacks and backups.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSubTab('config')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'config' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            System Parameters
          </button>
          <button 
            onClick={() => setSubTab('rbac')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'rbac' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            RBAC Matrix
          </button>
          <button 
            onClick={() => setSubTab('memberships')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'memberships' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Memberships
          </button>
          <button 
            onClick={() => setSubTab('marketplace')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'marketplace' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setSubTab('years')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'years' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Academic Years
          </button>
          <button 
            onClick={() => setSubTab('branches')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'branches' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Campuses & Branches
          </button>
          <button 
            onClick={() => setSubTab('promotions')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'promotions' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Promotions History
          </button>
          <button 
            onClick={() => setSubTab('backup')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              subTab === 'backup' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Backup Control
          </button>
        </div>
      </div>

      {/* Sub-Tab: Academic Years */}
      {subTab === 'years' && (
        <AcademicYearManager />
      )}

      {/* Sub-Tab: RBAC Matrix */}
      {subTab === 'rbac' && (
        <PermissionMatrix triggerToast={triggerToast} />
      )}

      {/* Sub-Tab: Memberships Directory */}
      {subTab === 'memberships' && (
        <MembershipManager triggerToast={triggerToast} />
      )}

      {/* Sub-Tab: Marketplace & Features */}
      {subTab === 'marketplace' && (
        <MarketplaceTab triggerToast={triggerToast} />
      )}

      {/* Sub-Tab 1: System Parameters */}
      {subTab === 'config' && (
        <form onSubmit={handleUpdateSettingsLocal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Academic Year</label>
              <input
                type="text"
                required
                value={settings.academicYear || ''}
                onChange={e => setSettings({ ...settings, academicYear: e.target.value })}
                placeholder="e.g. 2026-2027"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
              />
              <p className="text-[9px] text-zinc-400 mt-1">Affects timetable schedules and student promotion ranges.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grading Standard Scale</label>
              <select
                value={settings.gradingSystem || 'CBSE'}
                onChange={e => setSettings({ ...settings, gradingSystem: e.target.value })}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
              >
                <option value="CBSE">CBSE Grading System (A1 to E/Fail)</option>
                <option value="PERCENTAGE">Percentage / Raw Marks Ledger</option>
                <option value="GPA">GPA Grade Point Scale (4.0 Max)</option>
              </select>
              <p className="text-[9px] text-zinc-400 mt-1">Sets boundaries for exam score sheets conversions.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Timezone</label>
              <input
                type="text"
                required
                value={settings.timezone || ''}
                onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                placeholder="e.g. Asia/Kolkata"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-medium"
              />
              <p className="text-[9px] text-zinc-400 mt-1">Synchronizes biometric/RFID scan clocks.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Base Currency</label>
              <select
                value={settings.currency || 'INR'}
                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
              >
                <option value="INR">INR (₹) - Indian Rupees</option>
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro Zone</option>
              </select>
              <p className="text-[9px] text-zinc-400 mt-1">Currency units shown on fee vouchers and payslips.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-md transition"
            >
              <Sliders className="h-4 w-4" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </form>
      )}

      {/* Sub-Tab 2: Campuses & Branches */}
      {subTab === 'branches' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Add Branch Form */}
            <form onSubmit={handleCreateBranchLocal} className="lg:col-span-1 border border-zinc-100 rounded-xl p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/20 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Register Branch</h4>
              
              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-400">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dwarka Main Campus"
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-400">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="DPS-DWK"
                    value={branchForm.code}
                    onChange={e => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono uppercase"
                  />
                </div>
                <CountryPhoneInput
                  label="Phone"
                  value={branchForm.phone}
                  onChange={val => setBranchForm({ ...branchForm, phone: val })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-400">Street Address</label>
                <input
                  type="text"
                  placeholder="Sector 4, Dwarka"
                  value={branchForm.address}
                  onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <SearchableSelect
                  label="State"
                  value={branchForm.state}
                  options={INDIAN_STATES_AND_UTS.map(item => item.state)}
                  placeholder="Select State"
                  onChange={val => setBranchForm({ ...branchForm, state: val, city: '' })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SearchableSelect
                    label="City"
                    value={branchForm.city}
                    options={
                      (() => {
                        const selectedStateObj = INDIAN_STATES_AND_UTS.find(item => item.state === branchForm.state);
                        return selectedStateObj 
                          ? Object.values(selectedStateObj.districts).flat()
                          : [];
                      })()
                    }
                    placeholder="Select City"
                    disabled={!branchForm.state}
                    onChange={val => setBranchForm({ ...branchForm, city: val })}
                  />
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">PIN Code</label>
                    <input
                      type="text"
                      placeholder="110078"
                      value={branchForm.pinCode}
                      onChange={e => setBranchForm({ ...branchForm, pinCode: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Save Branch</span>
              </button>
            </form>

            {/* Branches List */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Registered Campus List</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map(b => (
                  <div key={b.id} className="border border-zinc-100 rounded-xl p-4 bg-white hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-300"></div>
                    <div className="relative">
                      <span className="inline-block rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 font-mono uppercase mb-2">
                        {b.code}
                      </span>
                      <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-200">{b.name}</h5>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">{b.address}, {b.city}, {b.state} - {b.pinCode}</p>
                      <p className="text-[9px] text-zinc-400 mt-2 font-mono">Phone: {b.phone || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sub-Tab 3: Promotions History */}
      {subTab === 'promotions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Academic Promotion Ledger</h4>
            <button
              onClick={loadPromotionsHistory}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-3 py-1.5 text-[10px] font-bold text-zinc-500 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Promotion Date</th>
                  <th className="p-3">From Class</th>
                  <th className="p-3">To Class</th>
                  <th className="p-3">Scholars Rolled Over</th>
                  <th className="p-3">Academic Session</th>
                  <th className="p-3 text-right">Reference Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {promotionsHistory.length > 0 ? (
                  promotionsHistory.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                      <td className="p-3 font-mono text-zinc-400">{new Date(p.promotedAt || p.date).toLocaleString()}</td>
                      <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{p.fromClassName || p.fromClass}</td>
                      <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{p.toClassName || p.toClass}</td>
                      <td className="p-3 text-zinc-650 dark:text-zinc-350">{p.studentCount} students</td>
                      <td className="p-3 font-bold text-zinc-400">{p.academicYear || settings.academicYear}</td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                          <Check className="h-3 w-3" />
                          <span>Rollover Success</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-zinc-400">
                      No promotion ledger rollovers have been processed in session {settings.academicYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Backup Control */}
      {subTab === 'backup' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Database className="h-4 w-4 text-sky-600" />
                <span>Database Backup Console</span>
              </h4>
              <p className="text-[10px] text-zinc-400 mt-1 font-medium">Backup schema records, logs, student ledgers and library circulations.</p>
            </div>
            <button
              onClick={runBackupSimulation}
              disabled={backupRunning}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition ${
                backupRunning ? 'bg-zinc-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              <Server className="h-4 w-4" />
              <span>{backupRunning ? 'Backing Up...' : 'Run System Backup'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          {backupProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                <span>Backup Progress</span>
                <span>{backupProgress}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 dark:bg-zinc-800">
                <div 
                  className="bg-sky-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${backupProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status logs terminal */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">System Log Stream</label>
            <div className="w-full h-64 rounded-xl border border-zinc-200 bg-zinc-950 p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1.5 dark:border-zinc-800 shadow-inner">
              {backupLogs.length > 0 ? (
                backupLogs.map((log, idx) => (
                  <div key={idx} className="animate-fade-in">{log}</div>
                ))
              ) : (
                <div className="text-zinc-500">Terminal ready. Click 'Run System Backup' to stream console logs...</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
