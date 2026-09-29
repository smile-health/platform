import { describe, expect, test } from "bun:test";
import { Context, Hono } from "hono";
import {
  AuditActor,
  AuditLogCaptureMiddleware,
  AuditableRoute,
  LoadBefore,
} from "../audit-log/capture-middleware";
import { CreateAuditLogInput } from "../audit-log/types";

// Row store the PUT/DELETE handlers mutate, to prove before is read first.
const store = new Map<number, Record<string, unknown>>();
const seedStore = () => {
  store.clear();
  store.set(7, { id: 7, name: "Old", status: 1, updated_at: "2026-01-01" });
};
const storeLoader: LoadBefore = async (_table, id) =>
  store.has(id) ? { ...store.get(id)! } : null;
const widgetBefore: AuditableRoute = {
  match: /^\/widgets/,
  module: "widget",
  before: { table: "widgets", idFrom: /^\/widgets\/(\d+)$/ },
};

class FakePublisher {
  calls: CreateAuditLogInput[] = [];
  async record(_c: unknown, data: CreateAuditLogInput) {
    this.calls.push(data);
  }
}

// The middleware publishes fire-and-forget; let its microtasks settle.
const flush = () => new Promise((r) => setTimeout(r, 0));

const defaultActor = (): AuditActor => ({
  actorId: 1,
  actorRole: "SUPERADMIN",
});

function buildApp(
  publisher: { record: FakePublisher["record"] },
  routes: AuditableRoute[],
  getActor: (
    c: Context,
    body: Record<string, unknown> | null
  ) => AuditActor = defaultActor,
  loadBefore?: LoadBefore
) {
  const middleware = new AuditLogCaptureMiddleware(
    publisher as never,
    routes,
    getActor,
    loadBefore
  );
  const app = new Hono();

  app.use("*", middleware.handle);

  app.post("/widgets", async (c) => {
    const body = await c.req.json();
    return c.json({ id: 42, ...body }, 201);
  });

  app.post("/widgets/fail", async (c) => {
    return c.json({ message: "nope" }, 400);
  });

  app.get("/widgets/:id", async (c) => {
    return c.json({ id: Number(c.req.param("id")) }, 200);
  });

  app.get("/widgets-export", async (c) => c.json({ ok: true }, 200));

  app.post("/login", async (c) =>
    c.json({ id: 5, username: "budi", role: "ADMIN" }, 200)
  );

  app.put("/widgets/:id", async (c) => {
    const body = await c.req.json();
    const row = store.get(Number(c.req.param("id")));
    if (row) Object.assign(row, body);
    return c.json({ id: Number(c.req.param("id")) }, 200);
  });

  app.put("/widgets/:id/cancel", async (c) => {
    const row = store.get(Number(c.req.param("id")));
    if (row) row.status = 6;
    return c.json({ ok: true }, 200);
  });

  app.delete("/widgets/:id", async (c) => {
    store.delete(Number(c.req.param("id")));
    return c.json({ ok: true }, 200);
  });

  app.put("/programs/:program_id/widgets/:id", async (c) => {
    const body = await c.req.json();
    return c.json({ ...body, id: Number(c.req.param("id")) }, 200);
  });

  return app;
}

