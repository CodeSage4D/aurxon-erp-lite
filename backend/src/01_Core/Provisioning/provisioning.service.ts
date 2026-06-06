import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

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

    // Load Industry Pack configuration
    const packCode = registration.industryPackCode || 'SCHOOL_ERP';
    const pack = await this.prisma.industryPack.findUnique({
      where: { code: packCode }
    });
    if (!pack) {
      throw new BadRequestException(`Industry pack ${packCode} not found in catalog.`);
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
          industryPackCode: pack.code,
        },
      });

      // 3. Link Institution to Registration
      await tx.organizationRegistration.update({
        where: { id: registrationId },
        data: { institutionId: institution.id },
      });

      // 4. Create default Roles
      const defaultRoles = (pack.defaultRoles as any[]) || [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' }
      ];

      const roles: Record<string, string> = {};
      for (const roleDef of defaultRoles) {
        const role = await tx.role.create({
          data: {
            name: roleDef.roleName,
            code: roleDef.roleCode,
            isSystem: true,
            institutionId: institution.id,
          },
        });
        roles[roleDef.roleCode] = role.id;
      }

      // 5. Seed default permissions for roles
      const permissionsTemplate = (pack.defaultPermissions as Record<string, any[]>) || {};
      const permissionDataList: any[] = [];
      for (const [roleCode, perms] of Object.entries(permissionsTemplate)) {
        const roleId = roles[roleCode];
        if (roleId && Array.isArray(perms)) {
          for (const p of perms) {
            permissionDataList.push({
              roleId,
              resource: p.resource,
              action: p.action,
            });
          }
        }
      }
      if (permissionDataList.length > 0) {
        await tx.permission.createMany({
          data: permissionDataList,
        });
      }

      // 6. Activate default modules for pack + requested modules
      const modulesToEnable = Array.from(
        new Set([...(pack.defaultModules || []), ...(registration.requestedModules || [])]),
      );

      if (modulesToEnable.length > 0) {
        const modulesInDb = await tx.module.findMany({
          where: { code: { in: modulesToEnable } },
          select: { code: true }
        });
        const validModuleCodes = modulesInDb.map(m => m.code);
        if (validModuleCodes.length > 0) {
          await tx.organizationModule.createMany({
            data: validModuleCodes.map(mCode => ({
              organizationId: institution.id,
              moduleCode: mCode,
              isEnabled: true,
            })),
          });
        }
      }

      // 6.5 Activate requested features
      const featuresToEnable = registration.requestedFeatures || [];
      if (featuresToEnable.length > 0) {
        const featuresInDb = await tx.feature.findMany({
          where: { code: { in: featuresToEnable } },
          select: { code: true }
        });
        const validFeatureCodes = featuresInDb.map(f => f.code);
        if (validFeatureCodes.length > 0) {
          await tx.organizationFeature.createMany({
            data: validFeatureCodes.map(fCode => ({
              organizationId: institution.id,
              featureCode: fCode,
              isEnabled: true,
            })),
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
      const licenseKey = `LIC-TRIAL-${slug.toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

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
    }, { timeout: 30000 });
  }
}
