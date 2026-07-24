import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { PriorityAreasMiddleware } from "./priority-areas.middleware.js"
import { PriorityAreasModule } from "./priority-areas.module.js"
import {
  CreatePriorityAreaSchema,
  PriorityAreasQuerySchema,
  UpdatePriorityAreaParamsSchema,
  UpdatePriorityAreaSchema,
  UpdateRankingsSchema,
} from "./priority-areas.schema.js"

export class PriorityAreasController extends BaseController {
  constructor(
    private readonly module: PriorityAreasModule,
    private readonly middleware: PriorityAreasMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", PriorityAreasQuerySchema),
      async (c) => {
        const { village_id, previous_year } = c.req.valid("query")
        const result = await this.module.getPriorityAreas(
          c,
          village_id,
          previous_year
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    router.get("/rankings", async (c) => {
      const result = await this.module.getRankings(c)
      return c.json(result, StatusCodes.OK)
    })

    router.get("/summary", async (c) => {
      const result = await this.module.getSummary(c)
      return c.json(result, StatusCodes.OK)
    })

    router.post(
      "/",
      this.validateRequest(
        "json",
        CreatePriorityAreaSchema,
        this.middleware.validateCreate
      ),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.create(c, body)
        return c.json(result, StatusCodes.CREATED)
      }
    )

    router.put(
      "/rankings",
      this.validateRequest(
        "json",
        UpdateRankingsSchema,
        this.middleware.validateUpdateRankings
      ),
      async (c) => {
        const body = c.req.valid("json")
        const resp = await this.module.updateRankings(c, body)
        return c.json(resp, StatusCodes.OK)
      }
    )

    router.put(
      "/:id",
      this.validateRequest("param", UpdatePriorityAreaParamsSchema),
      this.validateRequest(
        "json",
        UpdatePriorityAreaSchema,
        this.middleware.validateUpdate
      ),
      async (c) => {
        const { id } = c.req.valid("param")
        const body = c.req.valid("json")
        const result = await this.module.update(c, id, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }
}
