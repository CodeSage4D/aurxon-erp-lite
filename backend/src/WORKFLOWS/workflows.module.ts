import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../SHARED/Prisma/prisma.module';
import { RegistrationWorkflowService } from './registration-workflow.service';
import { ActivationWorkflowService } from './activation-workflow.service';
import { SetupWorkflowService } from './setup-workflow.service';
import { AdmissionWorkflowService } from './admission-workflow.service';
import { EnrollmentWorkflowService } from './enrollment-workflow.service';
import { PromotionWorkflowService } from './promotion-workflow.service';
import { FeeAllocationWorkflowService } from './fee-allocation-workflow.service';
import { AttendanceWorkflowService } from './attendance-workflow.service';
import { ExamWorkflowService } from './exam-workflow.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    RegistrationWorkflowService,
    ActivationWorkflowService,
    SetupWorkflowService,
    AdmissionWorkflowService,
    EnrollmentWorkflowService,
    PromotionWorkflowService,
    FeeAllocationWorkflowService,
    AttendanceWorkflowService,
    ExamWorkflowService,
  ],
  exports: [
    RegistrationWorkflowService,
    ActivationWorkflowService,
    SetupWorkflowService,
    AdmissionWorkflowService,
    EnrollmentWorkflowService,
    PromotionWorkflowService,
    FeeAllocationWorkflowService,
    AttendanceWorkflowService,
    ExamWorkflowService,
  ],
})
export class WorkflowsModule {}
