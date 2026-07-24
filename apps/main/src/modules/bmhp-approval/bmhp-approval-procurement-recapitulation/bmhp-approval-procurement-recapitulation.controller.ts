import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpApprovalProcurementRecapitulationModule } from "./bmhp-approval-procurement-recapitulation.module.js"
import {
  GetProcurementRecapitulationQuerySchema,
  UpdateRemainingStockBodySchema,
  UpdateDeskResultBodySchema,
  CreateDeskResultBodySchema,
} from "./bmhp-approval-procurement-recapitulation.schema.js"

export class BmhpApprovalProcurementRecapitulationController extends BaseController {
  constructor(
    private readonly module: BmhpApprovalProcurementRecapitulationModule
  ) {
    super("bmhp-approval-procurement-recapitulation")
  }

  getRoutes(): Hono {
    const router = new Hono()

    /**
     * GET /bmhp-approval/procurement-recapitulation
     * Returns recapitulation of material needs, stock, and procurement proposal
     */
    router.get(
      "/",
      this.validateRequest("query", GetProcurementRecapitulationQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/procurement-recapitulation/xls
     * Export procurement recapitulation as an Excel file (base64).
     */
    router.get(
      "/xls",
      this.validateRequest("query", GetProcurementRecapitulationQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportExcel(c, query)
        const base64 = Buffer.from(
          response.buffer as unknown as ArrayBuffer
        ).toString("base64")
        return c.json({
          filename: response.filename,
          base64,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      }
    )

    /**
     * POST /bmhp-approval/procurement-recapitulation
     * Update remaining_stock (stock_on_hand) for each material.
     * Frontend sends this when user submits the "Edit Remaining Stock" bottom sheet.
     */
    router.post(
      "/",
      this.validateRequest("json", UpdateRemainingStockBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.updateRemainingStock(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * POST /bmhp-approval/procurement-recapitulation/desk-result
     * Update desk_result for each material.
     */
    router.post(
      "/desk-result",
      this.validateRequest("json", UpdateDeskResultBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.updateDeskResult(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * POST /bmhp-approval/procurement-recapitulation/desk-result-record
     * Create desk result record in ws_bmhp_desk_results
     */
    router.post(
      "/desk-result-record",
      this.validateRequest("json", CreateDeskResultBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.createDeskResultRecord(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/procurement-recapitulation/ba-pdf
     * Generate Berita Acara (BA) PDF for desk result
     */
    router.get(
      "/ba-pdf",
      async (c) => {
        const program_plan_id = Number(c.req.query("program_plan_id"))
        const entity_id = Number(c.req.query("entity_id"))

        if (!program_plan_id || !entity_id) {
          return c.json(
            {
              status: false,
              message: "program_plan_id and entity_id are required",
            },
            StatusCodes.BAD_REQUEST
          )
        }

        const response = await this.module.generateDeskResultBAPDF(
          c,
          program_plan_id,
          entity_id
        )

        const base64 = Buffer.from(
          response.buffer as unknown as ArrayBuffer
        ).toString("base64")

        return c.json({
          filename: response.filename,
          base64,
          mimeType: "application/pdf",
        })
      }
    )

    return router
  }
}
