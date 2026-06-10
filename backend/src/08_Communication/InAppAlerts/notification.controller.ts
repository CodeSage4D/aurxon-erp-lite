import { Controller, Get, Patch, Post, Delete, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async findAll(@Request() req) {
    return this.notificationService.findAll(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('read-all')
  async markAllRead(@Request() req) {
    return this.notificationService.markAllRead(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('clear')
  async clearAll(@Request() req) {
    return this.notificationService.clearAll(req.user.id);
  }
}
