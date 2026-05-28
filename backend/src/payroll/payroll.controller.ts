import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PayrollService } from './payroll.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'HR_MANAGER')
  async getPayrolls(@Request() req, @Query('month') month?: string) {
    return this.payrollService.getPayrolls(req.user.institutionId, month);
  }

  @Get('staff/:staffId')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'HR_MANAGER', 'TEACHER', 'STAFF')
  async getStaffPayrolls(@Request() req, @Param('staffId') staffId: string) {
    // If they are a teacher/staff, check if they are querying their own payslips
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'INSTITUTE_ADMIN' && req.user.role !== 'ACCOUNTANT' && req.user.role !== 'HR_MANAGER') {
      if (req.user.profileId !== staffId) {
        throw new ForbiddenException('Access denied to other employee payroll details');
      }
    }
    return this.payrollService.getStaffPayrolls(req.user.institutionId, staffId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'HR_MANAGER', 'TEACHER', 'STAFF')
  async getPayrollById(@Request() req, @Param('id') id: string) {
    const payroll = await this.payrollService.getPayrollById(id, req.user.institutionId);
    // If they are not admin/accountant, check if they own this slip
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'INSTITUTE_ADMIN' && req.user.role !== 'ACCOUNTANT' && req.user.role !== 'HR_MANAGER') {
      if (req.user.profileId !== payroll.staffId) {
        throw new ForbiddenException('Access denied to other employee payroll details');
      }
    }
    return payroll;
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'HR_MANAGER')
  async createPayroll(@Request() req, @Body() body: any) {
    return this.payrollService.createPayroll(req.user.institutionId, body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT')
  async updatePayrollStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.payrollService.updatePayrollStatus(id, req.user.institutionId, body.status);
  }
}
