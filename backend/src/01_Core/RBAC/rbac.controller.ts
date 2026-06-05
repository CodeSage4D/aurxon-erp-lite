import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../Auth/roles.guard';
import { RbacService } from './rbac.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getRoles(@Request() req: any) {
    return this.rbacService.getRoles(req.user.organizationId);
  }

  @Post('roles')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async createRole(
    @Request() req: any,
    @Body() body: { name: string; code: string; description?: string },
  ) {
    return this.rbacService.createRole(
      req.user.organizationId,
      req.user.id,
      body.name,
      body.code,
      body.description,
    );
  }

  @Delete('roles/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async deleteRole(@Request() req: any, @Param('id') roleId: string) {
    return this.rbacService.deleteRole(req.user.organizationId, req.user.id, roleId);
  }

  @Get('permissions')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getPermissions(@Request() req: any) {
    return this.rbacService.getPermissionsByInstitution(req.user.organizationId);
  }

  @Post('permissions/matrix')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async togglePermission(
    @Request() req: any,
    @Body() body: { roleId: string; resource: string; action: string; isAllowed: boolean },
  ) {
    return this.rbacService.togglePermission(
      req.user.organizationId,
      req.user.id,
      body.roleId,
      body.resource,
      body.action,
      body.isAllowed,
    );
  }

  @Get('memberships')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getMemberships(@Request() req: any) {
    return this.rbacService.getMemberships(req.user.organizationId);
  }

  @Put('memberships/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async updateMembership(
    @Request() req: any,
    @Param('id') membershipId: string,
    @Body() body: { roleId?: string; status?: string },
  ) {
    return this.rbacService.updateMembership(
      req.user.organizationId,
      req.user.id,
      membershipId,
      body.roleId,
      body.status,
    );
  }

  @Post('memberships/invite')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async inviteMember(
    @Request() req: any,
    @Body() body: { email: string; roleId: string },
  ) {
    return this.rbacService.inviteMember(
      req.user.organizationId,
      req.user.id,
      body.email,
      body.roleId,
    );
  }

  @Get('matrix')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async getMatrix(@Request() req: any) {
    return this.rbacService.getMatrix(req.user.organizationId);
  }

  @Post('matrix/bulk')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async bulkAssign(
    @Request() req: any,
    @Body() body: { roleId: string; assignments: { resource: string; action: string; isAllowed: boolean }[] },
  ) {
    return this.rbacService.bulkAssignPermissions(
      req.user.organizationId,
      req.user.id,
      body.roleId,
      body.assignments,
    );
  }
}
