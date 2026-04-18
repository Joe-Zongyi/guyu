import { ConsoleLogger } from '@nestjs/common';
import { resolveNestLogLevels } from './nest-log-levels.js';

/**
 * Application-wide NestJS ConsoleLogger for NestFactory.create({ logger }).
 * Log levels follow LOG_LEVEL / NODE_ENV (see resolveNestLogLevels).
 */
export function createBootstrapConsoleLogger(env: NodeJS.ProcessEnv = process.env): ConsoleLogger {
  const logLevels = resolveNestLogLevels(env);

  return new ConsoleLogger('Nest', {
    logLevels,
    timestamp: env.NODE_ENV === 'production',
  });
}
