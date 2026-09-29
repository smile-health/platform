export type AuditLogMetadata = {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
} | null;

export type CreateAuditLogInput = {
  program_id?: number | null;
  // Null when the request has no resolvable actor (e.g. interop admin routes,
  // or a login whose response carries no user id).
  actor_id: number | null;
  // Set this when the publisher can't rely on the reader's usual join to
  // resolve a display name — e.g. a cross-service publisher (WMS backend)
  // whose actor_id comes from a different user table than the one the
  // audit-log viewer joins against. Left null, the reader falls back to
  // its own user lookup (SMILE-originated rows).
  actor_name?: string | null;
  actor_role?: string | null;
  action: string;
  module: string;
  // Originating service: "core" | "main" | "warehouse" | "auth" | "interop" | "wms".
  // Filled in by AuditLogPublisher from its constructor when left unset.
  service?: string | null;
  entity_id?: number | null;
  metadata?: AuditLogMetadata;
  ip?: string | null;
};
