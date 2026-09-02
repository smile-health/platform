import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes, wasteBagReceivedForTreatment } from "../../../messaging/topics";
import type { WasteBagReceivedForTreatmentEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { receivingTreatmentExternalSchema } from "../waste-bag.schema";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import type { WasteStatus } from "../waste-bag.types";
import { publishMilestoneForBags } from "./_shared";

// receivingUpToTreatmentExternal
//
// BEHAVIOR CHANGE from the original: the original applied this unconditionally,
// with no check on the bag's current status. This now goes through the
// shared waste-bag machine (RECEIVE_TO_TREATMENT_EXTERNAL is only legal from
// handoverToTreatment) and only updates bags that qualify — same
// filter-then-update pattern as coldStoreWasteBags/runTreatmentAction.
export async function receivingTreatmentExternalRequest(input: {
  wasteBagQrCodeIds: string[];
  startTime: string;
  endTime: string;
  updatedBy: string;
}): Promise<{ wasteBagQrCodeIds: string[]; groupId?: number }> {
  const parsed = receivingTreatmentExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const candidates = await repo.findManyByQrCodeIds(parsed.data.wasteBagQrCodeIds);
  const eligibleQrCodeIds = candidates
    .filter(
      (bag) =>
        checkWasteBagTransition(bag.wasteStatus as WasteStatus, {
          type: WASTE_EVENT.RECEIVE_TO_TREATMENT_EXTERNAL,
        }).allowed
    )
    .map((bag) => bag.wasteBagQrCodeId)
    .filter((id): id is string => Boolean(id));

  const before = await repo.updateStatusByQrCodeIds(eligibleQrCodeIds, "READY_FOR_TREATMENT", input.updatedBy);
  // Mirrors ReceivmentTreatmentExternal.ts: WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL,
  // defaulting startTime/endTime to "now" same as the original's
  // `data.startTime ?? new Date().toISOString()` / `data.endTime ?? ...`.
  const receivingStartTime = parsed.data.startTime ?? new Date().toISOString();
  const receivingEndTime = parsed.data.endTime ?? new Date().toISOString();
  await publishMilestoneForBags<WasteBagReceivedForTreatmentEvent>(
    async (e) => void (await wasteBagReceivedForTreatment.publish(e)),
    before,
    "READY_FOR_TREATMENT",
    input.updatedBy,
    () => ({}),
    (bag) => ({
      scheduledEventType: ScheduledEventTypes.WasteBagReceivingToTreatmentExternal,
      scheduledAt: receivingEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.updatedBy,
        startTime: receivingStartTime,
        endTime: receivingEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return { wasteBagQrCodeIds: before.map((b) => b.wasteBagQrCodeId as string) };
}
