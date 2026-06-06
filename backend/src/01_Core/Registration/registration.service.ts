import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ProvisioningService } from '../Provisioning/provisioning.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private provisioningService: ProvisioningService,
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

    // Check if email has a pending registration
    const pendingReg = await this.prisma.organizationRegistration.findFirst({
      where: {
        email: emailLower,
        status: { in: ['PENDING_REVIEW', 'PENDING', 'APPROVED', 'APPROVED_WITH_CONDITIONS', 'READY_FOR_PROVISIONING'] },
      },
    });
    if (pendingReg) {
      throw new BadRequestException('A registration request is already active or pending for this email address');
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

    return await this.prisma.organizationRegistration.create({
      data: {
        referenceNumber,
        orgName: dto.orgName.trim(),
        orgType: dto.orgType,
        email: emailLower,
        phone: dto.phone.trim(),
        address: dto.address || null,
        city: dto.city || null,
        state: dto.state || null,
        expectedUsers: dto.expectedUsers || 50,
        requestedModules: dto.requestedModules || [],
        industryPackCode: dto.industryPackCode || 'SCHOOL_ERP',
        orgSize: dto.orgSize || 'SMALL',
        requestedFeatures: dto.requestedFeatures || [],
        adminName: dto.adminName || null,
        adminPasswordHash,
        logoUrl: dto.logoUrl || null,
        primaryColor: dto.primaryColor || '#0284c7',
        status: 'PENDING_REVIEW',
      },
    });
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
        institution: { select: { id: true, name: true } },
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
      return this.prisma.organizationRegistration.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewNotes: notes || 'Rejected during verification.',
          reviewedById: reviewerId,
          rejectedAt: new Date(),
        },
      });
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
  async provisionWorkspace(id: string, reviewerId: string) {
    const reg = await this.prisma.organizationRegistration.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException('Registration record not found');
    }

    // Allow Founder to bypass and provision directly if APPROVED
    if (reg.status !== 'READY_FOR_PROVISIONING' && reg.status !== 'APPROVED' && reg.status !== 'APPROVED_WITH_CONDITIONS') {
      throw new BadRequestException('Registration is not ready for workspace provisioning');
    }

    const provisionResult = await this.provisioningService.provisionTenant(id);

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'WORKSPACE_PROVISIONING',
        details: `Workspace provisioned for ${reg.orgName} (Slug: ${provisionResult.slug}).`,
      },
    });

    return {
      registrationId: id,
      status: 'PROVISIONED',
      ...provisionResult,
    };
  }
}
