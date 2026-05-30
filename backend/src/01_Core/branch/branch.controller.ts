import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { BranchService } from './branch.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT')
  async findAll(@Request() req) {
    return this.branchService.findAll(req.user.institutionId);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async create(@Request() req, @Body() body: any) {
    return this.branchService.create(req.user.institutionId, body);
  }
}
