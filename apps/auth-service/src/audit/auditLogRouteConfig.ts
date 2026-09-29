import type { Context } from "hono";
import type {
  AuditableRoute,
  AuditActor,
} from "@smile-health/lib/audit-log/capture-middleware.js";

// Whitelist of auth-service routes recorded in the audit trail. Paths are the
// real mounted paths (routes are registered without a prefix in index.ts;
// API_PREFIX is applied by the reverse proxy). Only 2xx responses are logged.
// Deliberately NOT listed: forgot-password, validate-token.
export const AUDITED_ROUTES: AuditableRoute[] = [
  { match: /^\/login\/?$/, module: "auth", action: "login", methods: ["POST"] },
  { match: /^\/logout\/?$/, module: "auth", action: "logout", methods: ["POST"] },
  {
    match: /^\/executive\/login\/?$/,
    module: "executive_auth",
    action: "login",
    methods: ["POST"],
  },
  {
    match: /^\/executive\/logout\/?$/,
    module: "executive_auth",
    action: "logout",
    methods: ["POST"],
  },
  { match: /^\/users(\/.*)?$/, module: "keycloak_user" },
];

type JwtClaims = {
  sub?: string;
  preferred_username?: string;
  name?: string;
  realm_access?: { roles?: string[] };
};

// Display-only decode (no signature verification): the value is used for the
// audit log's actor name, never for authorization.
function decodeJwt(token: string | undefined | null): JwtClaims | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function toActor(claims: JwtClaims | null): AuditActor {
  return {
    // Keycloak identifies users by UUID; the numeric SMILE user id is not
    // available in auth-service, so actor_id stays null and actor_name is used.
    actorId: null,
    actorName: claims?.preferred_username ?? claims?.name ?? claims?.sub ?? null,
    actorRole: claims?.realm_access?.roles?.[0] ?? null,
  };
}

export function getAuditActor(
  c: Context,
  responseBody: Record<string, unknown> | null,
): AuditActor {
  // login: the actor is only known from the response (authDetails.access_token)
  const authDetails = responseBody?.authDetails as
    | { access_token?: string }
    | undefined;
  if (authDetails?.access_token) {
    return toActor(decodeJwt(authDetails.access_token));
  }
  // logout / users: bearer token of the caller
  const bearer = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  return toActor(decodeJwt(bearer));
}
