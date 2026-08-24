import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-bag-treatment-group.repository";
import { allowedListingStatusSchema } from "./waste-bag-treatment-group.schema";
import { getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId } from "../../partnership/partnership/partnership.service";
import { getPresignedUrl } from "../../../shared/storage/s3-client";
import type {
  WasteTreatmentGroup,
  PaginatedWasteTreatmentGroup,
  PaginatedWasteTreatmentGroupSelectDto,
} from "./waste-bag-treatment-group.types";

// wasteTreatmentGroupController.ts's three handlers never call res.fail(...)
// with an options flag except getWasteBagTreatmentGroup's missing-token
// check (isValidationError: true -> 422/InvalidArgument) — that check is
// dead code in this port (Encore's auth:true + authHandler already rejects
// missing/invalid tokens before the handler runs), documented at its call
// site below. Every other failure path is a plain res.fail with no flag ->
// FailedPrecondition (400), or res.error(...) on unexpected exceptions,
// which Hono/Express in the original maps to a generic 500 — ported as
// Internal here.

export async function getAllWasteBagTreatmentGroup(input: {
  limit?: number;
  page?: number;
  entityId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  // Fallback when entityId isn't supplied on the query string — mirrors
  // `entityId ? Number(entityId) : req.user?.entity.id`.
  authEntityId?: number;
}): Promise<PaginatedWasteTreatmentGroup> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  const entityId = input.entityId ?? input.authEntityId;

  // Original: `startDate ? new Date(startDate) : new Date()` for BOTH bounds
  // — an omitted startDate/endDate defaults to "now", not "no filter", so a
  // request with neither still applies a same-instant range filter (start ===
  // end, effectively excluding almost everything unless it's an exact
  // millisecond match) — a real bug in the original, preserved verbatim.
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const endDate = input.endDate ? new Date(input.endDate) : new Date();

  // Mirrors the controller's inline AllowedStatus check: an unrecognized
  // status string is silently ignored (no error), not rejected.
  const parsedStatus = allowedListingStatusSchema.safeParse(input.status);
  const status = parsedStatus.success ? parsedStatus.data : undefined;

  try {
    return await repo.findAllPaginated({
      limit: safeLimit,
      page: safePage,
      entityId,
      startDate,
      endDate,
      status,
    });
  } catch (error) {
    // Original: console.error + res.error(error) -> generic 500.
    throw new APIError(ErrCode.Internal, error instanceof Error ? error.message : "Internal error");
  }
}

