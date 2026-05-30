'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Percent, CreditCard, Sparkles } from 'lucide-react';
import { 
  getFeesAllocationsApi, 
  getFeesStructuresApi, 
  payFeeApi, 
  createFeeStructureApi,
  createExpenseApi,
  deleteExpenseApi
} from '@/lib/api';

interface FeesTabProps {
  feesTab: 'allocations' | 'structures' | 'ledger';
  setFeesTab: (tab: 'allocations' | 'structures' | 'ledger') => void;
  feeForm: { name: string; amount: string; dueDate: string };
  setFeeForm: (form: any) => void;
  financeData: any;
  expenses: any[];
  expenseForm: { title: string; amount: string; category: string; paymentMethod: string };
  setExpenseForm: (form: any) => void;
  loadExpenses: () => void;
  loadFinanceOverview: () => void;
  loadDashboardStats: () => void;
  triggerToast: (msg: string) => void;
}

export default function FeesTab({
  feesTab,
  setFeesTab,
  feeForm,
  setFeeForm,
  financeData,
  expenses,
  expenseForm,
  setExpenseForm,
  loadExpenses,
  loadFinanceOverview,
  loadDashboardStats,
  triggerToast
}: FeesTabProps) {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [paymentModal, setPaymentModal] = useState<{ 
    open: boolean; 
    allocId: string; 
    studentName: string; 
    amountDue: number; 
    method: string; 
    remarks: string; 
  } | null>(null);

  const loadAllocationsAndStructures = async () => {
    try {
      const allocs = await getFeesAllocationsApi();
      const structs = await getFeesStructuresApi();
      setAllocations(allocs);
      setStructures(structs);
    } catch (err) {
      console.error('Failed to load allocations/structures', err);
    }
  };

  useEffect(() => {
    loadAllocationsAndStructures();
  }, []);

  const handlePayFeeLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;
    try {
      await payFeeApi(paymentModal.allocId, paymentModal.amountDue, paymentModal.method, paymentModal.remarks);
      triggerToast('Fee receipt generated! Collection recorded.');
      setPaymentModal(null);
      loadAllocationsAndStructures();
      loadFinanceOverview();
      loadDashboardStats();
    } catch (err) {
      alert('Payment submission failed');
    }
  };

  const handleCreateStructureLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeeStructureApi(feeForm);
      triggerToast('Fee structure scheduled!');
      setFeeForm({ name: '', amount: '', dueDate: '' });
      loadAllocationsAndStructures();
      loadDashboardStats();
    } catch (err) {
      alert('Failed to save structure');
    }
  };

  const handleCreateExpenseLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpenseApi({
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        paymentMethod: expenseForm.paymentMethod
      });
      triggerToast('Operating expense debited successfully!');
      setExpenseForm({ title: '', amount: '', category: 'OPERATIONAL', paymentMethod: 'CASH' });
      loadExpenses();
      loadFinanceOverview();
      loadDashboardStats();
    } catch (err) {
      alert('Failed to log expense');
    }
  };

  const handleDeleteExpenseLocal = async (id: string) => {
    if (confirm('Revert this expense debit?')) {
      try {
        await deleteExpenseApi(id);
        triggerToast('Expense record reverted.');
        loadExpenses();
        loadFinanceOverview();
        loadDashboardStats();
      } catch (err) {
        alert('Failed to delete expense');
      }
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Fees Collections & Financial Ledger</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setFeesTab('allocations')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              feesTab === 'allocations' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Fee Desk
          </button>
          <button 
            onClick={() => setFeesTab('structures')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              feesTab === 'structures' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Fee Structures
          </button>
          <button 
            onClick={() => setFeesTab('ledger')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              feesTab === 'ledger' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            P&L Financial Ledger
          </button>
        </div>
      </div>

      {feesTab === 'allocations' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Particulars</th>
                  <th className="p-3">Amount Due</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {allocations.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 transition">
                    <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">
                      {item.student?.firstName} {item.student?.lastName}
                    </td>
                    <td className="p-3 text-zinc-500">{item.feeStructure?.name || 'Tuition Fee'}</td>
                    <td className="p-3 font-mono">₹{item.amountDue}</td>
                    <td className="p-3 font-mono text-emerald-600">₹{item.amountPaid}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' :
                        item.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.status !== 'PAID' ? (
                        <button
                          onClick={() => setPaymentModal({ 
                            open: true, 
                            allocId: item.id, 
                            studentName: `${item.student?.firstName} ${item.student?.lastName}`, 
                            amountDue: item.amountDue - item.amountPaid, 
                            method: 'ONLINE', 
                            remarks: '' 
                          })}
                          className="rounded bg-sky-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-sky-500 transition"
                        >
                          Collect Fee
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-bold">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-sm animate-fade-in">
              <form onSubmit={handlePayFeeLocal} className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex justify-between items-center border-b pb-2 dark:border-zinc-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-sky-500" />
                    <span>Collect Payment Receipt</span>
                  </h4>
                  <button type="button" onClick={() => setPaymentModal(null)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-450 uppercase">Student Name</label>
                  <input readOnly value={paymentModal.studentName} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase">Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={paymentModal.amountDue} 
                    onChange={e => setPaymentModal({...paymentModal, amountDue: parseFloat(e.target.value) || 0})} 
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase">Method</label>
                  <select 
                    value={paymentModal.method} 
                    onChange={e => setPaymentModal({...paymentModal, method: e.target.value})} 
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
                  >
                    <option value="CASH">Cash Desk</option>
                    <option value="ONLINE">Online Bank Transfer</option>
                    <option value="UPI">UPI (BHIM, GPay)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase">Remarks</label>
                  <input 
                    placeholder="Enter payment reference details..." 
                    value={paymentModal.remarks} 
                    onChange={e => setPaymentModal({...paymentModal, remarks: e.target.value})} 
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" 
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition">Collect Receipt</button>
                  <button type="button" onClick={() => setPaymentModal(null)} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-550 hover:bg-zinc-50 dark:border-zinc-805 dark:hover:bg-zinc-800 transition">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {feesTab === 'structures' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateStructureLocal} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Structure Title</label>
              <input name="name" required placeholder="Term 2 Tuition Fee" value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Amount (₹)</label>
              <input name="amount" type="number" required placeholder="3500" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold text-zinc-850 dark:text-zinc-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Due Date</label>
              <input name="dueDate" type="date" required value={feeForm.dueDate} onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition">
                <Plus className="h-4 w-4" />
                <span>Define Fee Structure</span>
              </button>
            </div>
          </form>

          {/* List of Structures */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-550 uppercase tracking-wider">Scheduled Structures</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {structures.length > 0 ? (
                structures.map((item) => (
                  <div key={item.id} className="rounded-xl border border-zinc-150 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20 hover-lift">
                    <div className="flex justify-between items-center text-xs">
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-bold text-sky-600 dark:text-sky-400 uppercase">
                        {item.name}
                      </span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">₹{item.amount}</span>
                    </div>
                    <p className="mt-3 text-xs text-zinc-550 dark:text-zinc-400 font-semibold">
                      Due Date: <span className="font-mono text-rose-500">{new Date(item.dueDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">No custom structures added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {feesTab === 'ledger' && financeData && (
        <div className="space-y-6">
          {/* Expense Form */}
          <form onSubmit={handleCreateExpenseLocal} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-150 pb-6 dark:border-zinc-800">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Expense Title</label>
              <input required placeholder="Office printer cartridge replacement" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Debit Amount (₹)</label>
              <input type="number" required placeholder="4200" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 font-bold text-zinc-800 dark:text-zinc-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Debit Category</label>
              <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                <option value="UTILITY">Broadband & Utilities</option>
                <option value="MAINTENANCE">Academic block maintenance</option>
                <option value="SALARY">Salaries</option>
                <option value="OPERATIONAL">Operational costs</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-bold text-white shadow-md transition">
                <Plus className="h-4 w-4" />
                <span>Record Debit Expense</span>
              </button>
            </div>
          </form>

          {/* Profit & Loss Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-550 uppercase tracking-wider">Profit & Loss (P&L) Statement</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-150 bg-zinc-50/50 p-4 dark:bg-zinc-950/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-bold border-b border-zinc-200 pb-2 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <th className="pb-2">Account Particulars</th>
                    <th className="pb-2 text-right">Income (Credits)</th>
                    <th className="pb-2 text-right">Expense (Debits)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  <tr className="text-zinc-800 dark:text-zinc-200">
                    <td className="py-2.5">Tuition & Term Exam Fees Collected</td>
                    <td className="py-2.5 text-right text-emerald-600 font-bold">₹{financeData.totalRevenue}</td>
                    <td className="py-2.5 text-right">-</td>
                  </tr>
                  <tr className="text-zinc-800 dark:text-zinc-200">
                    <td className="py-2.5">Teachers & Employees Base Salaries</td>
                    <td className="py-2.5 text-right">-</td>
                    <td className="py-2.5 text-right text-rose-600">₹{financeData.totalSalaries}</td>
                  </tr>
                  {expenses.map(e => (
                    <tr key={e.id} className="text-zinc-800 dark:text-zinc-200">
                      <td className="py-2.5">{e.title} ({e.category})</td>
                      <td className="py-2.5 text-right">-</td>
                      <td className="py-2.5 text-right text-rose-600">
                        <div className="flex justify-end items-center gap-1">
                          <span>₹{e.amount}</span>
                          <button 
                            onClick={() => handleDeleteExpenseLocal(e.id)} 
                            className="text-zinc-400 hover:text-red-500 ml-2 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-zinc-300 font-bold bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                    <td className="py-3">Net Institutional Surplus (Profit)</td>
                    <td colSpan={2} className="py-3 text-right text-sky-600 dark:text-sky-400 font-black text-sm">
                      ₹{financeData.netProfit} ({financeData.profitMargin}% surplus margin)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
