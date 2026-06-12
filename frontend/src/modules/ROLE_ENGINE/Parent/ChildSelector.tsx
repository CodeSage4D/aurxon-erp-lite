'use client';

import React from 'react';
import { Users, GraduationCap, ChevronRight } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  scholarNumber: string;
  rollNumber: string;
  class: { name: string };
}

interface ChildSelectorProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
}

export default function ChildSelector({ students, selectedStudentId, onSelectStudent }: ChildSelectorProps) {
  if (students.length === 0) {
    return (
      <div className="glass rounded-3xl p-6 border border-border text-center text-muted-foreground font-semibold">
        No linked children profiles found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Select Child Context
      </label>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
        {students.map((student) => {
          const isSelected = student.id === selectedStudentId;
          return (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className={`w-full text-left glass rounded-2xl p-4 border flex items-center justify-between transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                  : 'border-border hover:border-primary/25'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                  isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    Class: {student.class?.name} • Scholar: {student.scholarNumber}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'translate-x-0.5 text-primary' : 'text-muted-foreground'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
