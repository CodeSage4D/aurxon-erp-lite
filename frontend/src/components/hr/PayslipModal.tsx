import React from 'react';
import { X, Printer, Download, Award, ShieldCheck } from 'lucide-react';
import { Payroll } from './types';

interface PayslipModalProps {
  payroll: Payroll;
  onClose: () => void;
}

export default function PayslipModal({ payroll, onClose }: PayslipModalProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const totalEarnings = payroll.baseSalary + payroll.hra + payroll.da + payroll.allowances;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:border-none print:w-full animate-fade-in">
        
        {/* Header - Hidden in Print */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
              Payslip Receipt Voucher
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/10"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          
          {/* Institution banner */}
          <div className="text-center space-y-2 border-b-2 border-zinc-200 pb-5 dark:border-zinc-800">
            <h1 className="text-lg font-black text-sky-600 dark:text-sky-400 tracking-tight">
              AURXON INTERNATIONAL ACADEMY
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Educational ERP Systems &bull; Salary Slip Voucher
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-700 dark:text-zinc-300">
            <div className="space-y-1.5">
              <p><strong>Employee Name:</strong> {payroll.staff?.firstName} {payroll.staff?.lastName}</p>
              <p><strong>Employee ID:</strong> {payroll.staff?.employeeId}</p>
              <p><strong>Designation:</strong> {payroll.staff?.designation}</p>
            </div>
            <div className="space-y-1.5 text-right print:text-right">
              <p><strong>Voucher Ref:</strong> {payroll.receiptNumber}</p>
              <p><strong>Pay Period:</strong> {payroll.month}</p>
              <p><strong>Payment Date:</strong> {new Date(payroll.paymentDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Core Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-3">Salary Component Particulars</th>
                  <th className="p-3 text-right">Earnings (Credit ₹)</th>
                  <th className="p-3 text-right">Deductions (Debit ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                <tr>
                  <td className="p-3">Base Salary (Contractual)</td>
                  <td className="p-3 text-right">₹{payroll.baseSalary.toFixed(2)}</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                <tr>
                  <td className="p-3">House Rent Allowance (HRA)</td>
                  <td className="p-3 text-right">₹{payroll.hra.toFixed(2)}</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                <tr>
                  <td className="p-3">Dearness Allowance (DA)</td>
                  <td className="p-3 text-right">₹{payroll.da.toFixed(2)}</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                {payroll.allowances > 0 && (
                  <tr>
                    <td className="p-3">Other Allowances & Special Pay</td>
                    <td className="p-3 text-right">₹{payroll.allowances.toFixed(2)}</td>
                    <td className="p-3 text-right">-</td>
                  </tr>
                )}
                {payroll.deductions > 0 && (
                  <tr>
                    <td className="p-3">Statutory Deductions (EPF, ESI, Tax)</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right text-red-600">₹{payroll.deductions.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="bg-zinc-50 dark:bg-zinc-950/40 font-bold border-t border-zinc-200 dark:border-zinc-800">
                  <td className="p-3">Sub-Total Columns</td>
                  <td className="p-3 text-right text-emerald-600">₹{totalEarnings.toFixed(2)}</td>
                  <td className="p-3 text-right text-red-600">₹{payroll.deductions.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Pay Box */}
          <div className="flex justify-between items-center rounded-2xl bg-sky-50 dark:bg-sky-950/20 p-5 border border-sky-100 dark:border-sky-900/50">
            <div>
              <h4 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                Net Take-Home Earnings
              </h4>
              <p className="text-[11px] text-zinc-400 font-mono mt-1">Paid via {payroll.paymentMethod}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
                ₹{payroll.netPay.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Standard footer */}
          <div className="pt-10 flex justify-between items-end text-[10px] font-mono text-zinc-400">
            <div className="text-center border-t border-zinc-200 pt-2 w-40 dark:border-zinc-800">
              <p>Accountant Signature</p>
            </div>
            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Digitally Signed</span>
              </div>
              <p>Voucher Certified</p>
            </div>
            <div className="text-center border-t border-zinc-200 pt-2 w-40 dark:border-zinc-800">
              <p>Employee Signature</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
