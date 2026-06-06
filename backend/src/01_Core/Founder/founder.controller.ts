import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PlatformMetricsService } from './platform-metrics.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BillingService } from '../Billing/billing.service';
import * as crypto from 'crypto';

@UseGuards(JwtAuthGuard)
@Controller('founder')
export class FounderController {
  constructor(
    private metricsService: PlatformMetricsService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private billingService: BillingService,
  ) {}

  /**
   * Helper to verify if user is an authorized internal team member with allowed roles.
   */
  private async verifyTeamMember(userId: string, allowedRoles: string[] = ['*']) {
    const member = await this.prisma.aurxonTeamMember.findUnique({
      where: { userId }
    });

    if (!member) {
      throw new ForbiddenException('Access denied: User is not an authorized Aurxon team member.');
    }

    if (!allowedRoles.includes('*') && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(`Access denied: Team role ${member.role} is not authorized for this operation.`);
    }

    return member;
  }

  @Get('team-member')
  async getTeamMember(@Request() req) {
    return this.verifyTeamMember(req.user.id);
  }

  @Get('packs')
  async getIndustryPacks(@Request() req) {
    await this.verifyTeamMember(req.user.id);
    return this.prisma.industryPack.findMany({
      where: { isActive: true }
    });
  }

  @Get('metrics/current')
  async getCurrentMetrics(@Request() req) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'SALES_MANAGER', 
      'CUSTOMER_SUCCESS_MANAGER', 'FINANCE_MANAGER'
    ]);
    return this.metricsService.getLatestMetrics();
  }

  @Get('metrics/history')
  async getMetricsHistory(@Request() req, @Query('limit') limit?: string) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'SALES_MANAGER', 
      'CUSTOMER_SUCCESS_MANAGER', 'FINANCE_MANAGER'
    ]);
    const lim = limit ? parseInt(limit, 10) : 12;
    return this.metricsService.getMetricsHistory(lim);
  }

  @Get('metrics/storage')
  async getStorageStats(@Request() req) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'CUSTOMER_SUCCESS_MANAGER'
    ]);
    return this.metricsService.getStorageStats();
  }

  // ─── Security Center ─────────────────────────────────────────────────────────

  @Get('security/threats')
  async getSecurityThreats(@Request() req) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'SUPPORT_MANAGER'
    ]);
    return this.prisma.securityThreatLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('security/threats/:id/resolve')
  async resolveThreat(@Request() req, @Param('id') id: string) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'SUPPORT_MANAGER'
    ]);
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
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'SUPPORT_MANAGER'
    ]);
    return this.prisma.backupRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredBy: { select: { email: true } },
      },
    });
  }

  @Post('backup/trigger')
  async triggerBackup(@Request() req, @Body() body: { notes?: string }) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 
      'TECHNICAL_ADMINISTRATOR', 'SUPPORT_MANAGER'
    ]);

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
        notes: body.notes || 'Manual backup initiated by Founder Admin.',
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
    await this.verifyTeamMember(req.user.id);
    if (!q || q.trim().length < 2) {
      return [];
    }

    const query = q.trim().toLowerCase();

    // Search organizations
    const orgs = await this.prisma.institution.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
    });

    // Search user logins
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
        href: `/teams/dashboard?tab=orgs&id=${org.id}`,
      });
    }

    for (const u of users) {
      results.push({
        type: 'User Login',
        id: u.id,
        label: u.email,
        sublabel: `Role: ${u.role} · Institution ID: ${u.institutionId.slice(0, 8)}`,
        href: `/teams/dashboard?tab=orgs&id=${u.institutionId}`,
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
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'SUPPORT_MANAGER'
    ]);

    if (!body.reason || body.reason.trim().length < 5) {
      throw new ForbiddenException('A valid reason is required to launch support impersonation sessions');
    }

    const targetOrg = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!targetOrg) {
      throw new NotFoundException('Target organization not found');
    }

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

    const adminUser = await this.prisma.user.findFirst({
      where: { institutionId, role: 'INSTITUTE_ADMIN' },
    });

    const impersonationPayload = {
      sub: adminUser?.id || req.user.id,
      email: adminUser?.email || req.user.email,
      organizationId: institutionId,
      role: 'INSTITUTE_ADMIN',
      permissions: ['student:profile:read', 'attendance:records:read', 'exams:setup:read', 'finance:ledger:read', 'organization:settings:read'],
      enabledModules: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
      isImpersonation: true,
      originalFounderId: req.user.id,
    };

    const token = this.jwtService.sign(impersonationPayload, {
      secret: process.env.JWT_SECRET || 'super-secret-aurxon-jwt-key-2026-lite-erp',
      expiresIn: '15m',
    });

    return {
      token,
      orgName: targetOrg.name,
    };
  }

  // ─── Plan Definitions CRUD ──────────────────────────────────────────────────

  @Get('plans')
  async getPlans(@Request() req) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'PRODUCT_MANAGER', 'FINANCE_MANAGER'
    ]);
    return this.prisma.planDefinition.findMany();
  }

  @Post('plans')
  async createPlan(
    @Request() req,
    @Body() body: { code: string; name: string; monthlyPrice: number; studentLimit: number; storageLimitGb: number; moduleAccess: string[] },
  ) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'PRODUCT_MANAGER'
    ]);
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

  // ─── Dynamic Dashboard Layout for Team Members ──────────────────────────────

  @Get('dashboard/layout')
  async getTeamDashboardLayout(@Request() req) {
    const member = await this.verifyTeamMember(req.user.id);
    return this.metricsService.getTeamDashboardLayoutJSON(member.role);
  }

  @Get('dashboard/stats')
  async getTeamDashboardStats(@Request() req) {
    const member = await this.verifyTeamMember(req.user.id);
    
    // Aggregate platform metrics, registrations, storage status, threats and billing data
    const basicMetrics = await this.metricsService.getLatestMetrics();
    const billing = await this.billingService.getFounderBillingStats();
    
    const totalOrganizations = await this.prisma.institution.count();
    const activeOrganizations = await this.prisma.institution.count({ where: { status: 'ACTIVE' } });
    const industryPacksCount = await this.prisma.industryPack.count({ where: { isActive: true } });
    const registrationsCount = await this.prisma.organizationRegistration.count({ where: { status: 'PENDING_REVIEW' } });
    const threatsCount = await this.prisma.securityThreatLog.count({ where: { resolved: false } });
    const storageStats = await this.metricsService.getStorageStats();

    return {
      metrics: basicMetrics,
      billing,
      overview: {
        totalOrganizations,
        activeOrganizations,
        industryPacksCount,
        registrationsCount,
        threatsCount,
      },
      storageStats,
    };
  }

  // ─── Activation Key Engine ──────────────────────────────────────────────────

  @Get('activation-keys')
  async getActivationKeys(@Request() req) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR'
    ]);
    return this.prisma.activationKey.findMany({
      include: {
        registration: {
          select: {
            orgName: true,
            email: true,
            referenceNumber: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('activation-keys/:id/revoke')
  async revokeActivationKey(@Request() req, @Param('id') id: string) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR'
    ]);
    
    const key = await this.prisma.activationKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException('Activation key not found');

    const updated = await this.prisma.activationKey.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KEY_REVOCATION',
        details: `Activation key revoked for key ID: ${id}`,
      }
    });

    return updated;
  }

  @Post('activation-keys/:id/suspend')
  async suspendActivationKey(@Request() req, @Param('id') id: string) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR'
    ]);
    
    const key = await this.prisma.activationKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException('Activation key not found');

    const updated = await this.prisma.activationKey.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KEY_SUSPENSION',
        details: `Activation key suspended for key ID: ${id}`,
      }
    });

    return updated;
  }

  @Post('activation-keys/:id/renew')
  async renewActivationKey(@Request() req, @Param('id') id: string, @Body() body: { months: number }) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR'
    ]);
    
    const key = await this.prisma.activationKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException('Activation key not found');

    const newExpiry = new Date(key.expiresAt);
    newExpiry.setMonth(newExpiry.getMonth() + (body.months || 12));

    const updated = await this.prisma.activationKey.update({
      where: { id },
      data: { 
        status: 'ACTIVE',
        expiresAt: newExpiry,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KEY_RENEWAL',
        details: `Activation key renewed for key ID: ${id}. New expiry: ${newExpiry.toISOString()}`,
      }
    });

    return updated;
  }

  @Post('activation-keys/:id/regenerate')
  async regenerateActivationKey(@Request() req, @Param('id') id: string) {
    await this.verifyTeamMember(req.user.id, [
      'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR'
    ]);
    
    const oldKey = await this.prisma.activationKey.findUnique({
      where: { id },
      include: { registration: true },
    });
    if (!oldKey) throw new NotFoundException('Activation key not found');

    await this.prisma.activationKey.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const newRawKey = `AURX-ACT-${part1}-${part2}-${part3}`;
    const keyHash = crypto.createHash('sha256').update(newRawKey).digest('hex');

    await this.prisma.organizationRegistration.update({
      where: { id: oldKey.registrationId },
      data: {
        status: 'PROVISIONED',
      },
    });

    const created = await this.prisma.activationKey.create({
      data: {
        keyHash,
        encryptedPackage: oldKey.encryptedPackage,
        status: 'ACTIVE',
        expiresAt: oldKey.expiresAt,
        registrationId: oldKey.registrationId,
        organizationId: oldKey.organizationId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KEY_REGENERATION',
        details: `Regenerated activation key. Old ID: ${id}, New ID: ${created.id}`,
      }
    });

    return {
      newRawKey,
      ...created,
    };
  }
}

