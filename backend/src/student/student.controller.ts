import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { StudentService } from './student.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get()
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT')
  async findAll(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('search') search?: string,
  ) {
    return this.studentService.findAll(req.user.institutionId, classId, search);
  }

  @Get(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT', 'STUDENT', 'PARENT')
  async findOne(@Request() req, @Param('id') id: string) {
    // If student/parent role is calling, enforce profile ownership check
    if (req.user.role === 'STUDENT' && req.user.profileId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.studentService.findOne(req.user.institutionId, id);
  }

  @Post()
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async create(@Request() req, @Body() body: any) {
    return this.studentService.create(req.user.institutionId, body);
  }

  @Put(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.studentService.update(req.user.institutionId, id, body);
  }

  @Post('promote')
  @Roles('INSTITUTE_ADMIN')
  async promote(@Request() req, @Body() body: { studentIds: string[]; targetClassId: string }) {
    return this.studentService.promote(req.user.institutionId, body);
  }

  @Delete(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async remove(@Request() req, @Param('id') id: string) {
    return this.studentService.remove(req.user.institutionId, id);
  }
}
