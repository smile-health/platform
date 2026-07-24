import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { HealthFacilityModule } from "./health-facility.module.js"
import { HealthFacilityQueryParamsSchema } from "./health-facility.schema.js"

export class HealthFacilityController extends BaseController {
  constructor(
    private readonly module: HealthFacilityModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("health_facility")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get("/health-facility", async (c) => {
      const rawParams = c.req.query()
      const queryParams = HealthFacilityQueryParamsSchema.parse(rawParams)
      
      const response = await this.module.getHealthFacilityData(c, queryParams)
      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
