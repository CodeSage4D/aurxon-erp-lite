import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  async getNotices(institutionId: string, role: string) {
    const notices = await this.prisma.notice.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });

    return notices.filter((notice) => {
      const roles = notice.targetRoles.split(',');
      return roles.includes(role) || roles.includes('ALL') || role === 'SUPER_ADMIN' || role === 'INSTITUTE_ADMIN';
    });
  }

  async createNotice(institutionId: string, authorName: string, data: any) {
    const targetRoles = Array.isArray(data.targetRoles)
      ? data.targetRoles.join(',')
      : data.targetRoles || 'ALL';

    return this.prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        targetRoles,
        institutionId,
        authorName,
      },
    });
  }
}
