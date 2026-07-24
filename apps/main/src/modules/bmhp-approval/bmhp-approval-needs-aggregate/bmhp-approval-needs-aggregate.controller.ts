import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BaseController } from "@smile/lib/base/controller.js"
import { BmhpApprovalNeedsAggregateModule } from "./bmhp-approval-needs-aggregate.module.js"
import {
  GetNeedsAggregateQuerySchema,
  GetNeedsAggregateDetailParamSchema,
  GetNeedsAggregateDetailQuerySchema,
  UpdateNeedsAggregateStatusParamSchema,
  UpdateNeedsAggregateStatusBodySchema,
} from "./bmhp-approval-needs-aggregate.schema.js"

export class BmhpApprovalNeedsAggregateController extends BaseController {
  constructor(private readonly module: BmhpApprovalNeedsAggregateModule) {
    super("bmhp-approval-needs-aggregate")
  }

  getRoutes(): Hono {
    const router = new Hono()

    /**
     * GET /bmhp-approval/needs-aggregate
     * Returns the material needs summary and city-level list for a province
     */
    router.get(
      "/",
      this.validateRequest("query", GetNeedsAggregateQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/needs-aggregate/preview
     * Returns the structured preview for frontend cross-tabs
     */
    router.get(
      "/preview",
      this.validateRequest("query", GetNeedsAggregateQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.preview(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/needs-aggregate/xls
     * Exports the material needs aggregate to an Excel file
     */
    router.get(
      "/xls",
      this.validateRequest("query", GetNeedsAggregateQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportExcel(c, query)
        
        return c.json(
          {
            filename: response.filename,
            base64: Buffer.from(response.buffer as any).toString("base64"),
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          StatusCodes.OK
        )
      }
    )

    /**
     * GET /bmhp-approval/needs-aggregate/:city_id/details
     * Returns detailed targets and adjustments for a specific city
     */
    router.get(
      "/:city_id/details",
      this.validateRequest("param", GetNeedsAggregateDetailParamSchema),
      this.validateRequest("query", GetNeedsAggregateDetailQuerySchema),
      async (c) => {
        const { city_id } = c.req.valid("param")
        const query = c.req.valid("query")
        const response = await this.module.getDetails(c, city_id, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * POST /bmhp-approval/needs-aggregate/:city_id/status
     * Updates the status (pending/approved/rejected) of the city
     * Note: Allowed PUT as requested, mapped to PUT here but can be POST depending on standard
     */
    router.put(
      "/:city_id/status",
      this.validateRequest("param", UpdateNeedsAggregateStatusParamSchema),
      this.validateRequest("json", UpdateNeedsAggregateStatusBodySchema),
      async (c) => {
        const { city_id } = c.req.valid("param")
        const body = c.req.valid("json")
        const response = await this.module.updateStatus(c, city_id, body)
        
        if (!response.success) {
          return c.json(response, StatusCodes.BAD_REQUEST)
        }
        
        return c.json(response, StatusCodes.OK)
      }
    )
    
    // Also support POST as requested natively
    router.post(
      "/:city_id/review",
      this.validateRequest("param", UpdateNeedsAggregateStatusParamSchema),
      this.validateRequest("json", UpdateNeedsAggregateStatusBodySchema),
      async (c) => {
        const { city_id } = c.req.valid("param")
        const body = c.req.valid("json")
        const response = await this.module.updateStatus(c, city_id, body)
        
        if (!response.success) {
          return c.json(response, StatusCodes.BAD_REQUEST)
        }
        
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
