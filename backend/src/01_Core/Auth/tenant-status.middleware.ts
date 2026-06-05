import { Injectable, NestMiddleware, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

// In-memory cache for organization status checks to optimize performance (60s TTL)
interface CacheEntry {
  status: string;
  licenseStatus: string;
  licenseExpiresAt: Date;
  subscriptionStatus: string;
  checkedAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

@Injectable()
export class TenantStatusMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    let payload: any;
    try {
      payload = this.jwtService.verify(payload || token, {
        secret: process.env.JWT_SECRET || 'super-secret-aurxon-jwt-key-2026-lite-erp',
      });
    } catch (err) {
      // Allow invalid token requests to pass through; protected routes will be handled by JwtAuthGuard
      return next();
    }

    const organizationId = payload?.organizationId;
    if (!organizationId) {
      return next();
    }

    // Bypass checks for founder endpoints
    const originalUrl = req.originalUrl || '';
    if (originalUrl.startsWith('/founder') || originalUrl.startsWith('/registrations')) {
      return next();
    }

    const now = Date.now();
    let entry = cache.get(organizationId);

    if (!entry || now - entry.checkedAt > CACHE_TTL_MS) {
      const inst = await this.prisma.institution.findUnique({
        where: { id: organizationId },
        include: {
          license: true,
          subscription: true,
        },
      });

      if (!inst) {
        throw new ForbiddenException('Organization not found');
      }

      entry = {
        status: inst.status || 'ACTIVE',
        licenseStatus: inst.license?.status || 'ACTIVE',
        licenseExpiresAt: inst.license?.expiresAt || new Date(),
        subscriptionStatus: inst.subscription?.status || 'ACTIVE',
        checkedAt: now,
      };

      cache.set(organizationId, entry);
    }

    // 1. Check if Organization is Suspended
    if (entry.status === 'SUSPENDED') {
      throw new ForbiddenException('Organization has been suspended. Please contact support.');
    }

    // 2. Check if License is Revoked
    if (entry.licenseStatus === 'REVOKED') {
      throw new ForbiddenException('License revoked. Access is restricted.');
    }

    // 3. Check if License is Expired
    const isExpired = new Date(entry.licenseExpiresAt).getTime() < now;
    const isGracePeriodOrActive = ['ACTIVE', 'GRACE_PERIOD'].includes(entry.subscriptionStatus);
    
    if (isExpired && !isGracePeriodOrActive) {
      throw new ForbiddenException('License expired. Please renew your subscription.');
    }

    next();
  }
}
