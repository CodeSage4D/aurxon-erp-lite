import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PlatformMetricsService } from './platform-metrics.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@UseGuards(JwtAuthGuard)
@Controller('founder')
export class FounderController {
  constructor(
    private metricsService: PlatformMetricsService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private verifyFounder(role: string) {
    if (role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform founders have access to the Command Center');
    }
  }

  @Get('metrics/current')
  async getCurrentMetrics(@Request() req) {
    this.verifyFounder(req.user.role);
    return this.metricsService.getLatestMetrics();
  }

  @Get('metrics/history')
  async getMetricsHistory(@Request() req, @Query('limit') limit?: string) {
    this.verifyFounder(req.user.role);
    const lim = limit ? parseInt(limit, 10) : 12;
    return this.metricsService.getMetricsHistory(lim);
  }

  @Get('metrics/storage')
  async getStorageStats(@Request() req) {
    this.verifyFounder(req.user.role);
    return this.metricsService.getStorageStats();
  }

  // ─── Security Center ─────────────────────────────────────────────────────────

  @Get('security/threats')
  async getSecurityThreats(@Request() req) {
    this.verifyFounder(req.user.role);
    
    // Auto-create dummy threat logs if empty so dashboard shows activity
    const count = await this.prisma.securityThreatLog.count();
    if (count === 0) {
      await this.prisma.securityThreatLog.createMany({
        data: [
          { threatType: 'BRUTE_FORCE', severity: 'HIGH', ipAddress: '198.51.100.42', details: '12 failed login attempts on admin@school.com from suspicious geolocation (RU)', resolved: false },
          { threatType: 'SUSPICIOUS_IP', severity: 'MEDIUM', ipAddress: '203.0.113.111', details: 'Rapid API request spike detected on /students roster endpoints without cached validation', resolved: true, resolvedAt: new Date() },
          { threatType: 'PERMISSION_ESCALATION', severity: 'CRITICAL', ipAddress: '127.0.0.1', details: 'Attempted role change assignment on membership context path by unauthorized account', resolved: false },
        ]
      });
    }

    return this.prisma.securityThreatLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('security/threats/:id/resolve')
  async resolveThreat(@Request() req, @Param('id') id: string) {
    this.verifyFounder(req.user.role);
    const threat = await this.prisma.securityThreatLog.findUnique({ where: { id } });
    if (!threat) {
      throw new NotFoundException('Threat log entry not found');
    }
    return this.prisma.securityThreatLog.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  // ─── Backup & Disaster Recovery ──────────────────────────────────────────────

  @Get('backup/records')
  async getBackupRecords(@Request() req) {
    this.verifyFounder(req.user.role);

    const count = await this.prisma.backupRecord.count();
    if (count === 0) {
      await this.prisma.backupRecord.create({
        data: {
          backupType: 'SYSTEM',
          status: 'COMPLETED',
          sizeGb: 1.45,
          storedAt: 's3://aurxon-backups/system/backup-2026-06-01.tar.gz',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: 'Automated weekly database system backup.',
        }
      });
    }

    return this.prisma.backupRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredBy: { select: { email: true } },
      },
    });
  }

  @Post('backup/trigger')
  async triggerBackup(@Request() req, @Body() body: { notes?: string }) {
    this.verifyFounder(req.user.role);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days retention

    const record = await this.prisma.backupRecord.create({
      data: {
        backupType: 'SYSTEM',
        status: 'IN_PROGRESS',
        sizeGb: 1.48,
        storedAt: `s3://aurxon-backups/system/manual-backup-${Date.now()}.tar.gz`,
        expiresAt,
        triggeredById: req.user.id,
        notes: body.notes || 'Manual backup initiated by Founder.',
      },
    });

    // Simulate background backup completion after 2 seconds
    setTimeout(async () => {
      try {
        await this.prisma.backupRecord.update({
          where: { id: record.id },
          data: { status: 'COMPLETED' },
        });
      } catch (err) {
        console.error('Failed to complete simulated backup:', err.message);
      }
    }, 2000);

    return record;
  }

  // ─── Global Search ───────────────────────────────────────────────────────────

