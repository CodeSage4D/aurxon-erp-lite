// Institution management endpoint — IEEE 12207 compliant lifecycle service
// Manages institution-level configuration: branding, primary color, logoUrl

import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../Authentication/jwt-auth.guard';
import { Roles, RolesGuard } from '../Authentication/roles.guard';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Controller('institution')
@UseGuards(JwtAuthGuard)
export class InstitutionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getMyInstitution(@Request() req: any) {
    const { institutionId } = req.user;
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        branches: {
          select: { id: true, name: true, code: true, city: true, state: true, phone: true },
        },
        settings: true,
      },
    });
    return institution;
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Patch()
  async updateInstitution(
    @Request() req: any,
    @Body() body: { name?: string; logoUrl?: string; primaryColor?: string },
  ) {
    const { institutionId } = req.user;
    return this.prisma.institution.update({
      where: { id: institutionId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.logoUrl && { logoUrl: body.logoUrl }),
        ...(body.primaryColor && { primaryColor: body.primaryColor }),
      },
    });
  }
}
