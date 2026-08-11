import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-classification.repository";
import {
  createWasteClassificationBodySchema,
  updateWasteClassificationBodySchema,
} from "./waste-classification.schema";
import type { PaginatedWasteClassification, WasteClassification } from "./waste-classification.types";
import { getLocalUserName } from "../../shared/core/entity-user-lookup";

// wasteClassificationController.ts mixes res.fail(...) (mapped per its options
// object) and res.error(...) — the latter is ALWAYS a plain 500
// (ErrCode.Internal) in the original's jsonResponse middleware, regardless of
// the message passed to it. That distinction is preserved call-site by
// call-site below. In particular: every error thrown inside the original's
// use-cases (CreateWasteClassification / UpdateWasteClassification) bubbles up
// through the controller's outer try/catch, which always calls res.error(...)
// -> 500 — none of those branches are res.fail, so none of them become 400s
// here even though the messages read like validation errors.

async function assertWasteHierarchyExists(id: number, label: string): Promise<void> {
  const exists = await repo.wasteHierarchyExists(id);
  if (!exists) {
    // `throw new Error('Waste hierarchy with ID ${id} not found')` inside the
    // use-case -> controller's outer catch -> res.error -> 500 (Internal).
    throw new APIError(ErrCode.Internal, `Waste hierarchy with ID ${id} not found (${label})`);
  }
}

async function assertHierarchyIdsDistinct(
  wasteTypeId: number,
  wasteGroupId: number,
  wasteCharacteristicsId: number
): Promise<void> {
  if (
    wasteTypeId === wasteGroupId ||
    wasteTypeId === wasteCharacteristicsId ||
    wasteGroupId === wasteCharacteristicsId
  ) {
    // use-case throws Error(...) -> outer catch -> res.error -> 500 (Internal)
    throw new APIError(
      ErrCode.Internal,
      "wasteTypeId or wasteGroupId or wasteCharacteristicsId cannot be the same value"
    );
  }
}

export async function getWasteClassificationById(id: string): Promise<WasteClassification> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag -> 400 (FailedPrecondition)
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number.parseInt(id, 10);
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Waste source group not found') — no flag -> 400
    // (message preserved verbatim from the original, "waste source group"
    // rather than "waste classification" — a copy-paste leftover upstream).
    throw new APIError(ErrCode.FailedPrecondition, "Waste source group not found");
  }
  return data;
}

export async function getAllWasteClassification(input: {
  limit?: number;
  page?: number;
  search?: string;
  wasteCode?: string;
  useColdStorage?: string;
  updatedAt?: string;
  sortBy?: string;
  sortOrder?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
}): Promise<PaginatedWasteClassification> {
  const safeLimit = Number(input.limit) || 10;
  const safePage = Number(input.page) || 1;

  // Mirrors parseBoolean(useColdStorage.toString()) — only applied when the
  // query param was actually supplied.
  let useColdStorage: boolean | undefined;
  if (input.useColdStorage !== undefined) {
    const normalized = input.useColdStorage.toString().trim().toLowerCase();
    useColdStorage = normalized === "true" || normalized === "1";
  }

  const validSortBy =
    input.sortBy === "wasteCode" ||
    input.sortBy === "useColdStorage" ||
    input.sortBy === "updatedAt" ||
    input.sortBy === "updated_at"
      ? (input.sortBy as "wasteCode" | "useColdStorage" | "updatedAt" | "updated_at")
      : "updated_at";
  const validSortOrder = input.sortOrder === "ASC" || input.sortOrder === "DESC" ? input.sortOrder : "ASC";

  // Any error thrown by the repository here propagates through the original's
  // `.catch((error) => res.error(error))` (and the outer try/catch is the
  // same res.error) -> always 500 (ErrCode.Internal) — Encore's default
  // unhandled-error behavior already maps to Internal, so no explicit
  // try/catch wrapper is needed here.
  const result = await repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    search: input.search,
    wasteTypeId: input.wasteTypeId,
    wasteGroupId: input.wasteGroupId,
    wasteCharacteristicsId: input.wasteCharacteristicsId,
    wasteCode: input.wasteCode,
    useColdStorage,
    updatedAt: input.updatedAt,
    sortBy: validSortBy,
    sortOrder: validSortOrder,
  });
  const data = await Promise.all(
    result.data.map(async (row) => ({
      ...row,
      // Original enriches this via getUsersDetail(updatedBy, token) against
      // apps/core — populated here from the local `users` table instead.
      userName: row.updatedBy ? await getLocalUserName(row.updatedBy) : undefined,
    })),
  );
  return { ...result, data };
}