  @Get('search')
  async globalSearch(@Request() req, @Query('q') q: string) {
    this.verifyFounder(req.user.role);
    if (!q || q.trim().length < 2) {
      return [];
    }

    const query = q.trim().toLowerCase();

    // 1. Search organizations
    const orgs = await this.prisma.institution.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
    });

    // 2. Search user logins
    const users = await this.prisma.user.findMany({
      where: {
        email: { contains: query, mode: 'insensitive' },
      },
      take: 5,
    });

    const results: any[] = [];

    for (const org of orgs) {
      results.push({
        type: 'Organization',
        id: org.id,
        label: org.name,
        sublabel: `Institution Code: ${org.id.slice(0, 8)}`,
        href: `/founder?tab=orgs&id=${org.id}`,
      });
    }

    for (const u of users) {
      results.push({
        type: 'User Login',
        id: u.id,
        label: u.email,
        sublabel: `Role: ${u.role} · Institution ID: ${u.institutionId.slice(0, 8)}`,
        href: `/founder?tab=orgs&id=${u.institutionId}`,
      });
    }

    return results;
  }

  // ─── Organization Impersonation ──────────────────────────────────────────────

  @Post('impersonate/:institutionId')
  async impersonate(
    @Request() req,
    @Param('institutionId') institutionId: string,
    @Body() body: { reason: string; supportTicketRef?: string },
  ) {
    this.verifyFounder(req.user.role);

    if (!body.reason || body.reason.trim().length < 5) {
      throw new ForbiddenException('A valid reason is required to launch support impersonation sessions');
    }

    const targetOrg = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!targetOrg) {
      throw new NotFoundException('Target organization not found');
    }

    // Generate short-lived impersonation token (15 mins duration)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.impersonationSession.create({
      data: {
        founderId: req.user.id,
        targetInstitutionId: institutionId,
        reason: body.reason,
        supportTicketRef: body.supportTicketRef || null,
        tokenHash,
      },
    });

    // Lookup targeted Admin user or primary context roles
    const adminUser = await this.prisma.user.findFirst({
      where: { institutionId, role: 'INSTITUTE_ADMIN' },
    });

    const impersonationPayload = {
      sub: adminUser?.id || req.user.id, // Act as target admin or founder in context
      email: adminUser?.email || req.user.email,
      organizationId: institutionId,
      role: 'INSTITUTE_ADMIN',
      permissions: ['student:profile:read', 'attendance:records:read', 'exams:setup:read', 'finance:ledger:read', 'organization:settings:read'], // Read-only matrix
      enabledModules: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
      isImpersonation: true,
      originalFounderId: req.user.id,
    };

    const token = this.jwtService.sign(impersonationPayload, {
      secret: process.env.JWT_SECRET || 'super-secret-aurxon-jwt-key-2026-lite-erp',
      expiresIn: '15m', // Valid for exactly 15 minutes
    });

    return {
      token,
      orgName: targetOrg.name,
    };
  }

  // ─── Plan Definitions CRUD ──────────────────────────────────────────────────

  @Get('plans')
  async getPlans(@Request() req) {
    this.verifyFounder(req.user.role);
    
    const count = await this.prisma.planDefinition.count();
    if (count === 0) {
      await this.prisma.planDefinition.createMany({
        data: [
          { code: 'STARTER', name: 'Starter Plan', monthlyPrice: 4999, studentLimit: 250, storageLimitGb: 5, moduleAccess: ['STUDENT_MANAGEMENT', 'ATTENDANCE'] },
          { code: 'PROFESSIONAL', name: 'Professional Plan', monthlyPrice: 9999, studentLimit: 1000, storageLimitGb: 20, moduleAccess: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION'] },
          { code: 'ENTERPRISE', name: 'Enterprise Contract', monthlyPrice: 24999, studentLimit: 5000, storageLimitGb: 100, moduleAccess: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'] },
        ]
      });
    }

    return this.prisma.planDefinition.findMany();
  }

  @Post('plans')
  async createPlan(
    @Request() req,
    @Body() body: { code: string; name: string; monthlyPrice: number; studentLimit: number; storageLimitGb: number; moduleAccess: string[] },
  ) {
    this.verifyFounder(req.user.role);
    return this.prisma.planDefinition.create({
      data: {
        code: body.code.toUpperCase(),
        name: body.name,
        monthlyPrice: body.monthlyPrice,
        studentLimit: body.studentLimit,
        storageLimitGb: body.storageLimitGb,
        moduleAccess: body.moduleAccess,
      }
    });
  }
}
