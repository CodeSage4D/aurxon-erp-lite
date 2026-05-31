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
import { RbacModule } from './01_Core/RBAC/rbac.module';
import { AuditLogsModule } from './01_Core/AuditLogs/audit-log.module';
import { InstitutionModule } from './01_Core/Institution/institution.module';
import { AddressLookupModule } from './02_Admission/AddressLookup/address-lookup.module';
import { ParentModule } from './02_Admission/ParentProfile/parent.module';
import { AcademicYearModule } from './03_Academics/AcademicYear/academic-year.module';
import { SubjectModule } from './03_Academics/Subject/subject.module';
import { StaffAttendanceModule } from './04_Attendance/StaffAttendance/staff-attendance.module';
import { LeaveModule } from './07_Staff/Leave/leave.module';
import { FeesExtendedModule } from './05_Fees/Receipts/fees-extended.module';
import { ReportsAnalyticsModule } from './09_Reports/reports-analytics.module';
import { DocumentsModule } from './11_Documents/documents.module';
import { OperationsModule } from './01_Core/Operations/operations.module';
import { ProductivityModule } from './15_Productivity/productivity.module';

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
    RbacModule,
    AuditLogsModule,
    InstitutionModule,
    AddressLookupModule,
    ParentModule,
    AcademicYearModule,
    SubjectModule,
    StaffAttendanceModule,
    LeaveModule,
    FeesExtendedModule,
    ReportsAnalyticsModule,
    DocumentsModule,
    OperationsModule,
    ProductivityModule,
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
