import React, { useState, useEffect } from 'react';
import { 
  X, Edit, Save, ShieldAlert, Award, CreditCard, PhoneCall, FileText, CheckCircle, Ban
} from 'lucide-react';
import { Staff, Payroll } from './types';
import { updateStaffApi, getStaffPayrollsApi } from '@/lib/api';

interface EmployeeModalProps {
  employeeId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EmployeeModal({ employeeId, onClose, onSaved }: EmployeeModalProps) {
  const [employee, setEmployee] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'finance' | 'emergency' | 'payrolls'>('profile');
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Staff>>({});

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      // We will call the detail API
      const res = await fetch(`http://localhost:5000/staff/${employeeId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aurxon_token')}`
        }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmployee(data);
      setFormData(data);
      if (data.payrolls) {
        setPayrolls(data.payrolls);
      } else {
        // Fallback mock
        const payRes = await getStaffPayrollsApi(employeeId);
        setPayrolls(payRes);
      }
    } catch (err) {
      console.warn('Backend detail endpoint failed, loading fallback from mock database...');
      // Fallback: get staff list and find the staff
      try {
        const staffRes = await fetch(`http://localhost:5000/staff`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('aurxon_token')}`
          }
        });
        if (staffRes.ok) {
          const list = await staffRes.json();
          const found = list.find((s: any) => s.id === employeeId);
          if (found) {
            setEmployee(found);
            setFormData(found);
          }
        }
      } catch (e) {}

      // If still null, try API client mock fallback
      const dbStr = localStorage.getItem('aurxon_mock_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const found = db.staff.find((s: any) => s.id === employeeId);
        if (found) {
          setEmployee(found);
          setFormData(found);
          const payRes = (db.payrolls || []).filter((p: any) => p.staffId === employeeId);
          setPayrolls(payRes);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Staff, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Basic validations
      if (formData.aadhaarNumber && formData.aadhaarNumber.length !== 12) {
        alert('Aadhaar Number must be exactly 12 digits');
        setSaving(false);
        return;
      }
      if (formData.panNumber && formData.panNumber.length !== 10) {
        alert('PAN Card Number must be exactly 10 characters');
        setSaving(false);
        return;
      }

      await updateStaffApi(employeeId, formData);
      setEditMode(false);
      onSaved();
      await fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update employee details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500">
          Syncing employee record...
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600">
              {employee.firstName.slice(0,2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-800 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                ID: {employee.employeeId} &bull; {employee.designation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                editMode 
                  ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' 
                  : 'bg-sky-600 text-white hover:bg-sky-500'
              }`}
            >
              {editMode ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-6 shrink-0 gap-4 bg-zinc-50/50 dark:bg-zinc-950/20">
          {[
            { id: 'profile', label: 'Personal profile', icon: Award },
            { id: 'finance', label: 'Finance & Statutory', icon: CreditCard },
            { id: 'emergency', label: 'Emergency Contact', icon: PhoneCall },
            { id: 'payrolls', label: 'Payslips vault', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition-all ${
                  isActive 
                    ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* Sub Tab: Profile */}
          {activeSubTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">First Name</label>
                <input 
                  disabled={!editMode}
                  value={formData.firstName || ''}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Last Name</label>
                <input 
                  disabled={!editMode}
                  value={formData.lastName || ''}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Email Address</label>
                <input 
                  disabled
                  value={formData.user?.email || ''}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/20 text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Phone Number</label>
                <input 
                  disabled={!editMode}
                  value={formData.phone || ''}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Aadhaar (Indian UID - 12 Digits)</label>
                <input 
                  disabled={!editMode}
                  maxLength={12}
                  value={formData.aadhaarNumber || ''}
                  onChange={e => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">PAN Card Number (10 Alphanumeric)</label>
                <input 
                  disabled={!editMode}
                  maxLength={10}
                  value={formData.panNumber || ''}
                  onChange={e => handleInputChange('panNumber', e.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Qualifications</label>
                <input 
                  disabled={!editMode}
                  placeholder="e.g. M.Sc Physics, B.Ed"
                  value={formData.qualification || ''}
                  onChange={e => handleInputChange('qualification', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Experience (Years)</label>
                <input 
                  type="number"
                  disabled={!editMode}
                  value={formData.experience !== undefined ? formData.experience : ''}
                  onChange={e => handleInputChange('experience', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Gender</label>
                <select
                  disabled={!editMode}
                  value={formData.gender || ''}
                  onChange={e => handleInputChange('gender', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-bold"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Blood Group</label>
                <input 
                  disabled={!editMode}
                  placeholder="e.g. O+"
                  value={formData.bloodGroup || ''}
                  onChange={e => handleInputChange('bloodGroup', e.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-bold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Father / Spouse Name</label>
                <input 
                  disabled={!editMode}
                  value={formData.fatherSpouseName || ''}
                  onChange={e => handleInputChange('fatherSpouseName', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Permanent Address</label>
                <textarea 
                  disabled={!editMode}
                  rows={2}
                  value={formData.permanentAddress || ''}
                  onChange={e => handleInputChange('permanentAddress', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* Sub Tab: Finance */}
          {activeSubTab === 'finance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Monthly Salary (₹)</label>
                <input 
                  type="number"
                  disabled={!editMode}
                  value={formData.salary || 0}
                  onChange={e => handleInputChange('salary', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold text-sky-600 dark:text-sky-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">EPF Roster Number (Statutory)</label>
                <input 
                  disabled={!editMode}
                  placeholder="e.g. MH/BAN/12345/678"
                  value={formData.pfNumber || ''}
                  onChange={e => handleInputChange('pfNumber', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">ESIC Account Number (Statutory)</label>
                <input 
                  disabled={!editMode}
                  placeholder="e.g. 31-00-123456-001-0001"
                  value={formData.esiNumber || ''}
                  onChange={e => handleInputChange('esiNumber', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Name</label>
                <input 
                  disabled={!editMode}
                  placeholder="State Bank of India"
                  value={formData.bankName || ''}
                  onChange={e => handleInputChange('bankName', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Branch</label>
                <input 
                  disabled={!editMode}
                  value={formData.bankBranch || ''}
                  onChange={e => handleInputChange('bankBranch', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Account Number</label>
                <input 
                  disabled={!editMode}
                  value={formData.accNumber || ''}
                  onChange={e => handleInputChange('accNumber', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">IFSC Code (11 Digits)</label>
                <input 
                  disabled={!editMode}
                  maxLength={11}
                  placeholder="SBIN0000001"
                  value={formData.ifscCode || ''}
                  onChange={e => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-mono font-bold"
                />
              </div>
            </div>
          )}

          {/* Sub Tab: Emergency Contact */}
          {activeSubTab === 'emergency' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Emergency Contact Name</label>
                <input 
                  disabled={!editMode}
                  value={formData.emergencyContactName || ''}
                  onChange={e => handleInputChange('emergencyContactName', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Emergency Contact Phone</label>
                <input 
                  disabled={!editMode}
                  value={formData.emergencyContactPhone || ''}
                  onChange={e => handleInputChange('emergencyContactPhone', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-50 dark:disabled:bg-zinc-950/20 disabled:text-zinc-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* Sub Tab: Payroll History */}
          {activeSubTab === 'payrolls' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b pb-2">Payslip Vault Records</h4>
              {payrolls.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 font-medium">No salary slips registered for this employee.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-3">Month</th>
                        <th className="p-3">Voucher Ref</th>
                        <th className="p-3">Basic Salary</th>
                        <th className="p-3">Total Earnings</th>
                        <th className="p-3">Net Paid</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                      {payrolls.map((payroll) => (
                        <tr key={payroll.id}>
                          <td className="p-3 font-bold">{payroll.month}</td>
                          <td className="p-3 font-mono text-zinc-500">{payroll.receiptNumber}</td>
                          <td className="p-3 font-mono">₹{payroll.baseSalary}</td>
                          <td className="p-3 font-mono text-emerald-600">₹{payroll.baseSalary + payroll.hra + payroll.da + payroll.allowances}</td>
                          <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">₹{payroll.netPay}</td>
                          <td className="p-3 font-bold text-[10px] text-zinc-500">{payroll.paymentMethod}</td>
                          <td className="p-3">
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 uppercase">
                              {payroll.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer actions */}
        {editMode && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex justify-end gap-2 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/10 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
