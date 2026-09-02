import log from "encore.dev/log";
import {
  ScheduledEventTypes,
  wasteBagTreated,
  wasteBagTransportRequested,
  wasteBagFinalized,
} from "../../../messaging/topics";
import type {
  ScheduledEventMetadata,
  ScheduledEventType,
  WasteBagTreatedEvent,
  WasteBagTransportRequestedEvent,
  WasteBagFinalizedEvent,
} from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import * as wasteClassificationRepo from "../../waste-classification/waste-classification.repository";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import type { WasteStatus } from "../waste-bag.types";
import { publishMilestone } from "./_shared";

const NOTIFICATION_ONLY_TYPES: ReadonlySet<ScheduledEventType> = new Set([
  ScheduledEventTypes.WasteBagColdStoredStarted,
  ScheduledEventTypes.WasteBagInternalLandfillStarted,
  ScheduledEventTypes.WasteBagIncinerationStarted,
  ScheduledEventTypes.WasteBagSterilisedStarted,
]);

// No precondition in the original AND this port's producer (followUpTransportRequest)
// already advances the bag past READY_FOR_TRANSPORT by the time this fires —
// mutating here would silently regress it. True no-op: original has no
// notification call at this site either.
const NO_OP_TYPES: ReadonlySet<ScheduledEventType> = new Set([ScheduledEventTypes.WasteBagFollowUpToTransporter]);

interface WasteBagEventMetadata {
  wasteBagId: number;
  createdBy?: string;
  treatmentStartTime?: string;
  treatmentEndTime?: string;
  startTime?: string;
  endTime?: string;
  isGroup?: boolean;
  userId?: number;
}

const FINALIZED_OUTCOMES = new Set<WasteStatus>(["RECYCLED", "LANDFILLED", "DISPOSED", "COLLECTED", "IN_THIRD_PARTY_STORAGE"]);

