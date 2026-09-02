import { createActor, setup } from "xstate";
import type { WasteStatus } from "./waste-bag.types";

/**
 * Models the REAL transition paths found in waste-bag.service.ts /
 * waste-bag.repository.ts — not the full WASTE_STATUS_VALUES union.
 *
 * Three statuses in that union (INTERNAL_LANDFILL_IN_PROCESS,
 * INCINERATION_IN_PROCESS, STERILIZATION_IN_PROCESS) are NOT modeled here:
 * internalLandfillWasteBags/steriliseWasteBags/incinerateWasteBags all call
 * runTreatmentAction() with the *terminal* status directly (e.g.
 * "INTERNAL_LANDFILLED", not "INTERNAL_LANDFILL_IN_PROCESS") — see that
 * module's "port's status column already jumps straight to the terminal
 * value synchronously" comment. Those three values are currently
 * unreachable dead code, not a gap in this machine.
 *
 * `readyForTransport` has no verified setter inside waste-bag.service.ts —
 * `findReadyForTransportByGroupIds` only ever *reads* that status. It's
 * almost certainly set when a bag is assigned to a waste-transportation-group
 * (a sibling module, out of scope here). This machine treats reaching
 * readyForTransport as an external fact (MARK_READY_FOR_TRANSPORT), not
 * something it derives — do not treat that transition as verified the way
 * the rest of this file is.
 *
 * Two real two-phase pairs exist (a synchronous HTTP-triggered status flip,
 * confirmed against `applyPickUpTransportExternal`'s own precondition guard,
 * followed by a later scheduled event — run via advanceScheduledWasteBagEvent
 * on a cron — that can flip status again based on the waste's classification):
 *   transportationRequestCreated -[PICKUP_TO_TRANSPORTER_EXTERNAL]-> inTransit
 *     -[CONFIRM_PICKUP, guarded]-> recycled | collected | disposed | (stays inTransit)
 *   transportationRequestCreated -[HANDOVER_TO_TREATMENT_EXTERNAL]-> handoverToTreatment
 *     -[RECEIVE_TO_TREATMENT_EXTERNAL]-> readyForTreatment
 *       -[CONFIRM_RECEIPT, guarded]-> disposed | inThirdPartyStorage | landfilled | recycled | (stays readyForTreatment)
 *
 * The guarded second-phase events take their branching flags
 * (needGovTransportWasteBank, hasPyrolysis, hasDisinfection, ...) as part of
 * the event payload — a guard must be a pure, synchronous function of
 * (context, event), and these flags come from a wasteClassification lookup
 * that has to be resolved by the caller BEFORE calling actor.send(), exactly
 * like the WMS-client branching discussed for the order machine.
 */

export const WASTE_EVENT = {
  COLD_STORE: "COLD_STORE", // inTemporaryStorage -> inColdStorage
  TREAT_LANDFILL: "TREAT_LANDFILL", // inTemporaryStorage|inColdStorage -> internalLandfilled
  TREAT_STERILISE: "TREAT_STERILISE", // inTemporaryStorage|inColdStorage -> sterilised
  TREAT_INCINERATE: "TREAT_INCINERATE", // inTemporaryStorage|inColdStorage -> incinerated
  MARK_READY_FOR_TRANSPORT: "MARK_READY_FOR_TRANSPORT", // (unverified source) -> readyForTransport
  HANDOVER_TO_TRANSPORTER: "HANDOVER_TO_TRANSPORTER", // readyForTransport -> transportationRequestCreated
  PICKUP_TO_TRANSPORTER_EXTERNAL: "PICKUP_TO_TRANSPORTER_EXTERNAL", // transportationRequestCreated -> inTransit
  CONFIRM_PICKUP: "CONFIRM_PICKUP", // inTransit -> recycled|collected|disposed (guarded) or stays
  HANDOVER_TO_TREATMENT_EXTERNAL: "HANDOVER_TO_TREATMENT_EXTERNAL", // transportationRequestCreated -> handoverToTreatment
  RECEIVE_TO_TREATMENT_EXTERNAL: "RECEIVE_TO_TREATMENT_EXTERNAL", // handoverToTreatment -> readyForTreatment
  CONFIRM_RECEIPT: "CONFIRM_RECEIPT", // readyForTreatment -> disposed|inThirdPartyStorage|landfilled|recycled (guarded) or stays
} as const;

