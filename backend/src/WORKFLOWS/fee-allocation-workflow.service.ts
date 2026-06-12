import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class FeeAllocationWorkflowService {
  constructor(private prisma: PrismaService) {}

  async allocateFees(studentId: string, institutionId: string): Promise<void> {
    const structures = await this.prisma.feeStructure.findMany({
      where: { institutionId }
    });

    for (const fs of structures) {
      const existing = await this.prisma.studentFeeAllocation.findFirst({
        where: { studentId, feeStructureId: fs.id }
      });

      if (!existing) {
        await this.prisma.studentFeeAllocation.create({
          data: {
            studentId,
            feeStructureId: fs.id,
            amountDue: fs.amount,
            amountPaid: 0,
            status: 'UNPAID'
          }
        });
      }
    }
  }
}