// Two real two-phase transitions handled through the shared waste-bag
// machine below (CONFIRM_PICKUP / CONFIRM_RECEIPT): the producer's
// synchronously-written status matches what this dispatcher's precondition
// expects, and this step performs the disposal/treatment-method-driven
// branching the producer doesn't do itself. Everything else here (the
// notification-only treatment confirmations, the internal-handover
// self-confirms) isn't modeled as a distinct machine event — see each
// branch's own comment for why.
export async function advanceScheduledWasteBagEvent(
  eventType: ScheduledEventType,
  metadata: ScheduledEventMetadata
): Promise<void> {
  const meta = metadata as unknown as WasteBagEventMetadata;
  const wasteBagId = Number(meta.wasteBagId);
  const createdBy = meta.createdBy ?? "system";

  const wasteBag = await repo.findById(wasteBagId);
  if (!wasteBag) {
    throw new Error(`Waste bag with ID ${meta.wasteBagId} not found`);
  }

  if (NOTIFICATION_ONLY_TYPES.has(eventType)) {
    const expectedFinal: Partial<Record<ScheduledEventType, WasteStatus>> = {
      [ScheduledEventTypes.WasteBagColdStoredStarted]: "IN_COLD_STORAGE",
      [ScheduledEventTypes.WasteBagInternalLandfillStarted]: "INTERNAL_LANDFILLED",
      [ScheduledEventTypes.WasteBagIncinerationStarted]: "INCINERATED",
      [ScheduledEventTypes.WasteBagSterilisedStarted]: "STERILISED",
    };
    const expected = expectedFinal[eventType];
    if (expected && wasteBag.wasteStatus !== expected) {
      log.warn("scheduled waste-bag event fired against unexpected status (notification-only path)", {
        eventType,
        wasteBagId,
        expected,
        actual: wasteBag.wasteStatus,
      });
    }

    const groupId = wasteBag.wasteTreatmentGroupId;
    // Self-transition (previousStatus === newStatus): nothing actually
    // changed at this step — this is the group-level completion confirmation
    // for a treatment that was already carried out synchronously by
    // runTreatmentAction. Only the 3 treatment types re-announce here (as
    // wasteBagTreated, carrying groupId for notification/ to decide whether a
    // group notice is due); ColdStoredStarted has genuinely nothing to do
    // beyond the sanity log above, same as the original.
    const treatmentMethod: "LANDFILL" | "INCINERATION" | "STERILISATION" | undefined =
      eventType === ScheduledEventTypes.WasteBagIncinerationStarted
        ? "INCINERATION"
        : eventType === ScheduledEventTypes.WasteBagSterilisedStarted
          ? "STERILISATION"
          : eventType === ScheduledEventTypes.WasteBagInternalLandfillStarted
            ? "LANDFILL"
            : undefined;
    if (treatmentMethod) {
      await publishMilestone<WasteBagTreatedEvent>(async (e) => void (await wasteBagTreated.publish(e)), {
        wasteBagId,
        previousStatus: wasteBag.wasteStatus,
        newStatus: wasteBag.wasteStatus,
        createdBy,
        groupId,
        userId: meta.userId,
        treatmentMethod,
      });
    }
    return;
  }

  if (NO_OP_TYPES.has(eventType)) {
    return;
  }

  // ---- Real two-phase types below: precondition-gated, now via the shared
  // waste-bag machine instead of hand-rolled `!==` throws -----------------
  const { disposalMethod, treatmentMethod } = await wasteClassificationRepo
    .findById(wasteBag.wasteClassificationId)
    .then((c) => ({ disposalMethod: c?.disposalMethod, treatmentMethod: c?.treatmentMethod }));

  const disposalMethodsArray = disposalMethod ? disposalMethod.split(",").map((m) => m.trim()) : [];
  const needRecycles = disposalMethodsArray.includes("TRANSPORTER_RECYCLER");
  const needGovTransport = disposalMethodsArray.includes("TRANSPORTER_GOVERNMENT");
  const needGovTransportWasteBank = disposalMethodsArray.includes("TRANSPORTER_GOVERNMENT_WASTE_BANK");
  const needSpecialTransport = disposalMethodsArray.includes("SPECIALIZED_TREATMENT_PROVIDER");

  const treatmentMethodsArray = treatmentMethod ? treatmentMethod.split(",").map((m) => m.trim()) : [];
  const hasDisinfection = treatmentMethodsArray.includes("DISINFECTION");
  const hasPyrolysis = treatmentMethodsArray.includes("PYROLYSIS");

  const patch: repo.ScheduledEventPatch = { wasteStatusUpdatedAt: new Date() };
  const groupId = wasteBag.wasteTreatmentGroupId;

  if (eventType === ScheduledEventTypes.WasteBagHandoverToTransporter) {
    // Self-confirmation, not a distinct machine event: the producer
    // (handoverTransportRequest) already wrote TRANSPORTATION_REQUEST_CREATED
    // synchronously — this step only refines transportationStatus.
    patch.wasteStatus = "TRANSPORTATION_REQUEST_CREATED";
    patch.transportationStatus = "HANDED_OVER";
    patch.transportationStatusUpdatedAt = new Date();
  } else if (eventType === ScheduledEventTypes.WasteBagPickupToTransporterExternal) {
    const check = checkWasteBagTransition(wasteBag.wasteStatus as WasteStatus, {
      type: WASTE_EVENT.CONFIRM_PICKUP,
      needRecycles,
      hasWasteGroupIds: Boolean(wasteBag.wasteGroupIds),
      needSpecialTransport,
      needGovTransport,
    });
    if (!check.allowed) {
      throw "Invalid waste status for pickup to transporter external: " + wasteBag.wasteStatus;
    }
    patch.wasteStatus = check.nextStatus;
    patch.transportationStatus = "IN_TRANSIT";
    patch.ownedBy = check.nextStatus === "IN_TRANSIT" ? "TRANSPORTER" : "THIRD_PARTY";
    patch.transportationStatusUpdatedAt = new Date();
    if (check.nextStatus !== "IN_TRANSIT") {
      patch.treatmentEndTime = new Date();
      patch.isDisposed = true;
      patch.isTreated = true;
    }
  } else if (eventType === ScheduledEventTypes.WasteBagHandoverToTransporterExternal) {
    // Self-confirmation, not a distinct machine event: same shape as the
    // internal handover above, just for the external path's producer
    // (handoverTransportExternalRequest).
    patch.wasteStatus = "TRANSPORTATION_REQUEST_CREATED";
    patch.transportationStatus = "HANDED_OVER";
    patch.transportationStatusUpdatedAt = new Date();
  } else if (eventType === ScheduledEventTypes.WasteBagHandoverToTreatmentExternal) {
    if (wasteBag.wasteStatus !== "HANDOVER_TO_TREATMENT") {
      throw "Invalid waste status for handover treatment external: " + wasteBag.wasteStatus;
    }
    // Self-confirmation, not a distinct machine event — no state actually
    // changes here (stays HANDOVER_TO_TREATMENT), only transportationStatus.
    patch.transportationStatus = "HANDED_OVER";
    patch.wasteStatus = "HANDOVER_TO_TREATMENT";
    patch.transportationStatusUpdatedAt = new Date();
  } else if (eventType === ScheduledEventTypes.WasteBagReceivingToTreatmentExternal) {
    const check = checkWasteBagTransition(wasteBag.wasteStatus as WasteStatus, {
      type: WASTE_EVENT.CONFIRM_RECEIPT,
      needGovTransportWasteBank,
      isTreated: wasteBag.isTreated,
      hasPyrolysis,
      hasDisinfection,
    });
    if (!check.allowed) {
      throw "Invalid waste status for receive treatment external: " + wasteBag.wasteStatus;
    }
    patch.wasteStatus = check.nextStatus;
    patch.ownedBy = "THIRD_PARTY";
    // Mirrors the original exactly: only DISPOSED/LANDFILLED/RECYCLED set
    // treatmentEndTime/isDisposed/isTreated. READY_FOR_TREATMENT (no flag
    // matched) and IN_THIRD_PARTY_STORAGE (isUntreated) leave them untouched.
    if (check.nextStatus === "DISPOSED" || check.nextStatus === "LANDFILLED" || check.nextStatus === "RECYCLED") {
      patch.treatmentEndTime = new Date();
      patch.isDisposed = true;
      patch.isTreated = true;
    }
  }
  // WasteBagFollowUpToTransporterExternal: precondition already ran above;
  // original has no dedicated mutation branch for it either (falls through
  // with only wasteStatusUpdatedAt touched, same as the dead-code types
  // Sterilised/Incinerates/Landfilled-External-Started and AlreadyReceived,
  // which have no producer call site in this port at all yet).

  await repo.applyScheduledEventPatch(wasteBagId, patch);

  // FIX (was a real gap, not present in the original): this branch's further
  // mutation (e.g. IN_TRANSIT -> RECYCLED/COLLECTED/DISPOSED) used to be
  // written directly with no announcement at all, so it never reached
  // audit-trail. Checked against the original: WasteStatusUpdatePublisher's
  // logInfoAsync calls inside these exact branches publish onto the SAME
  // queue/listener the synchronous actions use, which always fans out to the
  // audit-trail handler — so the original DOES audit this second transition.
  // Restoring that here (announces to audit-trail, and to notification/ when
  // the resulting status warrants one — that decision now lives entirely in
  // notification/, not here) — fired only when the status actually changed;
  // scheduling isn't called since these terminal states never need a
  // further follow-up.
  if (patch.wasteStatus && patch.wasteStatus !== wasteBag.wasteStatus) {
    if (FINALIZED_OUTCOMES.has(patch.wasteStatus)) {
      await publishMilestone<WasteBagFinalizedEvent>(async (e) => void (await wasteBagFinalized.publish(e)), {
        wasteBagId,
        previousStatus: wasteBag.wasteStatus,
        newStatus: patch.wasteStatus,
        createdBy,
        groupId,
        userId: meta.userId,
        outcome: patch.wasteStatus,
      });
    } else {
      // Only the internal WasteBagHandoverToTransporter branch changes
      // wasteStatus without landing on a finalized outcome (READY_FOR_TRANSPORT
      // -> TRANSPORTATION_REQUEST_CREATED) — the External variant and the
      // other event types either precondition on an already-matching status
      // (no real change) or have no mutation branch at all, per the comments
      // above each `if`.
      await publishMilestone<WasteBagTransportRequestedEvent>(
        async (e) => void (await wasteBagTransportRequested.publish(e)),
        {
          wasteBagId,
          previousStatus: wasteBag.wasteStatus,
          newStatus: patch.wasteStatus,
          createdBy,
          groupId,
          userId: meta.userId,
          isExternal: false,
        }
      );
    }
  }
}
