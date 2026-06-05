import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    userId: string,
    action: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          details: details || '',
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
  }
}
