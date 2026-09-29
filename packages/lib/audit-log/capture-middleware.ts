import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { logger } from "../logger.js";
import { AuditLogPublisher } from "./publisher.js";

const ACTION_BY_METHOD: Record<string, string> = {
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const DEFAULT_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export type AuditableRoute = {
  match: RegExp;
  module: string;
  // Overrides the method-derived action (create/update/delete), e.g. "export",
  // "login" or "logout".
  action?: string;
  // HTTP methods this route is recorded for. Defaults to POST/PUT/PATCH/DELETE;
  // set e.g. ["GET"] to whitelist a read-only export endpoint.
  methods?: string[];
};

export type AuditActor = {
  // Null when the request has no resolvable actor (e.g. interop admin routes).
  actorId: number | null;
  actorName?: string | null;
  actorRole: string | null;
};

/**
 * Generic capture: whitelisted routes only (route list is passed in by each
 * service, e.g. apps/core/.../audit-log.constants.ts). A request is recorded
 * when a route matches both its path and its method (see `methods`) and the
 * response is 2xx. The action is `route.action` if set, otherwise derived from
 * the method (POST=create, PUT/PATCH=update, DELETE=delete).
 *
 * `getActor` receives the parsed JSON response body (or null), so routes like
 * login can take the actor from the response instead of the request context.
 *
 * Doesn't know a module's real "before" state — `metadata.before` is always
 * null here, `metadata.after` is the request body. A module that needs a real
 * before/after diff should call `AuditLogPublisher.record()` directly from
 * its own service layer instead of relying on this middleware.
 *
 * Also operates at HTTP-route granularity, not DB-table granularity: one
 * endpoint can write to several tables in a single request (e.g. an order
 * status change touching orders + order_histories + order_comments) and
 * this middleware can only label it with the one `module` its route matched.
 * Per-table precision needs an explicit AuditLogPublisher.record() call at
 * the point each table is actually written.
 *
 * Capturing is best-effort: any failure after the handler ran (reading the
 * response, resolving the actor, publishing) is logged and never affects the
 * response. Publishing is fire-and-forget and does not delay the response.
 */
export class AuditLogCaptureMiddleware {
  constructor(
    private readonly publisher: AuditLogPublisher,
    private readonly routes: AuditableRoute[],
    private readonly getActor: (
      c: Context,
      responseBody: Record<string, unknown> | null,
    ) => AuditActor,
  ) {}

  handle = createMiddleware(async (c, next) => {
    const method = c.req.method;
    const route = this.routes.find(
      (r) =>
        (r.methods ?? DEFAULT_METHODS).includes(method) &&
        r.match.test(c.req.path),
    );

    if (!route) {
      await next();
      return;
    }

    const action = route.action ?? ACTION_BY_METHOD[method];
    if (!action) {
      await next();
      return;
    }

    // Go through Hono's body cache instead of c.req.raw.clone(): an earlier
    // middleware (e.g. AuthKeycloakMiddleware) may already have called
    // c.req.json(), which consumes the raw stream and makes clone() throw
    // "Body is disturbed or locked".
    const requestBody = await this.#readRequestJson(c);

    await next();

    try {
      if (!c.res.ok) return;

      // Only clone JSON responses: cloning a binary/stream response (xls
      // export, file download) would tee and buffer the whole body.
      const isJson = (c.res.headers.get("content-type") ?? "").includes(
        "application/json",
      );
      const responseBody = isJson ? await this.#readJson(c.res.clone()) : null;
      const actor = this.getActor(c, responseBody);

      const input = {
        // Tenancy here rides on the x-program-id header (c.var.programId),
        // not the URL; the route param is kept as a fallback.
        program_id:
          this.#toNumber((c.var as { programId?: number | string }).programId?.toString()) ??
          this.#toNumber(c.req.header("x-program-id")) ??
          this.#toNumber(c.req.param("program_id")),
        actor_id: actor.actorId,
        actor_name: actor.actorName ?? null,
        actor_role: actor.actorRole,
        action,
        module: route.module,
        entity_id: this.#extractEntityId(c, responseBody),
        metadata: { before: null, after: requestBody ?? responseBody ?? null },
      };

      // Fire-and-forget: publishing must never hold the response.
      void this.publisher.record(c, input).catch((err) => {
        logger.error({ err }, "audit-log publish failed");
      });
    } catch (error) {
      logger.error({ err: error }, "audit-log capture failed");
    }
  });

  async #readRequestJson(c: Context): Promise<Record<string, unknown> | null> {
    try {
      const contentType = c.req.header("content-type") ?? "";
      if (!contentType.includes("application/json")) return null;
      return (await c.req.json()) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async #readJson(res: {
    headers: { get(name: string): string | null };
    json(): Promise<unknown>;
  }): Promise<Record<string, unknown> | null> {
    try {
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) return null;
      return (await res.json()) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  #extractEntityId(
    c: Context,
    responseBody: Record<string, unknown> | null,
  ): number | null {
    const paramId = c.req.param("id");
    if (paramId && !isNaN(Number(paramId))) return Number(paramId);

    const bodyId =
      responseBody?.id ??
      (responseBody?.result as Record<string, unknown> | undefined)?.id;
    if (bodyId !== undefined && !isNaN(Number(bodyId))) return Number(bodyId);

    return null;
  }

  #toNumber(value?: string): number | null {
    if (!value || isNaN(Number(value))) return null;
    return Number(value);
  }
}
