import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpTargetGroupMiddleware } from "./bmhp-target-groups.middleware.js"
import { BmhpTargetGroupModule } from "./bmhp-target-groups.module.js"
import {
  CreateBmhpTargetGroupRequestSchema,
  GetBmhpTargetGroupsQueriesSchema,
  UpdateBmhpTargetGroupStatusRequestSchema,
} from "./bmhp-target-groups.schema.js"

export class BmhpTargetGroupController extends BaseController {
  constructor(
    private readonly module: BmhpTargetGroupModule,
    private readonly middleware: BmhpTargetGroupMiddleware
  ) {
    super("bmhp-target-groups")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Target Groups with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpTargetGroupsQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Target Group (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpTargetGroupSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Get BMHP Target Group by ID with examinations
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Target Group status (MUST be before /:id route)
    router.put(
      "/:id/status",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest("json", UpdateBmhpTargetGroupStatusRequestSchema),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.updateStatus(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Target Group
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpTargetGroupSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Target Group (soft delete)
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
