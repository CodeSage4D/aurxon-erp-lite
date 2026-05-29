'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { submitLeaveApi, approveLeaveApi } from '@/lib/api';

interface HrTabProps {
  hrTab: 'employees' | 'payroll' | 'leaves';
  setHrTab: (tab: 'employees' | 'payroll' | 'leaves') => void;
  currentRole: string;
  user: any;
  staff: any[];
  loadStaff: () => void;
  payrolls: any[];
  loadPayrolls: () => void;
  leaves: any[];
  loadLeaves: () => void;
  setSelectedEmployeeId: (id: string | null) => void;
  setHireModalOpen: (open: boolean) => void;
  setPayrollGeneratorOpen: (open: boolean) => void;
  setSelectedPayroll: (payroll: any | null) => void;
  triggerToast: (msg: string) => void;
}

export default function HrTab({
  hrTab,
  setHrTab,
  currentRole,
  user,
  staff,
  payrolls,
  leaves,
  loadLeaves,
  setSelectedEmployeeId,
  setHireModalOpen,
  setPayrollGeneratorOpen,
  setSelectedPayroll,
  triggerToast
}: HrTabProps) {
  // Local states for inputs and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [payrollSearchQuery, setPayrollSearchQuery] = useState('');
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

  const handleCreateLeaveLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeaveApi(leaveForm.startDate, leaveForm.endDate, leaveForm.reason);
      triggerToast('Leave request submitted to principal desk.');
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      loadLeaves();
    } catch (err) {
      alert('Leave submission error');
    }
  };

  const handleApproveLeaveLocal = async (id: string, status: string) => {
    try {
      await approveLeaveApi(id, status);
      triggerToast(`Leave request marked ${status}`);
      loadLeaves();
    } catch (err) {
      alert('Leave evaluation error');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      
      {/* Header Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-4 dark:border-zinc-800 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">HR, Staff Leaves & Payroll Desk</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Manage contracts, salary vouchers, and leave rosters.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setHrTab('employees')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              hrTab === 'employees' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Employees Directory
          </button>
          <button 
            onClick={() => setHrTab('payroll')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              hrTab === 'payroll' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Payroll Slip Vault
          </button>
          <button 
            onClick={() => setHrTab('leaves')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              hrTab === 'leaves' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Leaves Desk
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Employees Directory */}
      {hrTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search employees by name, ID or designation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs font-medium outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              />
            </div>
            {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'INSTITUTE_ADMIN'].includes(currentRole) && (
              <button
                onClick={() => setHireModalOpen(true)}
                className="flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Hire Employee</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Joining Date</th>
                  <th className="p-3">Monthly Salary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {staff.filter(s => {
                  const q = searchQuery.toLowerCase();
                  return s.firstName.toLowerCase().includes(q) ||
                         s.lastName.toLowerCase().includes(q) ||
                         s.employeeId.toLowerCase().includes(q) ||
                         s.designation.toLowerCase().includes(q);
                }).map((employee) => (
                  <tr key={employee.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                    <td className="p-3">
                      <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 font-mono uppercase">
                        {employee.employeeId}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{employee.firstName} {employee.lastName}</td>
                    <td className="p-3 text-zinc-500 text-[11px]">{employee.designation}</td>
                    <td className="p-3 text-zinc-400">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                    <td className="p-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">₹{employee.salary}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        employee.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedEmployeeId(employee.id)}
                        className="rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-500 transition"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Payroll Slip Vault */}
      {hrTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search payslips by employee name or period..."
                value={payrollSearchQuery}
                onChange={e => setPayrollSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs font-medium outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              />
            </div>
            {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'ACCOUNTANT', 'INSTITUTE_ADMIN'].includes(currentRole) && (
              <button
                onClick={() => setPayrollGeneratorOpen(true)}
                className="flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Salary Slip</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Period</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Voucher Ref</th>
                  <th className="p-3">Base Salary</th>
                  <th className="p-3">Net Take-Home</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {payrolls.filter(p => {
                  if (['TEACHER', 'LIBRARIAN'].includes(currentRole) && user.profileId) {
                    if (p.staffId !== user.profileId) return false;
                  }
                  const q = payrollSearchQuery.toLowerCase();
                  const staffName = p.staff ? `${p.staff.firstName} ${p.staff.lastName}`.toLowerCase() : '';
                  return staffName.includes(q) || p.month.toLowerCase().includes(q) || p.receiptNumber.toLowerCase().includes(q);
                }).map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                    <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{payroll.month}</td>
                    <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">
                      {payroll.staff ? `${payroll.staff.firstName} ${payroll.staff.lastName}` : 'Employee'}
                    </td>
                    <td className="p-3 text-zinc-500 text-[11px]">{payroll.staff?.designation || 'Staff'}</td>
                    <td className="p-3 font-mono text-zinc-400">{payroll.receiptNumber}</td>
                    <td className="p-3 font-mono">₹{payroll.baseSalary}</td>
                    <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">₹{payroll.netPay}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 uppercase">
                        {payroll.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedPayroll(payroll)}
                        className="rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-500 transition"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Leaves Desk */}
      {hrTab === 'leaves' && (
        <div className="space-y-6">
          {/* Staff view: Apply form */}
          {['TEACHER', 'LIBRARIAN', 'STAFF'].includes(currentRole) && (
            <form onSubmit={handleCreateLeaveLocal} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Start Date</label>
                <input
                  type="date"
                  required
                  value={leaveForm.startDate}
                  onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">End Date</label>
                <input
                  type="date"
                  required
                  value={leaveForm.endDate}
                  onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reason / Details</label>
                <input
                  required
                  placeholder="Medical appointment / Personal reasons..."
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button 
                  type="submit" 
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-md transition"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          )}

          {/* List of leaves */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Leave Applications Desk</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Interval</th>
                    <th className="p-3">Status</th>
                    {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'INSTITUTE_ADMIN'].includes(currentRole) && <th className="p-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {leaves.filter(leave => {
                    if (['TEACHER', 'LIBRARIAN'].includes(currentRole) && user.profileId) {
                      return leave.staffId === user.profileId || leave.staff?.id === user.profileId;
                    }
                    return true;
                  }).map((leave) => (
                    <tr key={leave.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                      <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">
                        {leave.staff ? `${leave.staff.firstName} ${leave.staff.lastName}` : 'Staff'}
                      </td>
                      <td className="p-3 text-zinc-500 text-[11px]">{leave.staff?.designation || 'Staff'}</td>
                      <td className="p-3 text-zinc-650 dark:text-zinc-350">{leave.reason}</td>
                      <td className="p-3 text-zinc-400">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                          leave.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      {['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'INSTITUTE_ADMIN'].includes(currentRole) && (
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            {leave.status === 'PENDING' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveLeaveLocal(leave.id, 'APPROVED')} 
                                  className="rounded bg-emerald-650 hover:bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white transition shadow-sm"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleApproveLeaveLocal(leave.id, 'REJECTED')} 
                                  className="rounded bg-rose-650 hover:bg-rose-550 px-2.5 py-1 text-[10px] font-bold text-white transition shadow-sm"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-zinc-400 font-bold">Processed</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
