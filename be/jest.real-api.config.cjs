/** @type {import('jest').Config} */
// Manual real-API end-to-end test configuration.
// Does NOT override provider env vars, so the real cloud provider
// configured in .env.development / .env will be used.
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/real-api'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  testRegex: '.*\\.spec\\.ts$',
  testTimeout: 120_000,
};
