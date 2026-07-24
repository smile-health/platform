import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpApprovalMaterialNeedsModule } from "./bmhp-approval-material-needs.module.js"
import {
  CalculateMaterialNeedsBodySchema,
  GetMaterialNeedsQuerySchema,
} from "./bmhp-approval-material-needs.schema.js"

export class BmhpApprovalMaterialNeedsController extends BaseController {
  constructor(private readonly module: BmhpApprovalMaterialNeedsModule) {
    super("bmhp-approval-material-needs")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", GetMaterialNeedsQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/xls",
      this.validateRequest("query", GetMaterialNeedsQuerySchema),
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

    router.post(
      "/calculate",
      this.validateRequest("json", CalculateMaterialNeedsBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.calculate(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
