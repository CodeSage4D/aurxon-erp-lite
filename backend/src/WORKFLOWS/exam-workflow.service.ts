import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class ExamWorkflowService {
  constructor(private prisma: PrismaService) {}

  async recordExamResult(
    examId: string,
    studentId: string,
    marksObtained: number,
    remarks?: string
  ): Promise<any> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      throw new BadRequestException('Exam not found.');
    }

    if (marksObtained > exam.maxMarks) {
      throw new BadRequestException(`Marks obtained cannot exceed max marks of ${exam.maxMarks}`);
    }

    return this.prisma.examResult.upsert({
      where: {
        examId_studentId: {
          examId,
          studentId
        }
      },
      update: {
        marksObtained,
        remarks
      },
      create: {
        examId,
        studentId,
        marksObtained,
        remarks
      }
    });
  }
}
