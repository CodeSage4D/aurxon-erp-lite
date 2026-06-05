import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Computes Monthly Recurring Revenue (MRR) based on active subscriptions and plan prices.
   */
  async computeMRR(): Promise<number> {
    const activeSubs = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
    });

    const planDefs = await this.prisma.planDefinition.findMany({
      where: { isActive: true },
    });

    const priceMap = new Map<string, number>();
    for (const p of planDefs) {
      priceMap.set(p.code, p.monthlyPrice);
    }

    // Default prices as fallback if not seeded
    const fallbackPrices: Record<string, number> = {
      TRIAL: 0,
      STARTER: 4999,
      PROFESSIONAL: 9999,
      ENTERPRISE: 24999,
    };

    let total = 0;
    for (const sub of activeSubs) {
      const price = priceMap.has(sub.planCode)
        ? priceMap.get(sub.planCode)!
        : (fallbackPrices[sub.planCode] || 0);
      total += price;
    }

    return total;
  }

  /**
   * Computes Annual Recurring Revenue (ARR).
   */
  async computeARR(): Promise<number> {
    const mrr = await this.computeMRR();
    return mrr * 12;
  }

  /**
   * Generates a new invoice for an institution.
   */
  async generateInvoice(institutionId: string, amount: number, lineItems: any) {
    const inst = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!inst) {
      throw new NotFoundException('Institution not found');
    }

    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

    return await this.prisma.invoice.create({
      data: {
        institutionId,
        invoiceNumber,
        amount,
        status: 'UNPAID',
        dueDate,
        lineItems,
      },
    });
  }

  /**
   * Lists invoices. Filterable by institutionId for organization admins.
   */
  async listInvoices(institutionId?: string) {
    const where: any = {};
    if (institutionId) {
      where.institutionId = institutionId;
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        institution: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Fetch aggregate billing statistics for Founder Command Center
   */
  async getFounderBillingStats() {
    const mrr = await this.computeMRR();
    const arr = mrr * 12;
    const unpaidCount = await this.prisma.invoice.count({ where: { status: 'UNPAID' } });
    const paidSum = await this.prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    const activeCount = await this.prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const trialCount = await this.prisma.subscription.count({ where: { planCode: 'TRIAL' } });

    return {
      mrr,
      arr,
      unpaidInvoices: unpaidCount,
      totalRevenueCollected: paidSum._sum.amount || 0,
      activeSubscriptions: activeCount,
      trialSubscriptions: trialCount,
      trialConversionRate: 75.4, // Simulated conversion percentage
      churnRate: 2.1, // Simulated monthly churn percentage
    };
  }
}
