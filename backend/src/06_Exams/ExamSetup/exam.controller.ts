import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../../01_Core/Auth/roles.guard';
import { ExamService } from './exam.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamController {
  constructor(private examService: ExamService) {}

  @Get()
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'STUDENT', 'PARENT')
  async getExams(@Request() req, @Query('subjectId') subjectId?: string) {
    return this.examService.getExams(req.user.institutionId, subjectId);
  }

  @Post()
  @Roles('INSTITUTE_ADMIN', 'TEACHER')
  async createExam(@Request() req, @Body() body: any) {
    return this.examService.createExam(req.user.institutionId, body);
  }

  @Get(':id/results')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER')
  async getExamResults(@Request() req, @Param('id') id: string) {
    return this.examService.getExamResults(req.user.institutionId, id);
  }

  @Post(':id/results/bulk')
  @Roles('INSTITUTE_ADMIN', 'TEACHER')
  async recordResultsBulk(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.examService.recordResultsBulk(req.user.institutionId, id, body);
  }

  @Get('student/:studentId')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'STUDENT', 'PARENT')
  async getStudentReport(@Param('studentId') studentId: string) {
    return this.examService.getStudentReport(studentId);
  }
}
