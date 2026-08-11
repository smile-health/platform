import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { StringKeyspace, expireInSeconds } from "encore.dev/storage/cache";
import log from "encore.dev/log";
import { cacheCluster } from "../cache/cache";
import { syncProfileLocally } from "./sync-profile";

interface AuthParams {
  authorization: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  entityId: number;
  entityTag: string;
  isSuperAdmin: boolean;
  tag: string;
  role: string;
  externalRoles: string;
  userNumericId: number;
  entityTypeName: string;
  externalPropertiesRoleType: string;
  // Mirrors the original's `req.user?.providerType` — populated by
  // sync-profile.ts's getProviderType from the local `partnership` table.
  // `null` has the same meaning as the original's falsy check (not a
  // transporter-type entity, or no active partnership row yet).
  providerType: string | null;
}

// Mirrors wms-service's handleValidateToken.ts + authorization.ts: calls apps/core's
// GET /account/profile with the bearer token, maps the response onto AuthData, and
// (via sync-profile.ts) JIT-provisions/refreshes the local entities/users rows and
// recomputes providerType/providerTypes/fcm_token from local tables — see
// sync-profile.ts's header comment for why this matters (local joins silently
// dropping unseeded entities/users without it).
//
// Field set matches apps/web/wms-module's RequestloginResponse type (the
// frontend's /set-auth consumer), which expects the full core profile object
// verbatim — not just the fields AuthData narrows down to. Encore's static
// analyzer doesn't support index signatures on API response types, so this
// must be spelled out explicitly rather than left open-ended.
export interface CoreProfileResponse {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string | null;
  date_of_birth: string;
  gender: number;
  mobile_phone: string;
  address: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  entity_id: number;
  role: number;
  village_id: string;
  status: number;
  last_login: string;
  last_device: number;
  view_only: number;
  manufacture_id: number | null;
  keycloak_uuid: string;
  user_uuid: string;
  external_properties?: {
    role?: {
      id: number;
      name: string;
      type: string;
    };
  };
  role_id: number;
  role_label: string;
  gender_label: string;
  external_roles?: string[];
  entity: {
    id: number;
    name: string;
    type: number;
    address: string;
    tag: string;
    province_id: string;
    regency_id: string;
    sub_district_id: string;
    village_id: string;
    integration_type: number;
    entity_type: {
      id: number;
      name: string;
      integration_type: number;
    };
    location: string;
  };
  programs: Array<{
    id: number;
    key: string;
    name: string;
    config: {
      material: {
        is_hierarchy_enabled: boolean;
        is_batch_enabled: boolean;
      };
      color: string;
    };
    status: number;
    entity_id: number;
    manufacture_id: number | null;
  }>;
  providerType: string | null;
  providerTypes: string;
  user_is_active: boolean;
  entity_is_active: boolean;
  fcm_token: string | null;
}

const authCache = new StringKeyspace<string>(cacheCluster, {
  keyPattern: "auth:token/:key",
});

// Caches the raw core profile response (not just the narrowed AuthData) so
// /set-auth (auth.controller.ts) can return it to the frontend without a
// second call to core on every request.
const profileCache = new StringKeyspace<string>(cacheCluster, {
  keyPattern: "auth:profile/:key",
});

const DEFAULT_TOKEN_TTL_SECONDS = 3600;

export async function getCachedProfile(token: string): Promise<CoreProfileResponse | null> {
  const cached = await profileCache.get(token);
  return cached ? (JSON.parse(cached) as CoreProfileResponse) : null;
}

export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const token = params.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  const cached = await authCache.get(token);
  if (cached) {
    return JSON.parse(cached) as AuthData;
  }

  if (!process.env.CORE_API_URL) {
    throw new Error("CORE_API_URL environment variable is not set");
  }

  const url = process.env.CORE_API_URL + "/account/profile";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "accept-language": "en",
      "device-type": "web",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "<unreadable body>");
    log.error("token validation failed", {
      url,
      status: response.status,
      statusText: response.statusText,
      body,
    });
    throw APIError.unauthenticated("invalid or expired token");
  }

  const profile = (await response.json()) as CoreProfileResponse;
  const externalRoles = profile.external_roles ?? [];
  const externalPropertiesRoleType = profile.external_properties?.role?.type ?? "";

  const extras = await syncProfileLocally(profile).catch((error) => {
    // A sync failure shouldn't fail authentication itself — same
    // fail-open posture as the rest of this handler's cross-service calls.
    // The frontend just gets undefined providerType/providerTypes/fcm_token
    // and defaulted-true active flags for this one request, exactly like
    // before this sync step existed.
    log.error("failed to sync local entity/user tables from core profile", {
      entityId: profile.entity_id,
      userId: profile.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  });

  const enrichedProfile: CoreProfileResponse = {
    ...profile,
    providerType: extras?.providerType ?? null,
    providerTypes: extras?.providerTypes ?? profile.providerTypes,
    fcm_token: extras?.fcmToken ?? null,
    user_is_active: extras?.userIsActive ?? true,
    entity_is_active: extras?.entityIsActive ?? true,
  };

  const authData: AuthData = {
    userID: profile.user_uuid,
    entityId: profile.entity_id,
    entityTag: profile.entity.tag,
    isSuperAdmin: externalRoles.includes("super_admin"),
    tag: profile.entity.tag,
    role: externalPropertiesRoleType,
    externalRoles: externalRoles.toString(),
    userNumericId: profile.id,
    entityTypeName: profile.entity.entity_type.name,
    externalPropertiesRoleType,
    providerType: extras?.providerType ?? null,
  };

  const ttlSeconds = Number(process.env.EXPIRED_TOKEN) || DEFAULT_TOKEN_TTL_SECONDS;
  await authCache.set(token, JSON.stringify(authData), { expiry: expireInSeconds(ttlSeconds) });
  await profileCache.set(token, JSON.stringify(enrichedProfile), { expiry: expireInSeconds(ttlSeconds) });

  return authData;
});

// Without this, endpoints declaring auth:true fail with "endpoint requires auth
// but none provided" — the gateway needs an explicit authHandler binding, an
// authHandler() export alone isn't enough.
export const gateway = new Gateway({ authHandler: auth });
