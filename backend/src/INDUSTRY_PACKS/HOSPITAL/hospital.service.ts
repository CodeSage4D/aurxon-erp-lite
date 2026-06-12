import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  async createDepartment(institutionId: string, name: string) {
    return this.prisma.hospitalDepartment.create({
      data: {
        name,
        institutionId
      }
    });
  }

  async admitPatient(
    patientName: string,
    departmentId: string,
    wardId?: string,
    bedId?: string,
    notes?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (bedId) {
        // Verify bed availability
        const bed = await tx.bed.findUnique({ where: { id: bedId } });
        if (!bed || bed.status !== 'AVAILABLE') {
          throw new BadRequestException('Requested bed is not available');
        }
        // Update bed status to OCCUPIED
        await tx.bed.update({
          where: { id: bedId },
          data: { status: 'OCCUPIED' }
        });
      }

      return tx.patientEpisode.create({
        data: {
          patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName,
          status: 'ADMITTED',
          departmentId,
          wardId,
          bedId,
          notes
        }
      });
    });
  }
}
