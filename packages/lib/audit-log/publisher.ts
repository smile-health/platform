import { Context } from "hono";
import { SyncPublisher } from "../base/sync-publisher.js";
import { Publisher } from "../rabbitmq/publisher.js";
import { TOPIC } from "../rabbitmq/topic.js";
import { clientIpFromForwardedFor } from "./client-ip.js";
import { maskSensitiveFields } from "./mask.js";
import { CreateAuditLogInput } from "./types.js";

// Re-exported: callers and tests import it from the publisher.
export { clientIpFromForwardedFor };

/**
 * Util to be called from the service layer of transaction modules (in any
 * service) to record an audit trail entry. Publishes async over RabbitMQ so
 * it never blocks the caller's own transaction/latency. Only apps/core's
 * AuditLogWorker actually inserts into audit_logs — every other service
 * just publishes to the shared topic.
 *
 * `service` identifies the publishing service ("core" | "main" | "warehouse"
 * | "auth" | "interop" | "wms") and is stamped on every record unless the
 * caller sets `data.service` explicitly.
 */
export class AuditLogPublisher extends SyncPublisher {
  constructor(
    publisher: Publisher,
    private readonly service: string,
  ) {
    super(publisher);
  }

  async record(c: Context, data: CreateAuditLogInput) {
    // Mask before the message ever leaves this process — a raw PII value
    // must never touch RabbitMQ, audit_logs, or the log viewer.
    const maskedMetadata = data.metadata
      ? {
          before: maskSensitiveFields(data.metadata.before ?? null),
          after: maskSensitiveFields(data.metadata.after ?? null),
        }
      : data.metadata;

    const message = {
      headers: stripCredentialHeaders(c.req.header()),
      payload: {
        ...data,
        service: data.service ?? this.service,
        metadata: maskedMetadata,
        ip: data.ip ?? clientIpFromForwardedFor(c.req.header("x-forwarded-for")),
      },
    };

    return await this.publish(TOPIC.AUDIT_LOG_CREATED, message);
  }
}

// The consumer never reads headers, and a queue message is no place for
// credentials, cookies or arbitrary client-supplied headers. Only this
// allowlist (lowercased) is forwarded, for debugging/tracing.
// interop-service's audit-log-publisher.ts mirrors this list.
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

/** Keeps only allowlisted (non-credential) headers; keys are lowercased. */
export function stripCredentialHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const k = key.toLowerCase();
    if (SAFE_HEADERS.has(k)) out[k] = value;
  }
  return out;
}

