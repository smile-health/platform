import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./asset-manufacturer.repository";
import { createAssetManufacturerBodySchema, updateAssetManufacturerBodySchema } from "./asset-manufacturer.schema";
import type { AssetManufacturer, PaginatedAssetManufacturers } from "./asset-manufacturer.types";

// assetManufacturerController.ts's own res.fail(...) calls are always called
// with no options object -> plain 400s (FailedPrecondition). Its res.error(...)
// calls (outer catch-alls, and the create use-case's duplicate-name Error)
// are always plain 500s (Internal) — jsonResponse.ts's res.error ignores its
// `option` param entirely and always responds 500, unlike res.fail.

export async function getAssetManufacturerById(id: string): Promise<AssetManufacturer> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // Original: getAssetManufacturerById doesn't have an explicit id-missing
    // check (unlike update/delete) — it calls straight through to the
    // use-case with `id` as a raw path param string, which Sequelize's
    // checkExistingData would fail to match, ending up in the same
    // "not found" branch below. Ported as an explicit guard for the same
    // observable 400 outcome.
    throw new APIError(ErrCode.FailedPrecondition, "Asset manufacturer not found");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Asset manufacturer not found') — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "Asset manufacturer not found");
  }
  return data;
}

export async function getAllAssetManufacturers(input: {
  limit?: number;
  page?: number;
  search?: string;
  name?: string;
}): Promise<PaginatedAssetManufacturers> {
  // Mirrors paginationUtils.sanitizePaginationParams: limit defaults to 10,
  // capped at maxLimit 1000; page defaults to 1.
  const safeLimit = input.limit && input.limit > 0 ? Math.min(input.limit, 1000) : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ limit: safeLimit, page: safePage, search: input.search, name: input.name });
}

export async function createAssetManufacturer(input: {
  createdBy: string;
  name: string;
  description?: string;
}): Promise<AssetManufacturer> {
  const parsed = createAssetManufacturerBodySchema.safeParse(input);
  if (!parsed.success) {
    // Ported equivalent of the original's validateRequest middleware
    // (zod-based) failing before ever reaching the controller -> 422.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findByName(parsed.data.name);
  if (existing) {
    // Original: CreateAssetManufacturer.ts throws
    // `Error('Asset manufacturer with name ${name} already exists')`,
    // re-thrown as a plain Error by the use-case's catch block, and caught
    // by the controller's outer catch -> res.error(error) -> 500 (Internal),
    // NOT a 400/409. Preserved verbatim (deviation from what you'd expect).
    throw new APIError(ErrCode.Internal, `Asset manufacturer with name ${parsed.data.name} already exists`);
  }

  return repo.create({
    createdBy: input.createdBy,
    name: parsed.data.name,
    description: parsed.data.description,
  });
}

export async function updateAssetManufacturer(input: {
  id: string;
  updatedBy: string;
  name: string;
  description?: string;
}): Promise<AssetManufacturer> {
  if (!input.id) {
    // res.fail('ID parameter is required') — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(input.id);

  const parsed = updateAssetManufacturerBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    name: parsed.data.name,
    description: parsed.data.description,
  });
  if (!updated) {
    // res.fail('Aset Manufacturer not found') — no flag. (Original's typo
    // "Aset" preserved verbatim.)
    throw new APIError(ErrCode.FailedPrecondition, "Aset Manufacturer not found");
  }
  return updated;
}

export async function deleteAssetManufacturer(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);

  // Perform the deletion (real side effect, same as the original calling
  // through to `existingData.destroy()`).
  await repo.softDelete(numericId, deletedBy);

  // Original bug, preserved verbatim: Sequelize's `Model.prototype.destroy()`
  // resolves to `undefined` on success. DeleteAsetManufacturer.ts's use-case
  // returns that `undefined` straight through, and the controller's
  // `if (!data) { res.fail('Aset Manufacturer not found'); return; }` treats
  // that falsy resolution as a not-found case -- so this endpoint responds
  // 400 "Aset Manufacturer not found" on EVERY call, including successful
  // deletes, while still actually deleting the row. There is no successful
  // (200) response path in the original for this endpoint at all.
  throw new APIError(ErrCode.FailedPrecondition, "Aset Manufacturer not found");
}
