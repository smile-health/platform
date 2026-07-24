import { DEVICE_TYPE } from "@/common/constants/device.js"
import { USER_ROLE } from "@/common/constants/user.js"
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "@smile-health/lib/error.js"
import { logger } from "@smile-health/lib/logger.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { collect } from "@smile-health/lib/utils.js"
import { Context } from "hono"
import moment from "moment"
import { z } from "zod"
import { BaseModule } from "../base.module.js"
import { AssetMonitoringTemperatureExport } from "./asset-monitoring-temperature.excel.js"
import { AssetMonitoringTemperatureRepository } from "./asset-monitoring-temperature.repository.js"
import {
  GetAssetMonitoringTemperatureQuery,
  GetTemperatureCapacityQueries,
  GetTemperatureHistoryChartsQueries,
  GetTemperatureHistoryQueries,
  PushTemperatureHistoryDTO,
  TemperatureHistoryResultItem,
  UpdateAuditTimestampDTO,
  UpdateOperationalStatusDTO,
  UpdateOperationalStatusRequestDTO,
  UpdateTemperatureRangeRequestSchema,
  UpdateTemperatureThresholdDTO,
} from "./asset-monitoring-temperature.schema.js"
import { AssetMonitoringTemperatureNotification } from "./utils/asset-monitoring-temperature.notification.js"

export class AssetMonitoringTemperatureModule extends BaseModule {
  constructor(
    private readonly repository: AssetMonitoringTemperatureRepository,
    private readonly notification: AssetMonitoringTemperatureNotification
  ) {
    super()
  }

