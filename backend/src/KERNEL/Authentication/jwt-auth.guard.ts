import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = await super.canActivate(context);
    if (!isActivated) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.role === 'SUPER_ADMIN') {
      const url = request.url || '';
      const operationalPaths = [
        '/students',
        '/parents',
        '/attendance',
        '/staff-attendance',
        '/fees',
        '/payroll',
        '/leaves',
        '/lessons',
        '/subjects',
        '/classes',
        '/academic-years',
        '/exams',
        '/documents',
        '/staff',
        '/notices',
        '/notifications',
        '/reports',
        '/productivity',
        '/library',
        '/visitors',
        '/inventory',
        '/timetable',
        '/dashboard',
      ];
      const isOperational = operationalPaths.some(
        (path) => url.startsWith(path) || url.startsWith('/api' + path)
      );
      if (isOperational) {
        throw new ForbiddenException(
          'Founders cannot access tenant operational data directly. A support-access impersonation session is required.'
        );
      }
    }

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
