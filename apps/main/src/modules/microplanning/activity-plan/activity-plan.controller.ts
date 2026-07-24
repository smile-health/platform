import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ActivityPlanMiddleware } from "./activity-plan.middleware.js"
import { ActivityPlanModule } from "./activity-plan.module.js"
import {
  CreateActivityPlanSchema,
  UpdateActivityPlanParamsSchema,
  UpdateActivityPlanSchema,
} from "./activity-plan.schema.js"

export class ActivityPlanController extends BaseController {
  constructor(
    private readonly module: ActivityPlanModule,
    private readonly middleware: ActivityPlanMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    // GET / - List all activity plans
    router.get("/", async (c) => {
      const result = await this.module.getActivityPlans(c)
      return c.json(result, StatusCodes.OK)
    })

    // GET /summary - Get summary
    router.get("/summary", async (c) => {
      const result = await this.module.getSummary(c)
      return c.json(result, StatusCodes.OK)
    })

    // GET /:id - Get detail
    router.get("/:id", async (c) => {
      const id = Number(c.req.param("id"))
      const result = await this.module.getActivityPlanDetail(c, id)
      return c.json(result, StatusCodes.OK)
    })

    // POST / - Create activity plan
    router.post(
      "/",
      this.validateRequest(
        "json",
        CreateActivityPlanSchema,
        this.middleware.validateCreate
      ),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.createActivityPlan(c, body)
        return c.json(result, StatusCodes.CREATED)
      }
    )

    // PUT /:id - Update activity plan
    router.put(
      "/:id",
      this.validateRequest("param", UpdateActivityPlanParamsSchema),
      this.validateRequest(
        "json",
        UpdateActivityPlanSchema,
        this.middleware.validateUpdate
      ),
      async (c) => {
        const { id } = c.req.valid("param")
        const body = c.req.valid("json")
        const result = await this.module.updateActivityPlan(c, id, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    // DELETE /:id - Delete activity plan
    router.delete(
      "/:id",
      this.validateRequest(
        "param",
        UpdateActivityPlanParamsSchema,
        this.middleware.validateDelete
      ),

      async (c) => {
        const { id } = c.req.valid("param")
        const result = await this.module.deleteActivityPlan(c, id)
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }
}
