import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

export interface ResponseEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  traceId: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    const traceId = `AXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    
    // Attach trace ID to response headers for debugging/auditing
    response.setHeader('x-trace-id', traceId);

    return next.handle().pipe(
      map((data) => {
        // If data is already standardized, don't double-wrap it
        if (data && typeof data === 'object' && 'success' in data && 'traceId' in data) {
          return data;
        }

        // Custom default message/code
        let message = 'Operation completed successfully';
        let code = 'SUCCESS';

        if (data && typeof data === 'object') {
          if ('_message' in data) {
            message = data._message;
            delete data._message;
          }
          if ('_code' in data) {
            code = data._code;
            delete data._code;
          }
        }

        return {
          success: true,
          code,
          message,
          data: data !== undefined ? data : null,
          traceId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
