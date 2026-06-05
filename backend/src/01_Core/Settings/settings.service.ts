import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findOne(institutionId: string) {
    let settings = await this.prisma.settings.findUnique({
      where: { institutionId },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          institutionId,
          academicYear: '2026-2027',
          gradingSystem: 'CBSE',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        },
      });
    }

    return settings;
  }

  async update(institutionId: string, data: any) {
    const settings = await this.findOne(institutionId);
    return this.prisma.settings.update({
      where: { id: settings.id },
      data: {
        academicYear: data.academicYear,
        gradingSystem: data.gradingSystem,
        timezone: data.timezone,
        currency: data.currency,
      },
    });
  }

  async getOrgConfigs(organizationId: string) {
    return this.prisma.organizationSetting.findMany({
      where: { organizationId },
      include: { items: true },
    });
  }

  async upsertOrgConfig(organizationId: string, groupCode: string, items: Record<string, string>) {
    let setting = await this.prisma.organizationSetting.findFirst({
      where: { organizationId, groupCode },
    });

    if (!setting) {
      setting = await this.prisma.organizationSetting.create({
        data: { organizationId, groupCode },
      });
    }

    const upserts = Object.entries(items).map(async ([key, value]) => {
      const existingItem = await this.prisma.configurationItem.findFirst({
        where: { settingId: setting.id, key },
      });

      if (existingItem) {
        return this.prisma.configurationItem.update({
          where: { id: existingItem.id },
          data: { value },
        });
      } else {
        return this.prisma.configurationItem.create({
          data: { settingId: setting.id, key, value },
        });
      }
    });

    await Promise.all(upserts);

    return this.prisma.organizationSetting.findUnique({
      where: { id: setting.id },
      include: { items: true },
    });
  }
}
