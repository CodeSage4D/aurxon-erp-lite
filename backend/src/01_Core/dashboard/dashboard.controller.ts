import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async getStats(@Request() req) {
    return this.dashboardService.getAdminStats(req.user.institutionId);
  }
}
