import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  request_id?: string;
  timestamp: string;
  path: string;
}

/**
 * Global exception filter.
 *
 * Catches all unhandled exceptions and returns a structured JSON response
 * with request_id propagation for traceability.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.extractMessage(exception)
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const errorName =
      exception instanceof HttpException
        ? exception.name
        : exception instanceof Error
          ? exception.name
          : 'Error';

    // Extract request_id from body or query for traceability
    const requestId =
      (request.body?.request_id as string) ||
      (request.query?.request_id as string) ||
      undefined;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: errorName,
      ...(requestId && { request_id: requestId }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log with appropriate level
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status} | request_id=${requestId ?? 'n/a'} | ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${status} | request_id=${requestId ?? 'n/a'} | ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object' && response !== null) {
      const msg = (response as Record<string, unknown>).message;
      if (Array.isArray(msg)) {
        return msg.join('; ');
      }
      if (typeof msg === 'string') {
        return msg;
      }
    }
    return exception.message;
  }
}
