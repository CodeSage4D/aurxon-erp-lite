import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';
import { AuditLogsModule } from '../Audit/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [SetupController],
  providers: [SetupService],
  exports: [SetupService],
})
export class SetupModule {}