export type WasteEvent = (typeof WASTE_EVENT)[keyof typeof WASTE_EVENT];

// Discriminated event union — mirrors the flags computed in
// advanceScheduledWasteBagEvent from wasteClassification.disposalMethod /
// .treatmentMethod. Every non-guarded event carries no payload.
type WasteBagMachineEvent =
  | { type: Exclude<WasteEvent, "CONFIRM_PICKUP" | "CONFIRM_RECEIPT"> }
  | {
      type: "CONFIRM_PICKUP";
      needRecycles: boolean;
      hasWasteGroupIds: boolean;
      needSpecialTransport: boolean;
      needGovTransport: boolean;
    }
  | {
      type: "CONFIRM_RECEIPT";
      needGovTransportWasteBank: boolean;
      isTreated: boolean;
      hasPyrolysis: boolean;
      hasDisinfection: boolean;
    };

const STATUS_TO_STATE: Record<string, string> = {
  IN_TEMPORARY_STORAGE: "inTemporaryStorage",
  IN_COLD_STORAGE: "inColdStorage",
  INTERNAL_LANDFILLED: "internalLandfilled",
  STERILISED: "sterilised",
  INCINERATED: "incinerated",
  READY_FOR_TRANSPORT: "readyForTransport",
  TRANSPORTATION_REQUEST_CREATED: "transportationRequestCreated",
  IN_TRANSIT: "inTransit",
  HANDOVER_TO_TREATMENT: "handoverToTreatment",
  READY_FOR_TREATMENT: "readyForTreatment",
  RECYCLED: "recycled",
  COLLECTED: "collected",
  DISPOSED: "disposed",
  IN_THIRD_PARTY_STORAGE: "inThirdPartyStorage",
  LANDFILLED: "landfilled",
};

const STATE_TO_STATUS: Record<string, WasteStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_STATE).map(([status, state]) => [state, status as WasteStatus])
);

const machineSetup = setup({
  types: {} as {
    events: WasteBagMachineEvent;
  },
  guards: {
    // Mirrors the original's `if (wasteBag.wasteGroupIds && needRecycles)` —
    // both conditions are required, not needRecycles alone.
    needRecycles: (_, params: { needRecycles: boolean; hasWasteGroupIds: boolean }) =>
      params.needRecycles && params.hasWasteGroupIds,
    needSpecialTransport: (_, params: { needSpecialTransport: boolean }) => params.needSpecialTransport,
    needGovTransport: (_, params: { needGovTransport: boolean }) => params.needGovTransport,
    needGovTransportWasteBank: (_, params: { needGovTransportWasteBank: boolean }) =>
      params.needGovTransportWasteBank,
    isUntreated: (_, params: { isTreated: boolean }) => params.isTreated === false,
    isTreatedWithPyrolysis: (_, params: { isTreated: boolean; hasPyrolysis: boolean }) =>
      params.isTreated === true && params.hasPyrolysis,
    isTreatedWithDisinfection: (_, params: { isTreated: boolean; hasDisinfection: boolean }) =>
      params.isTreated === true && params.hasDisinfection,
  },
});

