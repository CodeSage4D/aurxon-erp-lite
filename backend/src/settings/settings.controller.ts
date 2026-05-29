import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { SettingsService } from './settings.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT')
  async findOne(@Request() req) {
    return this.settingsService.findOne(req.user.institutionId);
  }

  @Put()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async update(@Request() req, @Body() body: any) {
    return this.settingsService.update(req.user.institutionId, body);
  }
}
