import { Controller, Get, Post, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../KERNEL/Authentication/jwt-auth.guard';
import { ClassService } from './class.service';

@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassController {
  constructor(private classService: ClassService) {}

  @Get()
  async getClasses(@Request() req) {
    return this.classService.getClasses(req.user.institutionId);
  }

  @Get('subjects')
  async getSubjects(@Request() req, @Query('classId') classId?: string) {
    return this.classService.getSubjects(req.user.institutionId, classId);
  }

  @Get(':classId/sections')
  async getSections(@Param('classId') classId: string) {
    return this.classService.getSections(classId);
  }

  @Post(':classId/sections')
  async createSection(@Param('classId') classId: string, @Body() body: { name: string }) {
    return this.classService.createSection(classId, body.name);
  }
}
