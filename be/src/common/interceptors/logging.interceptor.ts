import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor.
 *
 * Logs every incoming request with:
 * - method, path, request_id
 * - plant_id (if present in body or params)
 * - response status and duration
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const start = Date.now();

    const method = request.method;
    const url = request.url;
    const requestId =
      (request.body?.request_id as string) ||
      (request.query?.request_id as string) ||
      'n/a';
    const plantId =
      (request.body?.plant_id as string) ||
      (request.params?.plantId as string) ||
      'n/a';

    this.logger.log(`→ ${method} ${url} | request_id=${requestId} | plant_id=${plantId}`);

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - start;
          const status = (data as Record<string, unknown> | undefined)?.status ?? 'success';
          this.logger.log(
            `← ${method} ${url} | ${status} | ${duration}ms | request_id=${requestId}`,
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - start;
          const status =
            typeof err === 'object' && err !== null && 'status' in err
              ? String((err as Record<string, unknown>).status)
              : 'error';
          this.logger.error(
            `← ${method} ${url} | ${status} | ${duration}ms | request_id=${requestId} | ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        },
      }),
    );
  }
}
