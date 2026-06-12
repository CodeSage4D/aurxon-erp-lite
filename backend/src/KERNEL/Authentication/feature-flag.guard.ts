import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>('featureCode', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // SUPER_ADMIN bypasses standard feature checks
    if (user.role === 'SUPER_ADMIN') return true;

    const enabledFeatures = user.enabledFeatures || [];
    if (!enabledFeatures.includes(requiredFeature)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Feature ${requiredFeature} is not enabled for this organization context.`,
          error: 'FEATURE_DISABLED',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
