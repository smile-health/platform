import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpMaterialsUnitDetailsModule } from "./bmhp-materials-unit-details.module.js"
import {
  ByMaterialQuerySchema,
  ByVariantQuerySchema,
  CalculateLabConsumptionRequestSchema,
  CreateBmhpMaterialsUnitDetailRequestSchema,
  GetBmhpMaterialsUnitDetailsQueriesSchema,
  GetVariantDetailsQueriesSchema,
  UpdateBmhpMaterialsUnitDetailRequestSchema,
} from "./bmhp-materials-unit-details.schema.js"

export class BmhpMaterialsUnitDetailsController extends BaseController {
  constructor(
    private readonly module: BmhpMaterialsUnitDetailsModule
  ) {
    super("bmhp-materials-unit-details")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // List all BMHP Materials Unit Details with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpMaterialsUnitDetailsQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Materials Unit Detail
    router.post(
      "/",
      this.validateRequest("json", CreateBmhpMaterialsUnitDetailRequestSchema),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Static routes MUST be before dynamic routes (/:id)
    // Get unit details by parent material ID (query param version)
    router.get(
      "/by-template",
      this.validateRequest("query", ByMaterialQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listByParentMaterialId(c, query.template_id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get material unit detail by child material ID
    router.get(
      "/by-variant",
      this.validateRequest("query", ByVariantQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listByChildMaterialId(c, query.variant_id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Get unit details by parent material ID (path param version)
    router.get(
      "/parent/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.listByParentMaterialId(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Calculate lab consumption for target groups
    router.post(
      "/calculate-lab-consumption",
      this.validateRequest("json", CalculateLabConsumptionRequestSchema),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.calculateLabConsumption(c, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/variant/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest("query", GetVariantDetailsQueriesSchema),
      async (c) => {
        const param = c.req.valid("param")
        const query = c.req.valid("query")
        const response = await this.module.detailProductVariant(c, param.id, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Dynamic routes MUST be after static routes
    // Get BMHP Materials Unit Detail by ID
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Materials Unit Detail
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest("json", UpdateBmhpMaterialsUnitDetailRequestSchema),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Materials Unit Detail (soft delete)
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