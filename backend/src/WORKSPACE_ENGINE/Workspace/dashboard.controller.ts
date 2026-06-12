import { Controller, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../KERNEL/Authentication/jwt-auth.guard';
import { RolesGuard, Roles } from '../../KERNEL/Authentication/roles.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('layout')
  async getLayout(@Request() req) {
    const institutionId = req.user.institutionId || req.user.organizationId;
    if (!institutionId) {
      throw new BadRequestException('No active organization context');
    }
    return this.dashboardService.getLayout(institutionId, req.user.role, req.user.enabledModules || []);
  }

  @Get('widgets/data')
  async getWidgetData(@Request() req) {
    const institutionId = req.user.institutionId || req.user.organizationId;
    if (!institutionId) {
      throw new BadRequestException('No active organization context');
    }
    return this.dashboardService.getWidgetData(institutionId);
  }

  @Get('stats')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async getStats(@Request() req) {
    return this.dashboardService.getAdminStats(req.user.institutionId);
  }

  @Get('founder-stats')
  @Roles('SUPER_ADMIN')
  async getFounderStats() {
    return this.dashboardService.getFounderStats();
  }
}

