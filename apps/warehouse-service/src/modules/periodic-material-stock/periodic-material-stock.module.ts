import { Context } from "hono"
import {
  PeriodicMaterialStockQueryParams,
  PeriodicMaterialStockResponse,
  PeriodicMaterialStockResponseSchema,
} from "./periodic-material-stock.schema.js"
import { PeriodicMaterialStockRepository } from "./periodic-material-stock.repository.js"
import { MaterialRepository } from "@/modules/material/material.repository.js"
import { EntityRepository } from "@/modules/entity/entity.repository.js"
import { applyQtyData } from "./periodic-material-stock.utils.js"
import moment from "moment"
import { PeriodicMaterialStockExcel } from "./periodic-material-stock.excel.js"
import { round } from "@smile-health/lib/utils.js"
import { BaseModule } from "../base.module.js"
import ExportHistoryRepository from "../export-history/export-history.repository.js"
import { Publisher } from "@smile-health/lib/rabbitmq/publisher.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { KFA_LEVEL_CODE } from "@/common/constants/material.js"
import { ActivityRepository } from "../activity/activity.repository.js"
import { ValidationError } from "@smile-health/lib/error.js"

export class PeriodicMaterialStockModule extends BaseModule {
  constructor(
    private readonly periodicMaterialStockRepository: PeriodicMaterialStockRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly entityRepository: EntityRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly periodicMaterialStockExcel: PeriodicMaterialStockExcel,
    protected readonly exportHistoryRepo: ExportHistoryRepository,
    protected readonly publisher: Publisher
  ) {
    super(exportHistoryRepo, publisher)
  }

  async getReport(
    c: Context,
    queryParams: PeriodicMaterialStockQueryParams
  ): Promise<PeriodicMaterialStockResponse> {
    if (!queryParams.entity_id) {
      throw new Error("Entity ID is required")
    }

    const { records: entities } = await this.entityRepository.fetchEntities(
      c,
      queryParams,
      { is_paginate: false }
    )

    const entityDetail = entities.find(
      (entity) => entity.id === queryParams.entity_id
    )

    if (!entityDetail) {
      throw new ValidationError(
        c.var.t("validator.entity_not_found_or_not_active")
      )
    }

    const { records: activities } =
      await this.activityRepository.fetchActivities(c, queryParams, {
        is_paginate: false,
      })

    const activityDetail = activities.find(
      (activity) => activity.id === queryParams.activity_id
    )

    const { records: materials } = await this.materialRepository.fetchMaterials(
      c,
      { ...queryParams, material_level_id: KFA_LEVEL_CODE.TEMPLATE },
      { is_paginate: false }
    )

    const countData =
      await this.periodicMaterialStockRepository.fetchMaterialCount(
        c,
        queryParams
      )

    const materialList = applyQtyData(
      queryParams,
      materials,
      countData,
      activityDetail
    )

    const lastUpdatedResult =
      await this.periodicMaterialStockRepository.fetchLastUpdated()
    const lastUpdated =
      lastUpdatedResult?.last_updated || moment().format("YYYY-MM-DD HH:mm:ss")

    const response: PeriodicMaterialStockResponse = {
      period: queryParams.period,
      province_name: entityDetail.province_name || "",
      regency_name: entityDetail.regency_name || "",
      entity_name: entityDetail.name,
      data: materialList.map((item) => ({
        ...item,
        opening_qty: round(item.opening_qty),
        ordered_qty: round(item.ordered_qty),
        issues_qty: round(item.issues_qty),
        received_qty: round(item.received_qty),
        closing_qty: round(item.closing_qty),
        discard_qty: round(item.discard_qty),
        vaccine_ip: item.vaccine_ip || "",
        scope_total: item.scope_total || "",
      })),
      last_updated: lastUpdated,
    }

    return PeriodicMaterialStockResponseSchema.parse(response)
  }

  async getReportExport(
    c: Context,
    queryParams: PeriodicMaterialStockQueryParams
  ) {
    const reportData = await this.getReport(c, queryParams)
    return await this.periodicMaterialStockExcel.generateReportExport(
      c,
      queryParams,
      reportData
    )
  }

  async exportAllReport(
    c: Context,
    queryParams: PeriodicMaterialStockQueryParams
  ) {
    queryParams.program_id = c.var.programId

    return await this.handleAsyncExport(
      c,
      TOPIC.PERIODIC_MATERIAL_STOCK_ALL_EXPORTED,
      {
        filename: c.var.t("periodic-material-stock.sheet.title"),
        params: queryParams,
      }
    )
  }
}
