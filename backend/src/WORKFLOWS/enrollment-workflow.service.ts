import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class EnrollmentWorkflowService {
  constructor(private prisma: PrismaService) {}

  async enrollStudent(
    studentId: string,
    classId: string,
    sectionId: string,
    academicYearId: string
  ): Promise<any> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new BadRequestException('Student not found.');
    }

    return this.prisma.enrollment.create({
      data: {
        studentId,
        classId,
        sectionId,
        academicYearId,
        status: 'ACTIVE'
      }
    });
  }
}
