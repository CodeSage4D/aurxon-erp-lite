'use client';

import React, { useState } from 'react';
import { Printer, FileText } from 'lucide-react';

interface CertificatesTabProps {
  students: any[];
  staff: any[];
  triggerToast: (msg: string) => void;
}

export default function CertificatesTab({
  students,
  staff,
  triggerToast
}: CertificatesTabProps) {
  const [certType, setCertType] = useState<'STUDY' | 'CHARACTER' | 'TC'>('STUDY');
  const [certTargetType, setCertTargetType] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [certTargetId, setCertTargetId] = useState<string>('');
  const [generatedCert, setGeneratedCert] = useState<any>(null);

  const handleCompile = () => {
    if (!certTargetId) {
      alert('Please select a target person first!');
      return;
    }
    const person = certTargetType === 'STUDENT' 
      ? students.find(s => s.id === certTargetId) 
      : staff.find(s => s.id === certTargetId);
    
    setGeneratedCert({
      id: `CERT-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      person,
    });
    triggerToast('Certificate compiled successfully!');
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Official Certificate & Document Generator</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
            Instantly generate CBSE compliant Bonafide, Study, Character, or Transfer Certificates for printing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Parameters */}
        <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-4 h-fit">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Configure Document</h4>
          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Document Type</label>
              <select 
                value={certType} 
                onChange={e => { setCertType(e.target.value as any); setGeneratedCert(null); }} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
              >
                <option value="STUDY">Study & Bonafide Certificate</option>
                <option value="CHARACTER">Character Certificate</option>
                <option value="TC">Transfer Certificate (TC)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Target Directory</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-650 dark:text-zinc-300">
                  <input 
                    type="radio" 
                    checked={certTargetType === 'STUDENT'} 
                    onChange={() => { setCertTargetType('STUDENT'); setCertTargetId(''); setGeneratedCert(null); }} 
                    className="accent-sky-600 h-4 w-4" 
                  />
                  <span>Student desk</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-650 dark:text-zinc-300">
                  <input 
                    type="radio" 
                    checked={certTargetType === 'STAFF'} 
                    onChange={() => { setCertTargetType('STAFF'); setCertTargetId(''); setGeneratedCert(null); }} 
                    className="accent-sky-600 h-4 w-4" 
                  />
                  <span>Employee desk</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Select Target Person</label>
              <select 
                value={certTargetId} 
                onChange={e => { setCertTargetId(e.target.value); setGeneratedCert(null); }} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 font-bold"
              >
                <option value="">Select Person</option>
                {certTargetType === 'STUDENT' ? (
                  students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.rollNumber})</option>)
                ) : (
                  staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.designation})</option>)
                )}
              </select>
            </div>

            <button 
              onClick={handleCompile}
              className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition mt-2"
            >
              Compile Document
            </button>
          </div>
        </div>

        {/* Print Preview panel */}
        <div className="lg:col-span-2 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-6 bg-zinc-50/20 dark:bg-zinc-950/10 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3 dark:border-zinc-800 mb-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">CBSE Format Document Print Preview</h4>
            {generatedCert && (
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold shadow-md transition"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Document</span>
              </button>
            )}
          </div>

          {generatedCert ? (
            <div id="section-to-print" className="bg-white text-zinc-950 border border-zinc-300 shadow-xl p-8 rounded-xl font-serif max-w-xl mx-auto space-y-6 text-xs text-justify relative leading-relaxed dark:bg-white dark:text-zinc-950">
              {/* Decorative border */}
              <div className="absolute inset-2 border-2 border-double border-zinc-300 pointer-events-none" />
              
              <div className="text-center border-b border-zinc-200 pb-4">
                <h2 className="text-sm font-extrabold tracking-wider text-sky-900 font-sans uppercase">AURXON INTERNATIONAL ACADEMY</h2>
                <p className="text-[9px] text-zinc-400 font-sans mt-0.5">CBSE Affiliation No. 1039420 | Scholar Row, India</p>
              </div>

              <div className="flex justify-between font-sans text-[10px] text-zinc-500">
                <span>Ref No: {generatedCert.id}</span>
                <span>Date: {generatedCert.date}</span>
              </div>

              <div className="text-center my-6">
                <h3 className="text-xs font-extrabold uppercase underline tracking-widest text-zinc-800 font-sans">
                  {certType === 'STUDY' && "Study & Bonafide Certificate"}
                  {certType === 'CHARACTER' && "Character Certificate"}
                  {certType === 'TC' && "School Transfer Certificate"}
                </h3>
              </div>

              <div className="space-y-4">
                {certType === 'STUDY' && (
                  <p>
                    This is to certify that <strong>{generatedCert.person.firstName} {generatedCert.person.lastName}</strong> {certTargetType === 'STUDENT' ? `son/daughter of Mr. ${generatedCert.person.parent?.firstName || 'Guardian'} ${generatedCert.person.parent?.lastName || ''}` : ''} is a bonafide {certTargetType === 'STUDENT' ? `student` : `employee`} of this institution, enrolled in {certTargetType === 'STUDENT' ? `class ${generatedCert.person.class?.name || 'Grade 10-A'} (Roll No. ${generatedCert.person.rollNumber})` : `capacity as ${generatedCert.person.designation} (ID: ${generatedCert.person.employeeId})`}. According to institutional records, his/her date of birth is <strong>{new Date(generatedCert.person.dateOfBirth || generatedCert.person.joiningDate).toLocaleDateString()}</strong>.
                  </p>
                )}
                {certType === 'CHARACTER' && (
                  <p>
                    This is to certify that <strong>{generatedCert.person.firstName} {generatedCert.person.lastName}</strong> has been associated with this institution as a {certTargetType === 'STUDENT' ? `student` : `staff member`}. During his/her tenure, his/her conduct and moral character have been found to be <strong>EXCELLENT</strong>. He/she is diligent, honest, and has actively participated in school academic and co-curricular programs. We wish him/her all success in his/her future endeavors.
                  </p>
                )}
                {certType === 'TC' && (
                  <p>
                    This is to certify that <strong>{generatedCert.person.firstName} {generatedCert.person.lastName}</strong> was admitted to this school on {new Date(generatedCert.person.admissionDate || generatedCert.person.joiningDate).toLocaleDateString()} and left the school on {new Date().toLocaleDateString()}. He/she has paid all dues to the school up to date. His/her character was satisfactory during the period of study. Reason for leaving: Course completion / Promotion.
                  </p>
                )}
                <p>This certificate is issued at the request of the candidate for official evaluation and verification purposes.</p>
              </div>

              <div className="flex justify-between items-end pt-12 text-[10px] font-sans text-zinc-500">
                <div className="text-center">
                  <div className="h-8 w-20 border-b border-zinc-200 mx-auto" />
                  <p className="mt-1">Verified By</p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-20 border-b border-zinc-200 mx-auto flex items-end justify-center font-mono italic text-sky-850 text-[10px] font-bold">Principal Office</div>
                  <p className="mt-1 font-bold text-zinc-800">Authorized Signature</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col justify-center items-center text-xs text-zinc-400 font-medium gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/10">
              <FileText className="h-8 w-8 text-zinc-350 animate-pulse" />
              <span>Select target person and compile to preview certificate document.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
