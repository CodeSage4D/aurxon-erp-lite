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
}
