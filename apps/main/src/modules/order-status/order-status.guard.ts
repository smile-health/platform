import { ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { checkOrderTransition, OrderEvent } from "./order.machine.js"

/**
 * Drop-in replacement for the old per-module `#statusNotAllowed` methods.
 * Both the legality decision AND the rejection reason now come from the
 * order machine itself (see order.machine.ts) — this function only maps
 * that reason onto the pre-existing i18n keys, which is a presentation
 * concern the machine has no business knowing about.
 */
export function assertOrderTransitionAllowed(
  c: Context,
  currentStatusId: number,
  event: OrderEvent
): void {
  const result = checkOrderTransition(currentStatusId, event)
  if (result.allowed) return

  const field = c.var.t("order_status.label.order_status_id")

  switch (result.reason) {
    case "SAME_STATUS":
      throw new ValidationError(
        c.var.t("validator.cannot_same_status", { field })
      )
    case "HAS_FULFILLED":
      throw new ValidationError(c.var.t("validator.has_fulfilled", { field }))
    case "HAS_CANCELLED":
      throw new ValidationError(c.var.t("validator.has_cancelled", { field }))
    case "NOT_YET_CONFIRMED":
      throw new ValidationError(
        c.var.t("validator.not_yet_confirmed", { field })
      )
    case "NOT_YET_ALLOCATED":
      throw new ValidationError(
        c.var.t("validator.not_yet_allocated", { field })
      )
    case "NOT_YET_SHIPPED":
      throw new ValidationError(
        c.var.t("validator.not_yet_shipped", { field })
      )
    case "CANNOT_PREVIOUS_STATE":
    default:
      throw new ValidationError(
        c.var.t("validator.cannot_previous_state", { field })
      )
  }
}
