import { Module } from '@nestjs/common';
import { ReportsController } from './ReportsAnalytics/reports-analytics.controller';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
})
export class ReportsAnalyticsModule {}
