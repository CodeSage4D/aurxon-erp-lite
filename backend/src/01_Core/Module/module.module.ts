import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../AuditLogs/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class MarketplaceModule {}
