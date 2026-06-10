import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './01_Core/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'Healthy';
    let provStatus = 'Healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = 'Critical';
    }

    try {
      const packCount = await this.prisma.industryPack.count();
      if (packCount === 0) provStatus = 'Warning';
    } catch (err) {
      provStatus = 'Critical';
    }

    const overall = (dbStatus === 'Critical' || provStatus === 'Critical') ? 'Critical' : 'Healthy';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      details: {
        database: dbStatus,
        provisioning: provStatus,
      }
    };
  }

  @Get('health/detailed')
  async getDetailedHealth() {
    let dbStatus = 'Healthy';
    let dbLatencyMs = 0;
    let regStatus = 'Healthy';
    let provStatus = 'Healthy';
    let notifStatus = 'Healthy';
    let licStatus = 'Healthy';
    let founderStatus = 'Healthy';

    // 1. Database & Latency
    const startDb = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startDb;
    } catch (err) {
      dbStatus = 'Critical';
      dbLatencyMs = -1;
    }

    // 2. Registration
    try {
      await this.prisma.organizationRegistration.count();
    } catch (err) {
      regStatus = 'Warning';
    }

    // 3. Provisioning
    try {
      const packCount = await this.prisma.industryPack.count();
      if (packCount === 0) provStatus = 'Warning';
    } catch (err) {
      provStatus = 'Critical';
    }

    // 4. Notification
    try {
      await this.prisma.notification.count();
    } catch (err) {
      notifStatus = 'Warning';
    }

    // 5. License
    try {
      await this.prisma.license.count();
    } catch (err) {
      licStatus = 'Warning';
    }

    // 6. Founder
    try {
      await this.prisma.aurxonTeamMember.count();
    } catch (err) {
      founderStatus = 'Warning';
    }

    const overall = (dbStatus === 'Critical' || provStatus === 'Critical') 
      ? 'Critical' 
      : (regStatus === 'Warning' || notifStatus === 'Warning' || licStatus === 'Warning' || founderStatus === 'Warning')
        ? 'Warning'
        : 'Healthy';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      metrics: {
        dbLatencyMs,
        uptimeSeconds: Math.floor(process.uptime()),
      },
      details: {
        database: { status: dbStatus, latency: `${dbLatencyMs}ms` },
        registration: { status: regStatus },
        provisioning: { status: provStatus },
        notification: { status: notifStatus },
        license: { status: licStatus },
        founder: { status: founderStatus },
      }
    };
  }
}
