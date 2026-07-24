import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { CommitmentMonitoringModule } from "./commitment.module.js"
import { CommitmentMonitoringQueryParamsSchema } from "./commitment.schema.js"

export class CommitmentMonitoringController extends BaseController {
  constructor(
    private readonly module: CommitmentMonitoringModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("commitment_monitoring")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
      ])
    )

    router.get(
      "/summary",
      this.validateRequest("query", CommitmentMonitoringQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getSummary(c, queryParams)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/national",
      this.validateRequest("query", CommitmentMonitoringQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getNational(c, queryParams)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/province",
      this.validateRequest("query", CommitmentMonitoringQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getProvince(c, queryParams)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/need-stocks",
      this.validateRequest("query", CommitmentMonitoringQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getNeedStocks(c, queryParams)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/realization-target",
      this.validateRequest("query", CommitmentMonitoringQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.module.getRealizationTarget(c, queryParams)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/xls",
      this.validateRequest("query", CommitmentMonitoringQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const file = await this.module.getExcelExport(c, queryParams)

        return this.downloadExcel(c, file)
      }
    )

    router.get("/send-quarterly-needs-email", async (c) => {
      const response = await this.module.sendQuarterlyNeedsEmail()

      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
