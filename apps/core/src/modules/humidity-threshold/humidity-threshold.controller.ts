import { Hono } from "hono"
import { BaseController } from "../base.controller"
import { HumidityThresholdModule } from "./humidity-threshold.module"
import { GetHumidityThresholdsQueryParamsSchema } from "./humidity-threshold.schema"
import { StatusCodes } from "http-status-codes"

export class HumidityThresholdController extends BaseController {
  constructor(private readonly module: HumidityThresholdModule) {
    super()
  }

  public getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", GetHumidityThresholdsQueryParamsSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}