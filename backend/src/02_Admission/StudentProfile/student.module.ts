import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { OperationsModule } from '../../01_Core/Operations/operations.module';
import { AuditLogsModule } from '../../01_Core/AuditLogs/audit-log.module';

@Module({
  imports: [OperationsModule, AuditLogsModule],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule {}
