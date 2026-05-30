import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './student/student.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FeeModule } from './fee/fee.module';
import { ExamModule } from './exam/exam.module';
import { StaffModule } from './staff/staff.module';
import { NoticeModule } from './notice/notice.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ClassModule } from './class/class.module';
import { LessonModule } from './lesson/lesson.module';
import { LibraryModule } from './library/library.module';
import { PayrollModule } from './payroll/payroll.module';
import { VisitorModule } from './visitor/visitor.module';
import { InventoryModule } from './inventory/inventory.module';
import { TimetableModule } from './timetable/timetable.module';
import { BranchModule } from './branch/branch.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationModule } from './notification/notification.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { UploadModule } from './upload/upload.module';

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
