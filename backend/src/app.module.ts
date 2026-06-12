import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './SHARED/Prisma/prisma.module';
import { TenantStatusMiddleware } from './KERNEL/Authentication/tenant-status.middleware';
import { AuthModule } from './KERNEL/Authentication/auth.module';
import { MarketplaceModule } from './KERNEL/Licensing/module.module';
import { SetupModule } from './KERNEL/Setup/setup.module';
import { StudentModule } from './INDUSTRY_PACKS/SCHOOL/Student/student.module';
import { AttendanceModule } from './INDUSTRY_PACKS/SCHOOL/Attendance/attendance.module';
import { FeeModule } from './INDUSTRY_PACKS/SCHOOL/Fees/FeeStructure/fee.module';
import { ExamModule } from './INDUSTRY_PACKS/SCHOOL/Exams/ExamSetup/exam.module';
import { StaffModule } from './KERNEL/Staff/staff.module';
import { NoticeModule } from './SHARED/Notifications/notice.module';
import { DashboardModule } from './WORKSPACE_ENGINE/Workspace/dashboard.module';
import { ClassModule } from './INDUSTRY_PACKS/SCHOOL/Class/class.module';
import { LessonModule } from './INDUSTRY_PACKS/SCHOOL/Subjects/lesson.module';
import { LibraryModule } from './INDUSTRY_PACKS/SCHOOL/Library/library.module';
import { PayrollModule } from './KERNEL/Finance/payroll.module';
import { VisitorModule } from './SHARED/VisitorManagement/visitor.module';
import { InventoryModule } from './SHARED/Inventory/inventory.module';
import { TimetableModule } from './INDUSTRY_PACKS/SCHOOL/Class/timetable.module';
import { BranchModule } from './KERNEL/Branch/branch.module';
import { SettingsModule } from './KERNEL/Settings/settings.module';
import { NotificationModule } from './SHARED/Notifications/notification.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './SHARED/interceptors/audit-log.interceptor';
import { PerformanceInterceptor } from './SHARED/interceptors/performance.interceptor';
import { UploadModule } from './SHARED/Documents/upload.module';
import { RbacModule } from './KERNEL/Authorization/rbac.module';
import { AuditLogsModule } from './KERNEL/Audit/audit-log.module';
import { InstitutionModule } from './KERNEL/Organization/institution.module';
import { AddressLookupModule } from './SHARED/AddressLookup/address-lookup.module';
import { ParentModule } from './INDUSTRY_PACKS/SCHOOL/Student/parent.module';
import { AcademicYearModule } from './INDUSTRY_PACKS/SCHOOL/AcademicSession/academic-year.module';
import { SubjectModule } from './INDUSTRY_PACKS/SCHOOL/Subjects/subject.module';
import { StaffAttendanceModule } from './KERNEL/Attendance/staff-attendance.module';
import { LeaveModule } from './KERNEL/HR/leave.module';
import { FeesExtendedModule } from './INDUSTRY_PACKS/SCHOOL/Fees/Receipts/fees-extended.module';
import { ReportsAnalyticsModule } from './KERNEL/Reports/reports-analytics.module';
import { DocumentsModule } from './SHARED/Documents/documents.module';
import { OperationsModule } from './KERNEL/Support/operations.module';
import { ProductivityModule } from './SHARED/Productivity/productivity.module';
import { RegistrationModule } from './FOUNDER_OS/Registration/registration.module';
import { ProvisioningModule } from './FOUNDER_OS/Licensing/provisioning.module';
import { BillingModule } from './KERNEL/Billing/billing.module';
import { FounderModule } from './FOUNDER_OS/Founder/founder.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MarketplaceModule,
    SetupModule,
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
    RegistrationModule,
    ProvisioningModule,
    BillingModule,
    FounderModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantStatusMiddleware).forRoutes('*');
  }
}
