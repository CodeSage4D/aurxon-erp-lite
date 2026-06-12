import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { RenewalService } from './renewal.service';
import { RenewalController } from './renewal.controller';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BillingService, RenewalService],
  controllers: [BillingController, RenewalController],
  exports: [BillingService, RenewalService],
})
export class BillingModule {}
