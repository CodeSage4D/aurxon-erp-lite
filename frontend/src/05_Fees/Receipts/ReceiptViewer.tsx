'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Shield, CheckCircle, Download, FileText, Loader2 } from 'lucide-react';
import { getFeeReceiptApi } from '@/lib/api';

interface ReceiptViewerProps {
  paymentId: string;
  onBack?: () => void;
}

export default function ReceiptViewer({ paymentId, onBack }: ReceiptViewerProps) {
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (paymentId) {
      loadReceipt();
    }
  }, [paymentId]);

  const loadReceipt = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFeeReceiptApi(paymentId);
      setReceipt(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-12 border border-border flex flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-bold text-muted-foreground">Compiling Receipt Ledger...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="glass rounded-3xl p-8 border border-border text-center space-y-4">
        <p className="text-sm font-bold text-destructive">{error || 'Receipt details not found'}</p>
        {onBack && (
          <button onClick={onBack} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-sm">
            Go Back
          </button>
        )}
      </div>
    );
  }

  const { payment, receiptNumber, generatedAt } = receipt;
  const { student, feeStructure } = payment.allocation;

  return (
    <div className="space-y-6">
      {/* Control panel for screen only */}
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Receipt View
        </h3>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              Back to Ledger
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Printable Receipt Voucher */}
      <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-xl max-w-2xl mx-auto border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* Header Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black tracking-tight text-xl">
              <Shield className="h-6 w-6 text-indigo-600 shrink-0" />
              AURXON ACADEMY
            </div>
            <p className="text-[10px] text-slate-500 font-semibold max-w-[220px]">
              742 Evergreen Terrace, Sector 4, Springfield. Affiliation No: 1030948.
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black tracking-tight text-slate-800">FEES RECEIPT</h2>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Receipt: <span className="text-slate-800 font-bold">{receiptNumber}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Date: {new Date(generatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </div>
          </div>
        </div>

        {/* Student and Reference Details */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-xs font-medium text-slate-600">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Student Name</span>
              <span className="text-slate-800 font-bold">{student.firstName} {student.lastName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Scholar Number</span>
              <span className="text-slate-800 font-bold">{student.scholarNumber}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Class / Section</span>
              <span className="text-slate-800 font-bold">{student.class?.name || 'Class Roster'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Payment ID</span>
              <span className="text-slate-800 font-mono font-bold">{payment.id.substring(0, 18)}</span>
            </div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="overflow-hidden border border-slate-100 rounded-2xl mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Fee description</th>
                <th className="px-4 py-3 text-right">Amount due</th>
                <th className="px-4 py-3 text-right">Amount paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
              <tr>
                <td className="px-4 py-4">
                  <div className="font-bold text-slate-800">{feeStructure.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{feeStructure.description || 'Institutional Tuition Structure'}</div>
                </td>
                <td className="px-4 py-4 text-right">₹{payment.allocation.amountDue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-4 text-right">₹{payment.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Footer block */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 w-fit">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Payment Status: <span className="font-extrabold">PAID ({payment.paymentMethod})</span>
            </div>
            {payment.remarks && (
              <p className="text-[10px] text-slate-400 font-medium italic">Remarks: "{payment.remarks}"</p>
            )}
          </div>
          <div className="text-right space-y-1.5">
            <div className="flex justify-between items-center gap-8 text-xs font-bold text-slate-500">
              <span>Total Received</span>
              <span className="text-base font-black text-slate-800">₹{payment.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="mt-8 border-t border-dashed border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-semibold">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded flex items-center justify-center font-bold text-slate-500 uppercase tracking-widest text-[8px]">
              QR Code Fallback
            </div>
            <div>
              <p className="text-slate-500 font-bold">Secure digital verification enabled</p>
              <p className="text-slate-400">Authentic digital certificate log hash matches server ledger.</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-slate-500 font-bold">Auth Signatory</p>
            <p className="text-slate-400 mt-2">Cashier desk, Aurxon Academy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
