import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes } from "../../../messaging/topics";
import type { ScheduledEventType, WasteBagTreatmentStartedEvent } from "../../../messaging/topics";
import { wasteBagTreatmentStarted } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { treatmentActionSchema } from "../waste-bag.schema";
import type { WasteStatus } from "../waste-bag.types";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import type { WasteEvent } from "../waste-bag.machine";
import { publishMilestoneForBags } from "./_shared";

// internalLandfillWasteBagController / sterilisedWasteBagController /
// incinerateWasteBagController — all three share the same
// null->FailedPrecondition, string->InvalidArgument shape (InternalLandfill.ts,
// AutoClaveWasteBag.ts, IncinerateWasteBag.ts each return
// null | string | boolean via `postTreatment`).
//
// BEHAVIOR CHANGE from the original: the original applied these unconditionally
// regardless of current status. This now goes through the shared waste-bag
// machine — TREAT_LANDFILL/TREAT_STERILISE/TREAT_INCINERATE are only legal
// from inTemporaryStorage or inColdStorage — and skips any bag not in one of
// those states instead of silently treating it. Deliberate tightening, not a
// faithful port.
async function runTreatmentAction(
  input: { wasteBagQrCodeIds: string[]; treatmentStartTime: string; treatmentEndTime: string; createdBy: string },
  newStatus: WasteStatus,
  event: Exclude<WasteEvent, "CONFIRM_PICKUP" | "CONFIRM_RECEIPT">,
  eventType: ScheduledEventType,
  treatmentMethod: "LANDFILL" | "INCINERATION" | "STERILISATION"
): Promise<boolean> {
  const parsed = treatmentActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const candidates = await repo.findManyByQrCodeIds(parsed.data.wasteBagQrCodeIds);
  const eligibleQrCodeIds = candidates
    .filter((bag) => checkWasteBagTransition(bag.wasteStatus as WasteStatus, { type: event }).allowed)
    .map((bag) => bag.wasteBagQrCodeId)
    .filter((id): id is string => Boolean(id));

  if (eligibleQrCodeIds.length === 0) {
    // result === null -> res.fail('waste.error.UNCOMPLETED_ACTION_TYPE') -> FailedPrecondition
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }

  const before = await repo.updateStatusByQrCodeIds(eligibleQrCodeIds, newStatus, input.createdBy, {
    treatment_start_time: new Date(parsed.data.treatmentStartTime),
    treatment_end_time: new Date(parsed.data.treatmentEndTime),
  });
  if (before.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }
  // Announces the operator's start-of-treatment action (this port's status
  // column already jumps straight to the terminal value synchronously — see
  // this module's "IMPORTANT DEVIATION" comment further down — but the real
  // business milestone here is "treatment was started"; the matching
  // "treatment was completed" confirmation fires later, at treatmentEndTime,
  // from advanceScheduledWasteBagEvent's notification-only branch).
  await publishMilestoneForBags<WasteBagTreatmentStartedEvent>(
    async (e) => void (await wasteBagTreatmentStarted.publish(e)),
    before,
    newStatus,
    input.createdBy,
    () => ({ treatmentMethod, scheduledEndTime: parsed.data.treatmentEndTime }),
    (bag) => ({
      scheduledEventType: eventType,
      scheduledAt: parsed.data.treatmentEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.createdBy,
        treatmentStartTime: parsed.data.treatmentStartTime,
        treatmentEndTime: parsed.data.treatmentEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return true;
}

export async function internalLandfillWasteBags(input: {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
  createdBy: string;
}): Promise<boolean> {
  return runTreatmentAction(
    input,
    "INTERNAL_LANDFILLED",
    WASTE_EVENT.TREAT_LANDFILL,
    ScheduledEventTypes.WasteBagInternalLandfillStarted,
    "LANDFILL"
  );
}

export async function steriliseWasteBags(input: {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
  createdBy: string;
}): Promise<boolean> {
  return runTreatmentAction(
    input,
    "STERILISED",
    WASTE_EVENT.TREAT_STERILISE,
    ScheduledEventTypes.WasteBagSterilisedStarted,
    "STERILISATION"
  );
}

export async function incinerateWasteBags(input: {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
  createdBy: string;
}): Promise<boolean> {
  return runTreatmentAction(
    input,
    "INCINERATED",
    WASTE_EVENT.TREAT_INCINERATE,
    ScheduledEventTypes.WasteBagIncinerationStarted,
    "INCINERATION"
  );
}
