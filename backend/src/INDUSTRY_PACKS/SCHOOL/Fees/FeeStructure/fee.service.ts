// IEEE Standard 1028 compliant financial ledger operations
// Calculates net balance of collections, employee salaries, and operational costs in INR

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../SHARED/Prisma/prisma.service';

@Injectable()
export class FeeService {
  constructor(private prisma: PrismaService) {}

  // 1. Fee structures
  async getStructures(institutionId: string) {
    return this.prisma.feeStructure.findMany({
      where: { institutionId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createStructure(institutionId: string, data: any) {
    return this.prisma.feeStructure.create({
      data: {
        name: data.name,
        amount: parseFloat(data.amount),
        dueDate: new Date(data.dueDate),
        description: data.description || '',
        institutionId,
      },
    });
  }

  // 2. Student allocations
  async getAllocations(institutionId: string, classId?: string, status?: string) {
    const where: any = {
      student: { institutionId },
    };

    if (classId) {
      where.student = { classId, institutionId };
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.studentFeeAllocation.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            scholarNumber: true,
            class: { select: { name: true } },
          },
        },
        feeStructure: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async allocateBulk(institutionId: string, data: { feeStructureId: string; classId: string }) {
    const students = await this.prisma.student.findMany({
      where: { classId: data.classId, institutionId },
      select: { id: true },
    });

    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: { id: data.feeStructureId, institutionId },
    });

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    const operations = students.map((student) => {
      return this.prisma.studentFeeAllocation.create({
        data: {
          studentId: student.id,
          feeStructureId: data.feeStructureId,
          amountDue: feeStructure.amount,
          amountPaid: 0,
          status: 'UNPAID',
        },
      });
    });

    return this.prisma.$transaction(operations);
  }

  async recordPayment(institutionId: string, data: { allocationId: string; amount: number; paymentMethod: string; remarks?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const allocation = await tx.studentFeeAllocation.findUnique({
        where: { id: data.allocationId },
        include: { feeStructure: true, student: true },
      });

      if (!allocation || allocation.student.institutionId !== institutionId) {
        throw new NotFoundException('Fee allocation record not found');
      }

      const newPaid = allocation.amountPaid + parseFloat(data.amount as any);
      let status = 'PARTIAL';
      if (newPaid >= allocation.amountDue) {
        status = 'PAID';
      }

      const receiptNumber = `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const payment = await tx.payment.create({
        data: {
          allocationId: data.allocationId,
          amount: parseFloat(data.amount as any),
          paymentMethod: data.paymentMethod,
          receiptNumber,
          remarks: data.remarks || '',
        },
      });

      await tx.studentFeeAllocation.update({
        where: { id: data.allocationId },
        data: {
          amountPaid: newPaid,
          status,
        },
      });

      return payment;
    });
  }

  async getPaymentsHistory(institutionId: string) {
    return this.prisma.payment.findMany({
      where: {
        allocation: {
          student: { institutionId },
        },
      },
      include: {
        allocation: {
          include: {
            student: { select: { firstName: true, lastName: true, rollNumber: true, scholarNumber: true } },
            feeStructure: { select: { name: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async getFeeOverview(institutionId: string) {
    const allocations = await this.prisma.studentFeeAllocation.findMany({
      where: { student: { institutionId } },
      select: {
        amountDue: true,
        amountPaid: true,
        status: true,
      },
    });

    let totalDue = 0;
    let totalPaid = 0;

    for (const alloc of allocations) {
      totalDue += alloc.amountDue;
      totalPaid += alloc.amountPaid;
    }

    return {
      totalDue,
      totalPaid,
      totalPending: totalDue - totalPaid,
      collectedRate: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0,
      countPaid: allocations.filter((a) => a.status === 'PAID').length,
      countPartial: allocations.filter((a) => a.status === 'PARTIAL').length,
      countUnpaid: allocations.filter((a) => a.status === 'UNPAID').length,
    };
  }

  // 3. Indian Currency Full Finance Account Ledger calculations
  async getFinanceOverview(institutionId: string) {
    // Total Fee collections (Revenue)
    const allocations = await this.prisma.studentFeeAllocation.findMany({
      where: { student: { institutionId } },
      select: { amountPaid: true },
    });
    const totalRevenue = allocations.reduce((sum, a) => sum + a.amountPaid, 0);

    // Total Operational Expenses
    const expenses = await this.prisma.expense.findMany({
      where: { institutionId },
      orderBy: { expenseDate: 'desc' },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total Staff Salaries
    const staffMembers = await this.prisma.staff.findMany({
      where: { institutionId, status: 'ACTIVE' },
      select: { salary: true },
    });
    const totalSalaries = staffMembers.reduce((sum, s) => sum + s.salary, 0);

    const netProfit = totalRevenue - totalExpenses - totalSalaries;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalExpenses,
      totalSalaries,
      netProfit,
      profitMargin,
      currency: 'INR',
      currencySymbol: '₹',
      recentExpenses: expenses,
    };
  }

  // 4. Expense Ledger CRUD
  async getExpenses(institutionId: string) {
    return this.prisma.expense.findMany({
      where: { institutionId },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async createExpense(institutionId: string, data: any) {
    return this.prisma.expense.create({
      data: {
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        paymentMethod: data.paymentMethod || 'CASH',
        receiptUrl: data.receiptUrl || null,
        institutionId,
      },
    });
  }

  async deleteExpense(institutionId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, institutionId },
    });
    if (!expense) {
      throw new NotFoundException('Expense ledger not found');
    }
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
