// The order lifecycle as one xstate machine. States are the order statuses
// (mirrors ORDER_STATUS in ../order.lifecycle.ts); the transient action
// states between them (allocate/ship/fulfill/cancel) each invoke the
// matching smile/inventory RPC actor (bodies in usecases/*-order.ts).
//
// Naming: a real resting status is UPPERCASE (matches ORDER_STATUS's key
// names, so leafStateName(settled.value) can index straight into
// ORDER_STATUS with no separate lookup table). A transient action state is
// lowercase-verb. Event `type` values are uppercase (xstate/redux idiom),
// kept distinct from the lowercase state names.
//
//          CONFIRM            ALLOCATE           SHIP           FULFILL
//   [PENDING] --> [CONFIRMED] --------> [ALLOCATED] --> [SHIPPED] --> [FULFILLED]
//      |  \            |  \                /  \
//      |   \___________|___\______________/    \
//      |    \__________|_____CANCEL (all three, via history)
//   CANCEL             |
//      |                \
//      v                 v
//  [CANCELLED]      [CANCELLED]
//
// PENDING/CONFIRMED/ALLOCATED share a compound "active" state with a
// shallow history pseudostate, so a failed cancel falls back to whichever
// of the three it came from instead of a fixed target.
//
// This machine is NOT persisted: transitionOrder() rehydrates a fresh actor
// at the order's current DB status (via resolveState) for every call, and
// performs the status write + topic publish itself afterward, as plain
// calls — not xstate actions — so those stay enforced in one place instead
// of decided per usecase.
//
// usecases/*-order.ts import transitionOrder from here, and this file
// imports their run* bodies — a deliberate cycle, safe because both sides
// are only used inside function bodies, never at module-init time.
import { APIError } from "encore.dev/api";
import { setup, fromPromise, createActor, waitFor, assign, type StateValue } from "xstate";
import * as repo from "./order.repository";
import type { AllocateOrderRequest, CancelOrderRequest } from "./order.schema";
import { ORDER_STATUS, requireOrder } from "./order.lifecycle";
import { orderConfirmed, orderAllocated, orderShipped, orderFulfilled, orderCancelled } from "../order.topics";
import { runAllocate } from "./usecases/allocate-order";
import { runShip } from "./usecases/ship-order";
import { runFulfill } from "./usecases/fulfill-order";
import { runCancel } from "./usecases/cancel-order";

// Extra ws_orders columns a status write may need (e.g. is_allocated,
// order_cancel_reason_id) — same type repo.updateStatusGuarded takes.
export type StatusExtra = Parameters<typeof repo.updateStatusGuarded>[4];

