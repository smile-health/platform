import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpExaminationTargetGroupMiddleware } from "./bmhp-examination-target-groups.middleware.js"
import { BmhpExaminationTargetGroupModule } from "./bmhp-examination-target-groups.module.js"
import {
  CreateBmhpExaminationTargetGroupRequestSchema,
  GetBmhpExaminationTargetGroupsQueriesSchema,
} from "./bmhp-examination-target-groups.schema.js"

export class BmhpExaminationTargetGroupController extends BaseController {
  constructor(
    private readonly module: BmhpExaminationTargetGroupModule,
    private readonly middleware: BmhpExaminationTargetGroupMiddleware
  ) {
    super("bmhp-examination-target-groups")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Examination Target Groups with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpExaminationTargetGroupsQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Examination Target Group (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpExaminationTargetGroupSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Bulk create/update BMHP Examination Target Groups (MUST be before /:id routes)
    router.post(
      "/bulk",
      this.validateRequest(
        "json",
        this.middleware.bulkCreateBmhpExaminationTargetGroupsSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.bulkCreate(c, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get BMHP Examination Target Group by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get target groups by examination ID
    router.get(
      "/examination/:examinationId",
      this.validateRequest("param", IdParamsSchema.extend({
        examinationId: IdParamsSchema.shape.id
      })),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.listByExaminationId(c, param.examinationId)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Examination Target Group
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
