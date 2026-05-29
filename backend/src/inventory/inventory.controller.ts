import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async getInventory(@Request() req) {
    return this.inventoryService.getInventory(req.user.institutionId);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async createInventoryItem(@Request() req, @Body() body: any) {
    return this.inventoryService.createInventoryItem(req.user.institutionId, body);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async updateInventoryItem(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateInventoryItem(req.user.institutionId, id, body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async deleteInventoryItem(@Request() req, @Param('id') id: string) {
    return this.inventoryService.deleteInventoryItem(req.user.institutionId, id);
  }
}
