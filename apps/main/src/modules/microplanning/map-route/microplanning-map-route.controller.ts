import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { MicroplanningMapRouteModule } from "./microplanning-map-route.module.js"
import { SubmitMicroplanningMapRouteSchema } from "./microplanning-map-route.schema.js"

import { MicroplanningMapRouteMiddleware } from "./microplanning-map-route.middleware.js"
export class MicroplanningMapRouteController extends BaseController {
  constructor(
    private readonly module: MicroplanningMapRouteModule,
    private readonly middleware: MicroplanningMapRouteMiddleware
  ) {
    super("ws_map_routes")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get("/", this.middleware.createResolvedServicePoint, async (c) => {
      const result = await this.module.detail({ context: c })
      if (!result.data) {
        return c.body(null, StatusCodes.NOT_FOUND)
      }
      return c.json(result, StatusCodes.OK)
    })

    router.post(
      "/",
      this.validateRequest("json", SubmitMicroplanningMapRouteSchema),
      this.middleware.createResolvedServicePoint,
      this.middleware.submit,
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.create({ context: c, body })
        return c.json(result, StatusCodes.CREATED)
      }
    )

    router.delete(
      "/",
      this.middleware.createResolvedServicePoint,
      this.middleware.delete,
      async (c) => {
        await this.module.delete({ context: c })
        return c.body(null, StatusCodes.NO_CONTENT)
      }
    )

    return router
  }
}
