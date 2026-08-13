import { db } from "../db/db";
import { sql } from "kysely";

// Mirrors ProcessScheduledEventUseCase.ts's `scheduledEventRepository.removeEvent(eventData.id!)`
// call at the end of a successful process step — deleting the row is what
// makes a scheduled event a one-shot, not a recurring reminder.
export async function deleteScheduledEvent(id: number): Promise<void> {
  await db.deleteFrom("scheduled_events").where("id", "=", id).execute();
}

// Mirrors the catch block's `scheduledEventRepository.failEvent(eventData.id)`
// call — the ONLY place that path is exercised in the original. Rather than
// leaving a bad row PENDING forever to be blindly retried by the poller every
// minute, this marks it FAILED and decrements retry_left (both columns added
// by migration 14_scheduled_events_metadata). Whoever wires up a retry policy
// can use retry_left > 0 to decide whether to flip a FAILED row back to
// PENDING for one more attempt — out of scope here, this function only
// performs the original's exact "mark it failed" step.
export async function failScheduledEvent(id: number): Promise<void> {
  await db
    .updateTable("scheduled_events")
    .set({
      status: "FAILED",
      retry_left: sql`retry_left - 1`,
    })
    .where("id", "=", id)
    .execute();
}
