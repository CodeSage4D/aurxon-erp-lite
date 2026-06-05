'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Trash2, ShieldCheck, FileSpreadsheet, ChevronDown, ChevronLeft, ChevronRight,
  User, Users, FileText, Clock, Upload, Eye, Download, X, CheckCircle,
  AlertTriangle, Filter, ArrowUpDown, Search, FileUp, Plus, RefreshCw
} from 'lucide-react';
import {
  deleteStudentApi, getPinCodeDetails, getStudentsApi, getStudentApi,
  uploadDocumentApi, deleteDocumentApi, importStudentsApi
} from '@/lib/api';
import CountryPhoneInput from '@/01_Core/Dashboard/CountryPhoneInput';
import { INDIAN_STATES_AND_UTS } from '@/lib/indianData';

// ─── Searchable Select ────────────────────────────────────────────────────────
interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

function SearchableSelect({ label, value, onChange, options, placeholder = 'Select...', disabled = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value || ''); }, [value]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch(value || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="relative space-y-1.5 flex-1 w-full" ref={containerRef}>
      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</label>
      <div className="relative">
        <input type="text" disabled={disabled} placeholder={placeholder} value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => !disabled && setIsOpen(true)}
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-250 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/40 disabled:text-zinc-400"
        />
        <ChevronDown className="absolute right-3.5 top-5 h-4 w-4 text-zinc-400 pointer-events-none" />
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 mt-1.5 z-[90] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <button key={opt} type="button"
                onClick={() => { onChange(opt); setSearch(opt); setIsOpen(false); }}
                className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition ${value === opt ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/5 dark:text-sky-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {opt}
              </button>
            )) : (
              <div className="p-3 text-center text-zinc-400 italic text-[11px]">No options match query.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{value}</span>
    </div>
  );
}

