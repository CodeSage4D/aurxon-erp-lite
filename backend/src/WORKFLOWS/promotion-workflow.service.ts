import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class PromotionWorkflowService {
  constructor(private prisma: PrismaService) {}

  async promoteStudent(
    studentId: string,
    targetClassId: string,
    targetSectionId: string,
    academicYearId: string
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // Archive current active enrollment
      const activeEnrollment = await tx.enrollment.findFirst({
        where: { studentId, status: 'ACTIVE' }
      });

      if (activeEnrollment) {
        await tx.enrollment.update({
          where: { id: activeEnrollment.id },
          data: { status: 'PROMOTED' }
        });
      }

      // Create new enrollment
      return tx.enrollment.create({
        data: {
          studentId,
          classId: targetClassId,
          sectionId: targetSectionId,
          academicYearId,
          status: 'ACTIVE'
        }
      });
    });
  }
}
