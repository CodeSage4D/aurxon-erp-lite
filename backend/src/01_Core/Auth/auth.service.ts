import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const sanitizedEmail = (email || '').trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: sanitizedEmail },
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

    if (!user) {
      // Non-existent user failed login
      await this.prisma.securityEventLog.create({
        data: {
          userId: null,
          email: sanitizedEmail,
          action: 'FAILED_LOGIN',
          details: `Failed login attempt for non-existent email: ${sanitizedEmail}`,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      await this.prisma.securityEventLog.create({
        data: {
          userId: user.id,
          email: sanitizedEmail,
          action: 'SUSPICIOUS_ACCESS_ATTEMPT',
          details: `Login attempt on inactive account: ${sanitizedEmail}`,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);

      await this.prisma.securityEventLog.create({
        data: {
          userId: user.id,
          email: sanitizedEmail,
          action: 'LOCKOUT_VIOLATION_ATTEMPT',
          details: `Login attempt on locked account: ${sanitizedEmail}. Lockout remaining: ${remainingMins} min(s).`,
        },
      });

      throw new UnauthorizedException(`Account is temporarily locked. Please try again in ${remainingMins} minute(s).`);
    }

    let isMatch = false;
    let needsRehash = false;

    // Check legacy BCrypt signature: starts with $2a$ or $2b$
    const isLegacyBcrypt = user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$');

    if (isLegacyBcrypt) {
      isMatch = await bcrypt.compare(pass, user.passwordHash);
      needsRehash = isMatch; // Only rehash if legacy BCrypt password matched successfully
    } else {
      try {
        isMatch = await argon2.verify(user.passwordHash, pass);
      } catch (error) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      // Login failed: track attempt and lock out if threshold reached
      const newAttempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;
      let action = 'FAILED_LOGIN';
      let details = `Failed login attempt for email: ${sanitizedEmail}`;

      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        action = 'LOCKOUT';
        details = `Account locked for 15 minutes due to 5 consecutive failed login attempts`;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts >= 5 ? 0 : newAttempts,
          lockedUntil,
        },
      });

      // Log security event
      await this.prisma.securityEventLog.create({
        data: {
          userId: user.id,
          email: sanitizedEmail,
          action,
          details,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Login succeeded: reset tracking parameters and handle migration bridge
    const updateData: any = {
      failedLoginAttempts: 0,
      lockedUntil: null,
    };

    if (needsRehash) {
      const argonHash = await argon2.hash(pass);
      updateData.passwordHash = argonHash;

      // Log password migration event
      await this.prisma.securityEventLog.create({
        data: {
          userId: user.id,
          email: sanitizedEmail,
          action: 'PASSWORD_MIGRATION',
          details: `Password hash successfully upgraded from BCrypt to Argon2 at runtime.`,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

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
      profileId: profileId || null,
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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Verify current password (BCrypt or Argon2)
    let isMatch = false;
    if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    } else {
      try {
        isMatch = await argon2.verify(user.passwordHash, currentPassword);
      } catch {
        isMatch = false;
      }
    }

    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    const newHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

    await this.prisma.securityEventLog.create({
      data: {
        userId: user.id,
        email: user.email,
        action: 'PASSWORD_CHANGED',
        details: 'User successfully changed their password via self-service.',
      },
    });
  }
}
