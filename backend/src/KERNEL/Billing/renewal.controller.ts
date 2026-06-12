import {
  Controller, Get, Post, Param, Body, Query,
  UseGuards, Request, ForbiddenException,
} from '@nestjs/common';
import { RenewalService } from './renewal.service';
import { JwtAuthGuard } from '../Authentication/jwt-auth.guard';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('renewals')
export class RenewalController {
  constructor(
    private renewalService: RenewalService,
    private prisma: PrismaService,
  ) {}

  /**
   * Helper to verify platform team member role.
   */
  private async verifyTeamMember(userId: string, allowedRoles: string[] = ['*']) {
    const member = await this.prisma.aurxonTeamMember.findUnique({ where: { userId } });
    if (!member) throw new ForbiddenException('Access denied: Not an Aurxon team member.');
    if (!allowedRoles.includes('*') && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(`Access denied: Role ${member.role} not authorized.`);
    }
    return member;
  }

  /**
   * Org Admin: Submit a renewal request for their own organization.
   */
  @Post('request')
  async requestRenewal(
    @Request() req,
    @Body() body: { months?: number; notes?: string },
  ) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('No active organization context found');
    }
    return this.renewalService.requestRenewal(
      req.user.organizationId,
      body.months || 12,
      body.notes,
    );
  }

  /**
   * Org Admin: Get renewal requests for their organization.
   */
  @Get('my-requests')
  async getMyRenewalRequests(@Request() req) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('No active organization context found');
    }
    return this.renewalService.getOrgRenewalRequests(req.user.organizationId);
  }

  /**
   * Org Admin: Apply a received renewal key.
   */
  @Post('apply')
  async applyRenewalKey(
    @Request() req,
    @Body() body: { renewalKey: string },
  ) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('No active organization context found');
    }
    return this.renewalService.applyRenewalKey(req.user.organizationId, body.renewalKey);
  }

  /**
   * Founder / Platform Team: List all renewal requests.
   */
  @Get()
  async listRenewalRequests(
    @Request() req,
    @Query('status') status?: string,
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.verifyTeamMember(req.user.id, [
        'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'CUSTOMER_SUCCESS_MANAGER', 'FINANCE_MANAGER',
      ]);
    }
    return this.renewalService.listRenewalRequests(status);
  }

  /**
   * Founder / Platform Team: Approve a pending renewal request and generate a Renewal Key.
   */
  @Post(':id/approve')
  async approveRenewalRequest(
    @Request() req,
    @Param('id') id: string,
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.verifyTeamMember(req.user.id, [
        'FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR',
      ]);
    }
    return this.renewalService.approveAndGenerateKey(id, req.user.id);
  }

  /**
   * Founder override: Generate a renewal key directly for any organization without a pending request.
   */
  @Post('direct/:institutionId')
  async founderDirectRenewal(
    @Request() req,
    @Param('institutionId') institutionId: string,
    @Body() body: { months: number; notes?: string },
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.verifyTeamMember(req.user.id, ['FOUNDER', 'CO_FOUNDER']);
    }
    return this.renewalService.founderDirectRenewal(
      institutionId,
      body.months || 12,
      req.user.id,
      body.notes,
    );
  }
}
