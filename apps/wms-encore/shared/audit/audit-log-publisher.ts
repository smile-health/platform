// Publishes audit events to the same `audit-log.created` fanout exchange that
// apps/core's AuditLogWorker consumes. Wire format matches
// packages/lib/audit-log/publisher.ts + packages/lib/rabbitmq/publisher.ts:
//   exchange: audit-log.created (fanout, durable), routing key "",
//   body: JSON { headers, payload: CreateAuditLogInput }, persistent.
//
// Best-effort: publishAuditLog never throws and never blocks the caller.
// Config: RABBITMQ_URL env var (same mechanism as CORE_API_URL etc. — this app
// reads config via process.env, not Encore secret()). If unset, auditing is a
// no-op with a single warning.

import amqp from "amqplib";
import log from "encore.dev/log";
import { buildAuditMessage, type AuditLogInput } from "./audit-log-message";

export { buildAuditMessage };
export type { AuditLogInput, AuditLogMetadata } from "./audit-log-message";

export const AUDIT_LOG_EXCHANGE = "audit-log.created";

type Conn = Awaited<ReturnType<typeof amqp.connect>>;
type Chan = Awaited<ReturnType<Conn["createChannel"]>>;

let channelPromise: Promise<Chan> | undefined;
let warnedNoUrl = false;

let currentConnection: Conn | undefined;

// Drops the cached channel and closes the connection it belonged to
// (best-effort). `only` guards against a stale event from an older
// connection tearing down a newer, healthy one.
function resetConnection(only?: Conn) {
  if (only && currentConnection !== only) {
    void Promise.resolve().then(() => only.close()).catch(() => {});
    return;
  }
  channelPromise = undefined;
  const old = currentConnection;
  currentConnection = undefined;
  if (old) void Promise.resolve().then(() => old.close()).catch(() => {});
}

function getChannel(url: string): Promise<Chan> {
  if (channelPromise) return channelPromise;
  const p = (async () => {
    const connection = await amqp.connect(url);
    currentConnection = connection;
    try {
      connection.on("error", (err: unknown) => {
        log.warn("audit-log: rabbitmq connection error", { error: String(err) });
        resetConnection(connection);
      });
      connection.on("close", () => resetConnection(connection));
      const channel = await connection.createChannel();
      channel.on("error", (err: unknown) => {
        log.warn("audit-log: rabbitmq channel error", { error: String(err) });
        resetConnection(connection);
      });
      channel.on("close", () => resetConnection(connection));
      await channel.assertExchange(AUDIT_LOG_EXCHANGE, "fanout", { durable: true });
      return channel;
    } catch (err) {
      resetConnection(connection);
      throw err;
    }
  })();
  channelPromise = p;
  p.catch(() => {
    if (channelPromise === p) channelPromise = undefined;
  });
  return p;
}

export function publishAuditLog(
  data: AuditLogInput,
  headers: Record<string, string> = {},
): void {
  const url = process.env.RABBITMQ_URL;
  if (!url) {
    if (!warnedNoUrl) {
      warnedNoUrl = true;
      log.warn("audit-log: RABBITMQ_URL is not set, audit events will not be published");
    }
    return;
  }

  void (async () => {
    // Message build errors (e.g. JSON) are not connection errors: log and
    // leave the connection alone.
    let body: Buffer;
    try {
      body = Buffer.from(JSON.stringify(buildAuditMessage(data, headers)));
    } catch (err) {
      log.error("audit-log: failed to build audit event", {
        error: err instanceof Error ? err.message : String(err),
      });
      return;
    }
    try {
      const channel = await getChannel(url);
      channel.publish(AUDIT_LOG_EXCHANGE, "", body, { persistent: true });
    } catch (err) {
      // connect/channel/publish failure: close the old connection and reset.
      resetConnection();
      log.error("audit-log: failed to publish audit event", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();
}
