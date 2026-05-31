import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../01_Core/prisma/prisma.service';

@Injectable()
export class PlannerService {
  constructor(private prisma: PrismaService) {}

  async getActivities(userId: string) {
    return this.prisma.plannerActivity.findMany({
      where: { userId },
      orderBy: [
        { activityDate: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createActivity(userId: string, data: any) {
    return this.prisma.plannerActivity.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        activityDate: new Date(data.activityDate),
        startTime: data.startTime,
        endTime: data.endTime,
        category: data.category || 'ACTIVITY',
      },
    });
  }

  async updateActivity(userId: string, id: string, data: any) {
    const activity = await this.prisma.plannerActivity.findFirst({
      where: { id, userId },
    });
    if (!activity) {
      throw new NotFoundException('Planner activity not found');
    }

    return this.prisma.plannerActivity.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : activity.title,
        description: data.description !== undefined ? data.description : activity.description,
        activityDate: data.activityDate !== undefined ? new Date(data.activityDate) : activity.activityDate,
        startTime: data.startTime !== undefined ? data.startTime : activity.startTime,
        endTime: data.endTime !== undefined ? data.endTime : activity.endTime,
        category: data.category !== undefined ? data.category : activity.category,
      },
    });
  }

  async deleteActivity(userId: string, id: string) {
    const activity = await this.prisma.plannerActivity.findFirst({
      where: { id, userId },
    });
    if (!activity) {
      throw new NotFoundException('Planner activity not found');
    }

    return this.prisma.plannerActivity.delete({
      where: { id },
    });
  }
}
