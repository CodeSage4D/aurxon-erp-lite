import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';
import { encrypt, decrypt } from '../../SHARED/utils/crypto';
import * as crypto from 'crypto';

@Injectable()
export class RenewalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit a renewal request (called by org admin).
   */
  async requestRenewal(institutionId: string, months: number, notes?: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: { subscription: true },
    });

    if (!institution) {
      throw new NotFoundException('Organization not found');
    }

    // Check for existing pending renewal request
    const existing = await this.prisma.renewalRequest.findFirst({
      where: { organizationId: institutionId, status: 'PENDING' },
    });

    if (existing) {
      throw new BadRequestException('A renewal request is already pending for this organization');
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.renewalRequest.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const referenceNumber = `AURX-REN-${year}-${String(count + 1).padStart(4, '0')}`;

    const request = await this.prisma.renewalRequest.create({
      data: {
        referenceNumber,
        organizationId: institutionId,
        requestedMonths: months || 12,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    return request;
  }

  /**
   * List all renewal requests (Founder/Platform Team).
   */
  async listRenewalRequests(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.renewalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        institution: { select: { id: true, name: true, status: true } },
        renewalKey: { select: { id: true, status: true, expiresAt: true } },
      },
    });
  }

  /**
   * Approve a renewal request and generate an encrypted Renewal Key.
   * Accessible by Founders and Platform Directors.
   * Founder override: can also generate keys without a pending request.
   */
  async approveAndGenerateKey(renewalRequestId: string, approvedById: string) {
    const request = await this.prisma.renewalRequest.findUnique({
      where: { id: renewalRequestId },
      include: { institution: { include: { subscription: true } } },
    });

    if (!request) {
      throw new NotFoundException('Renewal request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Renewal request has already been processed');
    }

    const institution = request.institution;
    const currentSub = institution.subscription;

    // Determine new expiry: extend from current end date or from now
    const baseDate = currentSub?.endDate && new Date(currentSub.endDate) > new Date()
      ? new Date(currentSub.endDate)
      : new Date();

    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + request.requestedMonths);

    // Generate raw renewal key
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const rawKey = `AURX-REN-${part1}-${part2}-${part3}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Build encrypted renewal package
    const pkg = {
      renewalRequestId: request.id,
      referenceNumber: request.referenceNumber,
      organizationId: institution.id,
      orgName: institution.name,
      requestedMonths: request.requestedMonths,
      newEndDate: newEndDate.toISOString(),
      issueDate: new Date().toISOString(),
      approvedBy: approvedById,
    };
    const encryptedPackage = encrypt(JSON.stringify(pkg));

    // Key expires in 30 days if not applied
    const keyExpiresAt = new Date();
    keyExpiresAt.setDate(keyExpiresAt.getDate() + 30);

    return await this.prisma.$transaction(async (tx) => {
      const renewalKey = await tx.renewalKey.create({
        data: {
          keyHash,
          encryptedPackage,
          status: 'ACTIVE',
          expiresAt: keyExpiresAt,
          renewalRequestId: request.id,
        },
      });

      await tx.renewalRequest.update({
        where: { id: request.id },
        data: { status: 'APPROVED', renewalKeyId: renewalKey.id },
      });

      await tx.auditLog.create({
        data: {
          userId: approvedById,
          action: 'RENEWAL_KEY_GENERATED',
          details: `Renewal key generated for ${institution.name} (Ref: ${request.referenceNumber}). Extends by ${request.requestedMonths} months.`,
        },
      });

      return {
        renewalKey: rawKey,
        referenceNumber: request.referenceNumber,
        expiresAt: keyExpiresAt,
        newEndDate,
      };
    });
  }

  /**
   * Founder-direct renewal key generation (override — no pending request required).
   * Creates a renewal request on the fly and generates the key immediately.
   */
  async founderDirectRenewal(institutionId: string, months: number, founderId: string, notes?: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: { subscription: true },
    });

    if (!institution) {
      throw new NotFoundException('Organization not found');
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.renewalRequest.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const referenceNumber = `AURX-REN-${year}-${String(count + 1).padStart(4, '0')}`;

    const currentSub = institution.subscription;
    const baseDate = currentSub?.endDate && new Date(currentSub.endDate) > new Date()
      ? new Date(currentSub.endDate)
      : new Date();

    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const rawKey = `AURX-REN-${part1}-${part2}-${part3}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const keyExpiresAt = new Date();
    keyExpiresAt.setDate(keyExpiresAt.getDate() + 30);

    return await this.prisma.$transaction(async (tx) => {
      const request = await tx.renewalRequest.create({
        data: {
          referenceNumber,
          organizationId: institutionId,
          requestedMonths: months,
          notes: notes || 'Direct Founder override renewal.',
          status: 'APPROVED',
        },
      });

      const pkg = {
        renewalRequestId: request.id,
        referenceNumber,
        organizationId: institutionId,
        orgName: institution.name,
        requestedMonths: months,
        newEndDate: newEndDate.toISOString(),
        issueDate: new Date().toISOString(),
        approvedBy: founderId,
      };
      const encryptedPackage = encrypt(JSON.stringify(pkg));

      const renewalKey = await tx.renewalKey.create({
        data: {
          keyHash,
          encryptedPackage,
          status: 'ACTIVE',
          expiresAt: keyExpiresAt,
          renewalRequestId: request.id,
        },
      });

      await tx.renewalRequest.update({
        where: { id: request.id },
        data: { renewalKeyId: renewalKey.id },
      });

      await tx.auditLog.create({
        data: {
          userId: founderId,
          action: 'FOUNDER_DIRECT_RENEWAL',
          details: `Direct Founder renewal issued for ${institution.name}. Extends by ${months} months. Ref: ${referenceNumber}.`,
        },
      });

      return {
        renewalKey: rawKey,
        referenceNumber,
        expiresAt: keyExpiresAt,
        newEndDate,
      };
    });
  }

  /**
   * Apply a Renewal Key to extend the organization's subscription.
   * Called by Org Admin after receiving the renewal key.
   */
  async applyRenewalKey(institutionId: string, rawKey: string) {
    const keyHash = crypto.createHash('sha256').update(rawKey.trim()).digest('hex');

    const renewalKey = await this.prisma.renewalKey.findUnique({
      where: { keyHash },
      include: {
        renewalRequest: {
          include: { institution: { include: { subscription: true, license: true } } },
        },
      },
    });

    if (!renewalKey) {
      throw new NotFoundException('Renewal key not found or invalid');
    }

    if (renewalKey.status === 'USED') {
      throw new BadRequestException('Renewal key has already been applied');
    }

    if (renewalKey.status === 'REVOKED' || renewalKey.status === 'EXPIRED') {
      throw new BadRequestException(`Renewal key is ${renewalKey.status.toLowerCase()}`);
    }

    if (new Date() > renewalKey.expiresAt) {
      await this.prisma.renewalKey.update({ where: { id: renewalKey.id }, data: { status: 'EXPIRED' } });
      throw new BadRequestException('Renewal key has expired');
    }

    // Validate that the key belongs to this organization
    if (renewalKey.renewalRequest.organizationId !== institutionId) {
      throw new ForbiddenException('Renewal key does not belong to this organization');
    }

    // Decrypt the package to get the new end date
    let pkg: any;
    try {
      pkg = JSON.parse(decrypt(renewalKey.encryptedPackage));
    } catch {
      throw new BadRequestException('Failed to decrypt renewal package');
    }

    const newEndDate = new Date(pkg.newEndDate);
    const institution = renewalKey.renewalRequest.institution;

    return await this.prisma.$transaction(async (tx) => {
      // Update subscription end date and reactivate if expired
      if (institution.subscription) {
        await tx.subscription.update({
          where: { id: institution.subscription.id },
          data: {
            endDate: newEndDate,
            status: 'ACTIVE',
          },
        });
      }

      // Update license expiry
      if (institution.license) {
        await tx.license.update({
          where: { id: institution.license.id },
          data: {
            expiresAt: newEndDate,
            status: 'ACTIVE',
          },
        });
      }

      // Mark renewal key as used
      await tx.renewalKey.update({
        where: { id: renewalKey.id },
        data: { status: 'USED', usedAt: new Date() },
      });

      // Mark renewal request as processed
      await tx.renewalRequest.update({
        where: { id: renewalKey.renewalRequestId },
        data: { status: 'PROCESSED' },
      });

      await tx.auditLog.create({
        data: {
          userId: institutionId,
          action: 'RENEWAL_KEY_APPLIED',
          details: `Renewal key applied. Subscription extended to ${newEndDate.toISOString()} for org: ${institution.name}.`,
        },
      });

      return {
        message: 'Renewal applied successfully',
        newEndDate,
        orgName: institution.name,
      };
    });
  }

  /**
   * Get renewal requests for a specific organization (org admin view).
   */
  async getOrgRenewalRequests(institutionId: string) {
    return this.prisma.renewalRequest.findMany({
      where: { organizationId: institutionId },
      orderBy: { createdAt: 'desc' },
      include: {
        renewalKey: { select: { status: true, expiresAt: true } },
      },
    });
  }
}
