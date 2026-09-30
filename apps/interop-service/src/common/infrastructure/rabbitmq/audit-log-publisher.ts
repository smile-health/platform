/**
 * Audit-log capture for interop-service admin write routes.
 *
 * Deliberately self-contained (no @smile-health/lib import): this service is
 * built with plain tsc and run with `node dist/...` in CommonJS, which cannot
 * load the lib's TypeScript/ESM sources. The message format MUST stay
 * identical to packages/lib/audit-log/publisher.ts:
 *   fanout exchange "audit-log.created", body { headers, payload }.
 * The admin routes carry no request body, so no PII masking is needed here.
 */
import type { Channel } from "amqplib";
import type { Context, MiddlewareHandler } from "hono";
import type { Logger } from "pino";
import { clientIpFromForwardedFor } from "./client-ip";

export const AUDIT_LOG_EXCHANGE = "audit-log.created";

// mirrors packages/lib/audit-log/publisher.ts
const SAFE_HEADERS = new Set([
  "accept-language",
  "user-agent",
  "device-type",
  "timezone",
  "x-program-id",
  "x-request-id",
  "x-trace-id",
  "traceparent",
]);


export type AuditableRoute = {
  match: RegExp;
  module: string;
  action: string;
  methods: string[];
};

export function createAuditLogMiddleware(
  getChannel: () => Channel,
  routes: AuditableRoute[],
  logger: Logger,
  service = "interop",
): MiddlewareHandler {
  let asserted = false;

  const record = async (c: Context, route: AuditableRoute) => {
    const channel = getChannel();
    if (!asserted) {
      await channel.assertExchange(AUDIT_LOG_EXCHANGE, "fanout", {
        durable: true,
      });
      asserted = true;
    }
    const message = {
      // Allowlist only; mirrors packages/lib/audit-log/publisher.ts
      headers: Object.fromEntries(
        Object.entries(c.req.header())
          .map(([key, value]) => [key.toLowerCase(), value] as const)
          .filter(([key]) => SAFE_HEADERS.has(key)),
      ),
      payload: {
        actor_id: null, // admin routes are unauthenticated: no resolvable actor
        actor_name: null,
        actor_role: null,
        action: route.action,
        module: route.module,
        service,
        entity_id: null,
        metadata: null,
        ip: clientIpFromForwardedFor(c.req.header("x-forwarded-for")),
      },
    };
    channel.publish(
      AUDIT_LOG_EXCHANGE,
      "",
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  };

  return async (c, next) => {
    const route = routes.find(
      (r) => r.methods.includes(c.req.method) && r.match.test(c.req.path),
    );
    await next();
    if (!route || !c.res.ok) return;
    try {
      await record(c, route);
    } catch (error) {
      asserted = false;
      logger.error({ error }, "audit-log publish failed");
    }
  };
}
