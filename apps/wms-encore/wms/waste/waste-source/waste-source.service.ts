import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-source.repository";
import { createWasteSourceBodySchema, updateWasteSourceBodySchema } from "./waste-source.schema";
import type { WasteSource, PaginatedWasteSource } from "./waste-source.types";
import { getLocalUserName } from "../../../shared/core/entity-user-lookup";

// wasteSourceController.ts's res.fail(...) calls are almost all called with
// no options object -> plain 400s (FailedPrecondition). The exceptions
// (isValidationError:true -> 422/InvalidArgument) are: createWasteSource's
// duplicate-internal-treatment-name branch, getAllWasteSources's
// missing-Authorization-header branch (redundant here — Encore's auth:true
// already rejects missing/invalid tokens before this code runs, so it's
// intentionally not re-implemented), patchWasteSource's
// missing-id/is_active branch, and deleteWasteSource's
// associated-with-waste-bags/qr-code/qr-code-config branches. Noted at each
// call site below.

export async function getWasteSourceById(id: string): Promise<WasteSource> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Waste source not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  // userName is populated from the local `users` table (see
  // shared/core/entity-user-lookup.ts) rather than the original's HTTP
  // fallback to apps/core.
  const userName = data.updatedBy ? await getLocalUserName(data.updatedBy) : undefined;
  return { ...data, userName };
}

export async function getAllWasteSources(input: {
  limit?: number;
  page?: number;
  search?: string;
  sourceType?: string;
  entityId: number;
}): Promise<PaginatedWasteSource> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  const result = await repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    healthcareFacilityId: input.entityId,
    search: input.search,
    sourceType: input.sourceType,
  });
  const data = await Promise.all(
    result.data.map(async (row) => ({
      ...row,
      userName: row.updatedBy ? await getLocalUserName(row.updatedBy) : undefined,
    })),
  );
  return { ...result, data };
}

export async function createWasteSource(input: {
  createdBy: string;
  entityId: number;
  healthcareFacilityId?: number;
  sourceType: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive?: boolean;
  isResidue?: boolean;
}): Promise<WasteSource> {
  const parsed = createWasteSourceBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest middleware's isValidationError:true branch -> 422.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Controller: healthcareFacilityId: req.body.healthcareFacilityId ?? req.user?.entity.id
  const healthcareFacilityId = input.healthcareFacilityId ?? input.entityId;

  if (parsed.data.sourceType === "INTERNAL_TREATMENT") {
    const ok = await repo.checkDuplication({
      healthcareFacilityId,
      internalTreatmentName: parsed.data.internalTreatmentName,
    });
    if (!ok) {
      // res.fail('Waste source with this internal treatment name already
      // exists', {isValidationError:true}) -> 422.
      throw new APIError(
        ErrCode.InvalidArgument,
        "Waste source with this internal treatment name already exists"
      );
    }
  }

  return repo.create({
    createdBy: input.createdBy,
    healthcareFacilityId,
    sourceType: parsed.data.sourceType,
    internalSourceName: parsed.data.internalSourceName,
    internalTreatmentName: parsed.data.internalTreatmentName,
    externalHealthcareFacilityId: parsed.data.externalHealthcareFacilityId,
    externalHealthcareFacilityName: parsed.data.externalHealthcareFacilityName,
    isActive: parsed.data.isActive,
    isResidue: parsed.data.isResidue,
  });
}

