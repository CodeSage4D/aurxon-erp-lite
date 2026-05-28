import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { LessonService } from './lesson.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @Get()
  async getPlans(
    @Request() req,
    @Query('teacherId') teacherId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const filterTeacherId = req.user.role === 'TEACHER' ? req.user.profileId : teacherId;
    return this.lessonService.getPlans(req.user.institutionId, filterTeacherId, subjectId);
  }

  @Post()
  @Roles('TEACHER', 'INSTITUTE_ADMIN')
  async createPlan(@Request() req, @Body() body: any) {
    return this.lessonService.createPlan(req.user.institutionId, req.user.id, body);
  }

  @Put(':id')
  @Roles('TEACHER', 'INSTITUTE_ADMIN')
  async updatePlan(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.lessonService.updatePlan(req.user.institutionId, id, body);
  }

  @Delete(':id')
  @Roles('TEACHER', 'INSTITUTE_ADMIN')
  async deletePlan(@Request() req, @Param('id') id: string) {
    return this.lessonService.deletePlan(req.user.institutionId, id);
  }
}
