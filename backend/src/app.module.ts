import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './01_Core/prisma/prisma.module';
import { AuthModule } from './01_Core/auth/auth.module';
import { StudentModule } from './02_Admission/student/student.module';
import { AttendanceModule } from './04_Attendance/attendance/attendance.module';
import { FeeModule } from './05_Fees/fee/fee.module';
import { ExamModule } from './06_Exams/exam/exam.module';
import { StaffModule } from './07_Staff/staff/staff.module';
import { NoticeModule } from './08_Communication/notice/notice.module';
import { DashboardModule } from './01_Core/dashboard/dashboard.module';
import { ClassModule } from './03_Academics/class/class.module';
import { LessonModule } from './03_Academics/lesson/lesson.module';
import { LibraryModule } from './14_FutureTrendModules/library/library.module';
import { PayrollModule } from './07_Staff/payroll/payroll.module';
import { VisitorModule } from './14_FutureTrendModules/visitor/visitor.module';
import { InventoryModule } from './14_FutureTrendModules/inventory/inventory.module';
import { TimetableModule } from './03_Academics/timetable/timetable.module';
import { BranchModule } from './01_Core/branch/branch.module';
import { SettingsModule } from './01_Core/settings/settings.module';
import { NotificationModule } from './08_Communication/notification/notification.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { UploadModule } from './02_Admission/upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StudentModule,
    AttendanceModule,
    FeeModule,
    ExamModule,
    StaffModule,
    NoticeModule,
    DashboardModule,
    ClassModule,
    LessonModule,
    LibraryModule,
    PayrollModule,
    VisitorModule,
    InventoryModule,
    TimetableModule,
    BranchModule,
    SettingsModule,
    NotificationModule,
    UploadModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
