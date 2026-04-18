import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Real API E2E test configuration.
 * Does NOT mock fs/promises or fetch, so real cloud providers
 * and the BE backend are exercised.
 *
 * Prerequisites:
 *   - BE backend running (default: http://localhost:8787)
 *   - Tencent API credentials in env (for 3D model generation)
 *   - Internet connectivity
 */
export default defineConfig({
  test: {
    include: ["test/real-api/**/*.test.ts"],
    globals: false,
    reporters: "default",
    environment: "node",
    testTimeout: 120_000,
    clearMocks: true,
    restoreMocks: true,
    pool: "forks",
    singleFork: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
