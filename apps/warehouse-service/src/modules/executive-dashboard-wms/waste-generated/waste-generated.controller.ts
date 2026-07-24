import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { WasteGeneratedModule } from "./waste-generated.module.js"
import { WasteGeneratedQueryParamsSchema } from "./waste-generated.schema.js"

export class WasteGeneratedController extends BaseController {
  constructor(
    private readonly module: WasteGeneratedModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("waste_generated")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get("/waste-generated", async (c) => {
      const rawParams = c.req.query()
      const queryParams = WasteGeneratedQueryParamsSchema.parse(rawParams)
      
      const response = await this.module.getWasteGeneratedData(c, queryParams)
      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
