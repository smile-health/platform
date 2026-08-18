import { db } from "../db";
import type { ScheduledEventMetadata, ScheduledEventType } from "../../messaging/topics";

export async function insertScheduledEvent(input: {
  subjectId: number;
  eventType: ScheduledEventType;
  previousStatus: string;
  newStatus: string;
  scheduledAt: Date;
  createdBy: string;
  metadata: ScheduledEventMetadata;
}): Promise<void> {
  await db
    .insertInto("scheduled_events")
    .values({
      subject_id: input.subjectId,
      event_type: input.eventType,
      previous_status: input.previousStatus,
      new_status: input.newStatus,
      scheduled_at: input.scheduledAt,
      created_by: input.createdBy,
      metadata: JSON.stringify(input.metadata),
      created_at: new Date(),
    })
    .execute();
}

// Mirrors fetchScheduledEvents.ts's due-event query (minuteInterval.ts's poll
// target). `dispatched_at is null` is what keeps this from re-publishing the
// same row on every 1-minute tick — see markDispatched below, called
// immediately after each row is published in schedule-event.service.ts.
// `status = 'PENDING'` additionally excludes rows a prior dispatch attempt
// already marked FAILED (see failEvent) — those need manual/retry handling,
// not another blind redispatch every minute.
export async function findDueScheduledEvents(): Promise<
  Array<{
    id: number;
    subjectId: number;
    eventType: string;
    previousStatus: string;
    newStatus: string;
    createdBy: string;
    metadata: ScheduledEventMetadata;
    scheduledAt: Date;
  }>
> {
  const rows = await db
    .selectFrom("scheduled_events")
    .select([
      "id",
      "subject_id",
      "event_type",
      "previous_status",
      "new_status",
      "created_by",
      "metadata",
      "scheduled_at",
    ])
    .where("scheduled_at", "<=", new Date())
    .where("dispatched_at", "is", null)
    .where("status", "=", "PENDING")
    .execute();
  return rows.map((r) => ({
    id: r.id,
    subjectId: r.subject_id,
    eventType: r.event_type,
    previousStatus: r.previous_status,
    newStatus: r.new_status,
    createdBy: r.created_by,
    metadata: (r.metadata as ScheduledEventMetadata | null) ?? {},
    scheduledAt: r.scheduled_at,
  }));
}

// Called right after a due row is published to scheduled-event-processed, so
// the next cron tick doesn't pick it up again while it's in flight to the
// dispatcher. The dispatcher deletes the row outright once it's actually
// handled it (see scheduled-event-dispatcher.repository.ts) — this is just
// the "don't redispatch" guard, not the terminal state.
export async function markDispatched(id: number): Promise<void> {
  await db.updateTable("scheduled_events").set({ dispatched_at: new Date() }).where("id", "=", id).execute();
}
