import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class ActivationWorkflowService {
  constructor(private prisma: PrismaService) {}

  async processActivation(registrationId: string): Promise<void> {
    const reg = await this.prisma.organizationRegistration.findUnique({
      where: { id: registrationId }
    });

    if (!reg) {
      throw new BadRequestException('Registration record not found.');
    }

    if (reg.status !== 'PROVISIONED') {
      throw new BadRequestException('Workspace must be provisioned before activation.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.organizationRegistration.update({
        where: { id: registrationId },
        data: { status: 'ACTIVATED' }
      });

      if (reg.institutionId) {
        await tx.organizationLifecycle.update({
          where: { institutionId: reg.institutionId },
          data: {
            activationStatus: 'ACTIVATED',
            setupStatus: 'PENDING',
            businessState: 'Activated'
          }
        });
      }
    });
  }
}
