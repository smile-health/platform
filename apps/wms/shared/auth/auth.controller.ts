// Mirrors wms-service's GET /api/v1/set-auth (authController.ts). In the
// original, this endpoint explicitly primed the token/user-info cache before
// the frontend made further calls. Here, the encore.dev authHandler
// (authHandler.ts in this same directory) already validates + caches the
// token on every `auth: true` request, so this endpoint just needs to
// declare auth:true and return the resulting AuthData to keep the same API
// contract.
//
// Lives alongside authHandler.ts (rather than its own service) because
// Encore implicitly treats this directory as the "auth" service due to the
// authHandler/Gateway definitions here — a separate top-level `auth/`
// service would collide with that implicit service name.

import { api, Header, APIError } from "encore.dev/api";
import { getCachedProfile, type CoreProfileResponse } from "./authHandler";

interface SetAuthRequest {
  authorization: Header<"Authorization">;
}

interface SetAuthResponse {
  status: "success";
  data: CoreProfileResponse;
}

export const setAuth = api(
  { method: "GET", path: "/api/v1/set-auth", auth: true, expose: true },
  async (req: SetAuthRequest): Promise<SetAuthResponse> => {
    const token = req.authorization?.replace(/^Bearer\s+/i, "");
    // The authHandler (which already ran to authorize this request) populates
    // this cache, so it's expected to be present here.
    const profile = token ? await getCachedProfile(token) : null;
    if (!profile) {
      throw APIError.unauthenticated("invalid or expired token");
    }
    // authHandler.ts's sync-profile.ts step already enriched this cached
    // profile with real user_is_active/entity_is_active/providerType/
    // providerTypes/fcm_token from the local tables before caching it — see
    // that module for details. This still doesn't enforce deactivated
    // user/entity blocking (a known gap, tracked separately).
    return {
      status: "success",
      data: profile,
    };
  }
);
