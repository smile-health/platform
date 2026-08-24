import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./healthcare-facility-asset.repository";
import {
  createHealthcareFacilityAssetBodySchema,
  updateHealthcareFacilityAssetBodySchema,
} from "./healthcare-facility-asset.schema";
import type { HealthcareFacilityAsset, PaginatedHealthcareFacilityAssets } from "./healthcare-facility-asset.types";

// healthcareFacilityAssetController.ts's res.fail(...) calls are almost all
// called with no options object -> plain 400s (FailedPrecondition). The two
// exceptions are createHealthcareFacilityAsset's/updateHealthcareFacilityAsset's
// "Asset model with ID X not found" string-return branch and
// patchHealthcareFacilityAsset's missing-query-param branch, both of which
// use {isValidationError:true} -> 422 (InvalidArgument) — noted at each call
// site below.

export async function getHealthcareFacilityAssetById(id: string): Promise<HealthcareFacilityAsset> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // Original: `parseInt(req.params.id)` on a non-numeric id yields NaN;
    // the use-case's `getHealthcareFacilityAssetById(NaN)` query would find
    // nothing and the controller's `data === null` branch fires — same
    // final outcome as this explicit guard.
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('HealthcareFacilityAsset not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  return data;
}

export async function getAllHealthcareFacilityAssets(input: {
  limit?: number;
  page?: number;
  search?: string;
  healthcareFacilityId?: number;
  assetType?: string;
  manufacturerId?: number;
  isIotEnable?: number;
  assetStatus?: string;
}): Promise<PaginatedHealthcareFacilityAssets> {
  // Original validates only that a Bearer token is present on this endpoint
  // (used to call the external entity-detail API) — not reproduced here
  // since entityName is resolved against the local `entities` table instead
  // (see the deviation note in healthcare-facility-asset.repository.ts's
  // findAllPaginated). Encore's `auth: true` on the endpoint already
  // guarantees an authenticated caller before this service function runs.
  return repo.findAllPaginated({
    limit: input.limit && input.limit > 0 ? input.limit : 10,
    page: input.page && input.page > 0 ? input.page : 1,
    search: input.search,
    healthcareFacilityId: input.healthcareFacilityId,
    assetType: input.assetType,
    manufacturerId: input.manufacturerId,
    isIotEnable: input.isIotEnable,
    assetStatus: input.assetStatus,
  });
}

export async function getAllHealthcareFacilityAssetsByEntityId(input: {
  limit?: number;
  page?: number;
  search?: string;
  assetType?: string;
  manufacturerId?: number;
  healthcareFacilityId: number;
}): Promise<PaginatedHealthcareFacilityAssets> {
  return repo.findAllByEntityId({
    limit: input.limit && input.limit > 0 ? input.limit : 10,
    page: input.page && input.page > 0 ? input.page : 1,
    search: input.search,
    assetType: input.assetType,
    manufacturerId: input.manufacturerId,
    healthcareFacilityId: input.healthcareFacilityId,
  });
}

