/**
 * tests/helpers/logger.ts
 *
 * Shared Pino logger stub for the rule-router test suite.
 *
 * All logger methods are `vi.fn()` stubs so tests can assert on calls without
 * spawning real pino transports or writing to the filesystem.
 *
 * The `child` method returns `this` (the same stub) so code that does
 * `logger.child({ module: "x" })` receives a fully-functional stub back.
 */

import { vi } from "vitest";
import type { Logger } from "pino";

/**
 * Shape of the mock logger returned by `createMockLogger()`.
 * Typed as `MockLogger` to avoid importing the full pino types in every test file
 * while still providing autocompletion for method names.
 */
export interface MockLogger {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
  child: ReturnType<typeof vi.fn>;
}

/**
 * Creates a fresh mock logger instance.
 *
 * Every test that needs a logger should call this once per test (or in
 * `beforeEach`) so that each test gets its own set of spy instances and
 * `toHaveBeenCalledWith` assertions cannot cross-contaminate.
 *
 * Cast to `Logger as any` is deliberate: the stub satisfies the subset of the
 * Pino Logger interface actually used by rule-router modules.
 *
 * @example
 * const logger = createMockLogger();
 * await registerWithOpenHIM(makeEnv(), logger as any);
 * expect(logger.info).toHaveBeenCalledWith(...);
 */
export function createMockLogger(): MockLogger {
  const stub: MockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(),
  };
  // `child()` returns the same stub so chained child loggers work transparently
  stub.child.mockReturnValue(stub);
  return stub;
}

/**
 * Type alias that casts the mock logger to `Logger` for call-sites that require
 * the full Pino type.  Use when passing to module constructors typed as `Logger`.
 */
export function asPinoLogger(mock: MockLogger): Logger {
  return mock as unknown as Logger;
}
