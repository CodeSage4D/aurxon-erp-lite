import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../01_Core/prisma/prisma.service';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  async getDiaryEntries(userId: string) {
    return this.prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSharedDiaryEntries(institutionId: string, currentUserId: string) {
    // Return shared diary entries from the same institution (teachers/staff)
    return this.prisma.diaryEntry.findMany({
      where: {
        isShared: true,
        user: { institutionId },
        userId: { not: currentUserId },
      },
      include: {
        user: {
          select: {
            email: true,
            staffProfile: {
              select: {
                firstName: true,
                lastName: true,
                designation: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDiaryEntry(userId: string, data: any) {
    return this.prisma.diaryEntry.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        category: data.category || 'PERSONAL',
        isShared: data.isShared || false,
      },
    });
  }

  async updateDiaryEntry(userId: string, id: string, data: any) {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: { id, userId },
    });
    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    return this.prisma.diaryEntry.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : entry.title,
        content: data.content !== undefined ? data.content : entry.content,
        category: data.category !== undefined ? data.category : entry.category,
        isShared: data.isShared !== undefined ? data.isShared : entry.isShared,
      },
    });
  }

  async deleteDiaryEntry(userId: string, id: string) {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: { id, userId },
    });
    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    return this.prisma.diaryEntry.delete({
      where: { id },
    });
  }
}
