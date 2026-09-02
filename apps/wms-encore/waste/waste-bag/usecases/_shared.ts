import type { ScheduledEventTrigger } from "../../../messaging/topics";
import { scheduling } from "~encore/clients";
import type { WasteBag, WasteStatus } from "../waste-bag.types";

// Moved out of waste-bag.service.ts verbatim (see that file's history for
// the original module-level comment explaining why this takes a `publish`
// callback instead of a Topic parameter: Encore's static analyzer requires
// every `topic.publish(...)` call to be a literal, directly-resolvable
// module-level reference — passing the topic through a function parameter
// breaks that. Each usecase file below still writes its own literal
// `wasteBagX.publish(event)` call, just wrapped in a one-line arrow.
export async function publishMilestone<
  E extends { wasteBagId: number; previousStatus: string; newStatus: string; updatedAt: string; createdBy: string }
>(
  publish: (event: E) => Promise<void>,
  event: Omit<E, "updatedAt">,
  scheduledEvent?: ScheduledEventTrigger
): Promise<void> {
  await publish({ ...event, updatedAt: new Date().toISOString() } as E);

  if (scheduledEvent) {
    await scheduling.scheduleFollowUp({
      wasteBagId: event.wasteBagId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      createdBy: event.createdBy,
      scheduledEvent,
    });
  }
}

// `buildTrigger`, when given, is called per-bag to compute that bag's
// ScheduledEventTrigger (or undefined, for transitions that don't need one).
export async function publishMilestoneForBags<
  E extends { wasteBagId: number; previousStatus: string; newStatus: string; updatedAt: string; createdBy: string }
>(
  publish: (event: E) => Promise<void>,
  before: WasteBag[],
  newStatus: WasteStatus,
  createdBy: string,
  extra: (bag: WasteBag) => Omit<E, "wasteBagId" | "previousStatus" | "newStatus" | "updatedAt" | "createdBy">,
  buildTrigger?: (bag: WasteBag) => ScheduledEventTrigger | undefined
): Promise<void> {
  await Promise.all(
    before
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone(
          publish,
          {
            wasteBagId: bag.id as number,
            previousStatus: bag.wasteStatus,
            newStatus,
            createdBy,
            ...extra(bag),
          } as unknown as Omit<E, "updatedAt">,
          buildTrigger?.(bag)
        )
      )
  );
}
