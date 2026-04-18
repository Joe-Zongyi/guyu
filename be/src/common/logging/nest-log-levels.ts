import type { LogLevel } from '@nestjs/common';

/**
 * Maps process env to NestJS LogLevel[] for NestFactory / ConsoleLogger.
 * Honors LOG_LEVEL when set; otherwise uses NODE_ENV-based defaults.
 */
export function resolveNestLogLevels(env: NodeJS.ProcessEnv = process.env): LogLevel[] {
  const raw = env.LOG_LEVEL?.trim().toLowerCase();

  switch (raw) {
    case 'error':
      return ['error'];
    case 'warn':
      return ['error', 'warn'];
    case 'log':
    case 'info':
      return ['error', 'warn', 'log'];
    case 'debug':
      return ['error', 'warn', 'log', 'debug'];
    case 'verbose':
      return ['error', 'warn', 'log', 'debug', 'verbose'];
    case 'fatal':
      return ['fatal', 'error', 'warn', 'log'];
    default:
      break;
  }

  if (env.NODE_ENV === 'production') {
    return ['error', 'warn', 'log'];
  }

  return ['error', 'warn', 'log', 'debug', 'verbose'];
}
