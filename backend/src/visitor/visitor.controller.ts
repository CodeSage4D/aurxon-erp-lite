import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { VisitorService } from './visitor.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visitors')
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Get()
  async getVisitors(@Request() req) {
    return this.visitorService.getVisitors(req.user.institutionId);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async createVisitor(@Request() req, @Body() body: any) {
    return this.visitorService.createVisitor(req.user.institutionId, body);
  }

  @Patch(':id/checkout')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async checkOutVisitor(@Request() req, @Param('id') id: string) {
    return this.visitorService.checkOutVisitor(req.user.institutionId, id);
  }
}
