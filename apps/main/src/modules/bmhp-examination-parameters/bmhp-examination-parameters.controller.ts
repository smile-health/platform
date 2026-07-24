import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpExaminationParameterMiddleware } from "./bmhp-examination-parameters.middleware.js"
import { BmhpExaminationParameterModule } from "./bmhp-examination-parameters.module.js"
import {
  CreateBmhpExaminationParameterRequestSchema,
  GetBmhpExaminationParametersQueriesSchema,
} from "./bmhp-examination-parameters.schema.js"

export class BmhpExaminationParameterController extends BaseController {
  constructor(
    private readonly module: BmhpExaminationParameterModule,
    private readonly middleware: BmhpExaminationParameterMiddleware
  ) {
    super("bmhp-examination-parameters")
  }

  // Public routes (all routes - no authentication required)
  getPublicRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Examination Parameters with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpExaminationParametersQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Examination Parameter (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpExaminationParameterSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Bulk create/update BMHP Examination Parameters (MUST be before /:id routes)
    router.post(
      "/bulk",
      this.validateRequest(
        "json",
        this.middleware.bulkCreateBmhpExaminationParametersSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.bulkCreate(c, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get BMHP Examination Parameter by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get parameters by examination ID
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

    // Update BMHP Examination Parameter
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpExaminationParameterSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Examination Parameter
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

  getRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Examination Parameters with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpExaminationParametersQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Examination Parameter (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpExaminationParameterSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Bulk create/update BMHP Examination Parameters (MUST be before /:id routes)
    router.post(
      "/bulk",
      this.validateRequest(
        "json",
        this.middleware.bulkCreateBmhpExaminationParametersSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.bulkCreate(c, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get BMHP Examination Parameter by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get parameters by examination ID
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

    // Update BMHP Examination Parameter
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpExaminationParameterSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Examination Parameter
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
