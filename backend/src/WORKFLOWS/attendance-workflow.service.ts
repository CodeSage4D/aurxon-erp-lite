import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class AttendanceWorkflowService {
  constructor(private prisma: PrismaService) {}

  async recordAttendance(
    studentId: string,
    date: Date,
    status: string,
    recordedById: string,
    remarks?: string
  ): Promise<any> {
    const cleanDate = new Date(date);
    cleanDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: cleanDate
        }
      },
      update: {
        status,
        remarks,
        recordedById
      },
      create: {
        studentId,
        date: cleanDate,
        status,
        remarks,
        recordedById
      }
    });
  }
}
