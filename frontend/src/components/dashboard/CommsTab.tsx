'use client';

import React, { useState } from 'react';
import { createNoticeApi } from '@/lib/api';

interface CommsTabProps {
  students: any[];
  staff: any[];
  loadNotices: () => void;
  triggerToast: (msg: string) => void;
}

export default function CommsTab({
  students,
  staff,
  loadNotices,
  triggerToast
}: CommsTabProps) {
  // Local state management for cleaner orchestrator code
  const [circularForm, setCircularForm] = useState({ title: '', content: '', targetRoles: [] as string[] });
  const [whatsappGroup, setWhatsappGroup] = useState('PARENTS_ALL');
  const [whatsappText, setWhatsappText] = useState('');
  const [broadcastProgress, setBroadcastProgress] = useState<{ active: boolean; current: number; total: number; log: string[] } | null>(null);

  const toggleCircularRole = (role: string) => {
    setCircularForm(prev => {
      const roles = prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role];
      return { ...prev, targetRoles: roles };
    });
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = circularForm.targetRoles.length > 0 ? circularForm.targetRoles : ['ALL'];
    try {
      await createNoticeApi(circularForm.title, circularForm.content, target);
      triggerToast('Circular notification broadcasted to all terminals!');
      setCircularForm({ title: '', content: '', targetRoles: [] });
      loadNotices();
    } catch (err) {
      alert('Circular create error');
    }
  };

  const handleWhatsappBroadcast = () => {
    if (!whatsappText) {
      alert('Please enter message text');
      return;
    }
    let list: string[] = [];
    if (whatsappGroup === 'PARENTS_ALL') {
      list = students.map(s => `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)} (Parent of ${s.firstName})`);
    } else if (whatsappGroup === 'TEACHERS_ALL') {
      list = staff.filter(s => s.designation === 'TEACHER').map(s => `+91 ${s.phone || '9988776655'} (${s.firstName})`);
    } else {
      list = [`+91 9876543210 (Principal Desk)`, `+91 9998887776 (Registrar)`];
    }

    setBroadcastProgress({
      active: true,
      current: 0,
      total: list.length,
      log: [`Broadcaster initialized for ${list.length} targets...`]
    });

    const runSim = (idx: number) => {
      if (idx >= list.length) {
        setBroadcastProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            log: [...prev.log, `Broadcast finished successfully. ${list.length} messages delivered.`]
          };
        });
        triggerToast('WhatsApp / SMS Broadcast completed!');
        setWhatsappText('');
        return;
      }
      setTimeout(() => {
        setBroadcastProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            current: idx + 1,
            log: [...prev.log, `Delivered: "${whatsappText.substring(0, 15)}..." to ${list[idx]}`]
          };
        });
        runSim(idx + 1);
      }, 500);
    };
    runSim(0);
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        Communications Hub
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Circular announcements target selection */}
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Publish Circular Notice</h4>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Circular Title</label>
            <input 
              required 
              placeholder="Term exam syllabus distribution details" 
              value={circularForm.title} 
              onChange={e => setCircularForm({...circularForm, title: e.target.value})} 
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Message Content</label>
            <textarea 
              required 
              placeholder="Write broadcast text..." 
              rows={4} 
              value={circularForm.content} 
              onChange={e => setCircularForm({...circularForm, content: e.target.value})} 
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Target Roles Scope</label>
            <div className="flex flex-wrap gap-2">
              {['STUDENT', 'PARENT', 'TEACHER', 'STAFF', 'ACCOUNTANT'].map((r) => {
                const isSelected = circularForm.targetRoles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleCircularRole(r)}
                    className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold border transition ${
                      isSelected
                        ? 'bg-sky-600 border-sky-655 text-white shadow-sm'
                        : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
          <button 
            type="submit" 
            className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-3 text-xs font-bold text-white shadow-md transition"
          >
            Broadcast Circular Notice
          </button>
        </form>

        {/* WhatsApp & SMS Broadcaster Simulator */}
        <div className="bg-zinc-50/40 p-4 rounded-xl border border-zinc-150 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">WhatsApp & SMS Broadcast Simulator</h4>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Target Audience Group</label>
            <select 
              value={whatsappGroup} 
              onChange={e => setWhatsappGroup(e.target.value)} 
              className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="PARENTS_ALL">All Parents circular (SMS list)</option>
              <option value="TEACHERS_ALL">All Teachers Block (WhatsApp group)</option>
              <option value="OFFICE_STAFF">Office staff (WhatsApp group)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">WhatsApp Message Text</label>
            <textarea 
              placeholder="e.g. Dear Parents, please note that the terminal fees due date is extended..." 
              rows={3} 
              value={whatsappText} 
              onChange={e => setWhatsappText(e.target.value)} 
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" 
            />
          </div>
          <button 
            type="button" 
            onClick={handleWhatsappBroadcast} 
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-xs font-bold text-white shadow-md transition"
          >
            Initiate Delivery Simulation
          </button>

          {/* Progress panel */}
          {broadcastProgress && (
            <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] space-y-2 animate-fade-in">
              <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
                <span>Delivery Rate</span>
                <span>{broadcastProgress.current} / {broadcastProgress.total} sent</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-250 dark:bg-indigo-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300" 
                  style={{ width: `${(broadcastProgress.current / broadcastProgress.total) * 100}%` }} 
                />
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                {broadcastProgress.log.map((l, i) => <p key={i}>{l}</p>)}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
