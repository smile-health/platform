import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpApprovalMinistryModule } from "./bmhp-approval-ministry.module.js"
import {
  GetMinistryApprovalListQuerySchema,
  GetMinistryApprovalRecapitulationParamsSchema,
  GetMinistryApprovalRecapitulationQuerySchema,
} from "./bmhp-approval-ministry.schema.js"
import { BaseController } from "@smile/lib/base/controller.js"

export class BmhpApprovalMinistryController extends BaseController {
  constructor(private readonly module: BmhpApprovalMinistryModule) {
    super("bmhp-approval-ministry") // Note: Pass namespace if needed to BaseController, but base doesn't require if super() is empty. Let's keep super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    /**
     * GET /bmhp-approval/ministry-of-health
     * Returns paginated province-level BMHP approval status list.
     */
    router.get(
      "/",
      this.validateRequest("query", GetMinistryApprovalListQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listMinistryApproval(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/ministry-of-health/xls
     * Exports province-level BMHP approval status list to Excel.
     */
    router.get(
      "/xls",
      this.validateRequest("query", GetMinistryApprovalListQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportExcel(c, query)
        const base64 = Buffer.from(response.buffer as ArrayBuffer).toString("base64")
        return c.json({
          filename: response.filename,
          base64,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      }
    )

    /**
     * GET /bmhp-approval/ministry-of-health/:province_id
     * Returns national procurement recapitulation per material for a specific program plan period.
     */
    router.get(
      "/:province_id",
      this.validateRequest(
        "param",
        GetMinistryApprovalRecapitulationParamsSchema
      ),
      this.validateRequest(
        "query",
        GetMinistryApprovalRecapitulationQuerySchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const query = c.req.valid("query")
        const response = await this.module.recapitulation(c, param.province_id, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/ministry-of-health/:province_id/xls
     * Exports national procurement recapitulation per material for a specific program plan period to Excel.
     */
    router.get(
      "/:province_id/xls",
      this.validateRequest(
        "param",
        GetMinistryApprovalRecapitulationParamsSchema
      ),
      this.validateRequest(
        "query",
        GetMinistryApprovalRecapitulationQuerySchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const query = c.req.valid("query")
        const response = await this.module.exportRecapitulationExcel(c, param.province_id, query)
        const base64 = Buffer.from(response.buffer as ArrayBuffer).toString("base64")
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
