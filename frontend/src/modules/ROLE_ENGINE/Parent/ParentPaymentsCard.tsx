'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Printer, FileText, Loader2, Sparkles } from 'lucide-react';
import { payFeeApi } from '@/lib/api';
import ReceiptViewer from '@/modules/INDUSTRY_PACKS/SCHOOL/Fees/ReceiptViewer';

interface Payment {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  remarks: string;
}

interface FeeAllocation {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  feeStructure: { name: string; description: string; dueDate: string };
  payments: Payment[];
}

interface ParentPaymentsCardProps {
  allocations: FeeAllocation[];
  onReload: () => void;
}

export default function ParentPaymentsCard({ allocations, onReload }: ParentPaymentsCardProps) {
  const [payingAllocId, setPayingAllocId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('ONLINE');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [activeReceiptPaymentId, setActiveReceiptPaymentId] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingAllocId || !payAmount) return;

    setProcessing(true);
    setError('');

    try {
      const amountNum = parseFloat(payAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid payment amount');
      }

      await payFeeApi(payingAllocId, amountNum, payMethod, remarks);
      setPayingAllocId(null);
      setPayAmount('');
      setRemarks('');
      triggerToast('Sandbox payment checkout successfully processed!');
      onReload();
    } catch (err: any) {
      setError(err.message || 'Payment execution failed');
    } finally {
      setProcessing(false);
    }
  };

  if (activeReceiptPaymentId) {
    return (
      <ReceiptViewer 
        paymentId={activeReceiptPaymentId} 
        onBack={() => setActiveReceiptPaymentId(null)} 
      />
    );
  }

  const outstandingCount = allocations.filter(a => a.status !== 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/25 border border-primary/20 flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header card summary */}
      <div className="glass rounded-3xl p-6 border border-border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Financial Ledger & Fees
          </h3>
          <p className="text-xs font-semibold text-muted-foreground">
            View term fees schedules, pay balances, and print receipt certificates.
          </p>
        </div>
        <div className={`rounded-xl border px-3 py-2 text-xs font-bold w-fit ${
          outstandingCount > 0 
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {outstandingCount > 0 ? `${outstandingCount} Pending fee schedules` : 'All schedules fully cleared'}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Payment checkout overlays */}
      {payingAllocId && (
        <div className="glass rounded-3xl p-6 border border-primary/40 bg-primary/[0.01] space-y-4 shadow-md">
          <div>
            <h4 className="text-sm font-bold text-foreground">Sandbox payment checkout</h4>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Simulate card/UPI transaction settlements</p>
          </div>
          <form onSubmit={handlePaySubmit} className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Payment amount (INR)</label>
              <input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="₹ Amount"
                className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary glass"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Gateway Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary glass"
              >
                <option value="ONLINE">Razorpay / NetBanking</option>
                <option value="UPI">UPI Bhim Sandbox</option>
                <option value="CARD">Visa / Mastercard</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Settle'}
              </button>
              <button
                type="button"
                onClick={() => setPayingAllocId(null)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allocations ledger list */}
      <div className="space-y-4">
        {allocations.map((alloc) => {
          const outstanding = alloc.amountDue - alloc.amountPaid;
          return (
            <div key={alloc.id} className="glass rounded-3xl p-6 border border-border bg-card flex flex-col justify-between md:flex-row md:items-center gap-6 shadow-sm hover:border-primary/20 transition-all duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-extrabold text-foreground">{alloc.feeStructure.name}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                    alloc.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : alloc.status === 'PARTIAL'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {alloc.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  {alloc.feeStructure.description || 'Standard academic session distribution fee'}
                </p>
                <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-muted-foreground pt-1">
                  <span>Due: ₹{alloc.feeStructure.dueDate ? new Date(alloc.feeStructure.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'June 15, 2026'}</span>
                  <span>Paid: ₹{alloc.amountPaid}</span>
                  {outstanding > 0 && <span className="text-destructive">Outstanding: ₹{outstanding}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 md:items-end">
                {outstanding > 0 && !payingAllocId && (
                  <button
                    onClick={() => {
                      setPayingAllocId(alloc.id);
                      setPayAmount(outstanding.toString());
                    }}
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold shadow-lg shadow-primary/20 transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Pay Outstanding (₹{outstanding})
                  </button>
                )}

                {/* List payments receipts */}
                {alloc.payments && alloc.payments.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Receipts issued</span>
                    <div className="flex flex-wrap gap-1.5">
                      {alloc.payments.map((payment, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveReceiptPaymentId(payment.receiptNumber)}
                          className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 hover:bg-muted px-2 py-1 text-[9px] font-bold text-foreground transition-colors"
                        >
                          <FileText className="h-3 w-3 text-primary" />
                          <span>{payment.receiptNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
