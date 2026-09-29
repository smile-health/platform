// Records whitelisted WMS writes (see shared/audit/audit-routes.ts) to the
// unified audit trail by publishing to RabbitMQ. Register in each service's
// encore.service.ts AFTER errorEnvelope: `middlewares: [errorEnvelope, auditTrail]`.
// Encore runs middlewares in array order (first = outermost), so audit sits
// inside errorEnvelope: a handler that throws propagates through audit as an
// exception (not recorded) and only then gets turned into an error envelope,
// while a normal return means a 2xx.
//
// Best-effort: nothing here may affect the response.

import { middleware } from "encore.dev/api";
import log from "encore.dev/log";
import { getAuthData } from "~encore/auth";
import { getCachedProfile } from "../auth/authHandler";
import { publishAuditLog } from "../audit/audit-log-publisher";
import {
  clientIpFromForwardedFor,
  extractEntityId,
  resolveAuditRoute,
} from "../audit/audit-routes";

function headerValue(h: string | string[] | undefined): string | undefined {
  return Array.isArray(h) ? h[0] : h;
}

export const auditTrail = middleware(async (req, next) => {
  const meta = req.requestMeta;
  if (!meta || meta.type !== "api-call") return next(req);

  const resolved = resolveAuditRoute(meta.method, meta.path);
  if (!resolved) return next(req);

  const resp = await next(req);

  // Detached: profile lookup + publish must never delay the response.
  void (async () => {
    const payload = resp.payload as { status?: unknown } | null | undefined;
    // Handlers return {status:"success"}; anything else is not a completed write.
    if (payload && typeof payload === "object" && payload.status !== undefined && payload.status !== "success") {
      return;
    }

    const auth = getAuthData();
    let actorName: string | null = null;
    let actorRole: string | null = auth?.role || null;
    const token = headerValue(meta.headers["authorization"])?.replace(/^Bearer\s+/i, "");
    if (token) {
      const profile = await getCachedProfile(token).catch(() => null);
      if (profile) {
        actorName =
          [profile.firstname, profile.lastname].filter(Boolean).join(" ").trim() ||
          profile.username ||
          null;
        actorRole = profile.role_label || actorRole;
      }
    }

    const programHeader = Number(headerValue(meta.headers["x-program-id"]));
    const body = meta.parsedPayload as Record<string, unknown> | undefined;

    publishAuditLog({
      program_id: Number.isFinite(programHeader) && programHeader > 0 ? programHeader : null,
      actor_id: auth?.userNumericId ?? null,
      actor_name: actorName,
      actor_role: actorRole,
      action: resolved.action,
      module: resolved.route.module,
      entity_id: extractEntityId(meta.pathParams, resp.payload),
      metadata: { before: null, after: body ?? (resp.payload as Record<string, unknown>) ?? null },
      ip: clientIpFromForwardedFor(meta.headers["x-forwarded-for"]),
    });
  })().catch((err) => {
    log.error("audit-log capture failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return resp;
});
