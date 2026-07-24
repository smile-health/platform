import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExecutiveMaterialTypeModule } from "./material-type.module.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate.js"

export class ExecutiveMaterialTypeController extends BaseController {
  constructor(private readonly module: ExecutiveMaterialTypeModule) {
    super("executive-material-type")
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
