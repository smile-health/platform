import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { WsPlanTargetGroupModule } from "./ws-plan-target-group.module.js"
import {
  BulkCreateWsPlanTargetGroupRequestSchema,
  ListWsPlanTargetGroupQueriesSchema,
  VerifyPlanQueriesSchema,
} from "./ws-plan-target-group.schema.js"

export class WsPlanTargetGroupController extends BaseController {
  constructor(private readonly module: WsPlanTargetGroupModule) {
    super("ws-plan-target-groups")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", ListWsPlanTargetGroupQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/verify",
      this.validateRequest("query", VerifyPlanQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.verifyPlan(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/",
      this.validateRequest("json", BulkCreateWsPlanTargetGroupRequestSchema),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.bulkCreate(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.delete(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.delete(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
