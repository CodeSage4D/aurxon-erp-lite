import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../KERNEL/Authentication/jwt-auth.guard';
import { PlannerService } from './planner.service';

@UseGuards(JwtAuthGuard)
@Controller('productivity/planner')
export class PlannerController {
  constructor(private plannerService: PlannerService) {}

  @Get()
  async getActivities(@Request() req) {
    return this.plannerService.getActivities(req.user.id);
  }

  @Post()
  async createActivity(@Request() req, @Body() body: any) {
    return this.plannerService.createActivity(req.user.id, body);
  }

  @Put(':id')
  async updateActivity(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.plannerService.updateActivity(req.user.id, id, body);
  }

  @Delete(':id')
  async deleteActivity(@Request() req, @Param('id') id: string) {
    return this.plannerService.deleteActivity(req.user.id, id);
  }
}
