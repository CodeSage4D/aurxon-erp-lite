import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../Auth/roles.guard';
import { ModuleService } from './module.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getModules() {
    return this.moduleService.getModules();
  }

  @Get('org')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getOrgModules(@Request() req: any) {
    return this.moduleService.getOrgModules(req.user.organizationId);
  }

  @Post('toggle')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async toggleModule(
    @Request() req: any,
    @Body() body: { moduleCode: string; isEnabled: boolean },
  ) {
    return this.moduleService.toggleModule(
      req.user.organizationId,
      req.user.id,
      body.moduleCode,
      body.isEnabled,
    );
  }

  @Get('features')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getFeatures() {
    return this.moduleService.getFeatures();
  }

  @Get('features/org')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getOrgFeatures(@Request() req: any) {
    return this.moduleService.getOrgFeatures(req.user.organizationId);
  }

  @Post('features/toggle')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async toggleFeature(
    @Request() req: any,
    @Body() body: { featureCode: string; isEnabled: boolean },
  ) {
    return this.moduleService.toggleFeature(
      req.user.organizationId,
      req.user.id,
      body.featureCode,
      body.isEnabled,
    );
  }
}
