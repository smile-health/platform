/**
 * Integration tests — RoutingRepository + RoutingEngine + RoutingService wired together.
 *
 * The real implementations of all three modules are used.
 * The only mocks are:
 *  - Kysely DB: makeDbStub() from tests/helpers (no real MySQL)
 *  - Node http module: mockHttpRequest / mockHttpRequestError from tests/helpers
 * Framework: Vitest (globals: true)
 *
 * This validates the full pipeline:
 *   DB rows → repository cache → engine match → service fan-out → mediator response
 *
 * Covers:
 *  - End-to-end: specific rule match → 200
 *  - End-to-end: default rule fallback → 200
 *  - End-to-end: no match with specific rules → 200 "No rules matched"
 *  - End-to-end: no rules at all → 200 "No routing rules configured"
 *  - ReDoS rule skipped at repository load, engine never sees it → safe 200
 *  - Cache refresh (change detection): DB change detected → rules reloaded
 *  - Fan-out failure → 502 propagates back as mediator "Failed"
 *  - Multiple topics in same cache
 *  - Header forwarding verified end-to-end
 */

import http from "http";
import { EventEmitter } from "events";
import { describe, it, expect, vi, afterEach } from "vitest";
import { RoutingRepository } from "../../../src/modules/routing/routing.repository";
import { RoutingService } from "../../../src/modules/routing/routing.service";
import {
  TEST_ROUTING_ENV,
  createMockLogger,
  makeDbStub,
  makeRow,
  makeHonoContext,
  mockHttpRequest,
  mockHttpRequestError,
} from "../../helpers";

// ---------------------------------------------------------------------------
// Integration suite
// ---------------------------------------------------------------------------

