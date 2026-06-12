import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Injectable()
export class CorporateService {
  constructor(private prisma: PrismaService) {}

  async createDivision(institutionId: string, name: string) {
    return this.prisma.corporateDivision.create({
      data: {
        name,
        institutionId
      }
    });
  }

  async assignEmployee(
    employeeId: string,
    employeeName: string,
    teamId: string,
    role: string,
    notes?: string
  ) {
    return this.prisma.workAssignment.create({
      data: {
        employeeId,
        employeeName,
        teamId,
        role,
        notes,
        status: 'ACTIVE'
      }
    });
  }
}
