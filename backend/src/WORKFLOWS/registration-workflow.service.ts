import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class RegistrationWorkflowService {
  constructor(private prisma: PrismaService) {}

  // Validates Organization Lifecycle State transitions
  validateStateTransition(currentState: string, nextState: string): void {
    const validTransitions: Record<string, string[]> = {
      REGISTERED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
      CHANGES_REQUESTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      APPROVED: ['LICENSED', 'PROVISIONED', 'ACTIVATED'],
      LICENSED: ['ACTIVATED', 'SUSPENDED'],
      PROVISIONED: ['ACTIVATED', 'SUSPENDED'],
      ACTIVATED: ['SETUP_PENDING', 'LIVE', 'SUSPENDED'],
      SETUP_PENDING: ['LIVE', 'SUSPENDED'],
      LIVE: ['SUSPENDED', 'EXPIRED'],
      SUSPENDED: ['LIVE', 'EXPIRED'],
      EXPIRED: ['LIVE', 'SUSPENDED']
    };

    const allowed = validTransitions[currentState] || [];
    if (!allowed.includes(nextState)) {
      throw new BadRequestException(
        `Invalid organization lifecycle transition from ${currentState} to ${nextState}`
      );
    }
  }

  async transitionState(institutionId: string, nextState: string): Promise<any> {
    const lifecycle = await this.prisma.organizationLifecycle.findUnique({
      where: { institutionId }
    });

    if (!lifecycle) {
      throw new BadRequestException('Organization lifecycle record not found.');
    }

    this.validateStateTransition(lifecycle.businessState.toUpperCase(), nextState.toUpperCase());

    return this.prisma.organizationLifecycle.update({
      where: { institutionId },
      data: {
        businessState: nextState
      }
    });
  }
}
