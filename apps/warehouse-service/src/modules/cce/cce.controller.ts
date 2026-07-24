import { Hono } from "hono"
import { CceModule } from "./cce.module.js"
import { StatusCodes } from "http-status-codes"
import { BaseController } from "@smile/lib/base/controller.js"
import { CceQueryParams, CceQueryParamsSchema } from "./cce.schema.js"
import { AnnualModule } from "./annual/annual.module.js"
import {
  AnnualQueryParams,
  AnnualQueryParamsSchema,
} from "./annual/annual.schema.js"
import { MaterialModule } from "./material/material.module.js"
import {
  MaterialQueryParams,
  MaterialQueryParamsSchema,
} from "./material/material.schema.js"

export class CceController extends BaseController {
  constructor(
    private readonly module: CceModule,
    private readonly annualModule: AnnualModule,
    private readonly materialModule: MaterialModule
  ) {
    super("cce")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/overview/aggregate-capacity-report",
      this.validateRequest("query", CceQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as CceQueryParams
        const response = await this.module.getAggregateCapacityReport(
          c,
          queryParams
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/export/entity-by-capacity-status",
      this.validateRequest("query", CceQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as CceQueryParams
        const file = await this.module.exportEntityByCapacityStatus(c, queryParams)
        return this.downloadExcel(c, file)
      }
    )

    router.get(
      "/annual",
      this.validateRequest("query", AnnualQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as AnnualQueryParams
        const response = await this.annualModule.getAnnualDashboardData(
          c,
          queryParams
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/material",
      this.validateRequest("query", MaterialQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as MaterialQueryParams
        const response = await this.materialModule.getMaterialReport(
          c,
          queryParams
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    // Material report export endpoints
    router.get(
      "/export/material/function-status",
      this.validateRequest("query", MaterialQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as MaterialQueryParams
        const response = await this.materialModule.getMaterialReport(
          c,
          queryParams
        )
        const file = await this.materialModule.exportFunctionStatus(c, response.function_status.data)
        return this.downloadExcel(c, file)
      }
    )

    router.get(
      "/export/material/capacity-remaining",
      this.validateRequest("query", MaterialQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as MaterialQueryParams
        const response = await this.materialModule.getMaterialReport(
          c,
          queryParams
        )
        const file = await this.materialModule.exportCapacityRemaining(c, response.capacity_remaining.data)
        return this.downloadExcel(c, file)
      }
    )

    router.get(
      "/export/material/aggregate-capacity-remaining",
      this.validateRequest("query", MaterialQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as MaterialQueryParams
        const response = await this.materialModule.getMaterialReport(
          c,
          queryParams
        )
        const file = await this.materialModule.exportAggregateCapacityRemaining(c, response.aggregate_capacity_remaining)
        return this.downloadExcel(c, file)
      }
    )

    // Annual dashboard export endpoints
    router.get(
      "/export/annual/facility-total",
      this.validateRequest("query", AnnualQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as AnnualQueryParams
        const file = await this.annualModule.exportFacilityTotal(c, queryParams)
        return this.downloadExcel(c, file)
      }
    )

    router.get(
      "/export/annual/facility-percentage",
      this.validateRequest("query", AnnualQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query") as AnnualQueryParams
        const file = await this.annualModule.exportFacilityPercentage(c, queryParams)
        return this.downloadExcel(c, file)
      }
    )

    return router
  }
}
