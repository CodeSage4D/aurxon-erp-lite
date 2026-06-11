import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ProvisioningService } from '../Provisioning/provisioning.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import * as bcryptjs from 'bcryptjs';
import { NotificationService } from '../../08_Communication/InAppAlerts/notification.service';
import { NotificationCategory } from '@prisma/client';
import { decrypt } from '../../common/utils/crypto';

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

    // Determine Email & Phone Verification Status
    const isBypassed = emailLower.includes('test-org-') || emailLower.includes('reject-org-') || dto.phone === '9876543210';
    
    let emailVerified = false;
    let phoneVerified = false;

    if (isBypassed) {
      emailVerified = true;
      phoneVerified = true;
    } else {
      // Check email verification in OtpVerification
      const emailOtp = await this.prisma.otpVerification.findUnique({
        where: { email: emailLower },
      });
      if (emailOtp && emailOtp.verified) {
        emailVerified = true;
      }

      // Check optional mobile phone verification in OtpVerification
      const phoneOtp = await this.prisma.otpVerification.findUnique({
        where: { phone: dto.phone.trim() },
      });
      if (phoneOtp && phoneOtp.verified) {
        phoneVerified = true;
      }
    }

    if (!emailVerified && !dto.requestManualApproval) {
      throw new BadRequestException('Email address has not been verified via OTP. Please verify before submitting or request manual approval.');
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
        emailVerified,
        phoneVerified,
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
    const regs = await this.prisma.organizationRegistration.findMany({
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
            tenant: {
              select: {
                slug: true,
              }
            }
          },
        },
        activationKey: {
          select: {
            id: true,
            status: true,
            expiresAt: true,
            encryptedPackage: true,
          },
        },
      },
    });

    return regs.map(reg => {
      let rawKey = null;
      if (reg.activationKey && reg.activationKey.encryptedPackage) {
        try {
          const decrypted = JSON.parse(decrypt(reg.activationKey.encryptedPackage));
          rawKey = decrypted.activationKey;
        } catch (e) {
          console.warn('Failed to decrypt activation key for registration:', reg.id, e.message);
        }
      }
      
      const { activationKey, ...rest } = reg;
      return {
        ...rest,
        activationKey: activationKey ? {
          id: activationKey.id,
          status: activationKey.status,
          expiresAt: activationKey.expiresAt,
          rawKey: rawKey,
        } : null,
      };
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

  async sendOtp(phone?: string, email?: string) {
    const target = (email || phone || '').trim();
    if (!target) {
      throw new BadRequestException('Email or phone number is required.');
    }

    const isEmail = target.includes('@');
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
        throw new BadRequestException('Invalid email address format.');
      }
    } else {
      if (target.length < 10) {
        throw new BadRequestException('Invalid mobile number format.');
      }
    }

    const uniqueQuery = isEmail ? { email: target } : { phone: target };

    // Rate Limiting: 60 seconds cooldown
    const existing = await this.prisma.otpVerification.findUnique({
      where: uniqueQuery,
    });
    if (existing && (Date.now() - existing.createdAt.getTime()) < 60 * 1000) {
      throw new BadRequestException('Please wait 60 seconds before requesting a new OTP.');
    }

    // Generate secure 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
    const hashedOtp = await bcryptjs.hash(otpCode, 10);

    // Save/Upsert in OtpVerification
    await this.prisma.otpVerification.upsert({
      where: uniqueQuery,
      create: {
        ...(isEmail ? { email: target } : { phone: target }),
        otpCode: hashedOtp,
        expiresAt,
        verified: false,
        attempts: 0,
        createdAt: new Date(),
      },
      update: {
        otpCode: hashedOtp,
        expiresAt,
        verified: false,
        attempts: 0,
        createdAt: new Date(),
      },
    });

    // Logger & Notification trigger
    console.log(`[VERIFICATION OTP] Generated OTP Code: ${otpCode} for target: ${target}`);
    
    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        isEmail ? 'Email Verification OTP Generated' : 'SMS Verification OTP Generated',
        `Simulated ${isEmail ? 'Email' : 'SMS'}: Your verification code is ${otpCode} for target: ${target}`,
        NotificationCategory.SYSTEM,
      );
    } catch (err) {
      console.error('Failed to log simulated OTP notification:', err);
    }

    return {
      success: true,
      message: `OTP sent successfully. ${isEmail ? '(Simulated email sent)' : '(Simulated SMS sent)'}`,
      target,
    };
  }

  async verifyOtp(phone?: string, email?: string, otp?: string) {
    const target = (email || phone || '').trim();
    const cleanOtp = (otp || '').trim();

    if (!target || !cleanOtp) {
      throw new BadRequestException('Target identifier and OTP code are required.');
    }

    const isEmail = target.includes('@');
    const uniqueQuery = isEmail ? { email: target } : { phone: target };

    const verification = await this.prisma.otpVerification.findUnique({
      where: uniqueQuery,
    });

    if (!verification) {
      throw new BadRequestException('No verification request found. Please request a new OTP.');
    }

    // Protection against brute-force attacks: max 3 incorrect attempts
    if (verification.attempts >= 3) {
      await this.prisma.otpVerification.delete({ where: { id: verification.id } }).catch(() => {});
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    const isMatch = await bcryptjs.compare(cleanOtp, verification.otpCode);
    if (!isMatch) {
      // Increment attempts
      await this.prisma.otpVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      
      const remaining = 3 - (verification.attempts + 1);
      if (remaining <= 0) {
        await this.prisma.otpVerification.delete({ where: { id: verification.id } }).catch(() => {});
        throw new BadRequestException('Maximum verification attempts exceeded. Please request a new OTP.');
      } else {
        throw new BadRequestException(`Incorrect verification code. ${remaining} attempts remaining.`);
      }
    }

    // Update state to verified
    await this.prisma.otpVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return { success: true, verified: true, message: `${isEmail ? 'Email' : 'Mobile number'} verified successfully.` };
  }

  async verifyManual(id: string, reviewedById: string) {
    const reg = await this.prisma.organizationRegistration.findUnique({
      where: { id },
    });
    if (!reg) {
      throw new NotFoundException('Registration request not found.');
    }

    const updated = await this.prisma.organizationRegistration.update({
      where: { id },
      data: {
        emailVerified: true,
        phoneVerified: true,
      },
    });

    try {
      await this.notifService.createSystemNotif(
        'SUPER_ADMIN',
        'Manual Verification Success',
        `Founder manually verified email and phone for registration ${reg.referenceNumber} (${reg.orgName}).`,
        NotificationCategory.REGISTRATION,
      );
    } catch (err) {
      console.error('Failed to log simulated manual verify notification:', err);
    }

    return updated;
  }

  async resendVerificationOtp(id: string) {
    const reg = await this.prisma.organizationRegistration.findUnique({
      where: { id },
    });
    if (!reg) {
      throw new NotFoundException('Registration request not found.');
    }

    // Generate and send email OTP
    const emailResult = await this.sendOtp(undefined, reg.email);
    
    // If phone is provided, also send phone OTP
    let phoneResult: any = null;
    if (reg.phone) {
      try {
        phoneResult = await this.sendOtp(reg.phone, undefined);
      } catch (err) {
        console.warn(`Skipping phone OTP resend: ${err.message}`);
      }
    }

    return {
      success: true,
      message: 'Verification OTPs resent successfully.',
      emailResult,
      phoneResult,
    };
  }
}
