import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './01_Core/prisma/prisma.module';
import { AuthModule } from './01_Core/Auth/auth.module';
import { StudentModule } from './02_Admission/StudentProfile/student.module';
import { AttendanceModule } from './04_Attendance/StudentAttendance/attendance.module';
import { FeeModule } from './05_Fees/FeeStructure/fee.module';
import { ExamModule } from './06_Exams/ExamSetup/exam.module';
import { StaffModule } from './07_Staff/StaffProfile/staff.module';
import { NoticeModule } from './08_Communication/Notices/notice.module';
import { DashboardModule } from './01_Core/Dashboard/dashboard.module';
import { ClassModule } from './03_Academics/Class/class.module';
import { LessonModule } from './03_Academics/LessonPlan/lesson.module';
import { LibraryModule } from './14_FutureTrendModules/Library/library.module';
import { PayrollModule } from './07_Staff/Salary/payroll.module';
import { VisitorModule } from './14_FutureTrendModules/VisitorManagement/visitor.module';
import { InventoryModule } from './14_FutureTrendModules/Inventory/inventory.module';
import { TimetableModule } from './13_StudentPortal/Timetable/timetable.module';
import { BranchModule } from './01_Core/Branch/branch.module';
import { SettingsModule } from './01_Core/Settings/settings.module';
import { NotificationModule } from './08_Communication/InAppAlerts/notification.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { UploadModule } from './02_Admission/Documents/upload.module';

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
