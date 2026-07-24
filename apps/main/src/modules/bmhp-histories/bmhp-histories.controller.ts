import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpHistoryMiddleware } from "./bmhp-histories.middleware.js"
import { BmhpHistoryModule } from "./bmhp-histories.module.js"
import { GetBmhpHistoryQueriesSchema } from "./bmhp-histories.schema.js"

export class BmhpHistoryController extends BaseController {
  constructor(
    private readonly module: BmhpHistoryModule,
    private readonly middleware: BmhpHistoryMiddleware
  ) {
    super("bmhp-histories")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Histories with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpHistoryQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Export BMHP History to Excel
    router.get(
      "/xls",
      this.validateRequest("query", GetBmhpHistoryQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.exportList(c, query)

        const base64 = Buffer.from(response.buffer).toString("base64")

        return c.json({
          filename: response.filename,
          base64: base64,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      }
    )

    // Get BMHP History by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP History (soft delete)
    router.delete(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.delete(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
