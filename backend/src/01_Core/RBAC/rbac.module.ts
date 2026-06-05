import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../AuditLogs/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
