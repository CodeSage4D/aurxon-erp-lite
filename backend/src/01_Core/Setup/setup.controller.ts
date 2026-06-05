import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../Auth/roles.guard';
import { SetupService } from './setup.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getSetupStatus(@Request() req: any) {
    return this.setupService.getSetupStatus(req.user.organizationId);
  }

  @Post('submit')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async submitSetup(
    @Request() req: any,
    @Body() body: {
      academicYear: string;
      gradingSystem: string;
      timezone: string;
      currency: string;
      branch: {
        name: string;
        code: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pinCode?: string;
      };
    },
  ) {
    return this.setupService.submitSetup(
      req.user.organizationId,
      req.user.id,
      body,
    );
  }
}
