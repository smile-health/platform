// Routes — mirrors apps/wms-service's userFcmTokenRoutes.ts (mounted at
// v1Router.use('/fcm-token', ...), i.e. under /api/v1):
//
//   GET    /api/v1/fcm-token         getOneByIdentity
//   PATCH  /api/v1/fcm-token/:token  createOrUpdateFcmToken
//
// Both routes were: authenticate, rateLimitter, authorizeRoles(allRead).
// Encore's auth:true covers `authenticate`. authorizeRoles is a documented
// no-op (see partnership/rbac.ts — the original doesn't enforce it either).
// rateLimitter has no Encore equivalent wired yet anywhere in this port —
// left as a real, separate gap, not specific to this module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./user-fcm-token.service";
import type {
  CreateOrUpdateUserFcmTokenRequest,
  CreateOrUpdateUserFcmTokenResponse,
  GetUserFcmTokenRequest,
  GetUserFcmTokenResponse,
} from "./user-fcm-token.types";

export const getOneByIdentity = api(
  { method: "GET", path: "/api/v1/fcm-token", auth: true, expose: true },
  async (req: GetUserFcmTokenRequest): Promise<GetUserFcmTokenResponse> => {
    const data = await service.getUserFcmTokenByIdentity({
      id: req.id,
      entityId: req.entityId,
    });
    return { status: "success", data };
  },
);

export const createOrUpdateFcmToken = api(
  { method: "PATCH", path: "/api/v1/fcm-token/:token", auth: true, expose: true },
  async (
    req: CreateOrUpdateUserFcmTokenRequest,
  ): Promise<CreateOrUpdateUserFcmTokenResponse> => {
    const { userNumericId, entityId, userID } = getAuthData()!;
    const data = await service.createOrUpdateFcmToken({
      userId: userNumericId,
      entityId,
      userUuid: userID,
      token: req.token,
    });
    return { status: "success", data };
  },
);
