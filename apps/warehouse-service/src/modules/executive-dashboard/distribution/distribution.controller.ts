import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExecutiveDashboardDistributionModule } from "./distribution.module.js"
import {
  HealthFacilityImplementorQueryParamsSchema,
  ActiveRateQueryParamsSchema,
  LeadTimeQueryParamsSchema,
  LastMileQueryParamsSchema,
  LastMileMaterialQueryParamsSchema,
} from "./distribution.schema.js"

export class ExecutiveDashboardDistributionController extends BaseController {
  constructor(
    private readonly module: ExecutiveDashboardDistributionModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("executive_dashboard_distribution")
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
      "/health-facility",
      this.validateRequest("query", HealthFacilityImplementorQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getHealthFacilityImplementor(
          c,
          queryParams
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/active-rate",
      this.validateRequest("query", ActiveRateQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getActiveRate(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/lead-time",
      this.validateRequest("query", LeadTimeQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getLeadTime(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )
    router.get(
      "/last-mile",
      this.validateRequest("query", LastMileQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getLastMile(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )
    router.get(
      "/last-mile/materials",
      this.validateRequest("query", LastMileMaterialQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getLastMileMaterial(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
