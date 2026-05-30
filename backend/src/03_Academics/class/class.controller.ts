import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/auth/jwt-auth.guard';
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
}
