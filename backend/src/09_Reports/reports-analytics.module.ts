import { Module } from '@nestjs/common';
import { ReportsController } from './ReportsAnalytics/reports-analytics.controller';
import { PrismaModule } from '../01_Core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
})
export class ReportsAnalyticsModule {}