interface OrderMachineContext {
  orderId: number;
  // Fetched once by transitionOrder(), reused by every actor below instead
  // of each independently re-fetching via requireOrder.
  order: repo.OrderRow;
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
    allocateStock: fromPromise<StatusExtra, { order: repo.OrderRow; request: AllocateOrderRequest; userId: number }>(({ input }) =>
      runAllocate(input),
    ),
    shipStock: fromPromise<StatusExtra, { order: repo.OrderRow; userId: number }>(({ input }) => runShip(input)),
    fulfillStock: fromPromise<StatusExtra, { order: repo.OrderRow; userId: number }>(({ input }) => runFulfill(input)),
    releaseStock: fromPromise<StatusExtra, { order: repo.OrderRow; request: CancelOrderRequest; userId: number }>(({ input }) =>
      runCancel(input),
    ),
  },
}).createMachine({
  id: "order",
  context: ({ input }) => ({ orderId: input.orderId, order: input.order }),
  initial: "active",
  states: {
    active: {
      initial: "PENDING",
      states: {
        // Confirm has no inventory RPC, so no actor — straight to CONFIRMED.
        PENDING: {
          on: {
            CONFIRM: "CONFIRMED",
            CANCEL: "#order.cancel",
          },
        },
        CONFIRMED: {
          on: {
            ALLOCATE: "allocate",
            CANCEL: "#order.cancel",
          },
        },
        allocate: {
          invoke: {
            src: "allocateStock",
            input: ({ context, event }) => {
              if (event.type !== "ALLOCATE") throw new Error("unreachable: allocate invoked without ALLOCATE event");
              return { order: context.order, request: event.request, userId: event.userId };
            },
            onDone: { target: "ALLOCATED", actions: assign({ extra: ({ event }) => event.output }) },
            onError: { target: "CONFIRMED", actions: assign({ error: ({ event }) => event.error }) },
          },
        },
        ALLOCATED: {
          on: {
            SHIP: "#order.ship",
            CANCEL: "#order.cancel",
          },
        },
        hist: { type: "history", history: "shallow" },
      },
    },
    ship: {
      invoke: {
        src: "shipStock",
        input: ({ context, event }) => {
          if (event.type !== "SHIP") throw new Error("unreachable: ship invoked without SHIP event");
          return { order: context.order, userId: event.userId };
        },
        onDone: { target: "SHIPPED", actions: assign({ extra: ({ event }) => event.output }) },
        onError: { target: "#order.active.ALLOCATED", actions: assign({ error: ({ event }) => event.error }) },
      },
    },
    SHIPPED: {
      on: { FULFILL: "fulfill" },
    },
    fulfill: {
      invoke: {
        src: "fulfillStock",
        input: ({ context, event }) => {
          if (event.type !== "FULFILL") throw new Error("unreachable: fulfill invoked without FULFILL event");
          return { order: context.order, userId: event.userId };
        },
        onDone: { target: "FULFILLED", actions: assign({ extra: ({ event }) => event.output }) },
        onError: { target: "SHIPPED", actions: assign({ error: ({ event }) => event.error }) },
      },
    },
    FULFILLED: { type: "final" },
    cancel: {
      invoke: {
        src: "releaseStock",
        input: ({ context, event }) => {
          if (event.type !== "CANCEL") throw new Error("unreachable: cancel invoked without CANCEL event");
          return { order: context.order, request: event.request, userId: event.userId };
        },
        onDone: { target: "CANCELLED", actions: assign({ extra: ({ event }) => event.output }) },
        // Falls back to whichever of PENDING/CONFIRMED/ALLOCATED it came from.
        onError: { target: "#order.active.hist", actions: assign({ error: ({ event }) => event.error }) },
      },
    },
    CANCELLED: { type: "final" },
  },
});

// --- driving the machine from an order's persisted status ---------------

const TRANSIENT_STATE_NAMES: ReadonlySet<string> = new Set(["allocate", "ship", "fulfill", "cancel"]);

function toMachineValue(status: string): StateValue | undefined {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return { active: "PENDING" };
    case ORDER_STATUS.CONFIRMED:
      return { active: "CONFIRMED" };
    case ORDER_STATUS.ALLOCATED:
      return { active: "ALLOCATED" };
    case ORDER_STATUS.SHIPPED:
      return "SHIPPED";
    case ORDER_STATUS.FULFILLED:
      return "FULFILLED";
    case ORDER_STATUS.CANCELLED:
      return "CANCELLED";
    default:
      return undefined;
  }
}

function leafStateName(value: StateValue): string {
  return typeof value === "string" ? value : leafStateName(Object.values(value)[0]!);
}

// The one place every transition's topic event is published.
async function publishTransitionEvent(order: repo.OrderRow, event: OrderMachineEvent): Promise<void> {
  const programId = order.order_type_id;
  switch (event.type) {
    case "CONFIRM":
      await orderConfirmed.publish({ orderId: order.id, programId, userId: event.userId });
      return;
    case "ALLOCATE":
      await orderAllocated.publish({
        orderId: order.id,
        programId,
        userId: event.userId,
        items: event.request.items.map((item) => ({ materialId: item.material_id, allocatedQty: item.allocated_qty, stockId: item.stock_id })),
      });
      return;
    case "SHIP":
      await orderShipped.publish({ orderId: order.id, programId, userId: event.userId });
      return;
    case "FULFILL":
      await orderFulfilled.publish({ orderId: order.id, programId, userId: event.userId });
      return;
    case "CANCEL":
      await orderCancelled.publish({ orderId: order.id, programId, userId: event.userId, reason: event.request.reason ?? undefined });
      return;
  }
}

// Single entry point every controller endpoint calls to drive a transition.
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

  // The resting state name IS the target status (see naming convention above).
  const toStatus = ORDER_STATUS[leafStateName(settled.value) as keyof typeof ORDER_STATUS];
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

  await publishTransitionEvent(order, event);

  return requireOrder(orderId);
}
