import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { NoticeService } from './notice.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notices')
export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  @Get()
  async getNotices(@Request() req) {
    return this.noticeService.getNotices(req.user.institutionId, req.user.role);
  }

  @Post()
  @Roles('INSTITUTE_ADMIN', 'STAFF', 'TEACHER')
  async createNotice(@Request() req, @Body() body: any) {
    const authorName = req.user.profileName || 'Administrator';
    return this.noticeService.createNotice(req.user.institutionId, authorName, body);
  }
}
