import { Controller, Get, Post, Patch, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../../01_Core/auth/roles.guard';
import { StaffService } from './staff.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'HR_MANAGER', 'SUPER_ADMIN')
  async getStaff(@Request() req, @Query('designation') designation?: string) {
    return this.staffService.getStaff(req.user.institutionId, designation);
  }

  @Post()
  @Roles('INSTITUTE_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN')
  async createStaff(@Request() req, @Body() body: any) {
    return this.staffService.createStaff(req.user.institutionId, body);
  }

  @Get(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'HR_MANAGER', 'SUPER_ADMIN', 'TEACHER', 'ACCOUNTANT')
  async getStaffById(@Request() req, @Param('id') id: string) {
    return this.staffService.getStaffById(req.user.institutionId, id);
  }

  @Patch(':id')
  @Roles('INSTITUTE_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN')
  async updateStaff(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.staffService.updateStaff(req.user.institutionId, id, body);
  }

  @Get('leaves')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT')
  async getLeaves(@Request() req, @Query('staffId') staffId?: string) {
    if (req.user.role !== 'INSTITUTE_ADMIN' && req.user.role !== 'STAFF') {
      return this.staffService.getLeaves(req.user.institutionId, req.user.profileId);
    }
    return this.staffService.getLeaves(req.user.institutionId, staffId);
  }

  @Post('leaves')
  @Roles('TEACHER', 'ACCOUNTANT', 'STAFF')
  async createLeaveRequest(@Request() req, @Body() body: any) {
    return this.staffService.createLeaveRequest(req.user.id, body);
  }

  @Patch('leaves/:id')
  @Roles('INSTITUTE_ADMIN')
  async updateLeaveStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.staffService.updateLeaveStatus(
      req.user.institutionId,
      id,
      body.status,
      req.user.id,
    );
  }
}
