'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Calendar, CreditCard } from 'lucide-react';
import { 
  getBooksApi, 
  createBookApi, 
  deleteBookApi,
  issueBookApi, 
  returnBookApi,
  getIssuesApi,
  payLibraryFineApi
} from '@/lib/api';

interface LibraryTabProps {
  librarySubTab: 'inventory' | 'checkout' | 'issues';
  setLibrarySubTab: (tab: 'inventory' | 'checkout' | 'issues') => void;
  students: any[];
  staff: any[];
  triggerToast: (msg: string) => void;
}

export default function LibraryTab({
  librarySubTab,
  setLibrarySubTab,
  students,
  staff,
  triggerToast
}: LibraryTabProps) {
  // Local state management for library desk
  const [books, setBooks] = useState<any[]>([]);
  const [bookIssues, setBookIssues] = useState<any[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', totalCopies: '5' });
  
  // Checkout slip form
  const [checkoutTarget, setCheckoutTarget] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [issueForm, setIssueForm] = useState({ studentId: '', staffId: '', bookId: '' });

  const loadBooksData = async () => {
    try {
      const bList = await getBooksApi(bookSearch);
      const iList = await getIssuesApi();
      setBooks(bList);
      setBookIssues(iList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBooksData();
  }, [bookSearch]);

  const handleCreateBookLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBookApi({
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        totalCopies: parseInt(bookForm.totalCopies) || 1
      });
      triggerToast('New library book catalogued successfully!');
      setBookForm({ title: '', author: '', isbn: '', totalCopies: '5' });
      loadBooksData();
    } catch (err: any) {
      alert(err.message || 'Failed to add book');
    }
  };

  const handleDeleteBookLocal = async (id: string) => {
    if (confirm('Remove book from catalog permanently?')) {
      try {
        await deleteBookApi(id);
        triggerToast('Book removed.');
        loadBooksData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleIssueBookLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = checkoutTarget === 'STUDENT' ? issueForm.studentId : null;
    const staffId = checkoutTarget === 'STAFF' ? issueForm.staffId : null;

    if (!bookForm.title && !issueForm.bookId) {
      alert('Select a catalogued book first');
      return;
    }
    if (checkoutTarget === 'STUDENT' && !studentId) {
      alert('Select student');
      return;
    }
    if (checkoutTarget === 'STAFF' && !staffId) {
      alert('Select staff member');
      return;
    }

    try {
      await issueBookApi(studentId, issueForm.bookId, staffId);
      triggerToast('Book issue checkout record created!');
      setIssueForm({ studentId: '', staffId: '', bookId: '' });
      loadBooksData();
      setLibrarySubTab('issues');
    } catch (err: any) {
      alert(err.message || 'Check out failed');
    }
  };

  const handleReturnBookLocal = async (id: string) => {
    try {
      await returnBookApi(id);
      triggerToast('Book returned to rack. Inventory updated.');
      loadBooksData();
    } catch (err: any) {
      alert(err.message || 'Failed to process return');
    }
  };

  const handlePayFineLocal = async (issueId: string) => {
    try {
      await payLibraryFineApi(issueId);
      triggerToast('Library outstanding fine paid successfully. Receipt generated.');
      loadBooksData();
    } catch (err: any) {
      alert(err.message || 'Failed to pay fine');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Library & Book Circulation Desk</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setLibrarySubTab('inventory')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              librarySubTab === 'inventory' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Book Inventory
          </button>
          <button 
            onClick={() => setLibrarySubTab('checkout')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              librarySubTab === 'checkout' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Issue Checkout Slip
          </button>
          <button 
            onClick={() => setLibrarySubTab('issues')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              librarySubTab === 'issues' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Active Issues
          </button>
        </div>
      </div>

      {librarySubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Create book form */}
          <form onSubmit={handleCreateBookLocal} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Book Title</label>
              <input 
                required 
                placeholder="Introduction to Algorithms" 
                value={bookForm.title} 
                onChange={e => setBookForm({...bookForm, title: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Author</label>
              <input 
                required 
                placeholder="Thomas H. Cormen" 
                value={bookForm.author} 
                onChange={e => setBookForm({...bookForm, author: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">ISBN Code</label>
              <input 
                required 
                placeholder="978-0262033848" 
                value={bookForm.isbn} 
                onChange={e => setBookForm({...bookForm, isbn: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250 font-mono" 
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Catalogue Book</span>
              </button>
            </div>
          </form>

          {/* Search and list */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search books in catalogue..."
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs font-medium outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Title</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">ISBN</th>
                    <th className="p-3">Total Copies</th>
                    <th className="p-3">Available Copies</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 transition">
                      <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{book.title}</td>
                      <td className="p-3 text-zinc-500">{book.author}</td>
                      <td className="p-3 font-mono">{book.isbn}</td>
                      <td className="p-3 text-zinc-650 dark:text-zinc-350">{book.totalCopies}</td>
                      <td className="p-3">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          book.availableCopies > 0 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {book.availableCopies} available
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleDeleteBookLocal(book.id)} 
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {librarySubTab === 'checkout' && (
        <form onSubmit={handleIssueBookLocal} className="w-full max-w-md rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/20 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Generate Book Checkout Slip</h4>
          
          {/* Checkout target toggle */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Checkout Recipient Type</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="checkoutTarget" 
                  checked={checkoutTarget === 'STUDENT'}
                  onChange={() => setCheckoutTarget('STUDENT')}
                  className="text-sky-600 focus:ring-sky-500" 
                />
                <span>Student Portal borrower</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="checkoutTarget" 
                  checked={checkoutTarget === 'STAFF'}
                  onChange={() => setCheckoutTarget('STAFF')}
                  className="text-sky-600 focus:ring-sky-500" 
                />
                <span>Staff / Faculty borrower</span>
              </label>
            </div>
          </div>

          {checkoutTarget === 'STUDENT' ? (
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Student Borrower</label>
              <select
                value={issueForm.studentId}
                onChange={e => setIssueForm({...issueForm, studentId: e.target.value})}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
              >
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.rollNumber})</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Staff/Faculty Borrower</label>
              <select
                value={issueForm.staffId}
                onChange={e => setIssueForm({...issueForm, staffId: e.target.value})}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
              >
                <option value="">Select Staff</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.designation})</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Book Title</label>
            <select
              value={issueForm.bookId}
              onChange={e => setIssueForm({...issueForm, bookId: e.target.value})}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
            >
              <option value="">Select Catalogued Book</option>
              {books.filter(b => b.availableCopies > 0).map(b => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} left)</option>)}
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3.5 text-xs font-bold text-white shadow-md transition"
          >
            Generate Checkout Slip
          </button>
        </form>
      )}

      {librarySubTab === 'issues' && (
        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                <th className="p-3">Book Title</th>
                <th className="p-3">Issued To</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Outstanding Fines</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
              {bookIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 transition">
                  <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{issue.book?.title}</td>
                  <td className="p-3 text-zinc-700 dark:text-zinc-300">
                    {issue.student ? (
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{issue.student.firstName} {issue.student.lastName} <b className="text-[10px] text-sky-600 bg-sky-100/50 px-1 rounded">Student</b></span>
                    ) : issue.staff ? (
                      <span className="font-semibold text-zinc-750 dark:text-zinc-300">{issue.staff.firstName} {issue.staff.lastName} <b className="text-[10px] text-amber-600 bg-amber-100/50 px-1 rounded">Staff</b></span>
                    ) : (
                      <span className="text-zinc-400">General Borrower</span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-500 font-semibold flex items-center gap-1 mt-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                      issue.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-600' :
                      issue.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-600 animate-pulse border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {issue.fineAmount > 0 ? (
                      <div className="space-y-1">
                        <div className="font-extrabold text-rose-500">₹{issue.fineAmount}.00</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          issue.fineStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {issue.fineStatus}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 font-bold">₹0.00</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {issue.fineStatus === 'UNPAID' && issue.fineAmount > 0 && (
                        <button 
                          onClick={() => handlePayFineLocal(issue.id)} 
                          className="flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 px-2.5 py-1 text-[10px] font-black text-white transition shadow-sm"
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>Pay Fine</span>
                        </button>
                      )}
                      {issue.status !== 'RETURNED' && (
                        <button 
                          onClick={() => handleReturnBookLocal(issue.id)} 
                          className="rounded bg-emerald-650 hover:bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white transition shadow-sm"
                        >
                          Return Book
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
