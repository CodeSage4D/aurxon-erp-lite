import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  // Helper to add minutes to time string "HH:MM"
  private addMinutes(timeStr: string, mins: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMins = h * 60 + m + mins;
    const newH = Math.floor(totalMins / 60) % 24;
    const newM = totalMins % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  async getTimetable(institutionId: string, classId: string) {
    // Verify class exists
    const classRecord = await this.prisma.class.findFirst({
      where: { id: classId, institutionId }
    });
    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    return this.prisma.timetableEntry.findMany({
      where: { classId, institutionId },
      include: {
        subject: {
          select: { id: true, name: true, code: true, teacherId: true }
        },
        teacher: {
          select: { id: true, firstName: true, lastName: true, employeeId: true }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodNumber: 'asc' }
      ]
    });
  }

  async generateTimetable(
    institutionId: string,
    classId: string,
    periodsPerDay: number,
    durationMin: number,
    startTime: string
  ) {
    // Verify class exists
    const classRecord = await this.prisma.class.findFirst({
      where: { id: classId, institutionId }
    });
    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    // Fetch subjects of this class
    const subjects = await this.prisma.subject.findMany({
      where: { classId }
    });

    if (subjects.length === 0) {
      throw new BadRequestException('This class has no subjects registered. Please add subjects first.');
    }

    // Fetch all teachers in the institution
    const teachers = await this.prisma.staff.findMany({
      where: { institutionId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        subjectsExpertise: true,
        designation: true,
      }
    });

    // Fetch existing bookings for other classes
    const otherEntries = await this.prisma.timetableEntry.findMany({
      where: {
        institutionId,
        classId: { not: classId }
      },
      select: {
        teacherId: true,
        dayOfWeek: true,
        periodNumber: true,
      }
    });

    // Map busy teachers: busyMap[dayOfWeek][periodNumber] = Set of teacherIds
    const busyMap: { [day: string]: { [period: number]: Set<string> } } = {};
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    days.forEach(day => {
      busyMap[day] = {};
      for (let p = 1; p <= periodsPerDay; p++) {
        busyMap[day][p] = new Set<string>();
      }
    });

    otherEntries.forEach(entry => {
      if (busyMap[entry.dayOfWeek] && busyMap[entry.dayOfWeek][entry.periodNumber]) {
        busyMap[entry.dayOfWeek][entry.periodNumber].add(entry.teacherId);
      }
    });

    const generatedEntries: any[] = [];

    // Check expertise match helper
    const isExpert = (teacher: any, subjectName: string) => {
      if (!teacher.subjectsExpertise) return false;
      return teacher.subjectsExpertise.some(exp => 
        exp.toLowerCase().includes(subjectName.toLowerCase()) || 
        subjectName.toLowerCase().includes(exp.toLowerCase())
      );
    };

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];

      for (let p = 1; p <= periodsPerDay; p++) {
        const pStartTime = this.addMinutes(startTime, (p - 1) * durationMin);
        const pEndTime = this.addMinutes(pStartTime, durationMin);

        // Round-robin selection of class subjects
        const subjectIndex = (dayIndex * periodsPerDay + (p - 1)) % subjects.length;
        let selectedSubject: any = subjects[subjectIndex];
        let assignedTeacherId = selectedSubject.teacherId;
        let assignedTeacher = teachers.find(t => t.id === assignedTeacherId);

        // Check if teacher is busy
        const isBusy = assignedTeacherId ? busyMap[day][p].has(assignedTeacherId) : true;

        if (isBusy || !assignedTeacherId) {
          // Conflict or subject has no teacher assigned. Search for backup teacher with subject expertise who is free.
          let backupTeacher = teachers.find(t => 
            t.id !== assignedTeacherId && 
            !busyMap[day][p].has(t.id) && 
            isExpert(t, selectedSubject.name)
          );

          if (backupTeacher) {
            assignedTeacherId = backupTeacher.id;
            assignedTeacher = backupTeacher;
          } else {
            // No expert teacher free, map to "Self Study" and find any free teacher in the school
            let selfStudySubject = subjects.find(s => s.name.toLowerCase() === 'self study');
            if (!selfStudySubject) {
              // Create a temporary Subject object to represent Self Study in preview
              selfStudySubject = {
                id: 'SELF-STUDY-TEMP',
                name: 'Self Study',
                code: 'SELF-STUDY',
                classId,
                teacherId: null,
                createdAt: new Date(),
                updatedAt: new Date()
              } as any;
            }
            selectedSubject = selfStudySubject;

            // Find ANY free teacher
            const freeTeacher = teachers.find(t => !busyMap[day][p].has(t.id));
            if (freeTeacher) {
              assignedTeacherId = freeTeacher.id;
              assignedTeacher = freeTeacher;
            } else {
              // If literally zero teachers are free in the whole school, throw error or fallback to class teacher
              const classTeacher = teachers.find(t => t.id === classRecord.classTeacherId);
              if (classTeacher) {
                assignedTeacherId = classTeacher.id;
                assignedTeacher = classTeacher;
              } else {
                throw new BadRequestException(
                  `No free teachers available for Period ${p} on ${day} to resolve conflict.`
                );
              }
            }
          }
        }

        // Add this teacher to busy map for current day & period so we don't double book within this generation
        if (assignedTeacherId) {
          busyMap[day][p].add(assignedTeacherId);
        }

        generatedEntries.push({
          dayOfWeek: day,
          periodNumber: p,
          startTime: pStartTime,
          endTime: pEndTime,
          subjectId: selectedSubject.id,
          subject: {
            id: selectedSubject.id,
            name: selectedSubject.name,
            code: selectedSubject.code,
          },
          teacherId: assignedTeacherId,
          teacher: {
            id: assignedTeacher?.id || '',
            firstName: assignedTeacher?.firstName || '',
            lastName: assignedTeacher?.lastName || '',
          }
        });
      }
    }

    return generatedEntries;
  }

  async saveTimetable(institutionId: string, classId: string, entries: any[]) {
    // Verify class exists
    const classRecord = await this.prisma.class.findFirst({
      where: { id: classId, institutionId }
    });
    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    // 1. Internal Payload duplicates validation
    const classSet = new Set<string>();
    const teacherSet = new Set<string>();

    for (const entry of entries) {
      if (!entry.dayOfWeek || !entry.periodNumber) continue;
      const periodNum = parseInt(entry.periodNumber);
      const classKey = `${entry.dayOfWeek}-${periodNum}`;
      if (classSet.has(classKey)) {
        throw new BadRequestException(
          `Payload Conflict: Multiple periods assigned to this class on ${entry.dayOfWeek} Period ${periodNum}`
        );
      }
      classSet.add(classKey);

      if (entry.teacherId) {
        const teacherKey = `${entry.teacherId}-${entry.dayOfWeek}-${periodNum}`;
        if (teacherSet.has(teacherKey)) {
          throw new BadRequestException(
            `Payload Conflict: The same teacher is allocated to multiple slots in this class on ${entry.dayOfWeek} Period ${periodNum}`
          );
        }
        teacherSet.add(teacherKey);
      }
    }

    // 2. Double-booking check: Ensure none of the teachers are booked for another class at the same day & period
    for (const entry of entries) {
      if (!entry.teacherId || !entry.dayOfWeek || !entry.periodNumber) continue;
      const conflict = await this.prisma.timetableEntry.findFirst({
        where: {
          institutionId,
          classId: { not: classId },
          dayOfWeek: entry.dayOfWeek,
          periodNumber: parseInt(entry.periodNumber),
          teacherId: entry.teacherId
        },
        include: {
          class: true,
          teacher: true
        }
      });

      if (conflict) {
        throw new BadRequestException(
          `Conflict: Teacher ${conflict.teacher.firstName} ${conflict.teacher.lastName} is already assigned to ${conflict.class.name} on ${entry.dayOfWeek} Period ${entry.periodNumber}`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete existing entries for this class
      await tx.timetableEntry.deleteMany({
        where: { classId, institutionId }
      });

      const created: any[] = [];
      for (const entry of entries) {
        // Resolve subjectId in case it was a temporary Self Study subject
        let finalSubjectId = entry.subjectId;
        if (entry.subjectId === 'SELF-STUDY-TEMP' || entry.subject?.code === 'SELF-STUDY') {
          // Find or create permanent Self Study subject for this class
          let selfStudy = await tx.subject.findFirst({
            where: { classId, name: 'Self Study' }
          });
          if (!selfStudy) {
            selfStudy = await tx.subject.create({
              data: {
                name: 'Self Study',
                code: 'SELF-STUDY',
                classId,
              }
            });
          }
          finalSubjectId = selfStudy.id;
        }

        const item = await tx.timetableEntry.create({
          data: {
            classId,
            subjectId: finalSubjectId,
            teacherId: entry.teacherId,
            dayOfWeek: entry.dayOfWeek,
            periodNumber: parseInt(entry.periodNumber),
            startTime: entry.startTime,
            endTime: entry.endTime,
            institutionId,
          },
          include: {
            subject: {
              select: { id: true, name: true, code: true }
            },
            teacher: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        });
        created.push(item);
      }

      return created;
    });
  }
}
