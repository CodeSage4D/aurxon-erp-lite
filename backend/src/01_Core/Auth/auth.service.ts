import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

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

    // Fetch memberships
    const userMemberships = await this.prisma.organizationMembership.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        institution: {
          select: {
            name: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
        role: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    const formattedMemberships = userMemberships.map((m) => ({
      id: m.id,
      organizationId: m.institutionId,
      organizationName: m.institution.name,
      logoUrl: m.institution.logoUrl || '',
      primaryColor: m.institution.primaryColor || '#0284c7',
      role: m.role.code,
      roleName: m.role.name,
      schoolId: m.schoolId || null,
      campusId: m.campusId || null,
      isPrimary: m.isPrimary,
    }));

    const payload = {
      sub: user.id,
      email: user.email,
      profileId: profileId || null,
      mustChangePassword: user.mustChangePassword,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        profileName,
        profileId: profileId || null,
        mustChangePassword: user.mustChangePassword,
      },
      memberships: formattedMemberships,
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
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    await this.prisma.securityEventLog.create({
      data: {
        userId: user.id,
        email: user.email,
        action: 'PASSWORD_CHANGED',
        details: 'User successfully changed their password via self-service.',
      },
    });
  }

  async switchContext(
    userId: string,
    organizationId: string,
    schoolId?: string,
    campusId?: string,
  ) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        institutionId: organizationId,
        schoolId: schoolId || null,
        campusId: campusId || null,
        status: 'ACTIVE',
      },
      include: {
        institution: {
          select: {
            name: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Access denied to this organization context.');
    }

    const orgModules = await this.prisma.organizationModule.findMany({
      where: {
        organizationId: membership.institutionId,
        isEnabled: true,
      },
      select: {
        moduleCode: true,
      },
    });
    const enabledModules = orgModules.map(m => m.moduleCode);

    const orgFeatures = await this.prisma.organizationFeature.findMany({
      where: {
        organizationId: membership.institutionId,
        isEnabled: true,
      },
      select: {
        featureCode: true,
      },
    });
    const enabledFeatures = orgFeatures.map(f => f.featureCode);

    const permissions = membership.role.permissions.map(
      p => `${p.resource}:${p.action.toLowerCase()}`,
    );

    const branding = await this.prisma.organizationBranding.findFirst({
      where: { organizationId: membership.institutionId },
    });

    const primaryColor = branding?.primaryColor || membership.institution.primaryColor || '#0284c7';
    const logoUrl = branding?.logoUrl || membership.institution.logoUrl || '';

    const userRec = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, mustChangePassword: true },
    });

    const payload = {
      sub: userId,
      email: userRec?.email,
      organizationId: membership.institutionId,
      schoolId: membership.schoolId || null,
      campusId: membership.campusId || null,
      roleIds: [membership.roleId],
      role: membership.role.code, // Active role code for guard checks
      permissions,
      enabledModules,
      enabledFeatures,
      mustChangePassword: userRec?.mustChangePassword || false,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      context: {
        organizationId: membership.institutionId,
        organizationName: membership.institution.name,
        schoolId: membership.schoolId || null,
        campusId: membership.campusId || null,
        role: membership.role.code,
        roleName: membership.role.name,
        permissions,
        enabledModules,
        enabledFeatures,
        mustChangePassword: userRec?.mustChangePassword || false,
        branding: {
          primaryColor,
          logoUrl,
        },
      },
    };
  }

  async getNavigation(userContext: any) {
    const allCategories = [
      { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['*'], section: 'Daily Use' },
      { id: 'academic', label: 'Academic Desk', icon: 'BookOpen', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'COACHING_DIRECTOR', 'REGISTRAR', 'EXAM_CONTROLLER', 'INSTITUTE_ADMIN'], moduleCode: 'STUDENT_MANAGEMENT', section: 'Daily Use' },
      { id: 'students', label: 'Student Desk', icon: 'Users', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'REGISTRAR', 'INSTITUTE_ADMIN'], moduleCode: 'STUDENT_MANAGEMENT', section: 'Daily Use' },
      { id: 'exams', label: 'Exams & Grades', icon: 'Award', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'EXAM_CONTROLLER', 'COACHING_DIRECTOR', 'INSTITUTE_ADMIN'], moduleCode: 'EXAMINATION', section: 'Daily Use' },
      { id: 'attendance', label: 'Attendance', icon: 'CalendarCheck', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACADEMIC_DIRECTOR', 'TEACHER', 'ATTENDANCE_OFFICER', 'INSTITUTE_ADMIN'], moduleCode: 'ATTENDANCE', section: 'Daily Use' },
      { id: 'fees', label: 'Fees & Finance', icon: 'CreditCard', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'INSTITUTE_ADMIN'], moduleCode: 'FINANCE', section: 'Daily Use' },
      { id: 'comms', label: 'Comms Hub', icon: 'MessageSquare', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'COMMUNICATION_HEAD', 'TEACHER', 'STUDENT', 'PARENT', 'INSTITUTE_ADMIN'], section: 'Communication' },
      { id: 'library', label: 'Library Desk', icon: 'Book', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'LIBRARIAN', 'TEACHER', 'STUDENT', 'PARENT', 'INSTITUTE_ADMIN'], section: 'Daily Use' },
      { id: 'productivity', label: 'Productivity Desk', icon: 'ClipboardList', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'LIBRARIAN', 'STAFF', 'ACCOUNTANT', 'INSTITUTE_ADMIN'], section: 'Daily Use' },
      { id: 'gate', label: 'Visitor Gate Desk', icon: 'ShieldAlert', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'INSTITUTE_ADMIN', 'STAFF'], section: 'Staff' },
      { id: 'inventory', label: 'Inventory Desk', icon: 'BarChart2', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'STAFF'], section: 'Administration' },
      { id: 'hr', label: 'HR System', icon: 'Briefcase', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'ACCOUNTANT', 'INSTITUTE_ADMIN', 'TEACHER', 'LIBRARIAN'], section: 'Staff' },
      { id: 'reports', label: 'Reports Desk', icon: 'FileText', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'INSTITUTE_ADMIN', 'ACCOUNTANT', 'TEACHER'], section: 'Insights' },
      { id: 'analytics', label: 'Analytics Desk', icon: 'BarChart2', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'INSTITUTE_ADMIN', 'TEACHER'], section: 'Insights' },
      { id: 'operations', label: 'Operations Desk', icon: 'ShieldCheck', roles: ['SUPER_ADMIN', 'INSTITUTE_ADMIN'], section: 'Administration' },
      { id: 'settings', label: 'Settings', icon: 'Settings', roles: ['SUPER_ADMIN', 'INSTITUTE_ADMIN'], section: 'Administration' }
    ];

    const userRole = userContext.role || '';
    const enabledModules = userContext.enabledModules || [];

    return allCategories.filter(cat => {
      // Check role restriction
      if (!cat.roles.includes('*') && !cat.roles.includes(userRole)) {
        return false;
      }
      // Check module activation if mapped
      if (cat.moduleCode && !enabledModules.includes(cat.moduleCode)) {
        return false;
      }
      return true;
    });
  }

  async validateActivationToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await this.prisma.activationToken.findUnique({
      where: { token: tokenHash },
      include: {
        registration: true,
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Activation token is invalid or has expired');
    }

    if (tokenRecord.usedAt) {
      throw new BadRequestException('Activation token has already been used');
    }

    if (tokenRecord.revokedAt) {
      throw new BadRequestException('Activation token has been revoked');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('Activation token has expired');
    }

    return {
      orgName: tokenRecord.registration.orgName,
      orgType: tokenRecord.registration.orgType,
      email: tokenRecord.registration.email,
    };
  }

  async activateOrganization(token: string, pass: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await this.prisma.activationToken.findUnique({
      where: { token: tokenHash },
      include: {
        registration: true,
      },
    });

    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('Activation token is invalid, used, or expired');
    }

    const reg = tokenRecord.registration;
    if (!reg.institutionId) {
      throw new BadRequestException('No provisioned organization associated with this registration');
    }

    if (pass.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const passwordHash = await argon2.hash(pass);

    return await this.prisma.$transaction(async (tx) => {
      // Create admin user
      const user = await tx.user.create({
        data: {
          email: reg.email,
          passwordHash,
          role: 'INSTITUTE_ADMIN',
          institutionId: reg.institutionId!,
          mustChangePassword: true, // Force change on first login
        },
      });

      // Find the INSTITUTE_ADMIN role for this institution
      const adminRole = await tx.role.findFirst({
        where: {
          institutionId: reg.institutionId!,
          code: 'INSTITUTE_ADMIN',
        },
      });

      if (!adminRole) {
        throw new BadRequestException('Default admin role not found for provisioned organization');
      }

      // Create membership
      await tx.organizationMembership.create({
        data: {
          userId: user.id,
          institutionId: reg.institutionId!,
          roleId: adminRole.id,
          status: 'ACTIVE',
          isPrimary: true,
        },
      });

      // Update institution status
      await tx.institution.update({
        where: { id: reg.institutionId! },
        data: { status: 'ACTIVE' },
      });

      // Mark token as used
      await tx.activationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'ORG_ACTIVATION',
          details: `Organization ${reg.orgName} activated successfully. Admin user created.`,
        },
      });

      return {
        email: user.email,
        orgName: reg.orgName,
        status: 'ACTIVATED',
      };
    });
  }
}
