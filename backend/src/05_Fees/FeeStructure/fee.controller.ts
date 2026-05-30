import { Controller, Get, Post, Delete, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../../01_Core/Auth/roles.guard';
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

  // 1. Full Accounting Ledger
  @Get('finance/overview')
  @Roles('INSTITUTE_ADMIN', 'ACCOUNTANT')
  async getFinanceOverview(@Request() req) {
    return this.feeService.getFinanceOverview(req.user.institutionId);
  }

  // 2. Expense logs CRUD
  @Get('expenses')
  @Roles('INSTITUTE_ADMIN', 'ACCOUNTANT')
  async getExpenses(@Request() req) {
    return this.feeService.getExpenses(req.user.institutionId);
  }

  @Post('expenses')
  @Roles('INSTITUTE_ADMIN', 'ACCOUNTANT')
  async createExpense(@Request() req, @Body() body: any) {
    return this.feeService.createExpense(req.user.institutionId, body);
  }

  @Delete('expenses/:id')
  @Roles('INSTITUTE_ADMIN', 'ACCOUNTANT')
  async deleteExpense(@Request() req, @Param('id') id: string) {
    return this.feeService.deleteExpense(req.user.institutionId, id);
  }
}
