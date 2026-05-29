import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async findAll(@Request() req) {
    return this.notificationService.findAll(req.user.id);
  }

  @Post('read-all')
  async markAllRead(@Request() req) {
    return this.notificationService.markAllRead(req.user.id);
  }
}
