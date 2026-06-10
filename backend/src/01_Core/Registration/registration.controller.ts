import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, ForbiddenException, Query, NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('registrations')
export class RegistrationController {
  constructor(
    private registrationService: RegistrationService,
    private prisma: PrismaService
  ) {}

  /**
   * Public registration signup
   */
  @Post('register')
  async register(@Body() body: CreateRegistrationDto) {
    return this.registrationService.create(body);
  }

  /**
   * Helper to verify if the user has an allowed team role.
   */
  private async checkTeamRole(userId: string, allowedRoles: string[] = ['*']): Promise<any> {
    const member = await this.prisma.aurxonTeamMember.findUnique({
      where: { userId }
    });

    if (!member) {
      throw new ForbiddenException('Access denied: User is not an authorized Aurxon team member.');
    }

    if (!allowedRoles.includes('*') && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(`Access denied: Team role ${member.role} is not authorized for this operation.`);
    }

    return member;
  }

  /**
   * List all registrations (Founder and Platform Team)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query('status') status?: string) {
    // Check if SUPER_ADMIN (Founder) or valid team member
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.checkTeamRole(req.user.id);
    }
    return this.registrationService.findAll(status);
  }

  /**
   * Founder Review: Approve / Reject / Request Changes / Approve with Conditions
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/review')
  async review(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'APPROVED_WITH_CONDITIONS'; notes?: string },
  ) {
    // Only Founder roles or SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.checkTeamRole(req.user.id, ['FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR']);
    }
    return this.registrationService.review(id, req.user.id, body.status, body.notes);
  }

  /**
   * Platform Team Review: Technical Verification
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/technical-review')
  async technicalReview(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.checkTeamRole(req.user.id, ['FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR', 'SUPPORT_MANAGER']);
    }
    return this.registrationService.technicalReview(id, req.user.id, body.notes);
  }

  /**
   * Provision Workspace Engine
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/provision')
  async provision(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { paymentStatus?: string },
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      await this.checkTeamRole(req.user.id, ['FOUNDER', 'CO_FOUNDER', 'PLATFORM_DIRECTOR', 'TECHNICAL_ADMINISTRATOR']);
    }
    const paymentStatus = body.paymentStatus || 'TRIAL';
    const ipAddress = req.ip || (req.headers && req.headers['x-forwarded-for']) || null;
    return this.registrationService.provisionWorkspace(id, req.user.id, paymentStatus, ipAddress);
  }

  /**
   * Public endpoint to request an SMS OTP code.
   */
  @Post('send-otp')
  async sendOtp(@Body() body: { phone: string }) {
    return this.registrationService.sendOtp(body.phone);
  }

  /**
   * Public endpoint to verify SMS OTP code.
   */
  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; otp: string }) {
    return this.registrationService.verifyOtp(body.phone, body.otp);
  }
}
