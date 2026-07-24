/**
 * Unit tests for src/common/infrastructure/database/connection.ts
 *
 * Mocking strategy:
 *  - mysql2/promise.createPool: vi.mock() to avoid real TCP connections
 *  - kysely MysqlDialect + Kysely: vi.mock() to control DB object returned
 *  - Kysely query builder: hand-rolled stubs for selectNoFrom, selectFrom
 *  - pino Logger: createMockLogger() from tests/helpers
 *
 * Framework: Vitest (globals: true)
 *
 * Covers:
 *  - createDatabase(): success path — logs info, returns Kysely instance
 *  - createDatabase(): createPool throws → logs error, re-throws wrapped message
 *  - createDatabase(): logs debug for query events in development mode
 *  - createDatabase(): logs error for query error events
 *  - checkDatabaseHealth(): DB responds → returns true
 *  - checkDatabaseHealth(): DB throws → logs error, returns false
 *  - closeDatabase(): success → logs info, calls db.destroy()
 *  - closeDatabase(): db.destroy() throws → logs error, re-throws
 *  - validateRequiredTables(): table exists → returns true
 *  - validateRequiredTables(): table missing → returns false, logs error
 *  - validateRequiredTables(): timeout fires first → returns false
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock mysql2/promise before any import resolves it
vi.mock("mysql2/promise", () => ({
  createPool: vi.fn().mockReturnValue({}),
}));

// Mock kysely — we return a controllable fake Kysely instance
vi.mock("kysely", async () => {
  const actual = await vi.importActual<typeof import("kysely")>("kysely");

  // We keep MysqlDialect as a no-op constructor but control Kysely itself
  class FakeMysqlDialect {
    constructor(_opts: unknown) {}
  }

  // Kysely is replaced by a class that records its log callback and exposes
  // controllable query stubs via the global __kyselyInstance reference.
  class FakeKysely {
    public _logCallback: ((event: unknown) => void) | undefined;
    public selectNoFrom: ReturnType<typeof vi.fn>;
    public selectFrom: ReturnType<typeof vi.fn>;
    public destroy: ReturnType<typeof vi.fn>;
    public fn: { count: ReturnType<typeof vi.fn> };

    constructor(opts: { log?: (event: unknown) => void }) {
      this._logCallback = opts?.log;
      // Default stubs — overridden per test via __kyselyInstance
      this.selectNoFrom = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([{ health: 1 }]),
      });
      this.selectFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([{ count: "1" }]),
      });
      this.destroy = vi.fn().mockResolvedValue(undefined);
      this.fn = {
        count: vi.fn().mockReturnValue({ as: vi.fn().mockReturnValue("count") }),
      };
      // Expose for tests to access
      (global as any).__kyselyInstance = this;
    }
  }

  return { ...actual, Kysely: FakeKysely, MysqlDialect: FakeMysqlDialect };
});

import { createPool } from "mysql2/promise";
import {
  createDatabase,
  checkDatabaseHealth,
  closeDatabase,
  validateRequiredTables,
} from "../../../../src/common/infrastructure/database/connection";
import { makeEnv, createMockLogger } from "../../../helpers";

// ---------------------------------------------------------------------------
// Pool mock reference
// ---------------------------------------------------------------------------

const mockCreatePool = vi.mocked(createPool);

beforeEach(() => {
  vi.clearAllMocks();
  // Restore default pool mock after each test that may have changed it
  mockCreatePool.mockReturnValue({} as any);
});

// ---------------------------------------------------------------------------
// createDatabase()
// ---------------------------------------------------------------------------

describe("createDatabase()", () => {
  it("should return a Kysely instance and log connection info on success", async () => {
    const logger = createMockLogger();

    const db = await createDatabase(makeEnv({ DB_HOST: "db-host", DB_PORT: 3306 }), logger as any);

    expect(db).toBeDefined();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ host: "db-host", port: 3306 }),
      "Creating database connection",
    );
    expect(logger.info).toHaveBeenCalledWith("Database connection created successfully");
  });

  it("should call createPool with the correct connection options", async () => {
    await createDatabase(
      makeEnv({ DB_HOST: "db-host", DB_PORT: 3306, DB_USER: "root", DB_PASSWORD: "password", DB_NAME: "smile_interop" }),
      createMockLogger() as any,
    );

    expect(mockCreatePool).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "db-host",
        port: 3306,
        user: "root",
        password: "password",
        database: "smile_interop",
        timezone: "Z",
      }),
    );
  });

  it("should log error and throw a wrapped error message when createPool throws", async () => {
    mockCreatePool.mockImplementation(() => {
      throw new Error("ECONNREFUSED");
    });
    const logger = createMockLogger();

    await expect(createDatabase(makeEnv(), logger as any)).rejects.toThrow(
      "Database connection failed: ECONNREFUSED",
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it("should wrap non-Error throws in the error message", async () => {
    mockCreatePool.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw "raw pool error";
    });

    await expect(createDatabase(makeEnv(), createMockLogger() as any)).rejects.toThrow(
      "Database connection failed: raw pool error",
    );
  });

  it("should call the log callback with error level for query errors", async () => {
    const logger = createMockLogger();
    await createDatabase(makeEnv(), logger as any);

    const instance = (global as any).__kyselyInstance;
    instance._logCallback?.({
      level: "error",
      query: { sql: "SELECT 1", parameters: [] },
      error: new Error("query failed"),
      queryDurationMillis: 10,
    });

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ query: "SELECT 1" }),
      "Database query error",
    );
  });

  it("should call the log callback with debug level for query events in development mode", async () => {
    const logger = createMockLogger();
    await createDatabase(makeEnv({ NODE_ENV: "development" }), logger as any);

    const instance = (global as any).__kyselyInstance;
    instance._logCallback?.({
      level: "query",
      query: { sql: "SELECT 1", parameters: [] },
      queryDurationMillis: 5,
    });

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({ query: "SELECT 1" }),
      "Database query executed",
    );
  });

  it("should NOT call debug for query events when NODE_ENV is not development", async () => {
    const logger = createMockLogger();
    await createDatabase(makeEnv({ NODE_ENV: "test" }), logger as any);

    const instance = (global as any).__kyselyInstance;
    instance._logCallback?.({
      level: "query",
      query: { sql: "SELECT 1", parameters: [] },
      queryDurationMillis: 5,
    });

    expect(logger.debug).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// checkDatabaseHealth()
// ---------------------------------------------------------------------------

describe("checkDatabaseHealth()", () => {
  it("should return true when the health query resolves successfully", async () => {
    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    const logger = createMockLogger();

    const healthy = await checkDatabaseHealth(db, logger as any);

    expect(healthy).toBe(true);
  });

  it("should return false and log an error when the health query throws", async () => {
    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    const instance = (global as any).__kyselyInstance;
    instance.selectNoFrom.mockReturnValue({
      execute: vi.fn().mockRejectedValue(new Error("DB down")),
    });
    const logger = createMockLogger();

    const healthy = await checkDatabaseHealth(db, logger as any);

    expect(healthy).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
      "Database health check failed",
    );
  });
});

// ---------------------------------------------------------------------------
// closeDatabase()
// ---------------------------------------------------------------------------

describe("closeDatabase()", () => {
  it("should call db.destroy() and log info messages", async () => {
    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    const instance = (global as any).__kyselyInstance;
    const logger = createMockLogger();

    await closeDatabase(db, logger as any);

    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith("Closing database connection");
    expect(logger.info).toHaveBeenCalledWith("Database connection closed");
  });

  it("should log an error and re-throw when db.destroy() throws", async () => {
    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    const instance = (global as any).__kyselyInstance;
    instance.destroy.mockRejectedValue(new Error("destroy failed"));
    const logger = createMockLogger();

    await expect(closeDatabase(db, logger as any)).rejects.toThrow("destroy failed");
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
      "Error closing database connection",
    );
  });
});

// ---------------------------------------------------------------------------
// validateRequiredTables()
// ---------------------------------------------------------------------------

describe("validateRequiredTables()", () => {
  it("should return true when the table query resolves", async () => {
    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    // Default mock chain already resolves
    const logger = createMockLogger();

    const result = await validateRequiredTables(db, logger as any);

    expect(result).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      "Required table integration_routing_rules exists",
    );
  });

  it("should return false and log error when table query throws", async () => {
    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    const instance = (global as any).__kyselyInstance;
    // Make the selectFrom chain throw
    instance.selectFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      execute: vi.fn().mockRejectedValue(new Error("Table doesn't exist")),
    });
    const logger = createMockLogger();

    const result = await validateRequiredTables(db, logger as any);

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
      expect.stringContaining("does not exist"),
    );
  });

  it("should return false when the timeout fires before the query resolves", async () => {
    vi.useFakeTimers();

    const db = await createDatabase(makeEnv(), createMockLogger() as any);
    const instance = (global as any).__kyselyInstance;
    // Never resolves
    instance.selectFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      execute: vi.fn().mockReturnValue(new Promise(() => {})),
    });
    const logger = createMockLogger();

    const promise = validateRequiredTables(db, logger as any);
    vi.advanceTimersByTime(6000); // past the 5000ms timeout
    const result = await promise;

    expect(result).toBe(false);

    vi.useRealTimers();
  });
});
