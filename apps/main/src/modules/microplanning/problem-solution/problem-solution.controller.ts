import { BaseController } from "@/modules/base.controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ProblemSolutionMiddleware } from "./problem-solution.middleware.js"
import { ProblemSolutionModule } from "./problem-solution.module.js"
import {
  CreateProblemSolutionSchema,
  DeleteSolutionParamsSchema,
  ProblemSolutionQuerySchema,
  UpdateProblemSolutionParamsSchema,
  UpdateProblemSolutionSchema,
  VillageSolutionsQuerySchema,
} from "./problem-solution.schema.js"

export class ProblemSolutionController extends BaseController {
  constructor(
    private readonly module: ProblemSolutionModule,
    private readonly middleware: ProblemSolutionMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    // GET / - List all villages with solution counts
    router.get(
      "/",
      this.validateRequest("query", ProblemSolutionQuerySchema),
      async (c) => {
        const { village_id, keyword } = c.req.valid("query")
        const result = await this.module.getVillagesWithCounts(c, village_id, keyword)
        return c.json(result, StatusCodes.OK)
      }
    )

    // GET /summary - Get summary of problem solutions
    router.get("/summary", async (c) => {
      const result = await this.module.getSummary(c)
      return c.json(result, StatusCodes.OK)
    })

    // GET /village/:village_id/solutions - Get solutions for a specific village
    router.get(
      "/village/:village_id/solutions",
      this.validateRequest("query", VillageSolutionsQuerySchema),
      async (c) => {
        const villageId = Number(c.req.param("village_id"))
        const { problem_type_id } = c.req.valid("query")
        await this.middleware.validateVillageExists(c, villageId)
        const result = await this.module.getVillageSolutionsDetail(
          c,
          villageId,
          problem_type_id
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    // POST / - Create solution
    router.post(
      "/",
      this.validateRequest("json", CreateProblemSolutionSchema),
      async (c) => {
        const body = c.req.valid("json")
        await this.middleware.validateCreate(c, body)
        const result = await this.module.create(c, body)
        return c.json(result, StatusCodes.CREATED)
      }
    )

    // PUT /solution/:id - Update solution
    router.put(
      "/solution/:id",
      this.validateRequest("param", UpdateProblemSolutionParamsSchema),
      this.validateRequest("json", UpdateProblemSolutionSchema),
      async (c) => {
        const { id } = c.req.valid("param")
        const body = c.req.valid("json")
        await this.middleware.validateUpdate(c, body)
        const result = await this.module.update(c, id, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    // DELETE /solution/:id - Delete solution
    router.delete(
      "/solution/:id",
      this.validateRequest("param", DeleteSolutionParamsSchema),
      async (c) => {
        const { id } = c.req.valid("param")
        const result = await this.module.delete(c, id)
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }
}
