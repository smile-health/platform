import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./asset-model.repository";
import { assetModelBodySchema } from "./asset-model.schema";
import type { AssetModel, PaginatedAssetModels } from "./asset-model.types";

// assetModelController.ts mixes res.fail(...) (mapped to APIError per its
// options object, see below) and res.error(...) — the latter is ALWAYS a
// plain 500 (ErrCode.Internal) in the original's jsonResponse middleware,
// regardless of the message passed to it. That distinction is preserved
// call-site by call-site below rather than defaulting everything to 400.

export async function getAssetModelById(id: string): Promise<AssetModel> {
  const numericId = Number.parseInt(id, 10);
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Asset model not found') — no flag -> 400 (FailedPrecondition)
    throw new APIError(ErrCode.FailedPrecondition, "Asset model not found");
  }
  return data;
}

export async function getAllAssetModels(input: {
  limit?: number;
  page?: number;
  search?: string;
  assetType?: string;
  manufacturerId?: number;
}): Promise<PaginatedAssetModels> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    search: input.search,
    assetType: input.assetType,
    manufacturerId: input.manufacturerId,
  });
}

export async function createAssetModel(input: {
  createdBy: string;
  assetType: string;
  manufacturerId: number;
  name: string;
  description?: string;
}): Promise<AssetModel> {
  // Original relies on the Express validateRequest(createAssetSchema)
  // middleware for shape validation before the controller ever runs — this
  // port's equivalent request-shape check, mapped to a 422 the same way the
  // use-case's one real "isValidationError:true" call site is (below).
  const parsed = assetModelBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const manufacturerExists = await repo.manufacturerExists(parsed.data.manufacturerId);
  if (!manufacturerExists) {
    // CreateAssetModel use-case: `return 'NOT_FOUND_MANUFACTURER'` ->
    // controller: res.fail(t(`asset.error.NOT_FOUND_MANUFACTURER`), { isValidationError: true }) -> 422
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND_MANUFACTURER");
  }

  return repo.create({
    createdBy: input.createdBy,
    assetType: parsed.data.assetType,
    manufacturerId: parsed.data.manufacturerId,
    name: parsed.data.name,
    description: parsed.data.description,
  });
}

export async function updateAssetModel(input: {
  id: string;
  updatedBy: string;
  assetType: string;
  manufacturerId: number;
  name: string;
  description?: string;
}): Promise<AssetModel> {
  const numericId = Number(input.id);
  if (!input.id) {
    // UpdateAssetModelUseCase controller path: `if (!id) { res.error('ID is
    // required to update an asset model'); return; }` — res.error is ALWAYS
    // a plain 500 in the original, never a 4xx, despite the message reading
    // like client error text. Preserved verbatim (deviates from the sibling
    // entity-location.service.ts pattern, which maps the analogous case to a
    // 400 — that module's original used res.fail, not res.error).
    throw new APIError(ErrCode.Internal, "ID is required to update an asset model");
  }

  const parsed = assetModelBodySchema.safeParse({
    assetType: input.assetType,
    manufacturerId: input.manufacturerId,
    name: input.name,
    description: input.description,
  });
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const manufacturerExists = await repo.manufacturerExists(parsed.data.manufacturerId);
  if (!manufacturerExists) {
    // UpdateAssetModelUseCase: `return 'NOT_FOUND_MANUFACTURER'` ->
    // controller: res.fail(..., { isValidationError: true }) -> 422
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND_MANUFACTURER");
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    assetType: parsed.data.assetType,
    manufacturerId: parsed.data.manufacturerId,
    name: parsed.data.name,
    description: parsed.data.description,
  });
  if (!updated) {
    // data === null -> res.fail('Asset model not found') — no flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, "Asset model not found");
  }
  return updated;
}

export async function deleteAssetModel(id: string, deletedBy?: number): Promise<boolean> {
  const numericId = Number(id);

  // DeleteAssetModelUseCase checks the healthcare_facility_asset reference
  // guard BEFORE the `!id` check. A thrown Error here is caught by the
  // controller's outer try/catch -> res.error(error) -> plain 500, not a 4xx.
  const referenced = await repo.isReferencedByHealthcareFacilityAsset(numericId);
  if (referenced) {
    throw new APIError(
      ErrCode.Internal,
      `Asset with ID ${id} cannot be deleted because it is still used in the healthcare facility asset.`
    );
  }

  if (!numericId) {
    // `if (!id) throw new Error('ID is required to delete an asset model')`
    // -> also caught by the outer catch -> res.error -> plain 500.
    throw new APIError(ErrCode.Internal, "ID is required to delete an asset model");
  }

  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // result === null -> res.fail(t('asset.error.NOT_FOUND')) — no flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, "Asset model not found");
  }
  return true;
}
