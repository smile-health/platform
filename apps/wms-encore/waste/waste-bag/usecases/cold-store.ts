import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes, wasteBagStored } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { bulkWasteBagQrCodeSchema } from "../waste-bag.schema";
import type { BulkActionResult, WasteStatus } from "../waste-bag.types";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import { publishMilestoneForBags } from "./_shared";
import type { WasteBagStoredEvent } from "../../../messaging/topics";

// coldStoreWasteController — mirrors ColdStoreWaste.ts:
//   - !isColdStored -> res.fail(no flag) -> FailedPrecondition
//   - typeof isColdStored === 'string' -> res.fail(t(...), no flag) -> FailedPrecondition
//
// BEHAVIOR CHANGE from the original: the original applied this update
// unconditionally, with no check on the bag's current status. This now goes
// through the shared waste-bag machine (COLD_STORE is only legal from
// inTemporaryStorage) and rejects with FailedPrecondition otherwise. This is
// a deliberate tightening, not a faithful port — flag if any real caller
// relied on cold-storing a bag from another status.
export async function coldStoreWasteBags(input: {
  wasteBagQrCodeIds: string[];
  endTime?: string;
  createdBy: string;
}): Promise<BulkActionResult> {
  const parsed = bulkWasteBagQrCodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const candidates = await repo.findManyByQrCodeIds(parsed.data.wasteBagQrCodeIds);
  const eligibleQrCodeIds = candidates
    .filter(
      (bag) =>
        checkWasteBagTransition(bag.wasteStatus as WasteStatus, { type: WASTE_EVENT.COLD_STORE }).allowed
    )
    .map((bag) => bag.wasteBagQrCodeId)
    .filter((id): id is string => Boolean(id));

  if (eligibleQrCodeIds.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "Failed to store waste bag in cold storage");
  }

  const before = await repo.updateStatusByQrCodeIds(eligibleQrCodeIds, "IN_COLD_STORAGE", input.createdBy);
  if (before.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "Failed to store waste bag in cold storage");
  }
  // Mirrors ColdStoreWaste.ts: WASTE_BAG_COLD_STORED_STARTED, with
  // scheduledAt = metadata.endTime (no treatmentEndTime concept here) —
  // defaults to "now" when the caller didn't supply endTime, same as the
  // original's `data.endTime ? new Date(data.endTime) : new Date()`.
  const coldStoreStartTime = new Date().toISOString();
  const coldStoreEndTime = parsed.data.endTime ? new Date(parsed.data.endTime).toISOString() : coldStoreStartTime;
  await publishMilestoneForBags<WasteBagStoredEvent>(
    async (e) => void (await wasteBagStored.publish(e)),
    before,
    "IN_COLD_STORAGE",
    input.createdBy,
    () => ({ storageType: "COLD" as const }),
    (bag) => ({
      scheduledEventType: ScheduledEventTypes.WasteBagColdStoredStarted,
      scheduledAt: coldStoreEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.createdBy,
        startTime: coldStoreStartTime,
        endTime: coldStoreEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return { affected: before.length };
}
