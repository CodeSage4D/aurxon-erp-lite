import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../../KERNEL/Authentication/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../KERNEL/Authentication/roles.guard';
import { ModuleActiveGuard } from '../../../KERNEL/Authentication/module-active.guard';
import { ModuleActive } from '../../../KERNEL/Authentication/module-active.decorator';
import { AttendanceService } from './attendance.service';

@UseGuards(JwtAuthGuard, ModuleActiveGuard, RolesGuard)
@ModuleActive('ATTENDANCE')
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER')
  async getClassAttendance(
    @Request() req,
    @Query('classId') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getClassAttendance(req.user.institutionId, classId, date);
  }

  @Post('bulk')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER')
  async recordBulk(@Request() req, @Body() body: any) {
    return this.attendanceService.recordBulk(req.user.institutionId, req.user.id, body);
  }

  @Get('student/:studentId')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'STUDENT', 'PARENT')
  async getStudentSummary(@Request() req, @Param('studentId') studentId: string) {
    return this.attendanceService.getStudentSummary(req.user.institutionId, studentId, req.user);
  }

  @Get('overview')
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async getOverview(@Request() req) {
    return this.attendanceService.getInstitutionOverview(req.user.institutionId);
  }
}
