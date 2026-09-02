import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes, wasteBagPickedUp } from "../../../messaging/topics";
import type { WasteBagPickedUpEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { pickUpTransportExternalSchema } from "../waste-bag.schema";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import { publishMilestone } from "./_shared";

// pickUpToTransporterExternal — only a string-result branch in the original
// (no null check) -> InvalidArgument.
//
// Note: like handoverTransportRequest, the precondition here was already
// enforced by the original at the DB level — applyPickUpTransportExternal's
// own query only matches bags with waste_status='TRANSPORTATION_REQUEST_CREATED'.
// The checkWasteBagTransition call is defense-in-depth against the shared
// machine, not a new restriction.
export async function pickUpTransportExternalRequest(input: {
  wasteTransportationExternalGroupIds: number[];
  healthcareFacilityId: number;
  handoverLatitude: number;
  handoverLongitude: number;
  updatedBy: string;
  transporterId: number;
  transporterOperatorId: string;
}): Promise<{ wasteBagQrCodeIds: string[]; healthcareFacilityId?: number }> {
  const parsed = pickUpTransportExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  if (
    !checkWasteBagTransition("TRANSPORTATION_REQUEST_CREATED", {
      type: WASTE_EVENT.PICKUP_TO_TRANSPORTER_EXTERNAL,
    }).allowed
  ) {
    // Unreachable given applyPickUpTransportExternal's own filter — kept so
    // the machine stays the single source of truth for this rule.
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }

  // Ports PickUpTransportExternal.ts / createPickUpTransportExternalWasteBag,
  // including its healthcareFacilityId/transporterId/transporterOperatorId
  // scoping — see applyPickUpTransportExternal's doc comment.
  const after = await repo.applyPickUpTransportExternal({
    wasteTransportationExternalGroupIds: parsed.data.wasteTransportationExternalGroupIds,
    healthcareFacilityId: parsed.data.healthcareFacilityId,
    transporterId: input.transporterId,
    transporterOperatorId: input.transporterOperatorId,
    handoverLatitude: parsed.data.handoverLatitude,
    handoverLongitude: parsed.data.handoverLongitude,
    treatmentProviderId: parsed.data.treatmentProviderId,
    treatmentOperatorId: parsed.data.treatmentOperatorId,
    isReadOnly: parsed.data.isReadOnly,
    updatedBy: input.updatedBy,
  });
  if (after.length === 0) {
    // Original: no null-check branch in the use-case for this one (only a
    // string-result "NOT_FOUND" -> InvalidArgument per this function's
    // top-level comment) — mirrored here as InvalidArgument, not
    // FailedPrecondition, unlike the other group actions in this file.
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }

  // Mirrors PickUpTransportExternal.ts: WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL.
  const pickupEndTime = parsed.data.endTime ?? new Date().toISOString();
  await Promise.all(
    after
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone<WasteBagPickedUpEvent>(
          async (e) => void (await wasteBagPickedUp.publish(e)),
          {
            wasteBagId: bag.id as number,
            previousStatus: "TRANSPORTATION_REQUEST_CREATED",
            newStatus: "IN_TRANSIT",
            createdBy: input.updatedBy,
            transporterId: input.transporterId,
          },
          {
            scheduledEventType: ScheduledEventTypes.WasteBagPickupToTransporterExternal,
            scheduledAt: pickupEndTime,
            metadata: {
              wasteBagId: bag.id,
              createdBy: input.updatedBy,
              startTime: parsed.data.startTime,
              endTime: pickupEndTime,
              isGroup: false,
              entityId: bag.healthcareFacilityId,
            },
          }
        )
      )
  );
  return {
    wasteBagQrCodeIds: after.map((b) => b.wasteBagQrCodeId as string),
    healthcareFacilityId: after[0]?.healthcareFacilityId,
  };
}
