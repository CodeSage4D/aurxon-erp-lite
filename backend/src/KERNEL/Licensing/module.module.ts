import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';
import { AuditLogsModule } from '../Audit/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class MarketplaceModule {}
