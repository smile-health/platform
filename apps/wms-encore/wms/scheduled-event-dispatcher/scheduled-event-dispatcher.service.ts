import { ScheduledEventTypes } from "../messaging/topics";
import type { ScheduledEventType, ScheduledEventMetadata } from "../messaging/topics";
import * as repo from "./scheduled-event-dispatcher.repository";
import { waste, partnership, manual_scale_request } from "~encore/clients";

// Thin router — full port of apps/wms-service's ProcessScheduledEventUseCase.ts,
// restoring the real per-eventType work (waste-bag status advancement w/
// precondition checks, partnership contract-expiry + pre-expiry reminders,
// manual-scale request activation) that a previous version of this file
// replaced with a blanket "log and delete" for every event.
//
// Each domain now owns its own precondition/mutation/notification logic
// (waste-bag.service.ts's advanceScheduledWasteBagEvent,
// partnership.service.ts's expireContractIfDue,
// manual-scale-request.service.ts's markWaitingForApproval) — this file's
// only job is to route a due event to the right one and delete/fail the row.
// The original's ProcessScheduledEventUseCase mixed all of that domain logic
// into one ~790-line class; that god-object shape was ported faithfully at
// first, then split apart once it became clear the dispatcher shouldn't know
// more about waste-bag/partnership internals than those domains' own
// services do.
//
// waste/partnership/manual-scale-request are each their own Encore service
// (separate encore.service.ts registrations) — calling into them via
// ~encore/clients (rather than a plain cross-package TypeScript import) makes
// this a real Encore RPC hop, so it shows up correctly in the trace view and
// the service dependency graph instead of looking like an in-process call.

const WASTE_BAG_EVENT_TYPES: ReadonlySet<ScheduledEventType> = new Set([
  ScheduledEventTypes.WasteBagInternalLandfillStarted,
  ScheduledEventTypes.WasteBagColdStoredStarted,
  ScheduledEventTypes.WasteBagIncinerationStarted,
  ScheduledEventTypes.WasteBagSterilisedStarted,
  ScheduledEventTypes.WasteBagFollowUpToTransporter,
  ScheduledEventTypes.WasteBagHandoverToTransporter,
  ScheduledEventTypes.WasteBagFollowUpToTransporterExternal,
  ScheduledEventTypes.WasteBagHandoverToTransporterExternal,
  ScheduledEventTypes.WasteBagPickupToTransporterExternal,
  ScheduledEventTypes.WasteBagHandoverToTreatmentExternal,
  ScheduledEventTypes.WasteBagReceivingToTreatmentExternal,
  ScheduledEventTypes.WasteBagSterilisedExternalStarted,
  ScheduledEventTypes.WasteBagIncineratesExternalStarted,
  ScheduledEventTypes.WasteBagLandfilledExternalStarted,
  ScheduledEventTypes.WasteBagAlreadyReceived,
]);

export async function processScheduledEvent(input: {
  scheduledEventId: number;
  eventType: ScheduledEventType;
  subjectId: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  metadata: ScheduledEventMetadata;
  scheduledAt: string;
}): Promise<void> {
  try {
    let shouldDelete = true;

    if (WASTE_BAG_EVENT_TYPES.has(input.eventType)) {
      await waste.advanceScheduledWasteBagEvent({ eventType: input.eventType, metadata: input.metadata });
    } else if (input.eventType === ScheduledEventTypes.PartnershipContractExpired) {
      // Mirrors the original's `eventData.scheduledAt` — the scheduled_events
      // row's own scheduled_at, threaded through ScheduledEventProcessEvent
      // (see messaging/topics.ts and schedule-event.repository.ts's
      // findDueScheduledEvents).
      const scheduledAt = input.scheduledAt;
      // Only delete the row when the contract actually expired this call —
      // the reminder-only path (daysRemaining === 3 or 1) must leave the row
      // PENDING so a later tick can still expire it for real.
      //
      // KNOWN GAP: leaving the row PENDING doesn't actually make the reminder
      // path reachable again today — schedule-event.service.ts's
      // checkAndDispatchDueEvents already set dispatched_at on this row
      // before publishing it here, and findDueScheduledEvents filters on
      // dispatched_at IS NULL, so this row will never be re-polled. In
      // practice scheduledAt = the contract's real end date, so a row only
      // becomes "due" at all once daysRemaining is already <= 0 — meaning the
      // day-3/day-1 reminder branch inside expireContractIfDue is presently
      // unreachable via this dispatch path (it needs a separate look-ahead
      // poll, not the due-event one). Not fixed here — it predates this
      // refactor and is a separate scheduling-window design gap.
      const result = await partnership.expireContractIfDue({ scheduledAt, metadata: input.metadata });
      shouldDelete = result.didExpire;
    } else if (input.eventType === ScheduledEventTypes.StartManualScaleRequest) {
      const meta = input.metadata as unknown as { manualScaleId: number };
      await manual_scale_request.markWaitingForApproval({ manualScaleId: meta.manualScaleId });
    } else {
      // Defensive default — every current ScheduledEventType member is
      // covered by WASTE_BAG_EVENT_TYPES or one of the two branches above.
      // (Not encoded as a compile-time exhaustiveness check here: narrowing
      // through the `WASTE_BAG_EVENT_TYPES.has(...)` Set-membership test
      // above doesn't narrow the union the way a literal switch would, so a
      // `never` assignment at this point would be a false positive, not a
      // real safety net.) A genuinely unhandled new eventType surfaces here
      // as a thrown Error instead of silently no-op'ing.
      throw new Error(`Unhandled ScheduledEventType: ${input.eventType}`);
    }

    if (shouldDelete) {
      await repo.deleteScheduledEvent(input.scheduledEventId);
    }
  } catch (error) {
    console.error("Error processing scheduled event:", error);
    if (typeof error === "string") {
      // Mirrors the original's catch: a *string* throw (the waste-bag
      // domain's precondition checks) is the ONLY path that calls failEvent —
      // an Error instance instead re-throws a generic failure, and anything
      // else re-throws as unexpected. Both preserved verbatim below.
      await repo.failScheduledEvent(input.scheduledEventId);
    } else if (error instanceof Error) {
      throw new Error("Failed to process scheduled event");
    } else {
      throw new Error("An unexpected error occurred while processing the scheduled event");
    }
  }
}
