import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@Controller('registrations')
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  /**
   * Public registration signup
   */
  @Post('register')
  async register(@Body() body: CreateRegistrationDto) {
    return this.registrationService.create(body);
  }

  /**
   * List all registrations (Founder only)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query('status') status?: string) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform founders can view registrations');
    }
    return this.registrationService.findAll(status);
  }

  /**
   * Review registration (Founder only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/review')
  async review(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; notes?: string },
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform founders can review registrations');
    }
    return this.registrationService.review(id, req.user.id, body.status, body.notes);
  }
}
