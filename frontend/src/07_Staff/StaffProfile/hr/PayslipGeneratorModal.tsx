import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calculator } from 'lucide-react';
import { Staff } from './types';
import { createPayrollApi } from '@/lib/api';

interface PayslipGeneratorModalProps {
  staffList: Staff[];
  onClose: () => void;
  onSaved: () => void;
}

export default function PayslipGeneratorModal({ staffList, onClose, onSaved }: PayslipGeneratorModalProps) {
  const [saving, setSaving] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  
  const [form, setForm] = useState({
    month: 'May 2026',
    baseSalary: 0,
    hra: 8000,
    da: 5000,
    allowances: 0,
    deductions: 200,
    paymentMethod: 'BANK_TRANSFER'
  });

  // Autofill salary when employee is selected
  useEffect(() => {
    if (selectedStaffId) {
      const selected = staffList.find(s => s.id === selectedStaffId);
      if (selected) {
        setForm(prev => ({
          ...prev,
          baseSalary: selected.salary || 0
        }));
      }
    }
  }, [selectedStaffId, staffList]);

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const netPay = (form.baseSalary || 0) + (form.hra || 0) + (form.da || 0) + (form.allowances || 0) - (form.deductions || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      alert('Please select an employee');
      return;
    }
    try {
      setSaving(true);
      
      const payload = {
        staffId: selectedStaffId,
        month: form.month,
        baseSalary: parseFloat(form.baseSalary as any) || 0,
        hra: parseFloat(form.hra as any) || 0,
        da: parseFloat(form.da as any) || 0,
        allowances: parseFloat(form.allowances as any) || 0,
        deductions: parseFloat(form.deductions as any) || 0,
        paymentMethod: form.paymentMethod
      };

      await createPayrollApi(payload);
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to generate payroll record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-sky-600 dark:text-sky-400 animate-pulse" />
            <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
              Generate Salary Slip
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Employee</label>
            <select
              required
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
            >
              <option value="">Select Staff</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.designation} - Salary: ₹{s.salary})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Payroll Month</label>
              <input
                required
                placeholder="e.g. May 2026"
                value={form.month}
                onChange={e => handleInputChange('month', e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={e => handleInputChange('paymentMethod', e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash Desk</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Base Salary (₹)</label>
              <input
                type="number"
                required
                value={form.baseSalary || ''}
                onChange={e => handleInputChange('baseSalary', parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">House Rent Allowance (HRA ₹)</label>
              <input
                type="number"
                value={form.hra || ''}
                onChange={e => handleInputChange('hra', parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Dearness Allowance (DA ₹)</label>
              <input
                type="number"
                value={form.da || ''}
                onChange={e => handleInputChange('da', parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Other Allowances (₹)</label>
              <input
                type="number"
                value={form.allowances || ''}
                onChange={e => handleInputChange('allowances', parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono font-bold"
              />
            </div>
          </div>

          <div className="border-t pt-4 border-zinc-100 dark:border-zinc-800">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Total Deductions (EPF, ESIC, Tax ₹)</label>
            <input
              type="number"
              value={form.deductions || ''}
              onChange={e => handleInputChange('deductions', parseFloat(e.target.value) || 0)}
              className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono font-bold text-red-600"
            />
          </div>

          {/* Live Preview net pay */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center mt-2">
            <div>
              <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Calculated Net Pay:</span>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Base + HRA + DA + Allowances - Deductions</p>
            </div>
            <span className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">
              ₹{netPay.toFixed(2)}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t pt-4 border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving slips...' : 'Generate & Vault Slip'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
