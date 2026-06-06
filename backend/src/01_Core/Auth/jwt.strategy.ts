import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

const userCache = new Map<string, { data: any; timestamp: number }>();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-aurxon-jwt-key-2026-lite-erp',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    organizationId?: string | null;
    schoolId?: string | null;
    campusId?: string | null;
    roleIds?: string[];
    role?: string | null;
    permissions?: string[];
    enabledModules?: string[];
    enabledFeatures?: string[];
    profileId?: string | null;
    teamRole?: string | null;
    industryPackCode?: string | null;
  }) {
    const cacheKey = payload.sub;
    const cached = userCache.get(cacheKey);
    let user: any;

    if (cached && (Date.now() - cached.timestamp) < 3000) {
      user = cached.data;
    } else {
      user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          isActive: true,
          mustChangePassword: true,
          role: true,
        },
      });
      if (user) {
        userCache.set(cacheKey, { data: user, timestamp: Date.now() });
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is inactive or does not exist');
    }

    return {
      id: user.id, // compatibility
      userId: user.id,
      email: user.email,
      organizationId: payload.organizationId || null,
      institutionId: payload.organizationId || null, // compatibility with legacy endpoints
      schoolId: payload.schoolId || null,
      campusId: payload.campusId || null,
      roleIds: payload.roleIds || [],
      role: payload.role || user.role || null, // active role code or global user role
      permissions: payload.permissions || [],
      enabledModules: payload.enabledModules || [],
      enabledFeatures: payload.enabledFeatures || [],
      profileId: payload.profileId || null,
      mustChangePassword: user.mustChangePassword,
      teamRole: payload.teamRole || null,
      industryPackCode: payload.industryPackCode || null,
    };
  }
}