describe("AuditLogCaptureMiddleware", () => {
  test("does not record when the route isn't whitelisted", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, []);

    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Widget" }),
    });

    expect(res.status).toBe(201);
    await flush();
    expect(publisher.calls).toHaveLength(0);
  });

  test("does not record a GET even on a whitelisted path", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      { match: /^\/widgets/, module: "widget" },
    ]);

    await app.request("/widgets/42");

    await flush();

    expect(publisher.calls).toHaveLength(0);
  });

  test("records a create on a whitelisted POST with a 2xx response", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      { match: /^\/widgets/, module: "widget" },
    ]);

    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Widget" }),
    });

    expect(res.status).toBe(201);
    await flush();
    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0]).toMatchObject({
      action: "create",
      module: "widget",
      actor_id: 1,
      actor_role: "SUPERADMIN",
      entity_id: 42,
    });
  });

  test("does not record when the response is not ok", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      { match: /^\/widgets/, module: "widget" },
    ]);

    const res = await app.request("/widgets/fail", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    await flush();
    expect(publisher.calls).toHaveLength(0);
  });

  test("extracts program_id and entity id from the route params on update", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      { match: /^\/programs\/\d+\/widgets/, module: "widget" },
    ]);

    const res = await app.request("/programs/7/widgets/9", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Renamed" }),
    });

    expect(res.status).toBe(200);
    await flush();
    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0]).toMatchObject({
      action: "update",
      module: "widget",
      program_id: 7,
      entity_id: 9,
    });
    expect(publisher.calls[0].metadata?.after).toMatchObject({
      name: "Renamed",
    });
  });

  test("still records when an earlier middleware already read the JSON body", async () => {
    const publisher = new FakePublisher();
    const middleware = new AuditLogCaptureMiddleware(
      publisher as never,
      [{ match: /^\/widgets/, module: "widget" }],
      defaultActor
    );
    const app = new Hono();

    app.use("*", async (c, next) => {
      await c.req.json();
      await next();
    });
    app.use("*", middleware.handle);
    app.post("/widgets", async (c) => {
      const body = await c.req.json();
      return c.json({ id: 42, ...body }, 201);
    });

    // Stream body, like a real server delivers it — some runtimes keep a
    // string body clonable after it's read, which hides the bug.
    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: new Blob([JSON.stringify({ name: "Widget" })]).stream(),
      duplex: "half",
    } as RequestInit);

    expect(res.status).toBe(201);
    await flush();
    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0].metadata?.after).toMatchObject({
      name: "Widget",
    });
  });

  test("records a whitelisted GET export route with an action override", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      {
        match: /^\/widgets-export/,
        module: "widget",
        action: "export",
        methods: ["GET"],
      },
    ]);

    const res = await app.request("/widgets-export");

    expect(res.status).toBe(200);
    await flush();
    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0]).toMatchObject({
      action: "export",
      module: "widget",
      actor_id: 1,
    });
  });

  test("does not record a GET on a route whose methods exclude it", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      { match: /^\/widgets-export/, module: "widget", action: "export" },
    ]);

    await app.request("/widgets-export");

    await flush();

    expect(publisher.calls).toHaveLength(0);
  });

  test("matches on method as well as path when several routes share a path", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(publisher, [
      {
        match: /^\/widgets-export/,
        module: "widget-get",
        action: "export",
        methods: ["GET"],
      },
      { match: /^\/widgets/, module: "widget" },
    ]);

    await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Widget" }),
    });

    await flush();

    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0]).toMatchObject({
      module: "widget",
      action: "create",
    });
  });

  test("takes the actor from the response body via getActor on login", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(
      publisher,
      [{ match: /^\/login$/, module: "auth", action: "login" }],
      (_c, body) => ({
        actorId: (body?.id as number) ?? null,
        actorName: (body?.username as string) ?? null,
        actorRole: (body?.role as string) ?? null,
      })
    );

    const res = await app.request("/login", { method: "POST" });

    expect(res.status).toBe(200);
    await flush();
    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0]).toMatchObject({
      action: "login",
      module: "auth",
      actor_id: 5,
      actor_name: "budi",
      actor_role: "ADMIN",
    });
  });

  test("records a null actor_id when getActor has no actor", async () => {
    const publisher = new FakePublisher();
    const app = buildApp(
      publisher,
      [{ match: /^\/widgets$/, module: "widget" }],
      () => ({ actorId: null, actorRole: null })
    );

    await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Widget" }),
    });

    await flush();

    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0].actor_id).toBeNull();
  });

  test("does not fail the request when the publisher throws", async () => {
    const throwing = {
      async record() {
        throw new Error("rabbitmq down");
      },
    };
    const app = buildApp(throwing, [
      { match: /^\/widgets/, module: "widget" },
    ]);

    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Widget" }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 42 });
    await flush();
  });

  test("does not wait for a slow publisher before responding", async () => {
    let release!: () => void;
    const slow = {
      record: () => new Promise<void>((r) => (release = r)),
    };
    const app = buildApp(slow, [{ match: /^\/widgets/, module: "widget" }]);

    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Widget" }),
    });

    expect(res.status).toBe(201);
    release();
  });

  test("never clones a non-JSON response", async () => {
    const publisher = new FakePublisher();
    const middleware = new AuditLogCaptureMiddleware(
      publisher as never,
      [{ match: /^\/download/, module: "widget", action: "export", methods: ["GET"] }],
      defaultActor
    );
    const app = new Hono();
    app.use("*", middleware.handle);
    app.get("/download", () => {
      const res = new Response("binary", {
        headers: { "content-type": "application/vnd.ms-excel" },
      });
      res.clone = () => {
        throw new Error("clone must not be called");
      };
      return res;
    });

    const res = await app.request("/download");
    await flush();

    expect(res.status).toBe(200);
    expect(publisher.calls).toHaveLength(1);
    expect(publisher.calls[0].action).toBe("export");
  });

  describe("before", () => {
    const put = (app: Hono, path: string, body: unknown) =>
      app.request(path, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

    test("loads the row before the handler runs, trimmed to the body keys", async () => {
      seedStore();
      const publisher = new FakePublisher();
      const app = buildApp(publisher, [widgetBefore], defaultActor, storeLoader);

      const res = await put(app, "/widgets/7", { name: "New" });
      await flush();

      expect(res.status).toBe(200);
      expect(store.get(7)?.name).toBe("New");
      expect(publisher.calls[0].metadata).toEqual({
        before: { name: "Old" },
        after: { name: "New" },
      });
    });

    test("keeps the whole row on a DELETE without a body", async () => {
      seedStore();
      const publisher = new FakePublisher();
      const app = buildApp(publisher, [widgetBefore], defaultActor, storeLoader);

      await app.request("/widgets/7", { method: "DELETE" });
      await flush();

      expect(publisher.calls[0].metadata?.before).toEqual({
        id: 7,
        name: "Old",
        status: 1,
        updated_at: "2026-01-01",
      });
    });

    test("does not load for a POST or when idFrom does not match", async () => {
      seedStore();
      const publisher = new FakePublisher();
      let calls = 0;
      const loader: LoadBefore = async (...args) => {
        calls++;
        return storeLoader(...args);
      };
      const app = buildApp(publisher, [widgetBefore], defaultActor, loader);

      await app.request("/widgets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "W" }),
      });
      await put(app, "/widgets/abc", { name: "W" });
      await flush();

      expect(calls).toBe(0);
      expect(publisher.calls.every((call) => call.metadata?.before === null)).toBe(true);
    });

    test("records before null and still responds when the loader throws", async () => {
      seedStore();
      const publisher = new FakePublisher();
      const app = buildApp(publisher, [widgetBefore], defaultActor, async () => {
        throw new Error("db down");
      });

      const res = await put(app, "/widgets/7", { name: "New" });
      await flush();

      expect(res.status).toBe(200);
      expect(publisher.calls[0].metadata?.before).toBeNull();
    });

    test("re-reads tracked columns the body doesn't carry into after", async () => {
      seedStore();
      const publisher = new FakePublisher();
      const route: AuditableRoute = {
        match: /^\/widgets\/\d+\/cancel$/,
        module: "widget",
        action: "update_status",
        before: { table: "widgets", idFrom: /^\/widgets\/(\d+)\/cancel$/, track: ["status"] },
      };
      const app = buildApp(publisher, [route], defaultActor, storeLoader);

      const res = await put(app, "/widgets/7/cancel", { reason: "stock out" });
      await flush();

      expect(res.status).toBe(200);
      expect(publisher.calls[0].metadata).toEqual({
        before: { status: 1 },
        after: { reason: "stock out", status: 6 },
      });
    });

    test("leaves before null when the service passes no loader", async () => {
      seedStore();
      const publisher = new FakePublisher();
      const app = buildApp(publisher, [widgetBefore]);

      await put(app, "/widgets/7", { name: "New" });
      await flush();

      expect(publisher.calls[0].metadata?.before).toBeNull();
    });
  });
});
