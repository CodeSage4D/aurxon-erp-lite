'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveCategory: (cat: string) => void;
  setStudentTab: (tab: 'list' | 'admission' | 'promotions') => void;
  setLibrarySubTab: (tab: 'inventory' | 'checkout' | 'issues') => void;
  handleRoleChange: (role: string) => void;
  setAiAssistantOpen: (open: boolean) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  setActiveCategory,
  setStudentTab,
  setLibrarySubTab,
  handleRoleChange,
  setAiAssistantOpen
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const commands = [
    { 
      title: "Dashboard Overview", 
      action: () => { setActiveCategory('overview'); onClose(); }, 
      desc: "View key metrics and RFID logs" 
    },
    { 
      title: "Admit Student Form", 
      action: () => { setActiveCategory('students'); setStudentTab('admission'); onClose(); }, 
      desc: "Enroll new pupil with Indian demographic IDs" 
    },
    { 
      title: "Issue a Library Book", 
      action: () => { setActiveCategory('library'); setLibrarySubTab('checkout'); onClose(); }, 
      desc: "Borrow register checkout slips" 
    },
    { 
      title: "Visitor Gate Desk log", 
      action: () => { setActiveCategory('gate'); onClose(); }, 
      desc: "Register guest check-in and checkout" 
    },
    { 
      title: "Certificate Desk & Document Generator", 
      action: () => { setActiveCategory('certificates'); onClose(); }, 
      desc: "Generate Study, Bonafide or Transfer Certificates" 
    },
    { 
      title: "Inventory & Assets Desk", 
      action: () => { setActiveCategory('inventory'); onClose(); }, 
      desc: "Log school assets, furniture, and supplies" 
    },
    { 
      title: "Quick Switch Role: Principal", 
      action: () => { handleRoleChange('PRINCIPAL'); onClose(); }, 
      desc: "Change ERP permission view" 
    },
    { 
      title: "Quick Switch Role: Accountant", 
      action: () => { handleRoleChange('ACCOUNTANT'); onClose(); }, 
      desc: "Access Fees ledger" 
    },
    { 
      title: "Quick Switch Role: Librarian", 
      action: () => { handleRoleChange('LIBRARIAN'); onClose(); }, 
      desc: "Borrow lists and book inventory" 
    },
    { 
      title: "Ask AI Assistant", 
      action: () => { setAiAssistantOpen(true); onClose(); }, 
      desc: "Open side chat dialog box" 
    },
    { 
      title: "Simulate DB Backup Vault", 
      action: () => { setActiveCategory('settings'); onClose(); }, 
      desc: "Neon postgres backup simulation" 
    },
    { 
      title: "Dark Theme Toggle", 
      action: () => { document.documentElement.classList.toggle('dark'); onClose(); }, 
      desc: "Toggle color modes" 
    }
  ];

  const filteredCommands = commands.filter(
    item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-zinc-100 px-4 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search command shortcuts... (e.g. library, admit student, principal)"
            className="w-full border-none bg-transparent px-3 py-4 text-sm text-zinc-900 outline-none placeholder-zinc-400 dark:text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={onClose} 
            className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 dark:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ESC
          </button>
        </div>
        
        {/* Filtered options list */}
        <div className="max-h-72 overflow-y-auto p-2">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Actions & Navigation
          </p>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</p>
                  <p className="text-[10px] text-zinc-400">{item.desc}</p>
                </div>
                <ChevronRight className="h-3 w-3 text-zinc-400" />
              </button>
            ))
          ) : (
            <p className="p-4 text-center text-xs text-zinc-400">No matching commands found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
