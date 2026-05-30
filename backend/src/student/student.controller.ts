import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

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
    return this.studentService.findAll(
      req.user.institutionId,
      classId,
      search,
      req.user.role,
      req.user.profileId,
    );
  }

  @Get(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT', 'STUDENT', 'PARENT')
  async findOne(@Request() req, @Param('id') id: string) {
    // If student role is calling, enforce profile ownership check
    if (req.user.role === 'STUDENT' && req.user.profileId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    
    // Fetch and check parent ownership internally inside service or here
    const student = await this.studentService.findOne(
      req.user.institutionId,
      id,
      req.user.role,
      req.user.profileId,
    );

    if (req.user.role === 'PARENT' && student.parentId !== req.user.profileId) {
      throw new ForbiddenException('You can only access profiles of your linked children');
    }

    return student;
  }

  @Post()
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async create(@Request() req, @Body() body: CreateStudentDto) {
    return this.studentService.create(req.user.institutionId, body);
  }

  @Put(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async update(@Request() req, @Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.studentService.update(req.user.institutionId, id, body);
  }

  @Post('promote')
  @Roles('INSTITUTE_ADMIN')
  async promote(@Request() req, @Body() body: { studentIds: string[]; targetClassId: string }) {
    return this.studentService.promote(req.user.institutionId, body, req.user.id);
  }

  @Get('promotions/history')
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER')
  async getPromotionHistory(@Request() req) {
    return this.studentService.getPromotionHistory(req.user.institutionId);
  }

  @Delete(':id')
  @Roles('INSTITUTE_ADMIN', 'STAFF')
  async remove(@Request() req, @Param('id') id: string) {
    return this.studentService.remove(req.user.institutionId, id);
  }
}
