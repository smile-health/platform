import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpPlanningPopulationModule } from "./bmhp-planning-population.module.js"
import { PopulateCalculateQuerySchema } from "./bmhp-planning-population.schema.js"

export class BmhpPlanningPopulationController extends BaseController {
  constructor(private readonly module: BmhpPlanningPopulationModule) {
    super("bmhp-planning-populations")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", PopulateCalculateQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getPopulateCalculate(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