// ─── Timeline Icon ────────────────────────────────────────────────────────────
const TIMELINE_ICONS: Record<string, string> = {
  ADMISSION: '🎓', STATUS_CHANGE: '🔄', PROMOTION: '📈',
  DOCUMENT_UPLOAD: '📎', DOCUMENT_REMOVE: '🗑️', NOTE: '📝',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface StudentsTabProps {
  students: any[];
  classes: any[];
  studentTab: 'list' | 'admission' | 'promotions';
  setStudentTab: (tab: 'list' | 'admission' | 'promotions') => void;
  admissionWizardStep: number;
  setAdmissionWizardStep: (step: number) => void;
  studentForm: any;
  setStudentForm: (form: any) => void;
  handleCreateStudent: (e: React.FormEvent) => void;
  promotionSelectedStudents: string[];
  setPromotionSelectedStudents: React.Dispatch<React.SetStateAction<string[]>>;
  promotionTargetClassId: string;
  setPromotionTargetClassId: (id: string) => void;
  handlePromoteStudents: () => void;
  promotionsHistory: any[];
  loadStudents: () => void;
  triggerToast: (msg: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentsTab({
  students: propStudents,
  classes,
  studentTab,
  setStudentTab,
  admissionWizardStep,
  setAdmissionWizardStep,
  studentForm,
  setStudentForm,
  handleCreateStudent,
  promotionSelectedStudents,
  setPromotionSelectedStudents,
  promotionTargetClassId,
  setPromotionTargetClassId,
  handlePromoteStudents,
  promotionsHistory,
  loadStudents,
  triggerToast,
}: StudentsTabProps) {

  // ── Directory state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('rollNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [dirData, setDirData] = useState<{ students: any[]; total: number; totalPages: number }>({ students: [], total: 0, totalPages: 1 });
  const [dirLoading, setDirLoading] = useState(false);

  // ── Profile Sheet state ──
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileTab, setProfileTab] = useState<'overview' | 'documents' | 'timeline' | 'history'>('overview');

  // ── Document upload state ──
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);

  // ── Bulk import state ──
  const [importTab, setImportTab] = useState(false);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<string>('');
  const [importResult, setImportResult] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);

  // ── PIN Code Auto-Lookup ──
  useEffect(() => {
    if (studentForm.pinCode && studentForm.pinCode.length === 6) {
      const pinDetails = getPinCodeDetails(studentForm.pinCode);
      if (pinDetails) {
        setStudentForm((prev: any) => ({ ...prev, state: pinDetails.state, district: pinDetails.district, city: pinDetails.district }));
        triggerToast(`PIN Code mapped: ${pinDetails.district}, ${pinDetails.state}`);
      }
    }
  }, [studentForm.pinCode, setStudentForm, triggerToast]);

  // ── Server-side fetch ──
  const fetchDirectory = useCallback(async () => {
    setDirLoading(true);
    try {
      const data = await getStudentsApi({
        search: searchTerm || undefined,
        classId: filterClassId || undefined,
        status: filterStatus || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      setDirData({ students: data.students || [], total: data.total || 0, totalPages: data.totalPages || 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setDirLoading(false);
    }
  }, [searchTerm, filterClassId, filterStatus, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    if (studentTab === 'list' && !importTab && !selectedStudent) {
      fetchDirectory();
    }
  }, [studentTab, importTab, selectedStudent, fetchDirectory]);

  // Debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchDirectory(), 400);
  };

  // ── Open profile ──
  const openProfile = async (student: any) => {
    setProfileLoading(true);
    setSelectedStudent({ ...student, _loading: true });
    setProfileTab('overview');
    try {
      const full = await getStudentApi(student.id);
      setSelectedStudent(full);
    } catch {
      setSelectedStudent(student);
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Document upload ──
  const handleDocUpload = async () => {
    if (!docName.trim() || !docFile || !selectedStudent) return;
    setDocUploading(true);
    try {
      // Encode file as base64 data URL and store locally
      const reader = new FileReader();
      reader.onload = async () => {
        const fileUrl = reader.result as string;
        const doc = await uploadDocumentApi(selectedStudent.id, docName.trim(), fileUrl);
        setSelectedStudent((prev: any) => ({
          ...prev,
          documents: [...(prev.documents || []), doc],
          timeline: [{ id: `t-${Date.now()}`, type: 'DOCUMENT_UPLOAD', description: `Document "${docName}" uploaded.`, eventDate: new Date().toISOString() }, ...(prev.timeline || [])],
        }));
        setDocName('');
        setDocFile(null);
        triggerToast(`Document "${docName}" uploaded successfully.`);
      };
      reader.readAsDataURL(docFile);
    } catch (err: any) {
      triggerToast(err.message || 'Upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  // ── Document delete ──
  const handleDocDelete = async (docId: string, docNameStr: string) => {
    if (!confirm(`Remove document "${docNameStr}"? This cannot be undone.`)) return;
    try {
      await deleteDocumentApi(selectedStudent.id, docId);
      setSelectedStudent((prev: any) => ({ ...prev, documents: (prev.documents || []).filter((d: any) => d.id !== docId) }));
      triggerToast(`Document removed.`);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to remove document');
    }
  };

  // ── CSV Parser ──
  const handleCsvParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file.name);
    setCsvErrors([]);
    setCsvRows([]);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split('\n').filter(Boolean);
      if (lines.length < 2) { setCsvErrors([{ row: 0, field: 'file', message: 'CSV must have a header row and at least one data row.' }]); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const REQUIRED_HEADERS = ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender', 'className'];
      const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
      if (missing.length > 0) {
        setCsvErrors([{ row: 0, field: 'headers', message: `Missing required columns: ${missing.join(', ')}` }]);
        return;
      }
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((h, i) => { row[h] = vals[i] || ''; });
        return row;
      });
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  // ── CSV Submit ──
  const handleImportSubmit = async () => {
    if (csvRows.length === 0) return;
    setImportLoading(true);
    try {
      const result = await importStudentsApi(csvRows);
      setImportResult(result);
      if (result.errors && result.errors.length > 0) {
        setCsvErrors(result.errors);
      } else {
        triggerToast(`✅ Imported ${result.imported} students successfully.`);
        loadStudents();
        fetchDirectory();
      }
    } catch (err: any) {
      triggerToast(err.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      GRADUATED: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      DROPPED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      ARCHIVED: 'bg-zinc-200/80 text-zinc-500',
    };
    return map[status] || 'bg-zinc-100 text-zinc-500';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">

      {/* ── Tab Bar ── */}
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800 flex-wrap gap-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Student & Scholar Registry</h3>
        <div className="flex gap-2 flex-wrap">
          {(['list', 'admission', 'promotions'] as const).map(tab => (
            <button key={tab} onClick={() => { setStudentTab(tab); setSelectedStudent(null); setImportTab(false); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${studentTab === tab ? 'bg-sky-600 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>
              {tab === 'list' ? 'Roster Directory' : tab === 'admission' ? 'Admission Desk' : 'Promotions'}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          ROSTER DIRECTORY TAB
          ════════════════════════════════════════════════════════════════════════ */}
      {studentTab === 'list' && (
        <div className="space-y-5">

          {/* ── Student Profile Sheet ── */}
          {selectedStudent && !importTab && (
            <div className="space-y-5 animate-fade-in">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <button onClick={() => setSelectedStudent(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition">
                  <ChevronLeft className="h-4 w-4" /> Back to Directory
                </button>
              </div>

              {profileLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="h-7 w-7 border-4 border-sky-500 border-r-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Profile Card */}
                  <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xl font-black shrink-0">
                        {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                            {selectedStudent.firstName} {selectedStudent.lastName}
                          </h2>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${statusBadge(selectedStudent.status)}`}>
                            {selectedStudent.status}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-zinc-500">
                          <span>📚 {selectedStudent.class?.name || 'Unassigned'}</span>
                          <span className="font-mono">🎓 {selectedStudent.scholarNumber || '—'}</span>
                          <span>📋 Roll: {selectedStudent.rollNumber || '—'}</span>
                          <span>⚥ {selectedStudent.gender}</span>
                          {selectedStudent.user?.email && <span>✉️ {selectedStudent.user.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Tab Bar */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { key: 'overview', icon: <User className="h-3.5 w-3.5" />, label: 'Overview' },
                      { key: 'documents', icon: <FileText className="h-3.5 w-3.5" />, label: `Documents (${selectedStudent.documents?.length || 0})` },
                      { key: 'timeline', icon: <Clock className="h-3.5 w-3.5" />, label: 'Timeline' },
                      { key: 'history', icon: <RefreshCw className="h-3.5 w-3.5" />, label: 'Status History' },
                    ].map(t => (
                      <button key={t.key} onClick={() => setProfileTab(t.key as any)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition ${profileTab === t.key ? 'bg-sky-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                        {t.icon}{t.label}
                      </button>
                    ))}
                  </div>

                  {/* ── OVERVIEW ── */}
                  {profileTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                      {/* Personal */}
                      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-sky-600 border-b border-zinc-100 dark:border-zinc-800 pb-2">Personal & Demographics</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <FieldRow label="Date of Birth" value={selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-IN') : null} />
                          <FieldRow label="Blood Group" value={selectedStudent.bloodGroup} />
                          <FieldRow label="Religion" value={selectedStudent.religion} />
                          <FieldRow label="Caste Category" value={selectedStudent.casteCategory} />
                          <FieldRow label="Mother Tongue" value={selectedStudent.motherTongue} />
                          <FieldRow label="Nationality" value={selectedStudent.nationality} />
                          <FieldRow label="Aadhaar (UIDAI)" value={selectedStudent.aadhaarNumber || undefined} />
                          <FieldRow label="PEN Number" value={selectedStudent.penNumber} />
                          <FieldRow label="Samagra ID" value={selectedStudent.samagraId} />
                          <FieldRow label="Family ID" value={selectedStudent.familyId} />
                        </div>
                        {(selectedStudent.houseNo || selectedStudent.street || selectedStudent.city) && (
                          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Address</span>
                            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                              {[selectedStudent.houseNo, selectedStudent.street, selectedStudent.city, selectedStudent.district, selectedStudent.state, selectedStudent.pinCode].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Guardian */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" /> Guardians
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <FieldRow label="Father's Name" value={selectedStudent.fatherName} />
                            <FieldRow label="Mother's Name" value={selectedStudent.motherName} />
                            <FieldRow label="Father's Occupation" value={selectedStudent.fatherOccupation} />
                            <FieldRow label="Mother's Occupation" value={selectedStudent.motherOccupation} />
                            <FieldRow label="Annual Income" value={selectedStudent.annualIncome ? `₹${Number(selectedStudent.annualIncome).toLocaleString('en-IN')}` : null} />
                          </div>
                          {selectedStudent.parent && (
                            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Guardian Contact</span>
                              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 mt-1">
                                {selectedStudent.parent.firstName} {selectedStudent.parent.lastName}
                              </p>
                              <p className="text-[11px] text-zinc-500">{selectedStudent.parent.phone}</p>
                            </div>
                          )}
                        </div>

                        {/* Banking */}
                        {(selectedStudent.bankName || selectedStudent.accNumber) && (
                          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 border-b border-zinc-100 dark:border-zinc-800 pb-2">DBT Banking Details</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <FieldRow label="Bank Name" value={selectedStudent.bankName} />
                              <FieldRow label="IFSC Code" value={selectedStudent.ifscCode} />
                              <FieldRow label="Account Number" value={selectedStudent.accNumber} />
                              <FieldRow label="Branch" value={selectedStudent.bankBranch} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── DOCUMENTS ── */}
                  {profileTab === 'documents' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Upload Form */}
                      <div className="rounded-xl border border-dashed border-sky-300 dark:border-sky-800 bg-sky-500/5 p-4 space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-sky-600 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload New Document</h5>
                        <div className="flex flex-wrap gap-3 items-end">
                          <div className="flex-1 min-w-[160px]">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Document Name</label>
                            <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Birth Certificate"
                              className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs outline-none text-zinc-800 dark:text-zinc-200 focus:border-sky-500" />
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Select File (PDF/PNG/JPG, max 5MB)</label>
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg"
                              onChange={e => setDocFile(e.target.files?.[0] || null)}
                              className="mt-1.5 block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer" />
                          </div>
                          <button onClick={handleDocUpload} disabled={!docName.trim() || !docFile || docUploading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 disabled:opacity-50 transition whitespace-nowrap">
                            {docUploading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            Upload
                          </button>
                        </div>
                      </div>

                      {/* Document List */}
                      {(!selectedStudent.documents || selectedStudent.documents.length === 0) ? (
                        <div className="text-center py-10 text-zinc-400">
                          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm font-semibold">No documents attached yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedStudent.documents.map((doc: any) => (
                            <div key={doc.id} className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-indigo-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{doc.name}</p>
                                <p className="text-[10px] text-zinc-400 font-mono truncate">{doc.fileUrl?.substring(0, 40)}...</p>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                {doc.fileUrl && (
                                  <button onClick={() => setPreviewDoc({ name: doc.name, url: doc.fileUrl })}
                                    className="p-1.5 rounded-lg hover:bg-sky-500/10 text-sky-600 transition" title="Preview">
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <a href={doc.fileUrl} download={doc.name}
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition" title="Download">
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                                <button onClick={() => handleDocDelete(doc.id, doc.name)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition" title="Remove">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TIMELINE ── */}
                  {profileTab === 'timeline' && (
                    <div className="space-y-3 animate-fade-in">
                      {(!selectedStudent.timeline || selectedStudent.timeline.length === 0) ? (
                        <div className="text-center py-10 text-zinc-400">
                          <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm font-semibold">No timeline events yet.</p>
                        </div>
                      ) : (
                        <div className="relative space-y-0">
                          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-zinc-100 dark:bg-zinc-800" />
                          {selectedStudent.timeline.map((event: any, i: number) => (
                            <div key={event.id || i} className="relative flex gap-4 pl-12 pb-5 animate-fade-in">
                              <div className="absolute left-2.5 top-1 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm z-10">
                                {TIMELINE_ICONS[event.type] || '📌'}
                              </div>
                              <div className="flex-1 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">{event.type?.replace('_', ' ')}</span>
                                  <span className="text-[10px] text-zinc-400">{new Date(event.eventDate || event.createdAt).toLocaleString('en-IN')}</span>
                                </div>
                                <p className="mt-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{event.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── STATUS HISTORY ── */}
                  {profileTab === 'history' && (
                    <div className="space-y-3 animate-fade-in">
                      {(!selectedStudent.statusHistory || selectedStudent.statusHistory.length === 0) ? (
                        <div className="text-center py-10 text-zinc-400">
                          <RefreshCw className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm font-semibold">No status history recorded.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5">From</th>
                                <th className="p-3.5">To</th>
                                <th className="p-3.5">Changed By</th>
                                <th className="p-3.5">Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                              {selectedStudent.statusHistory.map((h: any, i: number) => (
                                <tr key={h.id || i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition">
                                  <td className="p-3.5 text-zinc-500">{new Date(h.changedAt).toLocaleString('en-IN')}</td>
                                  <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{h.oldStatus}</span></td>
                                  <td className="p-3.5"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge(h.newStatus)}`}>{h.newStatus}</span></td>
                                  <td className="p-3.5 font-mono text-[10px] text-zinc-400">{h.changedBy?.email || 'System'}</td>
                                  <td className="p-3.5 text-zinc-600 dark:text-zinc-300">{h.remarks || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Bulk Import Console ── */}
          {importTab && !selectedStudent && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <button onClick={() => { setImportTab(false); setCsvRows([]); setCsvErrors([]); setImportResult(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition">
                  <ChevronLeft className="h-4 w-4" /> Back to Directory
                </button>
              </div>

              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-500/5 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-indigo-500" />
                  <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100">Bulk Student Import Console</h4>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-300/30 p-3 text-xs text-amber-700 dark:text-amber-400 font-semibold space-y-1">
                  <p className="font-black">Required CSV Headers:</p>
                  <p className="font-mono text-[10px]">firstName, lastName, email, dateOfBirth (YYYY-MM-DD), gender (MALE/FEMALE/OTHER), className</p>
                  <p className="font-black mt-1">Optional Headers:</p>
                  <p className="font-mono text-[10px]">rollNumber, fatherName, motherName, parentPhone, aadhaarNumber, bloodGroup, religion, casteCategory, city, state, pinCode</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Upload CSV File</label>
                  <input type="file" accept=".csv" onChange={handleCsvParse}
                    className="block w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" />
                  {csvFile && <p className="text-[10px] text-zinc-400">File: <span className="font-mono text-zinc-600 dark:text-zinc-300">{csvFile}</span></p>}
                </div>

                {/* Validation Errors */}
                {csvErrors.length > 0 && (
                  <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-500/5 p-4 space-y-2 max-h-52 overflow-y-auto">
                    <div className="flex items-center gap-1.5 text-red-600 font-black text-xs">
                      <AlertTriangle className="h-4 w-4" /> {csvErrors.length} Validation Error{csvErrors.length !== 1 ? 's' : ''} Found
                    </div>
                    {csvErrors.map((err, i) => (
                      <div key={i} className="text-[10px] font-mono bg-white dark:bg-zinc-900 rounded-lg p-2 border border-red-100 dark:border-red-900">
                        <span className="font-black text-red-600">Row {err.row}</span>
                        {err.field && <span className="text-zinc-400"> [{err.field}]</span>}
                        <span className="text-zinc-600 dark:text-zinc-300"> — {err.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview Table */}
                {csvRows.length > 0 && csvErrors.length === 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Preview — {csvRows.length} Row{csvRows.length !== 1 ? 's' : ''} Ready</h5>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-60">
                      <table className="w-full text-[10px] border-collapse min-w-max">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-950 font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                            {Object.keys(csvRows[0]).map(k => <th key={k} className="px-3 py-2">{k}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {csvRows.slice(0, 10).map((row, i) => (
                            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
                              {Object.values(row).map((v: any, j) => <td key={j} className="px-3 py-1.5 font-mono text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{v || '—'}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csvRows.length > 10 && <p className="text-[10px] text-zinc-400 italic">Showing first 10 rows of {csvRows.length}.</p>}
                  </div>
                )}

                {/* Import Result */}
                {importResult && importResult.success && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-500/5 p-4">
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                      <CheckCircle className="h-5 w-5" /> {importResult.imported} Students Imported Successfully
                    </div>
                    {importResult.students && (
                      <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                        {importResult.students.map((s: any, i: number) => (
                          <div key={i} className="text-[10px] font-mono bg-white dark:bg-zinc-900 rounded p-1.5 border border-emerald-100 dark:border-emerald-900">
                            <span className="font-black text-emerald-600">{s.scholarNumber}</span> · {s.email} · <span className="text-zinc-400">Temp: {s.temporaryPassword}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={handleImportSubmit}
                    disabled={csvRows.length === 0 || csvErrors.length > 0 || importLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition">
                    {importLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
                    {importLoading ? 'Importing...' : `Import ${csvRows.length} Student${csvRows.length !== 1 ? 's' : ''}`}
                  </button>
                  <button onClick={() => { setCsvRows([]); setCsvErrors([]); setCsvFile(''); setImportResult(null); }}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Directory Roster ── */}
          {!selectedStudent && !importTab && (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-950 min-w-[220px] flex-1">
                  <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <input type="text" placeholder="Search name, roll, scholar..."
                    value={searchTerm} onChange={e => handleSearchChange(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none text-zinc-800 dark:text-zinc-200" />
                </div>

                {/* Class filter */}
                <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setPage(1); }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs outline-none text-zinc-700 dark:text-zinc-300">
                  <option value="">All Classes</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {/* Status filter */}
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs outline-none text-zinc-700 dark:text-zinc-300">
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="DROPPED">Dropped</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                {/* Sort */}
                <button onClick={() => { setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 transition">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                </button>

                {/* Limit */}
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs outline-none text-zinc-700 dark:text-zinc-300">
                  <option value={10}>10 / page</option>
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <div className="flex-1" />

                {/* Bulk Import button */}
                <button onClick={() => setImportTab(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition">
                  <FileUp className="h-3.5 w-3.5" /> Bulk Import CSV
                </button>

                {/* Refresh */}
                <button onClick={fetchDirectory}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-sky-600 hover:border-sky-300 transition">
                  <RefreshCw className={`h-3.5 w-3.5 ${dirLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="font-bold text-zinc-600 dark:text-zinc-300">{dirData.total}</span> total scholars found
                {filterClassId && <span>· Filtered by class</span>}
                {filterStatus && <span>· Status: {filterStatus}</span>}
                {searchTerm && <span>· Searching: "{searchTerm}"</span>}
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Scholar No</th>
                      <th className="p-3.5 cursor-pointer hover:text-sky-600 transition" onClick={() => { setSortBy('firstName'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                        <span className="flex items-center gap-1">Student Name <ArrowUpDown className="h-3 w-3" /></span>
                      </th>
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5">Grade</th>
                      <th className="p-3.5">Guardian</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                    {dirLoading ? (
                      <tr><td colSpan={7} className="p-10 text-center">
                        <div className="inline-block h-6 w-6 border-4 border-sky-500 border-r-transparent rounded-full animate-spin" />
                      </td></tr>
                    ) : dirData.students.length > 0 ? (
                      dirData.students.map(student => (
                        <tr key={student.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition group">
                          <td className="p-3.5">
                            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase font-mono">
                              {student.scholarNumber || `SCH-${student.id?.substring(0, 8)?.toUpperCase()}`}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button onClick={() => openProfile(student)}
                              className="font-bold text-zinc-800 dark:text-zinc-200 hover:text-sky-600 dark:hover:text-sky-400 transition text-left">
                              {student.firstName} {student.lastName}
                            </button>
                          </td>
                          <td className="p-3.5 text-zinc-500 font-mono">{student.rollNumber}</td>
                          <td className="p-3.5 text-zinc-600 dark:text-zinc-300">{student.class?.name || 'Unassigned'}</td>
                          <td className="p-3.5 text-zinc-500 text-[11px]">
                            {student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : '—'}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusBadge(student.status)}`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openProfile(student)}
                                className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-500/10 transition" title="View Profile">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={async () => {
                                if (confirm('Archive this student record? The student login will be deactivated.')) {
                                  try {
                                    await deleteStudentApi(student.id);
                                    triggerToast('Student archived successfully.');
                                    fetchDirectory();
                                    loadStudents();
                                  } catch (err: any) {
                                    alert(err.message || 'Failed to archive');
                                  }
                                }
                              }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition" title="Archive Student">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-8 text-center text-zinc-400 italic">No students found matching your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {dirData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-zinc-400">
                    Page <span className="font-bold text-zinc-600 dark:text-zinc-300">{page}</span> of <span className="font-bold">{dirData.totalPages}</span>
                    <span className="ml-2">({dirData.total} total)</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(1)} disabled={page === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition">«</button>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {Array.from({ length: Math.min(5, dirData.totalPages) }, (_, i) => {
                      let p = page - 2 + i;
                      if (p < 1) p = i + 1;
                      if (p > dirData.totalPages) p = dirData.totalPages - (4 - i);
                      if (p < 1 || p > dirData.totalPages) return null;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${p === page ? 'bg-sky-600 text-white shadow-sm' : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                          {p}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(dirData.totalPages, p + 1))} disabled={page === dirData.totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setPage(dirData.totalPages)} disabled={page === dirData.totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition">»</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADMISSION DESK TAB
          ════════════════════════════════════════════════════════════════════════ */}
      {studentTab === 'admission' && (
        <div className="space-y-6">
          {/* Stepper Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-150 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">{admissionWizardStep}</span>
              <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Admission Step {admissionWizardStep} of 6</h4>
            </div>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5,6].map(s => (
                <button key={s} type="button" onClick={() => setAdmissionWizardStep(s)}
                  className={`h-2 rounded-full transition-all duration-300 ${admissionWizardStep === s ? 'w-6 bg-sky-600' : admissionWizardStep > s ? 'w-2 bg-emerald-500' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`}
                  title={`Go to Step ${s}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[{num:1,label:'1. Basic Info'},{num:2,label:'2. Academics'},{num:3,label:'3. Parents'},{num:4,label:'4. Address'},{num:5,label:'5. Banking'},{num:6,label:'6. Documents'}].map(step => (
              <button key={step.num} type="button" onClick={() => setAdmissionWizardStep(step.num)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${admissionWizardStep === step.num ? 'bg-sky-600 text-white shadow-sm' : admissionWizardStep > step.num ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-zinc-100 hover:bg-zinc-150 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                {step.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateStudent} className="space-y-6">
            {/* STEP 1: Basic Info */}
            {admissionWizardStep === 1 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">Scholar Profile & Personal Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">First Name</label><input required value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Last Name</label><input required value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Date of Birth</label><input type="date" required value={studentForm.dateOfBirth} onChange={e => setStudentForm({...studentForm, dateOfBirth: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Gender</label>
                    <select value={studentForm.gender} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Blood Group</label>
                    <select value={studentForm.bloodGroup} onChange={e => setStudentForm({...studentForm, bloodGroup: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="">Select</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Mother Tongue</label><input placeholder="e.g. Hindi, Tamil" value={studentForm.motherTongue} onChange={e => setStudentForm({...studentForm, motherTongue: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Religion</label><input placeholder="e.g. HINDUISM" value={studentForm.religion} onChange={e => setStudentForm({...studentForm, religion: e.target.value.toUpperCase()})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Nationality</label><input value={studentForm.nationality} onChange={e => setStudentForm({...studentForm, nationality: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" /></div>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Info */}
            {admissionWizardStep === 2 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">Institutional Board Enrollment & Scholar Identifiers</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Class Stream</label>
                    <select required value={studentForm.classId} onChange={e => setStudentForm({...studentForm, classId: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="">Select Grade</option>{classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Roll Number (Optional)</label><input placeholder="Auto-generated if empty" value={studentForm.rollNumber} onChange={e => setStudentForm({...studentForm, rollNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Scholar Number Preview</label>
                    <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 p-2.5 text-xs font-bold text-zinc-500 font-mono">SCH-{new Date().getFullYear()}-{studentForm.firstName ? studentForm.firstName.slice(0,3).toUpperCase() : 'SCH'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Parents */}
            {admissionWizardStep === 3 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">Parents & Guardians Contact Registry</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Father's Full Name</label><input required value={studentForm.fatherName} onChange={e => setStudentForm({...studentForm, fatherName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Mother's Full Name</label><input required value={studentForm.motherName} onChange={e => setStudentForm({...studentForm, motherName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Father's Occupation</label><input value={studentForm.fatherOccupation} onChange={e => setStudentForm({...studentForm, fatherOccupation: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Mother's Occupation</label><input value={studentForm.motherOccupation} onChange={e => setStudentForm({...studentForm, motherOccupation: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Annual Household Income (₹)</label><input type="number" placeholder="e.g. 500000" value={studentForm.annualIncome} onChange={e => setStudentForm({...studentForm, annualIncome: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Student Login Email</label><input type="email" required placeholder="student@school.edu.in" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <CountryPhoneInput label="Parent Contact Phone" value={studentForm.parentPhone || ''} onChange={val => setStudentForm({...studentForm, parentPhone: val})} required />
                </div>
              </div>
            )}

            {/* STEP 4: Address */}
            {admissionWizardStep === 4 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">Postal Address & Indian Demographics Verification</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Aadhaar (UIDAI - 12 digits)</label><input maxLength={12} placeholder="e.g. 984028401928" value={studentForm.aadhaarNumber} onChange={e => setStudentForm({...studentForm, aadhaarNumber: e.target.value.replace(/\D/g,'')})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Samagra ID (9 digits SSSMID)</label><input maxLength={9} placeholder="e.g. 120384910" value={studentForm.samagraId} onChange={e => setStudentForm({...studentForm, samagraId: e.target.value.replace(/\D/g,'')})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">PEN (Permanent Education No)</label><input placeholder="e.g. PEN-904291" value={studentForm.penNumber} onChange={e => setStudentForm({...studentForm, penNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Caste Category</label>
                    <select value={studentForm.casteCategory} onChange={e => setStudentForm({...studentForm, casteCategory: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="GENERAL">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option>
                    </select>
                  </div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Pin Code (India)</label><input maxLength={6} placeholder="e.g. 560001" value={studentForm.pinCode} onChange={e => setStudentForm({...studentForm, pinCode: e.target.value.replace(/\D/g,'')})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-bold" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">House / Street Address</label><input placeholder="e.g. Flat 402, Block C" value={studentForm.street} onChange={e => setStudentForm({...studentForm, street: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" /></div>
                  <SearchableSelect label="State" value={studentForm.state || ''} options={INDIAN_STATES_AND_UTS.map((item: any) => item.state)} placeholder="Search/Select State" onChange={val => setStudentForm({...studentForm, state: val, district: '', city: ''})} />
                  <SearchableSelect label="District" value={studentForm.district || ''} options={(() => { const s = INDIAN_STATES_AND_UTS.find((item: any) => item.state === studentForm.state); return s ? Object.keys(s.districts) : []; })()} placeholder="Search/Select District" disabled={!studentForm.state} onChange={val => setStudentForm({...studentForm, district: val, city: ''})} />
                  <SearchableSelect label="City / Town" value={studentForm.city || ''} options={(() => { const s = INDIAN_STATES_AND_UTS.find((item: any) => item.state === studentForm.state); return s && studentForm.district && s.districts[studentForm.district] ? s.districts[studentForm.district] : []; })()} placeholder="Search/Select City" disabled={!studentForm.district} onChange={val => setStudentForm({...studentForm, city: val})} />
                </div>
              </div>
            )}

            {/* STEP 5: Banking */}
            {admissionWizardStep === 5 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">Direct Benefit Transfer (DBT) Scholarship Banking Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Name</label><input placeholder="e.g. State Bank of India" value={studentForm.bankName} onChange={e => setStudentForm({...studentForm, bankName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">IFSC Code (11 chars)</label><input maxLength={11} placeholder="e.g. SBIN0000001" value={studentForm.ifscCode} onChange={e => setStudentForm({...studentForm, ifscCode: e.target.value.toUpperCase()})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Account Number</label><input placeholder="e.g. 302948291039" value={studentForm.accNumber} onChange={e => setStudentForm({...studentForm, accNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Account Holder Name</label><input placeholder="Scholar / Parent Name" value={studentForm.accHolderName} onChange={e => setStudentForm({...studentForm, accHolderName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Branch</label><input placeholder="e.g. Indira Nagar" value={studentForm.bankBranch} onChange={e => setStudentForm({...studentForm, bankBranch: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" /></div>
                </div>
              </div>
            )}

            {/* STEP 6: Documents */}
            {admissionWizardStep === 6 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">Statutory Demographics & Certifications Checklist</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Transfer Certificate (TC) No</label><input placeholder="e.g. TC-2026-0045" value={studentForm.tcNumber} onChange={e => setStudentForm({...studentForm, tcNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Migration Certificate No</label><input placeholder="e.g. MC-3029" value={studentForm.migrationCertNo} onChange={e => setStudentForm({...studentForm, migrationCertNo: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                  <div><label className="block text-[10px] font-bold text-zinc-400 uppercase">Birth Certificate Number</label><input placeholder="e.g. BC-2026-9048" value={studentForm.birthCertificateNumber} onChange={e => setStudentForm({...studentForm, birthCertificateNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" /></div>
                </div>
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-3">Hardcopy Document Verification Checklist</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-350">
                    {['Original School Leaving / Transfer Certificate (TC) submitted','Verified Birth Certificate (Birth proof matching DOB)','Parent Aadhaar (UIDAI card copy verified)','SSSMID / Samagra Family ID verification complete','Direct Benefit Bank Account Passbook Copy verified','Statutory Medical Health / Vaccine card submitted'].map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 transition">
                        <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                  <input type="checkbox" id="send-notification" defaultChecked className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                  <label htmlFor="send-notification" className="text-xs font-bold text-indigo-650 dark:text-indigo-400 cursor-pointer">Send automated Welcome SMS & Login credentials notification to parent/student terminals.</label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" disabled={admissionWizardStep === 1} onClick={() => setAdmissionWizardStep(Math.max(1, admissionWizardStep - 1))}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 disabled:opacity-50 transition">
                Previous Step
              </button>
              {admissionWizardStep < 6 ? (
                <button type="button" onClick={() => setAdmissionWizardStep(Math.min(6, admissionWizardStep + 1))}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition">
                  Next Step
                </button>
              ) : (
                <button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition">
                  Submit Admission Record
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PROMOTIONS TAB
          ════════════════════════════════════════════════════════════════════════ */}
      {studentTab === 'promotions' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-sky-500/10 p-4 border border-sky-400/30 text-xs">
            <h4 className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /><span>Year-End Bulk Academic Promotions</span></h4>
            <p className="mt-1 text-zinc-650 dark:text-zinc-300 leading-relaxed">Select students below and choose a target class. The system will automatically promote classes and increment roll credentials in CBSE standard format.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 border border-zinc-150 rounded-xl p-4 dark:border-zinc-800 max-h-96 overflow-y-auto space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Students</h4>
              {propStudents.map(student => {
                const isChecked = promotionSelectedStudents.includes(student.id);
                return (
                  <div key={student.id} className="flex items-center gap-3 rounded-lg bg-zinc-50/50 p-2.5 text-xs dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                    <input type="checkbox" checked={isChecked}
                      onChange={() => setPromotionSelectedStudents((prev: string[]) => isChecked ? prev.filter((id: string) => id !== student.id) : [...prev, student.id])}
                      className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500 h-4 w-4" />
                    <div className="flex-1 font-medium">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] text-zinc-400">Roll: {student.rollNumber} | {student.class?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-zinc-50/40 p-4 rounded-xl border border-zinc-150 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Promotion Target</h4>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400">Target Grade</label>
                <select value={promotionTargetClassId} onChange={e => setPromotionTargetClassId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                  <option value="">Select Grade</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={handlePromoteStudents}
                className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3.5 text-xs font-bold text-white shadow-md transition">
                Execute Batch Promotion ({promotionSelectedStudents.length} selected)
              </button>
            </div>
          </div>

          {/* Promotion History */}
          <div className="border border-zinc-200/85 rounded-xl p-5 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-3 dark:border-zinc-800">
              <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-350">Year-End Academic Promotion History Ledger</h4>
            </div>
            {promotionsHistory.length === 0 ? (
              <p className="text-xs text-zinc-400 font-medium">No previous promotion cycles logged this academic year.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-650 dark:text-zinc-400">
                  <thead>
                    <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      <th className="py-2.5">Student Name</th><th className="py-2.5">From Class</th><th className="py-2.5">To Class</th>
                      <th className="py-2.5">Academic Year</th><th className="py-2.5">Promoted At</th><th className="py-2.5">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionsHistory.map((h, i) => (
                      <tr key={h.id || i} className="border-b border-zinc-100 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-100/40 dark:hover:bg-zinc-950/40 transition">
                        <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">{h.student ? `${h.student.firstName} ${h.student.lastName}` : h.studentName}</td>
                        <td className="py-3 text-zinc-500">{h.fromClass?.name || h.fromClass}</td>
                        <td className="py-3 font-bold text-sky-600 dark:text-sky-400">{h.toClass?.name || h.toClass}</td>
                        <td className="py-3">{h.academicYear}</td>
                        <td className="py-3 text-zinc-400">{new Date(h.promotedAt).toLocaleString()}</td>
                        <td className="py-3 font-mono text-[10px] text-zinc-500">{h.promotedBy?.email || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Document Preview Modal ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 truncate">{previewDoc.name}</h4>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-0">
              {previewDoc.url.startsWith('data:image') ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full mx-auto rounded-xl" />
              ) : previewDoc.url.startsWith('data:application/pdf') ? (
                <iframe src={previewDoc.url} className="w-full h-[500px] rounded-xl border border-zinc-100 dark:border-zinc-800" title={previewDoc.name} />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-zinc-400">
                  <FileText className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">Preview not available for this file type.</p>
                  <a href={previewDoc.url} download={previewDoc.name} className="mt-3 text-xs font-bold text-sky-600 hover:underline">Download File</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