export async function updateWasteSource(input: {
  id: string;
  updatedBy: string;
  healthcareFacilityId?: number;
  sourceType?: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive?: boolean;
}): Promise<WasteSource> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = updateWasteSourceBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findById(numericId);
  if (!existing) {
    // res.fail('Waste source not found, or an internal waste source with
    // this treatment name already exists.') — no flag.
    throw new APIError(
      ErrCode.FailedPrecondition,
      "Waste source not found, or an internal waste source with this treatment name already exists."
    );
  }

  // UpdateWasteSource.ts's use-case bug, preserved verbatim: sourceType is
  // only actually replaced with the request value when the EXISTING row's
  // sourceType is 'EXTERNAL' or 'INTERNAL' — if it's already
  // 'INTERNAL_TREATMENT', the request's sourceType is silently ignored and
  // the existing value is kept instead.
  const nextSourceType =
    existing.sourceType === "EXTERNAL" || existing.sourceType === "INTERNAL"
      ? parsed.data.sourceType
      : existing.sourceType;

  // Mirrors WasteSourceRepositoryImpl.updateWasteSource: when the effective
  // sourceType is 'INTERNAL_TREATMENT', re-check for a duplicate
  // internal-treatment-name row before applying the update. A duplicate
  // collapses to the same "not found or duplicate" message as a missing row
  // (the original repository returns null either way, indistinguishable to
  // the use-case/controller).
  if (nextSourceType === "INTERNAL_TREATMENT") {
    const ok = await repo.checkDuplication({
      healthcareFacilityId: input.healthcareFacilityId ?? existing.healthcareFacilityId,
      internalTreatmentName: parsed.data.internalTreatmentName ?? existing.internalTreatmentName,
    });
    if (!ok) {
      throw new APIError(
        ErrCode.FailedPrecondition,
        "Waste source not found, or an internal waste source with this treatment name already exists."
      );
    }
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    healthcareFacilityId: input.healthcareFacilityId ?? existing.healthcareFacilityId,
    sourceType: nextSourceType,
    internalSourceName: parsed.data.internalSourceName ?? existing.internalSourceName,
    internalTreatmentName: parsed.data.internalTreatmentName ?? existing.internalTreatmentName,
    externalHealthcareFacilityId:
      parsed.data.externalHealthcareFacilityId ?? existing.externalHealthcareFacilityId,
    externalHealthcareFacilityName:
      parsed.data.externalHealthcareFacilityName ?? existing.externalHealthcareFacilityName,
    isActive: parsed.data.isActive ?? existing.isActive,
  });
  if (!updated) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      "Waste source not found, or an internal waste source with this treatment name already exists."
    );
  }
  return updated;
}

export async function patchWasteSource(id: string, isActiveRaw?: string): Promise<WasteSource> {
  // Controller: `if (!id || !is_active)` — a missing/empty is_active also
  // fails this check, despite the error message only mentioning "ID
  // parameter" (bug preserved verbatim). {isValidationError:true} -> 422.
  if (!id || !isActiveRaw) {
    throw new APIError(ErrCode.InvalidArgument, "ID parameter is required");
  }
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new APIError(ErrCode.InvalidArgument, "ID parameter is required");
  }

  const isActive = isActiveRaw === "true" || isActiveRaw === "1";

  const updated = await repo.updateIsActive(numericId, isActive);
  if (!updated) {
    // res.fail('Waste source not found', {isValidationError:true}) -> 422.
    throw new APIError(ErrCode.InvalidArgument, "Waste source not found");
  }
  return updated;
}

export async function deleteWasteSource(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // DeleteWasteSource.ts throws Error('ID is required to delete a waste
    // source'), caught by the controller's generic catch -> res.error(...),
    // which (per this port's convention) is a 400 same as elsewhere.
    throw new APIError(ErrCode.FailedPrecondition, "ID is required to delete a waste source");
  }
  const numericId = Number(id);

  if (await repo.existsWasteBagByWasteSourceId(numericId)) {
    // Original returns a string here, which the controller maps to
    // res.fail(data, {isValidationError:true}) -> 422.
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste source with ID ${id} cannot be deleted because it is associated with waste bags.`
    );
  }
  if (await repo.existsWasteBagQrCodeByWasteSourceId(numericId)) {
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste source with ID ${id} cannot be deleted because it is associated with waste bags QR code.`
    );
  }
  if (await repo.existsQrCodeConfigByWasteSourceId(numericId)) {
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste source with ID ${id} cannot be deleted because it is associated with QR code config.`
    );
  }

  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail('Waste source not found') — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  return true;
}
