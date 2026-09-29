import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import {
  AuditLogPublisher,
  clientIpFromForwardedFor,
  stripCredentialHeaders,
} from "../audit-log/publisher";

class FakeRabbit {
  messages: { topic: string; message: any }[] = [];
  async publish(topic: string, message: unknown) {
    this.messages.push({ topic, message });
  }
}

async function record(
  publisher: AuditLogPublisher,
  data: Parameters<AuditLogPublisher["record"]>[1]
) {
  const app = new Hono();
  app.get("/", async (c) => {
    await publisher.record(c, data);
    return c.text("ok");
  });
  await app.request("/");
}

describe("AuditLogPublisher", () => {
  test("stamps the constructor service and publishes to audit-log.created", async () => {
    const rabbit = new FakeRabbit();
    const publisher = new AuditLogPublisher(rabbit as never, "main");

    await record(publisher, { actor_id: 1, action: "create", module: "order" });

    expect(rabbit.messages).toHaveLength(1);
    expect(rabbit.messages[0].topic).toBe("audit-log.created");
    expect(rabbit.messages[0].message.payload.service).toBe("main");
  });

  test("an explicit data.service wins over the constructor service", async () => {
    const rabbit = new FakeRabbit();
    const publisher = new AuditLogPublisher(rabbit as never, "main");

    await record(publisher, {
      actor_id: null,
      action: "create",
      module: "order",
      service: "wms",
    });

    expect(rabbit.messages[0].message.payload.service).toBe("wms");
  });

  test("masks metadata before publishing", async () => {
    const rabbit = new FakeRabbit();
    const publisher = new AuditLogPublisher(rabbit as never, "core");

    await record(publisher, {
      actor_id: 1,
      action: "update",
      module: "user",
      metadata: { after: { email: "a@b.com", name: "Budi" } },
    });

    const after = rabbit.messages[0].message.payload.metadata.after;
    expect(after.email).not.toBe("a@b.com");
    expect(after.name).toBe("Budi");
  });

  test("never puts credential headers on the queue", async () => {
    const rabbit = new FakeRabbit();
    const publisher = new AuditLogPublisher(rabbit as never, "core");
    const app = new Hono();
    app.get("/", async (c) => {
      await publisher.record(c, { actor_id: 1, action: "update", module: "user" });
      return c.text("ok");
    });

    await app.request("/", {
      headers: {
        Authorization: "Bearer secret-token",
        Cookie: "session=abc",
        "Accept-Language": "id",
      },
    });

    const headers = rabbit.messages[0].message.headers;
    expect(headers.authorization).toBeUndefined();
    expect(headers.cookie).toBeUndefined();
    expect(headers["accept-language"]).toBe("id");
  });

  test("forwards only allowlisted headers, lowercased", () => {
    const out = stripCredentialHeaders({
      "Accept-Language": "id",
      "X-Program-Id": "3",
      Traceparent: "00-a-b-01",
      "X-Custom-Token": "t",
      Cookie: "c",
      Referer: "http://x",
    });
    expect(out).toEqual({
      "accept-language": "id",
      "x-program-id": "3",
      traceparent: "00-a-b-01",
    });
  });

  test("normalises x-forwarded-for to the rightmost trimmed hop", async () => {
    const rabbit = new FakeRabbit();
    const publisher = new AuditLogPublisher(rabbit as never, "core");
    const app = new Hono();
    app.get("/", async (c) => {
      await publisher.record(c, { actor_id: 1, action: "update", module: "user" });
      return c.text("ok");
    });

    await app.request("/", {
      headers: { "X-Forwarded-For": "6.6.6.6, 1.1.1.1 ,  2.2.2.2 " },
    });

    expect(rabbit.messages[0].message.payload.ip).toBe("2.2.2.2");
  });

  test("clientIpFromForwardedFor truncates to 255 and handles empty", () => {
    expect(clientIpFromForwardedFor("x".repeat(400))).toHaveLength(255);
    expect(clientIpFromForwardedFor(undefined)).toBeNull();
    expect(clientIpFromForwardedFor(" , ")).toBeNull();
  });
});
