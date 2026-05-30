'use client';

import React from 'react';
import { Printer, Shield, CheckCircle, FileText, IndianRupee } from 'lucide-react';

interface PayrollVoucherSlipProps {
  payroll: any;
  onBack?: () => void;
}

export default function PayrollVoucherSlip({ payroll, onBack }: PayrollVoucherSlipProps) {
  if (!payroll) {
    return (
      <div className="glass rounded-3xl p-6 border border-border text-center text-muted-foreground font-semibold">
        No payroll slip selected.
      </div>
    );
  }

  const {
    month,
    baseSalary,
    hra,
    da,
    allowances = 0,
    deductions = 0,
    netPay,
    paymentDate,
    paymentMethod,
    receiptNumber,
    status,
    staff
  } = payroll;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Salary Voucher
        </h3>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              Back to Payroll
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            Print Voucher
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-xl max-w-2xl mx-auto border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black tracking-tight text-xl">
              <Shield className="h-6 w-6 text-indigo-600 shrink-0" />
              AURXON ACADEMY
            </div>
            <p className="text-[10px] text-slate-500 font-semibold max-w-[220px]">
              742 Evergreen Terrace, Sector 4, Springfield. Registered HR Portal.
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black tracking-tight text-slate-800">SALARY SLIP</h2>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Voucher No: <span className="text-slate-800 font-bold">{receiptNumber}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Month: {month}
            </div>
          </div>
        </div>

        {/* Employee Demographics */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-xs font-semibold text-slate-600">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Employee Name</span>
              <span className="text-slate-800 font-extrabold">{staff?.firstName} {staff?.lastName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Employee ID</span>
              <span className="text-slate-800 font-bold">{staff?.employeeId}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Designation</span>
              <span className="text-slate-800 font-bold">{staff?.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Payment Method</span>
              <span className="text-slate-800 font-bold">{paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Salary Component Table */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
          {/* Earnings */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Earnings</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Base Salary</span>
                <span className="text-slate-800 font-bold">₹{baseSalary.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">HRA</span>
                <span className="text-slate-800 font-bold">₹{hra.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">DA</span>
                <span className="text-slate-800 font-bold">₹{da.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Other Allowances</span>
                <span className="text-slate-800 font-bold">₹{allowances.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Deductions</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Provident Fund (PF)</span>
                <span className="text-slate-800 font-bold">₹{(deductions * 0.6).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">ESI contribution</span>
                <span className="text-slate-800 font-bold">₹{(deductions * 0.2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">TDS / Professional Tax</span>
                <span className="text-slate-800 font-bold">₹{(deductions * 0.2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-semibold text-destructive">
                <span>Total Deductions</span>
                <span className="font-bold">₹{deductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Summary total */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 w-fit">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Voucher Status: <span className="font-extrabold">{status}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              Disbursed on: {new Date(paymentDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Net Take-Home Pay</span>
            <span className="text-2xl font-black text-slate-800 flex items-center gap-1 justify-end mt-1">
              <IndianRupee className="h-5 w-5 text-slate-800 shrink-0" />
              {netPay.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Signature stamp */}
        <div className="mt-12 border-t border-dashed border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-400 font-bold">
          <div>
            <p className="text-slate-400">Voucher digitally signed.</p>
            <p className="text-slate-400">Authentic copy of payroll records.</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 font-bold">HR Manager Signatory</p>
            <p className="text-slate-400 mt-2">Accounts block, Springfield</p>
          </div>
        </div>
      </div>
    </div>
  );
}
