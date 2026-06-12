import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModuleActiveGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModule = this.reflector.getAllAndOverride<string>('moduleCode', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredModule) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // SUPER_ADMIN bypasses standard module active checks
    if (user.role === 'SUPER_ADMIN') return true;

    // Enforce Industry Pack Separation
    const PACK_MODULES: Record<string, string[]> = {
      SCHOOL_ERP: ['STUDENT_MANAGEMENT', 'ATTENDANCE', 'EXAMINATION', 'FINANCE'],
      HOSPITAL_ERP: ['CLINICAL_DESK', 'APPOINTMENTS', 'PATIENTS', 'FINANCE'],
      CORPORATE_ERP: ['HRMS', 'PAYROLL_ENGINE', 'RECRUITMENT', 'EMPLOYEES', 'FINANCE'],
    };

    const packCode = user.industryPackCode || 'SCHOOL_ERP';
    const allowedModules = PACK_MODULES[packCode] || [];
    if (!allowedModules.includes(requiredModule)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Module ${requiredModule} is not compatible with the ${packCode} industry pack.`,
          error: 'INDUSTRY_MODULE_LEAKAGE',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const enabledModules = user.enabledModules || [];
    if (!enabledModules.includes(requiredModule)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Module ${requiredModule} is not enabled for this organization context.`,
          error: 'MODULE_DISABLED',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
