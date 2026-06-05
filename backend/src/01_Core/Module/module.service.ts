import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../AuditLogs/audit-log.service';

@Injectable()
export class ModuleService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async getModules() {
    return this.prisma.module.findMany({
      include: { features: true },
    });
  }

  async getOrgModules(organizationId: string) {
    return this.prisma.organizationModule.findMany({
      where: { organizationId },
    });
  }

  async toggleModule(
    organizationId: string,
    executorId: string,
    moduleCode: string,
    isEnabled: boolean,
  ) {
    const registryModule = await this.prisma.module.findUnique({
      where: { code: moduleCode },
    });
    if (!registryModule) {
      throw new NotFoundException(`Module with code ${moduleCode} does not exist in registry.`);
    }

    const existing = await this.prisma.organizationModule.findFirst({
      where: { organizationId, moduleCode },
    });

    if (existing) {
      await this.prisma.organizationModule.update({
        where: { id: existing.id },
        data: { isEnabled },
      });
    } else {
      await this.prisma.organizationModule.create({
        data: { organizationId, moduleCode, isEnabled },
      });
    }

    await this.auditLogService.logAction(
      executorId,
      'TOGGLE_MODULE',
      `${isEnabled ? 'Enabled' : 'Disabled'} module ${moduleCode} for organization ${organizationId}`,
    );

    return { success: true };
  }

  async getFeatures() {
    return this.prisma.feature.findMany({
      include: { module: true },
    });
  }

  async getOrgFeatures(organizationId: string) {
    return this.prisma.organizationFeature.findMany({
      where: { organizationId },
    });
  }

  async toggleFeature(
    organizationId: string,
    executorId: string,
    featureCode: string,
    isEnabled: boolean,
  ) {
    const registryFeature = await this.prisma.feature.findUnique({
      where: { code: featureCode },
    });
    if (!registryFeature) {
      throw new NotFoundException(`Feature with code ${featureCode} does not exist in registry.`);
    }

    const existing = await this.prisma.organizationFeature.findFirst({
      where: { organizationId, featureCode },
    });

    if (existing) {
      await this.prisma.organizationFeature.update({
        where: { id: existing.id },
        data: { isEnabled },
      });
    } else {
      await this.prisma.organizationFeature.create({
        data: { organizationId, featureCode, isEnabled },
      });
    }

    await this.auditLogService.logAction(
      executorId,
      'TOGGLE_FEATURE',
      `${isEnabled ? 'Enabled' : 'Disabled'} feature flag ${featureCode} for organization ${organizationId}`,
    );

    return { success: true };
  }

  async createModule(data: { name: string; code: string; description?: string }) {
    return this.prisma.module.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
      },
    });
  }

  async toggleGlobalModule(code: string, isActive: boolean) {
    const module = await this.prisma.module.findUnique({ where: { code } });
    if (!module) {
      throw new NotFoundException(`Module with code ${code} not found`);
    }
    return this.prisma.module.update({
      where: { code },
      data: { isActive },
    });
  }

  async getModuleUsage() {
    const modules = await this.prisma.module.findMany();
    const usageList: any[] = [];
    for (const m of modules) {
      const count = await this.prisma.organizationModule.count({
        where: { moduleCode: m.code, isEnabled: true },
      });
      usageList.push({
        code: m.code,
        name: m.name,
        isActive: m.isActive,
        organizationCount: count,
      });
    }
    return usageList;
  }
}
