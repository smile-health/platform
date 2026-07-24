import { DEVICE_TYPE } from "@/common/constants/device.js"
import { USER_ROLE } from "@/common/constants/user.js"
import { DeduplicationMiddleware } from "@/common/middlewares/dedup.middleware.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { OrderStatusShipMiddleware } from "./order-status-ship.middleware.js"
import { OrderStatusShipModule } from "./order-status-ship.module.js"
import { GetDetailOrderSchema } from "./order-status-ship.schema.js"

export class OrderStatusShipController extends BaseController {
  constructor(
    private readonly middleware: OrderStatusShipMiddleware,
    private readonly module: OrderStatusShipModule,
    private readonly roleMiddleware: RoleMiddleware,
    private readonly dedupMiddleware: DeduplicationMiddleware
  ) {
    super("order_status")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.put(
      "/:id/ship",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("param", GetDetailOrderSchema),
      this.middleware.detailOrderWithLock,  // CHANGED: Use locked version
      this.validateRequest("json", this.middleware.update),
      this.dedupMiddleware.middleware,
      async (c) => {
        const param = c.req.valid("param")
        const body = c.req.valid("json")
        try {
          // module.update() performs all DB writes inside the current transaction.
          // It returns a post-commit callback for side-effects (publishers/notifications).
          // The transaction middleware commits when module.update() returns,
          // releasing all FOR UPDATE locks on ws_stocks BEFORE the callback runs.
          const postCommitTasks = await this.module.update(c, param.id, body)

          // Transaction is now COMMITTED. DB locks released.
          // Run side-effects (network I/O) without holding any DB row locks.
          // Fire-and-forget: errors here don't affect the HTTP response.
          postCommitTasks().catch((err) => {
            console.error(
              `[OrderStatusShipController] Post-commit task failed for orderId=${param.id}:`,
              err
            )
          })

          return c.json(undefined, StatusCodes.NO_CONTENT)
        } catch (error) {
          // Handle atomic status update failure
          if (
            error instanceof Error &&
            error.message.includes("not ALLOCATED")
          ) {
            return c.json(
              {
                success: false,
                message: "Order status has been modified or is not in ALLOCATED state",
              },
              StatusCodes.CONFLICT
            )
          }
          throw error
        }
      }
    )

    return router
  }
}
