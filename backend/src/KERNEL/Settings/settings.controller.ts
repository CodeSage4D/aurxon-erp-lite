import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../Authentication/jwt-auth.guard';
import { RolesGuard, Roles } from '../Authentication/roles.guard';
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

  @Get('config')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getOrgConfigs(@Request() req) {
    return this.settingsService.getOrgConfigs(req.user.organizationId);
  }

  @Put('config')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async upsertOrgConfig(
    @Request() req,
    @Body() body: { groupCode: string; items: Record<string, string> },
  ) {
    return this.settingsService.upsertOrgConfig(
      req.user.organizationId,
      body.groupCode,
      body.items,
    );
  }
}
