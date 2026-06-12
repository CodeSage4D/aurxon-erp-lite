import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async findAll(institutionId: string) {
    return this.prisma.branch.findMany({
      where: { institutionId },
      orderBy: { name: 'asc' },
    });
  }

  async create(institutionId: string, data: any) {
    return this.prisma.branch.create({
      data: {
        name: data.name,
        code: data.code || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pinCode: data.pinCode || null,
        phone: data.phone || null,
        institutionId,
      },
    });
  }
}
