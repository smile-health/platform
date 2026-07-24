import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { OsrmRouteModule } from "./osrm-route.module.js"
import { GetOsrmRouteQuerySchema } from "./osrm-route.schema.js"

export class OsrmRouteController extends BaseController {
  constructor(private readonly module: OsrmRouteModule) {
    super("osrm_route")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", GetOsrmRouteQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const result = await this.module.route({ query })
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }
}
