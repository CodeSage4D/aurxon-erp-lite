import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../AuditLogs/audit-log.service';

@Injectable()
export class RbacService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async getRoles(institutionId: string) {
    return this.prisma.role.findMany({
      where: { institutionId },
      include: {
        permissions: true,
        _count: { select: { memberships: true } },
      },
    });
  }

  async createRole(
    institutionId: string,
    userId: string,
    name: string,
    code: string,
    description?: string,
  ) {
    const sanitizedCode = code.toUpperCase().trim().replace(/\s+/g, '_');

    const existing = await this.prisma.role.findFirst({
      where: { institutionId, code: sanitizedCode },
    });
    if (existing) {
      throw new BadRequestException(`Role with code ${sanitizedCode} already exists.`);
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        code: sanitizedCode,
        description,
        institutionId,
        isSystem: false,
      },
    });

    await this.auditLogService.logAction(
      userId,
      'CREATE_ROLE',
      `Created custom role ${name} (${sanitizedCode}) inside organization ${institutionId}`,
    );

    return role;
  }

  async deleteRole(institutionId: string, userId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, institutionId },
    });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted.');
    }

    const membersCount = await this.prisma.organizationMembership.count({
      where: { roleId },
    });
    if (membersCount > 0) {
      throw new BadRequestException('Cannot delete role. Active memberships exist.');
    }

    await this.prisma.role.delete({ where: { id: roleId } });

    await this.auditLogService.logAction(
      userId,
      'DELETE_ROLE',
      `Deleted custom role ${role.name} (${role.code})`,
    );

    return { id: roleId };
  }

  async getPermissionsByInstitution(institutionId: string) {
    return this.prisma.role.findMany({
      where: { institutionId },
      include: { permissions: true },
    });
  }

  async togglePermission(
    institutionId: string,
    userId: string,
    roleId: string,
    resource: string,
    action: string,
    isAllowed: boolean,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, institutionId },
    });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    const actionUpper = action.toUpperCase();
    const existingPermission = await this.prisma.permission.findFirst({
      where: { roleId, resource, action: actionUpper },
    });

    if (isAllowed) {
      if (!existingPermission) {
        await this.prisma.permission.create({
          data: { roleId, resource, action: actionUpper },
        });
      }
    } else {
      if (existingPermission) {
        await this.prisma.permission.delete({
          where: { id: existingPermission.id },
        });
      }
    }

    await this.auditLogService.logAction(
      userId,
      'TOGGLE_PERMISSION',
      `${isAllowed ? 'Enabled' : 'Disabled'} permission ${resource}:${actionUpper} for role ${role.name}`,
    );

    return { success: true };
  }

  async getMemberships(institutionId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { institutionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            staffProfile: { select: { firstName: true, lastName: true, designation: true } },
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async updateMembership(
    institutionId: string,
    executorId: string,
    membershipId: string,
    roleId?: string,
    status?: string,
  ) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { id: membershipId, institutionId },
      include: { role: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership record not found.');
    }

    const data: any = {};
    let details = `Updated membership ID ${membershipId}: `;

    if (roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: roleId, institutionId },
      });
      if (!role) throw new NotFoundException('New role not found.');
      data.roleId = roleId;
      details += `Changed role from ${membership.role.name} to ${role.name}. `;
    }

    if (status) {
      data.status = status;
      details += `Changed status from ${membership.status} to ${status}. `;
    }

    const updated = await this.prisma.organizationMembership.update({
      where: { id: membershipId },
      data,
      include: { role: true },
    });

    await this.auditLogService.logAction(executorId, 'UPDATE_MEMBERSHIP', details.trim());

    return updated;
  }

  async inviteMember(institutionId: string, executorId: string, email: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, institutionId },
    });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 10);
      user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: role.code,
          institutionId,
        },
      });
    }

    const existingMembership = await this.prisma.organizationMembership.findFirst({
      where: { userId: user.id, institutionId },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this organization.');
    }

    const newMembership = await this.prisma.organizationMembership.create({
      data: {
        userId: user.id,
        institutionId,
        roleId,
        status: 'ACTIVE',
        isPrimary: false,
      },
      include: {
        role: true,
      },
    });

    await this.auditLogService.logAction(
      executorId,
      'INVITE_MEMBER',
      `Invited user ${email} mapping to role ${role.name}`,
    );

    return newMembership;
  }
}
