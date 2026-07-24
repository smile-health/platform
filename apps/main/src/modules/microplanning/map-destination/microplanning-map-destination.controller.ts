import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { MicroplanningMapDestinationModule } from "./microplanning-map-destination.module.js"
import {
  SubmitMicroplanningMapDestinationSchema,
  MicroplanningMapDestinationIdSchema,
  MicroplanningMapDestinationListParamSchema,
} from "./microplanning-map-destination.schema.js"

import { MicroplanningMapDestinationMiddleware } from "./microplanning-map-destination.middleware.js"
export class MicroplanningMapDestinationController extends BaseController {
  constructor(
    private readonly module: MicroplanningMapDestinationModule,
    private readonly middleware: MicroplanningMapDestinationMiddleware
  ) {
    super("ws_map_destinations")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", MicroplanningMapDestinationListParamSchema),
      async (c) => {
        const params = c.req.valid("query")
        const result = await this.module.list({ context: c, params })
        return c.json(result, StatusCodes.OK)
      }
    )

    router.post(
      "/bulk",
      this.validateRequest("json", SubmitMicroplanningMapDestinationSchema),
      this.middleware.submit,
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.create({ context: c, body })
        return c.json(result, StatusCodes.CREATED)
      }
    )

    router.delete(
      "/:id",
      this.validateRequest("param", MicroplanningMapDestinationIdSchema),
      this.middleware.delete,
      async (c) => {
        const { id } = c.req.valid("param")
        await this.module.delete({ context: c, id })
        return c.body(null, StatusCodes.NO_CONTENT)
      }
    )

    return router
  }
}
