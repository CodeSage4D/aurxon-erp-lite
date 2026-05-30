import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  async getVisitors(institutionId: string) {
    return this.prisma.visitor.findMany({
      where: { institutionId },
      orderBy: { entryTime: 'desc' },
    });
  }

  async createVisitor(institutionId: string, data: any) {
    const passNumber = `PASS-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    return this.prisma.visitor.create({
      data: {
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        hostName: data.hostName,
        passNumber,
        institutionId,
      },
    });
  }

  async checkOutVisitor(institutionId: string, id: string) {
    const visitor = await this.prisma.visitor.findFirst({
      where: { id, institutionId },
    });
    if (!visitor) {
      throw new NotFoundException('Visitor record not found');
    }
    return this.prisma.visitor.update({
      where: { id },
      data: {
        exitTime: new Date(),
      },
    });
  }
}
