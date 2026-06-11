import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async getClasses(institutionId: string) {
    return this.prisma.class.findMany({
      where: { institutionId },
      include: {
        classTeacher: { select: { id: true, firstName: true, lastName: true } },
        sections: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSections(classId: string) {
    return this.prisma.section.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
    });
  }

  async createSection(classId: string, name: string) {
    return this.prisma.section.create({
      data: {
        classId,
        name: name.trim().toUpperCase(),
      },
    });
  }

  async getSubjects(institutionId: string, classId?: string) {
    const where: any = {
      class: { institutionId },
    };
    if (classId) {
      where.classId = classId;
    }

    return this.prisma.subject.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
