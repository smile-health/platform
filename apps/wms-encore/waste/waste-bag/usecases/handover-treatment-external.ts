import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes, wasteBagHandedOverToTreatment } from "../../../messaging/topics";
import type { WasteBagHandedOverToTreatmentEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { handoverTreatmentExternalSchema } from "../waste-bag.schema";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import type { WasteStatus } from "../waste-bag.types";
import { publishMilestone } from "./_shared";

// handoverToTreatmentExternal — string result -> InvalidArgument (no
// null/falsy branch in the original).
//
// BEHAVIOR CHANGE from the original: applyHandoverTreatmentExternal itself
// has no status filter — it matches purely by external transport group id,
// with no precondition on the bag's current waste_status. This now looks
// the bags up first (findManyByExternalTransportGroupIds, added for this)
// and rejects via the shared waste-bag machine (HANDOVER_TO_TREATMENT_EXTERNAL
// is only legal from transportationRequestCreated) if none qualify.
// Deliberate tightening, not a faithful port.
export async function handoverTreatmentExternalRequest(input: {
  wasteTransportationExternalGroupIds: number[];
  startTime: string;
  endTime: string;
  treatmentLocationId: number;
  updatedBy: string;
}): Promise<{ wasteBagQrCodeIds: string[]; groupId?: number }> {
  const parsed = handoverTreatmentExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const candidates = await repo.findManyByExternalTransportGroupIds(
    parsed.data.wasteTransportationExternalGroupIds
  );
  const eligible = candidates.some(
    (bag) =>
      checkWasteBagTransition(bag.wasteStatus as WasteStatus, {
        type: WASTE_EVENT.HANDOVER_TO_TREATMENT_EXTERNAL,
      }).allowed
  );
  if (!eligible) {
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }
  // NOTE: this only rejects a batch where NO bag qualifies.
  // applyHandoverTreatmentExternal itself still updates every bag matching
  // the group ids without a per-bag status filter (it's building
  // waste_treatment_external_group rows keyed by transport group, not by
  // individual bag eligibility) — a mixed-status batch can still carry some
  // ineligible bags through. Filtering that precisely would mean reworking
  // applyHandoverTreatmentExternal's group-creation logic to operate per
  // eligible bag rather than per group, which is out of scope here.

  // Ports HandOverTreatmentExternal.ts / createHandoverTreatmentExternalWasteBag,
  // including its group-creation step (WasteTreatmentExternalGroupImpl.
  // createWasteTreatmentExternalGroup) — done directly against
  // waste_treatment_external_group in the repository, since the sibling
  // waste-treatment-external-group module currently exposes no "create",
  // only report/find helpers (see that module's repository.ts).
  const after = await repo.applyHandoverTreatmentExternal({
    wasteTransportationExternalGroupIds: parsed.data.wasteTransportationExternalGroupIds,
    treatmentProviderId: parsed.data.entityId ?? null,
    thirdPartyId: parsed.data.treatmentId,
    treatmentLocationId: parsed.data.treatmentLocationId,
    updatedBy: input.updatedBy,
  });
  if (after.length === 0) {
    // Original: no null/falsy branch here either — only string results
    // ('WASTE_TRANSPORTATION_GROUP_NOT_FOUND' / 'NOT_FOUND' /
    // 'TRANSPORTATION_GROUP_NOT_FOUND') -> InvalidArgument, per this
    // function's top-level comment ("string result -> InvalidArgument, no
    // null/falsy branch in either").
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }

  // Mirrors HandOverTreatmentExternal.ts: WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL.
  await Promise.all(
    after
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone<WasteBagHandedOverToTreatmentEvent>(
          async (e) => void (await wasteBagHandedOverToTreatment.publish(e)),
          {
            wasteBagId: bag.id as number,
            previousStatus: "TRANSPORTATION_REQUEST_CREATED",
            newStatus: "HANDOVER_TO_TREATMENT",
            createdBy: input.updatedBy,
          },
          {
            scheduledEventType: ScheduledEventTypes.WasteBagHandoverToTreatmentExternal,
            scheduledAt: parsed.data.endTime,
            metadata: {
              wasteBagId: bag.id,
              createdBy: input.updatedBy,
              startTime: parsed.data.startTime,
              endTime: parsed.data.endTime,
              isGroup: false,
              entityId: bag.healthcareFacilityId,
            },
          }
        )
      )
  );
  return { wasteBagQrCodeIds: after.map((b) => b.wasteBagQrCodeId as string) };
}
