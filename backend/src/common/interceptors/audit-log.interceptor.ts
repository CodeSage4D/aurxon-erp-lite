import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../01_Core/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const method = request.method;

    // Only intercept mutable operations (POST, PUT, PATCH, DELETE)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const url = request.url;
    const modelName = this.getModelNameFromUrl(url);
    const id = request.params.id;
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip || request.socket.remoteAddress || null;

    let preValue: any = null;

    // Fetch pre-value if it's a modification/deletion and we have an ID
    if (['PUT', 'PATCH', 'DELETE'].includes(method) && id && modelName) {
      try {
        const dbModel = (this.prisma as any)[modelName];
        if (dbModel && typeof dbModel.findUnique === 'function') {
          preValue = await dbModel.findUnique({ where: { id } });
        }
      } catch (err) {
        console.warn(`AuditLogInterceptor: Failed to fetch pre-value for model ${modelName} with id ${id}:`, err);
      }
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        const user = (request as any).user;
        if (!user || !user.id) {
          // If no authenticated user is associated with this request, we skip logging to satisfy the foreign key constraint
          return;
        }

        let postValue: any = null;

        // Fetch post-value if it's a creation or update
        if (method === 'POST') {
          postValue = responseBody;
        } else if (['PUT', 'PATCH'].includes(method) && id && modelName) {
          try {
            const dbModel = (this.prisma as any)[modelName];
            if (dbModel && typeof dbModel.findUnique === 'function') {
              postValue = await dbModel.findUnique({ where: { id } });
            }
          } catch (err) {
            console.warn(`AuditLogInterceptor: Failed to fetch post-value for model ${modelName} with id ${id}:`, err);
          }
        }

        try {
          const action = this.getFriendlyActionName(method, modelName || 'resource', url);
          const sanitizedPre = this.sanitize(preValue);
          const sanitizedPost = this.sanitize(postValue);

          // Build audit log details
          const detailsObj = {
            method,
            url,
            params: request.params,
            body: this.sanitize(request.body),
            preValue: sanitizedPre,
            postValue: sanitizedPost,
          };

          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action,
              details: JSON.stringify(detailsObj),
              ipAddress,
            },
          });
        } catch (err) {
          console.error('AuditLogInterceptor: Failed to save audit log:', err);
        }
      }),
    );
  }

  private getModelNameFromUrl(url: string): string | null {
    const path = url.split('?')[0]; // strip query params
    const parts = path.split('/');
    
    if (parts.includes('student') || parts.includes('students')) return 'student';
    if (parts.includes('attendance')) return 'attendance';
    if (parts.includes('class') || parts.includes('classes')) return 'class';
    if (parts.includes('staff')) return 'staff';
    if (parts.includes('settings')) return 'settings';
    if (parts.includes('notice') || parts.includes('notices')) return 'notice';
    
    // Fee mapping
    if (parts.includes('fee') || parts.includes('fees')) {
      if (path.includes('allocation')) return 'studentFeeAllocation';
      if (path.includes('payment') || path.includes('payments')) return 'payment';
      return 'feeStructure';
    }

    // Exam mapping
    if (parts.includes('exam') || parts.includes('exams')) {
      if (path.includes('result') || path.includes('results')) return 'examResult';
      return 'exam';
    }

    return null;
  }

  private getFriendlyActionName(method: string, modelName: string, url: string): string {
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    const action = actionMap[method] || method;
    const formattedModel = modelName.replace(/([A-Z])/g, '_$1').toUpperCase();
    return `${action}_${formattedModel}`;
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Deep copy to prevent side effects
    let copy: any;
    try {
      copy = JSON.parse(JSON.stringify(obj));
    } catch {
      return '[UNPARSABLE_OBJECT]';
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'pass',
      'token',
      'accessToken',
      'refreshToken',
      'aadhaarNumber',
      'accNumber',
      'ifscCode',
      'samagraId',
      'familyId',
      'panNumber',
    ];

    const sanitizeObject = (item: any) => {
      if (!item || typeof item !== 'object') return;
      for (const key of Object.keys(item)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          item[key] = '[REDACTED_PII]';
        } else if (typeof item[key] === 'object') {
          sanitizeObject(item[key]);
        }
      }
    };

    sanitizeObject(copy);
    return copy;
  }
}
