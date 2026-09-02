import { ORDER_STATUS } from "@/common/constants/order.js"
import { assign, createActor, setup } from "xstate"

/**
 * Single source of truth for which order-status transition is legal from
 * which state, AND why a rejected one is rejected. Replaces the seven
 * duplicated `#statusNotAllowed` if/else chains that used to live one per
 * order-status-* middleware.
 *
 * Every (state, event) pair is listed explicitly on purpose — no fallback/
 * default branches — so nothing depends on check-ordering. That's what the
 * old code got subtly wrong (e.g. `canceled + CANCEL` used to report
 * "has_cancelled" instead of "cannot_same_status" because a global
 * "already cancelled" check ran before the same-status check).
 *
 * DRAFT and INDEPENDENT_EXTERMINATION statuses (and the VALIDATE event that
 * moved DRAFT -> PENDING) were retired along with the order-status-validate
 * module — orders are now always created as PENDING.
 */
export const ORDER_EVENT = {
  CONFIRM: "CONFIRM", // pending -> confirmed
  RESET_TO_PENDING: "RESET_TO_PENDING", // confirmed -> pending
  ALLOCATE: "ALLOCATE", // confirmed -> allocated
  SHIP: "SHIP", // allocated -> shipped
  FULFILL: "FULFILL", // shipped -> fulfilled
  CANCEL: "CANCEL", // pending|confirmed|allocated|shipped -> canceled
} as const

export type OrderEvent = (typeof ORDER_EVENT)[keyof typeof ORDER_EVENT]

export type RejectionReason =
  | "SAME_STATUS"
  | "HAS_FULFILLED"
  | "HAS_CANCELLED"
  | "CANNOT_PREVIOUS_STATE"
  | "NOT_YET_CONFIRMED"
  | "NOT_YET_ALLOCATED"
  | "NOT_YET_SHIPPED"

interface OrderMachineContext {
  statusId: number
  rejectionReason: RejectionReason | null
}

const STATUS_TO_STATE: Record<number, string> = {
  [ORDER_STATUS.PENDING]: "pending",
  [ORDER_STATUS.CONFIRMED]: "confirmed",
  [ORDER_STATUS.ALLOCATED]: "allocated",
  [ORDER_STATUS.SHIPPED]: "shipped",
  [ORDER_STATUS.FULFILLED]: "fulfilled",
  [ORDER_STATUS.CANCELED]: "canceled",
}

const STATE_TO_STATUS: Record<string, number> = Object.fromEntries(
  Object.entries(STATUS_TO_STATE).map(([status, state]) => [
    state,
    Number(status),
  ])
)

const machineSetup = setup({
  types: {} as {
    context: OrderMachineContext
    events: { type: OrderEvent }
  },
  actions: {
    rejectAs: assign({
      rejectionReason: (_, params: { reason: RejectionReason }) =>
        params.reason,
    }),
  },
})

