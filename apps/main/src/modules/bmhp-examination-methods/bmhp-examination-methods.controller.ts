import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { z } from "zod"
import { BmhpExaminationMethodMiddleware } from "./bmhp-examination-methods.middleware.js"
import { BmhpExaminationMethodModule } from "./bmhp-examination-methods.module.js"
import {
  GetBmhpExaminationMethodsQueriesSchema,
  GetWsBmhpExaminationMethodsQueriesSchema,
} from "./bmhp-examination-methods.schema.js"

// Custom ID schema for workspace routes
const WorkspaceIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a number")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID must be positive"),
})

export class BmhpExaminationMethodController extends BaseController {
  constructor(
    private readonly module: BmhpExaminationMethodModule,
    private readonly middleware: BmhpExaminationMethodMiddleware
  ) {
    super("bmhp-examination-methods")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Examination Methods with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpExaminationMethodsQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Examination Method (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpExaminationMethodSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Get BMHP Examination Method by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Examination Method
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpExaminationMethodSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Examination Method (soft delete)
    router.delete(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.delete(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get Examination Methods by Examination ID
    router.get(
      "/by-examination/:examinationId",
      async (c) => {
        const examinationId = parseInt(c.req.param("examinationId"))
        const response = await this.module.getMethodsByExamination(c, examinationId)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Workspace Examination Methods Routes

    // List all Workspace BMHP Examination Methods with pagination and filters
    router.get(
      "/workspace",
      this.validateRequest("query", GetWsBmhpExaminationMethodsQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.wsList(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new Workspace BMHP Examination Method
    router.post(
      "/workspace",
      this.validateRequest(
        "json",
        this.middleware.createWsBmhpExaminationMethodSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.wsCreate(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Get Workspace BMHP Examination Method by ID
    router.get(
      "/workspace/:id",
      this.validateRequest("param", WorkspaceIdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.wsDetail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update Workspace BMHP Examination Method
    router.put(
      "/workspace/:id",
      this.validateRequest("param", WorkspaceIdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateWsBmhpExaminationMethodSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.wsUpdate(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete Workspace BMHP Examination Method
    router.delete(
      "/workspace/:id",
      this.validateRequest("param", WorkspaceIdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.wsDelete(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
