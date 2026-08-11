import * as repo from "./user-fcm-token.repository";
import type {
  CreateOrUpdateUserFcmTokenInput,
  GetUserFcmTokenInput,
  UserFcmToken,
} from "./user-fcm-token.types";

// IMPORTANT: unlike entity-location's controller, userFcmTokenController.ts
// never calls res.fail(...) anywhere — every error path (missing params,
// not-found, unexpected repo failures) goes through res.error(...), which is
// ALWAYS a 500 "error" envelope regardless of what caused it (see
// jsonResponse.ts: res.error ignores any option and always .status(500)s).
// So every throw below is a plain `Error` (never APIError), matching the
// "un-flagged Error -> 500" pattern already used elsewhere in this port
// (entity-location.controller.ts's getAllEntityLocation/deleteEntityLocation).

// Mirrors GetByIdentity.ts's execute(): both the use-case's own
// `!id || !entityId` guard and the controller's identical duplicate guard
// collapse to the same single check and message here.
export async function getUserFcmTokenByIdentity(
  input: GetUserFcmTokenInput,
): Promise<UserFcmToken> {
  if (!input.id || !input.entityId) {
    // GetByIdentity.ts: throw new Error('ID and entity ID are required to get a user FCM token')
    // (also duplicated as the controller's own res.error(...) guard, same message)
    throw new Error("ID and entity ID are required to get a user FCM token");
  }

  const data = await repo.findByIdentity(input.id, Number(input.entityId));
  if (!data) {
    // controller: res.error('User FCM token not found') — no flag, always 500
    throw new Error("User FCM token not found");
  }
  return data;
}

// Mirrors CreateOrUpdate.ts's execute(): the original has no validation of
// its own beyond what's already guaranteed by the controller pulling
// userId/entityId/userUuid off req.user and token off the route param —
// there is no not-found / already-exists branch here at all, it always
// upserts.
export async function createOrUpdateFcmToken(
  input: CreateOrUpdateUserFcmTokenInput,
): Promise<UserFcmToken> {
  return repo.createOrUpdateToken({
    userId: input.userId,
    entityId: input.entityId,
    userUuid: input.userUuid,
    token: input.token,
  });
}
