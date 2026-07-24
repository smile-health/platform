import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpApprovalMonitoringModule } from "./bmhp-approval-monitoring.module.js"
import { GetMonitoringQuerySchema } from "./bmhp-approval-monitoring.schema.js"

export class BmhpApprovalMonitoringController extends BaseController {
  constructor(
    private readonly module: BmhpApprovalMonitoringModule
  ) {
    super("bmhp-approval-monitoring")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", GetMonitoringQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/xls",
      this.validateRequest("query", GetMonitoringQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportExcel(c, query)
        const base64 = Buffer.from(response.buffer).toString("base64")
        return c.json({
          filename: response.filename,
          base64,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      }
    )

    return router
  }
}
