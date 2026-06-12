import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';
import { AuditLogService } from '../Audit/audit-log.service';

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

  async getMatrix(institutionId: string) {
    let groups = await this.prisma.permissionGroup.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (groups.length === 0) {
      const defaultGroups = [
        { code: 'STUDENT_CORE', label: 'Student Records', moduleCode: 'STUDENT_MANAGEMENT', sortOrder: 1 },
        { code: 'ATTENDANCE_CORE', label: 'Attendance Tracking', moduleCode: 'ATTENDANCE', sortOrder: 2 },
        { code: 'EXAMS_CORE', label: 'Examinations & Grades', moduleCode: 'EXAMINATION', sortOrder: 3 },
        { code: 'FINANCE_CORE', label: 'Fees & Payroll', moduleCode: 'FINANCE', sortOrder: 4 },
        { code: 'ORG_SETTINGS', label: 'Organization Settings', moduleCode: 'STUDENT_MANAGEMENT', sortOrder: 5 },
      ];

      for (const dg of defaultGroups) {
        await this.prisma.permissionGroup.create({ data: dg });
      }

      groups = await this.prisma.permissionGroup.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }

    const roles = await this.prisma.role.findMany({
      where: { institutionId },
      include: { permissions: true },
    });

    const systemPermissions = [
      { resource: 'student:profile', action: 'READ', groupCode: 'STUDENT_CORE', label: 'View Student Profiles', description: 'Allows viewing student rosters and directories' },
      { resource: 'student:profile', action: 'CREATE', groupCode: 'STUDENT_CORE', label: 'Admit Student', description: 'Allows admitting new students via admission desk' },
      { resource: 'student:profile', action: 'UPDATE', groupCode: 'STUDENT_CORE', label: 'Update Student Profile', description: 'Allows modifying student demographics' },
      { resource: 'student:profile', action: 'DELETE', groupCode: 'STUDENT_CORE', label: 'Archive Student', description: 'Allows archiving student records' },

      { resource: 'attendance:records', action: 'READ', groupCode: 'ATTENDANCE_CORE', label: 'View Attendance Logs', description: 'Allows viewing daily attendance sheets' },
      { resource: 'attendance:records', action: 'CREATE', groupCode: 'ATTENDANCE_CORE', label: 'Record Attendance', description: 'Allows submitting daily attendance' },
      { resource: 'attendance:records', action: 'UPDATE', groupCode: 'ATTENDANCE_CORE', label: 'Edit Attendance', description: 'Allows updating past attendance entries' },
      { resource: 'attendance:records', action: 'DELETE', groupCode: 'ATTENDANCE_CORE', label: 'Delete Attendance', description: 'Allows wiping attendance entries' },

      { resource: 'exams:setup', action: 'READ', groupCode: 'EXAMS_CORE', label: 'View Exams', description: 'Allows viewing exam schedules and grading schemas' },
      { resource: 'exams:setup', action: 'CREATE', groupCode: 'EXAMS_CORE', label: 'Create Exams', description: 'Allows scheduling new exams' },
      { resource: 'exams:setup', action: 'UPDATE', groupCode: 'EXAMS_CORE', label: 'Record Grades', description: 'Allows entering student marks' },
      { resource: 'exams:setup', action: 'DELETE', groupCode: 'EXAMS_CORE', label: 'Delete Exams', description: 'Allows deleting scheduled exams' },

      { resource: 'finance:ledger', action: 'READ', groupCode: 'FINANCE_CORE', label: 'View Financial Records', description: 'Allows viewing fee receipts and payrolls' },
      { resource: 'finance:ledger', action: 'CREATE', groupCode: 'FINANCE_CORE', label: 'Receive Fees', description: 'Allows registering student fee payments' },
      { resource: 'finance:ledger', action: 'UPDATE', groupCode: 'FINANCE_CORE', label: 'Update Salaries', description: 'Allows running staff payroll systems' },
      { resource: 'finance:ledger', action: 'DELETE', groupCode: 'FINANCE_CORE', label: 'Refund Fees', description: 'Allows voiding fee transactions' },

      { resource: 'organization:settings', action: 'READ', groupCode: 'ORG_SETTINGS', label: 'View Settings', description: 'Allows viewing institution configurations' },
      { resource: 'organization:settings', action: 'CREATE', groupCode: 'ORG_SETTINGS', label: 'Setup Rules', description: 'Allows initializing setup steps' },
      { resource: 'organization:settings', action: 'UPDATE', groupCode: 'ORG_SETTINGS', label: 'Update Settings', description: 'Allows modifying logo, colors, and branding' },
      { resource: 'organization:settings', action: 'DELETE', groupCode: 'ORG_SETTINGS', label: 'Reset Rules', description: 'Allows wiping configurations' },
    ];

    const groupMap = new Map<string, any>();
    for (const g of groups) {
      groupMap.set(g.code, {
        id: g.id,
        code: g.code,
        label: g.label,
        moduleCode: g.moduleCode,
        permissions: [],
      });
    }

    for (const sysPerm of systemPermissions) {
      const g = groupMap.get(sysPerm.groupCode);
      if (g) {
        const roleStates: Record<string, boolean> = {};
        for (const r of roles) {
          const hasPerm = r.permissions.some(
            p => p.resource === sysPerm.resource && p.action === sysPerm.action,
          );
          roleStates[r.id] = hasPerm;
        }

        g.permissions.push({
          resource: sysPerm.resource,
          action: sysPerm.action,
          label: sysPerm.label,
          description: sysPerm.description,
          roles: roleStates,
        });
      }
    }

    return {
      roles: roles.map(r => ({ id: r.id, name: r.name, code: r.code, isSystem: r.isSystem })),
      groups: Array.from(groupMap.values()),
    };
  }

  async bulkAssignPermissions(
    institutionId: string,
    executorId: string,
    roleId: string,
    assignments: { resource: string; action: string; isAllowed: boolean }[],
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, institutionId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const a of assignments) {
        const actionUpper = a.action.toUpperCase();
        const existing = await tx.permission.findFirst({
          where: { roleId, resource: a.resource, action: actionUpper },
        });

        if (a.isAllowed) {
          if (!existing) {
            await tx.permission.create({
              data: { roleId, resource: a.resource, action: actionUpper },
            });
          }
        } else {
          if (existing) {
            await tx.permission.delete({
              where: { id: existing.id },
            });
          }
        }
      }
    });

    await this.auditLogService.logAction(
      executorId,
      'BULK_ASSIGN_PERMISSIONS',
      `Updated bulk permissions matrix for role ${role.name}`,
    );

    return { success: true };
  }
}
