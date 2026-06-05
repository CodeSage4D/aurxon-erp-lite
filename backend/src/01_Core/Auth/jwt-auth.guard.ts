import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = await super.canActivate(context);
    if (!isActivated) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.mustChangePassword) {
      const url = request.url || '';
      // Allow only change-password and switch/refresh context endpoints
      const allowedPaths = ['/auth/change-password', '/auth/switch-context', '/auth/refresh-context'];
      const isAllowed = allowedPaths.some((p) => url.includes(p));
      if (!isAllowed) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Password change is required on first login.',
          error: 'MUST_CHANGE_PASSWORD',
        });
      }
    }

    return true;
  }
}
