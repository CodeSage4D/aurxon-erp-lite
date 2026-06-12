import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Injectable()
export class SubscriptionLimitService {
  constructor(private prisma: PrismaService) {}

  async checkLimits(
    organizationId: string,
    type: 'STUDENTS' | 'STORAGE',
    incrementAmount = 1,
  ): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: 'No active subscription found for this organization.',
          error: 'SUB_MISSING',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (subscription.status !== 'ACTIVE' && subscription.status !== 'GRACE_PERIOD') {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: `Subscription status is ${subscription.status.replace(/_/g, ' ')}. Access is restricted.`,
          error: 'SUB_INACTIVE',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (new Date(subscription.endDate) < new Date()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: 'Your institutional subscription has expired. Please renew to continue.',
          error: 'SUB_EXPIRED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (type === 'STUDENTS') {
      const activeStudents = await this.prisma.student.count({
        where: {
          institutionId: organizationId,
          status: 'ACTIVE',
        },
      });

      if (activeStudents + incrementAmount > subscription.studentLimit) {
        throw new HttpException(
          {
            statusCode: HttpStatus.PAYMENT_REQUIRED,
            message: `Student limit exceeded. Your current tier supports up to ${subscription.studentLimit} students. Enrolled: ${activeStudents}.`,
            error: 'STUDENT_LIMIT_EXCEEDED',
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }

    if (type === 'STORAGE') {
      // Mock storage calculation for now (MVP phase)
      const allocatedStorageGb = 5.0; // Mock calculation
      if (allocatedStorageGb + incrementAmount > subscription.storageLimitGb) {
        throw new HttpException(
          {
            statusCode: HttpStatus.PAYMENT_REQUIRED,
            message: `Storage limit exceeded. Allowed: ${subscription.storageLimitGb} GB. Current: ${allocatedStorageGb} GB.`,
            error: 'STORAGE_LIMIT_EXCEEDED',
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }

    return true;
  }

  async getSubscriptionDetails(organizationId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });
    if (!sub) return null;

    const enrolledStudents = await this.prisma.student.count({
      where: { institutionId: organizationId, status: 'ACTIVE' },
    });

    const activeLicense = await this.prisma.license.findUnique({
      where: { organizationId },
    });

    return {
      planCode: sub.planCode,
      status: sub.status,
      studentLimit: sub.studentLimit,
      studentUsage: enrolledStudents,
      storageLimitGb: sub.storageLimitGb,
      storageUsageGb: 5.0, // Mock usage
      endDate: sub.endDate,
      licenseKey: activeLicense?.licenseKey || null,
      licenseStatus: activeLicense?.status || null,
    };
  }
}
