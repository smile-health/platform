import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-transport-external-group.repository";
import {
  parseExternalTreatmentOrUndefined,
  parseStatusOrUndefined,
  parseTransportationStatusOrUndefined,
} from "./waste-transport-external-group.schema";
import type { PaginatedWasteTransportExternalGroup, WasteTransportExternalGroup } from "./waste-transport-external-group.types";

// getAllWasteTransportExternalGroup/getWasteTransportExternalGroup in the
// original controller both start with a manual `Authorization: Bearer ...`
// header check that duplicates what `authenticate` middleware already does,
// failing with `res.fail(req.t('common.missing-token'), { isValidationError:
// true })` -> 422 (InvalidArgument) if missing. In this port, `auth: true` on
// the endpoint (see .controller.ts) makes that check redundant — Encore's
// gateway already rejects unauthenticated requests before the handler runs —
// so it isn't reproduced here.

export interface GetAllWasteTransportExternalGroupInput {
  limit?: number;
  page?: number;
  status?: string;
  anotherStatus?: string;
  externalTreatment?: string;
  treatmentMethod?: string;
  transportationStatus?: string;
  entityId?: number;
  healthcareFacilityId?: number;
  startDate?: string;
  endDate?: string;
  // Derived from the caller's auth session, not the query string — mirrors
  // `req.user?.external_properties?.role.type` in the original.
  role?: string;
  // Falls back to `req.user?.entity.id` in the original when `entityId`
  // isn't given on the query string — resolved at the call site
  // (.controller.ts) same as every other ported module.
  authEntityId?: number;
}

export async function getAllWasteTransportExternalGroup(
  input: GetAllWasteTransportExternalGroupInput
): Promise<PaginatedWasteTransportExternalGroup> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;

  const status = parseStatusOrUndefined(input.status);
  const anotherStatus = parseStatusOrUndefined(input.anotherStatus);
  const externalTreatment = parseExternalTreatmentOrUndefined(input.externalTreatment);
  const transportationStatus = parseTransportationStatusOrUndefined(input.transportationStatus);

  // Mirrors the original's role-derived status list, appended to whatever
  // status/anotherStatus were resolved above. `role` here is lower-cased and
  // has underscores replaced with spaces first, same as
  // `roles?.replaceAll('_', ' ').toLowerCase()`.
  const role = input.role?.replaceAll("_", " ").toLowerCase();
  const wasteStatuses = new Set<string>();
  if (status) wasteStatuses.add(status);
  if (anotherStatus) wasteStatuses.add(anotherStatus);
  if (role?.includes("recycler")) wasteStatuses.add("RECYCLED");
  if (role?.includes("specialized")) wasteStatuses.add("COLLECTED");
  if (role?.includes("goverment") || role?.includes("wastebank")) {
    wasteStatuses.add("DISPOSED");
    wasteStatuses.add("HANDOVER_TO_TREATMENT");
    wasteStatuses.add("READY_FOR_TREATMENT");
    wasteStatuses.add("LANDFILLED");
  }
  if (input.role === "operator_transporter") {
    wasteStatuses.add("INCINERATION_IN_PROCESS");
    wasteStatuses.add("STERILIZATION_IN_PROCESS");
    wasteStatuses.add("HANDOVER_TO_TREATMENT");
    wasteStatuses.add("READY_FOR_TREATMENT");
    wasteStatuses.add("DISPOSED");
    wasteStatuses.add("RECYCLED");
    wasteStatuses.add("COLLECTED");
    wasteStatuses.add("LANDFILLED");
  }
  // Original also splits the raw `status` query string on commas and unions
  // that in again — a no-op in practice since `status` here is already a
  // single allow-listed value, not a CSV list, but preserved for parity.
  if (input.status) {
    for (const s of input.status.split(",")) {
      if (s) wasteStatuses.add(s);
    }
  }

  const entityId = input.entityId ?? input.authEntityId;

  return repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    entityId,
    healthcareFacilityId: input.healthcareFacilityId,
    startDate: input.startDate ? new Date(input.startDate) : new Date(),
    endDate: input.endDate ? new Date(input.endDate) : new Date(),
    transportationStatus,
    externalTreatment,
    wasteStatuses: [...wasteStatuses],
  });
}

export async function getWasteTransportExternalGroup(input: {
  id?: number;
  qrCodeId?: string;
}): Promise<WasteTransportExternalGroup> {
  const data = await repo.findByIdWithBags(input);
  if (!data) {
    // res.fail(req.t('waste.error.NOT_FOUND_WG')) — no flag -> plain 400.
    throw new APIError(ErrCode.FailedPrecondition, "Waste group not found");
  }
  return data;
}
