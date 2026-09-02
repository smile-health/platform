import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes, wasteBagTransportRequested } from "../../../messaging/topics";
import type { ScheduledEventType, WasteBagTransportRequestedEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import { followUpTransportSchema } from "../waste-bag.schema";
import type { BulkActionResult } from "../waste-bag.types";
import { publishMilestoneForBags } from "./_shared";

// followUpToTransporter / followUpToTransporterExternal — result===null ->
// FailedPrecondition, string result -> InvalidArgument.
//
// NOT machine-gated: same reasoning as temporaryStoreWasteBags — the
// original applies this unconditionally regardless of current status, and
// advanceScheduledWasteBagEvent's own NO_OP_TYPES comment for
// WasteBagFollowUpToTransporter confirms there's no precondition on this
// path in the original either. Left as-is rather than inventing a new rule.
export async function followUpTransportRequest(
  input: {
    wasteBagQrCodeIds: string[];
    providerType: string;
    transporterVehicleId?: number;
    vehicleNumber?: string;
    updatedBy: string;
    startTime?: string;
    endTime?: string;
  },
  // Mirrors TransportRequestedWasteBag.ts (internal) vs.
  // TransportExternalRequestedWasteBag.ts (external) — same shape/DTO, only
  // the eventType differs, per ScheduleEventForWasteStatusUpdateUseCase.ts's
  // distinct WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER(_EXTERNAL) discriminators.
  eventType: ScheduledEventType = ScheduledEventTypes.WasteBagFollowUpToTransporter
): Promise<BulkActionResult> {
  const parsed = followUpTransportSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const before = await repo.updateStatusByQrCodeIds(
    parsed.data.wasteBagQrCodeIds,
    "TRANSPORTATION_REQUEST_CREATED",
    input.updatedBy,
    {
      transportation_status: "REQUESTED",
      transportation_status_updated_at: new Date(),
      transportation_status_updated_by: input.updatedBy,
    }
  );
  if (before.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }
  const followUpEndTime = parsed.data.endTime ?? new Date().toISOString();
  const isExternal = eventType === ScheduledEventTypes.WasteBagFollowUpToTransporterExternal;
  await publishMilestoneForBags<WasteBagTransportRequestedEvent>(
    async (e) => void (await wasteBagTransportRequested.publish(e)),
    before,
    "TRANSPORTATION_REQUEST_CREATED",
    input.updatedBy,
    () => ({ isExternal }),
    (bag) => ({
      scheduledEventType: eventType,
      scheduledAt: followUpEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.updatedBy,
        startTime: parsed.data.startTime,
        endTime: followUpEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return { affected: before.length };
}

export async function followUpTransportExternalRequest(input: {
  wasteBagQrCodeIds: string[];
  providerType: string;
  updatedBy: string;
  startTime?: string;
  endTime?: string;
}): Promise<BulkActionResult> {
  return followUpTransportRequest(input, ScheduledEventTypes.WasteBagFollowUpToTransporterExternal);
}
