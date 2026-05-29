'use client';

import React, { useState } from 'react';
import { Users, Briefcase, CalendarCheck, Percent, Clock, Sparkles, ChevronRight } from 'lucide-react';

interface OverviewTabProps {
  stats: any;
  students: any[];
  staff: any[];
  classes: any[];
  rfidLogs: string[];
  notices: any[];
  triggerToast: (msg: string) => void;
  setActiveCategory: (cat: string) => void;
  setStudentTab: (tab: 'list' | 'admission' | 'promotions') => void;
  setAdmissionWizardStep: (step: number) => void;
  setLibrarySubTab: (tab: 'inventory' | 'checkout' | 'issues') => void;
  setFeesTab: (tab: 'allocations' | 'history' | 'structures' | 'ledger') => void;
  setExamsTab: (tab: 'list' | 'entry') => void;
  setAcademicTab: (tab: 'timetable' | 'lessons') => void;
  setAttendanceDate: (date: string) => void;
  setSelectedClass: (classId: string) => void;
  loadAttendanceRoster: (classId: string) => void;
  setFeeForm: (form: any) => void;
  setPromotionTargetClassId: (classId: string) => void;
  setPromotionSelectedStudents: (students: string[]) => void;
  setStudentForm: (form: any) => void;
}

export default function OverviewTab({
  stats,
  students,
  staff,
  classes,
  rfidLogs,
  notices,
  triggerToast,
  setActiveCategory,
  setStudentTab,
  setAdmissionWizardStep,
  setLibrarySubTab,
  setFeesTab,
  setExamsTab,
  setAcademicTab,
  setAttendanceDate,
  setSelectedClass,
  loadAttendanceRoster,
  setFeeForm,
  setPromotionTargetClassId,
  setPromotionSelectedStudents,
  setStudentForm
}: OverviewTabProps) {
  const [activeRunbook, setActiveRunbook] = useState<'admission' | 'attendance' | 'fees' | 'promotion'>('admission');
  const [activeRunbookStep, setActiveRunbookStep] = useState(0);

  const runbooksData = {
    admission: {
      title: 'Student Admission Runbook',
      subtitle: 'Statutory Indian Scholar Enrollment Flow (CBSE / ICSE Compliant)',
      steps: [
        {
          name: 'Add Basic Info',
          desc: 'Collect scholar first name, last name, date of birth, and verify email credentials.',
          dest: 'students',
          tab: 'admission'
        },
        {
          name: 'Add Academic Info',
          desc: 'Select academic grade/class and board credentials (CBSE/ICSE/State Board).',
          dest: 'students',
          tab: 'admission'
        },
        {
          name: 'Add Parent Info',
          desc: 'Input father/mother details, occupations, emergency phones, and annual income.',
          dest: 'students',
          tab: 'admission'
        },
        {
          name: 'Add Address & Bank Info',
          desc: 'Enter residential address, districts, PIN codes, Aadhaar, Samagra ID, and bank details for Direct Benefit Transfers (DBT).',
          dest: 'students',
          tab: 'admission'
        },
        {
          name: 'Upload Documents',
          desc: 'Scan and upload transfer certificates, proof of birth, and identity cards.',
          dest: 'students',
          tab: 'admission'
        },
        {
          name: 'Welcome Notification',
          desc: 'Trigger welcome notices to student and parent email terminals.',
          dest: 'comms',
          tab: 'circulars'
        },
        {
          name: 'Assign Class & Roll No',
          desc: 'Assign final CBSE section stream and unique roll number cards.',
          dest: 'students',
          tab: 'list'
        },
        {
          name: 'Create Login Credentials',
          desc: 'Generate individual logins automatically with secure defaults (password123).',
          dest: 'settings',
          tab: 'general'
        },
        {
          name: 'Generate Scholar Number',
          desc: 'Validate and push unique permanent scholar index numbers (e.g. SCH-2026-X).',
          dest: 'students',
          tab: 'list'
        }
      ]
    },
    attendance: {
      title: 'Daily Attendance Runbook',
      subtitle: 'Statutory School Roll-Call & Biometric Synced Roster',
      steps: [
        {
          name: 'Teacher Login',
          desc: 'Authenticated teacher logs into the ERP with active teacher scope.',
          dest: 'overview',
          tab: 'live'
        },
        {
          name: 'Select Class & Subject',
          desc: 'Choose target class roster and active subject period.',
          dest: 'attendance',
          tab: 'roster'
        },
        {
          name: 'Mark Attendance Status',
          desc: 'Select student records and set statuses (Present, Absent, Late).',
          dest: 'attendance',
          tab: 'roster'
        },
        {
          name: 'Submit Attendance',
          desc: 'Finalize and submit the attendance register to locking tables.',
          dest: 'attendance',
          tab: 'roster'
        },
        {
          name: 'Real-Time Database Sync',
          desc: 'Automatically commit daily logs to Neon PostgreSQL server.',
          dest: 'overview',
          tab: 'live'
        },
        {
          name: 'Compile Daily Reports',
          desc: 'ERP calculations run to update institutional health statistics.',
          dest: 'analytics',
          tab: 'reports'
        },
        {
          name: 'Notification to Parents',
          desc: 'ERP triggers SMS/Notice alerts to parents for absent students.',
          dest: 'comms',
          tab: 'whatsapp'
        },
        {
          name: 'Dashboard Analytics Update',
          desc: 'Active charts and graphs populate average metrics in the Principal view.',
          dest: 'analytics',
          tab: 'reports'
        }
      ]
    },
    fees: {
      title: 'Fee Collection Runbook',
      subtitle: 'Statutory CBSE Ledger & Invoice Settlement Cycle',
      steps: [
        {
          name: 'Create Fee Structure',
          desc: 'Define institutional fee components (tuition, transport, library, laboratory).',
          dest: 'fees',
          tab: 'structures'
        },
        {
          name: 'Assign Fee Allocations',
          desc: 'Apply created structures to classes or individual scholars.',
          dest: 'fees',
          tab: 'allocations'
        },
        {
          name: 'Generate Invoices',
          desc: 'Compute due balances and generate permanent payment vouchers.',
          dest: 'fees',
          tab: 'allocations'
        },
        {
          name: 'Record Payments (Online/Offline)',
          desc: 'Collect dues via cash, card, netbanking, or UPI gateways.',
          dest: 'fees',
          tab: 'allocations'
        },
        {
          name: 'Record S3 Transaction Logs',
          desc: 'Log encrypted audit trails for payments in compliance database tables.',
          dest: 'fees',
          tab: 'ledger'
        },
        {
          name: 'Generate Statutory Receipts',
          desc: 'Print or export thermal P&L invoices containing official transaction IDs.',
          dest: 'fees',
          tab: 'allocations'
        },
        {
          name: 'Real-time Dues Update',
          desc: 'Dues status dynamically updates from UNPAID to PARTIAL or PAID.',
          dest: 'fees',
          tab: 'allocations'
        },
        {
          name: 'Update Financial Reports',
          desc: 'Ledger registers collections into global institutional profits & losses sheets.',
          dest: 'analytics',
          tab: 'reports'
        }
      ]
    },
    promotion: {
      title: 'Year-End Promotion Runbook',
      subtitle: 'CBSE Academic Year Transition & Student Rollover',
      steps: [
        {
          name: 'Select Current Academic Year',
          desc: 'Verify previous student grades, sections, and subjects.',
          dest: 'students',
          tab: 'promotions'
        },
        {
          name: 'Select Eligible Students',
          desc: 'Check the names of students advancing to the next standard grade.',
          dest: 'students',
          tab: 'promotions'
        },
        {
          name: 'System Eligibility Check',
          desc: 'ERP checks that selected students have zero pending fees and passed all exams.',
          dest: 'students',
          tab: 'promotions'
        },
        {
          name: 'Promote Student Roster',
          desc: 'Advance student records to their new class grade in the database.',
          dest: 'students',
          tab: 'promotions'
        },
        {
          name: 'Reset Roll Numbers',
          desc: 'Sort student lists alphabetically and generate new CBSE roll numbers.',
          dest: 'students',
          tab: 'promotions'
        },
        {
          name: 'Archive Preceding Year Data',
          desc: 'Safely backup past student report cards and attendance records to archives.',
          dest: 'students',
          tab: 'list'
        },
        {
          name: 'Generate New Academic Structure',
          desc: 'Setup classes, sections, timetables, and teachers for the new session.',
          dest: 'academic',
          tab: 'timetable'
        },
        {
          name: 'Notify Parents & Students',
          desc: 'Publish circular announcements regarding standard promotions.',
          dest: 'comms',
          tab: 'circulars'
        },
        {
          name: 'Update System Dashboards',
          desc: 'Recalculate average scholar statistics and class sizes.',
          dest: 'overview',
          tab: 'live'
        }
      ]
    }
  };

  const currentRunbook = runbooksData[activeRunbook];
  const steps = currentRunbook.steps;
  const activeStep = steps[activeRunbookStep];

  return (
    <div className="space-y-6">
      
      {/* Header metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 hover-lift">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <h3 className="mt-2 text-2xl font-black text-zinc-800 dark:text-zinc-100">{students.length}</h3>
          <p className="mt-1 text-[10px] font-medium text-emerald-500">+2 new admissions today</p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 hover-lift">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Staff Roster</span>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="mt-2 text-2xl font-black text-zinc-800 dark:text-zinc-100">{staff.length}</h3>
          <p className="mt-1 text-[10px] font-medium text-zinc-400">3 designation tiers</p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 hover-lift">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
            <CalendarCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <h3 className="mt-2 text-2xl font-black text-zinc-800 dark:text-zinc-100">{stats?.attendanceRate || 95.8}%</h3>
          <p className="mt-1 text-[10px] font-medium text-emerald-500">Live RFID syncing active</p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 hover-lift">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Fee Collections</span>
            <Percent className="h-4 w-4 text-sky-500" />
          </div>
          <h3 className="mt-2 text-2xl font-black text-zinc-800 dark:text-zinc-100">{stats?.feeOverview?.collectionRate || 85}%</h3>
          <p className="mt-1 text-[10px] font-medium text-sky-600 dark:text-sky-400">₹{stats?.feeOverview?.totalPaid || 0} collected</p>
        </div>
      </div>

      {/* Main content grid: RFID scan log + notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RFID Biometric scans stream */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-450">Biometric / RFID Scan Logger (Simulated)</h4>
            </div>
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400">Live feed</span>
          </div>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
            {rfidLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl bg-zinc-50/60 p-3 text-xs dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 animate-slide-in">
                <Clock className="mt-0.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <p className="text-zinc-650 dark:text-zinc-300 font-medium leading-relaxed">{log}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Circular alert board */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-450 border-b border-zinc-100 pb-3 dark:border-zinc-800">Circular Announcements</h4>
          <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
            {notices.map((notice) => (
              <div key={notice.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-950/25">
                <h5 className="font-bold text-xs dark:text-white">{notice.title}</h5>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{notice.content}</p>
                <div className="mt-3 flex justify-between items-center text-[10px] text-zinc-450 font-medium border-t border-zinc-100/50 pt-2 dark:border-zinc-800/50">
                  <span>By: {notice.authorName}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INTERACTIVE OPERATIONAL RUNBOOKS PANEL */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">CBSE & State Board Core Operations Runbooks</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
            Step-by-step interactive flows mapped to our system architecture. Follow these standard runbooks to execute school operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Flow selector tabs */}
          <div className="space-y-2">
            {[
              { id: 'admission', label: 'A. Student Admission', desc: '9 steps CBSE scholar onboarding' },
              { id: 'attendance', label: 'B. Daily Attendance', desc: '8 steps biometric/roster roll-call' },
              { id: 'fees', label: 'C. Fee Collection Cycle', desc: '8 steps statutory invoice-to-receipt' },
              { id: 'promotion', label: 'D. Year-End Promotion', desc: '9 steps rollover & promotions' }
            ].map(runbook => (
              <button
                key={runbook.id}
                onClick={() => {
                  setActiveRunbook(runbook.id as any);
                  setActiveRunbookStep(0);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  activeRunbook === runbook.id
                    ? 'border-sky-600/30 bg-sky-50/40 text-sky-700 dark:border-sky-500/20 dark:bg-sky-950/20 dark:text-sky-400'
                    : 'border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/20'
                }`}
              >
                <div className="text-xs font-black">{runbook.label}</div>
                <div className="text-[10px] text-zinc-400 font-medium mt-0.5">{runbook.desc}</div>
              </button>
            ))}
          </div>

          {/* Right Column: Step Wizard */}
          <div className="lg:col-span-3 bg-zinc-50/30 dark:bg-zinc-950/10 border border-zinc-100 dark:border-zinc-800/40 rounded-2xl p-5 space-y-6">
            <div className="space-y-5">
              {/* Runbook Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 pb-3 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                    <span>{currentRunbook.title}</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{currentRunbook.subtitle}</p>
                </div>
                
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400">
                    Step {activeRunbookStep + 1} of {steps.length}
                  </span>
                  <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-600 transition-all duration-300"
                      style={{ width: `${((activeRunbookStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Wizard Step List */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-zinc-100/60 dark:border-zinc-800/40">
                {steps.map((step, idx) => {
                  const isDone = idx < activeRunbookStep;
                  const isActive = idx === activeRunbookStep;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveRunbookStep(idx)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-sm'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-zinc-100 hover:bg-zinc-150 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {idx + 1}. {step.name}
                    </button>
                  );
                })}
              </div>

              {/* Active Step Detail card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 p-4 rounded-xl">
                <div className="md:col-span-2 space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 tracking-wider">
                    Active Step {activeRunbookStep + 1} Guidance
                  </span>
                  <h5 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100">{activeStep.name}</h5>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
                    {activeStep.desc}
                  </p>
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <button
                    onClick={() => {
                      setActiveCategory(activeStep.dest);
                      if (activeStep.dest === 'students') {
                        setStudentTab(activeStep.tab as any);
                        if (activeStep.tab === 'admission') {
                          if (activeRunbookStep === 0) setAdmissionWizardStep(1);
                          else if (activeRunbookStep === 1) setAdmissionWizardStep(2);
                          else if (activeRunbookStep === 2) setAdmissionWizardStep(3);
                          else if (activeRunbookStep === 3) setAdmissionWizardStep(4);
                          else if (activeRunbookStep === 4) setAdmissionWizardStep(6);
                          else if (activeRunbookStep === 5) setAdmissionWizardStep(6);
                        }
                      } else if (activeStep.dest === 'library') {
                        setLibrarySubTab(activeStep.tab as any);
                      } else if (activeStep.dest === 'fees') {
                        setFeesTab(activeStep.tab as any);
                      } else if (activeStep.dest === 'exams') {
                        setExamsTab(activeStep.tab as any);
                      } else if (activeStep.dest === 'academic') {
                        setAcademicTab(activeStep.tab as any);
                      }
                      triggerToast(`Navigated to ${activeStep.name} action target.`);
                    }}
                    className="flex justify-center items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 text-xs transition"
                  >
                    <span>Go to Desk Form</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => {
                      if (activeRunbook === 'admission') {
                        setStudentForm({
                          firstName: 'Aditya',
                          lastName: 'Sharma',
                          email: 'aditya.sharma@example.com',
                          rollNumber: 'ROLL-10A-15',
                          classId: 'class-1',
                          dateOfBirth: '2011-04-12',
                          gender: 'MALE',
                          aadhaarNumber: '984028401928',
                          samagraId: '120384910',
                          familyId: '90284910',
                          penNumber: 'PEN-904291',
                          birthCertificateNumber: 'BC-2026-9048',
                          bloodGroup: 'B+',
                          religion: 'HINDUISM',
                          casteCategory: 'OBC',
                          nationality: 'Indian',
                          motherTongue: 'Hindi',
                          fatherName: 'Rajesh Sharma',
                          motherName: 'Sunita Sharma',
                          fatherOccupation: 'Government Employee',
                          motherOccupation: 'Homemaker',
                          annualIncome: '450000',
                          houseNo: 'Flat 402, Block C',
                          street: 'MG Road, Indira Nagar',
                          city: 'Bengaluru',
                          district: 'Bengaluru Urban',
                          state: 'Karnataka',
                          pinCode: '560001',
                          bankName: 'State Bank of India',
                          accHolderName: 'Aditya Sharma',
                          accNumber: '302948291039',
                          ifscCode: 'SBIN0000001',
                          bankBranch: 'Indira Nagar Main Branch',
                          prevSchoolName: 'St. Mary School',
                          tcNumber: 'TC-2026-0045',
                          migrationCertNo: 'MC-3029'
                        });
                        if (activeRunbookStep === 0) setAdmissionWizardStep(1);
                        else if (activeRunbookStep === 1) setAdmissionWizardStep(2);
                        else if (activeRunbookStep === 2) setAdmissionWizardStep(3);
                        else if (activeRunbookStep === 3) setAdmissionWizardStep(4);
                        else if (activeRunbookStep === 4) setAdmissionWizardStep(6);
                        else if (activeRunbookStep === 5) setAdmissionWizardStep(6);
                        triggerToast('CBSE Admissions Form auto-populated with demo scholar data!');
                      } else if (activeRunbook === 'attendance') {
                        setAttendanceDate(new Date().toISOString().substring(0, 10));
                        setSelectedClass('class-1');
                        loadAttendanceRoster('class-1');
                        triggerToast('Roster loaded for Grade 10-A Daily Attendance register!');
                      } else if (activeRunbook === 'fees') {
                        setFeesTab('structures');
                        setFeeForm({
                          name: 'CBSE Term 2 Tuition Fee',
                          amount: '1800',
                          dueDate: '2026-10-15'
                        });
                        triggerToast('Fee Structure Form prefilled with CBSE Term 2 values!');
                      } else if (activeRunbook === 'promotion') {
                        setSelectedClass('class-1');
                        setPromotionTargetClassId('class-2');
                        setPromotionSelectedStudents(['stud-1', 'stud-2']);
                        triggerToast('Eligible Grade 10-A students selected for Grade 11 promotion rollover!');
                      }
                    }}
                    className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition text-center underline"
                  >
                    Populate demo data for this flow
                  </button>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={activeRunbookStep === 0}
                  onClick={() => setActiveRunbookStep(prev => Math.max(0, prev - 1))}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  Previous Step
                </button>
                <button
                  disabled={activeRunbookStep === steps.length - 1}
                  onClick={() => setActiveRunbookStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
