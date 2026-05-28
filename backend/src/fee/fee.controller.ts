import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { FeeService } from './fee.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees')
export class FeeController {
  constructor(private feeService: FeeService) {}

  @Get('structures')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async getStructures(@Request() req) {
    return this.feeService.getStructures(req.user.institutionId);
  }

  @Post('structures')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async createStructure(@Request() req, @Body() body: any) {
    return this.feeService.createStructure(req.user.institutionId, body);
  }

  @Get('allocations')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async getAllocations(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('status') status?: string,
  ) {
    return this.feeService.getAllocations(req.user.institutionId, classId, status);
  }

  @Post('allocations/bulk')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async allocateBulk(@Request() req, @Body() body: any) {
    return this.feeService.allocateBulk(req.user.institutionId, body);
  }

  @Post('payments')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async recordPayment(@Request() req, @Body() body: any) {
    return this.feeService.recordPayment(req.user.institutionId, body);
  }

  @Get('payments/history')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async getPaymentsHistory(@Request() req) {
    return this.feeService.getPaymentsHistory(req.user.institutionId);
  }

  @Get('overview')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async getOverview(@Request() req) {
    return this.feeService.getFeeOverview(req.user.institutionId);
  }
}
