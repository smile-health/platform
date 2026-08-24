import { Subscription } from "encore.dev/pubsub";
import { wasteBagTreated, wasteBagFinalized } from "../../messaging/topics";
import * as service from "./notification.service";

// Reacts to the real milestone events directly (see messaging/topics.ts's
// header comment) rather than a generic notification-proxy topic —
// deciding whether/what to notify is entirely this module's job now
// (NOTIFICATION_EVENT_TYPE + the handle* functions in notification.service.ts).
// Only the 2 milestone topics that can plausibly warrant a notification (per
// the original's NOTIFICATION_EVENT_TYPE usage) are subscribed here.
new Subscription(wasteBagTreated, "push-notification-sender-treated", {
  handler: async (event) => {
    await service.handleWasteBagTreated({
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      groupId: event.groupId,
      userId: event.userId,
      treatmentMethod: event.treatmentMethod,
    });
  },
});

new Subscription(wasteBagFinalized, "push-notification-sender-finalized", {
  handler: async (event) => {
    await service.handleWasteBagFinalized({
      outcome: event.outcome,
      groupId: event.groupId,
      userId: event.userId,
    });
  },
});
