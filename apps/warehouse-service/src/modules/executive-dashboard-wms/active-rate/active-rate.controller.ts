import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ActiveRateModule } from "./active-rate.module.js"
import { ActiveRateQueryParamsSchema } from "./active-rate.schema.js"

export class ActiveRateController extends BaseController {
  constructor(
    private readonly module: ActiveRateModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("active_rate")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get("/active-rate", async (c) => {
      const rawParams = c.req.query()
      const queryParams = ActiveRateQueryParamsSchema.parse(rawParams)

      const response = await this.module.getActiveRateData(c, queryParams)
      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
