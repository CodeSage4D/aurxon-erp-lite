// Subject service — maps subjects to classes and teachers
// Enforces unique subject codes per class and institution scoping

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../SHARED/Prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(institutionId: string, classId?: string) {
    return this.prisma.subject.findMany({
      where: {
        class: { institutionId },
        ...(classId ? { classId } : {}),
      },
      include: {
        class: { select: { name: true, board: true, stream: true } },
        teacher: { select: { id: true, firstName: true, lastName: true, designation: true } },
      },
      orderBy: [{ class: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findOne(institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, class: { institutionId } },
      include: {
        class: { select: { name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async create(institutionId: string, data: { name: string; code: string; classId: string; teacherId?: string }) {
    // Verify class belongs to institution
    const cls = await this.prisma.class.findFirst({ where: { id: data.classId, institutionId } });
    if (!cls) throw new NotFoundException('Class not found');

    // Check code uniqueness within class
    const existing = await this.prisma.subject.findFirst({
      where: { code: data.code, classId: data.classId },
    });
    if (existing) throw new ConflictException(`Subject code "${data.code}" already exists in this class`);

    return this.prisma.subject.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        classId: data.classId,
        teacherId: data.teacherId || null,
      },
    });
  }

  async update(institutionId: string, id: string, data: Partial<{ name: string; code: string; teacherId: string | null }>) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, class: { institutionId } },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.teacherId !== undefined && { teacherId: data.teacherId }),
      },
    });
  }

  async remove(institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, class: { institutionId } },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    await this.prisma.subject.delete({ where: { id } });
    return { success: true };
  }
}
