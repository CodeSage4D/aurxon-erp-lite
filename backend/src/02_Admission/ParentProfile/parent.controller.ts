// IEEE Standard 29148 compliant parent entity REST controller
// Parent is a first-class entity with full CRUD and student linkage management

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../01_Core/Auth/roles.guard';
import { ParentService } from './parent.service';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('search') search?: string,
  ) {
    if (req.user.role === 'PARENT' || req.user.role === 'STUDENT') {
      throw new ForbiddenException('You are not authorized to list parents');
    }
    return this.parentService.findAll(req.user.institutionId, search, req.user.role);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'PARENT' && req.user.profileId !== id) {
      throw new ForbiddenException('You are not authorized to view this parent profile');
    }
    if (req.user.role === 'STUDENT') {
      throw new ForbiddenException('Students are not authorized to view parent profiles');
    }
    return this.parentService.findOne(req.user.institutionId, id, req.user.role);
  }

  @Get(':id/students')
  getLinkedStudents(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'PARENT' && req.user.profileId !== id) {
      throw new ForbiddenException('You are not authorized to view these students');
    }
    if (req.user.role === 'STUDENT') {
      throw new ForbiddenException('Students are not authorized to view parent student linkages');
    }
    return this.parentService.getLinkedStudents(req.user.institutionId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.parentService.create(req.user.institutionId, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.parentService.update(req.user.institutionId, id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Post(':id/link-student/:studentId')
  linkStudent(
    @Request() req: any,
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.linkStudent(req.user.institutionId, parentId, studentId);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Delete(':id/unlink-student/:studentId')
  unlinkStudent(
    @Request() req: any,
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.unlinkStudent(req.user.institutionId, parentId, studentId);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.parentService.remove(req.user.institutionId, id);
  }
}
