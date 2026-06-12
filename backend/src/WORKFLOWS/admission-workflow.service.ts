import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../SHARED/Prisma/prisma.service';

@Injectable()
export class AdmissionWorkflowService {
  constructor(private prisma: PrismaService) {}

  validateAdmissionState(currentState: string, nextState: string): void {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SUBMITTED'],
      SUBMITTED: ['VERIFIED', 'REJECTED'],
      VERIFIED: ['APPROVED', 'REJECTED'],
      APPROVED: ['ENROLLED'],
      ENROLLED: []
    };

    const allowed = validTransitions[currentState] || [];
    if (!allowed.includes(nextState)) {
      throw new BadRequestException(
        `Invalid admission pipeline transition from ${currentState} to ${nextState}`
      );
    }
  }

  async transitionAdmission(studentId: string, nextState: string): Promise<any> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new BadRequestException('Student profile not found.');
    }

    // Assuming we check the student status or admission application status
    const currentStatus = student.status || 'DRAFT';
    this.validateAdmissionState(currentStatus.toUpperCase(), nextState.toUpperCase());

    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        status: nextState
      }
    });
  }
}
