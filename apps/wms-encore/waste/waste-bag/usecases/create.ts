import { APIError, ErrCode } from "encore.dev/api";
import { wasteBagCreated } from "../../../messaging/topics";
import type { WasteBagCreatedEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import * as wasteClassificationRepo from "../../waste-classification/waste-classification.repository";
import * as wasteBagTreatmentGroupRepo from "../../waste-bag-treatment-group/waste-bag-treatment-group.repository";
import { getEntityId } from "../../../entity/entities/entities.repository";
import { getEntityRegionNames } from "../../../shared/core/entity-region-lookup";
import { createWasteBagSchema } from "../waste-bag.schema";
import type { WasteBag } from "../waste-bag.types";
import { publishMilestone } from "./_shared";

// createWasteController — mirrors CreateWaste.ts / createWasteController.ts:
//   - missing bearer token -> isValidationError:true -> InvalidArgument
//     (the port has no equivalent "raw token" concept — auth:true already
//     guarantees a bearer token reached the handler, so this branch is
//     structurally unreachable here and is not reproduced)
//   - unknown wasteClassificationId -> use-case returns the string
//     'WASTE_CLASSIFICATION_NOT_FOUND', controller does res.fail(t(...), {message:...})
//     with NO isValidationError flag -> FailedPrecondition, not InvalidArgument
//     despite reading like a 404 — preserved verbatim (same class of bug as
//     global-settings's "not found but plain 400" cases).
//   - request-shape validation (this port's addition, not in the original,
//     which has no Zod layer on this route beyond createWasteSchema's own
//     checks) -> InvalidArgument.
//
// Not machine-gated: this is the bag's creation, not a transition between
// two existing statuses — there's nothing for checkWasteBagTransition to
// check yet.
export async function createWasteBag(input: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  sourceTreatmentGroupId?: string;
  scaleMethod: string;
  weightInKgs?: number;
  wasteBagQrCodeId: string;
  assetId?: number;
  binNumber?: string;
  wasteGroupIds?: string;
  bastNo?: string;
  materialIds?: string;
  iotMethod?: string;
  isTreated?: boolean;
  isRadioActive?: boolean;
}): Promise<WasteBag> {
  const parsed = createWasteBagSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Ports CreateWaste.ts's wasteClassification lookup + isRadioActive branch.
  const wasteClassification = await wasteClassificationRepo.findById(parsed.data.wasteClassificationId);
  if (!wasteClassification) {
    // Original: use-case returns the string 'WASTE_CLASSIFICATION_NOT_FOUND',
    // controller does res.fail(t(...)) with no isValidationError flag ->
    // FailedPrecondition, not InvalidArgument, despite reading like a 404 —
    // preserved verbatim (documented at this function's top-level comment).
    throw new APIError(ErrCode.FailedPrecondition, "WASTE_CLASSIFICATION_NOT_FOUND");
  }

  const isRadioActive = input.isRadioActive ?? false;
  const startDate = new Date();
  // Original: `Number(getWasteClassification.minimunDecayDay) + 1` — when
  // minimunDecayDay is undefined this is `Number(undefined) + 1` = NaN;
  // preserved verbatim rather than defaulting to 0.
  const decayDay = Number(wasteClassification.minimunDecayDay) + 1;
  const scheduledStorageEndDatetime = isRadioActive
    ? new Date(startDate.getTime() + decayDay * 24 * 60 * 60 * 1000)
    : new Date(startDate.getTime() + Number(wasteClassification.tempStorageMaxHours ?? 0) * 60 * 60 * 1000);

  const wasteGroupIds = parsed.data.wasteGroupIds?.replace(/\s+/g, "");

  if (isRadioActive) {
    // Mirrors CreateWaste.ts's `checkData` lookup + in-place update branch —
    // when a row with this wasteBagQrCodeId already exists, update it
    // instead of inserting a new one (no status change, no publish; see
    // updateById's doc comment in the repository for why).
    const existing = await repo.findByQrCodeId(parsed.data.wasteBagQrCodeId);
    if (existing && existing.id !== undefined) {
      const updated = await repo.updateById(existing.id, {
        updatedBy: input.createdBy,
        scaleMethod: parsed.data.scaleMethod,
        weightInKgs: parsed.data.weightInKgs,
        binNumber: parsed.data.binNumber,
        iotMethod: parsed.data.iotMethod,
        wasteGroupIds,
        bastNo: parsed.data.bastNo,
        materialIds: parsed.data.materialIds,
        assetId: parsed.data.assetId,
      });
      if (updated) {
        return updated;
      }
    }
  }

  // Mirrors CreateWaste.ts's getEntityDetail(healthcareFacilityId, token)
  // enrichment (denormalized onto the row at insert time) — from the local
  // `entities`/`regions` tables rather than the HTTP round-trip.
  const entity = await getEntityId(parsed.data.healthcareFacilityId);
  const regionNames = await getEntityRegionNames(entity);

  const created = await repo.create({
    createdBy: input.createdBy,
    healthcareFacilityId: parsed.data.healthcareFacilityId,
    wasteSourceId: parsed.data.wasteSourceId,
    wasteClassificationId: parsed.data.wasteClassificationId,
    sourceTreatmentGroupId: parsed.data.sourceTreatmentGroupId,
    scaleMethod: parsed.data.scaleMethod,
    weightInKgs: parsed.data.weightInKgs,
    wasteBagQrCodeId: parsed.data.wasteBagQrCodeId,
    assetId: parsed.data.assetId,
    binNumber: parsed.data.binNumber,
    wasteGroupIds,
    bastNo: parsed.data.bastNo,
    materialIds: parsed.data.materialIds,
    iotMethod: parsed.data.iotMethod,
    isTreated: parsed.data.isTreated ?? false,
    scheduledStorageEndDatetime,
    healthcareFacilityName: entity?.name,
    ...regionNames,
  });

  // Original: after create, if wasteGroupIds is set, flips a readonly flag
  // on the referenced waste-bag-treatment-group rows.
  if (wasteGroupIds) {
    await wasteBagTreatmentGroupRepo.updateIsReadOnly(wasteGroupIds);
  }

  // Original logs 'WASTE_BAG_TEMPORARY_STORED' here (see CreateWaste.ts) —
  // a newly created bag has no "previous" in-app status, so previousStatus
  // mirrors the row's own initial value (self-transition) rather than an
  // empty string, keeping the event shape consistent for subscribers.
  await publishMilestone<WasteBagCreatedEvent>(async (e) => void (await wasteBagCreated.publish(e)), {
    wasteBagId: created.id as number,
    previousStatus: created.wasteStatus,
    newStatus: created.wasteStatus,
    createdBy: input.createdBy,
    initialStatus: created.wasteStatus,
  });
  return created;
}
