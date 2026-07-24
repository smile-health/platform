import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/tests/unit/**/*.test.ts"],
    fileParallelism: false,
    isolate: true,
    coverage: {
      provider: "istanbul",
      reporter: ["lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/tests/**"],
    },
  },
})
