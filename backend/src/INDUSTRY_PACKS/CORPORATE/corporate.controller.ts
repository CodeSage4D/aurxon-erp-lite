import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { JwtAuthGuard } from '../../KERNEL/Authentication/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('corporate')
export class CorporateController {
  constructor(private corporateService: CorporateService) {}

  @Post('divisions')
  async createDivision(@Request() req: any, @Body() body: { name: string }) {
    return this.corporateService.createDivision(req.user.institutionId, body.name);
  }

  @Post('assign')
  async assignEmployee(
    @Body() body: {
      employeeId: string;
      employeeName: string;
      teamId: string;
      role: string;
      notes?: string;
    }
  ) {
    return this.corporateService.assignEmployee(
      body.employeeId,
      body.employeeName,
      body.teamId,
      body.role,
      body.notes
    );
  }
}
