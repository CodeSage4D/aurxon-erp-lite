import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../01_Core/Auth/jwt-auth.guard';
import { TaskService } from './task.service';

@UseGuards(JwtAuthGuard)
@Controller('productivity/tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getTasks(@Request() req) {
    return this.taskService.getTasks(req.user.id);
  }

  @Post()
  async createTask(@Request() req, @Body() body: any) {
    return this.taskService.createTask(req.user.id, body);
  }

  @Patch(':id')
  async updateTaskStatus(@Request() req, @Param('id') id: string, @Body() body: { status: string; feedback?: string }) {
    return this.taskService.updateTaskStatus(req.user.id, id, body);
  }

  @Post(':id/escalate')
  async escalateTask(@Request() req, @Param('id') id: string) {
    return this.taskService.escalateTask(req.user.id, id);
  }
}
