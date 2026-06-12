import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';
import * as crypto from 'crypto';
import { encrypt } from '../../SHARED/utils/crypto';

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
  async provisionTenant(registrationId: string, paymentStatus: string = 'TRIAL') {
    const registration = await this.prisma.organizationRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new BadRequestException('Registration record not found');
    }

    const allowedStatuses = ['READY_FOR_PROVISIONING', 'APPROVED', 'APPROVED_WITH_CONDITIONS', 'PROVISIONING_FAILED', 'PENDING_REVIEW', 'PROVISIONING'];
    if (!allowedStatuses.includes(registration.status)) {
      throw new BadRequestException(`Registration is not ready for workspace provisioning (status: ${registration.status})`);
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
    
    // Resolve plan structure based on paymentStatus
    const isProd = ['PAID', 'PARTIAL', 'ENTERPRISE'].includes(paymentStatus.toUpperCase());
    const isEnterprise = paymentStatus.toUpperCase() === 'ENTERPRISE';
    const planCode = isEnterprise ? 'ENTERPRISE' : (isProd ? 'PROFESSIONAL' : 'TRIAL');
    const licenseType = isProd ? 'PRODUCTION' : 'TRIAL';
    const expiresDurationDays = isProd ? 365 : 30;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + expiresDurationDays * 24 * 60 * 60 * 1000);

    console.log(`[PROVISIONING] Transaction Started for registration ID: ${registrationId}`);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      console.log(`[PROVISIONING] Step 1: Creating Tenant (Slug: ${slug}, Plan: ${planCode})...`);
      const tenant = await tx.tenant.create({
        data: {
          name: registration.orgName,
          slug,
          status: 'ACTIVE',
          plan: planCode,
        },
      });
      console.log(`[PROVISIONING] Step 1: Tenant created (ID: ${tenant.id}).`);

      // 2. Create Institution
      console.log(`[PROVISIONING] Step 2: Creating Institution and Custom Branding...`);
      const institution = await tx.institution.create({
        data: {
          name: registration.orgName,
          tenantId: tenant.id,
          orgType: registration.orgType,
          status: 'ACTIVE', // Kept active for seamless setup
          primaryColor: registration.primaryColor || '#0284c7',
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
      console.log(`[PROVISIONING] Step 2: Institution and Branding resolved.`);

      // 3. Link Institution to Registration
      console.log(`[PROVISIONING] Step 3: Linking Institution to Registration record...`);
      await tx.organizationRegistration.update({
        where: { id: registrationId },
        data: { institutionId: institution.id },
      });
      console.log(`[PROVISIONING] Step 3: Link updated.`);

      // 4. Create default Roles
      console.log(`[PROVISIONING] Step 4: Seeding default roles...`);
      let defaultRoles = (pack.defaultRoles as any[]) || [
        { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
        { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' }
      ];

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
      console.log(`[PROVISIONING] Step 4: Roles seeded successfully.`);

      // 5. Seed default permissions for roles
      console.log(`[PROVISIONING] Step 5: Seeding default permissions...`);
      const permissionsTemplate = (pack.defaultPermissions as Record<string, any[]>) || {};
      
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
      console.log(`[PROVISIONING] Step 5: Default permissions seeded.`);

      // 6. Activate default modules for pack + requested modules
      console.log(`[PROVISIONING] Step 6: Enabling pack modules & features...`);
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

      // Enable requested features
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
      console.log(`[PROVISIONING] Step 6: Modules and features configuration committed.`);

      // 7. Create Subscription (Plan matches payment selection)
      console.log(`[PROVISIONING] Step 7: Creating Subscription (Plan: ${planCode}, Duration: ${expiresDurationDays} days)...`);
      await tx.subscription.create({
        data: {
          organizationId: institution.id,
          planCode,
          status: 'ACTIVE',
          studentLimit: planCode === 'ENTERPRISE' ? 10000 : (planCode === 'PROFESSIONAL' ? 2000 : 500),
          storageLimitGb: planCode === 'ENTERPRISE' ? 500.0 : (planCode === 'PROFESSIONAL' ? 50.0 : 10.0),
          startDate,
          endDate,
        },
      });
      console.log(`[PROVISIONING] Step 7: Subscription created.`);

      // 8. Generate unified Activation License Key
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const actPrefix = isProd ? 'AURX-LIC-PROD' : 'AURX-LIC-TRIAL';
      const activationKey = `${actPrefix}-${part1}-${part2}-${part3}`;
      const keyHash = crypto.createHash('sha256').update(activationKey).digest('hex');

      console.log(`[PROVISIONING] Step 8: Creating License (Key: ${activationKey}, Type: ${licenseType})...`);
      await tx.license.create({
        data: {
          organizationId: institution.id,
          licenseKey: activationKey,
          licenseType,
          status: 'ACTIVE',
          expiresAt: endDate,
          gracePeriodDays: 14,
        },
      });
      console.log(`[PROVISIONING] Step 8: License created.`);

      // 8.5 Create Activation Key
      let activationToken = '';
      if (registration.adminPasswordHash) {
        activationToken = crypto.randomBytes(48).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(activationToken).digest('hex');

        console.log(`[PROVISIONING] Step 8.5: Storing Activation Key (Key: ${activationKey})...`);
        const pkg = {
          referenceNumber: registration.referenceNumber,
          orgName: registration.orgName,
          industry: packCode,
          subscription: planCode,
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
        console.log(`[PROVISIONING] Step 8.5: Activation Key structure seeded.`);
      } else {
        await tx.organizationRegistration.update({
          where: { id: registration.id },
          data: {
            status: 'PROVISIONED',
          },
        });
      }

      // 9. Create Default Settings
      console.log(`[PROVISIONING] Step 9: Seeding Default Settings...`);
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

      // Create Default Settings table entry (Silent Auto Configuration)
      await tx.settings.create({
        data: {
          institutionId: institution.id,
          academicYear: '2026-2027',
          gradingSystem: packCode === 'SCHOOL_ERP' ? 'CBSE' : 'STANDARD',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        },
      });

      // Create Default Branch (Main branch)
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

      // Create Default Academic Session (AcademicYear table)
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

      // Create Organization Setup Status (marked setupCompleted = false to enforce wizard)
      await tx.organizationSetupStatus.create({
        data: {
          institutionId: institution.id,
          setupStarted: false,
          setupCompleted: false,
          currentStep: 1,
          wizardVersion: '2.0',
        },
      });

      // Initialize OrganizationLifecycle
      await tx.organizationLifecycle.create({
        data: {
          institutionId: institution.id,
          registrationStatus: 'PROVISIONED',
          approvalStatus: 'APPROVED',
          activationStatus: 'INACTIVE',
          setupStatus: 'PENDING',
          workspaceStatus: 'PROVISIONED',
          licenseStatus: planCode === 'TRIAL' ? 'TRIAL' : 'PAID',
          subscriptionStatus: 'ACTIVE',
          supportStatus: 'NONE',
          businessState: 'License Generated',
        },
      });
      console.log(`[PROVISIONING] Step 9: Default configuration completed.`);
      console.log(`[PROVISIONING] Transaction Committed successfully for registration ID: ${registrationId}`);

      return {
        tenantId: tenant.id,
        institutionId: institution.id,
        slug,
        licenseKey: activationKey,
        activationKey,
        activationToken,
      };
    }, { timeout: 30000 });
  }
}