// NOTE: every rejection below is written as the inline literal
// `{ actions: { type: "rejectAs", params: { reason: "X" } } }` rather than
// a `rejectedWith("X")` helper call, for the same reason an earlier
// computed-key/spread refactor was reverted: Stately Studio and the XState
// VS Code extension parse this file's AST without executing it, so a
// function call here would render as an unlabeled/invisible transition —
// they can't know what object a helper call returns without running it.
export const orderMachine = machineSetup.createMachine({
  id: "order",
  context: { statusId: ORDER_STATUS.PENDING, rejectionReason: null },
  initial: "pending",
  states: {
    pending: {
      on: {
        CONFIRM: "confirmed",
        CANCEL: "canceled",
        RESET_TO_PENDING: {
          actions: { type: "rejectAs", params: { reason: "SAME_STATUS" } },
        },
        ALLOCATE: {
          actions: {
            type: "rejectAs",
            params: { reason: "NOT_YET_CONFIRMED" },
          },
        },
        SHIP: {
          actions: {
            type: "rejectAs",
            params: { reason: "NOT_YET_ALLOCATED" },
          },
        },
        FULFILL: {
          actions: { type: "rejectAs", params: { reason: "NOT_YET_SHIPPED" } },
        },
      },
    },
    confirmed: {
      on: {
        ALLOCATE: "allocated",
        RESET_TO_PENDING: "pending",
        CANCEL: "canceled",
        CONFIRM: {
          actions: { type: "rejectAs", params: { reason: "SAME_STATUS" } },
        },
        SHIP: {
          actions: {
            type: "rejectAs",
            params: { reason: "NOT_YET_ALLOCATED" },
          },
        },
        FULFILL: {
          actions: { type: "rejectAs", params: { reason: "NOT_YET_SHIPPED" } },
        },
      },
    },
    allocated: {
      on: {
        SHIP: "shipped",
        CANCEL: "canceled",
        CONFIRM: {
          actions: {
            type: "rejectAs",
            params: { reason: "CANNOT_PREVIOUS_STATE" },
          },
        },
        RESET_TO_PENDING: {
          actions: {
            type: "rejectAs",
            params: { reason: "CANNOT_PREVIOUS_STATE" },
          },
        },
        ALLOCATE: {
          actions: { type: "rejectAs", params: { reason: "SAME_STATUS" } },
        },
        FULFILL: {
          actions: { type: "rejectAs", params: { reason: "NOT_YET_SHIPPED" } },
        },
      },
    },
    shipped: {
      on: {
        FULFILL: "fulfilled",
        CANCEL: "canceled",
        CONFIRM: {
          actions: {
            type: "rejectAs",
            params: { reason: "CANNOT_PREVIOUS_STATE" },
          },
        },
        RESET_TO_PENDING: {
          actions: {
            type: "rejectAs",
            params: { reason: "CANNOT_PREVIOUS_STATE" },
          },
        },
        ALLOCATE: {
          actions: {
            type: "rejectAs",
            params: { reason: "CANNOT_PREVIOUS_STATE" },
          },
        },
        SHIP: {
          actions: { type: "rejectAs", params: { reason: "SAME_STATUS" } },
        },
      },
    },
    // fulfilled/canceled are terminal in practice (nothing here ever assigns
    // them a real `target`), but they're kept as plain states rather than
    // `type: "final"` so they can still record a rejection reason when
    // something illegal is attempted against them — an actual `final` state
    // stops the actor and can't react to events.
    fulfilled: {
      on: {
        CANCEL: {
          actions: { type: "rejectAs", params: { reason: "HAS_FULFILLED" } },
        },
        CONFIRM: {
          actions: { type: "rejectAs", params: { reason: "HAS_FULFILLED" } },
        },
        RESET_TO_PENDING: {
          actions: { type: "rejectAs", params: { reason: "HAS_FULFILLED" } },
        },
        ALLOCATE: {
          actions: { type: "rejectAs", params: { reason: "HAS_FULFILLED" } },
        },
        SHIP: {
          actions: { type: "rejectAs", params: { reason: "HAS_FULFILLED" } },
        },
        FULFILL: {
          actions: { type: "rejectAs", params: { reason: "SAME_STATUS" } },
        },
      },
    },
    canceled: {
      on: {
        CONFIRM: {
          actions: { type: "rejectAs", params: { reason: "HAS_CANCELLED" } },
        },
        RESET_TO_PENDING: {
          actions: { type: "rejectAs", params: { reason: "HAS_CANCELLED" } },
        },
        ALLOCATE: {
          actions: { type: "rejectAs", params: { reason: "HAS_CANCELLED" } },
        },
        SHIP: {
          actions: { type: "rejectAs", params: { reason: "HAS_CANCELLED" } },
        },
        FULFILL: {
          actions: { type: "rejectAs", params: { reason: "HAS_CANCELLED" } },
        },
        CANCEL: {
          actions: { type: "rejectAs", params: { reason: "SAME_STATUS" } },
        },
      },
    },
  },
})

export interface TransitionCheck {
  allowed: boolean
  nextStatusId?: number
  reason?: RejectionReason
}

/**
 * Spins up a short-lived actor seeded at `currentStatusId`, sends `event`,
 * and reads the resulting snapshot. The actor never outlives this call —
 * there are no timers/invokes on this machine, so `.stop()` is immediate
 * and there's nothing to leak.
 */
export function checkOrderTransition(
  currentStatusId: number,
  event: OrderEvent
): TransitionCheck {
  const stateName = STATUS_TO_STATE[currentStatusId]
  const actor = createActor(orderMachine, {
    snapshot: orderMachine.resolveState({
      value: stateName,
      context: { statusId: currentStatusId, rejectionReason: null },
    }),
  })

  actor.start()
  actor.send({ type: event })
  const snapshot = actor.getSnapshot()
  actor.stop()

  if (snapshot.value !== stateName) {
    return {
      allowed: true,
      nextStatusId: STATE_TO_STATUS[snapshot.value as string],
    }
  }

  return {
    allowed: false,
    reason: snapshot.context.rejectionReason ?? "CANNOT_PREVIOUS_STATE",
  }
}
