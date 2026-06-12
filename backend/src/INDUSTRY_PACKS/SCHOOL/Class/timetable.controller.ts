import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../KERNEL/Authentication/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../KERNEL/Authentication/roles.guard';
import { TimetableService } from './timetable.service';
import { PrismaService } from '../../../SHARED/Prisma/prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
  constructor(
    private timetableService: TimetableService,
    private prisma: PrismaService,
  ) {}

  private async validateClassInchargeOrAdmin(reqUser: any, classId: string) {
    if (reqUser.role === 'SUPER_ADMIN' || reqUser.role === 'INSTITUTE_ADMIN') {
      return;
    }

    const classRecord = await this.prisma.class.findFirst({
      where: { id: classId, institutionId: reqUser.institutionId },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    const staff = await this.prisma.staff.findUnique({
      where: { userId: reqUser.id },
    });

    if (!staff || staff.id !== classRecord.classTeacherId) {
      throw new ForbiddenException('Only the Class Incharge (Class Teacher) or administrators are authorized to perform this operation.');
    }
  }

  @Get(':classId')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'STUDENT', 'PARENT')
  async getTimetable(@Request() req, @Param('classId') classId: string) {
    return this.timetableService.getTimetable(req.user.institutionId, classId);
  }

  @Post(':classId/generate')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  async generateTimetable(
    @Request() req,
    @Param('classId') classId: string,
    @Body() body: { periodsPerDay: number; durationMin: number; startTime: string },
  ) {
    await this.validateClassInchargeOrAdmin(req.user, classId);

    const periodsPerDay = Number(body.periodsPerDay || 6);
    const durationMin = Number(body.durationMin || 45);
    const startTime = body.startTime || '08:30';

    return this.timetableService.generateTimetable(
      req.user.institutionId,
      classId,
      periodsPerDay,
      durationMin,
      startTime,
    );
  }

  @Post(':classId/save')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  async saveTimetable(
    @Request() req,
    @Param('classId') classId: string,
    @Body() body: { entries: any[] },
  ) {
    await this.validateClassInchargeOrAdmin(req.user, classId);
    return this.timetableService.saveTimetable(req.user.institutionId, classId, body.entries);
  }
}