export async function createHealthcareFacilityAsset(input: {
  createdBy: string;
  healthcareFacilityId?: number;
  assetStatus: string;
  assetId: string;
  modelId: number;
  isIotEnable: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  yearOfProduction?: number;
}): Promise<HealthcareFacilityAsset> {
  const parsed = createHealthcareFacilityAssetBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  if (!input.healthcareFacilityId) {
    // Original: `healthcareFacilityId: req.body.healthcareFacilityId ??
    // req.user?.entity_id` in the controller — falls back to the caller's
    // own entity id when not supplied in the body. If neither is present
    // the use-case's `new HealthcareFacilityAsset({...})` constructor still
    // runs (healthcareFacilityId typed as required but effectively
    // undefined at runtime), then Sequelize's NOT NULL constraint on
    // healthcare_facility_id would reject the insert. Ported as an explicit
    // 400 instead of letting an insert fail — same call as
    // entity-location.service.ts makes for the analogous "entityId missing"
    // case.
    throw new APIError(ErrCode.FailedPrecondition, "healthcareFacilityId is required");
  }

  const modelExists = await repo.findAssetModelExists(input.modelId);
  if (!modelExists) {
    // Use-case: `return \`Asset model with ID ${modelId} not found\`` ->
    // controller's `typeof data === 'string'` branch -> res.fail(data,
    // {isValidationError:true}) -> 422.
    throw new APIError(ErrCode.InvalidArgument, `Asset model with ID ${input.modelId} not found`);
  }

  return repo.create({
    createdBy: input.createdBy,
    assetStatus: parsed.data.assetStatus,
    healthcareFacilityId: input.healthcareFacilityId,
    assetId: parsed.data.assetId,
    modelId: parsed.data.modelId,
    isIotEnable: parsed.data.isIotEnable,
    warrantyStartDate: parsed.data.warrantyStartDate,
    warrantyEndDate: parsed.data.warrantyEndDate,
    yearOfProduction: parsed.data.yearOfProduction,
  });
}

export async function updateHealthcareFacilityAsset(input: {
  id: string;
  updatedBy: string;
  healthcareFacilityId?: number;
  assetStatus?: string;
  assetId?: string;
  modelId: number;
  isIotEnable?: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  yearOfProduction?: number;
}): Promise<HealthcareFacilityAsset> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // Original use-case: `if (!id) throw new Error('ID is required to
    // update an asset model')` — thrown as a plain Error, which the
    // controller's catch block routes to `res.error(error)`. Ported as an
    // explicit 400 rather than a generic error-envelope 500-shaped response.
    throw new APIError(ErrCode.FailedPrecondition, "ID is required to update an asset model");
  }

  const parsed = updateHealthcareFacilityAssetBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const modelExists = await repo.findAssetModelExists(parsed.data.modelId);
  if (!modelExists) {
    // Use-case: `return \`Asset model with ID ${modelId} not found\`` ->
    // controller's `typeof data === 'string'` branch -> 422.
    throw new APIError(ErrCode.InvalidArgument, `Asset model with ID ${parsed.data.modelId} not found`);
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    assetStatus: parsed.data.assetStatus,
    healthcareFacilityId: parsed.data.healthcareFacilityId ?? input.healthcareFacilityId,
    assetId: parsed.data.assetId,
    modelId: parsed.data.modelId,
    isIotEnable: parsed.data.isIotEnable,
    warrantyStartDate: parsed.data.warrantyStartDate,
    warrantyEndDate: parsed.data.warrantyEndDate,
    yearOfProduction: parsed.data.yearOfProduction,
  });
  if (!updated) {
    // Use-case returns null when getHealthcareFacilityAssetById(id) finds
    // nothing -> controller's `data === null` branch -> res.fail(...) ->
    // plain 400.
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  return updated;
}

export async function patchHealthcareFacilityAsset(input: {
  id: string;
  is_iot_enable?: string;
}): Promise<HealthcareFacilityAsset> {
  if (!input.is_iot_enable) {
    // res.fail('is_iot_enable is required', {isValidationError:true}) -> 422
    throw new APIError(ErrCode.InvalidArgument, "is_iot_enable is required");
  }
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // Use-case: `if (!id) throw new Error('ID is required to update an
    // Healthcare facility asset')` -> plain Error -> controller's catch ->
    // res.error(error). Ported as an explicit 400, same rationale as
    // updateHealthcareFacilityAsset above.
    throw new APIError(ErrCode.FailedPrecondition, "ID is required to update an Healthcare facility asset");
  }

  const isIotEnableBool = input.is_iot_enable === "true" || input.is_iot_enable === "1";
  const updated = await repo.updateIotEnable(numericId, isIotEnableBool);
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  return updated;
}

export async function deleteHealthcareFacilityAsset(id: string, deletedBy?: number): Promise<boolean> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail('HealthcareFacilityAsset not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  return true;
}
