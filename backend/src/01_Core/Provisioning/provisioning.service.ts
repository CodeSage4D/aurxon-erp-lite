import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { encrypt } from '../../common/utils/crypto';

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

    if (registration.status !== 'APPROVED' && registration.status !== 'READY_FOR_PROVISIONING') {
      throw new BadRequestException('Registration must be approved or ready before provisioning');
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
          status: 'ACTIVE', // Kept active for seamless setup, status mapped to LIVE upon activation
          primaryColor: registration.primaryColor || '#0284c7', // Sky-600 or custom primary color
          logoUrl: registration.logoUrl || null,
          industryPackCode: pack.code,
        },
      });

      // Create Custom Branding record
      await tx.organizationBranding.create({
        data: {
          organizationId: institution.id,
          logoUrl: registration.logoUrl || null,
          primaryColor: registration.primaryColor || '#0284c7',
        }
      });

      // 3. Link Institution to Registration
      await tx.organizationRegistration.update({
        where: { id: registrationId },
        data: { institutionId: institution.id },
      });

      // 4. Create default Roles
      let defaultRoles = (pack.defaultRoles as any[]) || [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' }
      ];

      // Merge and auto-create all roles as per Production Implementation Plan V2.1
      if (packCode === 'SCHOOL_ERP') {
        const schoolRoles = [
          { roleCode: 'CHAIRMAN', roleName: 'Chairman' },
          { roleCode: 'PRINCIPAL', roleName: 'Principal' },
          { roleCode: 'VICE_PRINCIPAL', roleName: 'Vice Principal' },
          { roleCode: 'ACADEMIC_COORDINATOR', roleName: 'Academic Coordinator' },
          { roleCode: 'TEACHER', roleName: 'Teacher' },
          { roleCode: 'CLASS_TEACHER', roleName: 'Class Teacher' },
          { roleCode: 'ACCOUNTANT', roleName: 'Accountant' },
          { roleCode: 'HR', roleName: 'HR' },
          { roleCode: 'RECEPTIONIST', roleName: 'Receptionist' },
          { roleCode: 'ADMISSION_OFFICER', roleName: 'Admission Officer' },
          { roleCode: 'TRANSPORT_MANAGER', roleName: 'Transport Manager' },
          { roleCode: 'LIBRARY_MANAGER', roleName: 'Library Manager' },
          { roleCode: 'STUDENT', roleName: 'Student' },
          { roleCode: 'PARENT', roleName: 'Parent' },
          { roleCode: 'DRIVER', roleName: 'Driver' },
          { roleCode: 'SECURITY', roleName: 'Security' },
          { roleCode: 'IT_ADMIN', roleName: 'IT Admin' },
        ];
        const existingCodes = new Set(defaultRoles.map(r => r.roleCode));
        for (const req of schoolRoles) {
          if (!existingCodes.has(req.roleCode)) {
            defaultRoles.push(req);
          }
        }
      }

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
      
      // Auto-assign default permission packs for V2.1
      if (packCode === 'SCHOOL_ERP') {
        const schoolPermissions: Record<string, any[]> = {
          INSTITUTE_ADMIN: [
            { resource: 'student:profile', action: 'CRUD' },
            { resource: 'finance:ledger', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'organization:settings', action: 'CRUD' },
            { resource: 'employee:records', action: 'CRUD' },
            { resource: 'payroll:compensation', action: 'CRUD' }
          ],
          CHAIRMAN: [
            { resource: 'student:profile', action: 'CRUD' },
            { resource: 'finance:ledger', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'organization:settings', action: 'CRUD' },
            { resource: 'employee:records', action: 'CRUD' },
            { resource: 'payroll:compensation', action: 'CRUD' }
          ],
          PRINCIPAL: [
            { resource: 'student:profile', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'finance:ledger', action: 'CRUD' },
            { resource: 'organization:settings', action: 'CRUD' },
            { resource: 'employee:records', action: 'CRUD' },
            { resource: 'payroll:compensation', action: 'CRUD' }
          ],
          VICE_PRINCIPAL: [
            { resource: 'student:profile', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'finance:ledger', action: 'READ' }
          ],
          ACADEMIC_COORDINATOR: [
            { resource: 'student:profile', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'finance:ledger', action: 'READ' }
          ],
          TEACHER: [
            { resource: 'student:profile', action: 'READ' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' }
          ],
          CLASS_TEACHER: [
            { resource: 'student:profile', action: 'READ' },
            { resource: 'attendance:records', action: 'CRUD' },
            { resource: 'exams:setup', action: 'CRUD' }
          ],
          ACCOUNTANT: [
            { resource: 'finance:ledger', action: 'CRUD' },
            { resource: 'payroll:compensation', action: 'CRUD' }
          ],
          HR: [
            { resource: 'employee:records', action: 'CRUD' },
            { resource: 'payroll:compensation', action: 'CRUD' }
          ],
          PARENT: [
            { resource: 'student:profile', action: 'READ' }
          ],
          STUDENT: [
            { resource: 'student:profile', action: 'READ' }
          ]
        };
        for (const [rCode, perms] of Object.entries(schoolPermissions)) {
          permissionsTemplate[rCode] = perms;
        }
      }

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

      // 8.5 Create Activation Key
      let activationKey = '';
      let activationToken = '';
      if (registration.adminPasswordHash) {
        const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
        const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
        const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
        activationKey = `AURX-ACT-${part1}-${part2}-${part3}`;
        const keyHash = crypto.createHash('sha256').update(activationKey).digest('hex');

        activationToken = crypto.randomBytes(48).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(activationToken).digest('hex');

        const pkg = {
          referenceNumber: registration.referenceNumber,
          orgName: registration.orgName,
          industry: packCode,
          subscription: 'TRIAL',
          modules: modulesToEnable,
          features: featuresToEnable,
          activationToken,
          activationKey,
          issueDate: startDate.toISOString(),
          expiryDate: endDate.toISOString(),
          workspaceUrl: `${slug}.aurxon.com`,
          supportContact: 'support@aurxon.com',
        };

        const encryptedPackage = encrypt(JSON.stringify(pkg));

        await tx.activationKey.create({
          data: {
            keyHash,
            encryptedPackage,
            status: 'ACTIVE',
            expiresAt: endDate,
            registrationId: registration.id,
            organizationId: institution.id,
          },
        });

        // Set registration status and token
        await tx.organizationRegistration.update({
          where: { id: registration.id },
          data: {
            status: 'PROVISIONED',
            activationTokenId: tokenHash,
          },
        });
      } else {
        await tx.organizationRegistration.update({
          where: { id: registration.id },
          data: {
            status: 'PROVISIONED',
          },
        });
      }

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

      // 9.5 Create Default Settings table entry (Silent Auto Configuration)
      await tx.settings.create({
        data: {
          institutionId: institution.id,
          academicYear: '2026-2027',
          gradingSystem: packCode === 'SCHOOL_ERP' ? 'CBSE' : 'STANDARD',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        },
      });

      // 9.6 Create Default Branch (Main branch)
      await tx.branch.create({
        data: {
          institutionId: institution.id,
          name: registration.orgName + ' HQ Branch',
          code: 'HQ',
          phone: registration.phone || '+91-1234567890',
          address: registration.address || 'Main Campus Street',
          city: registration.city || 'Kolkata',
          state: registration.state || 'West Bengal',
          pinCode: '700001',
        },
      });

      // 9.7 Create Default Academic Session (AcademicYear table)
      await tx.academicYear.create({
        data: {
          institutionId: institution.id,
          name: '2026-2027',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isActive: true,
          status: 'ACTIVE',
        },
      });

      // 9.8 Create Organization Setup Status (marked setupCompleted = true, version 2.0 to bypass wizard)
      await tx.organizationSetupStatus.create({
        data: {
          institutionId: institution.id,
          setupStarted: true,
          setupCompleted: true,
          setupCompletedAt: new Date(),
          currentStep: 3,
          wizardVersion: '2.0',
        },
      });

      return {
        tenantId: tenant.id,
        institutionId: institution.id,
        slug,
        licenseKey,
        activationKey,
        activationToken,
      };
    }, { timeout: 30000 });
  }
}

