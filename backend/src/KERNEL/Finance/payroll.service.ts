import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async getPayrolls(institutionId: string, month?: string) {
    const where: any = {
      staff: { institutionId },
    };
    if (month) {
      where.month = month;
    }

    return this.prisma.payroll.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async getStaffPayrolls(institutionId: string, staffId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, institutionId },
    });
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return this.prisma.payroll.findMany({
      where: { staffId },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async getPayrollById(id: string, institutionId: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        staff: true,
      },
    });

    if (!payroll || payroll.staff.institutionId !== institutionId) {
      throw new NotFoundException('Payroll record not found');
    }

    return payroll;
  }

  async createPayroll(institutionId: string, data: any) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: data.staffId, institutionId },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Check if payroll already exists for this staff and month
    const existing = await this.prisma.payroll.findFirst({
      where: {
        staffId: data.staffId,
        month: data.month,
      },
    });

    if (existing) {
      throw new BadRequestException(`Salary slip for ${data.month} already generated for this employee`);
    }

    const baseSalary = parseFloat(data.baseSalary) || staff.salary;
    const hra = parseFloat(data.hra) || 0;
    const da = parseFloat(data.da) || 0;
    const allowances = parseFloat(data.allowances) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    const netPay = baseSalary + hra + da + allowances - deductions;

    const receiptNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.payroll.create({
      data: {
        staffId: data.staffId,
        month: data.month,
        baseSalary,
        hra,
        da,
        allowances,
        deductions,
        netPay,
        paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
        receiptNumber,
        status: 'PAID',
      },
      include: {
        staff: true,
      },
    });
  }

  async updatePayrollStatus(id: string, institutionId: string, status: string) {
    const payroll = await this.getPayrollById(id, institutionId);

    return this.prisma.payroll.update({
      where: { id },
      data: { status },
      include: { staff: true },
    });
  }
}
