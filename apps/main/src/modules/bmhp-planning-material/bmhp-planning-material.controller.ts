import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpPlanningMaterialMiddleware } from "./bmhp-planning-material.middleware.js"
import { BmhpPlanningMaterialModule } from "./bmhp-planning-material.module.js"
import {
  CreateBmhpMaterialDetailRequestSchema,
  GetBmhpPlanningMaterialsQueriesSchema,
  GetMaterialQueriesSchema,
  GetProductVariantQueriesSchema,
  UpdateBmhpMaterialStatusRequestSchema,
  UpdateProductVariantRequestSchema,
} from "./bmhp-planning-material.schema.js"

export class BmhpPlanningMaterialController extends BaseController {
  constructor(
    private readonly module: BmhpPlanningMaterialModule,
    private readonly middleware: BmhpPlanningMaterialMiddleware,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("bmhp-planning-materials")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // ==================== BMHP Material Routes ====================

    router.get(
      "/variant-material",
      this.validateRequest("query", this.middleware.getVariantSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getVariant(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/variant",
      this.validateRequest("query", GetProductVariantQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listProductVariant(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/variant",
      this.validateRequest("json", this.middleware.createProductVariantSchema),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.createProductVariant(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.put(
      "/variant/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest("json", UpdateProductVariantRequestSchema),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.updateProductVariant(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/variant/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detailProductVariant(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.delete(
      "/variant/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.deleteProductVariant(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/material",
      this.validateRequest("query", GetMaterialQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.listMaterial(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // List all BMHP Materials with pagination and filters
    router.get(
      "/",
      this.validateRequest("query", GetBmhpPlanningMaterialsQueriesSchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Create new BMHP Material (MUST be before /:id routes)
    router.post(
      "/",
      this.validateRequest(
        "json",
        this.middleware.createBmhpMaterialSchema
      ),
      async (c) => {
        const request = c.req.valid("json")
        const response = await this.module.create(c, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Get BMHP Material by ID with details
    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Material status (MUST be before /:id routes)
    router.put(
      "/:id/status",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest("json", UpdateBmhpMaterialStatusRequestSchema),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.updateStatus(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Update BMHP Material
    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest(
        "json",
        this.middleware.updateBmhpMaterialSchema
      ),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.update(c, param.id, request)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Delete BMHP Material (soft delete)
    router.delete(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.delete(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // ==================== BMHP Material Detail Routes ====================

    // Get material details for a BMHP Material
    router.get(
      "/:id/material-details",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.listMaterialDetails(c, param.id)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Add material detail to BMHP Material
    router.post(
      "/:id/material-details",
      this.validateRequest("param", IdParamsSchema),
      this.validateRequest("json", CreateBmhpMaterialDetailRequestSchema),
      async (c) => {
        const param = c.req.valid("param")
        const request = c.req.valid("json")
        const response = await this.module.addMaterialDetail(c, param.id, request)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    // Remove material detail from BMHP Material
    router.delete(
      "/:id/material-details/:materialId",
      this.validateRequest("param", IdParamsSchema.extend({
        materialId: IdParamsSchema.shape.id
      })),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.removeMaterialDetail(
          c,
          param.id,
          param.materialId
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
