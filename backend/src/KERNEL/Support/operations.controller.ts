// AURXON ERP Lite — Operations & Pilot UAT REST Controller
// IEEE 29148 compliant specifications

import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../Authentication/jwt-auth.guard';
import { RolesGuard, Roles } from '../Authentication/roles.guard';
import { OperationsService } from './operations.service';

@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  // ── BACKUP & S3 SYSTEM CONTROL ─────────────────────────────

  @Post('backups/run')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async runS3Backup(@Request() req: any) {
    return this.operationsService.runBackup(req.user.institutionId);
  }

  // ── DATA LIFECYCLE ─────────────────────────────────────────

  @Get('lifecycle')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getLifecycleStats(@Request() req: any) {
    return this.operationsService.getLifecycleStats(req.user.institutionId);
  }

  @Post('lifecycle/transition')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async transitionStudent(
    @Request() req: any,
    @Body() body: { studentId: string; status: string },
  ) {
    return this.operationsService.transitionStudent(body.studentId, body.status, req.user.institutionId);
  }

  // ── DATA INTEGRITY SWEET & SYSTEM ALERTS ────────────────────

  @Get('integrity')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async runIntegritySweep(@Request() req: any) {
    return this.operationsService.runIntegritySweep(req.user.institutionId);
  }

  @Get('integrity/alerts')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getSystemAlerts() {
    return this.operationsService.getSystemAlerts();
  }

  // ── IMPORT VALIDATION ──────────────────────────────────────

  @Post('imports/validate')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async validateImportPreview(@Body() body: { rows: any[] }) {
    return this.operationsService.validateImportPreview(body.rows);
  }

  // ── OBSERVABILITY & HEALTH METRICS ─────────────────────────

  @Get('monitoring')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getObservabilityMetrics(@Request() req: any) {
    return this.operationsService.getObservabilityMetrics(req.user.institutionId);
  }

  // ── PILOT UAT ISSUE TRACKER ────────────────────────────────

  @Post('uat/tickets')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STAFF', 'ACCOUNTANT', 'LIBRARIAN')
  async createUatTicket(@Request() req: any, @Body() body: any) {
    return this.operationsService.createUatTicket({
      ...body,
      createdBy: `${req.user.role} (${req.user.email})`,
    });
  }

  @Get('uat/tickets')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STAFF', 'ACCOUNTANT', 'LIBRARIAN')
  async getUatTickets() {
    return this.operationsService.getUatTickets();
  }

  @Patch('uat/tickets/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async updateUatTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.operationsService.updateUatTicketStatus(id, body.status);
  }
}
