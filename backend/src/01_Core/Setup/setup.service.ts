import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../AuditLogs/audit-log.service';

@Injectable()
export class SetupService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async getSetupStatus(institutionId: string) {
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

    return {
      setupCompleted: status.setupCompleted,
      currentStep: status.currentStep,
      wizardVersion: status.wizardVersion,
      industryPackCode,
      steps: {
        academicConfig: status.currentStep > 1 || status.setupCompleted,
        branchConfig: status.currentStep > 2 || status.setupCompleted,
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
    },
  ) {
    const nextStep = step + 1 > 3 ? 3 : step + 1;
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
    },
  ) {
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

    // Set persistent state as completed
    await this.prisma.organizationSetupStatus.upsert({
      where: { institutionId },
      update: {
        setupCompleted: true,
        setupCompletedAt: new Date(),
        currentStep: 3,
      },
      create: {
        institutionId,
        setupCompleted: true,
        setupCompletedAt: new Date(),
        currentStep: 3,
        setupStarted: true,
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
