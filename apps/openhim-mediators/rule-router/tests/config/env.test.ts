/**
 * Unit tests for src/config/env.ts
 *
 * Strategy: mutate process.env before each test; restore after.
 * validateEnv() is called directly — the module-level `env` constant is NOT
 * tested here because it is evaluated at import time and would require isolateModules.
 *
 * Framework: Vitest (globals: true)
 *
 * Covers:
 *  - All required env vars present → success
 *  - Missing required vars → throws "Environment validation failed"
 *  - Default values applied for optional vars
 *  - OPENHIM_REJECT_UNAUTHORIZED "true"/"false" string → boolean transform
 *  - PORT, DB_PORT, OPENHIM_HTTP_PORT coerced from strings to numbers
 *  - NODE_ENV enum validation ("development" | "production" | "test")
 *  - LOG_LEVEL enum validation
 *  - TARGET_REQUEST_TIMEOUT_MS positive integer guard
 *  - ROUTING_RULES_REFRESH_INTERVAL_MS nonnegative integer guard
 *  - LOG_FILE is optional (absent → undefined)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "../../src/config/env";
import {
  makeMinimalProcessEnv,
  captureProcessEnv,
  setProcessEnv,
} from "../helpers";

// ---------------------------------------------------------------------------
// Env snapshot save/restore
// ---------------------------------------------------------------------------

let restoreEnv: () => void;

beforeEach(() => {
  restoreEnv = captureProcessEnv();
});

afterEach(() => {
  restoreEnv();
});

// ---------------------------------------------------------------------------
// Happy path — all required fields present
// ---------------------------------------------------------------------------

describe("validateEnv() — required fields present", () => {
  it("should return a parsed env object when all required fields are supplied", () => {
    setProcessEnv(makeMinimalProcessEnv());

    const result = validateEnv();

    expect(result.DB_HOST).toBe("db-host");
    expect(result.DB_USER).toBe("root");
    expect(result.DB_PASSWORD).toBe("secret");
    expect(result.OPENHIM_CLIENT_SECRET).toBe("client-secret");
  });

  it("should apply default values for all optional fields when they are absent", () => {
    setProcessEnv(makeMinimalProcessEnv());

    const result = validateEnv();

    expect(result.NODE_ENV).toBe("test");
    expect(result.PORT).toBe(4005);
    expect(result.LOG_LEVEL).toBe("info");
    expect(result.DB_PORT).toBe(3306);
    expect(result.DB_NAME).toBe("smile_interop");
    expect(result.OPENHIM_API_ENDPOINT).toBe("https://localhost:8080");
    expect(result.OPENHIM_ADMIN_EMAIL).toBe("admin@openhim.local");
    expect(result.OPENHIM_ADMIN_PASSWORD).toBe("openhim");
    expect(result.OPENHIM_HTTP_PROTOCOL).toBe("https");
    expect(result.OPENHIM_HTTP_HOST).toBe("localhost");
    expect(result.OPENHIM_HTTP_PORT).toBe(5000);
    expect(result.OPENHIM_CLIENT_ID).toBe("smile-app");
    expect(result.OPENHIM_REJECT_UNAUTHORIZED).toBe(true);
    expect(result.SERVICE_HOST).toBe("localhost");
    expect(result.TARGET_REQUEST_TIMEOUT_MS).toBe(30000);
    expect(result.ROUTING_RULES_REFRESH_INTERVAL_MS).toBe(0);
    expect(result.LOG_FILE).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Missing required fields → throw
// ---------------------------------------------------------------------------

describe("validateEnv() — missing required fields", () => {
  it("should throw when DB_HOST is absent", () => {
    const env = makeMinimalProcessEnv();
    delete env["DB_HOST"];
    setProcessEnv(env);

    expect(() => validateEnv()).toThrow("Environment validation failed");
  });

  it("should throw when DB_USER is absent", () => {
    const env = makeMinimalProcessEnv();
    delete env["DB_USER"];
    setProcessEnv(env);

    expect(() => validateEnv()).toThrow("Environment validation failed");
  });

  it("should throw when DB_PASSWORD is absent", () => {
    const env = makeMinimalProcessEnv();
    delete env["DB_PASSWORD"];
    setProcessEnv(env);

    expect(() => validateEnv()).toThrow("Environment validation failed");
  });

  it("should throw when OPENHIM_CLIENT_SECRET is absent", () => {
    const env = makeMinimalProcessEnv();
    delete env["OPENHIM_CLIENT_SECRET"];
    setProcessEnv(env);

    expect(() => validateEnv()).toThrow("Environment validation failed");
  });
});

// ---------------------------------------------------------------------------
// Numeric coercion (z.coerce.number)
// ---------------------------------------------------------------------------

describe("validateEnv() — numeric coercion", () => {
  it("should coerce PORT from string to number", () => {
    setProcessEnv(makeMinimalProcessEnv({ PORT: "9000" }));

    expect(validateEnv().PORT).toBe(9000);
  });

  it("should coerce DB_PORT from string to number", () => {
    setProcessEnv(makeMinimalProcessEnv({ DB_PORT: "5432" }));

    expect(validateEnv().DB_PORT).toBe(5432);
  });

  it("should coerce OPENHIM_HTTP_PORT from string to number", () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_HTTP_PORT: "5001" }));

    expect(validateEnv().OPENHIM_HTTP_PORT).toBe(5001);
  });

  it("should coerce TARGET_REQUEST_TIMEOUT_MS from string to number", () => {
    setProcessEnv(makeMinimalProcessEnv({ TARGET_REQUEST_TIMEOUT_MS: "10000" }));

    expect(validateEnv().TARGET_REQUEST_TIMEOUT_MS).toBe(10000);
  });

  it("should coerce ROUTING_RULES_REFRESH_INTERVAL_MS from string to number", () => {
    setProcessEnv(makeMinimalProcessEnv({ ROUTING_RULES_REFRESH_INTERVAL_MS: "60000" }));

    expect(validateEnv().ROUTING_RULES_REFRESH_INTERVAL_MS).toBe(60000);
  });
});

// ---------------------------------------------------------------------------
// OPENHIM_REJECT_UNAUTHORIZED — string → boolean transform
// ---------------------------------------------------------------------------

describe("validateEnv() — OPENHIM_REJECT_UNAUTHORIZED transform", () => {
  it('should transform "true" to boolean true', () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_REJECT_UNAUTHORIZED: "true" }));

    expect(validateEnv().OPENHIM_REJECT_UNAUTHORIZED).toBe(true);
  });

  it('should transform "false" to boolean false', () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_REJECT_UNAUTHORIZED: "false" }));

    expect(validateEnv().OPENHIM_REJECT_UNAUTHORIZED).toBe(false);
  });

  it('should throw when value is neither "true" nor "false"', () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_REJECT_UNAUTHORIZED: "yes" }));

    expect(() => validateEnv()).toThrow("Environment validation failed");
  });
});

// ---------------------------------------------------------------------------
// Enum validation
// ---------------------------------------------------------------------------

describe("validateEnv() — NODE_ENV enum", () => {
  it("should accept development", () => {
    setProcessEnv(makeMinimalProcessEnv({ NODE_ENV: "development" }));
    expect(validateEnv().NODE_ENV).toBe("development");
  });

  it("should accept production", () => {
    setProcessEnv(makeMinimalProcessEnv({ NODE_ENV: "production" }));
    expect(validateEnv().NODE_ENV).toBe("production");
  });

  it("should throw when NODE_ENV is an invalid value", () => {
    setProcessEnv(makeMinimalProcessEnv({ NODE_ENV: "staging" }));
    expect(() => validateEnv()).toThrow("Environment validation failed");
  });
});

describe("validateEnv() — LOG_LEVEL enum", () => {
  it.each(["debug", "info", "warn", "error"] as const)(
    'should accept LOG_LEVEL "%s"',
    (level) => {
      setProcessEnv(makeMinimalProcessEnv({ LOG_LEVEL: level }));
      expect(validateEnv().LOG_LEVEL).toBe(level);
    },
  );

  it("should throw when LOG_LEVEL is invalid", () => {
    setProcessEnv(makeMinimalProcessEnv({ LOG_LEVEL: "verbose" }));
    expect(() => validateEnv()).toThrow("Environment validation failed");
  });
});

describe("validateEnv() — OPENHIM_HTTP_PROTOCOL enum", () => {
  it('should accept "http"', () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_HTTP_PROTOCOL: "http" }));
    expect(validateEnv().OPENHIM_HTTP_PROTOCOL).toBe("http");
  });

  it('should accept "https"', () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_HTTP_PROTOCOL: "https" }));
    expect(validateEnv().OPENHIM_HTTP_PROTOCOL).toBe("https");
  });

  it("should throw when OPENHIM_HTTP_PROTOCOL is invalid", () => {
    setProcessEnv(makeMinimalProcessEnv({ OPENHIM_HTTP_PROTOCOL: "ftp" }));
    expect(() => validateEnv()).toThrow("Environment validation failed");
  });
});

// ---------------------------------------------------------------------------
// Positive / nonnegative integer guards
// ---------------------------------------------------------------------------

describe("validateEnv() — integer constraints", () => {
  it("should throw when TARGET_REQUEST_TIMEOUT_MS is zero (must be positive)", () => {
    setProcessEnv(makeMinimalProcessEnv({ TARGET_REQUEST_TIMEOUT_MS: "0" }));
    expect(() => validateEnv()).toThrow("Environment validation failed");
  });

  it("should throw when TARGET_REQUEST_TIMEOUT_MS is negative", () => {
    setProcessEnv(makeMinimalProcessEnv({ TARGET_REQUEST_TIMEOUT_MS: "-1" }));
    expect(() => validateEnv()).toThrow("Environment validation failed");
  });

  it("should accept ROUTING_RULES_REFRESH_INTERVAL_MS = 0 (nonnegative)", () => {
    setProcessEnv(makeMinimalProcessEnv({ ROUTING_RULES_REFRESH_INTERVAL_MS: "0" }));
    expect(validateEnv().ROUTING_RULES_REFRESH_INTERVAL_MS).toBe(0);
  });

  it("should throw when ROUTING_RULES_REFRESH_INTERVAL_MS is negative", () => {
    setProcessEnv(makeMinimalProcessEnv({ ROUTING_RULES_REFRESH_INTERVAL_MS: "-100" }));
    expect(() => validateEnv()).toThrow("Environment validation failed");
  });
});

// ---------------------------------------------------------------------------
// Optional LOG_FILE
// ---------------------------------------------------------------------------

describe("validateEnv() — LOG_FILE optional", () => {
  it("should be undefined when LOG_FILE is not set", () => {
    setProcessEnv(makeMinimalProcessEnv());
    expect(validateEnv().LOG_FILE).toBeUndefined();
  });

  it("should preserve the value when LOG_FILE is set", () => {
    setProcessEnv(makeMinimalProcessEnv({ LOG_FILE: "logs/rule-router.log" }));
    expect(validateEnv().LOG_FILE).toBe("logs/rule-router.log");
  });
});
