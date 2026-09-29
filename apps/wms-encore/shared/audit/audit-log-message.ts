// Pure message builder (no encore/amqp imports) so it is unit-testable.
// Wire format matches packages/lib/audit-log/publisher.ts.

import { maskSensitiveFields } from "./audit-log-mask";

export type AuditLogMetadata = {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
} | null;

export type AuditLogInput = {
  program_id?: number | null;
  actor_id: number | null;
  actor_name?: string | null;
  actor_role?: string | null;
  action: string;
  module: string;
  entity_id?: number | null;
  metadata?: AuditLogMetadata;
  ip?: string | null;
};

export function buildAuditMessage(
  data: AuditLogInput,
  headers: Record<string, string> = {},
) {
  const metadata = data.metadata
    ? {
        before: maskSensitiveFields(data.metadata.before ?? null),
        after: maskSensitiveFields(data.metadata.after ?? null),
      }
    : (data.metadata ?? null);

  return {
    headers,
    payload: {
      service: "wms",
      program_id: data.program_id ?? null,
      actor_id: data.actor_id ?? null,
      actor_name: data.actor_name ?? null,
      actor_role: data.actor_role ?? null,
      action: data.action,
      module: data.module,
      entity_id: data.entity_id ?? null,
      metadata,
      ip: data.ip ?? null,
    },
  };
}