export const wasteBagMachine = machineSetup.createMachine({
  id: "wasteBag",
  initial: "inTemporaryStorage",
  states: {
    inTemporaryStorage: {
      on: {
        COLD_STORE: "inColdStorage",
        TREAT_LANDFILL: "internalLandfilled",
        TREAT_STERILISE: "sterilised",
        TREAT_INCINERATE: "incinerated",
        MARK_READY_FOR_TRANSPORT: "readyForTransport",
      },
    },
    inColdStorage: {
      on: {
        TREAT_LANDFILL: "internalLandfilled",
        TREAT_STERILISE: "sterilised",
        TREAT_INCINERATE: "incinerated",
        MARK_READY_FOR_TRANSPORT: "readyForTransport",
      },
    },
    readyForTransport: {
      on: {
        HANDOVER_TO_TRANSPORTER: "transportationRequestCreated",
      },
    },
    transportationRequestCreated: {
      on: {
        PICKUP_TO_TRANSPORTER_EXTERNAL: "inTransit",
        HANDOVER_TO_TREATMENT_EXTERNAL: "handoverToTreatment",
      },
    },
    inTransit: {
      on: {
        // Order matters: the original writes these as three SEQUENTIAL
        // `if`s (not else-if), so when more than one flag is true the LAST
        // matching `if` wins. A first-match-wins guard array has to check
        // in the reverse order to reproduce that ("last written wins" ==
        // "checked first" here) — needGovTransport, then
        // needSpecialTransport, then needRecycles (+hasWasteGroupIds) last.
        CONFIRM_PICKUP: [
          {
            target: "disposed",
            guard: { type: "needGovTransport", params: ({ event }) => event },
          },
          {
            target: "collected",
            guard: { type: "needSpecialTransport", params: ({ event }) => event },
          },
          {
            target: "recycled",
            guard: { type: "needRecycles", params: ({ event }) => event },
          },
          // no flag matched: mirrors advanceScheduledWasteBagEvent's
          // unconditional `patch.wasteStatus = "IN_TRANSIT"` default — an
          // explicit self-transition, not silence, so it's visible on the
          // diagram rather than looking like a rejected event.
          { target: "inTransit" },
        ],
      },
    },
    handoverToTreatment: {
      on: {
        RECEIVE_TO_TREATMENT_EXTERNAL: "readyForTreatment",
      },
    },
    readyForTreatment: {
      on: {
        CONFIRM_RECEIPT: [
          {
            target: "disposed",
            guard: { type: "needGovTransportWasteBank", params: ({ event }) => event },
          },
          {
            target: "inThirdPartyStorage",
            guard: { type: "isUntreated", params: ({ event }) => event },
          },
          {
            target: "landfilled",
            guard: { type: "isTreatedWithPyrolysis", params: ({ event }) => event },
          },
          {
            target: "recycled",
            guard: { type: "isTreatedWithDisinfection", params: ({ event }) => event },
          },
          // mirrors the original's fall-through when isTreated is true but
          // neither hasPyrolysis nor hasDisinfection matched: no branch in
          // the source reassigns wasteStatus in that case, so it stays
          // READY_FOR_TREATMENT.
          { target: "readyForTreatment" },
        ],
      },
    },
    recycled: {},
    collected: {},
    disposed: {},
    inThirdPartyStorage: {},
    landfilled: {},
    internalLandfilled: {},
    sterilised: {},
    incinerated: {},
  },
});

export interface WasteTransitionCheck {
  allowed: boolean;
  nextStatus?: WasteStatus;
}

// CONFIRM_PICKUP/CONFIRM_RECEIPT's un-guarded fallback branches legitimately
// land back on the same state (that's the real "no flag matched" outcome,
// not a rejection) — everything else landing on the same state means the
// event genuinely had no handler there.
function isSelfTransitionEvent(eventType: WasteEvent, state: string): boolean {
  return (
    (eventType === "CONFIRM_PICKUP" && state === "inTransit") ||
    (eventType === "CONFIRM_RECEIPT" && state === "readyForTreatment")
  );
}

/**
 * Same short-lived-actor pattern as the order machine: seed at the current
 * status, send exactly one event (with any guard flags it needs already
 * resolved onto it by the caller), read the result, discard the actor.
 */
export function checkWasteBagTransition(
  currentStatus: WasteStatus,
  event: WasteBagMachineEvent
): WasteTransitionCheck {
  const currentState = STATUS_TO_STATE[currentStatus];
  if (!currentState) {
    return { allowed: false };
  }

  const actor = createActor(wasteBagMachine, {
    snapshot: wasteBagMachine.resolveState({ value: currentState }),
  });

  actor.start();
  actor.send(event);
  const nextState = actor.getSnapshot().value as string;
  actor.stop();

  if (nextState === currentState && !isSelfTransitionEvent(event.type, currentState)) {
    return { allowed: false };
  }

  return { allowed: true, nextStatus: STATE_TO_STATUS[nextState] };
}
