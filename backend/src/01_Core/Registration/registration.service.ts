import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ProvisioningService } from '../Provisioning/provisioning.service';
import * as crypto from 'crypto';

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
        status: 'PENDING_REVIEW',
      },
    });
    if (pendingReg) {
      throw new BadRequestException('A registration request is already pending for this email address');
    }

    return await this.prisma.organizationRegistration.create({
      data: {
        orgName: dto.orgName.trim(),
        orgType: dto.orgType,
        email: emailLower,
        phone: dto.phone.trim(),
        address: dto.address,
        city: dto.city,
        state: dto.state,
        expectedUsers: dto.expectedUsers || 50,
        requestedModules: dto.requestedModules || [],
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
  async review(id: string, reviewerId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
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

    // For approval, transition status, trigger provisioning, and create activation token
    const result = await this.prisma.$transaction(async (tx) => {
      // Update registration status to APPROVED first
      const updatedReg = await tx.organizationRegistration.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewNotes: notes || 'Approved for provisioning.',
          reviewedById: reviewerId,
          approvedAt: new Date(),
        },
      });

      return updatedReg;
    });

    // Outside transaction, perform the provisioning (since it has complex nesting/transactions inside)
    const provisionResult = await this.provisioningService.provisionTenant(id);

    // Create Activation Token
    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token valid for 7 days

    await this.prisma.activationToken.create({
      data: {
        token: tokenHash,
        registrationId: id,
        expiresAt,
      },
    });

    // Update activation link token pointer (optional, but clean)
    await this.prisma.organizationRegistration.update({
      where: { id },
      data: {
        activationTokenId: tokenHash,
      },
    });

    // Send mock notification to the console or email
    console.log(`[EMAIL SEND OUT MOCK]
To: ${registration.email}
Subject: AURXON ERP - Your Registration Approved
Link: http://localhost:3000/activate/${rawToken}
License Key: ${provisionResult.licenseKey}
Slug: ${provisionResult.slug}
`);

    return {
      registrationId: id,
      status: 'APPROVED',
      activationToken: rawToken, // Return raw token to allow setup in development without real email server
      ...provisionResult,
    };
  }
}
