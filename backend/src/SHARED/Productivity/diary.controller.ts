import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../KERNEL/Authentication/jwt-auth.guard';
import { DiaryService } from './diary.service';

@UseGuards(JwtAuthGuard)
@Controller('productivity/diary')
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Get()
  async getDiaryEntries(@Request() req) {
    return this.diaryService.getDiaryEntries(req.user.id);
  }

  @Get('shared')
  async getSharedDiaryEntries(@Request() req) {
    return this.diaryService.getSharedDiaryEntries(req.user.institutionId, req.user.id);
  }

  @Post()
  async createDiaryEntry(@Request() req, @Body() body: any) {
    return this.diaryService.createDiaryEntry(req.user.id, body);
  }

  @Put(':id')
  async updateDiaryEntry(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.diaryService.updateDiaryEntry(req.user.id, id, body);
  }

  @Delete(':id')
  async deleteDiaryEntry(@Request() req, @Param('id') id: string) {
    return this.diaryService.deleteDiaryEntry(req.user.id, id);
  }
}
