import { Module } from '@nestjs/common';
import { PlatformMetricsService } from './platform-metrics.service';
import { FounderController } from './founder.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../Auth/auth.module'; // To resolve JwtModule dependency for signing impersonation tokens
import { BillingModule } from '../Billing/billing.module';

@Module({
  imports: [PrismaModule, AuthModule, BillingModule],
  providers: [PlatformMetricsService],
  controllers: [FounderController],
  exports: [PlatformMetricsService],
})
export class FounderModule {}
