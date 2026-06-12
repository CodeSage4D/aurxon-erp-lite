import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';
import { AuditLogService } from '../Audit/audit-log.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SetupService {
  private verifiedInstitutions = new Set<string>();

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async ensureInstitutionConfig(institutionId: string) {
    if (!institutionId) return;
    if (this.verifiedInstitutions.has(institutionId)) return;

    try {
      // Fast indexed precheck to skip heavy transaction if institution config is already set up and verified
      const setupStatus = await this.prisma.organizationSetupStatus.findUnique({
        where: { institutionId },
        select: { setupCompleted: true, wizardVersion: true },
      });

      if (setupStatus?.setupCompleted && setupStatus?.wizardVersion === '2.0') {
        this.verifiedInstitutions.add(institutionId);
        return;
      }

      await this.prisma.$transaction(async (tx) => {
        // 1. Fetch the institution to identify the industry pack
        const institution = await tx.institution.findUnique({
          where: { id: institutionId },
          select: { industryPackCode: true, name: true },
        });
        if (!institution) return;

        const packCode = institution.industryPackCode || 'SCHOOL_ERP';

        // 2. Ensure Settings record exists
        let settings = await tx.settings.findUnique({
          where: { institutionId },
        });
        if (!settings) {
          settings = await tx.settings.create({
            data: {
              institutionId,
              academicYear: '2026-2027',
              gradingSystem: packCode === 'SCHOOL_ERP' ? 'CBSE' : 'STANDARD',
              timezone: 'Asia/Kolkata',
              currency: 'INR',
            },
          });
        }

        // 3. Ensure default configuration group and items for academic rules exist
        let settingGroup = await tx.organizationSetting.findFirst({
          where: { organizationId: institutionId, groupCode: 'ACADEMIC_RULES' },
        });
        if (!settingGroup) {
          settingGroup = await tx.organizationSetting.create({
            data: { organizationId: institutionId, groupCode: 'ACADEMIC_RULES' },
          });
        }
        const configs = [
          { key: 'board_affiliation', value: settings.gradingSystem === 'CBSE' ? 'CBSE' : 'STATE_BOARD' },
          { key: 'grading_system', value: settings.gradingSystem },
          { key: 'scholar_number_prefix', value: 'SCH' },
          { key: 'scholar_number_digits', value: '4' },
        ];
        for (const conf of configs) {
          const existing = await tx.configurationItem.findFirst({
            where: { settingId: settingGroup.id, key: conf.key },
          });
          if (!existing) {
            await tx.configurationItem.create({
              data: { settingId: settingGroup.id, key: conf.key, value: conf.value },
            });
          }
        }

        // 4. Ensure at least one Branch exists
        const branchCount = await tx.branch.count({
          where: { institutionId },
        });
        if (branchCount === 0) {
          await tx.branch.create({
            data: {
              institutionId,
              name: 'HQ Branch',
              code: 'HQ',
              phone: '+91-1234567890',
              address: 'Main Campus Street',
              city: 'Kolkata',
              state: 'West Bengal',
              pinCode: '700001',
            },
          });
        }

        // 5. Ensure default AcademicYear exists (Prisma AcademicYear table)
        const academicYearCount = await tx.academicYear.count({
          where: { institutionId },
        });
        if (academicYearCount === 0) {
          await tx.academicYear.create({
            data: {
              institutionId,
              name: '2026-2027',
              startDate: new Date('2026-04-01'),
              endDate: new Date('2027-03-31'),
              isActive: true,
              status: 'ACTIVE',
            },
          });
        }

        // 6. Ensure default Roles and Permissions exist
        const defaultRoles = [
          { roleCode: 'SUPER_ADMIN', roleName: 'Super Admin' },
          { roleCode: 'INSTITUTE_ADMIN', roleName: 'Institute Admin' },
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

        const existingRolesList = await tx.role.findMany({
          where: { institutionId, code: { in: defaultRoles.map(r => r.roleCode) } },
        });

        const existingRolesMap = new Map(existingRolesList.map(r => [r.code, r.id]));
        const roles: Record<string, string> = {};

        for (const roleDef of defaultRoles) {
          let roleId = existingRolesMap.get(roleDef.roleCode);
          if (!roleId) {
            const newRole = await tx.role.create({
              data: {
                name: roleDef.roleName,
                code: roleDef.roleCode,
                isSystem: true,
                institutionId,
              },
            });
            roleId = newRole.id;
          }
          roles[roleDef.roleCode] = roleId;
        }

        // Seed default permissions for roles (Production Implementation Plan V2.1)
        const permissionsTemplate: Record<string, any[]> = {
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

        const roleIds = Object.values(roles);
        const existingPermissions = await tx.permission.findMany({
          where: { roleId: { in: roleIds } },
        });

        const permSet = new Set(
          existingPermissions.map(p => `${p.roleId}:${p.resource}:${p.action}`)
        );

        for (const [roleCode, perms] of Object.entries(permissionsTemplate)) {
          const roleId = roles[roleCode];
          if (roleId && Array.isArray(perms)) {
            for (const p of perms) {
              const key = `${roleId}:${p.resource}:${p.action}`;
              if (!permSet.has(key)) {
                await tx.permission.create({
                  data: {
                    roleId,
                    resource: p.resource,
                    action: p.action,
                  },
                });
              }
            }
          }
        }

        // 7. Ensure setup completed in OrganizationSetupStatus (wizardVersion V2.0)
        // Only mark setupCompleted: true if setupStatus was missing (implies a legacy setup)
        if (!setupStatus) {
          await tx.organizationSetupStatus.upsert({
            where: { institutionId },
            update: {
              wizardVersion: '2.0',
            },
            create: {
              institutionId,
              setupStarted: true,
              setupCompleted: true,
              setupCompletedAt: new Date(),
              currentStep: 5,
              wizardVersion: '2.0',
            },
          });
        }
      }, { maxWait: 120000, timeout: 120000 });
      this.verifiedInstitutions.add(institutionId);
    } catch (err) {
      console.error(`Silent self-healing failed for institution ${institutionId}:`, err);
    }
  }

  async getSetupStatus(institutionId: string) {
    if (!institutionId) {
      return {
        setupCompleted: false,
        currentStep: 1,
        wizardVersion: "2.0",
        industryPackCode: "SCHOOL_ERP",
        steps: {
          academicConfig: false,
          branchConfig: false,
          usersConfig: false,
          modulesConfig: false,
          verificationConfig: false,
        },
        details: {
          academicYear: null,
          gradingSystem: null,
          timezone: null,
          currency: null,
          departments: "",
          branch: null,
          branchesCount: 0,
          modules: [],
          admins: [],
        },
      };
    }

    // Run the Legacy Self Healing repair job silently
    await this.ensureInstitutionConfig(institutionId);

    let status = await this.prisma.organizationSetupStatus.findUnique({
      where: { institutionId },
    });

    if (!status) {
      status = await this.prisma.organizationSetupStatus.create({
        data: {
          institutionId,
          setupStarted: true,
          currentStep: 1,
          setupCompleted: false,
          wizardVersion: "2.0",
        },
      });
    }

    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { industryPackCode: true },
    });

    const industryPackCode = institution?.industryPackCode || 'SCHOOL_ERP';

    const settings = await this.prisma.settings.findUnique({
      where: { institutionId },
    });

    const firstBranch = await this.prisma.branch.findFirst({
      where: { institutionId },
    });

    const branchesCount = await this.prisma.branch.count({
      where: { institutionId },
    });

    // Fetch departments if it's hospital or corporate pack
    let departments = '';
    if (industryPackCode === 'HOSPITAL_ERP' || industryPackCode === 'CORPORATE_ERP') {
      const settingGroup = await this.prisma.organizationSetting.findFirst({
        where: { organizationId: institutionId, groupCode: 'DEPARTMENTS' },
        include: { items: true },
      });
      const deptItem = settingGroup?.items.find(i => i.key === 'departments');
      departments = deptItem?.value || '';
    }

    // Fetch all active modules and sync their status for the step 4 checklist
    const allModules = await this.prisma.module.findMany({
      where: { isActive: true }
    });
    const orgModules = await this.prisma.organizationModule.findMany({
      where: { organizationId: institutionId }
    });

    // Fetch administrative users for step 3
    const adminUsers = await this.prisma.user.findMany({
      where: { institutionId, role: { in: ['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'PRINCIPAL', 'TEACHER'] } },
      select: { id: true, email: true, role: true }
    });

    return {
      setupCompleted: status.setupCompleted,
      currentStep: status.currentStep,
      wizardVersion: status.wizardVersion,
      industryPackCode,
      steps: {
        academicConfig: status.currentStep > 1 || status.setupCompleted,
        branchConfig: status.currentStep > 2 || status.setupCompleted,
        usersConfig: status.currentStep > 3 || status.setupCompleted,
        modulesConfig: status.currentStep > 4 || status.setupCompleted,
        verificationConfig: status.currentStep > 5 || status.setupCompleted,
      },
      details: {
        academicYear: settings?.academicYear || null,
        gradingSystem: settings?.gradingSystem || null,
        timezone: settings?.timezone || null,
        currency: settings?.currency || null,
        departments,
        branch: firstBranch ? {
          name: firstBranch.name,
          code: firstBranch.code,
          phone: firstBranch.phone,
          address: firstBranch.address || '',
          city: firstBranch.city || '',
          state: firstBranch.state || '',
          pinCode: firstBranch.pinCode || '',
        } : null,
        branchesCount,
        modules: allModules.map(m => ({
          code: m.code,
          name: m.name,
          enabled: orgModules.some(om => om.moduleCode === m.code && om.isEnabled)
        })),
        admins: adminUsers.map(u => ({
          email: u.email,
          role: u.role
        }))
      },
    };
  }

  async saveDraft(
    institutionId: string,
    step: number,
    data: {
      academicYear?: string;
      gradingSystem?: string;
      timezone?: string;
      currency?: string;
      departments?: string;
      branch?: {
        name: string;
        code: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pinCode?: string;
      };
      users?: { email: string; name: string; password?: string; role: string }[];
      modules?: string[];
    },
  ) {
    if (!institutionId) {
      throw new BadRequestException('Institution context is missing.');
    }
    
    // Support progression up to 5 steps
    const nextStep = step + 1 > 5 ? 5 : step + 1;
    await this.prisma.organizationSetupStatus.upsert({
      where: { institutionId },
      update: {
        currentStep: nextStep,
        setupStarted: true,
      },
      create: {
        institutionId,
        currentStep: nextStep,
        setupStarted: true,
        setupCompleted: false,
      },
    });

    // Update OrganizationLifecycle.businessState if not already set to Go Live
    const lifecycle = await this.prisma.organizationLifecycle.findUnique({
      where: { institutionId },
    });
    if (lifecycle && lifecycle.businessState !== 'Go Live') {
      await this.prisma.organizationLifecycle.update({
        where: { institutionId },
        data: {
          businessState: 'Setup Running',
          setupStatus: 'RUNNING',
        },
      });
    }

    if (step === 1) {
      if (data.academicYear || data.gradingSystem || data.timezone || data.currency) {
        await this.prisma.settings.upsert({
          where: { institutionId },
          update: {
            academicYear: data.academicYear || '2026-2027',
            gradingSystem: data.gradingSystem || 'CBSE',
            timezone: data.timezone || 'Asia/Kolkata',
            currency: data.currency || 'INR',
          },
          create: {
            institutionId,
            academicYear: data.academicYear || '2026-2027',
            gradingSystem: data.gradingSystem || 'CBSE',
            timezone: data.timezone || 'Asia/Kolkata',
            currency: data.currency || 'INR',
          },
        });
      }

      if (data.departments) {
        let settingGroup = await this.prisma.organizationSetting.findFirst({
          where: { organizationId: institutionId, groupCode: 'DEPARTMENTS' },
        });
        if (!settingGroup) {
          settingGroup = await this.prisma.organizationSetting.create({
            data: { organizationId: institutionId, groupCode: 'DEPARTMENTS' },
          });
        }
        const existing = await this.prisma.configurationItem.findFirst({
          where: { settingId: settingGroup.id, key: 'departments' },
        });
        if (existing) {
          await this.prisma.configurationItem.update({
            where: { id: existing.id },
            data: { value: data.departments },
          });
        } else {
          await this.prisma.configurationItem.create({
            data: { settingId: settingGroup.id, key: 'departments', value: data.departments },
          });
        }
      }
    } else if (step === 2 && data.branch) {
      const branchCodeSanitized = data.branch.code.toUpperCase().trim();
      const existingBranch = await this.prisma.branch.findFirst({
        where: { institutionId, code: branchCodeSanitized },
      });

      if (existingBranch) {
        await this.prisma.branch.update({
          where: { id: existingBranch.id },
          data: {
            name: data.branch.name,
            phone: data.branch.phone,
            address: data.branch.address || '',
            city: data.branch.city || '',
            state: data.branch.state || '',
            pinCode: data.branch.pinCode || '',
          },
        });
      } else {
        await this.prisma.branch.create({
          data: {
            institutionId,
            name: data.branch.name,
            code: branchCodeSanitized,
            phone: data.branch.phone,
            address: data.branch.address || '',
            city: data.branch.city || '',
            state: data.branch.state || '',
            pinCode: data.branch.pinCode || '',
          },
        });
      }
    } else if (step === 3 && data.users && Array.isArray(data.users)) {
      for (const u of data.users) {
        if (!u.email || !u.role) continue;
        const exists = await this.prisma.user.findUnique({ where: { email: u.email } });
        if (!exists) {
          const passwordHash = u.password ? await bcrypt.hash(u.password, 10) : await bcrypt.hash('password123', 10);
          await this.prisma.user.create({
            data: {
              email: u.email,
              passwordHash,
              role: u.role,
              institutionId,
              mustChangePassword: false
            }
          });
        }
      }
    } else if (step === 4 && data.modules && Array.isArray(data.modules)) {
      // Enforce marketplace module activation
      const allModules = await this.prisma.module.findMany();
      for (const mod of allModules) {
        const isEnabled = data.modules.includes(mod.code);
        await this.prisma.organizationModule.upsert({
          where: {
            organizationId_moduleCode: {
              organizationId: institutionId,
              moduleCode: mod.code,
            },
          },
          update: { isEnabled },
          create: {
            organizationId: institutionId,
            moduleCode: mod.code,
            isEnabled,
          },
        });
      }
    }

    return { success: true };
  }

  async submitSetup(
    institutionId: string,
    executorId: string,
    data: {
      academicYear: string;
      gradingSystem: string;
      timezone: string;
      currency: string;
      departments?: string;
      branch: {
        name: string;
        code: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pinCode?: string;
      };
      users?: { email: string; name: string; password?: string; role: string }[];
      modules?: string[];
    },
  ) {
    if (!institutionId) {
      throw new BadRequestException('Institution context is missing.');
    }
    if (!data.branch.name || !data.branch.code) {
      throw new BadRequestException('Required configuration values are missing.');
    }

    // Save step 1 & 2 values
    await this.saveDraft(institutionId, 1, {
      academicYear: data.academicYear,
      gradingSystem: data.gradingSystem,
      timezone: data.timezone,
      currency: data.currency,
      departments: data.departments,
    });

    await this.saveDraft(institutionId, 2, {
      branch: data.branch,
    });

    if (data.users) {
      await this.saveDraft(institutionId, 3, { users: data.users });
    }

    if (data.modules) {
      await this.saveDraft(institutionId, 4, { modules: data.modules });
    }

    // Populate academic rule configs in system DB tables
    let settingGroup = await this.prisma.organizationSetting.findFirst({
      where: { organizationId: institutionId, groupCode: 'ACADEMIC_RULES' },
    });
    if (!settingGroup) {
      settingGroup = await this.prisma.organizationSetting.create({
        data: { organizationId: institutionId, groupCode: 'ACADEMIC_RULES' },
      });
    }

    const configs = [
      { key: 'board_affiliation', value: data.gradingSystem === 'CBSE' ? 'CBSE' : 'STATE_BOARD' },
      { key: 'grading_system', value: data.gradingSystem },
    ];

    for (const conf of configs) {
      const existing = await this.prisma.configurationItem.findFirst({
        where: { settingId: settingGroup.id, key: conf.key },
      });
      if (existing) {
        await this.prisma.configurationItem.update({
          where: { id: existing.id },
          data: { value: conf.value },
        });
      } else {
        await this.prisma.configurationItem.create({
          data: { settingId: settingGroup.id, key: conf.key, value: conf.value },
        });
      }
    }

    // Set persistent state as completed (Step 5)
    await this.prisma.organizationSetupStatus.upsert({
      where: { institutionId },
      update: {
        setupCompleted: true,
        setupCompletedAt: new Date(),
        currentStep: 5,
      },
      create: {
        institutionId,
        setupCompleted: true,
        setupCompletedAt: new Date(),
        currentStep: 5,
        setupStarted: true,
      },
    });

    // Update OrganizationLifecycle state to 'Go Live'
    await this.prisma.organizationLifecycle.upsert({
      where: { institutionId },
      update: {
        setupStatus: 'COMPLETED',
        workspaceStatus: 'ACTIVE',
        businessState: 'Go Live',
      },
      create: {
        institutionId,
        registrationStatus: 'ACTIVATED',
        approvalStatus: 'APPROVED',
        activationStatus: 'ACTIVATED',
        setupStatus: 'COMPLETED',
        workspaceStatus: 'ACTIVE',
        licenseStatus: 'TRIAL',
        subscriptionStatus: 'ACTIVE',
        supportStatus: 'NONE',
        businessState: 'Go Live',
      },
    });

    await this.auditLogService.logAction(
      executorId,
      'COMPLETE_SETUP',
      `Completed organization wizard setup for organization ${institutionId}. Parameters: Year/Fiscal=${data.academicYear}, Grading/Board=${data.gradingSystem}. Branch created: ${data.branch.name} (${data.branch.code.toUpperCase()})`,
    );

    return { success: true };
  }
}
