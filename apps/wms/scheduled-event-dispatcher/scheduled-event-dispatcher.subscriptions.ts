import { Subscription } from "encore.dev/pubsub";
import { scheduledEventProcess } from "../messaging/topics";
import * as service from "./scheduled-event-dispatcher.service";

// Mirrors scheduledEventProcessListener.ts -> processScheduledEventHandler.ts.
new Subscription(scheduledEventProcess, "process-scheduled-event", {

  handler: async (event) => {
    await service.processScheduledEvent({
      scheduledEventId: event.scheduledEventId,
      eventType: event.eventType,
      subjectId: event.subjectId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      createdBy: event.createdBy,
      metadata: event.metadata,
      scheduledAt: event.scheduledAt,
    });
  },
});
