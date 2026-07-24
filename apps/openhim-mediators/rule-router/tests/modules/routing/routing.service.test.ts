/**
 * Unit tests for routing.service.ts
 *
 * Mocking strategy:
 *  - RoutingRepository: makeMockRepository() from tests/helpers
 *  - Node http/https modules: mockHttpRequest / mockHttpsRequest / mockHttpRequestError /
 *    mockHttpRequestTimeout / mockHttpRequestCapture from tests/helpers
 *  - Hono Context (c): makeHonoContext() from tests/helpers
 * Framework: Vitest (globals: true)
 *
 * Covers:
 *  - JSON parse failure → 400
 *  - No specific rules, no default rules, topic has rules → "No rules matched…" 200
 *  - No specific rules, no default rules, topic has no rules → "No routing rules configured…" 200
 *  - Specific rules matched → fan-out, 200 on all success
 *  - Default rules used when no specific match → fan-out, 200
 *  - Fan-out: single failure → 502 overall
 *  - Fan-out: multiple targets in parallel
 *  - Headers forwarded (x-trace-id, x-request-id, x-correlation-id, x-integration-client)
 *  - X-Integration-Client header NOT added when absent from incoming request
 *  - URL construction from env vars + rule target_url
 *  - Timeout on HTTP call → 502
 *  - CloudEvent type prefix stripped to topic
 *  - MediatorResponse shape (x-mediator-urn, status, response, orchestrations)
 */

import http from "http";
import { EventEmitter } from "events";
import { describe, it, expect, vi, afterEach } from "vitest";
import { RoutingService } from "../../../src/modules/routing/routing.service";
import {
  TEST_ROUTING_ENV,
  createMockLogger,
  makeRule,
  makeHonoContext,
  makeMockRepository,
  mockHttpRequest,
  mockHttpsRequest,
  mockHttpRequestError,
  mockHttpRequestTimeout,
  mockHttpRequestCapture,
} from "../../helpers";

// ---------------------------------------------------------------------------
// RoutingService.handleRoute()
// ---------------------------------------------------------------------------

