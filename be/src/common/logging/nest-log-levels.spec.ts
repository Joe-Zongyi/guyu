import { describe, expect, it } from '@jest/globals';
import { resolveNestLogLevels } from './nest-log-levels.js';

describe('resolveNestLogLevels', () => {
  it('uses production defaults when NODE_ENV is production and LOG_LEVEL is unset', () => {
    expect(
      resolveNestLogLevels({
        NODE_ENV: 'production',
      }),
    ).toEqual(['error', 'warn', 'log']);
  });

  it('uses verbose development defaults when not production and LOG_LEVEL is unset', () => {
    expect(
      resolveNestLogLevels({
        NODE_ENV: 'development',
      }),
    ).toEqual(['error', 'warn', 'log', 'debug', 'verbose']);
  });

  it('respects explicit LOG_LEVEL (case-insensitive)', () => {
    expect(
      resolveNestLogLevels({
        NODE_ENV: 'production',
        LOG_LEVEL: 'VERBOSE',
      }),
    ).toEqual(['error', 'warn', 'log', 'debug', 'verbose']);
  });

  it('maps info to log level set', () => {
    expect(
      resolveNestLogLevels({
        LOG_LEVEL: 'info',
      }),
    ).toEqual(['error', 'warn', 'log']);
  });
});
