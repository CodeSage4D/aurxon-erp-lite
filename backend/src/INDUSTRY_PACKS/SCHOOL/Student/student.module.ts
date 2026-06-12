import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { OperationsModule } from '../../../KERNEL/Support/operations.module';
import { AuditLogsModule } from '../../../KERNEL/Audit/audit-log.module';

@Module({
  imports: [OperationsModule, AuditLogsModule],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule {}
