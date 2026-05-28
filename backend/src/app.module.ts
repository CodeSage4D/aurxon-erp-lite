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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
