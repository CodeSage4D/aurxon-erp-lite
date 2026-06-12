import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../KERNEL/Authentication/jwt-auth.guard';
import { Roles, RolesGuard } from '../../../KERNEL/Authentication/roles.guard';
import { SubjectService } from './subject.service';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  findAll(@Request() req: any, @Query('classId') classId?: string) {
    return this.subjectService.findAll(req.user.institutionId, classId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.subjectService.findOne(req.user.institutionId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Post()
  create(@Request() req: any, @Body() body: { name: string; code: string; classId: string; teacherId?: string }) {
    return this.subjectService.create(req.user.institutionId, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.subjectService.update(req.user.institutionId, id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.subjectService.remove(req.user.institutionId, id);
  }
}
