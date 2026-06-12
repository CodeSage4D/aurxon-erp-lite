import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class SetupWorkflowService {
  constructor(private prisma: PrismaService) {}

  async handleReset(institutionId: string): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const status = await tx.organizationSetupStatus.upsert({
        where: { institutionId },
        update: {
          setupStarted: true,
          setupCompleted: false,
          currentStep: 1,
        },
        create: {
          institutionId,
          setupStarted: true,
          setupCompleted: false,
          currentStep: 1,
        },
      });

      await tx.organizationLifecycle.update({
        where: { institutionId },
        data: {
          setupStatus: 'PENDING',
          businessState: 'Setup Pending',
        }
      });

      return status;
    });
  }

  async completeSetup(institutionId: string): Promise<void> {
    await this.prisma.organizationLifecycle.update({
      where: { institutionId },
      data: {
        setupStatus: 'COMPLETED',
        workspaceStatus: 'ACTIVE',
        businessState: 'Go Live',
      }
    });
  }
}
