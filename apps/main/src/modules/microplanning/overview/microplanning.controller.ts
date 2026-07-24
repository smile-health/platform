import { BaseController } from "@smile/lib/base/controller.js"
import { Context, Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { MicroplanningModule } from "./microplanning.module.js"
import {
  MicroplanningConfigQuerySchema,
  MicroplanningSchoolsQuerySchema,
  MicroplanningStepsQuerySchema,
} from "./microplanning.schema.js"

export class MicroplanningController extends BaseController {
  constructor(private readonly module: MicroplanningModule) {
    super()
  }

  readonly #getSubDistrictId = (c: Context) =>
    Number(c.var.userEntity?.sub_district_id || 0)

  readonly #getEntityId = (c: Context) => Number(c.var.userEntity?.id)

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/steps",
      this.validateRequest("query", MicroplanningStepsQuerySchema),
      async (c) => {
        const { category } = c.req.valid("query")
        const result = await this.module.getMicroplanningSteps(
          c,
          this.#getSubDistrictId(c),
          this.#getEntityId(c),
          category
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    router.post("/submit", async (c) => {
      const result = await this.module.submitMicroplanning(
        c,
        this.#getSubDistrictId(c),
        this.#getEntityId(c)
      )
      return c.json(result, StatusCodes.OK)
    })

    router.get(
      "/config",
      this.validateRequest("query", MicroplanningConfigQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const res = await this.module.listMicroplanningConfig(c, query)
        return c.json(res, StatusCodes.OK)
      }
    )

    router.get(
      "/schools",
      this.validateRequest("query", MicroplanningSchoolsQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const res = await this.module.listSchools(c, query)
        return c.json(res, StatusCodes.OK)
      }
    )

    router.get("/target-and-risk", async (c) => {
      const result = await this.module.getSummaryTargetAndRisk(c)
      return c.json(result, StatusCodes.OK)
    })

    router.get("/years", async (c) => {
      const result = await this.module.listMicroplanningYears(
        c,
        this.#getEntityId(c)
      )
      return c.json(result, StatusCodes.OK)
    })

    return router
  }
}
