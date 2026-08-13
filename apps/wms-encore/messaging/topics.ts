import { Topic } from "encore.dev/pubsub";

// CORRECTION (previously wrong): this used to be 3 generic types
// (WasteStatusFollowUp/ManualScaleRequestFollowUp/PartnershipFollowUp) and
// schedule-event.service.ts created a follow-up for EVERY status transition,
// always exactly 1 day later. Checked against the originals
// (ScheduleEventForWasteStatusUpdateUseCase.ts, ScheduleEventForPartnershipUseCase.ts,
// ScheduleEventForManualScaleUseCase.ts, ProcessScheduledEventUseCase.ts): a
// follow-up is only ever created for a specific, named subset of transitions
// (the "_STARTED" ones below, plus contract-expiry and request-creation), and
// `scheduledAt` is always the real completion time carried in that specific
// event's metadata (`treatmentEndTime`/`endTime`), never a fixed delay. This
// granular set restores the original's exact discriminators so the dispatcher
// can apply the right precondition check + status mutation per case instead
// of a single generic "log and delete".
export const ScheduledEventTypes = {
  WasteBagInternalLandfillStarted: "WASTE_BAG_INTERNAL_LANDFILL_STARTED",
  WasteBagColdStoredStarted: "WASTE_BAG_COLD_STORED_STARTED",
  WasteBagIncinerationStarted: "WASTE_BAG_INCINERATION_STARTED",
  WasteBagSterilisedStarted: "WASTE_BAG_STERILISED_STARTED",
  WasteBagFollowUpToTransporter: "WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER",
  WasteBagHandoverToTransporter: "WASTE_BAG_HANDOVER_TO_TRANSPORTER",
  WasteBagFollowUpToTransporterExternal: "WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL",
  WasteBagHandoverToTransporterExternal: "WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL",
  WasteBagPickupToTransporterExternal: "WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL",
  WasteBagHandoverToTreatmentExternal: "WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL",
  WasteBagReceivingToTreatmentExternal: "WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL",
  WasteBagSterilisedExternalStarted: "WASTE_BAG_STERILISED_EXTERNAL_STARTED",
  WasteBagIncineratesExternalStarted: "WASTE_BAG_INCENERATES_EXTERNAL_STARTED",
  WasteBagLandfilledExternalStarted: "WASTE_BAG_LANDFILLED_EXTERNAL_STARTED",
  WasteBagAlreadyReceived: "WASTE_BAG_ALREADY_RECEIVED",
  PartnershipContractExpired: "PARTNERSHIP_CONTRACT_EXPIRED",
  StartManualScaleRequest: "START_MANUAL_SCALE_REQUEST",
} as const;
export type ScheduledEventType = (typeof ScheduledEventTypes)[keyof typeof ScheduledEventTypes];

// Original ScheduledEvent entity's `metadata` field is a JSON string parsed
// per-eventType inside ProcessScheduledEventUseCase — kept loose here (not a
// discriminated union) for the same reason: the original itself doesn't type
// it strictly, and each dispatcher case picks out only the fields it needs.
export type ScheduledEventMetadata = Record<string, unknown>;

// A "scheduling trigger" — present on a status-update event ONLY when that
// specific transition is one of the original's "_STARTED"/creation events
// that needs a delayed follow-up. Absent on every other transition, which is
// what stops schedule-event.service.ts from creating a follow-up for every
// single status change (the overbroad bug above). `scheduledAt` mirrors the
// original's `metadata.treatmentEndTime ?? metadata.endTime` — a real
// completion time computed by the caller, not a fixed offset.
export interface ScheduledEventTrigger {
  scheduledEventType: ScheduledEventType;
  scheduledAt: string;
  metadata: ScheduledEventMetadata;
}

// A push-notification payload attachable to a domain event, for services
// (like notification/) that want to react to that SPECIFIC business event
// rather than a generic proxy topic. CORRECTION (previously wrong): there
// used to be a standalone `notificationRequested` topic every producer
// published to directly. That added a topic whose only purpose was carrying
// notification content — redundant wherever a real domain event already
// exists for the same occurrence (wasteStatusUpdate below). Kept only where
// no such event exists (partnership, manual-scale-request, cron jobs), where
// the producer instead calls notification.triggerPushNotification directly
// via ~encore/clients — see partnership.service.ts's `notify`, jobs/*.service.ts.
export interface NotificationPayload {
  userId?: number;
  title: string;
  message: string;
  type: string;
  eventCode?: string;
  data?: Record<string, unknown>;
}

