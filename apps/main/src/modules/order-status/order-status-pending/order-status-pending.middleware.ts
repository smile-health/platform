import { BaseMiddleware } from "@smile-health/lib/base/middleware.js"
import { NotFoundError, ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { assertOrderTransitionAllowed } from "../order-status.guard.js"
import { ORDER_EVENT } from "../order.machine.js"
import { OrderStatusPendingRepository } from "./order-status-pending.repository.js"

export class OrderStatusPendingMiddleware extends BaseMiddleware {
  constructor(private readonly repository: OrderStatusPendingRepository) {
    super()
  }

  readonly #getOrder = async (c: Context) => {
    const id = c.req.param("id")
    const order = await this.repository.getOrderById(
      c,
      Number(id),
      c.get("programId")
    )
    return order
  }

  /**
   * Get order WITH LOCK to prevent concurrent updates
   * Acquires pessimistic lock (FOR UPDATE) on the row
   * Lock is held until transaction commits
   */
  readonly #getOrderWithLock = async (c: Context) => {
    const id = c.req.param("id")
    const order = await this.repository.getOrderByIdWithLock(
      c,
      Number(id),
      c.get("programId")
    )
    return order
  }

  readonly #IdNotExistsOrHasDeleted = (c: Context, order) => {
    if (!order)
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("order_status.label.order_id"),
        })
      )
    if (order?.deleted_at)
      throw new ValidationError(
        c.var.t("validator.delete", {
          field: c.var.t("order_status.label.order_id"),
        })
      )
  }

  readonly #statusNotAllowed = (c: Context, statusId: number) => {
    assertOrderTransitionAllowed(c, statusId, ORDER_EVENT.RESET_TO_PENDING)
  }

  readonly #programIdNotMatch = (c: Context, order) => {
    if (order.program_id !== c.get("programId")) {
      throw new NotFoundError(
        c.var.t("validator.not_match", {
          field: c.var.t("order.label.program_id"),
        })
      )
    }
  }

  detailOrder = createMiddleware(async (c, next) => {
    const order = await this.#getOrder(c)
    this.#programIdNotMatch(c, order)
    this.#IdNotExistsOrHasDeleted(c, order)
    this.#statusNotAllowed(c, order!.order_status_id)
    await next()
  })

  /**
   * Detail order WITH LOCK - Prevents concurrent status updates
   * Used for operations that modify order status
   * Acquires pessimistic lock that prevents other transactions from modifying
   */
  detailOrderWithLock = createMiddleware(async (c, next) => {
    const order = await this.#getOrderWithLock(c)
    this.#programIdNotMatch(c, order)
    this.#IdNotExistsOrHasDeleted(c, order)
    this.#statusNotAllowed(c, order!.order_status_id)
    await next()
  })
}
