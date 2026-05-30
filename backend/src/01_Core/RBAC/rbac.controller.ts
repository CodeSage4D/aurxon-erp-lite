// IEEE 1471 compliant role-based access descriptor endpoint
// Provides role catalogue for AURXON ERP Lite institutional administrators

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { Roles } from '../Auth/roles.guard';
import { RolesGuard } from '../Auth/roles.guard';

export const SYSTEM_ROLES = [
  {
    name: 'SUPER_ADMIN',
    label: 'Super Administrator',
    description: 'Full system access across all institutions and branches.',
    permissions: ['*'],
  },
  {
    name: 'INSTITUTE_ADMIN',
    label: 'Institute Administrator',
    description: 'Full access within their own institution and branches.',
    permissions: [
      'students:read', 'students:write', 'students:delete',
      'staff:read', 'staff:write', 'staff:delete',
      'classes:read', 'classes:write',
      'fees:read', 'fees:write',
      'exams:read', 'exams:write',
      'attendance:read', 'attendance:write',
      'reports:read', 'analytics:read',
      'settings:read', 'settings:write',
      'notices:read', 'notices:write',
      'audit-logs:read',
    ],
  },
  {
    name: 'TEACHER',
    label: 'Teacher / Faculty',
    description: 'Access to assigned classes, subjects, attendance, and exam entry.',
    permissions: [
      'students:read',
      'classes:read',
      'attendance:read', 'attendance:write',
      'exams:read', 'exams:write',
      'lesson-plans:read', 'lesson-plans:write',
      'notices:read',
    ],
  },
  {
    name: 'ACCOUNTANT',
    label: 'Accountant',
    description: 'Full access to fees, payments, payroll, and financial reports.',
    permissions: [
      'fees:read', 'fees:write',
      'payments:read', 'payments:write',
      'payroll:read', 'payroll:write',
      'reports:read',
    ],
  },
  {
    name: 'STUDENT',
    label: 'Student',
    description: 'Access to own profile, timetable, attendance, results, and homework.',
    permissions: [
      'profile:read',
      'timetable:read',
      'attendance:read',
      'exams:read',
      'homework:read', 'homework:write',
      'notices:read',
    ],
  },
  {
    name: 'PARENT',
    label: 'Parent / Guardian',
    description: 'Read-only access to linked children\'s data: attendance, fees, results, notices.',
    permissions: [
      'children:read',
      'attendance:read',
      'fees:read', 'payments:write',
      'exams:read',
      'notices:read',
    ],
  },
];

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RbacController {
  @Get('roles')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  getRoles() {
    return { roles: SYSTEM_ROLES };
  }
}
