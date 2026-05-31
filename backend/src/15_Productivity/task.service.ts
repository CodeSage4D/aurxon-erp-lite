import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../01_Core/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks(userId: string) {
    return this.prisma.assignedTask.findMany({
      where: {
        OR: [
          { assignerId: userId },
          { assigneeId: userId },
        ],
      },
      include: {
        assigner: {
          select: {
            id: true,
            email: true,
            role: true,
            staffProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
            staffProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(assignerId: string, data: any) {
    const assigneeUser = await this.prisma.user.findUnique({
      where: { id: data.assigneeId },
    });
    if (!assigneeUser) {
      throw new NotFoundException('Assignee user not found');
    }

    return this.prisma.assignedTask.create({
      data: {
        title: data.title,
        description: data.description || null,
        assignerId,
        assigneeId: data.assigneeId,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        assignee: {
          select: { email: true },
        },
      },
    });
  }

  async updateTaskStatus(userId: string, id: string, data: { status: string; feedback?: string }) {
    const task = await this.prisma.assignedTask.findFirst({
      where: {
        id,
        OR: [
          { assigneeId: userId },
          { assignerId: userId },
        ],
      },
    });

    if (!task) {
      throw new NotFoundException('Assigned task not found');
    }

    const isAssignee = task.assigneeId === userId;
    const isAssigner = task.assignerId === userId;

    const updateData: any = {
      feedback: data.feedback !== undefined ? data.feedback : task.feedback,
    };

    if (isAssignee) {
      // Assignee status changes
      if (!['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].includes(data.status)) {
        throw new BadRequestException('Invalid status update for assignee');
      }
      updateData.status = data.status;
      if (data.status === 'ACCEPTED') {
        updateData.acceptedAt = new Date();
      } else if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    } else if (isAssigner) {
      // Assigner can change priority, dueDate, or escalate / override status
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
    }

    return this.prisma.assignedTask.update({
      where: { id },
      data: updateData,
      include: {
        assigner: { select: { email: true } },
        assignee: { select: { email: true } },
      },
    });
  }

  async escalateTask(userId: string, id: string) {
    const task = await this.prisma.assignedTask.findFirst({
      where: { id, assignerId: userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found or unauthorized');
    }

    return this.prisma.assignedTask.update({
      where: { id },
      data: { status: 'ESCALATED' },
    });
  }
}
