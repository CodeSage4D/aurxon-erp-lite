import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { createStaffApi } from '@/lib/api';
import CountryPhoneInput from '@/01_Core/Dashboard/CountryPhoneInput';

interface HireFormModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function HireFormModal({ onClose, onSaved }: HireFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    designation: 'TEACHER',
    role: 'TEACHER',
    salary: '',
    phone: '',
    joiningDate: new Date().toISOString().substring(0, 10),
    
    // Advanced fields
    aadhaarNumber: '',
    panNumber: '',
    qualification: '',
    experience: '0',
    gender: 'MALE',
    bloodGroup: '',
    fatherSpouseName: '',
    permanentAddress: '',
    
    // Banking
    bankName: '',
    bankBranch: '',
    accNumber: '',
    ifscCode: '',
    
    // Statutory
    pfNumber: '',
    esiNumber: '',
    
    // Emergency
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Basic validations
      if (form.aadhaarNumber && form.aadhaarNumber.length !== 12) {
        alert('Aadhaar Number must be exactly 12 digits');
        setSaving(false);
        return;
      }
      if (form.panNumber && form.panNumber.length !== 10) {
        alert('PAN Card Number must be exactly 10 characters');
        setSaving(false);
        return;
      }

      const roleMap: Record<string, string> = {
        'TEACHER': 'TEACHER',
        'ACCOUNTANT': 'ACCOUNTANT',
        'LIBRARIAN': 'LIBRARIAN',
        'STAFF': 'STAFF'
      };

      const payload = {
        ...form,
        role: roleMap[form.designation] || 'STAFF',
        salary: parseFloat(form.salary) || 0,
        experience: parseInt(form.experience) || 0
      };

      await createStaffApi(payload);
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to hire employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
              Hire New Employee
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Core Credentials */}
          <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              1. Core Credentials & Contract
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">First Name</label>
                <input required value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Last Name</label>
                <input required value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Email (User Account)</label>
                <input type="email" required placeholder="e.g. employee@academy.com" value={form.email} onChange={e => handleChange('email', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Employee ID (Unique)</label>
                <input required placeholder="e.g. EMP005" value={form.employeeId} onChange={e => handleChange('employeeId', e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Designation</label>
                <select value={form.designation} onChange={e => handleChange('designation', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold">
                  <option value="TEACHER">Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="STAFF">Office Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Monthly Salary (Base ₹)</label>
                <input type="number" required placeholder="35000" value={form.salary} onChange={e => handleChange('salary', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono font-bold" />
              </div>
              <CountryPhoneInput
                label="Phone Number"
                value={form.phone}
                onChange={val => handleChange('phone', val)}
                required
              />
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Joining Date</label>
                <input type="date" required value={form.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Demographics */}
          <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              2. Statutory & Indian Demographics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Aadhaar (UIDAI - 12 digits)</label>
                <input maxLength={12} placeholder="562180429402" value={form.aadhaarNumber} onChange={e => handleChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">PAN Card Number (10 characters)</label>
                <input maxLength={10} placeholder="ABCDE1234F" value={form.panNumber} onChange={e => handleChange('panNumber', e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Qualifications</label>
                <input placeholder="e.g. M.Sc Chemistry, B.Ed" value={form.qualification} onChange={e => handleChange('qualification', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Experience (Years)</label>
                <input type="number" value={form.experience} onChange={e => handleChange('experience', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Gender</label>
                <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Blood Group</label>
                <input placeholder="e.g. B+" value={form.bloodGroup} onChange={e => handleChange('bloodGroup', e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Father / Spouse Name</label>
                <input placeholder="Father's or Spouse's full name" value={form.fatherSpouseName} onChange={e => handleChange('fatherSpouseName', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Permanent Address</label>
                <textarea rows={2} placeholder="Complete physical address details" value={form.permanentAddress} onChange={e => handleChange('permanentAddress', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
            </div>
          </div>

          {/* Section 3: Statutory & Banking routing */}
          <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              3. Banking & statutory registers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Name</label>
                <input placeholder="State Bank of India" value={form.bankName} onChange={e => handleChange('bankName', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Branch</label>
                <input placeholder="Indore Main" value={form.bankBranch} onChange={e => handleChange('bankBranch', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Account Number</label>
                <input placeholder="10002930492" value={form.accNumber} onChange={e => handleChange('accNumber', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">IFSC Code (11 digits)</label>
                <input maxLength={11} placeholder="SBIN0000001" value={form.ifscCode} onChange={e => handleChange('ifscCode', e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">EPF Code (Roster PF)</label>
                <input placeholder="e.g. MH/BAN/12345/678" value={form.pfNumber} onChange={e => handleChange('pfNumber', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">ESIC Number</label>
                <input placeholder="e.g. 31-00-123456-001-0001" value={form.esiNumber} onChange={e => handleChange('esiNumber', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono" />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              4. Emergency Contacts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Emergency Contact Name</label>
                <input placeholder="Relation full name" value={form.emergencyContactName} onChange={e => handleChange('emergencyContactName', e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <CountryPhoneInput
                label="Emergency Phone Number"
                value={form.emergencyContactPhone}
                onChange={val => handleChange('emergencyContactPhone', val)}
              />
            </div>
          </div>

          {/* Footer Save */}
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
              <span>{saving ? 'Hiring employee...' : 'Hire & Generate Credentials'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
