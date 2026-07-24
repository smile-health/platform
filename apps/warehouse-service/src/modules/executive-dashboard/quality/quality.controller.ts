import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExecutiveDashboardQualityModule } from "./quality.module.js"
import { QualityQueryParamsSchema } from "./quality.schema.js"

export class ExecutiveDashboardQualityController extends BaseController {
  constructor(
    private readonly module: ExecutiveDashboardQualityModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("executive_dashboard_quality")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get(
      "/stock-taking",
      this.validateRequest("query", QualityQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getStockTaking(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/stock-discard",
      this.validateRequest("query", QualityQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getStockDiscard(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/asset",
      this.validateRequest("query", QualityQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getAsset(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
