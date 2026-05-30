import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(institutionId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { institutionId },
      orderBy: { name: 'asc' },
    });
  }

  async createInventoryItem(institutionId: string, data: any) {
    const qty = parseInt(data.quantity) || 0;
    const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
    return this.prisma.inventoryItem.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: qty,
        unit: data.unit || 'PCS',
        vendor: data.vendor || null,
        status,
        institutionId,
      },
    });
  }

  async updateInventoryItem(institutionId: string, id: string, data: any) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, institutionId },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const qty = data.quantity !== undefined ? parseInt(data.quantity) : item.quantity;
    const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : item.name,
        category: data.category !== undefined ? data.category : item.category,
        quantity: qty,
        unit: data.unit !== undefined ? data.unit : item.unit,
        vendor: data.vendor !== undefined ? data.vendor : item.vendor,
        status,
      },
    });
  }

  async deleteInventoryItem(institutionId: string, id: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, institutionId },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }
}
