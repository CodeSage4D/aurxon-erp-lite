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
