import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { DEVICE_TYPE } from "@/common/constants/device.js"
import { USER_ROLE } from "@/common/constants/user.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { OrderRelocationMiddleware } from "./order-relocation.middleware.js"

export class OrderRelocationController extends BaseController {
  constructor(
    private readonly roleMiddleware: RoleMiddleware,
    private readonly middleware: OrderRelocationMiddleware,
    private readonly module: OrderRelocationModule
  ) {
    super("order-relocation")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.post(
      "/relocation",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("json", this.middleware.createSchemaOrderRelocation),
      async (c) => {
        const body = await c.req.json()
        // module.create() performs all DB writes inside the current transaction
        // and returns a post-commit callback for side-effects (notifications).
        // The transaction middleware commits when module.create() returns,
        // releasing DB locks/connection BEFORE the callback runs.
        const { createdOrderId, postCommitTasks } = await this.module.create(
          c,
          body
        )

        // Transaction is now committed. Run side-effects (RabbitMQ publish)
        // without holding a DB connection. Fire-and-forget: errors here don't
        // affect the HTTP response.
        postCommitTasks().catch((err) => {
          console.error(
            `[OrderRelocationController] Post-commit task failed for orderId=${createdOrderId}:`,
            err
          )
        })

        return c.json({ createdOrderId }, StatusCodes.CREATED)
      }
    )

    return router
  }
}
