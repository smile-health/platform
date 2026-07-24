import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Covers all source modules that have runtime logic and are unit-testable.
      // Intentionally excludes:
      //   src/wire.ts   — pure DI wiring that composes already-tested units
      //   src/server.ts — startServer() calls process.exit; tested indirectly via
      //                   createServer() in the server tests; excluded to avoid
      //                   inflating uncoverable line counts
      //   src/**/*.d.ts — type declarations, no runtime code
      include: [
        "src/config/**/*.ts",
        "src/common/infrastructure/**/*.ts",
        "src/modules/**/*.ts",
      ],
      exclude: [
        "src/**/*.d.ts",
      ],
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