describe("RoutingService.handleRoute()", () => {
  afterEach(() => vi.restoreAllMocks());

  // ---- JSON parse failures ----

  it("should return 400 with a Failed mediator response when the request body is not valid JSON", async () => {
    const repo = makeMockRepository();
    const logger = createMockLogger();
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, logger as any);

    const c = makeHonoContext({ parseError: true });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body["x-mediator-urn"]).toBe("urn:mediator:smile-rule-router");
    expect(body.status).toBe("Failed");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.anything() }),
      "Failed to parse request body as JSON",
    );
  });

  // ---- No rules configured for topic ----

  it("should return 200 with a Successful mediator response and 'No routing rules configured' message when the topic has zero rules", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-1", type: "com.smile.order.created", source: "app", data: {} };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("Successful");
    expect(body.response.body).toContain("No routing rules configured for topic");
    expect(body.response.body).toContain("order.created");
    expect(body.orchestrations).toHaveLength(0);
  });

  // ---- No specific rules matched, no defaults ----

  it("should return 200 with 'No rules matched' when the topic has specific rules but none match the event", async () => {
    const specificRule = makeRule({ filter_value: "clinic-z" }); // will not match clinic-a
    const repo = makeMockRepository([specificRule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-2", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.response.body).toContain("No rules matched for topic");
    expect(body.response.body).toContain("order.created");
  });

  // ---- Matched specific rules → fan-out success ----

  it("should return 200 Successful with one orchestration when a specific rule matches and the target responds 200", async () => {
    const rule = makeRule({ filter_key: "client_key", filter_operator: "eq", filter_value: "clinic-a" });
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(200, JSON.stringify({ ok: true }));

    const cloudEvent = { id: "evt-3", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("Successful");
    expect(body.orchestrations).toHaveLength(1);
    expect(body.orchestrations[0].name).toBe("orders-adapter");
  });

  // ---- Default rules used when no specific match ----

  it("should use default rules and return 200 when no specific rules match the event", async () => {
    const specificRule = makeRule({ filter_value: "clinic-z" }); // won't match
    const defaultRule = makeRule({ id: 2, target_name: "default-adapter", is_default: true });
    const repo = makeMockRepository([specificRule], [defaultRule]);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(200, "ok");

    const cloudEvent = { id: "evt-4", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.orchestrations[0].name).toBe("default-adapter");
  });

  // ---- Fan-out: any failure → 502 ----

  it("should return 502 Failed when one of multiple fan-out targets fails", async () => {
    // Regression: fan-out failure policy — any single target failure must cause the
    // overall mediator response to be Failed/502 so interop-service can retry via x-retry-count.
    const rule1 = makeRule({ id: 1, target_name: "adapter-a", target_url: "/api/a" });
    const rule2 = makeRule({ id: 2, target_name: "adapter-b", target_url: "/api/b" });
    const repo = makeMockRepository([rule1, rule2], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    let callCount = 0;
    vi.spyOn(http, "request").mockImplementation(((_opts: any, callback?: any) => {
      callCount++;
      const reqEmitter = new EventEmitter() as any;
      reqEmitter.write = vi.fn();
      reqEmitter.destroy = vi.fn();

      if (callCount === 1) {
        const resEmitter = new EventEmitter() as any;
        resEmitter.statusCode = 200;
        reqEmitter.end = vi.fn().mockImplementation(() => {
          setImmediate(() => {
            if (callback) callback(resEmitter);
            resEmitter.emit("data", Buffer.from("ok"));
            resEmitter.emit("end");
          });
        });
      } else {
        reqEmitter.end = vi.fn().mockImplementation(() => {
          setImmediate(() => reqEmitter.emit("error", new Error("Connection refused")));
        });
      }

      return reqEmitter;
    }) as any);

    const cloudEvent = { id: "evt-5", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(502);
    const body = await res.json() as any;
    expect(body.status).toBe("Failed");
    expect(body.orchestrations).toHaveLength(2);
  });

  // ---- Network error on single target ----

  it("should return 502 and log an error when the target throws a network error", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const logger = createMockLogger();
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, logger as any);

    mockHttpRequestError("ECONNREFUSED");

    const cloudEvent = { id: "evt-6", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(502);
    const body = await res.json() as any;
    expect(body.orchestrations[0].response.status).toBe(502);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ targetName: "orders-adapter" }),
      "Failed to forward to target",
    );
  });

  // ---- Timeout ----

  it("should return 502 when the HTTP call to the target times out", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequestTimeout();

    const cloudEvent = { id: "evt-7", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(502);
    const body = await res.json() as any;
    expect(body.orchestrations[0].response.status).toBe(502);
  });

  // ---- Header forwarding ----

  it("should forward x-trace-id, x-request-id, x-correlation-id, and x-integration-client to the target", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const { getCaptured } = mockHttpRequestCapture(200, "ok");

    const cloudEvent = { id: "evt-8", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({
      body: cloudEvent,
      headers: {
        "x-trace-id": "trace-abc",
        "x-request-id": "req-xyz",
        "x-correlation-id": "corr-123",
        "x-integration-client": "cli-key",
        "content-type": "application/json",
      },
    });
    await service.handleRoute(c);

    const captured = getCaptured();
    expect(captured?.headers["x-trace-id"]).toBe("trace-abc");
    expect(captured?.headers["x-request-id"]).toBe("req-xyz");
    expect(captured?.headers["x-correlation-id"]).toBe("corr-123");
    expect(captured?.headers["x-integration-client"]).toBe("cli-key");
  });

  it("should NOT include x-integration-client in forwarded headers when it is absent from the incoming request", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const { getCaptured } = mockHttpRequestCapture(200, "ok");

    const cloudEvent = { id: "evt-9", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent, headers: {} });
    await service.handleRoute(c);

    expect(getCaptured()?.headers["x-integration-client"]).toBeUndefined();
  });

  // ---- URL construction ----

  it("should construct the target URL from OPENHIM_HTTP_PROTOCOL + OPENHIM_HTTP_HOST + OPENHIM_HTTP_PORT + rule.target_url", async () => {
    const rule = makeRule({ target_url: "/api/v1/orders" });
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const { getCaptured } = mockHttpRequestCapture(200, "ok");

    const cloudEvent = { id: "evt-10", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    await service.handleRoute(c);

    const captured = getCaptured();
    expect(captured?.hostname).toBe("openhim-host");
    expect(captured?.port).toBe("5000");
    expect(captured?.path).toBe("/api/v1/orders");
    expect(captured?.method).toBe("POST");
  });

  // ---- CloudEvent type → topic derivation ----

  it("should strip the 'com.smile.' prefix from CloudEvent type to derive the routing topic", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-11", type: "com.smile.order.created", source: "app", data: {} };
    const c = makeHonoContext({ body: cloudEvent });
    await service.handleRoute(c);

    expect((repo.getRulesForTopic as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("order.created");
  });

  it("should use the full type value as topic when the 'com.smile.' prefix is absent", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-12", type: "some.other.type", source: "app", data: {} };
    const c = makeHonoContext({ body: cloudEvent });
    await service.handleRoute(c);

    expect((repo.getRulesForTopic as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("some.other.type");
  });

  // ---- MediatorResponse shape ----

  it("should always include x-mediator-urn and an orchestrations array in the mediator response", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(200, "ok");

    const cloudEvent = { id: "evt-13", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);
    const body = await res.json() as any;

    expect(body["x-mediator-urn"]).toBe("urn:mediator:smile-rule-router");
    expect(Array.isArray(body.orchestrations)).toBe(true);
    expect(body.response).toMatchObject({
      status: expect.any(Number),
      headers: expect.objectContaining({ "content-type": "application/json" }),
      body: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it("should include request path, method, and actual target response status in each orchestration entry", async () => {
    const rule = makeRule({ target_url: "/api/v1/orders", target_name: "orders-adapter" });
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(201, "created");

    const cloudEvent = { id: "evt-14", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);
    const body = await res.json() as any;
    const orch = body.orchestrations[0];

    expect(orch.name).toBe("orders-adapter");
    expect(orch.request.path).toBe("/api/v1/orders");
    expect(orch.request.method).toBe("POST");
    expect(orch.response.status).toBe(201);
  });

  // ---- Basic auth credentials ----

  it("should send Basic auth credentials derived from OPENHIM_CLIENT_ID and OPENHIM_CLIENT_SECRET", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const { getCaptured } = mockHttpRequestCapture(200, "ok");

    const cloudEvent = { id: "evt-15", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    await service.handleRoute(c);

    const expected = "Basic " + Buffer.from("smile-app:secret123").toString("base64");
    expect(getCaptured()?.headers["Authorization"]).toBe(expected);
  });

  // ---- HTTPS protocol selection ----

  it("should use https.request when OPENHIM_HTTP_PROTOCOL is 'https'", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(
      { ...TEST_ROUTING_ENV, OPENHIM_HTTP_PROTOCOL: "https" },
      repo as any,
      createMockLogger() as any,
    );

    const httpsSpy = mockHttpsRequest(200, "ok");

    const cloudEvent = { id: "evt-16", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    await service.handleRoute(c);

    expect(httpsSpy).toHaveBeenCalledTimes(1);
  });

  // ---- Fan-out: multiple targets all succeed ----

  it("should fan out to all matched rules in parallel and return an orchestration entry for each target", async () => {
    const rule1 = makeRule({ id: 1, target_name: "adapter-a", target_url: "/api/a" });
    const rule2 = makeRule({ id: 2, target_name: "adapter-b", target_url: "/api/b" });
    const repo = makeMockRepository([rule1, rule2], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    vi.spyOn(http, "request").mockImplementation(((options: any, callback?: any) => {
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

    const cloudEvent = { id: "evt-17", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.orchestrations).toHaveLength(2);
    const names = body.orchestrations.map((o: any) => o.name);
    expect(names).toContain("adapter-a");
    expect(names).toContain("adapter-b");
  });

  // ---- Non-2xx response from target ----

  it("should return 502 Failed when the target responds with a 500 error and preserve the actual status in orchestration", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(500, "Internal Server Error");

    const cloudEvent = { id: "evt-18", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(502);
    const body = await res.json() as any;
    expect(body.status).toBe("Failed");
    expect(body.orchestrations[0].response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// createRoutingService factory
// ---------------------------------------------------------------------------

describe("createRoutingService()", () => {
  it("should return an instance of RoutingService", async () => {
    const { createRoutingService } = await import("../../../src/modules/routing/routing.service");
    const repo = makeMockRepository();
    const service = createRoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    expect(service).toBeInstanceOf(RoutingService);
  });
});

// ---------------------------------------------------------------------------
// Branch coverage — parseIncomingEvent edge cases
// ---------------------------------------------------------------------------

describe("RoutingService — parseIncomingEvent edge cases", () => {
  afterEach(() => vi.restoreAllMocks());

  it("should default topic to empty string when cloudEvent.type is missing", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-branch-1", source: "app", data: {} }; // no type
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    expect((repo.getRulesForTopic as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("");
  });

  it("should default event id to empty string when cloudEvent.id is missing", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { type: "com.smile.order.created", source: "app", data: {} }; // no id
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
  });

  it("should default source to empty string when cloudEvent.source is missing", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-x", type: "com.smile.order.created", data: {} }; // no source
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
  });

  it("should default data to an empty object when cloudEvent.data is missing", async () => {
    const repo = makeMockRepository([], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    const cloudEvent = { id: "evt-y", type: "com.smile.order.created", source: "app" }; // no data
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
  });

  it("should coerce a numeric program_id to string so it can be matched against string filter values", async () => {
    const rule = makeRule({ filter_key: "program_id", filter_operator: "eq", filter_value: "42" });
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(200, "ok");

    const cloudEvent = { id: "evt-z", type: "com.smile.order.created", source: "app", data: {}, program_id: 42 };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("Successful");
  });
});

// ---------------------------------------------------------------------------
// Branch coverage — querystring in orchestration path
// ---------------------------------------------------------------------------

describe("RoutingService — URL with querystring in orchestration", () => {
  afterEach(() => vi.restoreAllMocks());

  it("should include the querystring in the orchestration request path and querystring fields", async () => {
    const rule = makeRule({ target_url: "/api/v1/orders?format=json", target_name: "orders-qs" });
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    mockHttpRequest(200, "ok");

    const cloudEvent = { id: "evt-qs", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);
    const body = await res.json() as any;
    const orch = body.orchestrations[0];

    expect(orch.request.path).toBe("/api/v1/orders?format=json");
    expect(orch.request.querystring).toBe("?format=json");
  });
});

// ---------------------------------------------------------------------------
// Branch coverage — null statusCode fallback
// ---------------------------------------------------------------------------

describe("RoutingService — null statusCode fallback branch", () => {
  afterEach(() => vi.restoreAllMocks());

  it("should treat a null statusCode as 0 (non-2xx) causing a 502 Failed mediator response", async () => {
    const rule = makeRule();
    const repo = makeMockRepository([rule], []);
    const service = new RoutingService(TEST_ROUTING_ENV, repo as any, createMockLogger() as any);

    vi.spyOn(http, "request").mockImplementation(((options: any, callback?: any) => {
      const resEmitter = new EventEmitter() as any;
      resEmitter.statusCode = null; // triggers ?? 0 branch in sendRequest
      const reqEmitter = new EventEmitter() as any;
      reqEmitter.write = vi.fn();
      reqEmitter.destroy = vi.fn();
      reqEmitter.end = vi.fn().mockImplementation(() => {
        setImmediate(() => {
          if (callback) callback(resEmitter);
          resEmitter.emit("data", Buffer.from("no status"));
          resEmitter.emit("end");
        });
      });
      return reqEmitter;
    }) as any);

    const cloudEvent = { id: "evt-ns", type: "com.smile.order.created", source: "app", data: {}, client_key: "clinic-a" };
    const c = makeHonoContext({ body: cloudEvent });
    const res = await service.handleRoute(c);

    expect(res.status).toBe(502);
    const body = await res.json() as any;
    expect(body.orchestrations[0].response.status).toBe(0);
  });
});