  async pushTemperatureHistory(c: Context, data: PushTemperatureHistoryDTO) {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      await this.validateTemperatureHistoryData(data)

      const results: TemperatureHistoryResultItem[] = []

      for (const historyItem of data) {
        const result = await this.repository.createTemperatureHistory(
          c,
          historyItem
        )
        results.push(result)

        logger.info(
          `Temperature history pushed - Device: ${historyItem.device_id}, Temp: ${historyItem.curr_temp}, User: ${currentUser.id}`
        )

        if (result.result === "success") {
          try {
            const rtmdInfo = await this.repository.getRtmdIdByDeviceId(
              c,
              historyItem.device_id
            )
            if (rtmdInfo && (rtmdInfo.asset_model_temperature_capacity_id || rtmdInfo.asset_type_id)) {
              await this.notification.checkAndSendTemperatureNotification(
                c,
                c,
                rtmdInfo.rtmd_id,
                rtmdInfo.asset_inventory_id,
                rtmdInfo.asset_model_temperature_capacity_id ?? null,
                Number(historyItem.curr_temp),
                new Date(historyItem.actual_date || new Date())
              )
            }
          } catch (notifError) {
            logger.error(
              `Error in temperature notification for device ${historyItem.device_id}: ${notifError instanceof Error ? notifError.message : "Unknown error"}`
            )
          }
        }
      }

      return {
        message: "Temperature history processed successfully",
        data: results,
        total_processed: results.length,
        successful: results.filter((r) => r.result === "success").length,
        failed: results.filter((r) => r.result === "error").length,
      }
    } catch (error) {
      logger.error(
        `Error pushing temperature history: ${error instanceof Error ? error.message : "Unknown error"} - Data: ${JSON.stringify(data)}`
      )

      if (
        error instanceof ValidationError ||
        error instanceof BadRequestError ||
        error instanceof NotFoundError
      ) {
        throw error
      }

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (
          errorMessage.includes("duplicate") ||
          errorMessage.includes("unique")
        ) {
          throw new ValidationError(
            "Duplicate temperature history record found"
          )
        }
        if (
          errorMessage.includes("foreign key") ||
          errorMessage.includes("constraint")
        ) {
          throw new ValidationError("Invalid device reference")
        }
        if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("connection")
        ) {
          throw new ValidationError(
            "Database connection error. Please try again"
          )
        }
      }

      throw new ValidationError(
        `Failed to push temperature history: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async updateTemperatureThreshold(
    c: Context,
    assetId: number,
    data: UpdateTemperatureThresholdDTO
  ) {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      const temperatureCapacity = c.get("temperatureCapacity")
      if (!temperatureCapacity) {
        throw new NotFoundError("Temperature capacity not found")
      }

      const assetInventory = await this.repository.findAssetByAssetId(
        c,
        assetId
      )
      if (!assetInventory) {
        throw new NotFoundError("Asset inventory not found")
      }

      await this.repository.updateAssetInventoryTemperatureCapacity(
        c,
        assetInventory.id,
        data.asset_model_temperature_capacity_id,
        currentUser.id
      )

      logger.info(
        `Temperature threshold updated - Asset ID: ${assetId}, New Capacity ID: ${data.asset_model_temperature_capacity_id}, User: ${currentUser.id}`
      )

      return {
        message: "Temperature threshold updated successfully",
        asset_id: assetInventory.id,
        asset_model_temperature_capacity_id:
          data.asset_model_temperature_capacity_id,
        previous_capacity: temperatureCapacity,
      }
    } catch (error) {
      logger.error(
        `Error updating temperature threshold: ${error instanceof Error ? error.message : "Unknown error"}`
      )

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }

      throw new ValidationError(
        `Failed to update temperature threshold: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async getTemperatureCapacities(
    c: Context,
    params: GetTemperatureCapacityQueries & {
      page: number
      paginate: number
      offset: number
    }
  ) {
    try {
      const result = await this.repository.getAssetModelTemperatureCapacities(
        c,
        params
      )

      return new PaginatedResponse(
        {
          page: params.page,
          paginate: params.paginate,
        },
        result.data,
        result.pagination.total
      )
    } catch (error) {
      logger.error(
        `Error fetching temperature capacities: ${error instanceof Error ? error.message : "Unknown error"}`
      )

      if (error instanceof ValidationError) {
        throw error
      }

      throw new ValidationError(
        `Failed to fetch temperature capacities: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async getTemperatureCapacityDetail(c: Context, id: number) {
    try {
      const capacity =
        await this.repository.getAssetModelTemperatureCapacityById(c, id)

      if (!capacity) {
        throw new NotFoundError("Temperature capacity not found")
      }

      return {
        message: "Temperature capacity retrieved successfully",
        data: capacity,
      }
    } catch (error) {
      logger.error(
        `Error fetching temperature capacity detail: ${error instanceof Error ? error.message : "Unknown error"}`
      )

      if (error instanceof NotFoundError) {
        throw error
      }

      throw new ValidationError(
        `Failed to fetch temperature capacity: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async getTemperatureHistory(
    c: Context,
    params: GetTemperatureHistoryQueries
  ) {
    try {
      const page = params.page || 1
      const paginate = params.paginate || 10

      const result = await this.repository.getTemperatureHistory(c, {
        ...params,
        page,
        paginate,
      })

      // Apply translation to nested status objects
      const translatedData = result.data.map((item) => ({
        ...item,
        working_status: item.working_status
          ? {
              ...item.working_status,
              name: c.var.t(
                item.working_status.name || "",
                item.working_status.name || ""
              ),
            }
          : null,
        rtmd_status: item.rtmd_status
          ? {
              ...item.rtmd_status,
              name: c.var.t(
                item.rtmd_status.name || "",
                item.rtmd_status.name || ""
              ),
            }
          : null,
      }))

      return new PaginatedResponse(
        {
          page,
          paginate,
        },
        translatedData,
        result.pagination.total
      )
    } catch (error) {
      logger.error(
        `Error fetching temperature history: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )

      if (error instanceof ValidationError) {
        throw error
      }

      throw new ValidationError(
        `Failed to fetch temperature history: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async getTemperatureHistoryByRtmdId(
    c: Context,
    rtmdId: number,
    params: GetTemperatureHistoryQueries
  ) {
    try {
      const page = params.page || 1
      const paginate = params.paginate || 10

      const result = await this.repository.getTemperatureHistoryByRtmdId(c, {
        rtmd_id: rtmdId.toString(),
        from_date: params.from_date,
        to_date: params.to_date,
        page,
        paginate,
      })

      // Apply translation to nested status objects
      const translatedData = result.data.map((item) => ({
        ...item,
        working_status: item.working_status
          ? {
              ...item.working_status,
              name: c.var.t(
                item.working_status.name || "",
                item.working_status.name || ""
              ),
            }
          : null,
        rtmd_status: item.rtmd_status
          ? {
              ...item.rtmd_status,
              name: c.var.t(
                item.rtmd_status.name || "",
                item.rtmd_status.name || ""
              ),
            }
          : null,
      }))

      return new PaginatedResponse(
        {
          page,
          paginate,
        },
        translatedData,
        result.pagination.total
      )
    } catch (error) {
      logger.error(
        `Error fetching temperature history by RTMD ID: ${error instanceof Error ? error.message : "Unknown error"}`
      )

      throw new ValidationError(
        `Failed to fetch temperature history: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async getTemperatureHistoryChartsByRtmdId(
    c: Context,
    rtmdId: number,
    params: GetTemperatureHistoryChartsQueries
  ) {
    try {
      const fromDate = params.from_date
      const toDate = params.to_date

      const isSingleDay =
        !fromDate ||
        !toDate ||
        new Date(fromDate).toDateString() === new Date(toDate).toDateString()

      const mapToChartItem = (item: {
        id: number
        asset_rtmd_id: number
        latitude: number | null
        longitude: number | null
        temperature: number
        humidity: number | null
        battery: number | null
        signal: number | null
        device_status: number | null
        is_power_connected: number | null
        actual_time: Date | string
        created_at: Date | string | null
        updated_at: Date | string | null
        device_serial: string | null
        temperature_threshold: { min_temperature: number; max_temperature: number } | null
        humidity_threshold: { min_humidity: number; max_humidity: number } | null
        other_temperature_capacity: null
        other_temperature_threshold: null
        [key: string]: unknown
      }) => ({
        id: item.id,
        asset_rtmd_id: item.asset_rtmd_id,
        latitude: item.latitude,
        longitude: item.longitude,
        temperature: item.temperature,
        humidity: item.humidity,
        battery: item.battery,
        signal: item.signal,
        device_status: item.device_status,
        is_power_connected: item.is_power_connected,
        actual_time: item.actual_time,
        created_at: item.created_at,
        updated_at: item.updated_at,
        device_serial: item.device_serial,
        temperature_threshold: item.temperature_threshold,
        humidity_threshold: item.humidity_threshold,
        other_temperature_capacity: item.other_temperature_capacity,
        other_temperature_threshold: item.other_temperature_threshold,
      })

      if (isSingleDay) {
        const result = await this.repository.getTemperatureHistoryByRtmdId(c, {
          rtmd_id: rtmdId.toString(),
          from_date: fromDate,
          to_date: toDate,
          page: 1,
          paginate: 20000,
        })

        const chartData = result.data.map(mapToChartItem)

        return new PaginatedResponse(
          { page: 1, paginate: chartData.length },
          chartData,
          chartData.length
        )
      }

      // Multi-day: fetch all data then apply smart selection per day
      const allResult = await this.repository.getTemperatureHistoryByRtmdId(c, {
        rtmd_id: rtmdId.toString(),
        from_date: fromDate,
        to_date: toDate,
        page: 1,
        paginate: 20000,
      })

      // Determine points per day based on date range
      let pointsPerDay = 3
      if (fromDate && toDate) {
        const fromDateObj = new Date(fromDate)
        const toDateObj = new Date(toDate)
        const diffDays =
          (toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays >= 14) {
          pointsPerDay = 1
        }
      }

      // Repo returns desc, reverse to chronological order
      const sorted = [...allResult.data].reverse()

      // Group by day (UTC date)
      const grouped = new Map<string, typeof sorted>()
      for (const item of sorted) {
        const dayKey = new Date(item.actual_time as Date | string)
          .toISOString()
          .slice(0, 10)
        if (!grouped.has(dayKey)) grouped.set(dayKey, [])
        grouped.get(dayKey)!.push(item)
      }

      // Pick N items evenly distributed from array
      const pickEvenly = <T>(arr: T[], count: number): T[] => {
        if (arr.length === 0) return []
        if (arr.length <= count) return arr
        if (count === 1) return [arr[Math.floor(arr.length / 2)]]
        const result: T[] = []
        const step = (arr.length - 1) / (count - 1)
        for (let i = 0; i < count; i++) {
          result.push(arr[Math.round(i * step)])
        }
        return result
      }

      const selectedData: typeof sorted = []

      for (const [, items] of grouped) {
        // Classify into abnormal (above/below threshold) and normal
        const abnormal = items.filter((item) => {
          const threshold = item.temperature_threshold
          if (
            !threshold ||
            item.temperature === null ||
            item.temperature === undefined
          )
            return false
          const temp = Number(item.temperature)
          const min = Number(threshold.min_temperature)
          const max = Number(threshold.max_temperature)
          return temp < min || temp > max
        })
        const normal = items.filter((item) => !abnormal.includes(item))

        let daySelection: typeof items

        if (abnormal.length === 0) {
          // All normal: pick evenly distributed points
          daySelection = pickEvenly(items, pointsPerDay)
        } else if (abnormal.length >= pointsPerDay) {
          // Enough abnormal: pick evenly from abnormal points
          daySelection = pickEvenly(abnormal, pointsPerDay)
        } else {
          // Mix: take all abnormal + fill remaining slots with normal
          const remaining = pointsPerDay - abnormal.length
          const fillerNormal = pickEvenly(normal, remaining)
          daySelection = [...abnormal, ...fillerNormal].sort(
            (a, b) =>
              new Date(a.actual_time as Date | string).getTime() -
              new Date(b.actual_time as Date | string).getTime()
          )
        }

        selectedData.push(...daySelection)
      }

      const chartData = selectedData.map(mapToChartItem)

      return new PaginatedResponse(
        { page: 1, paginate: chartData.length },
        chartData,
        chartData.length
      )
    } catch (error) {
      logger.error(
        `Error fetching temperature history charts by RTMD ID: ${error instanceof Error ? error.message : "Unknown error"}`
      )

      throw new ValidationError(
        `Failed to fetch temperature history charts: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async exportTemperatureHistoryByRtmdId(
    c: Context,
    rtmdId: number,
    params: GetTemperatureHistoryQueries
  ): Promise<Response> {
    try {
      const { t, language, timezone } = c.var
      const { is_warehouse: isWarehouse } = params

      const rtmd = await this.repository.getLoggerDetail(c, rtmdId)
      const title = t("asset_monitoring_temperature.export.title", {
        asset: t(`common.${isWarehouse ? "warehouse" : "cce"}`),
        ...rtmd,
      })

      logger.info(
        `Starting temperature history export process for RTMD ID: ${rtmdId} with params: ${JSON.stringify(params)}`
      )

      logger.info(
        `Retrieving temperature history for RTMD ID: ${rtmdId}, from_date: ${params.from_date}, to_date: ${params.to_date}`
      )

      const data = await this.repository.getTemperatureHistoryForExport(c, {
        rtmd_id: rtmdId.toString(),
        from_date: params.from_date,
        to_date: params.to_date,
      })

      logger.info(
        `Retrieved ${data.length} temperature history records for export`
      )

      if (data.length > 0) {
        logger.info(`Sample data record: ${JSON.stringify(data[0])}`)
      } else {
        logger.warn(
          "No temperature history data found for export - will export empty file"
        )
      }

      const rows: (string | number)[][] = []

      if (isWarehouse) {
        for (const item of data) {
          logger.info(`Processing warehouse item: ${JSON.stringify(item)}`)
          // Format temperature threshold
          const tempThreshold =
            item.min_temperature_threshold !== null &&
            item.max_temperature_threshold !== null
              ? `Min ${item.min_temperature_threshold}°C - Max ${item.max_temperature_threshold}°C`
              : "-"
          // Humidity thresholds are hardcoded as 60%-80% per previous implementation
          const humidityThreshold = "Min 60% - Max 80%"
          const row = [
            item.description || "-",
            `${item.serial_number || ""}${item.asset_model_name ? " - " + item.asset_model_name : ""}${item.manufacture_name ? " - " + item.manufacture_name : ""}`,
            typeof item.temperature === "number" ? item.temperature : 0,
            typeof item.humidity === "number" ? item.humidity : 0,
            item.working_status_name
              ? t(item.working_status_name, item.working_status_name) || "-"
              : "-",
            tempThreshold,
            humidityThreshold,
            item.actual_time
              ? moment(item.actual_time).format("DD/MM/YYYY HH:mm")
              : "-",
          ] as (string | number)[]
          logger.info(`Created row: ${JSON.stringify(row)}`)
          rows.push(row)
        }
      } else {
        for (const item of data) {
          logger.info(`Processing item: ${JSON.stringify(item)}`)
          // Format temperature threshold
          const tempThreshold =
            item.min_temperature_threshold !== null &&
            item.max_temperature_threshold !== null
              ? `Min ${item.min_temperature_threshold}°C - Max ${item.max_temperature_threshold}°C`
              : "-"
          // CCE (non-warehouse) doesn't need humidity columns
          const row = [
            item.sensor_qty || 0,
            `${item.serial_number || ""}${item.asset_model_name ? " - " + item.asset_model_name : ""}${item.manufacture_name ? " - " + item.manufacture_name : ""}`,
            typeof item.temperature === "number" ? item.temperature : 0,
            item.working_status_name
              ? t(item.working_status_name, item.working_status_name) || "-"
              : "-",
            tempThreshold,
            item.actual_time
              ? moment(item.actual_time).format("DD/MM/YYYY HH:mm")
              : "-",
          ] as (string | number)[]
          logger.info(`Created row: ${JSON.stringify(row)}`)
          rows.push(row)
        }
      }

      logger.info(`Total rows created: ${rows.length}`)
      let columns: { key: string; header: string; width: number }[] = []
      if (isWarehouse) {
        columns = [
          {
            key: "description",
            header: t(
              "asset_monitoring_temperature.export.description",
              "Deskripsi"
            ),
            width: 10,
          },
          {
            key: "nama_logger",
            header: t(
              "asset_monitoring_temperature.export.nama_logger",
              "Nama Logger"
            ),
            width: 25,
          },
          {
            key: "suhu",
            header: t("asset_monitoring_temperature.export.suhu", "Suhu"),
            width: 15,
          },
          {
            key: "kelembapan",
            header: t(
              "asset_monitoring_temperature.export.humidity",
              "Kelembapan"
            ),
            width: 15,
          },
          {
            key: "status_cold_chain_equipment",
            header: t(
              "asset_monitoring_temperature.export.warehouse_status",
              "Status Ruangan"
            ),
            width: 30,
          },
          {
            key: "ambang_batas_suhu",
            header: t(
              "asset_monitoring_temperature.export.ambang_batas_suhu",
              "Ambang Batas Suhu"
            ),
            width: 25,
          },
          {
            key: "ambang_batas_kelembapan",
            header: t(
              "asset_monitoring_temperature.export.ambang_batas_kelembapan",
              "Ambang Batas Kelembapan"
            ),
            width: 25,
          },
          {
            key: "tanggal_tercatat",
            header: t(
              "asset_monitoring_temperature.export.tanggal_tercatat",
              "Tanggal Tercatat"
            ),
            width: 25,
          },
        ]
      } else {
        // CCE (non-warehouse) columns - no humidity columns
        columns = [
          {
            key: "sensor",
            header: t("asset_monitoring_temperature.export.sensor", "Sensor"),
            width: 10,
          },
          {
            key: "nama_logger",
            header: t(
              "asset_monitoring_temperature.export.nama_logger",
              "Nama Logger"
            ),
            width: 25,
          },
          {
            key: "suhu",
            header: t("asset_monitoring_temperature.export.suhu", "Suhu"),
            width: 15,
          },
          {
            key: "status_cold_chain_equipment",
            header: t(
              "asset_monitoring_temperature.export.status_cold_chain_equipment",
              "Status Cold Chain Equipment"
            ),
            width: 30,
          },
          {
            key: "ambang_batas_suhu",
            header: t(
              "asset_monitoring_temperature.export.ambang_batas_suhu",
              "Ambang Batas Suhu"
            ),
            width: 25,
          },
          {
            key: "tanggal_tercatat",
            header: t(
              "asset_monitoring_temperature.export.tanggal_tercatat",
              "Tanggal Tercatat"
            ),
            width: 25,
          },
        ]
      }

      const sheet = t(
        "asset_monitoring_temperature.export.sheet",
        "Data Riwayat Suhu"
      )
      const excelTemplate = new AssetMonitoringTemperatureExport()
      excelTemplate.setTitle(title)

      try {
        logger.info("Initializing Excel sheet...")
        await excelTemplate.initSheet(sheet)
        logger.info("Excel sheet initialized successfully")
      } catch (error) {
        logger.error(
          `Failed to initialize Excel sheet: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }

      try {
        logger.info("Setting Excel properties...")
        excelTemplate.setLanguage(language)
        excelTemplate.setTimezone(timezone)
        excelTemplate.setColumns(columns)
        logger.info("Excel properties set successfully")
      } catch (error) {
        logger.error(
          `Failed to set Excel properties: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }

      try {
        logger.info(`Adding ${rows.length} rows to Excel...`)
        await excelTemplate.addRows(sheet, rows)
        logger.info(`Rows added successfully to Excel`)
      } catch (error) {
        logger.error(
          `Failed to add rows to Excel: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }

      try {
        logger.info(
          `Temperature history Excel export generated successfully with ${rows.length} records`
        )
        logger.info("Generating Excel file...")
        return excelTemplate
      } catch (error) {
        logger.error(
          `Failed to generate Excel file: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }
    } catch (error) {
      logger.error(
        `Error exporting temperature history to Excel: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      logger.error(
        `Stack trace: ${error instanceof Error ? error.stack : "No stack trace available"}`
      )
      throw new ValidationError("Failed to export data to Excel")
    }
  }

  async exportTemperatureHistoryByRtmdIdAsync(
    c: Context,
    rtmdId: number,
    params: GetTemperatureHistoryQueries
  ) {
    const { t } = c.var
    const { is_warehouse: isWarehouse } = params

    const rtmd = await this.repository.getLoggerDetail(c, rtmdId)
    const filename = t("asset_monitoring_temperature.export.title", {
      asset: t(`common.${isWarehouse ? "warehouse" : "cce"}`),
      ...rtmd,
    })

    return this.handleAsyncExport(
      c,
      TOPIC.ASSET_MONITORING_TEMPERATURE_HISTORY_EXPORTED,
      {
        filename,
        params: { rtmdId, ...params },
        ext: "xlsx",
      }
    )
  }

  async updateTemperatureRange(
    c: Context,
    assetInventoryId: number,
    data: z.infer<typeof UpdateTemperatureRangeRequestSchema>
  ) {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      const success = await this.repository.updateTemperatureRange(
        c,
        assetInventoryId,
        data.temperature_threshold_id,
        currentUser.id
      )

      if (!success) {
        throw new ValidationError("Failed to update temperature range")
      }

      logger.info(
        `Temperature range updated - Asset Inventory ID: ${assetInventoryId}, Temperature Threshold ID: ${data.temperature_threshold_id}, User: ${currentUser.id}`
      )

      return {
        id: assetInventoryId,
      }
    } catch (error) {
      logger.error(
        `Error updating temperature range: ${error instanceof Error ? error.message : "Unknown error"} - Asset ID: ${assetInventoryId}, Data: ${JSON.stringify(data)}`
      )

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }

      throw new ValidationError(
        `Failed to update temperature range: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async list(c: Context, params: GetAssetMonitoringTemperatureQuery) {
    const { role: roleId } = c.var
    const entityId = await this.getEntityByRole(c)

    // Jika VENDOR_IOT, tambahkan filter manufacture_id dari RTMD
    let createdBy: number | undefined
    if (roleId === USER_ROLE.VENDOR_IOT) {
      const currentUser = c.get("user")
      if (currentUser?.manufacture_id) {
        params = {
          ...params,
          rtmd_manufacture_ids: [currentUser.manufacture_id],
        }
      }
      createdBy = await this.getVendorIotFilter(c, currentUser)
    }

    const { list, total } =
      await this.repository.getListAssetMonitoringTemperature(
        c,
        params,
        entityId,
        createdBy
      )

    const warehouseAssetTypeIds =
      await this.repository.getWarehouseAssetTypeIds(c)

    const result = await Promise.all(
      list.map(
        async (item) =>
          await this.setListResponse(
            c,
            {
              ...item,
              is_warehouse: warehouseAssetTypeIds.includes(
                item.asset_type_id ?? 0
              )
                ? 1
                : 0,
            },
            params
          )
      )
    )

    return new PaginatedResponse(params, result, total)
  }

  async detail(c: Context, id: number) {
    const detail = await this.repository.getAssetMonitoringTemperatureById(
      c,
      id
    )
    const result = detail ? await this.setDetailResponse(c, detail) : undefined

    return result
  }

  private async getEntityByRole(c: Context) {
    const { deviceType, role: roleId } = c.var

    // SUPERADMIN dan VENDOR_IOT tidak memerlukan filter entity
    if (roleId === USER_ROLE.SUPERADMIN || roleId === USER_ROLE.VENDOR_IOT) {
      return undefined
    }

    const userEntity = await this.repository.getEntityById(c, c.var.entityId!)

    let entityId: number | number[]

    if (
      roleId === USER_ROLE.MANAGER &&
      deviceType === DEVICE_TYPE.web &&
      userEntity.type === 1 &&
      userEntity.province_id
    ) {
      const entities = await this.repository.getEntityByProvince(
        c,
        userEntity.province_id
      )

      entityId = entities.map((item) => item.id)
    }

    if (
      roleId === USER_ROLE.MANAGER &&
      deviceType === DEVICE_TYPE.web &&
      userEntity.type === 2 &&
      userEntity.regency_id
    ) {
      const entities = await this.repository.getEntityByRegency(
        c,
        userEntity.regency_id
      )

      entityId = entities.map((item) => item.id)
    }

    if (deviceType === DEVICE_TYPE.mobile) {
      entityId = userEntity.id
    }

    return entityId
  }

  findActiveThresholdTemperature(temperatureThresholds) {
    if (!temperatureThresholds || temperatureThresholds.length === 0)
      return null

    // Filter dan ambil hanya yang aktif
    const activeThreshold = temperatureThresholds
      .filter((t) => t.is_active === 1)
      .map((t) => ({
        min: t.min_temperature,
        max: t.max_temperature,
      }))

    return activeThreshold
  }

  filterThresholdTemperature(
    rtmdsConverted: any[], // TODO: Replace any[] with a more specific type if possible
    tempParam: "below" | "above" | "normal" | undefined,
    tempThresholds: any[] // TODO: Replace any[] with a more specific type if possible
  ) {
    if (!tempParam) return rtmdsConverted

    const activeTempThreshold =
      this.findActiveThresholdTemperature(tempThresholds)

    if (!activeTempThreshold || activeTempThreshold.length === 0) {
      return rtmdsConverted
    }

    const { min, max } = activeTempThreshold[0]
    const results: any[] = [] // TODO: Replace any[] with a more specific type if possible

    for (const device of rtmdsConverted) {
      const temp = device.latest_log?.temperature
      if (temp === undefined || temp === null) {
        results.push({ ...device })
        continue
      }

      const isBelow = tempParam === "below" && temp < min
      const isAbove = tempParam === "above" && temp > max
      const isNormal = tempParam === "normal" && temp >= min && temp <= max

      if (isBelow || isAbove || isNormal) {
        results.push({ ...device })
      }
    }

    return results
  }

  private async setListResponse(
    c: Context,
    item,
    params: GetAssetMonitoringTemperatureQuery
  ) {
    // Get RTMD devices for this asset inventory
    const rtmdDevices = await this.repository.getAssetInventoryRtmds(c, item.id)

    // Get temperature thresholds for this asset model
    const temperatureThresholds =
      item.asset_model_id || item.other_asset_model_name
        ? await this.repository.getTemperatureThresholdsByAssetModelId(
          c,
          item.other_inventories_id,
          item.other_min_temperature,
          item.other_max_temperature,
          item.asset_model_id,
          item.asset_type_temperature_id,
          item.asset_model_temperature_capacity_id,
          item.asset_classifications_id,
          item.id,
          item.asset_type_id
        )
        : []

    const convertRtmds =
      rtmdDevices && rtmdDevices.length > 0
        ? await this.getExcursion(
            c,
            item.other_min_temperature,
            item.other_max_temperature,
            temperatureThresholds,
            rtmdDevices
          )
        : rtmdDevices

    const filteredRtmds =
      convertRtmds && convertRtmds.length > 0
        ? this.filterThresholdTemperature(
            convertRtmds,
            params.temperature_filter,
            temperatureThresholds
          )
        : convertRtmds

    const response = {
      id: item.id,
      serial_number: item.serial_number,
      created_at: item.created_at,
      updated_at: item.updated_at,
      other_asset_model_name: item.other_asset_model_name,
      other_asset_type_name: item.other_asset_type_name,
      other_net_capacity: item.other_net_capacity,
      other_gross_capacity: item.other_gross_capacity,
      other_min_temperature: item.other_min_temperature,
      other_max_temperature: item.other_max_temperature,
      other_manufacture_name: item.other_asset_manufacture_name,
      other_budget_source_name: item.other_asset_budget_source_name,
      other_borrowed_from_entity_name: item.other_borrowed_from_entity_name,
      asset_model: {
        id: item.asset_model_id,
        name: item.asset_model_name,
        net_capacity: item.net_capacity,
        gross_capacity: item.gross_capacity,
      },
      asset_type: {
        id: item.asset_type_id,
        name: item.asset_type_name,
        temperature_thresholds: temperatureThresholds,
        humidity_thresholds:
          item.is_warehouse === 1
            ? [{ min_humidity: 60, max_humidity: 80 }]
            : [],
        is_warehouse: item.is_warehouse,
      },
      manufacture: {
        id: item.manufacture_id,
        name: item.manufacture_name,
      },
      working_status: {
        id: item.working_status_id,
        name: this.translateSmart(
          c,
          item.asset_working_status_name,
          "asset_working_status.label"
        ),
      },
      entity: {
        id: item.entity_id,
        name: item.entity_name,
        is_puskesmas: item.entity_is_puskesmas,
      },
      province: {
        id: item.province_id,
        name: item.province_name,
      },
      regency: {
        id: item.regency_id,
        name: item.regency_name,
      },
      rtmd_devices: filteredRtmds,
      user_updated_by: {
        id: item.user_updated_id,
        username: item.user_updated_username,
        firstname: item.user_updated_firstname,
        lastname: item.user_updated_lastname,
        fullname: item.user_updated_fullname,
      },
    }
    return response
  }

  private async setDetailResponse(c: Context, item) {
    // Get RTMD devices for this asset
    const [rtmdDevices, warehouseAssetTypeIds, dbHumidityThresholds] =
      await Promise.all([
        this.repository.getAssetInventoryRtmds(c, item.id),
        this.repository.getWarehouseAssetTypeIds(c),
        this.repository.getHumidityThresholdsByAssetTypeId(
          c,
          item.asset_type_id ?? 0
        ),
      ])

    // For Warehouse assets, use default humidity thresholds (60%-80%) if not found in DB
    const isWarehouse = warehouseAssetTypeIds.includes(item.asset_type_id)
    const humidityThresholds =
      dbHumidityThresholds.length > 0
        ? dbHumidityThresholds
        : isWarehouse
          ? [{ min_humidity: 60, max_humidity: 80, is_active: 1 }]
          : []

    const response = {
      id: item.id,
      serial_number: item.serial_number,
      budget_source: item.budget_source_id
        ? {
            id: item.budget_source_id,
            name: item.budget_source_name,
          }
        : null,
      budget_year: item.budget_year,
      production_year: item.production_year,
      other_asset_model_name: item.other_asset_model_name,
      other_asset_type_name: item.other_asset_type_name,
      other_net_capacity: item.other_net_capacity,
      other_gross_capacity: item.other_gross_capacity,
      other_min_temperature: item.other_min_temperature,
      other_max_temperature: item.other_max_temperature,
      other_manufacture_name: item.other_asset_manufacture_name,
      other_budget_source_name: item.other_asset_budget_source_name,
      other_borrowed_from_entity_name: item.other_borrowed_from_entity_name,
      created_at: item.created_at,
      updated_at: item.updated_at,
      asset_model: {
        id: item.asset_model_id,
        name: item.asset_model_name,
        net_capacity: item.net_capacity,
        gross_capacity: item.gross_capacity,
        capacities: item.capacities || [],
      },
      asset_type: {
        id: item.asset_type_id,
        name: item.asset_type_name,
        min_temperature: item.min_temperature,
        max_temperature: item.max_temperature,
        temperature_thresholds: item.temperature_thresholds || [],
        humidity_thresholds: humidityThresholds || [],
        is_warehouse: warehouseAssetTypeIds.includes(item.asset_type_id)
          ? 1
          : 0,
      },
      manufacture: {
        id: item.manufacture_id,
        name: item.manufacture_name,
      },
      working_status: {
        id: item.working_status_id,
        name: this.translateSmart(
          c,
          item.asset_working_status_name,
          "asset_working_status.label"
        ),
      },
      entity: {
        id: item.entity_id,
        name: item.entity_name,
        is_puskesmas: item.entity_is_puskesmas,
      },
      province: {
        id: item.province_id,
        name: item.province_name,
      },
      regency: {
        id: item.regency_id,
        name: item.regency_name,
      },
      rtmd_devices: rtmdDevices,
      contact_persons: item.contact_persons,
      user_created_by: {
        id: item.user_created_id,
        username: item.user_created_username,
        firstname: item.user_created_firstname,
        lastname: item.user_created_lastname,
        fullname: item.user_created_fullname,
      },
      user_updated_by: {
        id: item.user_updated_id,
        username: item.user_updated_username,
        firstname: item.user_updated_firstname,
        lastname: item.user_updated_lastname,
        fullname: item.user_updated_fullname,
      },
    }
    return response
  }

  private getStatusObject(c: Context, status: number) {
    if (status === 0)
      return { id: 0, name: c.var.t("asset_inventory.label.inactive") }
    if (status === 1)
      return { id: 1, name: c.var.t("asset_inventory.label.active") }
    return null
  }

  private getOwnershipStatusObject(c: Context, status: number, qty: number) {
    if (status === 1)
      return { id: 1, name: c.var.t("asset_inventory.label.owned"), qty: qty }
    if (status === 2)
      return {
        id: 2,
        name: c.var.t("asset_inventory.label.borrowed"),
        qty: qty,
      }
    return null
  }

  private translateSmart(c: Context, input: string | null, prefix: string) {
    if (!input) return input

    if (input.startsWith(prefix)) {
      return c.var.t(input)
    }

    const translated = c.var.t(prefix + input)

    if (translated !== prefix + input) {
      return translated
    }

    return input
  }

  private async validateTemperatureHistoryData(
    data: PushTemperatureHistoryDTO
  ): Promise<void> {
    if (!Array.isArray(data) || data.length === 0) {
      throw new BadRequestError("Temperature history data cannot be empty")
    }

    if (data.length > 1000) {
      throw new BadRequestError("Cannot process more than 1000 records at once")
    }

    for (const [index, item] of data.entries()) {
      if (!item.device_id || item.device_id.trim() === "") {
        throw new ValidationError(
          `Device ID is required for record ${index + 1}`
        )
      }

      if (item.curr_temp === undefined || item.curr_temp === null) {
        throw new ValidationError(
          `Current temperature is required for record ${index + 1}`
        )
      }

      if (typeof item.curr_temp !== "number" || isNaN(item.curr_temp)) {
        throw new ValidationError(
          `Invalid temperature value for record ${index + 1}`
        )
      }

      if (item.curr_temp < -100 || item.curr_temp > 100) {
        throw new ValidationError(
          `Temperature value out of valid range (-100 to 100°C) for record ${index + 1}`
        )
      }

      if (
        item.battery !== undefined &&
        item.battery !== null &&
        (item.battery < 0 || item.battery > 100)
      ) {
        throw new ValidationError(
          `Battery percentage must be between 0-100 for record ${index + 1}`
        )
      }

      if (
        item.signal !== undefined &&
        item.signal !== null &&
        (item.signal < 0 || item.signal > 100)
      ) {
        throw new ValidationError(
          `Signal strength must be between 0-100 for record ${index + 1}`
        )
      }

      if (
        item.humidity !== undefined &&
        item.humidity !== null &&
        (item.humidity < 0 || item.humidity > 100)
      ) {
        throw new ValidationError(
          `Humidity percentage must be between 0-100 for record ${index + 1}`
        )
      }
    }
  }

  async exportAssetMonitoringTemperatureList(
    c: Context,
    params: GetAssetMonitoringTemperatureQuery
  ): Promise<Response> {
    try {
      const { t, language, timezone } = c.var

      // Determine if this is a Warehouse export based on params.is_warehouse
      // If is_warehouse=1, it's Warehouse; if is_warehouse=0 or undefined with list containing no warehouse items, it's CCE
      const isWarehouseExport = params.is_warehouse === 1

      const title = isWarehouseExport
        ? t("asset_monitoring_temperature.export.warehouse.title")
        : t("asset_monitoring_temperature.export.cce.title")

      const formatTemperature = (temperature: number) => {
        return temperature >= 0 ? `${temperature}°C` : `(${temperature}°C)`
      }
      const formatTemperatureRange = (assetTypeId, data) => {
        if (!data || (!data.min_temperature && !data.max_temperature)) {
          return "-"
        }

        const rangeTemperatures =
          assetTypeId === data.asset_type_id
            ? `${formatTemperature(data.min_temperature || 0)} - ${formatTemperature(data.max_temperature || 0)}`
            : `-`

        return rangeTemperatures
      }

      const { role: roleId } = c.var
      let createdBy: number | undefined
      if (roleId === USER_ROLE.VENDOR_IOT) {
        const currentUser = c.get("user")
        if (currentUser?.manufacture_id) {
          params = {
            ...params,
            rtmd_manufacture_ids: [currentUser.manufacture_id],
          }
        }
        createdBy = await this.getVendorIotFilter(c, currentUser)
      }

      const entityId = await this.getEntityByRole(c)
      const list =
        await this.repository.getListAssetMonitoringTemperatureForExport(
          c,
          params,
          entityId,
          createdBy
        )

      const [mapTemperatures, mapRtmds, warehouseAssetTypeIds] =
        await Promise.all([
          this.repository.getMapTemperatureData(
            c,
            collect(list, "asset_model_id")
          ),
          this.repository.getMapRtmdData(c, collect(list, "id"), true),
          this.repository.getWarehouseAssetTypeIds(c),
        ])

      const rows: (string | number)[][] = []

      for (const item of list) {
        const temperatures = mapTemperatures[item.asset_model_id ?? 0] ?? []
        const rtmdData = (mapRtmds[item.id] || [
          {
            id: "-",
            serial_number: "-",
            model_name: "-",
            manufacture_name: "-",
            communication_provider_name: "-",
            temperature: null,
            created_at: null,
          },
        ]) as any[]

        for (const rtmd of rtmdData) {
          const row = [
            item.entity_id || "-",
            item.entity_name || "-",
            item.province_name || "-",
            item.regency_name || "-",
            item.sub_district_name || "-",
            item.entity_type
              ? this.translateSmart(c, item.entity_type, "entity_type.label.")
              : "-",
            item.id || "-",
            item.serial_number || "-",
            item.asset_model_name || item.other_asset_model_name || "-",
            item.manufacture_name || item.other_asset_manufacture_name || "-",
            item.asset_type_name || item.other_asset_type_name || "-",

            // Capacity 1
            temperatures.length === 0
              ? "-"
              : item.asset_type_id &&
                item.asset_type_id === temperatures[0]?.asset_type_id
                ? temperatures[0]?.gross_capacity
                : "-",
            temperatures.length === 0
              ? "-"
              : item.asset_type_id &&
                item.asset_type_id === temperatures[0]?.asset_type_id
                ? temperatures[0]?.net_capacity
                : "-",

            // Capacity 2
            temperatures.length === 0
              ? "-"
              : item.asset_type_id &&
                item.asset_type_id === temperatures[1]?.asset_type_id
                ? temperatures[1]?.gross_capacity
                : "-",
            temperatures.length === 0
              ? "-"
              : item.asset_type_id &&
                item.asset_type_id === temperatures[1]?.asset_type_id
                ? temperatures[1]?.net_capacity
                : "-",

            // Capacity 3
            temperatures.length === 0
              ? "-"
              : item.asset_type_id &&
                item.asset_type_id === temperatures[2]?.asset_type_id
                ? temperatures[2]?.gross_capacity
                : "-",
            temperatures.length === 0
              ? "-"
              : item.asset_type_id &&
                item.asset_type_id === temperatures[2]?.asset_type_id
                ? temperatures[2]?.net_capacity
                : "-",

            item.pqs_code || "-",
            item.pqs_type || "-",
            // Temperature Threshold 1
            formatTemperatureRange(item.asset_type_id, temperatures?.[0]),

            // Temperature Threshold 2
            formatTemperatureRange(item.asset_type_id, temperatures?.[1]),

            // Temperature Threshold 3
            formatTemperatureRange(item.asset_type_id, temperatures?.[2]),

            item.asset_working_status_name
              ? c.var.t(item.asset_working_status_name)
              : "-",

            item.ownership_qty || "-",

            item.electricity_name ? c.var.t(item.electricity_name) : "-",

            item.budget_year || "-",

            item.budget_source_name ||
              item.other_asset_budget_source_name ||
              "-",

            item.updated_at
              ? moment(item.updated_at).tz(timezone).format("DD/MM/YYYY HH:mm")
              : "-",

            item.other_asset_type_name || "-",
            item.other_asset_manufacture_name || "-",
            item.other_asset_model_name || "-",
            item.production_year ? item.production_year.toString() : "-",
            item.other_asset_budget_source_name || "-",
            item.other_net_capacity || "-",
            item.other_gross_capacity || "-",
            item.production_year
              ? new Date().getFullYear() - item.production_year
              : "-",
            t("common.year"),
            item.cceigat_description || "-",

            item.warranty_start_date
              ? moment(item.warranty_start_date).format("DD/MM/YYYY")
              : "-",

            item.warranty_end_date
              ? moment(item.warranty_end_date).format("DD/MM/YYYY")
              : "-",
            item.maintenance_schedule_name
              ? this.translateSmart(
                  c,
                  item.maintenance_schedule_name,
                  "asset_maintenance_schedule.label"
                )
              : "-",

            item.maintenance_last_date
              ? moment(item.maintenance_last_date).format("DD/MM/YYYY")
              : "-",
            item.calibration_schedule_name
              ? this.translateSmart(
                  c,
                  item.calibration_schedule_name,
                  "asset_calibration_schedule.label"
                )
              : "-",
            item.calibration_last_date
              ? moment(item.calibration_last_date).format("DD/MM/YYYY")
              : "-",

            // RTMD specific data
            rtmd?.id || "-",
            rtmd?.serial_number || "-",
            rtmd?.model_name || "-",
            rtmd?.manufacture_name || "-",
            rtmd?.communication_provider_name || "-",

            typeof rtmd?.temperature === "number" ? rtmd?.temperature : "-",

            // Humidity data - columns present when any item is Warehouse
            // Values: actual data for Warehouse, "-" for CCE
            ...(isWarehouseExport
              ? [
                  warehouseAssetTypeIds.includes(item.asset_type_id ?? 0)
                    ? typeof rtmd?.humidity === "number"
                      ? rtmd?.humidity
                      : "-"
                    : "-",
                  warehouseAssetTypeIds.includes(item.asset_type_id ?? 0)
                    ? "Min 60% - Max 80%" // Hardcoded humidity threshold for Warehouse
                    : "-",
                ]
              : []),

            rtmd?.created_at
              ? moment(rtmd.created_at).utc().format("DD/MM/YYYY HH:mm")
              : "-",
          ] as (string | number)[]

          logger.info(
            `Created RTMD row for asset ${item.id}: ${JSON.stringify(row)}`
          )
          rows.push(row)
        }
      }

      logger.info(`Total rows created: ${rows.length}`)

      const columns = [
        {
          key: "entity_id",
          header: t(
            "asset_monitoring_temperature.export.entity_id",
            "Entity ID"
          ),
          width: 15,
        },
        {
          key: "entity_name",
          header: t(
            "asset_monitoring_temperature.export.entity_name",
            "Entity Name"
          ),
          width: 30,
        },
        {
          key: "province",
          header: t("asset_monitoring_temperature.export.province", "Province"),
          width: 20,
        },
        {
          key: "city_regency",
          header: t(
            "asset_monitoring_temperature.export.city_regency",
            "City/Regency"
          ),
          width: 20,
        },
        {
          key: "district",
          header: t("asset_monitoring_temperature.export.district", "District"),
          width: 20,
        },
        {
          key: "entity_type",
          header: t(
            "asset_monitoring_temperature.export.entity_type",
            "Entity Type"
          ),
          width: 15,
        },
        {
          key: "asset_id",
          header: t("asset_monitoring_temperature.export.asset_id", "Asset ID"),
          width: 15,
        },
        {
          key: "serial_number",
          header: t(
            "asset_monitoring_temperature.export.serial_number",
            "Serial Number"
          ),
          width: 25,
        },
        {
          key: "model",
          header: t("asset_monitoring_temperature.export.model", "Model"),
          width: 20,
        },
        {
          key: "manufacturer",
          header: t(
            "asset_monitoring_temperature.export.manufacturer",
            "Manufacturer"
          ),
          width: 20,
        },
        {
          key: "asset_type",
          header: t(
            "asset_monitoring_temperature.export.asset_type",
            "Asset Type"
          ),
          width: 20,
        },
        {
          key: "gross_capacity_1",
          header: t(
            "asset_monitoring_temperature.export.gross_capacity_1",
            "Gross Capacity (1)"
          ),
          width: 20,
        },
        {
          key: "net_capacity_1",
          header: t(
            "asset_monitoring_temperature.export.net_capacity_1",
            "Net Capacity (1)"
          ),
          width: 20,
        },
        {
          key: "gross_capacity_2",
          header: t(
            "asset_monitoring_temperature.export.gross_capacity_2",
            "Gross Capacity (2)"
          ),
          width: 20,
        },
        {
          key: "net_capacity_2",
          header: t(
            "asset_monitoring_temperature.export.net_capacity_2",
            "Net Capacity (2)"
          ),
          width: 20,
        },
        {
          key: "gross_capacity_3",
          header: t(
            "asset_monitoring_temperature.export.gross_capacity_3",
            "Gross Capacity (3)"
          ),
          width: 20,
        },
        {
          key: "net_capacity_3",
          header: t(
            "asset_monitoring_temperature.export.net_capacity_3",
            "Net Capacity (3)"
          ),
          width: 20,
        },
        {
          key: "pqs_code",
          header: t("asset_monitoring_temperature.export.pqs_code", "PQS Code"),
          width: 15,
        },
        {
          key: "pqs_type",
          header: t("asset_monitoring_temperature.export.pqs_type", "PQS Type"),
          width: 20,
        },
        {
          key: "min_max_temp_1",
          header: t(
            "asset_monitoring_temperature.export.min_max_temp_1",
            "Min - Max Temperature (1)"
          ),
          width: 25,
        },
        {
          key: "min_max_temp_2",
          header: t(
            "asset_monitoring_temperature.export.min_max_temp_2",
            "Min - Max Temperature (2)"
          ),
          width: 25,
        },
        {
          key: "min_max_temp_3",
          header: t(
            "asset_monitoring_temperature.export.min_max_temp_3",
            "Min - Max Temperature (3)"
          ),
          width: 25,
        },
        {
          key: "asset_status",
          header: t(
            "asset_monitoring_temperature.export.asset_status",
            "Asset Status"
          ),
          width: 15,
        },
        {
          key: "quantity_owned",
          header: t(
            "asset_monitoring_temperature.export.quantity_owned",
            "Quantity Owned"
          ),
          width: 15,
        },
        {
          key: "electricity_availability",
          header: t(
            "asset_monitoring_temperature.export.electricity_availability",
            "Electricity Availability Time (Per-day)"
          ),
          width: 35,
        },
        {
          key: "budget_year",
          header: t(
            "asset_monitoring_temperature.export.budget_year",
            "Budget Year"
          ),
          width: 15,
        },
        {
          key: "budget_source",
          header: t(
            "asset_monitoring_temperature.export.budget_source",
            "Budget Source"
          ),
          width: 20,
        },
        {
          key: "last_edited",
          header: t(
            "asset_monitoring_temperature.export.last_edited",
            "Last Edited"
          ),
          width: 25,
        },
        {
          key: "other_asset_type",
          header: t(
            "asset_monitoring_temperature.export.other_asset_type",
            "Other Asset Type"
          ),
          width: 20,
        },
        {
          key: "other_manufacturer",
          header: t(
            "asset_monitoring_temperature.export.other_manufacturer",
            "Other Manufacturer"
          ),
          width: 20,
        },
        {
          key: "other_asset_model",
          header: t(
            "asset_monitoring_temperature.export.other_asset_model",
            "Other Asset Model"
          ),
          width: 20,
        },
        {
          key: "production_date",
          header: t(
            "asset_monitoring_temperature.export.production_date",
            "Production Date"
          ),
          width: 20,
        },
        {
          key: "other_budget_source",
          header: t(
            "asset_monitoring_temperature.export.other_budget_source",
            "Other Budget Source"
          ),
          width: 20,
        },
        {
          key: "other_net_capacity",
          header: t(
            "asset_monitoring_temperature.export.other_net_capacity",
            "Other Net Capacity"
          ),
          width: 20,
        },
        {
          key: "other_gross_capacity",
          header: t(
            "asset_monitoring_temperature.export.other_gross_capacity",
            "Other Gross Capacity"
          ),
          width: 20,
        },
        {
          key: "age",
          header: t("asset_monitoring_temperature.export.age", "Age"),
          width: 10,
        },
        {
          key: "age_type",
          header: t("asset_monitoring_temperature.export.age_type", "Age Type"),
          width: 10,
        },
        {
          key: "designation_cceigat",
          header: t(
            "asset_monitoring_temperature.export.designation_cceigat",
            "Designation CCEIGAT"
          ),
          width: 20,
        },
        {
          key: "warranty_start",
          header: t(
            "asset_monitoring_temperature.export.warranty_start",
            "Warranty Start Date"
          ),
          width: 20,
        },
        {
          key: "warranty_end",
          header: t(
            "asset_monitoring_temperature.export.warranty_end",
            "Warranty End Date"
          ),
          width: 20,
        },
        {
          key: "maintenance_schedule",
          header: t(
            "asset_monitoring_temperature.export.maintenance_schedule",
            "Maintenance Schedule"
          ),
          width: 20,
        },
        {
          key: "last_maintenance",
          header: t(
            "asset_monitoring_temperature.export.last_maintenance",
            "Last Maintenance"
          ),
          width: 20,
        },
        {
          key: "calibration_schedule",
          header: t(
            "asset_monitoring_temperature.export.calibration_schedule",
            "Calibration Schedule"
          ),
          width: 20,
        },
        {
          key: "last_calibration",
          header: t(
            "asset_monitoring_temperature.export.last_calibration",
            "Last Calibration"
          ),
          width: 20,
        },
        {
          key: "logger_id",
          header: t(
            "asset_monitoring_temperature.export.logger_id",
            "Logger ID"
          ),
          width: 15,
        },
        {
          key: "logger_serial_number",
          header: t(
            "asset_monitoring_temperature.export.logger_serial_number",
            "Logger Serial Number"
          ),
          width: 25,
        },
        {
          key: "logger_model",
          header: t(
            "asset_monitoring_temperature.export.logger_model",
            "Logger Model"
          ),
          width: 20,
        },
        {
          key: "logger_manufacturer",
          header: t(
            "asset_monitoring_temperature.export.logger_manufacturer",
            "Logger Manufacturer"
          ),
          width: 20,
        },
        {
          key: "communication_provider",
          header: t(
            "asset_monitoring_temperature.export.communication_provider",
            "Communication Provider"
          ),
          width: 25,
        },
        {
          key: "last_temperature",
          header: t(
            "asset_monitoring_temperature.export.last_temperature",
            "Last Temperature"
          ),
          width: 20,
        },
        // Humidity columns - only when there are Warehouse items
        ...(isWarehouseExport
          ? [
              {
                key: "last_humidity",
                header: t(
                  "asset_monitoring_temperature.export.last_humidity",
                  "Last Humidity"
                ),
                width: 20,
              },
              {
                key: "humidity_threshold",
                header: t(
                  "asset_monitoring_temperature.export.humidity_threshold",
                  "Humidity Threshold"
                ),
                width: 25,
              },
            ]
          : []),
        {
          key: "last_temperature_update",
          header: t(
            "asset_monitoring_temperature.export.last_temperature_update",
            "Last Temperature Update"
          ),
          width: 25,
        },
      ]

      const sheet = t("asset_monitoring_temperature.export.list_sheet", {
        asset: t(`common.${isWarehouseExport ? "warehouse" : "cce"}`),
      })
      const excelTemplate = new AssetMonitoringTemperatureExport()

      try {
        logger.info("Initializing Excel sheet...")
        await excelTemplate.initSheet(sheet)
        logger.info("Excel sheet initialized successfully")
      } catch (error) {
        logger.error(
          `Failed to initialize Excel sheet: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }

      try {
        logger.info("Setting Excel properties...")
        excelTemplate.setLanguage(language)
        excelTemplate.setTitle(title)
        excelTemplate.setTimezone(timezone)
        excelTemplate.setColumns(columns)
        logger.info("Excel properties set successfully")
      } catch (error) {
        logger.error(
          `Failed to set Excel properties: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }

      try {
        logger.info(`Adding ${rows.length} rows to Excel...`)
        await excelTemplate.addRows(sheet, rows)
        logger.info(`Rows added successfully to Excel`)
      } catch (error) {
        logger.error(
          `Failed to add rows to Excel: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }

      try {
        logger.info(
          `Asset monitoring temperature list Excel export generated successfully with ${rows.length} records`
        )
        logger.info("Generating Excel file...")
        return excelTemplate
      } catch (error) {
        logger.error(
          `Failed to generate Excel file: ${error instanceof Error ? error.message : "Unknown error"}`
        )
        throw error
      }
    } catch (error) {
      logger.error(
        `Error exporting asset monitoring temperature list to Excel: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      logger.error(
        `Stack trace: ${error instanceof Error ? error.stack : "No stack trace available"}`
      )
      throw new ValidationError("Failed to export data to Excel")
    }
  }

  async exportAssetMonitoringTemperatureListAsync(
    c: Context,
    params: GetAssetMonitoringTemperatureQuery
  ) {
    const { t } = c.var
    const isWarehouseExport = params.is_warehouse === 1

    const filename = isWarehouseExport
      ? t("asset_monitoring_temperature.export.warehouse.title")
      : t("asset_monitoring_temperature.export.cce.title")

    const { role: roleId } = c.var
    if (roleId === USER_ROLE.VENDOR_IOT) {
      const currentUser = c.get("user")
      if (currentUser?.manufacture_id) {
        params = {
          ...params,
          rtmd_manufacture_ids: [currentUser.manufacture_id],
        }
      }
    }

    return this.handleAsyncExport(
      c,
      TOPIC.ASSET_MONITORING_TEMPERATURE_EXPORTED,
      {
        filename,
        params,
        ext: "xlsx",
      }
    )
  }

  async updateOperationalStatus(
    c: Context,
    id: number,
    body: UpdateOperationalStatusRequestDTO
  ) {
    const userId = Number(c.var.accountID)
    const currentDate = new Date()

    const auditData: UpdateAuditTimestampDTO = {
      updated_by: userId,
      updated_at: currentDate,
    }

    const data: UpdateOperationalStatusDTO = {
      ...body,
      ...auditData,
    }

    await this.repository.updateInventoryOperationalStatusId(c, id, data)
  }

  private async getExcursion(
    c: Context,
    otherMinTemp: number | null | undefined,
    otherMaxTemp: number | null | undefined,
    tempThresholds: any[], // TODO: Replace any[] with a more specific type if possible
    rtmds: any[] // TODO: Replace any[] with a more specific type if possible
  ) {
    const results: any[] = [] // TODO: Replace any[] with a more specific type if possible

    for (const rtmd of rtmds) {
      const defaultData: any = {
        // TODO: Replace any with a more specific type if possible
        ...rtmd,
        excursion: "unknown",
      }

      const threshold = (() => {
        if (otherMinTemp && otherMaxTemp) {
          return {
            min: otherMinTemp,
            max: otherMaxTemp,
          }
        }

        if (!Array.isArray(tempThresholds) || tempThresholds.length === 0)
          return null

        const active = tempThresholds.find((t) => t.is_active === 1)
        return active
          ? { min: active.min_temperature, max: active.max_temperature }
          : null
      })()

      if (!threshold) {
        results.push(defaultData)
        continue
      }

      const minThreshold = threshold ? threshold.min : null

      const maxThreshold = threshold ? threshold.max : null

      if (!minThreshold) {
        results.push(defaultData)
        continue
      }

      if (!maxThreshold) {
        results.push(defaultData)
        continue
      }

      if (
        rtmd &&
        (!rtmd.latest_log || Object.keys(rtmd.latest_log).length === 0)
      ) {
        results.push(defaultData)
        continue
      }

      const latestTemp = rtmd.latest_log.temperature

      if (!latestTemp) {
        results.push(defaultData)
        continue
      }

      if (minThreshold <= latestTemp && maxThreshold >= latestTemp) {
        results.push({
          ...rtmd,
          excursion: "normal",
        })
        continue
      }

      const durationCheck =
        minThreshold > latestTemp ? 1 : maxThreshold < latestTemp ? 8 : null

      if (!durationCheck) {
        results.push(defaultData)
        continue
      }

      const abnormalData = await this.repository.getOnsetOfAbnormalTemperature(
        c,
        rtmd.id,
        minThreshold,
        maxThreshold
      )

      const latestDateTime = rtmd.latest_log.actual_time

      const startDateTime = abnormalData?.actual_time

      if (!latestDateTime) {
        results.push(defaultData)
        continue
      }

      if (!startDateTime) {
        results.push(defaultData)
        continue
      }

      const timeDiff = this.getHourDiff(latestDateTime, startDateTime)

      const resultExcursion =
        timeDiff > durationCheck && durationCheck === 1
          ? "below"
          : timeDiff > durationCheck && durationCheck === 8
            ? "above"
            : null

      results.push({
        ...rtmd,
        excursion: resultExcursion,
      })
    }

    return results
  }

  getHourDiff(lastDatetime: string | Date, startDatetime: string | Date) {
    const diffMs =
      Number(new Date(lastDatetime)) - Number(new Date(startDatetime))
    const result = diffMs / (1000 * 60 * 60) // konversi ke jam, termasuk desimal
    return result
  }

  private async getVendorIotFilter(
    c: Context,
    currentUser: { id: number; manufacture_id?: number }
  ): Promise<number | number[]> {
    if (!currentUser?.manufacture_id) {
      return currentUser.id
    }

    const mapping = await this.repository.getIntegrationMapping(
      c,
      currentUser.manufacture_id,
      currentUser.id
    )

    if (mapping && mapping.external_id) {
      const externalIds = mapping.external_id
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n))

      if (externalIds.length > 0) {
        if (externalIds.includes(currentUser.id)) {
          return externalIds
        }
      }
    }

    return currentUser.id
  }
}
