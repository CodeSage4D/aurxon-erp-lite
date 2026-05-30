import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../01_Core/Auth/roles.guard';
import { StaffAttendanceService } from './staff-attendance.service';

@Controller('staff-attendance')
@UseGuards(JwtAuthGuard)
export class StaffAttendanceController {
  constructor(private readonly staffAttendanceService: StaffAttendanceService) {}

  @Get('date/:date')
  getByDate(@Request() req: any, @Param('date') date: string) {
    return this.staffAttendanceService.getByDate(req.user.institutionId, date);
  }

  @Get('summary/:staffId')
  getMonthlySummary(
    @Request() req: any,
    @Param('staffId') staffId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.staffAttendanceService.getMonthlySummary(
      req.user.institutionId,
      staffId,
      parseInt(month),
      parseInt(year),
    );
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  @Post('record')
  recordToday(@Request() req: any, @Body() body: any) {
    return this.staffAttendanceService.recordToday(req.user.institutionId, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Post('bulk')
  bulkRecord(@Request() req: any, @Body() body: { date: string; records: any[] }) {
    return this.staffAttendanceService.bulkRecord(req.user.institutionId, body.date, body.records);
  }
}
