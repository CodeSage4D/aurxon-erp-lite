import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { JwtAuthGuard } from '../../KERNEL/Authentication/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('hospital')
export class HospitalController {
  constructor(private hospitalService: HospitalService) {}

  @Post('departments')
  async createDepartment(@Request() req: any, @Body() body: { name: string }) {
    return this.hospitalService.createDepartment(req.user.institutionId, body.name);
  }

  @Post('admit')
  async admitPatient(
    @Body() body: {
      patientName: string;
      departmentId: string;
      wardId?: string;
      bedId?: string;
      notes?: string;
    }
  ) {
    return this.hospitalService.admitPatient(
      body.patientName,
      body.departmentId,
      body.wardId,
      body.bedId,
      body.notes
    );
  }
}
