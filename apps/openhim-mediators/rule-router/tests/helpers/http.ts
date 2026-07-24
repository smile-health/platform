/**
 * tests/helpers/http.ts
 *
 * HTTP mock factories for the rule-router test suite.
 * These helpers mock `http.request` (or `https.request`) via `vi.spyOn` so that
 * no real network calls are made.
 *
 * All helpers return the spy so the caller can make additional assertions or
 * restore it early with `.mockRestore()`.  Tests should call
 * `vi.restoreAllMocks()` in `afterEach` to clean up automatically.
 *
 * Supported scenarios:
 *  - `mockHttpRequest`        — target responds with a given status + body
 *  - `mockHttpsRequest`       — same but spies on `https.request`
 *  - `mockHttpRequestError`   — target emits an "error" event (network failure)
 *  - `mockHttpRequestTimeout` — target emits a "timeout" event
 *  - `mockHttpRequestCapture` — target succeeds and captures the options/headers
 *                               sent by RoutingService for assertion
 */

import http from "http";
import https from "https";
import { EventEmitter } from "events";
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// Internal builder
// ---------------------------------------------------------------------------

/**
 * Builds a fake Node `http.ClientRequest` emitter that carries the common stubs
 * needed by `RoutingService.sendRequest()` (write, destroy, end).
 */
function buildReqEmitter(): EventEmitter & {
  write: any;
  destroy: any;
  end: any;
} {
  const req = new EventEmitter() as any;
  req.write = vi.fn();
  req.destroy = vi.fn();
  return req;
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Mocks `http.request` to return a successful response with `statusCode` and `responseBody`.
 *
 * @param statusCode   HTTP status code the fake response reports (default 200).
 * @param responseBody Body string emitted via "data" + "end" events (default "ok").
 *
 * @example
 * mockHttpRequest(200, JSON.stringify({ ok: true }));
 */
export function mockHttpRequest(statusCode = 200, responseBody = "ok") {
  const resEmitter = new EventEmitter() as any;
  resEmitter.statusCode = statusCode;

  const req = buildReqEmitter();
  req.end = vi.fn().mockImplementation(() => {
    setImmediate(() => {
      resEmitter.emit("data", Buffer.from(responseBody));
      resEmitter.emit("end");
    });
  });

  return vi.spyOn(http, "request").mockImplementation(((
    _options: any,
    callback?: any,
  ) => {
    if (callback) {
      setImmediate(() => callback(resEmitter));
    }
    return req;
  }) as any);
}

/**
 * Mocks `https.request` to return a successful response.
 * Use when the service is configured with `OPENHIM_HTTP_PROTOCOL: "https"`.
 */
export function mockHttpsRequest(statusCode = 200, responseBody = "ok") {
  const resEmitter = new EventEmitter() as any;
  resEmitter.statusCode = statusCode;

  const req = buildReqEmitter();
  req.end = vi.fn().mockImplementation(() => {
    setImmediate(() => {
      resEmitter.emit("data", Buffer.from(responseBody));
      resEmitter.emit("end");
    });
  });

  return vi.spyOn(https, "request").mockImplementation(((
    options: any,
    callback?: any,
  ) => {
    if (callback) {
      setImmediate(() => callback(resEmitter));
    }
    return req;
  }) as any);
}

/**
 * Mocks `http.request` to emit a network error event, simulating `ECONNREFUSED`
 * or similar transport failures.
 *
 * @param errorMessage The `.message` property on the emitted `Error`.
 *
 * @example
 * mockHttpRequestError("ECONNREFUSED");
 */
export function mockHttpRequestError(errorMessage = "ECONNREFUSED") {
  const req = buildReqEmitter();
  req.end = vi.fn().mockImplementation(() => {
    setImmediate(() => req.emit("error", new Error(errorMessage)));
  });

  return vi
    .spyOn(http, "request")
    .mockImplementation(((_options: any) => req) as any);
}

/**
 * Mocks `http.request` to emit a "timeout" event, causing `RoutingService` to
 * destroy the request and resolve with a 502 orchestration result.
 *
 * @example
 * mockHttpRequestTimeout();
 * const res = await service.handleRoute(c);
 * expect(res.status).toBe(502);
 */
export function mockHttpRequestTimeout() {
  const req = buildReqEmitter();
  req.end = vi.fn().mockImplementation(() => {
    setImmediate(() => req.emit("timeout"));
  });

  return vi
    .spyOn(http, "request")
    .mockImplementation(((_options: any) => req) as any);
}

/**
 * Mocks `http.request` to return a successful response AND capture the request
 * options (including `headers`) so the test can assert on what was forwarded.
 *
 * @returns `{ spy, getCaptured }` where `getCaptured()` returns the last set of
 *          captured options after `handleRoute()` has been awaited.
 *
 * @example
 * const { getCaptured } = mockHttpRequestCapture();
 * await service.handleRoute(c);
 * expect(getCaptured().headers["x-trace-id"]).toBe("abc");
 */
export function mockHttpRequestCapture(statusCode = 200, responseBody = "ok") {
  let captured: any = null;

  const spy = vi.spyOn(http, "request").mockImplementation(((
    options: any,
    callback?: any,
  ) => {
    captured = options;
    const resEmitter = new EventEmitter() as any;
    resEmitter.statusCode = statusCode;
    const req = buildReqEmitter();
    req.end = vi.fn().mockImplementation(() => {
      setImmediate(() => {
        if (callback) callback(resEmitter);
        resEmitter.emit("data", Buffer.from(responseBody));
        resEmitter.emit("end");
      });
    });
    return req;
  }) as any);

  return {
    spy,
    getCaptured: () =>
      captured as {
        headers: Record<string, string>;
        hostname: string;
        port: string;
        path: string;
        method: string;
      } | null,
  };
}
