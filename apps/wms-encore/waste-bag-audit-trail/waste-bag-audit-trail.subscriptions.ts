import { Subscription } from "encore.dev/pubsub";
import {
  wasteBagCreated,
  wasteBagStored,
  wasteBagTreatmentStarted,
  wasteBagTreated,
  wasteBagTransportRequested,
  wasteBagPickedUp,
  wasteBagHandedOverToTreatment,
  wasteBagReceivedForTreatment,
  wasteBagFinalized,
} from "../messaging/topics";
import * as service from "./waste-bag-audit-trail.service";

// Mirrors wasteStatusUpdateListener.ts -> auditTrailHandler.ts. Now its own
// Encore service (split from "waste" so the topology diagram shows every
// subscriber as a real cross-service hop, consistently with schedule-event).
// Still fully decoupled from the publisher — only knows about the topics.
// CORRECTION (previously wrong): this used to be a single subscription on
// one generic wasteStatusUpdate topic. That topic has been split into 9
// milestone-specific topics (see messaging/topics.ts's header comment) — this
// service subscribes to all 9 individually since it needs every transition,
// same net effect as before, just one Subscription per topic instead of one
// Subscription total.
const recordTransition = (event: { wasteBagId: number; previousStatus: string; newStatus: string }) =>
  service.recordTransition({
    wasteBagId: event.wasteBagId,
    previousStatus: event.previousStatus,
    newStatus: event.newStatus,
  });

new Subscription(wasteBagCreated, "audit-trail-writer-created", { handler: recordTransition });
new Subscription(wasteBagStored, "audit-trail-writer-stored", { handler: recordTransition });
new Subscription(wasteBagTreatmentStarted, "audit-trail-writer-treatment-started", { handler: recordTransition });
new Subscription(wasteBagTreated, "audit-trail-writer-treated", { handler: recordTransition });
new Subscription(wasteBagTransportRequested, "audit-trail-writer-transport-requested", { handler: recordTransition });
new Subscription(wasteBagPickedUp, "audit-trail-writer-picked-up", { handler: recordTransition });
new Subscription(wasteBagHandedOverToTreatment, "audit-trail-writer-handed-over-to-treatment", {
  handler: recordTransition,
});
new Subscription(wasteBagReceivedForTreatment, "audit-trail-writer-received-for-treatment", {
  handler: recordTransition,
});
new Subscription(wasteBagFinalized, "audit-trail-writer-finalized", { handler: recordTransition });
