import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./global-settings.repository";
import { globalSettingsBodySchema } from "./global-settings.schema";
import type { GlobalSettings, PaginatedGlobalSettings } from "./global-settings.types";

// globalSettingsController.ts's res.fail(...) calls are almost all called with
// no options object -> plain 400s (FailedPrecondition). The one exception is
// createGlobalSettings's validation-string branch, which uses
// {isValidationError:true} -> 422 (InvalidArgument) — noted at that call site.

export async function getGlobalSettingsById(id: string): Promise<GlobalSettings> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('GlobalSettings not found') — no flag (not isNotFoundError,
    // despite being a not-found case — preserved verbatim from the original)
    throw new APIError(ErrCode.FailedPrecondition, "GlobalSettings not found");
  }
  return data;
}

export async function getAllGlobalSettings(input: {
  limit?: number;
  page?: number;
  search?: string;
}): Promise<PaginatedGlobalSettings> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ limit: safeLimit, page: safePage, search: input.search });
}

export async function createGlobalSettings(input: {
  createdBy: string;
  settingName: string;
  settingValue: string;
}): Promise<GlobalSettings> {
  const parsed = globalSettingsBodySchema.safeParse(input);
  if (!parsed.success) {
    // Original: use-case's `GlobalSettings | string` return type is a dead
    // code path in practice (the use case never actually returns a string) —
    // this is the port's equivalent request-shape validation, mapped to the
    // one case in the controller that DOES pass isValidationError:true.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  return repo.create({
    createdBy: input.createdBy,
    settingName: parsed.data.settingName,
    settingValue: parsed.data.settingValue,
  });
}

export async function updateGlobalSettings(input: {
  id: string;
  updatedBy: string;
  settingName?: string;
  settingValue?: string;
}): Promise<GlobalSettings> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // Original use-case returns the *string* 'ID is required to update an
    // entity setting' here, which the controller's `data === null` check
    // never catches — it falls through to res.success(<string>), a real bug.
    // Deviation: this port throws a proper 400 instead, same call as
    // entity-location.service.ts's updateEntityLocation makes for the
    // analogous case — see that file's comment for why.
    throw new APIError(ErrCode.FailedPrecondition, "ID is required to update an entity setting");
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    settingName: input.settingName,
    settingValue: input.settingValue,
  });
  if (!updated) {
    // Same deviation as above — original returns the string
    // `Global setting with ID ${id} not found`, silently sent as a "success"
    // response by the controller. Ported as a proper 400.
    throw new APIError(ErrCode.FailedPrecondition, `Global setting with ID ${input.id} not found`);
  }
  return updated;
}

export async function deleteGlobalSettings(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID is required to delete a global setting");
  }
  const numericId = Number(id);
  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail({error:'data not found'}) in the original — an object, not a
    // string, but no flag either way; a plain 400 message is equivalent here.
    throw new APIError(ErrCode.FailedPrecondition, "data not found");
  }
  return true;
}
