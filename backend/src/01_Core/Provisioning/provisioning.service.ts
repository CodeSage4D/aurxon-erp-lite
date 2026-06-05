import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvisioningService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a unique tenant slug based on organization name.
   */
  private async generateUniqueSlug(orgName: string): Promise<string> {
    const baseSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug || 'tenant';
    let counter = 1;
    
    while (true) {
      const existing = await this.prisma.tenant.findUnique({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Transactionally provisions a new Tenant and its associated resources.
   */
  async provisionTenant(registrationId: string) {
    const registration = await this.prisma.organizationRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new BadRequestException('Registration record not found');
    }

    if (registration.status !== 'APPROVED') {
      throw new BadRequestException('Registration must be approved before provisioning');
    }

    if (registration.institutionId) {
      throw new BadRequestException('Organization has already been provisioned');
    }

    const slug = await this.generateUniqueSlug(registration.orgName);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: registration.orgName,
          slug,
          status: 'ACTIVE',
          plan: 'TRIAL',
        },
      });

      // 2. Create Institution
      const institution = await tx.institution.create({
        data: {
          name: registration.orgName,
          tenantId: tenant.id,
          orgType: registration.orgType,
          status: 'ACTIVE',
          primaryColor: '#0284c7', // sky-600 default
        },
      });

      // 3. Link Institution to Registration
      await tx.organizationRegistration.update({
        where: { id: registrationId },
        data: { institutionId: institution.id },
      });

      // 4. Create default Roles
      const defaultRoles = [
        { code: 'SUPER_ADMIN', name: 'Super Admin', isSystem: true },
        { code: 'INSTITUTE_ADMIN', name: 'Institute Admin', isSystem: true },
        { code: 'PRINCIPAL', name: 'Principal', isSystem: true },
        { code: 'TEACHER', name: 'Teacher', isSystem: true },
        { code: 'STAFF', name: 'Staff', isSystem: true },
        { code: 'ACCOUNTANT', name: 'Accountant', isSystem: true },
        { code: 'STUDENT', name: 'Student', isSystem: true },
        { code: 'PARENT', name: 'Parent / Guardian', isSystem: true },
      ];

      const roles: Record<string, string> = {};
      for (const roleDef of defaultRoles) {
        const role = await tx.role.create({
          data: {
            name: roleDef.name,
            code: roleDef.code,
            isSystem: roleDef.isSystem,
            institutionId: institution.id,
          },
        });
        roles[roleDef.code] = role.id;
      }

      // 5. Seed default permissions for roles
      const defaultPermissions = [
        // INSTITUTE_ADMIN gets CRUD permissions on all student, finance, exams, and attendance logs
        { roleCode: 'INSTITUTE_ADMIN', resource: 'student:profile', action: 'CRUD' },
        { roleCode: 'INSTITUTE_ADMIN', resource: 'finance:ledger', action: 'CRUD' },
        { roleCode: 'INSTITUTE_ADMIN', resource: 'exams:setup', action: 'CRUD' },
        { roleCode: 'INSTITUTE_ADMIN', resource: 'attendance:records', action: 'CRUD' },
        { roleCode: 'INSTITUTE_ADMIN', resource: 'organization:settings', action: 'CRUD' },

        // PRINCIPAL gets similar broad permissions
        { roleCode: 'PRINCIPAL', resource: 'student:profile', action: 'CRUD' },
        { roleCode: 'PRINCIPAL', resource: 'exams:setup', action: 'CRUD' },
        { roleCode: 'PRINCIPAL', resource: 'attendance:records', action: 'CRUD' },
        { roleCode: 'PRINCIPAL', resource: 'finance:ledger', action: 'READ' },

        // TEACHER gets read permissions for profiles, CRUD for attendance/exams
        { roleCode: 'TEACHER', resource: 'student:profile', action: 'READ' },
        { roleCode: 'TEACHER', resource: 'attendance:records', action: 'CRUD' },
        { roleCode: 'TEACHER', resource: 'exams:setup', action: 'CRUD' },

        // STAFF gets read on students and write on attendance
        { roleCode: 'STAFF', resource: 'student:profile', action: 'READ' },
        { roleCode: 'STAFF', resource: 'attendance:records', action: 'CRUD' },

        // ACCOUNTANT gets CRUD finance
        { roleCode: 'ACCOUNTANT', resource: 'finance:ledger', action: 'CRUD' },
        { roleCode: 'ACCOUNTANT', resource: 'student:profile', action: 'READ' },
      ];

      for (const p of defaultPermissions) {
        const roleId = roles[p.roleCode];
        if (roleId) {
          await tx.permission.create({
            data: {
              roleId,
              resource: p.resource,
              action: p.action,
            },
          });
        }
      }

      // 6. Activate Requested Modules
      // Ensure STUDENT_MANAGEMENT is always enabled as foundation module
      const modulesToEnable = Array.from(
        new Set(['STUDENT_MANAGEMENT', ...(registration.requestedModules || [])]),
      );

      for (const mCode of modulesToEnable) {
        const module = await tx.module.findUnique({ where: { code: mCode } });
        if (module) {
          await tx.organizationModule.create({
            data: {
              organizationId: institution.id,
              moduleCode: mCode,
              isEnabled: true,
            },
          });
        }
      }

      // 7. Create Trial Subscription
      const trialDurationDays = 30;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + trialDurationDays * 24 * 60 * 60 * 1000);

      await tx.subscription.create({
        data: {
          organizationId: institution.id,
          planCode: 'TRIAL',
          status: 'ACTIVE',
          studentLimit: 500,
          storageLimitGb: 10.0,
          startDate,
          endDate,
        },
      });

      // 8. Create Trial License
      const licenseKey = `LIC-TRIAL-${slug.toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      await tx.license.create({
        data: {
          organizationId: institution.id,
          licenseKey,
          licenseType: 'TRIAL',
          status: 'ACTIVE',
          expiresAt: endDate,
          gracePeriodDays: 14,
        },
      });

      // 9. Create Default Settings
      const setting = await tx.organizationSetting.create({
        data: {
          organizationId: institution.id,
          groupCode: 'ACADEMIC_RULES',
        },
      });

      await tx.configurationItem.createMany({
        data: [
          { settingId: setting.id, key: 'board_affiliation', value: 'CBSE' },
          { settingId: setting.id, key: 'grading_system', value: 'CCE_100_MARK_PERCENT' },
          { settingId: setting.id, key: 'scholar_number_prefix', value: 'SCH' },
          { settingId: setting.id, key: 'scholar_number_digits', value: '4' },
        ],
      });

      return {
        tenantId: tenant.id,
        institutionId: institution.id,
        slug,
        licenseKey,
      };
    });
  }
}
