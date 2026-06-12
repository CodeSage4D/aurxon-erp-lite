import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../Authentication/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  /**
   * Get Founder SaaS revenue analytics (Founder only)
   */
  @Get('stats')
  async getStats(@Request() req) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform founders can view revenue statistics');
    }
    return this.billingService.getFounderBillingStats();
  }

  /**
   * List invoices (Founder gets all, Org admin gets their own)
   */
  @Get('invoices')
  async getInvoices(@Request() req) {
    if (req.user.role === 'SUPER_ADMIN') {
      return this.billingService.listInvoices();
    }
    
    // For regular org admin/users, scope to their active organization context
    if (!req.user.organizationId) {
      throw new ForbiddenException('No active organization context found');
    }
    return this.billingService.listInvoices(req.user.organizationId);
  }

  /**
   * Manually generate an invoice (Founder only)
   */
  @Post('invoices')
  async createInvoice(
    @Request() req,
    @Body() body: { institutionId: string; amount: number; lineItems: any },
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform founders can generate invoices');
    }
    return this.billingService.generateInvoice(body.institutionId, body.amount, body.lineItems);
  }
}
