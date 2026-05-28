import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        institution: {
          select: {
            name: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
        studentProfile: {
          select: { id: true, firstName: true, lastName: true },
        },
        parentProfile: {
          select: { id: true, firstName: true, lastName: true },
        },
        staffProfile: {
          select: { id: true, firstName: true, lastName: true, designation: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or inactive account');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Determine friendly name
    let profileName = 'Administrator';
    let profileId = '';
    if (user.studentProfile) {
      profileName = `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
      profileId = user.studentProfile.id;
    } else if (user.parentProfile) {
      profileName = `${user.parentProfile.firstName} ${user.parentProfile.lastName}`;
      profileId = user.parentProfile.id;
    } else if (user.staffProfile) {
      profileName = `${user.staffProfile.firstName} ${user.staffProfile.lastName}`;
      profileId = user.staffProfile.id;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileName,
        profileId,
        institutionId: user.institutionId,
        institutionName: user.institution.name,
        logoUrl: user.institution.logoUrl,
        primaryColor: user.institution.primaryColor,
      },
    };
  }
}