export async function createWasteClassification(input: {
  createdBy: string;
  regionId?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType?: string;
  useColdStorage: boolean;
  coldStorageMinHours?: number;
  coldStorageMaxHours?: number;
  tempStorageMinHours?: number;
  tempStorageMaxHours?: number;
  minimunDecayDay?: number;
  storageRule?: string;
  allowHealthcareFacilityTreatment: boolean;
  isActive?: boolean;
  hasMultipleTransporters: boolean;
  treatmentMethod?: string;
  disposalMethod: string;
  allowedVehicleTypes?: string;
}): Promise<WasteClassification> {
  // Original relies on the Express validateRequest(createWasteClassificationSchema)
  // middleware for shape validation before the controller ever runs -> a
  // schema failure there is res.fail(errors, { isValidationError: true }) -> 422.
  const parsed = createWasteClassificationBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const data = parsed.data;

  // Original ALWAYS calls regionRepository.getOneRegion() first, regardless
  // of whether regionId was supplied, and throws if no region row exists at
  // all -> Error -> outer catch -> res.error -> 500. Preserved verbatim
  // (a real quirk: creating a classification fails if the regions table is
  // ever empty, even when the caller passes an explicit regionId).
  const fallbackRegionId = await repo.getOneRegionId();
  if (fallbackRegionId === null) {
    throw new APIError(ErrCode.Internal, "Region not found");
  }

  await assertWasteHierarchyExists(data.wasteTypeId, "wasteTypeId");
  await assertWasteHierarchyExists(data.wasteGroupId, "wasteGroupId");
  await assertWasteHierarchyExists(data.wasteCharacteristicsId, "wasteCharacteristicsId");

  const duplicate = await repo.findByWasteCharacteristicsId(data.wasteCharacteristicsId);
  if (duplicate) {
    throw new APIError(
      ErrCode.Internal,
      "waste specification for the selected waste characteristic has already been configured. Please proceed with other waste characteristic name."
    );
  }

  await assertHierarchyIdsDistinct(data.wasteTypeId, data.wasteGroupId, data.wasteCharacteristicsId);

  // Original: `if (!effectiveFrom || !effectiveTo) { effectiveFrom = new
  // Date(Date.now()); effectiveTo = new Date(9999, 11, 30); }` — note this
  // replaces BOTH dates as soon as either one is missing, even if the other
  // was supplied. Preserved verbatim.
  const effectiveFrom = data.effectiveFrom && data.effectiveTo ? new Date(data.effectiveFrom) : new Date();
  const effectiveTo =
    data.effectiveFrom && data.effectiveTo ? new Date(data.effectiveTo) : new Date(9999, 11, 30);

  const regionId = data.regionId ?? fallbackRegionId;

  return repo.create({
    createdBy: input.createdBy,
    regionId,
    effectiveFrom,
    effectiveTo,
    wasteTypeId: data.wasteTypeId,
    wasteGroupId: data.wasteGroupId,
    wasteCharacteristicsId: data.wasteCharacteristicsId,
    wasteCode: data.wasteCode,
    wasteBagColorCode: data.wasteBagColorCode,
    storageRuleType: data.storageRuleType,
    useColdStorage: data.useColdStorage,
    coldStorageMinHours: data.coldStorageMinHours,
    coldStorageMaxHours: data.coldStorageMaxHours,
    tempStorageMinHours: data.tempStorageMinHours,
    tempStorageMaxHours: data.tempStorageMaxHours,
    minimunDecayDay: data.minimunDecayDay,
    storageRule: data.storageRule,
    allowHealthcareFacilityTreatment: data.allowHealthcareFacilityTreatment,
    isActive: data.isActive ?? false,
    hasMultipleTransporters: data.hasMultipleTransporters,
    treatmentMethod: data.treatmentMethod,
    disposalMethod: data.disposalMethod,
    allowedVehicleTypes: data.allowedVehicleTypes,
  });
}

