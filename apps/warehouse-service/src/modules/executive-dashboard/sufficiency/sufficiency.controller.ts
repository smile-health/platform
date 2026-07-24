import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExecutiveDashboardSufficiencyModule } from "./sufficiency.module.js"
import { SufficiencyQueryParamsSchema } from "./sufficiency.schema.js"
import { timeout } from "hono/timeout"

export class ExecutiveDashboardSufficiencyController extends BaseController {
  constructor(
    private readonly module: ExecutiveDashboardSufficiencyModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("executive_dashboard_sufficiency")
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
      "/stock-sufficiency",
      this.validateRequest("query", SufficiencyQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getStockSufficiency(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/stock-sufficiency/export",
      timeout(180_000, (c) => c.json({ message: 'Request timeout saat memproses export' }, 408)),
      this.validateRequest("query", SufficiencyQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const file = await this.module.exportStockSufficiency(c, queryParams)
        return this.downloadExcel(c, file)
      }
    )

    return router
  }
}
