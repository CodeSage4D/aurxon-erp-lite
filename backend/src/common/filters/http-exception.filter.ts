import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../../01_Core/prisma/prisma.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private prisma: PrismaService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let exceptionResponse: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'object' && exceptionResponse.message 
        ? exceptionResponse.message 
        : exception.message || 'Internal server error';
    } else {
      // Log unhandled backend exceptions to server console, but do not leak details to client
      console.error('Unhandled system exception intercepted:', exception);
    }

    // Determine IP Address
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip || request.socket.remoteAddress || null;

    // Check if it's a security-related exception to log
    let securityAction: string | null = null;
    let securityDetails = '';

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      securityAction = 'RATE_LIMIT_VIOLATION';
      securityDetails = `Rate limit exceeded on endpoint: ${request.method} ${request.url}`;
    } else if (status === HttpStatus.FORBIDDEN) {
      securityAction = 'PERMISSION_DENIED';
      securityDetails = `Forbidden access attempt on endpoint: ${request.method} ${request.url}. Message: ${
        typeof exceptionResponse === 'object' ? JSON.stringify(exceptionResponse) : exceptionResponse || message
      }`;
    } else if (status === HttpStatus.UNAUTHORIZED) {
      securityAction = 'SUSPICIOUS_ACCESS_ATTEMPT';
      securityDetails = `Unauthorized credentials or token validation failure on endpoint: ${request.method} ${request.url}`;
    } else if (status === HttpStatus.INTERNAL_SERVER_ERROR && !(exception instanceof HttpException)) {
      securityAction = 'SYSTEM_ERROR';
      securityDetails = `Unhandled system error on endpoint: ${request.method} ${request.url}. Error: ${
        exception instanceof Error ? exception.message : String(exception)
      }`;
    }

    if (securityAction) {
      try {
        const userId = (request as any).user?.id || null;
        const email = request.body?.email || (request as any).user?.email || null;

        await this.prisma.securityEventLog.create({
          data: {
            userId,
            email,
            action: securityAction,
            details: securityDetails,
            ipAddress,
          },
        });
      } catch (err) {
        console.error('Failed to log security event in HttpExceptionFilter:', err);
      }
    }

    // Clean response body to avoid information leakage (e.g. stack traces)
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
