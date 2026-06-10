import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; pass?: string; password?: string }) {
    const password = body.password || body.pass || '';
    return this.authService.login(body.email, password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('founder/login')
  async founderLogin(@Body() body: { email: string; pass?: string; password?: string }) {
    const password = body.password || body.pass || '';
    return this.authService.founderLogin(body.email, password);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('switch-context')
  async switchContext(
    @Request() req: any,
    @Body() body: { organizationId: string; schoolId?: string; campusId?: string },
  ) {
    return this.authService.switchContext(
      req.user.id,
      body.organizationId,
      body.schoolId,
      body.campusId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('navigation')
  async getNavigation(@Request() req: any) {
    return this.authService.getNavigation(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-context')
  async refreshContext(@Request() req: any) {
    if (!req.user.organizationId) {
      throw new UnauthorizedException('No active organization context to refresh.');
    }
    return this.authService.switchContext(
      req.user.id,
      req.user.organizationId,
      req.user.schoolId,
      req.user.campusId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-license')
  async refreshLicense(@Request() req: any) {
    if (!req.user.organizationId) {
      throw new UnauthorizedException('No active organization context to refresh.');
    }
    return this.authService.switchContext(
      req.user.id,
      req.user.organizationId,
      req.user.schoolId,
      req.user.campusId,
    );
  }

  @Get('activate/validate/:token')
  async validateToken(@Param('token') token: string) {
    return this.authService.validateActivationToken(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('activate/verify')
  async activateWithKey(
    @Request() req: any,
    @Body() body: { referenceNumber: string; activationKey: string; comments?: string },
  ) {
    const ipAddress = req.ip || (req.headers && req.headers['x-forwarded-for']) || null;
    return this.authService.activateWorkspaceWithKey(
      body.referenceNumber,
      body.activationKey,
      ipAddress,
      body.comments
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('activate/:token')
  async activate(@Param('token') token: string, @Body() body: { pass?: string; password?: string }) {
    const password = body.password || body.pass || '';
    return this.authService.activateOrganization(token, password);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('theme-preference')
  async updateThemePreference(
    @Request() req: any,
    @Body() body: { theme: string },
  ) {
    return this.authService.updateThemePreference(req.user.id, body.theme);
  }

  @Get('institution/:slug')
  async getInstitutionBySlug(@Param('slug') slug: string) {
    return this.authService.getInstitutionBySlug(slug);
  }
}

