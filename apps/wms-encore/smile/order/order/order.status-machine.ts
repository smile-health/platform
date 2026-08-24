// THE order lifecycle, as one xstate machine. States ARE the order
// statuses (mirrors ws_order_statuses' vocabulary in ../order.lifecycle.ts's
// ORDER_STATUS); the transient "-ing" states between them each `invoke` ONE
// actor — the run* bodies in usecases/*-order.ts — that does ONLY that
// transition's side effects (call smile/inventory, publish the topic
// event) and returns whatever extra ws_orders columns the eventual status
// write needs (e.g. allocate returns { is_allocated: 1 }).
//
// The status write itself is NOT part of the machine — transitionOrder()
// at the bottom of this file does it as a single plain function call,
// AFTER the actor settles successfully, using EVENT_TARGET_STATUS below to
// know which status this event moves the order to. That's the one place
// "what status does X move an order to" is enforced — usecases only ever
// see it as a return value (StatusExtra), never decide the status name
// themselves.
//
//          CONFIRM            ALLOCATE           SHIP           FULFILL
//   [pending] --> [confirmed] --------> [allocated] --> [shipped] --> [fulfilled]
//      |  \            |  \                /  \
//      |   \___________|___\______________/    \
//      |    \__________|_____CANCEL (all three, via history)
//   CANCEL             |
//      |                \
//      v                 v
//  [cancelled]      [cancelled]
//
// pending/confirmed/allocated live inside a compound "active" state with a
// shallow history pseudostate: cancel is reachable from any of the three
// (matches the original "cancel is legal any time before shipment" rule),
// and if the cancel actor itself fails partway (e.g. concurrent status
// write lost the race), the machine falls back to `active.hist` —
// whichever of pending/confirmed/allocated it actually came from — instead
// of guessing. confirm/allocate/ship/fulfill failures each have a single
// unambiguous state to fall back to (the one they started from), so they
// target it directly.
//
// order.repository is the actual source of truth for an order's current
// status (ws_orders.order_status_id) — this machine is NOT a persisted
// actor. Every call to transitionOrder() below rehydrates a fresh actor at
// the order's current status (via resolveState), drives exactly one event
// through it, and throws away the actor once it settles. What's shared and
// durable is the machine DEFINITION (the graph + its actors), not a running
// instance.
//
// NOTE: usecases/*-order.ts import transitionOrder from here, and this file
// imports their run* actor bodies — a deliberate import cycle. Safe because
// every use is inside a function body (setup()'s actors map holds function
// references, transitionOrder is only called later), never evaluated at
// module-init time.
import { APIError } from "encore.dev/api";
import { setup, fromPromise, createActor, waitFor, assign, type StateValue } from "xstate";
import * as repo from "./order.repository";
import type { AllocateOrderRequest, CancelOrderRequest } from "./order.schema";
import { ORDER_STATUS, requireOrder } from "./order.lifecycle";
import { runConfirm } from "./usecases/confirm-order";
import { runAllocate } from "./usecases/allocate-order";
import { runShip } from "./usecases/ship-order";
import { runFulfill } from "./usecases/fulfill-order";
import { runCancel } from "./usecases/cancel-order";

// The extra ws_orders columns a status write may need alongside
// order_status_id itself (e.g. allocate sets is_allocated, cancel sets
// order_cancel_reason_id) — same type repo.updateStatusGuarded already
// takes, so a run* function returning the wrong shape here is a compile
// error, not a runtime surprise.
export type StatusExtra = Parameters<typeof repo.updateStatusGuarded>[4];

interface OrderMachineContext {
  orderId: number;
  // Fetched once by transitionOrder() before the actor is even created, and
  // threaded through context/input from here on — every run* actor below
  // takes it as-is instead of independently re-fetching the same row via
  // requireOrder.
  order: repo.OrderRow;
  // Set from the run* actor's return value once it succeeds — the extra
  // columns transitionOrder() passes into its own status-write call below.
  extra?: StatusExtra;
  error?: unknown;
}

