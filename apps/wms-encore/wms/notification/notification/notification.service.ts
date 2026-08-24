import log from "encore.dev/log";
import { getNovuClient } from "../../../shared/notifications/novu-client";
import { WMS_NOTIFICATION_WORKFLOW_MAP } from "../../../shared/notifications/notification-workflow-map";

// ---------------------------------------------------------------------------
// Single push-notification entry point for every other service in this app
// (waste, partnership, manual-scale-request, jobs) — replaces the previous
// pair of shared/notifications/notification-write.repository.ts functions
// (insertNotification/sendMultiNotification), which wrote a row into
// `notifications` before triggering Novu. That DB write mirrored the
// original's dual-purpose payload (the same row fed both the read-side
// GET /notification list AND the push queue) — but the team has moved to
// Novu for delivery and no longer reads that table through this service, so
// the read/write HTTP API (getAllNotif, getTypeNotif, getTotalCount,
// markAsRead, markAllRead, and the five trigger-* endpoints) has been
// removed entirely (see notification.controller.ts). This function only does
// what a push notification actually needs: trigger the Novu workflow.
// Called via ~encore/clients from other services (a real Encore RPC, not a
// cross-service TypeScript import) — see notification.controller.ts's
// internal (no method/path/expose) triggerPushNotification endpoint.
//
// Mirrors packages/lib/rabbitmq/publisher.ts's Publisher.publishNotification:
// remaps `type` through WMS_NOTIFICATION_WORKFLOW_MAP (raw fallback if
// unmapped), builds the same transactionId dedup key from eventCode, and
// triggers the workflow. Failure is logged, not thrown — a push-delivery
// failure shouldn't fail whatever business operation triggered it.
export interface TriggerPushNotificationInput {
  userId?: number;
  title: string;
  message: string;
  type: string;
  eventCode?: string;
  data?: Record<string, unknown>;
}

// Moved here from waste/waste-bag/waste-bag.service.ts: the waste service has
// no business deciding notification copy — it only emits raw domain facts
// (groupId, treatmentMethod, outcome) on its milestone topics
// (messaging/topics.ts), and this module decides whether/what to notify.
const NOTIFICATION_EVENT_TYPE = {
  WASTE_BAG_TREATMENT_GROUP_INCINERATED: {
    type: "waste_bag_treatment_group.waste_bag_treatment_group_incinerated",
    title: "Incineration Completed",
    message: (data: { group_id?: number }) =>
      `Waste group ${data.group_id} has been incinerated successfully.`,
  },
  WASTE_BAG_TREATMENT_GROUP_STERILISED: {
    type: "waste_bag_treatment_group.waste_bag_treatment_group_sterilised",
    title: "Sterilisation Completed",
    message: (data: { group_id?: number }) =>
      `Waste group ${data.group_id} has been sterilised successfully.`,
  },
  WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILLED: {
    type: "waste_bag_treatment_group.waste_bag_treatment_group_internal_landfilled",
    title: "Internal Landfill In Process",
    message: (data: { group_id?: number }) =>
      `Waste group ${data.group_id} has been internal landfill successfully.`,
  },
  WASTE_BAG_TREATMENT_END_STATUS: {
    type: "waste_bag_treatment_group.waste_bag_treatment_group_end_status",
    title: "Lifecycle Waste Completed",
    message: (data: { group_id?: number; waste_status?: string }) =>
      `Waste group ${data.group_id} has been ${data.waste_status} successfully.`,
  },
  WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE: {
    type: "waste_bag.waste_bag_in_external_temporary_storage",
    title: "Waste Moved to External Temporary Storage",
    message: (data: { group_id?: number }) =>
      `Waste group ${data.group_id} has been moved into external temporary storage.`,
  },
} as const;

// Handles wasteBagTreated's group-level completion confirmation (self-
// transition, previousStatus === newStatus) — fired once per treatment
// method (LANDFILL/INCINERATION/STERILISATION) from
// advanceScheduledWasteBagEvent's notification-only path. No-ops for the
// "real" wasteBagTreated fired synchronously from runTreatmentAction's
// terminal branch (previousStatus !== newStatus), matching the original's
// deferred-notification-only design.
export async function handleWasteBagTreated(event: {
  previousStatus: string;
  newStatus: string;
  groupId?: number;
  userId?: number;
  treatmentMethod?: "LANDFILL" | "INCINERATION" | "STERILISATION";
}): Promise<void> {
  if (event.previousStatus !== event.newStatus) {
    return;
  }
  const template =
    event.treatmentMethod === "INCINERATION"
      ? NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED
      : event.treatmentMethod === "STERILISATION"
        ? NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISED
        : event.treatmentMethod === "LANDFILL"
          ? NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILLED
          : undefined;
  if (!template) {
    return;
  }
  await triggerPushNotification({
    userId: event.userId,
    title: template.title,
    message: template.message({ group_id: event.groupId }),
    type: template.type,
  });
}

// Handles wasteBagFinalized — every finalized outcome gets the generic
// "lifecycle completed" notice, except IN_THIRD_PARTY_STORAGE, which gets its
// own dedicated copy (mirrors the original's WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE
// vs. WASTE_BAG_TREATMENT_END_STATUS split).
export async function handleWasteBagFinalized(event: {
  outcome: string;
  groupId?: number;
  userId?: number;
}): Promise<void> {
  const template =
    event.outcome === "IN_THIRD_PARTY_STORAGE"
      ? NOTIFICATION_EVENT_TYPE.WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE
      : NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS;
  await triggerPushNotification({
    userId: event.userId,
    title: template.title,
    message: template.message({ group_id: event.groupId, waste_status: event.outcome }),
    type: template.type,
  });
}

export async function triggerPushNotification(input: TriggerPushNotificationInput): Promise<void> {
  // No real user-lookup capability exists anywhere in wms-encore yet (a
  // known, tracked gap — see waste-bag.service.ts's WasteBagEventMetadata
  // comment), so several callers don't have a real userId to hand over.
  // Guard here rather than at every call site.
  if (!input.userId) {
    return;
  }

  const novu = getNovuClient();
  if (!novu) {
    return;
  }

  const subscriberId = String(input.userId);
  const workflowId = WMS_NOTIFICATION_WORKFLOW_MAP[input.type] ?? input.type;
  const transactionId = input.eventCode
    ? `${workflowId}-${input.eventCode}-${subscriberId}`
    : undefined;

  try {
    await novu.trigger({
      workflowId,
      to: { subscriberId },
      payload: {
        title: input.title,
        message: input.message,
        eventCode: input.eventCode ?? null,
        ...(input.data ?? {}),
      },
      ...(transactionId ? { transactionId } : {}),
    });
  } catch (error) {
    log.error("Failed to trigger Novu notification", {
      workflowId,
      subscriberId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
