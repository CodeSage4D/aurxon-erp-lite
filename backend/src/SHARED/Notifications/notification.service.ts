import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { NotificationCategory } from '@prisma/client';

const CATEGORY_PRIORITY: Record<NotificationCategory, number> = {
  SECURITY: 10,
  AUDIT: 9,
  LICENSE: 8,
  APPROVAL: 7,
  REGISTRATION: 6,
  BILLING: 5,
  SUPPORT: 4,
  DEPLOYMENT: 3,
  SYSTEM: 2,
};

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const list = await this.prisma.notification.findMany({
      where: { userId },
    });

    // Priority-based sorting:
    // 1. Unread first (isRead: false)
    // 2. Higher priority categories first
    // 3. Newest first
    return list.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      const prioA = CATEGORY_PRIORITY[a.category] || 0;
      const prioB = CATEGORY_PRIORITY[b.category] || 0;
      if (prioA !== prioB) {
        return prioB - prioA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notif || notif.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Create system-wide notifications for specific user roles.
   */
  async createSystemNotif(targetRole: string, title: string, content: string, category: NotificationCategory) {
    let users: any[] = [];
    if (targetRole === 'SUPER_ADMIN') {
      users = await this.prisma.user.findMany({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });
    } else {
      users = await this.prisma.user.findMany({
        where: { role: targetRole, isActive: true },
      });
    }

    if (users.length === 0) return [];

    const data = users.map((u) => ({
      userId: u.id,
      title,
      content,
      category,
      isRead: false,
    }));

    return this.prisma.notification.createMany({ data });
  }
}
