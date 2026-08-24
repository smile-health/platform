import * as repo from "./schedule-event.repository";
import { scheduledEventProcess } from "../../messaging/topics";
import type { ScheduledEventMetadata, ScheduledEventType } from "../../messaging/topics";

// Mirrors ScheduleEventForWasteStatusUpdateUseCase.ts /
// ScheduleEventForPartnershipUseCase.ts / ScheduleEventForManualScaleUseCase.ts:
// each only creates a ScheduledEvent for a specific named subset of
// transitions (the "_STARTED"/creation events), using the real completion
// time the caller computed (`metadata.treatmentEndTime ?? metadata.endTime`),
// not a fixed delay. The `scheduledEvent` field on the incoming status-update
// event is only ever set by a producer for one of those specific transitions
// (see waste-bag.service.ts/partnership.service.ts/manual-scale-request.service.ts) —
// its absence here means "this transition doesn't need a follow-up", so we
// no-op instead of scheduling one for every single status change.
async function scheduleIfTriggered(input: {
  subjectId: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  scheduledEvent?: {
    scheduledEventType: ScheduledEventType;
    scheduledAt: string;
    metadata: ScheduledEventMetadata;
  };
}): Promise<void> {
  if (!input.scheduledEvent) {
    return;
  }
  await repo.insertScheduledEvent({
    subjectId: input.subjectId,
    eventType: input.scheduledEvent.scheduledEventType,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    scheduledAt: new Date(input.scheduledEvent.scheduledAt),
    createdBy: input.createdBy,
    metadata: input.scheduledEvent.metadata,
  });
}

export async function scheduleFollowUp(input: {
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  scheduledEvent?: {
    scheduledEventType: ScheduledEventType;
    scheduledAt: string;
    metadata: ScheduledEventMetadata;
  };
}): Promise<void> {
  await scheduleIfTriggered({
    subjectId: input.wasteBagId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    createdBy: input.createdBy,
    scheduledEvent: input.scheduledEvent,
  });
}

export async function scheduleFollowUpForManualRequest(input: {
  manualScaleRequestId: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  scheduledEvent?: {
    scheduledEventType: ScheduledEventType;
    scheduledAt: string;
    metadata: ScheduledEventMetadata;
  };
}): Promise<void> {
  await scheduleIfTriggered({
    subjectId: input.manualScaleRequestId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    createdBy: input.createdBy,
    scheduledEvent: input.scheduledEvent,
  });
}

export async function scheduleFollowUpForPartnership(input: {
  partnershipId: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  scheduledEvent?: {
    scheduledEventType: ScheduledEventType;
    scheduledAt: string;
    metadata: ScheduledEventMetadata;
  };
}): Promise<void> {
  await scheduleIfTriggered({
    subjectId: input.partnershipId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    createdBy: input.createdBy,
    scheduledEvent: input.scheduledEvent,
  });
}

// Mirrors minuteInterval.ts's polling loop + ScheduledEventProcessPublisher.ts.
// This service owns both the CronJob (schedule-event.cron.ts) AND the data, so
// this is now a plain intra-service call — no cross-service RPC needed to read
// due events. jobs/ keeps only a thin CLI/Jenkins-style admin trigger that calls
// this same logic via ~encore/clients (see jobs.controller.ts).
//
// findDueScheduledEvents only returns rows with dispatched_at is null and
// status = 'PENDING', and markDispatched is called immediately after each
// publish — together these are what stop a past-due row from being
// re-published on every subsequent 1-minute tick.
export async function checkAndDispatchDueEvents(): Promise<void> {
  const due = await repo.findDueScheduledEvents();
  for (const event of due) {
    await scheduledEventProcess.publish({
      scheduledEventId: event.id,
      eventType: event.eventType as ScheduledEventType,
      subjectId: event.subjectId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      createdBy: event.createdBy,
      metadata: event.metadata,
      scheduledAt: event.scheduledAt.toISOString(),
    });
    await repo.markDispatched(event.id);
  }
}
