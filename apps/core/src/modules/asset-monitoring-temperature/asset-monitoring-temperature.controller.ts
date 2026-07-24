import { BaseController } from "@smile/lib/base/controller.js"
import { ExcelMiddleware } from "@smile/lib/middlewares"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { AssetMonitoringTemperatureMiddleware } from "./asset-monitoring-temperature.middleware.js"
import { AssetMonitoringTemperatureModule } from "./asset-monitoring-temperature.module.js"
import {
  GetAssetMonitoringTemperatureParamSchema,
  UpdateTemperatureRangeParamSchema,
} from "./asset-monitoring-temperature.schema.js"

export class AssetMonitoringTemperatureController extends BaseController {
  constructor(
    private readonly module: AssetMonitoringTemperatureModule,
    private readonly middleware: AssetMonitoringTemperatureMiddleware,
    private readonly excelMiddleware: ExcelMiddleware
  ) {
    super("asset_monitoring_temperature")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.post(
      "/v2/histories/push",
      this.validateRequest("json", this.middleware.pushTemperatureHistory),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.pushTemperatureHistory(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/warehouse/histories/push",
      this.validateRequest(
        "json",
        this.middleware.pushWarehouseTemperatureHistory
      ),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.pushTemperatureHistory(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.put(
      "/:id/temperature-range",
      this.validateRequest("param", UpdateTemperatureRangeParamSchema),
      this.validateRequest("json", this.middleware.update),
      async (c) => {
        const param = c.req.valid("param")
        const body = c.req.valid("json")
        const response = await this.module.updateTemperatureRange(
          c,
          Number(param.id),
          body
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/xls",
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const exporter = await this.module.exportAssetMonitoringTemperatureList(
          c,
          paramQuery
        )
        return this.downloadExcel(c, await exporter.generate())
      }
    )

    router.get(
      "/xls/async",
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const response =
          await this.module.exportAssetMonitoringTemperatureListAsync(
            c,
            paramQuery
          )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/",
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const response = await this.module.list(c, paramQuery)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/:id/history-charts",
      this.validateRequest("query", this.middleware.historyChartsByRtmdIdList),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const rtmdId = Number(c.req.param("id"))
        const response = await this.module.getTemperatureHistoryChartsByRtmdId(
          c,
          rtmdId,
          paramQuery
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/:id/history",
      this.validateRequest("query", this.middleware.historyByRtmdIdList),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const rtmdId = Number(c.req.param("id"))
        const response = await this.module.getTemperatureHistoryByRtmdId(
          c,
          rtmdId,
          paramQuery
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/:id/history/xls",
      this.validateRequest("query", this.middleware.historyByRtmdIdList),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const rtmdId = Number(c.req.param("id"))
        const exporter = await this.module.exportTemperatureHistoryByRtmdId(
          c,
          rtmdId,
          paramQuery
        )
        return this.downloadExcel(c, await exporter.generate())
      }
    )

    router.get(
      "/:id/history/xls/async",
      this.validateRequest("query", this.middleware.historyByRtmdIdList),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const rtmdId = Number(c.req.param("id"))
        const response =
          await this.module.exportTemperatureHistoryByRtmdIdAsync(
            c,
            rtmdId,
            paramQuery
          )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/:id",
      this.validateRequest("param", GetAssetMonitoringTemperatureParamSchema),
      this.middleware.detail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, Number(param.id))
        return c.json(response, StatusCodes.OK)
      }
    )

    router.put(
      "/:id/operational-status",
      this.validateRequest("param", UpdateTemperatureRangeParamSchema),
      this.validateRequest("json", this.middleware.updateOperationalStatus),
      async (c) => {
        const param = c.req.valid("param")
        const body = c.req.valid("json")
        await this.module.updateOperationalStatus(c, Number(param.id), body)
        return c.json(undefined, StatusCodes.NO_CONTENT)
      }
    )

    return router
  }
}
