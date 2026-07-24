/**
 * Unit tests for routing.repository.ts
 *
 * Mocking strategy: Kysely DB is replaced with a hand-rolled stub (makeDbStub)
 * from tests/helpers. No real DB connection is made.
 * Framework: Vitest (globals: true)
 *
 * Covers:
 *  - loadRules() happy path (specific + default separation, priority ordering)
 *  - loadRules() ReDoS guard: unsafe regex rules skipped at load time
 *  - loadRules() graceful handling of "Table does not exist" DB error
 *  - loadRules() re-throw on unexpected errors
 *  - getRulesForTopic() / getDefaultRulesForTopic() before and after load
 *  - getAllEnabledRules() returns combined list
 *  - isLoaded() state transitions
 *  - refresh() delegates to loadRules()
 *  - startAutoRefresh() with intervalMs=0 does nothing
 *  - startAutoRefresh() with a positive interval triggers checkAndRefresh
 *  - stopAutoRefresh() clears the timer
 *  - checkAndRefresh(): reloads when MAX(updated_at) or COUNT changed
 *  - checkAndRefresh(): no reload when nothing changed
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RoutingRepository } from "../../../src/modules/routing/routing.repository";
import { makeDbStub, makeDbStubThrows, makeRow, createMockLogger } from "../../helpers";

// ---------------------------------------------------------------------------
// loadRules()
// ---------------------------------------------------------------------------

describe("RoutingRepository.loadRules()", () => {
  it("should populate the specific-rules cache for the given topic", async () => {
    const row = makeRow({ is_default: false });
    const { db } = makeDbStub([row]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    const rules = repo.getRulesForTopic("order.created");
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe(1);
  });

  it("should populate the default-rules cache when is_default is true", async () => {
    const row = makeRow({ is_default: true });
    const { db } = makeDbStub([row]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    expect(repo.getRulesForTopic("order.created")).toHaveLength(0);
    expect(repo.getDefaultRulesForTopic("order.created")).toHaveLength(1);
  });

  it("should separate multiple topics into distinct cache entries", async () => {
    const rows = [
      makeRow({ id: 1, topic: "order.created" }),
      makeRow({ id: 2, topic: "order.updated" }),
    ];
    const { db } = makeDbStub(rows);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    expect(repo.getRulesForTopic("order.created")).toHaveLength(1);
    expect(repo.getRulesForTopic("order.updated")).toHaveLength(1);
  });

  it("should correctly cast mysql2 tinyint boolean fields (0/1) to false/true via Boolean()", async () => {
    // rowToRule wraps is_default and enabled with Boolean() so numeric 0/1 from mysql2
    // becomes false/true. is_default=0 → false → goes into specific cache (not default).
    const row = makeRow({ is_default: 0 as unknown as boolean, enabled: 1 as unknown as boolean });
    const { db } = makeDbStub([row]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    const rules = repo.getRulesForTopic("order.created");
    expect(rules).toHaveLength(1);
    expect(rules[0].is_default).toBe(false);
    expect(rules[0].enabled).toBe(true);
  });

  it("should skip unsafe regex rules at load time and log a warning for each skipped rule", async () => {
    // Regression: ReDoS guard — unsafe patterns loaded from DB must be silently dropped,
    // not evaluated against events (which would stall the event loop).
    const safeRow = makeRow({ id: 1, filter_operator: "eq" });
    const unsafeRow = makeRow({ id: 2, filter_operator: "regex", filter_value: "(a+)+$" });
    const { db } = makeDbStub([safeRow, unsafeRow]);
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);

    await repo.loadRules();

    const rules = repo.getRulesForTopic("order.created");
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe(1);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toMatchObject({ ruleId: 2 });
  });

  it("should set cacheLoaded to true after a successful load", async () => {
    const { db } = makeDbStub([]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    expect(repo.isLoaded()).toBe(false);
    await repo.loadRules();
    expect(repo.isLoaded()).toBe(true);
  });

  it("should record the change-detection baseline snapshot and log the loaded rule count", async () => {
    const { db } = makeDbStub([makeRow()]);
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);

    await repo.loadRules();

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ ruleCount: 1 }),
      "Routing rules loaded from database",
    );
  });

  it("should handle a missing table gracefully: set cacheLoaded=true and not throw", async () => {
    const db = makeDbStubThrows("Table 'integration_routing_rules' doesn't exist");
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);

    await expect(repo.loadRules()).resolves.toBeUndefined();
    expect(repo.isLoaded()).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Table") }),
      expect.stringContaining("does not exist"),
    );
  });

  it("should re-throw unexpected DB errors that are not table-not-found messages", async () => {
    const db = makeDbStubThrows("connection refused");
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);

    await expect(repo.loadRules()).rejects.toThrow("connection refused");
    expect(logger.error).toHaveBeenCalled();
  });

  it("should clear the stale cache on a subsequent reload", async () => {
    const row1 = makeRow({ id: 1 });
    const { db: db1 } = makeDbStub([row1]);
    const logger = createMockLogger();
    const repo = new RoutingRepository(db1, logger as any);

    await repo.loadRules();
    expect(repo.getRulesForTopic("order.created")).toHaveLength(1);

    // Second load: zero rows — replace the execute mock
    const emptyChain = {
      selectAll: () => emptyChain,
      where: () => emptyChain,
      orderBy: () => emptyChain,
      execute: vi.fn().mockResolvedValue([]),
    };
    const snapshotChain = {
      select: () => ({ executeTakeFirst: vi.fn().mockResolvedValue({ max_updated_at: null, row_count: 0 }) }),
    };
    let call = 0;
    (db1.selectFrom as ReturnType<typeof vi.fn>).mockImplementation(() => {
      call++;
      return call === 1 ? emptyChain : snapshotChain;
    });

    await repo.loadRules();

    expect(repo.getRulesForTopic("order.created")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getRulesForTopic() / getDefaultRulesForTopic() before load
// ---------------------------------------------------------------------------

describe("RoutingRepository — cache accessors before loadRules()", () => {
  it("should return an empty array and log a warning when getRulesForTopic() is called before load", () => {
    const { db } = makeDbStub([]);
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);

    const rules = repo.getRulesForTopic("order.created");

    expect(rules).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Cache not loaded, call loadRules() first");
  });

  it("should return an empty array and log a warning when getDefaultRulesForTopic() is called before load", () => {
    const { db } = makeDbStub([]);
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);

    const rules = repo.getDefaultRulesForTopic("order.created");

    expect(rules).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Cache not loaded, call loadRules() first");
  });

  it("should return an empty array for a topic that has no rules after load", async () => {
    const { db } = makeDbStub([makeRow({ topic: "order.created" })]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    expect(repo.getRulesForTopic("unknown.topic")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getAllEnabledRules()
// ---------------------------------------------------------------------------

describe("RoutingRepository.getAllEnabledRules()", () => {
  it("should return all specific and default rules combined into a single array", async () => {
    const rows = [
      makeRow({ id: 1, is_default: false }),
      makeRow({ id: 2, is_default: true }),
    ];
    const { db } = makeDbStub(rows);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    const all = repo.getAllEnabledRules();
    expect(all).toHaveLength(2);
    expect(all.map((r) => r.id)).toEqual(expect.arrayContaining([1, 2]));
  });

  it("should return an empty array when the DB contains no rules", async () => {
    const { db } = makeDbStub([]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    await repo.loadRules();

    expect(repo.getAllEnabledRules()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// refresh()
// ---------------------------------------------------------------------------

describe("RoutingRepository.refresh()", () => {
  it("should delegate to loadRules() and make reloaded rules available for subsequent queries", async () => {
    const row = makeRow();
    const mainChain = {
      selectAll: () => mainChain,
      where: () => mainChain,
      orderBy: () => mainChain,
      execute: vi.fn().mockResolvedValue([row]),
    };

    const makeSnapChain = () => ({
      select: () => ({
        executeTakeFirst: vi.fn().mockResolvedValue({
          max_updated_at: "2024-01-01T00:00:00.000Z",
          row_count: 1,
        }),
      }),
    });

    let call = 0;
    const db = {
      selectFrom: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1 || call === 3) return mainChain;
        return makeSnapChain();
      }),
    } as any;

    const repo = new RoutingRepository(db, createMockLogger() as any);
    await repo.loadRules();

    const spy = vi.spyOn(repo as any, "loadRules");
    await repo.refresh();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(repo.getRulesForTopic("order.created")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// startAutoRefresh() / stopAutoRefresh()
// ---------------------------------------------------------------------------

describe("RoutingRepository.startAutoRefresh()", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("should do nothing when intervalMs is 0 — no timer is created", () => {
    const { db } = makeDbStub([]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    repo.startAutoRefresh(0);
    vi.advanceTimersByTime(60_000);

    expect(db.selectFrom).not.toHaveBeenCalled();
  });

  it("should call checkAndRefresh once per tick at the specified interval", async () => {
    const row = makeRow();
    const { db } = makeDbStub(
      [row],
      [
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 },
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 },
      ],
    );
    const repo = new RoutingRepository(db, createMockLogger() as any);
    await repo.loadRules();

    const checkSpy = vi.spyOn(repo as any, "checkAndRefresh");

    repo.startAutoRefresh(1000);
    vi.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(checkSpy).toHaveBeenCalledTimes(1);
    repo.stopAutoRefresh();
  });

  it("should clear the existing timer when startAutoRefresh() is called a second time", () => {
    const { db } = makeDbStub([]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    const clearSpy = vi.spyOn(global, "clearInterval");

    repo.startAutoRefresh(5000);
    repo.startAutoRefresh(5000);

    expect(clearSpy).toHaveBeenCalledTimes(1);
    repo.stopAutoRefresh();
  });

  it("should be safe to call stopAutoRefresh() multiple times without throwing", () => {
    const { db } = makeDbStub([]);
    const repo = new RoutingRepository(db, createMockLogger() as any);

    repo.startAutoRefresh(5000);
    repo.stopAutoRefresh();

    expect(() => repo.stopAutoRefresh()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// checkAndRefresh() — change detection
// ---------------------------------------------------------------------------

describe("RoutingRepository — checkAndRefresh() change detection", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("should trigger a full reload when MAX(updated_at) has changed since the last check", async () => {
    const row = makeRow();
    const { db } = makeDbStub(
      [row],
      [
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 }, // initial baseline
        { max_updated_at: "2024-06-01T00:00:00.000Z", row_count: 1 }, // tick 1 — changed
        { max_updated_at: "2024-06-01T00:00:00.000Z", row_count: 1 }, // reload snapshot
      ],
    );
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const loadSpy = vi.spyOn(repo as any, "loadRules");

    repo.startAutoRefresh(1000);
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();

    expect(loadSpy).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ currentMaxUpdatedAt: "2024-06-01T00:00:00.000Z" }),
      "Routing rule change detected - reloading cache",
    );
    repo.stopAutoRefresh();
  });

  it("should trigger a full reload when the row count has changed since the last check", async () => {
    const row = makeRow();
    const { db } = makeDbStub(
      [row],
      [
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 }, // initial
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 2 }, // tick 1 — row added
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 2 }, // reload snapshot
      ],
    );
    const repo = new RoutingRepository(db, createMockLogger() as any);
    await repo.loadRules();

    const loadSpy = vi.spyOn(repo as any, "loadRules");

    repo.startAutoRefresh(1000);
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();

    expect(loadSpy).toHaveBeenCalled();
    repo.stopAutoRefresh();
  });

  it("should NOT trigger a reload when neither MAX(updated_at) nor row count has changed", async () => {
    const row = makeRow();
    const { db } = makeDbStub(
      [row],
      [
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 }, // initial
        { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 }, // tick 1 — no change
      ],
    );
    const repo = new RoutingRepository(db, createMockLogger() as any);
    await repo.loadRules();

    const loadSpy = vi.spyOn(repo as any, "loadRules");

    repo.startAutoRefresh(1000);
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();

    expect(loadSpy).not.toHaveBeenCalled();
    repo.stopAutoRefresh();
  });

  it("should log the error and continue without crashing when checkAndRefresh throws", async () => {
    const { db } = makeDbStub([], [{ max_updated_at: null, row_count: 0 }]);
    const logger = createMockLogger();
    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    (db.selectFrom as ReturnType<typeof vi.fn>).mockReturnValue({
      select: () => ({
        executeTakeFirst: vi.fn().mockRejectedValue(new Error("DB connection lost")),
      }),
    });

    repo.startAutoRefresh(1000);
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
      "Routing rules auto-refresh check failed",
    );
    repo.stopAutoRefresh();
  });
});
