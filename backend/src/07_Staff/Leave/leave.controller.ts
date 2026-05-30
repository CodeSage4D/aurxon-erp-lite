import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../01_Core/Auth/roles.guard';
import { LeaveService } from './leave.service';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('staffId') staffId?: string,
    @Query('status') status?: string,
  ) {
    return this.leaveService.findAll(req.user.institutionId, staffId, status);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.leaveService.findOne(req.user.institutionId, id);
  }

  @Get('balances/:staffId')
  getBalances(@Request() req: any, @Param('staffId') staffId: string) {
    return this.leaveService.getBalances(req.user.institutionId, staffId);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.leaveService.create(req.user.institutionId, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post(':id/approve')
  approve(@Request() req: any, @Param('id') id: string) {
    return this.leaveService.approve(req.user.institutionId, id, req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post(':id/reject')
  reject(@Request() req: any, @Param('id') id: string) {
    return this.leaveService.reject(req.user.institutionId, id, req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Post('balances')
  upsertBalance(@Request() req: any, @Body() body: any) {
    return this.leaveService.upsertBalance(req.user.institutionId, body);
  }
}
