// AURXON ERP Lite — Operations & Pilot UAT Module
// IEEE 42010 compliance architectural wrapper

import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { SubscriptionLimitService } from './subscription-limit.service';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperationsController],
  providers: [OperationsService, SubscriptionLimitService],
  exports: [OperationsService, SubscriptionLimitService],
})
export class OperationsModule {}
