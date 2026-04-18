import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["app/**/*.test.ts", "src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["test/real-api/**/*"],
    globals: false,
    reporters: "default",
    setupFiles: ["test/setup.ts"],
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
