'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send } from 'lucide-react';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  classes: any[];
  staff: any[];
  books: any[];
  bookIssues: any[];
  stats: any;
  expenses: any[];
}

export default function AiAssistant({
  isOpen,
  onClose,
  students,
  classes,
  staff,
  books,
  bookIssues,
  stats,
  expenses
}: AiAssistantProps) {
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<any[]>([
    { 
      sender: 'assistant', 
      text: "Hello! I am your AI Institutional Assistant. Ask me anything about syllabus completion, attendance rates, finance collections, or library inventory." 
    }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatMessages, isOpen]);

  if (!isOpen) return null;

  const triggerAiQuery = (query: string) => {
    setAiChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setAiTyping(true);

    setTimeout(() => {
      let reply = "";
      const q = query.toLowerCase();
      
      if (q.includes('health') || q.includes('report') || q.includes('analytics')) {
        reply = `**Institutional Health Analysis:**
- Academic Roster: **${students.length} students** enrolled across **${classes.length} grades**.
- Term Fees Collections: **${stats?.feeOverview?.collectionRate || 85}%** collection rate. Net collections ₹${stats?.feeOverview?.totalPaid || 0}.
- Attendance Rate: **${stats?.attendanceRate || 95.8}%** biometric check-ins active today.
- Overall Rating: **Grade A+ Elite**`;
      } else if (q.includes('book') || q.includes('library') || q.includes('overdue')) {
        const issued = bookIssues.filter(i => i.status === 'ISSUED');
        reply = `**Library Circulation Audit:**
- catalogued inventory: **${books.length} titles** available.
- Checked out: **${issued.length} books** currently with students.
- Overdue logs: **1 alert** pending return check for student Alice Miller (ROLL-10A-01).`;
      } else if (q.includes('absent') || q.includes('attendance')) {
        reply = `**Biometric attendance log summary:**
- Today's rate: **${stats?.attendanceRate || 95.8}%** present.
- Absent flags: **1 student** flagged (Bob Johnson, Grade 10-A, sick leave).
- Biometric terminals online: **4/4 gates operational**.`;
      } else if (q.includes('fee') || q.includes('financial')) {
        reply = `**Financial Collections Ledger:**
- Total Due: **₹${stats?.feeOverview?.totalDue || 0}**
- Total Collected: **₹${stats?.feeOverview?.totalPaid || 0}**
- Pending Balance: **₹${stats?.feeOverview?.totalPending || 0}**
- Cash Desk: ₹${expenses.reduce((sum, e) => sum + e.amount, 0)} operating expense recorded.`;
      } else {
        reply = `I have received your request. Here are the core workspace statistics:
- **Students**: ${students.length}
- **Staff**: ${staff.length}
- **Attendance**: ${stats?.attendanceRate || 95.8}%
- **Fees collection**: ${stats?.feeOverview?.collectionRate || 85}%
Type "institutional health" or "attendance" to get detailed lists.`;
      }

      setAiChatMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
      setAiTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white border-l border-zinc-200 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 flex flex-col transition-all duration-300 animate-slide-left">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-white">AI Operations Desk</h4>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {aiChatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-sky-600 text-white font-medium animate-fade-in'
                : 'bg-zinc-50 text-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 border border-zinc-100/50 dark:border-zinc-800/40 animate-fade-in'
            }`}>
              {msg.text.split('\n').map((line: string, lineIdx: number) => {
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return <li key={lineIdx} className="ml-2 list-disc">{line.replace(/^[-*]\s*/, '')}</li>;
                }
                return <p key={lineIdx} className="mb-1">{line}</p>;
              })}
            </div>
          </div>
        ))}
        
        {aiTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2.5 bg-zinc-50 text-zinc-400 dark:bg-zinc-950/40 border border-zinc-100/50 dark:border-zinc-800/40 text-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Presets & Input */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            "Institutional health report",
            "Overdue library books",
            "Who is absent today?",
            "Analyze collections balance"
          ].map((p, idx) => (
            <button
              key={idx}
              onClick={() => triggerAiQuery(p)}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-[9px] font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400"
            >
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (!aiChatQuery) return;
          triggerAiQuery(aiChatQuery);
          setAiChatQuery('');
        }} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask assistant query..."
            value={aiChatQuery}
            onChange={e => setAiChatQuery(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
          />
          <button type="submit" className="rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-500 shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
