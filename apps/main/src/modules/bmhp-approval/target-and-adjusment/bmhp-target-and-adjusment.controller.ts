import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExcelMiddleware } from "@smile/lib/middlewares/index.js"
import { BmhpTargetAdjustmentModule } from "./bmhp-target-and-adjusment.module.js"
import { BmhpTargetAdjustmentMiddleware } from "./bmhp-target-and-adjusment.middleware.js"
import { BmhpTargetAdjustmentExcelMiddleware } from "./bmhp-target-and-adjusment.excel.middleware.js"
import {
  BulkUpdateVerificationStatusBodySchema,
  ExportVerifyBmhpPlanningQuerySchema,
  GetBmhpTargetAdjustmentQuerySchema,
  GetTargetInputQuerySchema,
  UpdateBmhpTargetAdjustmentBodySchema,
  UpdateTargetInputBodySchema,
  UpdateVerificationStatusBodySchema,
  RevisionProgramPlanBodySchema,
  TemplateVerificationQuerySchema,
  ImportVerificationQuerySchema,
  GetMinistryRecapitulationQuerySchema,
  GetMinistryRecapitulationDetailQuerySchema,
} from "./bmhp-target-and-adjusment.schema.js"
import { BaseController } from "@smile/lib/base/controller.js"

export class BmhpTargetAdjustmentController extends BaseController {
  constructor(
    private readonly module: BmhpTargetAdjustmentModule,
    private readonly middleware: BmhpTargetAdjustmentMiddleware,
    private readonly excelMiddleware: ExcelMiddleware,
    private readonly excelImportMiddleware: BmhpTargetAdjustmentExcelMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    /**
     * GET /verifications/template
     * Downloads a blank xlsx template for bulk adjustment_target input.
     * Query: program_plan_id
     */
    router.get(
      "/verifications/template",
      this.validateRequest("query", TemplateVerificationQuerySchema),
      this.excelMiddleware.handleExport,
      async (c) => {
        const query = c.req.valid("query")
        const file = await this.module.getVerificationTemplate(c, query)
        c.set("file", file)
      }
    )

    /**
     * POST /verifications/import
     * Imports a filled adjustment_target template (xlsx) and upserts the data.
     * Query: program_plan_id
     * Body: multipart/form-data with field "file" (xlsx)
     */
    router.post(
      "/verifications/import",
      this.validateRequest("query", ImportVerificationQuerySchema),
      this.excelMiddleware.validateFileMiddleware,
      this.excelImportMiddleware.excel,
      async (c) => {
        const query = c.req.valid("query")
        // importRows is set by excelImportMiddleware
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (c.get as any)("importRows") as Array<{
          entity_id: number
          target_input: Array<{
            id: number | null
            examination_id: number
            target_id: number | null
            target: number
          }>
        }>
        const result = await this.module.importVerificationTemplate(
          c,
          query.program_plan_id,
          rows
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * GET /verifications/export
     * Exports verification data to Excel file.
     * Query params are the same as GET /verifications, which will be used to filter the exported data.
     */
    router.get(
      "/verifications/export",
      this.validateRequest("query", ExportVerifyBmhpPlanningQuerySchema),
      this.excelMiddleware.handleExport,
      async (c) => {
        const query = c.req.valid("query")
        const file = await this.module.exportVerifyPlanning(c, query)
        c.set("file", file)
      }
    )

    /**
     * GET /verifications
     * Returns verification data for the given program plan and entity.
     */
    router.get(
      "/verifications",
      this.validateRequest("query", GetBmhpTargetAdjustmentQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getVerifyPlanning(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /verifications/target-input
     * Returns target input data for the given program plan and entity.
     */
    router.get(
      "/verifications/target-input",
      this.validateRequest("query", GetTargetInputQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getTargetInput(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /ministry-recapitulation
     * Returns aggregated verification data grouped by examination_id for a specific entity.
     * Query: program_plan_id, entity_id
     */
    router.get(
      "/ministry-recapitulation",
      this.validateRequest("query", GetMinistryRecapitulationQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getMinistryRecapitulation(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /ministry-recapitulation/detail
     * Returns detail data for ministry recapitulation (province_name, regency_name, year, remaining_stock_date).
     * Query: program_plan_id, entity_id
     */
    router.get(
      "/ministry-recapitulation/detail",
      this.validateRequest("query", GetMinistryRecapitulationDetailQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getMinistryRecapitulationDetail(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /ministry-recapitulation/xls
     * Export ministry recapitulation as Excel file.
     */
    router.get(
      "/ministry-recapitulation/xls",
      this.validateRequest("query", GetMinistryRecapitulationQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportMinistryRecapitulationExcel(c, query)
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
     * PATCH /verifications
     * Update verification status and/or adjustment target for specific target groups.
     * Body is an array of objects with shape:
     * {
     *   id: number (nullable, if null means create new verification data),
     *   examination_id: number,
     *   target_id: number,
     *   adjustment_target: number,
     *   status: boolean (true=approve, false=reject)
     * }
     */
    router.patch(
      "/verifications",
      this.validateRequest("json", UpdateBmhpTargetAdjustmentBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.updateVerifyPlanning(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.put(
      "/verifications/target-input",
      this.validateRequest("json", UpdateTargetInputBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.updateTargetInput(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * post /verifications/status approve/reject all planning data
     * body {
     * program_plan_id: number
     * status: number 0=reject, 1=approve
     * }
     */
    router.post(
      "/verifications/status",
      this.validateRequest("json", BulkUpdateVerificationStatusBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.bulkUpdateVerificationStatus(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * put /verifications/status approve/reject specific planning data
     * body {
     * program_plan_id: number
     * target_group_id: number
     * entity_id: number
     * status: boolean (true=approve, false=reject)
     * }
     */

    router.put(
      "/verifications/status",
      this.validateRequest("json", UpdateVerificationStatusBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.updateVerificationStatus(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * POST /verifications/revision
     * Set the program plan's approval status to revision (2)
     */
    router.post(
      "/verifications/revision",
      this.validateRequest("json", RevisionProgramPlanBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.revisionProgramPlan(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }
}
