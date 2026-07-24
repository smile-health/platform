import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExcelMiddleware } from "@smile/lib/middlewares/index.js"
import { BmhpApprovalModule } from "./bmhp-approval.module.js"
import {
  GetApprovalListQuerySchema,
  ReviewProgramPlanBodySchema,
  GetApprovalDetailParamSchema,
  GetProvinceApprovalListQuerySchema,
  UpdateProvinceApprovalBodySchema,
  UpdateProvinceApprovalParamSchema,
  SubmitProvinceApprovalBodySchema,
  ExportRegencyXlsParamSchema,
  ExportRegencyXlsQuerySchema,
  GetEntityQuerySchema,
  UpsertSignatureBodySchema,
} from "./bmhp-approval.schema.js"
import { BaseController } from "@smile/lib/base/controller.js"

export class BmhpApprovalController extends BaseController {
  constructor(
    private readonly module: BmhpApprovalModule,
    private readonly excelMiddleware: ExcelMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/entities",
      this.validateRequest("query", GetEntityQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listEntity(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/",
      this.validateRequest("query", GetApprovalListQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listApproval(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /bmhp-approval/:program_plan_id
     * Returns the approval program plan detail for a given program plan id.
     */
    router.get(
      "/review/:program_plan_id",
      this.validateRequest("param", GetApprovalDetailParamSchema),
      async (c) => {
        const params = c.req.valid("param")
        const response = await this.module.getDetail(c, params)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * POST /bmhp-approval/review
     * Sets ws_program_plans.approval_status = REVISION (2) and persists notes.
     * All ws_bmhp_planning records linked to the program plan are also set to REVISION.
     */
    router.post(
      "/review",
      this.validateRequest("json", ReviewProgramPlanBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.reviewProgramPlan(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * GET /province
     * Returns a list of city health offices under the province.
     */
    router.get(
      "/province",
      this.validateRequest("query", GetProvinceApprovalListQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listProvinceApproval(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /**
     * GET /province/xls
     * Exports the province approval list to Excel.
     */
    router.get(
      "/province/xls",
      this.validateRequest("query", GetProvinceApprovalListQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportProvinceApprovalXls(c, query)
        const base64 = Buffer.from(
          response.buffer as unknown as ArrayBuffer
        ).toString("base64")
        return c.json(
          {
            filename: response.filename,
            base64,
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          StatusCodes.OK
        )
      }
    )

    /**
     * POST /province/:id
     * Updates the approval status for a city's program plan.
     */
    router.post(
      "/province/:id",
      this.validateRequest("param", UpdateProvinceApprovalParamSchema),
      this.validateRequest("json", UpdateProvinceApprovalBodySchema),
      async (c) => {
        const { id } = c.req.valid("param")
        const body = c.req.valid("json")
        const result = await this.module.updateProvinceApproval(c, id, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * POST /province-submit
     * Submit province approval to Ministry of Health
     */
    router.post(
      "/province-submit",
      this.validateRequest("json", SubmitProvinceApprovalBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.submitProvince(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * GET /province/xls/:regency_id
     * Export regency approval details as Excel with 4 workspaces.
     */
    router.get(
      "/province/xls/:regency_id",
      this.validateRequest("param", ExportRegencyXlsParamSchema),
      this.validateRequest("query", ExportRegencyXlsQuerySchema),
      async (c) => {
        const param = c.req.valid("param")
        const query = c.req.valid("query")
        const file = await this.module.exportRegencyDetailXls(
          c,
          param.regency_id,
          query.program_plan_id
        )
        const base64 = Buffer.from(
          file.buffer as unknown as ArrayBuffer
        ).toString("base64")
        return c.json(
          {
            filename: file.filename,
            base64,
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          StatusCodes.OK
        )
      }
    )

    router.get("/province/get-regency/:id", async (c) => {
      const id = Number(c.req.param("id"))
      const response = await this.module.getEntityWithRegency(c, id)
      return c.json(response, StatusCodes.OK)
    })

    /**
     * GET /signature
     * Get signature data for the logged in user
     */
    router.get("/signature", async (c) => {
      const response = await this.module.getSignature(c)
      return c.json(response, StatusCodes.OK)
    })

    /**
     * POST /signature
     * Upsert signature data for the logged in user
     */
    router.post(
      "/signature",
      this.validateRequest("json", UpsertSignatureBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.upsertSignature(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }
}
