import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { AttendanceService } from './attendance.service';

@UseGuards(JwtAuthGuard, RolesGuard)
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
  async getStudentSummary(@Param('studentId') studentId: string) {
    return this.attendanceService.getStudentSummary(studentId);
  }

  @Get('overview')
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async getOverview(@Request() req) {
    return this.attendanceService.getInstitutionOverview(req.user.institutionId);
  }
}
