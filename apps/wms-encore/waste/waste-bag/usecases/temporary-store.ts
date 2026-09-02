import { APIError, ErrCode } from "encore.dev/api";
import { wasteBagStored } from "../../../messaging/topics";
import type { WasteBagStoredEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { bulkWasteBagQrCodeSchema } from "../waste-bag.schema";
import type { BulkActionResult } from "../waste-bag.types";
import { publishMilestoneForBags } from "./_shared";

// temporaryStoreWasteController — validates `wasteBagQrCodeIds` and moves
// bags into IN_TEMPORARY_STORAGE.
//
// NOT machine-gated, unlike the other usecases in this folder: this status
// is the machine's `initial` state, not a real transition target — there's
// no (state, event) pair in waste-bag.machine.ts that models "move TO
// inTemporaryStorage" from an arbitrary current state, because the original
// had no verified precondition here either (a bag can apparently be
// (re-)marked temporary-stored from any status). Adding a machine event for
// this would mean inventing a new business rule, not preserving one — left
// as a deliberate gap, flag if this needs tightening later.
export async function temporaryStoreWasteBags(input: {
  wasteBagQrCodeIds: string[];
  updatedBy: string;
}): Promise<BulkActionResult> {
  const parsed = bulkWasteBagQrCodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const before = await repo.updateStatusByQrCodeIds(
    parsed.data.wasteBagQrCodeIds,
    "IN_TEMPORARY_STORAGE",
    input.updatedBy
  );
  if (before.length === 0) {
    // res.fail('Failed to store waste bag in temporary storage') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Failed to store waste bag in temporary storage");
  }
  // No scheduledEvent — IN_TEMPORARY_STORAGE isn't one of the original's
  // "_STARTED"/creation transitions that gets a follow-up (see
  // ScheduleEventForWasteStatusUpdateUseCase.ts's exact discriminator list).
  await publishMilestoneForBags<WasteBagStoredEvent>(
    async (e) => void (await wasteBagStored.publish(e)),
    before,
    "IN_TEMPORARY_STORAGE",
    input.updatedBy,
    () => ({ storageType: "TEMPORARY" as const })
  );
  return { affected: before.length };
}