describe("Integration: full routing pipeline (DB → Repository → Engine → Service → Response)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("given a specific rule that matches, when the event arrives, then the service should return 200 Successful with one orchestration", async () => {
    const rows = [makeRow({ filter_key: "client_key", filter_value: "clinic-a" })];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);
    mockHttpRequest(200, "routed");

    const cloudEvent = { id: "i-1", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("Successful");
    expect(body.orchestrations).toHaveLength(1);
    expect(body.orchestrations[0].name).toBe("orders-adapter");
    expect(body.orchestrations[0].request.path).toBe("/api/v1/orders");
    expect(body.orchestrations[0].response.status).toBe(200);
  });

  it("given no specific rule matches but a default rule exists, when the event arrives, then the service should fall back to the default rule and return 200 Successful", async () => {
    const rows = [
      makeRow({ id: 1, filter_value: "clinic-z", is_default: false }),   // will not match clinic-a
      makeRow({ id: 2, target_name: "default-adapter", is_default: true }),
    ];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);
    mockHttpRequest(200);

    const cloudEvent = { id: "i-2", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("Successful");
    expect(body.orchestrations[0].name).toBe("default-adapter");
  });

  it("given a specific rule that does not match and no default rule, when the event arrives, then the service should return 200 with a 'No rules matched' message", async () => {
    const rows = [makeRow({ filter_value: "clinic-z" })]; // will not match clinic-a
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);

    const cloudEvent = { id: "i-3", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.response.body).toContain("No rules matched for topic");
    expect(body.orchestrations).toHaveLength(0);
  });

  it("given no rules at all for a topic, when an event arrives, then the service should return 200 with a 'No routing rules configured' message", async () => {
    const { db } = makeDbStub([]); // empty DB
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);

    const cloudEvent = { id: "i-4", type: "com.smile.order.created", source: "app", data: {} };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.response.body).toContain("No routing rules configured for topic");
  });

  it("given a ReDoS-unsafe rule in the DB, when rules are loaded, then the unsafe rule should be dropped and safe rules should still match correctly", async () => {
    // Regression: ReDoS guard — unsafe patterns must be skipped at repository load,
    // never reaching the engine where they could stall the event loop.
    const rows = [
      makeRow({ id: 1, filter_operator: "regex", filter_value: "(a+)+$" }), // unsafe → skipped
      makeRow({ id: 2, filter_key: "client_key", filter_operator: "eq", filter_value: "clinic-a", target_name: "safe-adapter" }),
    ];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ ruleId: 1 }),
      expect.stringContaining("Skipping routing rule"),
    );

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);
    mockHttpRequest(200);

    const cloudEvent = { id: "i-5", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.orchestrations[0].name).toBe("safe-adapter");
  });

  it("given a network failure on the target, when the event is routed, then the service should return 502 Failed with the orchestration reflecting the failure", async () => {
    const rows = [makeRow({ filter_key: "client_key", filter_value: "clinic-a" })];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);
    mockHttpRequestError("ECONNREFUSED");

    const cloudEvent = { id: "i-6", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(502);
    const body = await res.json() as any;
    expect(body.status).toBe("Failed");
    expect(body.orchestrations[0].response.status).toBe(502);
  });

  it("given multiple topics in the cache, when events arrive for different topics, then each topic should resolve only its own rules independently", async () => {
    const rows = [
      makeRow({ id: 1, topic: "order.created", filter_value: "clinic-a", target_name: "orders-adapter" }),
      makeRow({ id: 2, topic: "order.updated", filter_value: "clinic-b", target_name: "updates-adapter" }),
    ];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);

    mockHttpRequest(200, "ok");
    const ce1 = { id: "i-7a", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const res1 = await service.handleRoute(makeHonoContext({ body: ce1 }));
    const body1 = await res1.json() as any;
    vi.restoreAllMocks();

    expect(body1.orchestrations[0].name).toBe("orders-adapter");

    mockHttpRequest(200, "ok");
    const ce2 = { id: "i-7b", type: "com.smile.order.updated", source: "app", data: {}, client_key: "clinic-b" };
    const res2 = await service.handleRoute(makeHonoContext({ body: ce2 }));
    const body2 = await res2.json() as any;
    vi.restoreAllMocks();

    expect(body2.orchestrations[0].name).toBe("updates-adapter");
  });

  it("given forwarded headers in the incoming request, when routed, then those headers should appear in the outbound HTTP request to the target", async () => {
    const rows = [makeRow({ filter_key: "client_key", filter_value: "clinic-a" })];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);

    let capturedHeaders: any;
    vi.spyOn(http, "request").mockImplementation(((options: any, callback?: any) => {
      capturedHeaders = options.headers;
      const resEmitter = new EventEmitter() as any;
      resEmitter.statusCode = 200;
      const reqEmitter = new EventEmitter() as any;
      reqEmitter.write = vi.fn();
      reqEmitter.destroy = vi.fn();
      reqEmitter.end = vi.fn().mockImplementation(() => {
        setImmediate(() => {
          if (callback) callback(resEmitter);
          resEmitter.emit("data", Buffer.from("ok"));
          resEmitter.emit("end");
        });
      });
      return reqEmitter;
    }) as any);

    const cloudEvent = { id: "i-8", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const incomingHeaders = {
      "x-trace-id": "trace-e2e",
      "x-request-id": "req-e2e",
      "x-correlation-id": "corr-e2e",
      "x-integration-client": "client-e2e",
    };
    await service.handleRoute(makeHonoContext({ body: cloudEvent, headers: incomingHeaders }));

    expect(capturedHeaders["x-trace-id"]).toBe("trace-e2e");
    expect(capturedHeaders["x-request-id"]).toBe("req-e2e");
    expect(capturedHeaders["x-correlation-id"]).toBe("corr-e2e");
    expect(capturedHeaders["x-integration-client"]).toBe("client-e2e");
  });

  it("given a DB change between requests, when the cache is refreshed, then subsequent requests should use the updated rules", async () => {
    const initialRows = [makeRow({ id: 1, filter_value: "clinic-a", target_name: "adapter-v1" })];
    const updatedRows = [makeRow({ id: 2, filter_value: "clinic-b", target_name: "adapter-v2" })];

    const initialMainChain = {
      selectAll: () => initialMainChain,
      where: () => initialMainChain,
      orderBy: () => initialMainChain,
      execute: vi.fn().mockResolvedValue(initialRows),
    };
    const updatedMainChain = {
      selectAll: () => updatedMainChain,
      where: () => updatedMainChain,
      orderBy: () => updatedMainChain,
      execute: vi.fn().mockResolvedValue(updatedRows),
    };

    const snapshots = [
      { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 },
      { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: 1 },
    ];
    let snapIdx = 0;
    function makeSnapChain() {
      return {
        select: () => ({
          executeTakeFirst: vi.fn().mockImplementation(() => {
            const s = snapshots[snapIdx] ?? snapshots[snapshots.length - 1];
            snapIdx++;
            return Promise.resolve(s);
          }),
        }),
      };
    }

    let dbCallIdx = 0;
    const db = {
      selectFrom: vi.fn().mockImplementation(() => {
        dbCallIdx++;
        if (dbCallIdx === 1) return initialMainChain;
        if (dbCallIdx === 2) return makeSnapChain();
        if (dbCallIdx === 3) return updatedMainChain;
        return makeSnapChain();
      }),
    } as any;

    const repo = new RoutingRepository(db, createMockLogger() as any);
    await repo.loadRules();

    // Before refresh: rules reflect the initial DB state
    expect(repo.getRulesForTopic("order.created")[0].target_name).toBe("adapter-v1");

    await repo.refresh();

    // After refresh: rules reflect the updated DB state
    const rulesAfter = repo.getRulesForTopic("order.created");
    expect(rulesAfter).toHaveLength(1);
    expect(rulesAfter[0].target_name).toBe("adapter-v2");
    expect(rulesAfter[0].filter_value).toBe("clinic-b");
  });

  it("given a rule filtering on data.order_type, when an event with matching data arrives, then the engine should resolve the nested field and route correctly", async () => {
    const rows = [makeRow({ filter_key: "data.order_type", filter_operator: "eq", filter_value: "URGENT", target_name: "urgent-adapter" })];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);
    mockHttpRequest(200);

    const cloudEvent = { id: "i-9", type: "com.smile.order.created", source: "app", data: { order_type: "URGENT" } };
    const res = await service.handleRoute(makeHonoContext({ body: cloudEvent }));

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.orchestrations[0].name).toBe("urgent-adapter");
  });

  it("given a rule filtering on a custom HTTP header, when the incoming request carries that header, then the engine should match and route correctly", async () => {
    const rows = [makeRow({ filter_key: "header:x-tenant-id", filter_operator: "eq", filter_value: "tenant-99", target_name: "tenant-adapter" })];
    const { db } = makeDbStub(rows);
    const logger = createMockLogger();

    const repo = new RoutingRepository(db, logger as any);
    await repo.loadRules();

    const service = new RoutingService(TEST_ROUTING_ENV, repo, logger as any);
    mockHttpRequest(200);

    const cloudEvent = { id: "i-10", type: "com.smile.order.created", source: "app", data: {} };
    const res = await service.handleRoute(
      makeHonoContext({ body: cloudEvent, headers: { "x-tenant-id": "tenant-99" } }),
    );

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.orchestrations[0].name).toBe("tenant-adapter");
  });
});