export async function getWasteBagTreatmentGroup(input: {
  id?: string;
  qrCodeId?: string;
  // Forwarded from the caller's bearer token — the original re-derives this
  // from the Authorization header inside the handler (redundant with
  // Encore's own auth:true gate) purely to hand it to the not-yet-ported
  // partnership lookup inside getWasteBagTreatmentGroupByIdWithWasteBags.
  // See waste-bag-treatment-group.repository.ts's header comment — that
  // lookup isn't wired up in this pass, so `token` is unused for now.
  token: string;
}): Promise<WasteTreatmentGroup> {
  const numericId = input.id ? Number(input.id) : undefined;

  const found = await repo.findByIdWithWasteBags({
    id: numericId && !Number.isNaN(numericId) ? numericId : undefined,
    qrCodeId: input.qrCodeId,
  });

  if (!found) {
    // res.fail(req.t('waste.error.NOT_FOUND_WG')) — no flag -> FailedPrecondition.
    throw new APIError(ErrCode.FailedPrecondition, "waste.error.NOT_FOUND_WG");
  }

  const { wasteBagRows } = found;
  const first = wasteBagRows[0];

  const classificationIds = [...new Set(wasteBagRows.map((b) => b.waste_classification_id).filter(Boolean))];
  const classifications = await Promise.all(classificationIds.map((id) => repo.classificationRepo.findById(id)));
  const classificationById = new Map(classifications.filter(Boolean).map((c) => [c!.id, c!]));

  const wasteBags = await Promise.all(
    wasteBagRows.map(async (bag) => {
      const classification = classificationById.get(bag.waste_classification_id);
      return {
        id: bag.id,
        wasteBagQrCodeId: bag.waste_bag_qr_code_id,
        wasteStatus: bag.waste_status,
        weightInKgs: bag.weight_in_kgs ?? undefined,
        createdAt: bag.created_at,
        healthcareFacilityId: bag.healthcare_facility_id,
        healthcareFacilityName: bag.healthcare_facility_name ?? undefined,
        manifestDocNumber: bag.manifest_doc_number ?? undefined,
        // Presigned via shared/storage/s3-client.ts when set and S3 is
        // configured; falls back to the raw stored path otherwise.
        manifestDocPath: (await getPresignedUrl(bag.manifest_doc_path)) ?? bag.manifest_doc_path ?? null,
        logHistory: await repo.getWasteBagLogHistory(bag.waste_bag_qr_code_id),
        treatmentMethod: classification?.treatmentMethod ?? undefined,
        wasteClassification: repo.buildBagWasteClassification(classification),
      };
    })
  );

  const summary = repo.buildGroupWasteClassificationSummary([...classificationById.values()]);

  // Original: `PartnerVehicleModel.findByPk(firstBag[0].transporterVehicleId)`
  // — but waste_bag (see waste-bag/waste-bag.repository.ts and
  // WasteBagModel.ts in apps/wms-service) has no transporterVehicleId column
  // at all; that property read is always `undefined` on a plain waste_bag
  // row, so `findByPk(undefined)` always resolves to `null` in the original
  // too. Preserved verbatim as a permanently-null lookup rather than
  // "fixed" by guessing at what column it should have read instead.
  const vehicle = null;

  const primaryClassification = classificationById.get(first?.waste_classification_id ?? -1);
  const processWastebagEnd = first
    ? repo.handleAnalisisProcessCount(
        primaryClassification?.disposalMethod ?? undefined,
        primaryClassification?.treatmentMethod ?? undefined,
        first.is_treated,
        first.waste_group_ids,
        first.waste_status
      )
    : undefined;

  // Mirrors the original's 3-arg internal-treatment call (no
  // transporterId/thirdPartyId narrowing — this group has no external
  // transporter/third-party leg).
  const partnership = first
    ? await getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId({
        healthcareFacilityId: first.healthcare_facility_id,
        wasteClassificationId: first.waste_classification_id,
      })
    : null;

  return {
    ...found.group,
    wasteBags,
    wasteType: summary.wasteType,
    wasteGroup: summary.wasteGroup,
    wasteCharacteristics: summary.wasteCharacteristics,
    partnership: partnership as unknown as Record<string, unknown> | undefined,
    vehicle: vehicle ?? undefined,
    processWastebagEnd,
  };
}

export async function getPendingWasteTreatmentGroups(input: {
  limit?: number;
  page?: number;
  entityId?: number;
  // Mirrors `entityId ? entityId : req.user?.entity.id`.
  authEntityId?: number;
}): Promise<PaginatedWasteTreatmentGroupSelectDto> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  const healthcareFacilityId = input.entityId ?? input.authEntityId;

  if (!healthcareFacilityId || Number.isNaN(healthcareFacilityId)) {
    // Original does `Number(healthcareFacilityId?.toString())`, which
    // becomes NaN if neither entityId nor req.user?.entity.id resolve to
    // anything — that NaN is then passed straight into the raw SQL's
    // `:healthcareFacilityId` replacement (a query that matches nothing,
    // not an error). Ported as a proper 400 instead, since Encore's
    // Postgres driver would otherwise throw an obscure type-mismatch error
    // for a NaN parameter rather than an empty result set.
    throw new APIError(ErrCode.FailedPrecondition, "entityId is required");
  }

  try {
    return await repo.findPending({ limit: safeLimit, page: safePage, healthcareFacilityId });
  } catch (error) {
    // Original: throw error unhandled up through the use-case -> controller's
    // catch -> res.error(error) -> generic 500.
    throw new APIError(ErrCode.Internal, error instanceof Error ? error.message : "Internal error");
  }
}
