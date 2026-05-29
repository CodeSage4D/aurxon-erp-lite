'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { deleteStudentApi, getPinCodeDetails } from '@/lib/api';

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

export default function StudentsTab({
  students,
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
  triggerToast
}: StudentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // PIN Code Auto-Lookup
  useEffect(() => {
    if (studentForm.pinCode && studentForm.pinCode.length === 6) {
      const pinDetails = getPinCodeDetails(studentForm.pinCode);
      if (pinDetails) {
        setStudentForm((prev: any) => ({
          ...prev,
          state: pinDetails.state,
          district: pinDetails.district,
          city: pinDetails.district
        }));
        triggerToast(`PIN Code mapped: ${pinDetails.district}, ${pinDetails.state}`);
      }
    }
  }, [studentForm.pinCode, setStudentForm, triggerToast]);

  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const roll = s.rollNumber ? s.rollNumber.toLowerCase() : '';
    const scholar = s.scholarNumber ? s.scholarNumber.toLowerCase() : '';
    return fullName.includes(q) || roll.includes(q) || scholar.includes(q);
  });

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Student & Scholar Registry</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setStudentTab('list')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              studentTab === 'list' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Roster List
          </button>
          <button 
            onClick={() => setStudentTab('admission')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              studentTab === 'admission' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Admission Desk
          </button>
          <button 
            onClick={() => setStudentTab('promotions')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              studentTab === 'promotions' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Promotions
          </button>
        </div>
      </div>

      {/* Roster list */}
      {studentTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 max-w-sm rounded-xl border border-zinc-200 px-3.5 py-2 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950">
            <input 
              type="text" 
              placeholder="Search by name, roll, or scholar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-zinc-800 dark:text-zinc-150"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Scholar No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Aadhaar (Indian UID)</th>
                  <th className="p-3.5">PEN No</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition">
                      <td className="p-3.5">
                        <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                          {student.scholarNumber || `SCH-${student.id.substring(5,9).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-zinc-800 dark:text-zinc-200">{student.firstName} {student.lastName}</td>
                      <td className="p-3.5 text-zinc-500">{student.rollNumber}</td>
                      <td className="p-3.5 text-zinc-600 dark:text-zinc-300">{student.class?.name || 'Unassigned'}</td>
                      <td className="p-3.5 text-zinc-500 font-mono">{student.aadhaarNumber || '12-digit UID Not Linked'}</td>
                      <td className="p-3.5">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {student.penNumber || 'PEN Pending'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button 
                          onClick={async () => {
                            if (confirm('Remove student record? This action is permanent.')) {
                              try {
                                await deleteStudentApi(student.id);
                                triggerToast('Student record deleted successfully.');
                                loadStudents();
                              } catch (err: any) {
                                alert(err.message || 'Failed to delete');
                              }
                            }
                          }} 
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-zinc-400 italic">No scholars matched search filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admission Desk form */}
      {studentTab === 'admission' && (
        <div className="space-y-6">
          {/* Stepper Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-150 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">
                {admissionWizardStep}
              </span>
              <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">
                Admission Step {admissionWizardStep} of 6
              </h4>
            </div>
            {/* Tiny dots indicator */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAdmissionWizardStep(s)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    admissionWizardStep === s
                      ? 'w-6 bg-sky-600'
                      : admissionWizardStep > s
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-zinc-200 dark:bg-zinc-800'
                  }`}
                  title={`Go to Step ${s}`}
                />
              ))}
            </div>
          </div>

          {/* Wizard Step Labels */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { num: 1, label: '1. Basic Info' },
              { num: 2, label: '2. Academics' },
              { num: 3, label: '3. Parents' },
              { num: 4, label: '4. Address' },
              { num: 5, label: '5. Banking' },
              { num: 6, label: '6. Documents' },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => setAdmissionWizardStep(step.num)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                  admissionWizardStep === step.num
                    ? 'bg-sky-600 text-white shadow-sm'
                    : admissionWizardStep > step.num
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-zinc-100 hover:bg-zinc-150 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateStudent} className="space-y-6">
            {/* STEP 1: Basic Info */}
            {admissionWizardStep === 1 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  Scholar Profile & Personal Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">First Name</label>
                    <input required value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Last Name</label>
                    <input required value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Date of Birth</label>
                    <input type="date" required value={studentForm.dateOfBirth} onChange={e => setStudentForm({...studentForm, dateOfBirth: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Gender</label>
                    <select value={studentForm.gender} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Blood Group</label>
                    <select value={studentForm.bloodGroup} onChange={e => setStudentForm({...studentForm, bloodGroup: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Mother Tongue</label>
                    <input placeholder="e.g. Hindi, Tamil, Telugu" value={studentForm.motherTongue} onChange={e => setStudentForm({...studentForm, motherTongue: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Religion</label>
                    <input placeholder="e.g. HINDUISM, ISLAM, SIKHISM" value={studentForm.religion} onChange={e => setStudentForm({...studentForm, religion: e.target.value.toUpperCase()})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Nationality</label>
                    <input value={studentForm.nationality} onChange={e => setStudentForm({...studentForm, nationality: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Info */}
            {admissionWizardStep === 2 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  Institutional Board Enrollment & Scholar Identifiers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Class Stream</label>
                    <select required value={studentForm.classId} onChange={e => setStudentForm({...studentForm, classId: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="">Select Grade</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Board Affiliation</label>
                    <select value={studentForm.familyId} onChange={e => setStudentForm({...studentForm, familyId: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-bold">
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="ICSE">ICSE / ISC Board</option>
                      <option value="STATE">State Secondary Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Roll Number (Optional)</label>
                    <input placeholder="Auto-generated if empty" value={studentForm.rollNumber} onChange={e => setStudentForm({...studentForm, rollNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Scholar Number Preview</label>
                    <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 p-2.5 text-xs font-bold text-zinc-500 font-mono">
                      SCH-{new Date().getFullYear()}-{studentForm.firstName ? studentForm.firstName.slice(0, 3).toUpperCase() : 'SCH'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Parent & Family Info */}
            {admissionWizardStep === 3 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  Parents & Guardians Contact Registry
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Father's Full Name</label>
                    <input required value={studentForm.fatherName} onChange={e => setStudentForm({...studentForm, fatherName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Mother's Full Name</label>
                    <input required value={studentForm.motherName} onChange={e => setStudentForm({...studentForm, motherName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Father's Occupation</label>
                    <input value={studentForm.fatherOccupation} onChange={e => setStudentForm({...studentForm, fatherOccupation: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Mother's Occupation</label>
                    <input value={studentForm.motherOccupation} onChange={e => setStudentForm({...studentForm, motherOccupation: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Annual Household Income (₹)</label>
                    <input type="number" placeholder="e.g. 500000" value={studentForm.annualIncome} onChange={e => setStudentForm({...studentForm, annualIncome: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Parent Contact Email</label>
                    <input type="email" placeholder="guardian@gmail.com" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Contact & Address */}
            {admissionWizardStep === 4 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  Postal Address & Indian Demographics Verification
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Aadhaar (UIDAI - 12 digits)</label>
                    <input maxLength={12} placeholder="e.g. 984028401928" value={studentForm.aadhaarNumber} onChange={e => setStudentForm({...studentForm, aadhaarNumber: e.target.value.replace(/\D/g, '')})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Samagra ID (9 digits SSSMID)</label>
                    <input maxLength={9} placeholder="e.g. 120384910" value={studentForm.samagraId} onChange={e => setStudentForm({...studentForm, samagraId: e.target.value.replace(/\D/g, '')})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">PEN (Permanent Education No)</label>
                    <input placeholder="e.g. PEN-904291" value={studentForm.penNumber} onChange={e => setStudentForm({...studentForm, penNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Caste Category</label>
                    <select value={studentForm.casteCategory} onChange={e => setStudentForm({...studentForm, casteCategory: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200">
                      <option value="GENERAL">General</option>
                      <option value="OBC">OBC (Other Backward Classes)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Pin Code (India)</label>
                    <input maxLength={6} placeholder="e.g. 560001" value={studentForm.pinCode} onChange={e => setStudentForm({...studentForm, pinCode: e.target.value.replace(/\D/g, '')})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">House / Street Address</label>
                    <input placeholder="e.g. Flat 402, Block C" value={studentForm.street} onChange={e => setStudentForm({...studentForm, street: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">District / City</label>
                    <input readOnly value={studentForm.district || ''} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900/60 text-zinc-500 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">State</label>
                    <input readOnly value={studentForm.state || ''} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900/60 text-zinc-500 font-semibold" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: DBT Banking Details */}
            {admissionWizardStep === 5 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  Direct Benefit Transfer (DBT) Scholarship Banking Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Name</label>
                    <input placeholder="e.g. State Bank of India" value={studentForm.bankName} onChange={e => setStudentForm({...studentForm, bankName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">IFSC Code (11 alphanumeric)</label>
                    <input maxLength={11} placeholder="e.g. SBIN0000001" value={studentForm.ifscCode} onChange={e => setStudentForm({...studentForm, ifscCode: e.target.value.toUpperCase()})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Account Number</label>
                    <input placeholder="e.g. 302948291039" value={studentForm.accNumber} onChange={e => setStudentForm({...studentForm, accNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Account Holder Name</label>
                    <input placeholder="Scholar / Parent Name" value={studentForm.accHolderName} onChange={e => setStudentForm({...studentForm, accHolderName: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Bank Branch</label>
                    <input placeholder="e.g. Indira Nagar Main Branch" value={studentForm.bankBranch} onChange={e => setStudentForm({...studentForm, bankBranch: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Document Checklist & Verification */}
            {admissionWizardStep === 6 && (
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4 animate-fade-in">
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  Statutory Demographics & Certifications Checklist
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Transfer Certificate (TC) No</label>
                    <input placeholder="e.g. TC-2026-0045" value={studentForm.tcNumber} onChange={e => setStudentForm({...studentForm, tcNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Migration Certificate No</label>
                    <input placeholder="e.g. MC-3029" value={studentForm.migrationCertNo} onChange={e => setStudentForm({...studentForm, migrationCertNo: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">Birth Certificate Number</label>
                    <input placeholder="e.g. BC-2026-9048" value={studentForm.birthCertificateNumber} onChange={e => setStudentForm({...studentForm, birthCertificateNumber: e.target.value})} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-3">Hardcopy/Scan Document Verification Checklists</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-350">
                    {[
                      'Original School Leaving / Transfer Certificate (TC) submitted',
                      'Verified Birth Certificate (Birth proof matching DOB)',
                      'Parent Aadhaar (UIDAI card copy verified)',
                      'SSSMID / Samagra Family ID verification complete',
                      'Direct Benefit Bank Account Passbook Copy verified',
                      'Statutory Medical Health / Vaccine card submitted'
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 transition">
                        <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                  <input type="checkbox" id="send-notification" defaultChecked className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                  <label htmlFor="send-notification" className="text-xs font-bold text-indigo-650 dark:text-indigo-400 cursor-pointer">
                    Send automated Welcome SMS & Login credentials notification to parent/student terminals.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                disabled={admissionWizardStep === 1}
                onClick={() => setAdmissionWizardStep(prev => Math.max(1, prev - 1))}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 disabled:opacity-50 transition"
              >
                Previous Step
              </button>

              {admissionWizardStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setAdmissionWizardStep(prev => Math.min(6, prev + 1))}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition"
                >
                  Submit Admission Record
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Promotions desk */}
      {studentTab === 'promotions' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-sky-500/10 p-4 border border-sky-400/30 text-xs">
            <h4 className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Year-End Bulk Academic Promotions</span>
            </h4>
            <p className="mt-1 text-zinc-650 dark:text-zinc-300 leading-relaxed">
              Select students below and choose a target class. The system will automatically promote classes and increment roll credentials in CBSE standard format.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Selector list */}
            <div className="md:col-span-2 border border-zinc-150 rounded-xl p-4 dark:border-zinc-800 max-h-96 overflow-y-auto space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Students</h4>
              {students.map((student) => {
                const isChecked = promotionSelectedStudents.includes(student.id);
                return (
                  <div key={student.id} className="flex items-center gap-3 rounded-lg bg-zinc-50/50 p-2.5 text-xs dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setPromotionSelectedStudents((prev: string[]) =>
                          isChecked ? prev.filter((id: string) => id !== student.id) : [...prev, student.id]
                        );
                      }}
                      className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                    />
                    <div className="flex-1 font-medium">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] text-zinc-400">Roll No: {student.rollNumber} | Class: {student.class?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Target Grade */}
            <div className="bg-zinc-50/40 p-4 rounded-xl border border-zinc-150 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Promotion Target</h4>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400">Target Grade</label>
                <select
                  value={promotionTargetClassId}
                  onChange={e => setPromotionTargetClassId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
                >
                  <option value="">Select Grade</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <button
                onClick={handlePromoteStudents}
                className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3.5 text-xs font-bold text-white shadow-md transition"
              >
                Execute Batch Promotion ({promotionSelectedStudents.length} selected)
              </button>
            </div>
          </div>

          {/* Year-End Academic Promotion History Ledger */}
          <div className="border border-zinc-200/85 rounded-xl p-5 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-3 dark:border-zinc-800">
              <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-350">
                Year-End Academic Promotion History Ledger
              </h4>
            </div>
            {promotionsHistory.length === 0 ? (
              <p className="text-xs text-zinc-400 font-medium">No previous promotion cycles logged in this academic year.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-650 dark:text-zinc-400">
                  <thead>
                    <tr className="border-b border-zinc-150 dark:border-zinc-800 pb-2 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      <th className="py-2.5">Student Name</th>
                      <th className="py-2.5">From Class</th>
                      <th className="py-2.5">To Class</th>
                      <th className="py-2.5">Academic Year</th>
                      <th className="py-2.5">Promoted At</th>
                      <th className="py-2.5">Promoted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionsHistory.map((h, i) => (
                      <tr key={h.id || i} className="border-b border-zinc-100 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-100/40 dark:hover:bg-zinc-950/40 transition">
                        <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">
                          {h.student ? `${h.student.firstName} ${h.student.lastName}` : h.studentName}
                        </td>
                        <td className="py-3 font-medium text-zinc-500">{h.fromClass?.name || h.fromClass}</td>
                        <td className="py-3 font-bold text-sky-600 dark:text-sky-400">{h.toClass?.name || h.toClass}</td>
                        <td className="py-3 font-medium">{h.academicYear}</td>
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
    </div>
  );
}
