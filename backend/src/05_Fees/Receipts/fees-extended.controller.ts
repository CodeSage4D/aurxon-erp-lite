// Fee receipts and concessions controller — IEEE 1012 compliant financial operations
// Provides receipt retrieval and fee waiver management

import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../01_Core/Auth/roles.guard';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Controller('fees')
@UseGuards(JwtAuthGuard)
export class FeesExtendedController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Receipts ───────────────────────────────────────────────
  @Get('receipts/:paymentId')
  async getReceipt(@Request() req: any, @Param('paymentId') paymentId: string) {
    const receipt = await this.prisma.feeReceipt.findFirst({
      where: { paymentId },
      include: {
        payment: {
          include: {
            allocation: {
              include: {
                student: {
                  select: { firstName: true, lastName: true, scholarNumber: true, class: { select: { name: true } } },
                },
                feeStructure: true,
              },
            },
          },
        },
      },
    });

    return receipt;
  }

  // ── Concessions ────────────────────────────────────────────
  @Get('concessions')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'ACCOUNTANT')
  async getConcessions(@Request() req: any) {
    return this.prisma.feeConcession.findMany({
      where: {
        allocation: {
          student: { institutionId: req.user.institutionId },
        },
      },
      include: {
        allocation: {
          include: {
            student: { select: { firstName: true, lastName: true, scholarNumber: true } },
            feeStructure: { select: { name: true, amount: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('concessions')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async createConcession(
    @Request() req: any,
    @Body() body: {
      allocationId: string;
      concessionType: string;
      amountWaived: number;
      justification?: string;
    },
  ) {
    // Verify allocation belongs to institution
    const allocation = await this.prisma.studentFeeAllocation.findFirst({
      where: {
        id: body.allocationId,
        student: { institutionId: req.user.institutionId },
      },
    });

    if (!allocation) {
      return { error: 'Fee allocation not found' };
    }

    const concession = await this.prisma.feeConcession.create({
      data: {
        allocationId: body.allocationId,
        concessionType: body.concessionType,
        amountWaived: body.amountWaived,
        justification: body.justification,
        approvedById: req.user.id,
      },
    });

    // Reduce the outstanding balance by the waived amount
    const newAmountDue = Math.max(0, allocation.amountDue - body.amountWaived);
    await this.prisma.studentFeeAllocation.update({
      where: { id: body.allocationId },
      data: {
        amountDue: newAmountDue,
        status: newAmountDue <= allocation.amountPaid ? 'PAID' : allocation.amountPaid > 0 ? 'PARTIAL' : 'UNPAID',
      },
    });

    return concession;
  }
}
