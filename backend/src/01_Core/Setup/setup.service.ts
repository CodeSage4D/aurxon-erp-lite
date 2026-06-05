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
    const settings = await this.prisma.settings.findUnique({
      where: { institutionId },
    });

    const branchesCount = await this.prisma.branch.count({
      where: { institutionId },
    });

    const setupCompleted = !!(settings && settings.academicYear && branchesCount > 0);

    return {
      setupCompleted,
      steps: {
        academicConfig: !!settings,
        branchConfig: branchesCount > 0,
      },
      details: {
        academicYear: settings?.academicYear || null,
        gradingSystem: settings?.gradingSystem || null,
        timezone: settings?.timezone || null,
        currency: settings?.currency || null,
        branchesCount,
      },
    };
  }

  async submitSetup(
    institutionId: string,
    executorId: string,
    data: {
      academicYear: string;
      gradingSystem: string;
      timezone: string;
      currency: string;
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
    if (!data.academicYear || !data.gradingSystem || !data.branch.name || !data.branch.code) {
      throw new BadRequestException('Required configuration values are missing.');
    }

    await this.prisma.settings.upsert({
      where: { institutionId },
      update: {
        academicYear: data.academicYear,
        gradingSystem: data.gradingSystem,
        timezone: data.timezone,
        currency: data.currency,
      },
      create: {
        institutionId,
        academicYear: data.academicYear,
        gradingSystem: data.gradingSystem,
        timezone: data.timezone,
        currency: data.currency,
      },
    });

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

    const branchCodeSanitized = data.branch.code.toUpperCase().trim();
    const existingBranch = await this.prisma.branch.findFirst({
      where: { institutionId, code: branchCodeSanitized },
    });

    if (!existingBranch) {
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

    await this.auditLogService.logAction(
      executorId,
      'COMPLETE_SETUP',
      `Completed organization wizard setup for organization ${institutionId}. Parameters: Year=${data.academicYear}, Grading=${data.gradingSystem}. Branch created: ${data.branch.name} (${branchCodeSanitized})`,
    );

    return { success: true };
  }
}
