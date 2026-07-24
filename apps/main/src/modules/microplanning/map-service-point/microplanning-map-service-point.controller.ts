import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { MicroplanningMapServicePointModule } from "./microplanning-map-service-point.module.js"
import { SubmitMicroplanningMapServicePointSchema } from "./microplanning-map-service-point.schema.js"

import { MicroplanningMapServicePointMiddleware } from "./microplanning-map-service-point.middleware.js"
export class MicroplanningMapServicePointController extends BaseController {
  constructor(
    private readonly module: MicroplanningMapServicePointModule,
    private readonly middleware: MicroplanningMapServicePointMiddleware
  ) {
    super("ws_map_service_points")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get("/", async (c) => {
      const result = await this.module.data({ context: c })
      return c.json(result, StatusCodes.OK)
    })

    router.post(
      "/",
      this.validateRequest("json", SubmitMicroplanningMapServicePointSchema),
      this.middleware.submit,
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.submit({ context: c, body })
        return c.json(result, StatusCodes.CREATED)
      }
    )

    router.delete("/", this.middleware.detail, async (c) => {
      await this.module.delete({ context: c })
      return c.body(null, StatusCodes.NO_CONTENT)
    })

    return router
  }
}
