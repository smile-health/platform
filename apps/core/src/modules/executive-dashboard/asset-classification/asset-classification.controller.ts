import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExecutiveAssetClassificationModule } from "./asset-classification.module.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

export class ExecutiveAssetClassificationController extends BaseController {
  constructor(private readonly module: ExecutiveAssetClassificationModule) {
    super("executive-asset-classification")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", PaginationQueriesSchema),
      async (c) => {
        const queryParam = c.req.valid("query")
        const response = await this.module.list(c, queryParam)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
