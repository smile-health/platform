import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { NonBiasImmunizationLogisticsModule } from "./non-bias-immunization-logistics.module.js"
import {
  DataCheckerQuerySchema,
  NonBiasCalculateDetailQuerySchema,
  RecalculateFullVillageSchema,
  RecalculateVillageEstimationSchema,
  SaveNonBiasImmunizationLogisticsSchema,
  SaveVillageImmunizationAchievementSchema,
  UpdateNonBiasImmunizationLogisticsSchema,
  XlsAreaQuerySchema,
} from "./non-bias-immunization-logistics.schema.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { TransactionMiddleware } from "@smile-health/lib/middlewares/transaction.middleware.js"

export class NonBiasImmunizationLogisticsController extends BaseController {
  constructor(
    private readonly module: NonBiasImmunizationLogisticsModule,
    private readonly trxMiddleware: TransactionMiddleware<DB>
  ) {
    super()
  }

  readonly #getSubDistrictId = (c: any) =>
    Number(c.var.userEntity?.sub_district_id || 0)

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/calculate-detail",
      this.validateRequest("query", NonBiasCalculateDetailQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const result = await this.module.getCalculateDetail(c, query)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.get(
      "/xls",
      async (c) => {
        const subDistrictId = this.#getSubDistrictId(c)
        const file = await this.module.exportAllVillagesCalculateDetail(c, subDistrictId)

        const base64 = Buffer.from(file.buffer).toString("base64")

        return c.json(
          {
            filename: file.filename,
            base64,
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          StatusCodes.OK
        )
      }
    )

    router.post(
      "/calculate-immunization-data",
      this.validateRequest("json", SaveVillageImmunizationAchievementSchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.saveVillageImmunizationData(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.post(
      "/recalculate-estimation",
      this.validateRequest("json", RecalculateVillageEstimationSchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.recalculateVillageEstimation(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.post(
      "/recalculate-ip-rate",
      this.validateRequest("json", RecalculateFullVillageSchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.recalculateIpRate(c, body)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.post(
      "/save-logistics-data",
      this.trxMiddleware.handle,
      this.validateRequest("json", SaveNonBiasImmunizationLogisticsSchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.saveNonBiasImmunizationLogistics(
          c,
          body
        )
        return c.json(result, StatusCodes.CREATED)
      }
    )

    router.get(
      "/menu-checker",
      this.validateRequest("query", DataCheckerQuerySchema),
      async (c) => {
        const { keyword } = c.req.valid("query")
        const result = await this.module.getDataChecker(
          c,
          this.#getSubDistrictId(c),
          keyword
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    router.put(
      "/:village_id",
      this.trxMiddleware.handle,
      this.validateRequest("json", UpdateNonBiasImmunizationLogisticsSchema),
      async (c) => {
        const villageId = Number(c.req.param("village_id"))
        const body = c.req.valid("json")
        const result = await this.module.updateNonBiasImmunizationLogistics(
          c,
          villageId,
          body
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    return router
  }

  getPublicRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/xls-area",
      this.validateRequest("query", XlsAreaQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const file = await this.module.exportDistrictCalculateDetail(c, query)

        c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        c.header("Content-Disposition", `attachment; filename="${file.filename}"`)
        return c.body(file.buffer as ArrayBuffer, StatusCodes.OK)
      }
    )

    return router
  }
}
