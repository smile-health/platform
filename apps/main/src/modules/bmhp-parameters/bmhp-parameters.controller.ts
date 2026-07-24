import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpParameterMiddleware } from "./bmhp-parameters.middleware.js"
import { BmhpParameterModule } from "./bmhp-parameters.module.js"
import {
  CreateBmhpParameterRequestSchema,
  GetBmhpParametersQueriesSchema,
} from "./bmhp-parameters.schema.js"

export class BmhpParameterController extends BaseController {
  constructor(
    private readonly module: BmhpParameterModule,
    private readonly middleware: BmhpParameterMiddleware
  ) {
    super("bmhp-parameters")
  }

  // Public routes (all routes - no authentication required)
  getPublicRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Parameters with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpParametersQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Parameter (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpParameterSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Get BMHP Parameter by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Parameter
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpParameterSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Parameter (soft delete)
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

    // List all BMHP Parameters with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpParametersQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Parameter (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpParameterSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Get BMHP Parameter by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Parameter
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpParameterSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Parameter (soft delete)
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
