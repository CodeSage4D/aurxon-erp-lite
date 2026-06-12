// IEEE 12207 compliant AcademicYear service
// AcademicYear is the foundational entity for all school operations.
// Only ONE academic year may be ACTIVE per institution at a time.

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../SHARED/Prisma/prisma.service';

@Injectable()
export class AcademicYearService {
  constructor(private prisma: PrismaService) {}

  async findAll(institutionId: string) {
    return this.prisma.academicYear.findMany({
      where: { institutionId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findActive(institutionId: string) {
    return this.prisma.academicYear.findFirst({
      where: { institutionId, isActive: true },
    });
  }

  async findOne(institutionId: string, id: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    return year;
  }

  async create(institutionId: string, data: {
    name: string;
    startDate: string;
    endDate: string;
  }) {
    if (!data.name || !data.startDate || !data.endDate) {
      throw new BadRequestException('name, startDate, and endDate are required');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    // Check for name conflict within institution
    const existing = await this.prisma.academicYear.findFirst({
      where: { institutionId, name: data.name },
    });
    if (existing) throw new ConflictException(`Academic year "${data.name}" already exists`);

    return this.prisma.academicYear.create({
      data: {
        institutionId,
        name: data.name,
        startDate: start,
        endDate: end,
        status: 'PLANNED',
        isActive: false,
      },
    });
  }

  async activate(institutionId: string, id: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!year) throw new NotFoundException('Academic year not found');

    return this.prisma.$transaction(async (tx) => {
      // Deactivate all others
      await tx.academicYear.updateMany({
        where: { institutionId, isActive: true },
        data: { isActive: false, status: 'CLOSED' },
      });

      // Activate the chosen one
      return tx.academicYear.update({
        where: { id },
        data: { isActive: true, status: 'ACTIVE' },
      });
    });
  }

  async close(institutionId: string, id: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    if (!year.isActive) throw new BadRequestException('Only the active academic year can be closed');

    return this.prisma.academicYear.update({
      where: { id },
      data: { isActive: false, status: 'CLOSED' },
    });
  }

  async update(institutionId: string, id: string, data: Partial<{ name: string; startDate: string; endDate: string }>) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    if (year.isActive) throw new BadRequestException('Cannot edit an active academic year. Close it first.');

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });
  }

  async remove(institutionId: string, id: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    if (year.isActive) throw new BadRequestException('Cannot delete an active academic year');

    await this.prisma.academicYear.delete({ where: { id } });
    return { success: true, message: 'Academic year removed' };
  }
}
