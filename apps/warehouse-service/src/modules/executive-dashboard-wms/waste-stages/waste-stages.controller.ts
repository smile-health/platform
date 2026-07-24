import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { WasteStagesModule } from "./waste-stages.module.js"
import { WasteStagesQueryParamsSchema } from "./waste-stages.schema.js"

export class WasteStagesController extends BaseController {
  constructor(
    private readonly module: WasteStagesModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("waste_stages")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get("/waste-stages", async (c) => {
      const rawParams = c.req.query()
      const queryParams = WasteStagesQueryParamsSchema.parse(rawParams)
      
      const response = await this.module.getWasteStagesData(c, queryParams)
      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
