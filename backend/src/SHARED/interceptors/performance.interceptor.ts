import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  static totalRequests = 0;
  static successfulRequests = 0;
  static responseTimes: number[] = [];

  // Tracks the time since last snapshot to calculate requests per minute
  static lastSnapshotTime: number = Date.now();

  /**
   * Consumes accumulated metrics and resets the tracking indicators.
   */
  static consumeMetrics() {
    const total = this.totalRequests;
    const success = this.successfulRequests;
    const times = [...this.responseTimes];
    const durationSec = (Date.now() - this.lastSnapshotTime) / 1000;

    // Reset tracking indicators
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.responseTimes = [];
    this.lastSnapshotTime = Date.now();

    return {
      total,
      success,
      times,
      durationSec: durationSec > 0 ? durationSec : 1, // Prevent division by zero
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    
    // Skip performance tracking for metrics endpoints to avoid circular swelling
    if (req.url && req.url.includes('/founder/metrics')) {
      return next.handle();
    }

    const start = Date.now();
    PerformanceInterceptor.totalRequests++;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        PerformanceInterceptor.responseTimes.push(duration);
        PerformanceInterceptor.successfulRequests++;
      }),
      catchError((err) => {
        const duration = Date.now() - start;
        PerformanceInterceptor.responseTimes.push(duration);
        // We do not increment successfulRequests here, so successRate will correctly reflect the failure
        throw err;
      }),
    );
  }
}