type OrderMachineEvent =
  | { type: "CONFIRM"; userId: number }
  | { type: "ALLOCATE"; request: AllocateOrderRequest; userId: number }
  | { type: "SHIP"; userId: number }
  | { type: "FULFILL"; userId: number }
  | { type: "CANCEL"; request: CancelOrderRequest; userId: number };

const orderStatusMachine = setup({
  types: {} as {
    context: OrderMachineContext;
    events: OrderMachineEvent;
    input: { orderId: number; order: repo.OrderRow };
  },
  actors: {
    confirm: fromPromise<StatusExtra, { order: repo.OrderRow; userId: number }>(({ input }) => runConfirm(input)),
    allocate: fromPromise<StatusExtra, { order: repo.OrderRow; request: AllocateOrderRequest; userId: number }>(({ input }) => runAllocate(input)),
    ship: fromPromise<StatusExtra, { order: repo.OrderRow; userId: number }>(({ input }) => runShip(input)),
    fulfill: fromPromise<StatusExtra, { order: repo.OrderRow; userId: number }>(({ input }) => runFulfill(input)),
    cancel: fromPromise<StatusExtra, { order: repo.OrderRow; request: CancelOrderRequest; userId: number }>(({ input }) => runCancel(input)),
  },
}).createMachine({
  id: "order",
  context: ({ input }) => ({ orderId: input.orderId, order: input.order }),
  initial: "active",
  states: {
    active: {
      initial: "pending",
      states: {
        pending: {
          on: {
            CONFIRM: "confirming",
            CANCEL: "#order.cancelling",
          },
        },
        confirming: {
          invoke: {
            src: "confirm",
            input: ({ context, event }) => {
              if (event.type !== "CONFIRM") throw new Error("unreachable: confirming invoked without CONFIRM event");
              return { order: context.order, userId: event.userId };
            },
            onDone: { target: "confirmed", actions: assign({ extra: ({ event }) => event.output }) },
            onError: { target: "pending", actions: assign({ error: ({ event }) => event.error }) },
          },
        },
        confirmed: {
          on: {
            ALLOCATE: "allocating",
            CANCEL: "#order.cancelling",
          },
        },
        allocating: {
          invoke: {
            src: "allocate",
            input: ({ context, event }) => {
              if (event.type !== "ALLOCATE") throw new Error("unreachable: allocating invoked without ALLOCATE event");
              return { order: context.order, request: event.request, userId: event.userId };
            },
            onDone: { target: "allocated", actions: assign({ extra: ({ event }) => event.output }) },
            onError: { target: "confirmed", actions: assign({ error: ({ event }) => event.error }) },
          },
        },
        allocated: {
          on: {
            SHIP: "#order.shipping",
            CANCEL: "#order.cancelling",
          },
        },
        hist: { type: "history", history: "shallow" },
      },
    },
    shipping: {
      invoke: {
        src: "ship",
        input: ({ context, event }) => {
          if (event.type !== "SHIP") throw new Error("unreachable: shipping invoked without SHIP event");
          return { order: context.order, userId: event.userId };
        },
        onDone: { target: "shipped", actions: assign({ extra: ({ event }) => event.output }) },
        onError: { target: "#order.active.allocated", actions: assign({ error: ({ event }) => event.error }) },
      },
    },
    shipped: {
      on: { FULFILL: "fulfilling" },
    },
    fulfilling: {
      invoke: {
        src: "fulfill",
        input: ({ context, event }) => {
          if (event.type !== "FULFILL") throw new Error("unreachable: fulfilling invoked without FULFILL event");
          return { order: context.order, userId: event.userId };
        },
        onDone: { target: "fulfilled", actions: assign({ extra: ({ event }) => event.output }) },
        onError: { target: "shipped", actions: assign({ error: ({ event }) => event.error }) },
      },
    },
    fulfilled: { type: "final" },
    cancelling: {
      invoke: {
        src: "cancel",
        input: ({ context, event }) => {
          if (event.type !== "CANCEL") throw new Error("unreachable: cancelling invoked without CANCEL event");
          return { order: context.order, request: event.request, userId: event.userId };
        },
        onDone: { target: "cancelled", actions: assign({ extra: ({ event }) => event.output }) },
        onError: {
          // Falls back to whichever of pending/confirmed/allocated cancel
          // was called from — not a fixed target, since cancel is
          // reachable from all three.
          target: "#order.active.hist",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    cancelled: { type: "final" },
  },
});

// --- driving the machine from an order's persisted status ---------------

const TRANSIENT_STATE_NAMES: ReadonlySet<string> = new Set(["confirming", "allocating", "shipping", "fulfilling", "cancelling"]);

function toMachineValue(status: string): StateValue | undefined {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return { active: "pending" };
    case ORDER_STATUS.CONFIRMED:
      return { active: "confirmed" };
    case ORDER_STATUS.ALLOCATED:
      return { active: "allocated" };
    case ORDER_STATUS.SHIPPED:
      return "shipped";
    case ORDER_STATUS.FULFILLED:
      return "fulfilled";
    case ORDER_STATUS.CANCELLED:
      return "cancelled";
    default:
      return undefined;
  }
}

function leafStateName(value: StateValue): string {
  return typeof value === "string" ? value : leafStateName(Object.values(value)[0]!);
}

// The single entry point every usecases/*.ts transition file calls. Loads
// the order, resolves an actor snapshot at its current status, rejects the
// event up front if the machine itself doesn't accept it from here (the
// replacement for the old assertTransition), drives the invoked actor for
// that transition's side effects to completion, then — if that succeeded —
// performs the ONE status write itself (not as an xstate action/actor;
// just a plain call) before returning the fresh row.
export async function transitionOrder(orderId: number, event: OrderMachineEvent): Promise<repo.OrderRow> {
  const order = await requireOrder(orderId);
  const fromStatus = await repo.findStatusNameById(order.order_status_id);
  if (!fromStatus) {
    throw APIError.invalidArgument(`Order ${orderId} has an unrecognized current status id ${order.order_status_id}`);
  }
  const value = toMachineValue(fromStatus);
  if (value === undefined) {
    throw APIError.invalidArgument(`Order ${orderId} has an unrecognized current status "${fromStatus}"`);
  }

  const snapshot = orderStatusMachine.resolveState({ value, context: { orderId, order } });
  const actor = createActor(orderStatusMachine, { snapshot, input: { orderId, order } });
  actor.start();

  if (!actor.getSnapshot().can(event)) {
    throw APIError.invalidArgument(`Order ${orderId} cannot handle ${event.type} while its status is "${fromStatus}"`);
  }

  actor.send(event);
  const settled = await waitFor(actor, (state) => !TRANSIENT_STATE_NAMES.has(leafStateName(state.value)));
  actor.stop();

  if (settled.context.error) {
    throw settled.context.error;
  }

  // The actor settled successfully, so its resting state name IS the
  // target status — read it straight from the machine instead of a
  // separate event->status lookup table.
  const toStatus = leafStateName(settled.value);
  const toStatusId = await repo.findStatusIdByName(toStatus);
  if (toStatusId === undefined) {
    throw APIError.internal(`Order status "${toStatus}" is not seeded in ws_order_statuses`);
  }
  const applied = await repo.updateStatusGuarded(orderId, order.order_status_id, toStatusId, event.userId, settled.context.extra ?? {});
  if (!applied) {
    throw APIError.aborted(
      `Order ${orderId} was concurrently transitioned by something else — its side effects already ran, but the order's status was not updated. Needs manual reconciliation.`,
    );
  }

  return requireOrder(orderId);
}
