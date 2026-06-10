import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ProvisioningService } from '../Provisioning/provisioning.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { NotificationService } from '../../08_Communication/InAppAlerts/notification.service';
import { NotificationCategory } from '@prisma/client';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private provisioningService: ProvisioningService,
    private notifService: NotificationService,
  ) {}

  /**
   * Submit a new registration request.
   */
  async create(dto: CreateRegistrationDto) {
    const emailLower = dto.email.trim().toLowerCase();

    // Check if email already registered as user
    const userExists = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (userExists) {
      throw new BadRequestException('Email is already registered as an active account');
    }

    // Check if a registration request already exists for this email address
    const registrationExists = await this.prisma.organizationRegistration.findUnique({
      where: { email: emailLower },
    });
    if (registrationExists) {
      throw new BadRequestException('A registration request already exists for this email address.');
    }

    // Enforce Password Complexity Check
    if (dto.adminPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(dto.adminPassword)) {
        throw new BadRequestException('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      }
    }

    // Enforce Mobile Phone Verification via OTP
    const otpVerification = await this.prisma.otpVerification.findUnique({
      where: { phone: dto.phone.trim() },
    });
    if (!otpVerification || !otpVerification.verified) {
      throw new BadRequestException('Mobile number has not been verified via OTP. Please verify before submitting.');
    }

    // Generate formatted Reference Number: AURX-YYYY-IND-SEQ
    const year = new Date().getFullYear();
    let ind = 'GEN';
    if (dto.industryPackCode === 'SCHOOL_ERP') ind = 'SCH';
    else if (dto.industryPackCode === 'HOSPITAL_ERP') ind = 'HOS';
    else if (dto.industryPackCode === 'CORPORATE_ERP') ind = 'COR';
    else if (dto.industryPackCode === 'HOTEL_ERP') ind = 'HOT';
    else if (dto.industryPackCode === 'MANUFACTURING_ERP') ind = 'MAN';

    const count = await this.prisma.organizationRegistration.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const seqPadded = String(count + 1).padStart(6, '0');
    const referenceNumber = `AURX-${year}-${ind}-${seqPadded}`;

    // Hash administrator password if provided in the wizard
    let adminPasswordHash: string | null = null;
    if (dto.adminPassword) {
      adminPasswordHash = await argon2.hash(dto.adminPassword);
    }

    const registration = await this.prisma.organizationRegistration.create({
      data: {
        referenceNumber,
        orgName: dto.orgName.trim(),
        orgType: dto.orgType,
        email: emailLower,
        phone: dto.phone.trim(),
        address: dto.address || null,
        city: dto.city || null,
        state: dto.state || null,
        country: dto.country || 'India',
        expectedUsers: dto.expectedUsers || 50,
        requestedModules: dto.requestedModules || [],
        industryPackCode: dto.industryPackCode || 'SCHOOL_ERP',
        orgSize: dto.orgSize || 'SMALL',
        requestedFeatures: dto.requestedFeatures || [],
        adminName: dto.adminName || null,
        adminGender: dto.adminGender || null,
        adminRole: dto.adminRole || null,
        adminPasswordHash,
        logoUrl: dto.logoUrl || null,
        primaryColor: dto.primaryColor || '#0284c7',
        status: 'PENDING_REVIEW',
      },
    });

    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        'New School Registered',
        `${dto.orgName} has submitted registration request ${referenceNumber}.`,
        NotificationCategory.REGISTRATION,
      );
    } catch (err) {
      console.error('Failed to trigger registration notification:', err);
    }

    return registration;
  }

  /**
   * Get all registrations. Used by Platform Founder.
   */
  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.prisma.organizationRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewedBy: { select: { email: true } },
        institution: {
          select: {
            id: true,
            name: true,
            status: true,
            license: true,
          },
        },
        activationKey: {
          select: {
            id: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    });
  }

  /**
   * Review (Approve/Reject) a registration request.
   */
  async review(id: string, reviewerId: string, status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'APPROVED_WITH_CONDITIONS', notes?: string) {
    const registration = await this.prisma.organizationRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration record not found');
    }

    if (registration.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('Registration has already been reviewed');
    }

    if (status === 'REJECTED') {
      const updated = await this.prisma.organizationRegistration.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewNotes: notes || 'Rejected during verification.',
          reviewedById: reviewerId,
          rejectedAt: new Date(),
        },
      });
      try {
        await this.notifService.createSystemNotif(
          'SUPER_ADMIN',
          'Registration Rejected',
          `Registration for ${registration.orgName} has been rejected.`,
          NotificationCategory.APPROVAL,
        );
      } catch (err) {
        console.error(err);
      }
      return updated;
    }

    // Update status to APPROVED or APPROVED_WITH_CONDITIONS
    const result = await this.prisma.organizationRegistration.update({
      where: { id },
      data: {
        status,
        reviewNotes: notes || `Reviewed and ${status.toLowerCase()}.`,
        reviewedById: reviewerId,
        approvedAt: new Date(),
      },
    });

    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        `Registration ${status}`,
        `Registration for ${registration.orgName} has been ${status.toLowerCase()}.`,
        NotificationCategory.APPROVAL,
      );
    } catch (err) {
      console.error(err);
    }

    // BACKWARD COMPATIBILITY GATEWAY:
    // If registration has NO adminPasswordHash (meaning it's legacy/validation-runner signup),
    // we immediately trigger provisioning & activation token generation to prevent breaking existing scenarios.
    if (!registration.adminPasswordHash) {
      const provisionResult = await this.provisioningService.provisionTenant(id);

      const rawToken = crypto.randomBytes(48).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.prisma.activationToken.create({
        data: {
          token: tokenHash,
          registrationId: id,
          expiresAt,
        },
      });

      await this.prisma.organizationRegistration.update({
        where: { id },
        data: {
          activationTokenId: tokenHash,
        },
      });

      console.log(`[EMAIL SEND OUT MOCK]
To: ${registration.email}
Subject: AURXON ERP - Your Registration Approved (Legacy Flow)
Link: http://localhost:3000/activate/${rawToken}
License Key: ${provisionResult.licenseKey}
Slug: ${provisionResult.slug}
`);

      const { activationToken: _ignored, ...restProvision } = provisionResult;
      return {
        registrationId: id,
        status: 'APPROVED',
        activationToken: rawToken,
        ...restProvision,
      };
    }

    // For new wizard flow, we simply return the registration (awaits Platform Team Technical Review)
    return result;
  }

  /**
   * Technical Review / Verification by the Platform Team.
   */
  async technicalReview(id: string, reviewerId: string, notes?: string) {
    const reg = await this.prisma.organizationRegistration.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException('Registration record not found');
    }

    if (reg.status !== 'APPROVED' && reg.status !== 'APPROVED_WITH_CONDITIONS') {
      throw new BadRequestException('Registration must be approved by Founder before technical review');
    }

    const updated = await this.prisma.organizationRegistration.update({
      where: { id },
      data: {
        status: 'READY_FOR_PROVISIONING',
        reviewNotes: notes || 'Technical verification successful. Ready for provisioning.',
      },
    });

    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        'Technical Review Passed',
        `Registration for ${reg.orgName} passed technical review. Ready for provisioning.`,
        NotificationCategory.DEPLOYMENT,
      );
    } catch (err) {
      console.error(err);
    }

    // Log to AuditLog
    await this.prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'TECHNICAL_VERIFICATION',
        details: `Technical verification completed for ${reg.orgName} (Ref: ${reg.referenceNumber}).`,
      },
    });

    return updated;
  }

  /**
   * Triggers the transactional Workspace Provisioning Engine.
   */
  async provisionWorkspace(id: string, reviewerId: string, paymentStatus: string = 'TRIAL', ipAddress?: string) {
    const reg = await this.prisma.organizationRegistration.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException('Registration record not found');
    }

    // 1. Provision Lock
    if (reg.status === 'PROVISIONING') {
      throw new BadRequestException('Workspace provisioning is currently running. Please wait.');
    }

    // 2. Idempotency Check
    if (reg.status === 'PROVISIONED' || reg.status === 'LIVE' || reg.institutionId) {
      const inst = await this.prisma.institution.findUnique({
        where: { id: reg.institutionId! },
        include: { tenant: true, license: true }
      });
      return {
        alreadyProvisioned: true,
        registrationId: id,
        status: reg.status,
        tenantId: inst?.tenantId,
        institutionId: inst?.id,
        slug: inst?.tenant?.slug,
        licenseKey: inst?.license?.licenseKey,
      };
    }

    // Allow Founder to bypass and provision directly if in correct lifecycle state
    const allowedStatuses = ['READY_FOR_PROVISIONING', 'APPROVED', 'APPROVED_WITH_CONDITIONS', 'PROVISIONING_FAILED', 'PENDING_REVIEW'];
    if (!allowedStatuses.includes(reg.status)) {
      throw new BadRequestException(`Registration is not ready for workspace provisioning (status: ${reg.status})`);
    }

    // Acquire lock: set status to PROVISIONING
    await this.prisma.organizationRegistration.update({
      where: { id },
      data: { status: 'PROVISIONING' },
    });

    // Auditing Payment Selection
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: reviewerId,
          action: 'PAYMENT_AUDIT',
          details: `Founder verified payment status: ${paymentStatus} for ${reg.orgName} (Ref: ${reg.referenceNumber}).`,
          ipAddress: ipAddress || null,
        },
      });
    } catch (auditErr) {
      console.error('Failed to log payment audit:', auditErr);
    }

    let provisionResult: any;
    try {
      provisionResult = await this.provisioningService.provisionTenant(id, paymentStatus);
    } catch (err: any) {
      // Revert status to PROVISIONING_FAILED (Failed Provision Queue)
      const errorMsg = err.message || err.toString();
      await this.prisma.organizationRegistration.update({
        where: { id },
        data: {
          status: 'PROVISIONING_FAILED',
          reviewNotes: `Provisioning failed: ${errorMsg}`,
        },
      });
      
      // Log failure in AuditLog
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: reviewerId,
            action: 'WORKSPACE_PROVISIONING_FAILED',
            details: `Workspace provisioning failed for ${reg.orgName}. Error: ${errorMsg}`,
            ipAddress: ipAddress || null,
          },
        });
      } catch (auditErr) {
        console.error('Failed to log failed provisioning audit:', auditErr);
      }

      throw new BadRequestException(`Workspace provisioning failed: ${errorMsg}`);
    }

    // Provision Success: Create Audit Log
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: reviewerId,
          action: 'WORKSPACE_PROVISIONING',
          details: `Workspace provisioned successfully for ${reg.orgName} (Slug: ${provisionResult.slug}) with plan status: ${paymentStatus}.`,
          ipAddress: ipAddress || null,
        },
      });
    } catch (auditErr) {
      console.error('Failed to log provisioning success audit:', auditErr);
    }

    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        'Workspace Provisioned',
        `Workspace for ${reg.orgName} has been provisioned. Slug: ${provisionResult.slug}`,
        NotificationCategory.DEPLOYMENT,
      );
    } catch (err) {
      console.error(err);
    }

    return {
      registrationId: id,
      status: 'PROVISIONED',
      ...provisionResult,
    };
  }

  async sendOtp(phone: string) {
    const cleanPhone = (phone || '').trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new BadRequestException('Please enter a valid mobile number');
    }

    // Generate secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save/Upsert in OtpVerification
    await this.prisma.otpVerification.upsert({
      where: { phone: cleanPhone },
      create: {
        phone: cleanPhone,
        otpCode,
        expiresAt,
        verified: false,
      },
      update: {
        otpCode,
        expiresAt,
        verified: false,
      },
    });

    // Logger & Notification trigger
    console.log(`[VERIFICATION OTP] Generated OTP Code: ${otpCode} for phone: ${cleanPhone}`);
    
    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        'SMS Verification OTP Generated',
        `Simulated SMS: Your verification code is ${otpCode} for mobile number: ${cleanPhone}`,
        NotificationCategory.SYSTEM,
      );
    } catch (err) {
      console.error('Failed to log simulated OTP notification:', err);
    }

    return { success: true, message: 'OTP sent successfully. (Dev-code logged in system notifications)', phone: cleanPhone };
  }

  async verifyOtp(phone: string, otp: string) {
    const cleanPhone = (phone || '').trim();
    const cleanOtp = (otp || '').trim();

    if (!cleanPhone || !cleanOtp) {
      throw new BadRequestException('Phone number and OTP code are required.');
    }

    const verification = await this.prisma.otpVerification.findUnique({
      where: { phone: cleanPhone },
    });

    if (!verification) {
      throw new BadRequestException('No verification request found for this phone number.');
    }

    if (verification.otpCode !== cleanOtp) {
      throw new BadRequestException('Incorrect verification code. Please try again.');
    }

    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    // Update state to verified
    await this.prisma.otpVerification.update({
      where: { phone: cleanPhone },
      data: { verified: true },
    });

    return { success: true, verified: true, message: 'Mobile number verified successfully.' };
  }
}
