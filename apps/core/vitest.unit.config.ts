import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/tests/unit/**/*.test.ts"],
    fileParallelism: false,
    pool: "vmForks",
    coverage: {
      provider: "istanbul",
      reporter: ["lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/tests/**"],
    },
  },
})