export async function updateWasteClassification(input: {
  id: string;
  updatedBy: string;
  regionId?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType?: string;
  useColdStorage: boolean;
  coldStorageMinHours?: number;
  coldStorageMaxHours?: number;
  tempStorageMinHours?: number;
  tempStorageMaxHours?: number;
  minimunDecayDay?: number;
  storageRule?: string;
  hasMultipleTransporters: boolean;
  allowHealthcareFacilityTreatment: boolean;
  treatmentMethod?: string;
  disposalMethod: string;
  allowedVehicleTypes?: string;
}): Promise<WasteClassification> {
  if (!input.id) {
    // res.fail('ID parameter is required') — no flag -> 400 (FailedPrecondition)
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(input.id);

  // Original relies on validateRequest(updateWasteClassificationSchema) ->
  // 422 on shape failure, same as create.
  const parsed = updateWasteClassificationBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const data = parsed.data;

  const existing = await repo.findById(numericId);
  if (!existing) {
    // use-case returns null -> controller: data === null -> res.fail('Waste
    // source group not found') -> 400 (FailedPrecondition)
    throw new APIError(ErrCode.FailedPrecondition, "Waste source group not found");
  }

  await assertWasteHierarchyExists(data.wasteTypeId, "wasteTypeId");
  await assertWasteHierarchyExists(data.wasteGroupId, "wasteGroupId");
  await assertWasteHierarchyExists(data.wasteCharacteristicsId, "wasteCharacteristicsId");

  const duplicate = await repo.findByWasteCharacteristicsId(data.wasteCharacteristicsId, numericId);
  if (duplicate) {
    throw new APIError(
      ErrCode.Internal,
      "waste specification for the selected waste characteristic has already been configured. Please proceed with other waste characteristic name."
    );
  }

  await assertHierarchyIdsDistinct(data.wasteTypeId, data.wasteGroupId, data.wasteCharacteristicsId);

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    regionId: data.regionId,
    effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
    effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
    wasteTypeId: data.wasteTypeId,
    wasteGroupId: data.wasteGroupId,
    wasteCharacteristicsId: data.wasteCharacteristicsId,
    wasteCode: data.wasteCode,
    wasteBagColorCode: data.wasteBagColorCode,
    storageRuleType: data.storageRuleType,
    useColdStorage: data.useColdStorage,
    coldStorageMinHours: data.coldStorageMinHours,
    coldStorageMaxHours: data.coldStorageMaxHours,
    tempStorageMinHours: data.tempStorageMinHours,
    tempStorageMaxHours: data.tempStorageMaxHours,
    minimunDecayDay: data.minimunDecayDay,
    storageRule: data.storageRule,
    hasMultipleTransporters: data.hasMultipleTransporters,
    allowHealthcareFacilityTreatment: data.allowHealthcareFacilityTreatment,
    treatmentMethod: data.treatmentMethod,
    disposalMethod: data.disposalMethod,
    allowedVehicleTypes: data.allowedVehicleTypes,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste source group not found");
  }
  return updated;
}

export async function deleteWasteClassification(id: string): Promise<boolean> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag -> 400 (FailedPrecondition)
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);
  if (!numericId) {
    // DeleteWasteClassificationUseCase: `if (!id) throw new Error('ID is
    // required to delete a waste source')` -> outer catch -> res.error -> 500
    // (Internal). Practically unreachable given the router's :id + the
    // string check above, but preserved for parity.
    throw new APIError(ErrCode.Internal, "ID is required to delete a waste source");
  }

  const existing = await repo.findById(numericId);
  if (!existing) {
    // use-case returns false when the row doesn't exist -> controller:
    // `if (!data) res.fail('Waste classification not found')` -> 400
    throw new APIError(ErrCode.FailedPrecondition, "Waste classification not found");
  }

  // Original also publishes a WASTE_CLASSIFICATION_DELETED status-update log
  // and a DELETE_WASTE_CLASSIFICATION multi-notification (super-admin only)
  // via RabbitMQ publishers on success — not ported (no matching topic/
  // notification-fanout module exists yet in wms-encore); see
  // messaging/topics.ts for the topics that ARE ported so far.
  const deactivated = await repo.deactivate(numericId);
  if (!deactivated) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste classification not found");
  }
  return true;
}
