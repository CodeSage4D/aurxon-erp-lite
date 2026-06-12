// IEEE 42010 compliant audit trail reader endpoint
// Provides secure, paginated access to operational audit logs for administrators

import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../Authentication/jwt-auth.guard';
import { Roles, RolesGuard } from '../Authentication/roles.guard';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    const institutionId = req.user.institutionId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {
      user: { institutionId },
    };
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take),
      },
    };
  }

  @Get('security')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async findSecurityEvents(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const institutionId = req.user.institutionId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      // Scope to institution users only
      const institutionUsers = await this.prisma.user.findMany({
        where: { institutionId },
        select: { id: true, email: true },
      });
      const emails = institutionUsers.map(u => u.email);
      const userIds = institutionUsers.map(u => u.id);
      where.OR = [
        { userId: { in: userIds } },
        { email: { in: emails } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.securityEventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.securityEventLog.count({ where }),
    ]);

    return {
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take),
      },
    };
  }
}