// CORRECTION (previously wrong): this used to be a single generic
// "waste-status-updated" topic carrying just previousStatus/newStatus
// strings. One generic event can't represent the shape of the real business
// flow — a future consumer that cares about "a bag was picked up" or "a bag
// finished treatment" had to re-derive that meaning by pattern-matching
// status strings instead of subscribing to the occurrence directly. Split
// into 9 milestone-specific topics below, one per real business occurrence,
// mirroring the 9 waste-bag.service.ts actions that used to all funnel
// through the single `publishStatusChange` helper. Every payload still
// carries previousStatus/newStatus/wasteBagId/updatedAt/createdBy so
// waste-bag-audit-trail's log shape is unchanged — it now subscribes to all
// 9 topics individually instead of one. notification/ also subscribes
// directly to the real milestone topics that can warrant a notification
// (never a synthetic carrier event), and builds title/message/type itself
// from each event's raw domain data — waste-bag.service.ts no longer
// constructs a NotificationPayload value at all; `NotificationPayload` above
// stays only for the other producers noted in its own comment.
interface WasteBagMilestoneBase {
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
  createdBy: string;
  /** Present when this event announces a treatment-group-level occurrence. */
  groupId?: number;
  /** Present when the caller has a real user to notify (see notification/'s known gap). */
  userId?: number;
}

export interface WasteBagCreatedEvent extends WasteBagMilestoneBase {
  initialStatus: string;
}
export const wasteBagCreated = new Topic<WasteBagCreatedEvent>("waste-bag-created", {
  deliveryGuarantee: "at-least-once",
});

export interface WasteBagStoredEvent extends WasteBagMilestoneBase {
  storageType: "TEMPORARY" | "COLD";
}
export const wasteBagStored = new Topic<WasteBagStoredEvent>("waste-bag-stored", {
  deliveryGuarantee: "at-least-once",
});

export interface WasteBagTreatmentStartedEvent extends WasteBagMilestoneBase {
  treatmentMethod: "LANDFILL" | "INCINERATION" | "STERILISATION";
  scheduledEndTime?: string;
}
export const wasteBagTreatmentStarted = new Topic<WasteBagTreatmentStartedEvent>(
  "waste-bag-treatment-started",
  { deliveryGuarantee: "at-least-once" }
);

export interface WasteBagTreatedEvent extends WasteBagMilestoneBase {
  treatmentMethod?: "LANDFILL" | "INCINERATION" | "STERILISATION";
  disposalMethod?: string;
}
export const wasteBagTreated = new Topic<WasteBagTreatedEvent>("waste-bag-treated", {
  deliveryGuarantee: "at-least-once",
});

export interface WasteBagTransportRequestedEvent extends WasteBagMilestoneBase {
  isExternal: boolean;
}
export const wasteBagTransportRequested = new Topic<WasteBagTransportRequestedEvent>(
  "waste-bag-transport-requested",
  { deliveryGuarantee: "at-least-once" }
);

export interface WasteBagPickedUpEvent extends WasteBagMilestoneBase {
  transporterId?: number;
}
export const wasteBagPickedUp = new Topic<WasteBagPickedUpEvent>("waste-bag-picked-up", {
  deliveryGuarantee: "at-least-once",
});

export type WasteBagHandedOverToTreatmentEvent = WasteBagMilestoneBase;
export const wasteBagHandedOverToTreatment = new Topic<WasteBagHandedOverToTreatmentEvent>(
  "waste-bag-handed-over-to-treatment",
  { deliveryGuarantee: "at-least-once" }
);

export type WasteBagReceivedForTreatmentEvent = WasteBagMilestoneBase;
export const wasteBagReceivedForTreatment = new Topic<WasteBagReceivedForTreatmentEvent>(
  "waste-bag-received-for-treatment",
  { deliveryGuarantee: "at-least-once" }
);

export interface WasteBagFinalizedEvent extends WasteBagMilestoneBase {
  outcome: string;
}
export const wasteBagFinalized = new Topic<WasteBagFinalizedEvent>("waste-bag-finalized", {
  deliveryGuarantee: "at-least-once",
});

// CORRECTION (previously wrong): manual_scale_request_status_queue and
// partnership_status_update_queue used to be real Topics here, published by
// their respective services and subscribed to only by scheduling/schedule-event
// (to create a follow-up ScheduledEvent when triggered). Since scheduling was
// the ONLY subscriber on either topic — no audit-trail-style second
// consumer, unlike wasteStatusUpdate below — the pub/sub hop bought no real
// fan-out, just indirection. Both services now call
// scheduling.scheduleFollowUpForPartnership/scheduleFollowUpForManualRequest
// directly via ~encore/clients instead (see partnership.service.ts's
// updateStatus / manual-scale-request.service.ts's updateStatus). No Topic
// exists for either anymore.

// Mirrors scheduled_event_process_queue. Published by jobs/ (the natural event
// source — it's the one that decides when to check for due events, see
// jobs.service.ts). Subscribed by scheduled-event-dispatcher, which — per
// ProcessScheduledEventUseCase — loads the real subject, validates/advances its
// status exactly once using `metadata`, then deletes the row. It does NOT
// re-publish onto the three topics above (that would recreate the row it just
// deleted, an infinite loop — see scheduled-event-dispatcher.service.ts).
export interface ScheduledEventProcessEvent {
  scheduledEventId: number;
  eventType: ScheduledEventType;
  subjectId: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  metadata: ScheduledEventMetadata;
  // The scheduled_events row's own scheduled_at — mirrors the original's
  // `eventData.scheduledAt` read directly off the ScheduledEvent row.
  scheduledAt: string;
}

export const scheduledEventProcess = new Topic<ScheduledEventProcessEvent>(
  "scheduled-event-processed",
  { deliveryGuarantee: "at-least-once" }
);
