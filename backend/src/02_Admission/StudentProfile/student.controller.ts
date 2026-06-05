import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { ModuleActiveGuard } from '../../01_Core/Auth/module-active.guard';
import { ModuleActive } from '../../01_Core/Auth/module-active.decorator';
import { PermissionsGuard } from '../../01_Core/Auth/permissions.guard';
import { Permissions } from '../../01_Core/Auth/permissions.decorator';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@UseGuards(JwtAuthGuard, ModuleActiveGuard, PermissionsGuard)
@ModuleActive('STUDENT_MANAGEMENT')
@Controller('students')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get()
  @Permissions('student:profile:read')
  async findAll(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.studentService.findAll(
      req.user.institutionId,
      classId,
      search,
      req.user.role,
      req.user.profileId,
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      sortBy || 'rollNumber',
      sortOrder || 'asc',
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const isStudentOrParent = req.user.role === 'STUDENT' || req.user.role === 'PARENT';
    
    // If not a student or parent, enforce permission
    if (!isStudentOrParent && req.user.role !== 'SUPER_ADMIN') {
      const userPermissions = req.user.permissions || [];
      if (!userPermissions.includes('student:profile:read')) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Enforce relationship-based ownership checks for students and parents
    if (req.user.role === 'STUDENT') {
      await this.studentService.verifyStudentOwnership(req.user.userId, id);
    } else if (req.user.role === 'PARENT') {
      await this.studentService.verifyParentOwnership(req.user.userId, id);
    }

    return this.studentService.findOne(
      req.user.institutionId,
      id,
      req.user.role,
      req.user.profileId,
    );
  }

  @Post()
  @Permissions('student:profile:create')
  async create(@Request() req, @Body() body: CreateStudentDto) {
    return this.studentService.create(req.user.institutionId, body, req.user.userId);
  }

  @Put(':id')
  @Permissions('student:profile:update')
  async update(@Request() req, @Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.studentService.update(req.user.institutionId, id, body, req.user.userId);
  }

  @Post('promote')
  @Permissions('student:profile:update')
  async promote(@Request() req, @Body() body: { studentIds: string[]; targetClassId: string }) {
    return this.studentService.promote(req.user.institutionId, body, req.user.userId);
  }

  @Get('promotions/history')
  @Permissions('student:profile:read')
  async getPromotionHistory(@Request() req) {
    return this.studentService.getPromotionHistory(req.user.institutionId);
  }

  @Delete(':id')
  @Permissions('student:profile:delete')
  async remove(@Request() req, @Param('id') id: string) {
    return this.studentService.remove(req.user.institutionId, id, req.user.userId);
  }

  // ─── Document Management ─────────────────────────────────────────────────────

  @Post(':id/documents')
  @Permissions('student:profile:update')
  async addDocument(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { name: string; fileUrl: string },
  ) {
    return this.studentService.addDocument(
      req.user.institutionId,
      id,
      body.name,
      body.fileUrl,
      req.user.userId,
    );
  }

  @Delete(':id/documents/:docId')
  @Permissions('student:profile:update')
  async removeDocument(
    @Request() req,
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return this.studentService.removeDocument(
      req.user.institutionId,
      id,
      docId,
      req.user.userId,
    );
  }

  // ─── Bulk Import ─────────────────────────────────────────────────────────────

  @Post('import')
  @Permissions('student:profile:create')
  async importStudents(
    @Request() req,
    @Body() body: { students: any[] },
  ) {
    return this.studentService.importStudents(
      req.user.institutionId,
      body.students,
      req.user.userId,
    );
  }
}
