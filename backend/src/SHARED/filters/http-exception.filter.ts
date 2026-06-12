import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaService } from '../Prisma/prisma.service';
import * as Sentry from '@sentry/node';
import * as crypto from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private prisma: PrismaService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const traceId = response.getHeader('x-trace-id') as string || `AXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    let message = 'An unexpected error occurred';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;
    let exceptionResponse: any = null;

    if (exception instanceof HttpException) {
      exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || exception.message;
        details = exceptionResponse.error || null;
      } else {
        message = exception.message;
      }

      // Map standard NestJS exceptions to strict business error codes
      const msgLower = message.toLowerCase();
      if (status === HttpStatus.BAD_REQUEST) {
        code = 'BAD_REQUEST';
        if (msgLower.includes('email') && msgLower.includes('registered')) {
          code = 'REGISTRATION_DUPLICATE';
        } else if (msgLower.includes('phone') && msgLower.includes('registered')) {
          code = 'REGISTRATION_DUPLICATE';
        } else if (msgLower.includes('gst') && msgLower.includes('registered')) {
          code = 'REGISTRATION_DUPLICATE';
        } else if (msgLower.includes('organization') && msgLower.includes('registered')) {
          code = 'REGISTRATION_DUPLICATE';
        } else if (msgLower.includes('expired')) {
          code = 'ACTIVATION_KEY_EXPIRED';
        } else if (msgLower.includes('already been used') || msgLower.includes('used')) {
          code = 'ACTIVATION_KEY_USED';
        } else if (msgLower.includes('revoked')) {
          code = 'ACTIVATION_KEY_REVOKED';
        } else if (msgLower.includes('suspended')) {
          code = 'WORKSPACE_SUSPENDED';
        } else if (msgLower.includes('subdomain') || msgLower.includes('domain') || msgLower.includes('tenant context')) {
          code = 'INVALID_SUBDOMAIN';
        } else if (msgLower.includes('setup') && msgLower.includes('incomplete')) {
          code = 'SETUP_INCOMPLETE';
        }
      } else if (status === HttpStatus.UNAUTHORIZED) {
        code = 'UNAUTHORIZED';
      } else if (status === HttpStatus.FORBIDDEN) {
        code = 'ROLE_FORBIDDEN';
      } else if (status === HttpStatus.NOT_FOUND) {
        code = 'NOT_FOUND';
      }
    } else {
      if (exception instanceof Error) {
        message = exception.message;
        const msgLower = message.toLowerCase();
        if (msgLower.includes('unique constraint') || msgLower.includes('duplicate key')) {
          code = 'REGISTRATION_DUPLICATE';
        }
      }
      // Log unhandled backend exceptions to server console and Sentry
      console.error('Unhandled system exception intercepted:', exception);
      Sentry.captureException(exception);
    }

    // Determine IP Address
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip || request.socket.remoteAddress || null;

    // Check if it's a security-related exception to log in SecurityEventLog
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

    response.status(status).json({
      success: false,
      code,
      message,
      data: details,
      traceId,
      timestamp: new Date().toISOString(),
    });
  }
}
