// IEEE Standard 12207 compliant project life-cycle mapping for academics
// Manages syllabus progress percentages, lesson plans, and teacher logs

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async getPlans(institutionId: string, teacherId?: string, subjectId?: string) {
    const where: any = {
      subject: { class: { institutionId } },
    };

    if (teacherId) {
      where.teacherId = teacherId;
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }

    return this.prisma.lessonPlan.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true, class: { select: { id: true, name: true } } } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPlan(institutionId: string, teacherUserId: string, data: any) {
    const teacher = await this.prisma.staff.findFirst({
      where: { userId: teacherUserId, institutionId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found for this institution');
    }

    return this.prisma.lessonPlan.create({
      data: {
        title: data.title,
        content: data.content,
        status: 'PENDING',
        syllabusPercent: parseInt(data.syllabusPercent || '0'),
        subjectId: data.subjectId,
        teacherId: teacher.id,
      },
    });
  }

  async updatePlan(institutionId: string, id: string, data: any) {
    const plan = await this.prisma.lessonPlan.findFirst({
      where: {
        id,
        subject: { class: { institutionId } },
      },
    });

    if (!plan) {
      throw new NotFoundException('Lesson plan not found');
    }

    return this.prisma.lessonPlan.update({
      where: { id },
      data: {
        status: data.status,
        syllabusPercent: data.syllabusPercent !== undefined ? parseInt(data.syllabusPercent) : undefined,
      },
    });
  }

  async deletePlan(institutionId: string, id: string) {
    const plan = await this.prisma.lessonPlan.findFirst({
      where: {
        id,
        subject: { class: { institutionId } },
      },
    });

    if (!plan) {
      throw new NotFoundException('Lesson plan not found');
    }

    return this.prisma.lessonPlan.delete({
      where: { id },
    });
  }
}
