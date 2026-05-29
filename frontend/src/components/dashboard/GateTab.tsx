'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getVisitorsApi, createVisitorApi, checkoutVisitorApi } from '@/lib/api';

interface GateTabProps {
  staff: any[];
  triggerToast: (msg: string) => void;
}

export default function GateTab({
  staff,
  triggerToast
}: GateTabProps) {
  // Local state for gate logs
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorForm, setVisitorForm] = useState({ name: '', phone: '', purpose: '', hostName: '' });

  const loadVisitorsData = async () => {
    try {
      const data = await getVisitorsApi();
      setVisitors(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVisitorsData();
  }, []);

  const handleCreateVisitorLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVisitorApi(visitorForm);
      triggerToast('Visitor checked in & pass generated!');
      setVisitorForm({ name: '', phone: '', purpose: '', hostName: '' });
      loadVisitorsData();
    } catch (err: any) {
      alert(err.message || 'Visitor log failed');
    }
  };

  const handleCheckoutVisitorLocal = async (id: string) => {
    try {
      await checkoutVisitorApi(id);
      triggerToast('Visitor exit time recorded!');
      loadVisitorsData();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Visitor Gate Desk & Security Log</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
            Log visitor check-ins, generate digital gate passes, and audit active campus guests.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-bold text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{visitors.filter(v => !v.exitTime).length} Guests Inside</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to log check-in */}
        <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-4 h-fit">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Register Guest Check-in
          </h4>
          <form onSubmit={handleCreateVisitorLocal} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Visitor Name</label>
              <input 
                required 
                placeholder="e.g. Rajesh Kumar" 
                value={visitorForm.name} 
                onChange={e => setVisitorForm({...visitorForm, name: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Phone Number</label>
              <input 
                required 
                type="tel" 
                placeholder="e.g. 9876543210" 
                value={visitorForm.phone} 
                onChange={e => setVisitorForm({...visitorForm, phone: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250 font-mono" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Purpose of Visit</label>
              <select 
                value={visitorForm.purpose} 
                onChange={e => setVisitorForm({...visitorForm, purpose: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
              >
                <option value="">Select Purpose</option>
                <option value="Parent-Teacher Meeting">Parent-Teacher Meeting</option>
                <option value="Vendor / Delivery">Vendor / Delivery</option>
                <option value="Job Interview">Job Interview</option>
                <option value="Official Inquiry">Official Inquiry</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Host Employee</label>
              <select 
                value={visitorForm.hostName} 
                onChange={e => setVisitorForm({...visitorForm, hostName: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
              >
                <option value="">Select Host</option>
                {staff.map(s => (
                  <option key={s.id} value={`${s.firstName} ${s.lastName}`}>
                    {s.firstName} {s.lastName} ({s.designation})
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition"
            >
              Issue Gate Pass & Check-In
            </button>
          </form>
        </div>

        {/* Log stream */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Gate Register logs</h4>
          
          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Pass No</th>
                  <th className="p-3">Guest details</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Host Person</th>
                  <th className="p-3">Timestamps</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                    <td className="p-3">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 font-mono uppercase">
                        {visitor.passNumber}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{visitor.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{visitor.phone}</p>
                    </td>
                    <td className="p-3 text-zinc-500">{visitor.purpose}</td>
                    <td className="p-3 text-zinc-500">{visitor.hostName}</td>
                    <td className="p-3 text-zinc-400 text-[10px] space-y-0.5">
                      <p><strong>IN:</strong> {new Date(visitor.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      {visitor.exitTime ? (
                        <p className="text-emerald-600">
                          <strong>OUT:</strong> {new Date(visitor.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      ) : (
                        <p className="text-rose-500 font-bold animate-pulse">On Campus</p>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!visitor.exitTime && (
                        <button 
                          onClick={() => handleCheckoutVisitorLocal(visitor.id)} 
                          className="rounded-lg bg-rose-500/10 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 text-[10px] font-bold text-rose-600 transition"
                        >
                          Checkout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
