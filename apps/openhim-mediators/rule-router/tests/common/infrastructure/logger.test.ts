/**
 * Unit tests for src/common/infrastructure/logger.ts
 *
 * Mocking strategy:
 *  - pino is mocked via vi.mock() so no real file transports are spawned.
 *    We capture the config objects passed to pino() and inspect them.
 *
 * Framework: Vitest (globals: true)
 *
 * Covers:
 *  - createLogger(): development mode → uses pino-pretty transport target
 *  - createLogger(): production mode → uses pino/file (stdout) transport target
 *  - createLogger(): LOG_FILE present → adds pino-roll transport target in both modes
 *  - createLogger(): LOG_FILE absent → no pino-roll target
 *  - createLogger(): LOG_FILE with .log suffix → suffix stripped before passing to pino-roll
 *  - createLogger(): LOG_FILE without .log suffix → value passed unchanged
 *  - createLogger(): mixin returns correct service/environment/version fields
 *  - createLogger(): uses LOG_LEVEL from env
 *  - createModuleLogger(): returns a child logger with module field
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Capture pino calls so we can inspect the config objects
// ---------------------------------------------------------------------------

type CapturedPinoCall = { baseConfig: Record<string, unknown>; transportTargets: unknown[] };
const capturedCalls: CapturedPinoCall[] = [];

// The child logger returned by .child() — a minimal stub
const childStub = { child: vi.fn() };

vi.mock("pino", () => {
  // The mock pino() function records what it was called with and returns a
  // stub logger with a .child() method.
  const pino = vi.fn().mockImplementation((config: Record<string, unknown>) => {
    const transport = config.transport as { targets?: unknown[] } | undefined;
    capturedCalls.push({
      baseConfig: config,
      transportTargets: transport?.targets ?? [],
    });
    const stub = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnValue(childStub),
    };
    return stub;
  });

  // pino.stdTimeFunctions.isoTime is referenced in the source
  (pino as any).stdTimeFunctions = { isoTime: "isoTime-stub" };

  return { default: pino };
});

import { createLogger, createModuleLogger } from "../../../src/common/infrastructure/logger";
import { makeEnv } from "../../helpers";

// ---------------------------------------------------------------------------
// Reset captured calls before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  capturedCalls.length = 0;
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createLogger() — development mode
// ---------------------------------------------------------------------------

describe("createLogger() — development mode", () => {
  it("should include a pino-pretty transport target when NODE_ENV=development", () => {
    createLogger(makeEnv({ NODE_ENV: "development" }));

    const { transportTargets } = capturedCalls[0];
    const prettyTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino-pretty",
    );
    expect(prettyTarget).toBeDefined();
  });

  it("should NOT include a pino/file (stdout) target in development mode", () => {
    createLogger(makeEnv({ NODE_ENV: "development" }));

    const { transportTargets } = capturedCalls[0];
    const fileTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino/file",
    );
    expect(fileTarget).toBeUndefined();
  });

  it("should include the pino-roll target when LOG_FILE is set in development mode", () => {
    createLogger(makeEnv({ NODE_ENV: "development", LOG_FILE: "logs/app.log" }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino-roll",
    );
    expect(rollTarget).toBeDefined();
  });

  it("should NOT include a pino-roll target when LOG_FILE is absent in development mode", () => {
    createLogger(makeEnv({ NODE_ENV: "development", LOG_FILE: undefined }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino-roll",
    );
    expect(rollTarget).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// createLogger() — production / non-development mode
// ---------------------------------------------------------------------------

describe("createLogger() — non-development mode", () => {
  it("should include a pino/file transport targeting stdout (fd 1) when NODE_ENV=production", () => {
    createLogger(makeEnv({ NODE_ENV: "production" }));

    const { transportTargets } = capturedCalls[0];
    const fileTarget = (transportTargets as Array<{ target: string; options: { destination: number } }>).find(
      (t) => t.target === "pino/file",
    );
    expect(fileTarget).toBeDefined();
    expect(fileTarget?.options.destination).toBe(1);
  });

  it("should NOT include a pino-pretty target when NODE_ENV=production", () => {
    createLogger(makeEnv({ NODE_ENV: "production" }));

    const { transportTargets } = capturedCalls[0];
    const prettyTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino-pretty",
    );
    expect(prettyTarget).toBeUndefined();
  });

  it("should include a pino-roll target when LOG_FILE is set in non-development mode", () => {
    createLogger(makeEnv({ NODE_ENV: "production", LOG_FILE: "logs/app.log" }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino-roll",
    );
    expect(rollTarget).toBeDefined();
  });

  it("should NOT include a pino-roll target when LOG_FILE is absent in non-development mode", () => {
    createLogger(makeEnv({ NODE_ENV: "production", LOG_FILE: undefined }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino-roll",
    );
    expect(rollTarget).toBeUndefined();
  });

  it("should work the same for NODE_ENV=test (non-development)", () => {
    createLogger(makeEnv({ NODE_ENV: "test" }));

    const { transportTargets } = capturedCalls[0];
    const fileTarget = (transportTargets as Array<{ target: string }>).find(
      (t) => t.target === "pino/file",
    );
    expect(fileTarget).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// LOG_FILE .log suffix stripping
// ---------------------------------------------------------------------------

describe("createLogger() — LOG_FILE suffix handling", () => {
  it("should strip the .log suffix from LOG_FILE before passing to pino-roll", () => {
    createLogger(makeEnv({ NODE_ENV: "production", LOG_FILE: "logs/rule-router.log" }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string; options: { file: string } }>).find(
      (t) => t.target === "pino-roll",
    );
    // The source strips ".log" with replace(/\.log$/i, "")
    expect(rollTarget?.options.file).toBe("logs/rule-router");
  });

  it("should pass LOG_FILE unchanged when it has no .log suffix", () => {
    createLogger(makeEnv({ NODE_ENV: "production", LOG_FILE: "logs/rule-router" }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string; options: { file: string } }>).find(
      (t) => t.target === "pino-roll",
    );
    expect(rollTarget?.options.file).toBe("logs/rule-router");
  });

  it("should strip .LOG suffix case-insensitively", () => {
    createLogger(makeEnv({ NODE_ENV: "production", LOG_FILE: "logs/service.LOG" }));

    const { transportTargets } = capturedCalls[0];
    const rollTarget = (transportTargets as Array<{ target: string; options: { file: string } }>).find(
      (t) => t.target === "pino-roll",
    );
    expect(rollTarget?.options.file).toBe("logs/service");
  });
});

// ---------------------------------------------------------------------------
// Base config fields
// ---------------------------------------------------------------------------

describe("createLogger() — base config", () => {
  it("should set the log level from LOG_LEVEL env var", () => {
    createLogger(makeEnv({ LOG_LEVEL: "warn" }));

    const { baseConfig } = capturedCalls[0];
    expect(baseConfig.level).toBe("warn");
  });

  it("should set mixin fields: environment, service, version", () => {
    createLogger(makeEnv({ NODE_ENV: "production" }));

    const { baseConfig } = capturedCalls[0];
    const mixin = (baseConfig.mixin as () => Record<string, unknown>)();
    expect(mixin).toMatchObject({
      environment: "production",
      service: "rule-router",
      version: "1.0.0",
    });
  });
});

// ---------------------------------------------------------------------------
// createModuleLogger()
// ---------------------------------------------------------------------------

describe("createModuleLogger()", () => {
  it("should call baseLogger.child() with a module field and return the child logger", () => {
    const baseLogger = createLogger(makeEnv());
    const moduleLogger = createModuleLogger(baseLogger as any, "routing");

    expect((baseLogger as any).child).toHaveBeenCalledWith({ module: "routing" });
    expect(moduleLogger).toBe(childStub);
  });
});
