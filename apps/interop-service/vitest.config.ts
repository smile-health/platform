import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/utils/vitest-setup.ts'],
    globalSetup: ['./src/tests/utils/global-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts'
      ]
    },
    fileParallelism: false,
    isolate: true
  }
})
