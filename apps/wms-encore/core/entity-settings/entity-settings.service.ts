import { APIError, ErrCode } from "encore.dev/api";
import { createEntitySettingsSchema, updateEntitySettingsSchema } from "./entity-settings.schema";
import * as repo from "./entity-settings.repository";
import type { EntitySettings } from "./entity-settings.types";

// entitySettingsController.ts's res.fail(...) calls are audited call-by-call below.
// Most omit the options object entirely -> plain 400 (ErrCode.FailedPrecondition).
// Only createEntitySettings's duplicate-name check passes {isValidationError: true}
// -> 422 (ErrCode.InvalidArgument). None of the calls pass isNotFoundError,
// isUnauthorizedError, isForbiddenError, or isRateLimitError, so none of those
// endpoints map to 404/401/403/429 despite reading like "not found" cases.

export async function getEntitySettingsById(id: string): Promise<EntitySettings> {
  if (!id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const data = await repo.findEntitySettingsById(Number(id));
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "EntitySettings not found");
  }
  return data;
}

export async function getAllEntitySettings(input: {
  limit?: string;
  page?: string;
  search?: string;
  entityId?: string;
}): Promise<{
  data: EntitySettings[];
  pagination: { total: number; pages: number; currentPage: number; perPage: number };
}> {
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Math.min(Number(input.limit), 1000)
    : 10;
  const page = Number.isInteger(Number(input.page)) && Number(input.page) > 0 ? Number(input.page) : 1;

  return repo.findAllEntitySettings(limit, page, input.search, input.entityId);
}

export async function createEntitySettings(input: {
  entityId?: number;
  settingName: string;
  settingValue: string;
  createdBy: string;
}): Promise<EntitySettings> {
  const parsed = createEntitySettingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.FailedPrecondition, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // entityId falls back to the caller's own entity, mirroring
  // entitySettingsController.ts: `req.body.entityId ?? req.user?.entity.id`.
  const entityId = parsed.data.entityId ?? 0;

  const canCreate = await repo.checkDuplication(entityId, parsed.data.settingName, parsed.data.settingValue);
  if (!canCreate) {
    // CreateEntitySettingUseCase returns a string here, and the controller maps
    // that string return -> res.fail(data, { isValidationError: true }) -> 422.
    throw new APIError(
      ErrCode.InvalidArgument,
      `Entity setting with name ${parsed.data.settingName} already exists for entity ID ${entityId}`
    );
  }

  return repo.createEntitySettings({
    entityId,
    settingName: parsed.data.settingName,
    settingValue: parsed.data.settingValue,
    createdBy: input.createdBy,
  });
}

export async function updateEntitySettings(input: {
  id: string;
  entityId?: number;
  settingName?: string;
  settingValue?: string;
  updatedBy: string;
}): Promise<EntitySettings | string> {
  if (!input.id) {
    throw new APIError(ErrCode.FailedPrecondition, "id parameter is required");
  }

  const parsed = updateEntitySettingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.FailedPrecondition, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const numericId = Number(input.id);
  const existing = await repo.findEntitySettingsById(numericId);
  if (!existing) {
    // UpdateEntitySettingsUseCase returns a string message here (not null) —
    // the original controller's `if (data === null)` check never actually
    // catches this path, so the not-found string falls through to
    // res.success(data) verbatim. Preserved as-is rather than "fixed" into a
    // proper 400/404, per entity-settings.types.ts's note on this method.
    return `Entity setting with ID ${input.id} not found`;
  }

  const entityId = parsed.data.entityId ?? existing.entityId;
  const settingName = parsed.data.settingName ?? existing.settingName;
  const settingValue = parsed.data.settingValue ?? existing.settingValue;

  await repo.updateEntitySettings({
    id: numericId,
    entityId,
    settingName,
    settingValue,
    updatedBy: input.updatedBy,
  });

  return {
    ...existing,
    entityId,
    settingName,
    settingValue,
    updatedBy: input.updatedBy,
    updatedAt: new Date(),
  };
}

export async function deleteEntitySettings(id: string): Promise<boolean> {
  if (!id) {
    // DeleteEntitySettingsUseCase throws a plain Error here, which the
    // controller's catch-all maps to res.error(...) -> 500, not a fail(). We
    // preserve that as Internal rather than FailedPrecondition.
    throw new APIError(ErrCode.Internal, "ID is required to delete an partner vehicle");
  }

  const existing = await repo.findEntitySettingsById(Number(id));
  if (!existing) {
    // deleteEntitiySettings controller: res.fail({ error: 'data not found' })
    // — no isXError flag, so still a plain 400. The original passes an object
    // as the fail payload; APIError only carries a string message, so the
    // object is flattened to its equivalent message text here.
    throw new APIError(ErrCode.FailedPrecondition, "data not found");
  }

  return repo.deleteEntitySettings(Number(id));
}
