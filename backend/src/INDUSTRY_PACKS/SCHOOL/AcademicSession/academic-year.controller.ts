import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../KERNEL/Authentication/jwt-auth.guard';
import { Roles, RolesGuard } from '../../../KERNEL/Authentication/roles.guard';
import { AcademicYearService } from './academic-year.service';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.academicYearService.findAll(req.user.institutionId);
  }

  @Get('active')
  findActive(@Request() req: any) {
    return this.academicYearService.findActive(req.user.institutionId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.academicYearService.findOne(req.user.institutionId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Post()
  create(@Request() req: any, @Body() body: { name: string; startDate: string; endDate: string }) {
    return this.academicYearService.create(req.user.institutionId, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.academicYearService.update(req.user.institutionId, id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post(':id/activate')
  activate(@Request() req: any, @Param('id') id: string) {
    return this.academicYearService.activate(req.user.institutionId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post(':id/close')
  close(@Request() req: any, @Param('id') id: string) {
    return this.academicYearService.close(req.user.institutionId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.academicYearService.remove(req.user.institutionId, id);
  }
}
