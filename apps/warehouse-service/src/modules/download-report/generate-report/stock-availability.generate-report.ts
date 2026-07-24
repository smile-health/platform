import { DB } from "@/common/infrastructure/database/types/db.js"
import { CustomContext } from "@smile-health/lib/types/context.js"
import { ConfigProgram } from "../download-report.schema.js"
import { ExcelZipExporter } from "../download-report.excel-zip.js"
import env from "@/config/env.js"
import { AbnormalStockModule } from "@/modules/stock-inventory/abnormal-stock/abnormal-stock.module.js"
import { StockAvailabilityModule } from "@/modules/stock-inventory/stock-availability/stock-availability.module.js"
import { StockAvailabilityEntityMaterialResponse } from "@/modules/stock-inventory/stock-availability/stock-availability.schema.js"
import moment from "moment"
import { Context } from "hono"
import { KFA_LEVEL_CODE } from "@/common/constants/material.js"
import { ENTITY_TYPE } from "@/common/constants/entity.js"

export class StockAvailabilityGenerateReport {
  constructor(
    private readonly abnormalStockModule: AbnormalStockModule,
    private readonly stockAvailabilityModule: StockAvailabilityModule
  ) {}

  async handleStockAvailabilityEntityMaterial(
    c: CustomContext<DB>,
    lang: string,
    programId: number,
    configProgram: ConfigProgram,
    month: number,
    year: number,
    provinceId?: number,
    regencyId?: number,
    printBy?: string
  ) {
    const startDate = moment(`${year}-${month}-01`)
    const endDate = startDate.clone().endOf("month")

    const materialLevelId = configProgram.material.is_hierarchy_enabled
      ? KFA_LEVEL_CODE.TEMPLATE
      : KFA_LEVEL_CODE.VARIANT

    let entityTypeIds: number[] = []
    if (!provinceId && !regencyId) {
      entityTypeIds = [
        ENTITY_TYPE.PROVINCE,
        ENTITY_TYPE.REGENCY,
        ENTITY_TYPE.HEALTHCARE_FACILITY,
        ENTITY_TYPE.DISTRICT_HEALTH_CENTER,
      ]
    } else if (provinceId && !regencyId) {
      entityTypeIds = [
        ENTITY_TYPE.REGENCY,
        ENTITY_TYPE.HEALTHCARE_FACILITY,
        ENTITY_TYPE.DISTRICT_HEALTH_CENTER,
      ]
    } else {
      entityTypeIds = [
        ENTITY_TYPE.HEALTHCARE_FACILITY,
        ENTITY_TYPE.DISTRICT_HEALTH_CENTER,
      ]
    }

    const queryParams = {
      from: startDate.format("YYYY-MM-DD 00:00:00"),
      to: endDate.format("YYYY-MM-DD 23:59:59"),
      period: "month" as const,
      information_type: "1" as const,
      province_id: provinceId,
      regency_id: regencyId,
      offset: 0,
      page: 1,
      paginate: 10,
      program_id: programId,
      material_level_id: materialLevelId,
      entity_type_ids: entityTypeIds,
    }

    const exporter = new ExcelZipExporter({
      language: lang,
      bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
      batchSize: 10000, // Process in smaller batches to reduce memory usage
    })

    const title: string = c.var.t("download-report.name.41", {
      month: month,
      year: year,
    })
    const filePath: string = `${crypto.randomUUID()}.zip`

    queryParams.program_id = programId

    // First, fetch a small batch to get material columns
    const materialQueryParams = { ...queryParams, page: 1, paginate: 1 }
    const materialSample =
      (await this.stockAvailabilityModule.getEntityMaterial(
        c as Context,
        materialQueryParams,
        false
      )) as StockAvailabilityEntityMaterialResponse

    // Get materials from the sample response
    const materialColumns = materialSample.data.categories

    // Prepare Sheet Group
    const exportGroup = {
      id: title,
      name: title.replace(/\//g, " "),
      sheets: {
        stockAvailability: {
          sheetName: c.var.t("download-report.sheet.stock-availability"),
        },
        zeroStock: {
          sheetName: c.var.t("download-report.sheet.zero-stock"),
        },
      },
    }

    exporter.setTimezone("Asia/Jakarta")
    exporter.initFileGroup(exportGroup.id, exportGroup.name)
    await exporter.initSheet(
      exportGroup.id,
      exportGroup.sheets.stockAvailability.sheetName
    )
    await exporter.initSheet(
      exportGroup.id,
      exportGroup.sheets.zeroStock.sheetName
    )

    // Set header for stock availability sheet
    await this.setHeader(
      exporter,
      exportGroup.id,
      exportGroup.sheets.stockAvailability.sheetName,
      c.var.t,
      printBy
    )

    // Set header for zero stock sheet
    await this.setHeader(
      exporter,
      exportGroup.id,
      exportGroup.sheets.zeroStock.sheetName,
      c.var.t,
      printBy
    )

    // Build columns for stock availability
    const columns = this.buildEntityMaterialColumns(c, materialColumns)

    exporter.setColumns(
      exportGroup.id,
      exportGroup.sheets.stockAvailability.sheetName,
      columns.map((col) => ({
        ...col,
        key: typeof col.key === "number" ? String(col.key) : col.key,
      })),
      "A4"
    )

    // Build columns for zero stock
    const zeroStockColumns = this.buildZeroStockColumns(c, materialColumns)

    exporter.setColumns(
      exportGroup.id,
      exportGroup.sheets.zeroStock.sheetName,
      zeroStockColumns.map((col) => ({
        ...col,
        key: typeof col.key === "number" ? String(col.key) : col.key,
      })),
      "A4"
    )

    console.log("Start processing stock availability data")

    // Process stock availability data using streaming
    let stockRowCount = 0
    await this.stockAvailabilityModule.getEntityMaterial(
      c as Context,
      queryParams,
      false, // not download mode
      async (chunk) => {
        // Transform chunk data for Excel
        const excelChunk = chunk.map((item, index) => {
          const row: Record<string, unknown> = {
            no: stockRowCount + index + 1,
            province_name: item.province_name || "",
            regency_name: item.regency_name || "",
            entity_id: item.id,
            entity_name: item.name,
          }

          // Add material availability data
          materialColumns.forEach((material, materialIndex) => {
            const materialKey = `sa_${material.id}`
            row[materialKey] = item.period[materialIndex]?.availability || 0
          })

          return row
        })

        // Add chunk to exporter
        await exporter.addRows(
          exportGroup.id,
          exportGroup.sheets.stockAvailability.sheetName,
          stockRowCount === 0 ? [{}, {}, {}, ...excelChunk] : excelChunk
        )

        stockRowCount += chunk.length

        // Log progress every 10000 rows
        if (stockRowCount % 10000 === 0) {
          console.log(`Processed ${stockRowCount} stock availability rows`)
          // Check memory usage
          const memUsage = process.memoryUsage()
          const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
          console.log(`Memory usage: ${heapUsedMB} MB`)

          // Warning at 70% of heap limit (assuming 2GB limit)
          if (heapUsedMB > 1400) {
            console.warn("⚠️ High memory usage detected")
          }
        }
      }
    )

    console.log(
      `End processing stock availability data - Total rows: ${stockRowCount}`
    )

    console.log("Start processing zero stock data")

    // Process zero stock data using streaming
    const zeroStockQueryParams = {
      ...queryParams,
      transaction_type: "zero" as const,
      information_type: "days" as const,
    }

    let zeroStockRowCount = 0
    await this.abnormalStockModule.getEntityMaterial(
      c as Context,
      zeroStockQueryParams,
      false, // not download mode
      async (chunk) => {
        // Transform chunk data for Excel
        const excelChunk = chunk.map((item, index) => {
          const row: Record<string, unknown> = {
            no: zeroStockRowCount + index + 1,
            province_name: item.province_name || "",
            regency_name: item.regency_name || "",
            entity_id: item.id,
            entity_name: item.name,
          }

          // Add zero stock data
          materialColumns.forEach((material, materialIndex) => {
            const materialKey = `zs_${material.id}`
            const periodData = item.period[materialIndex]
            row[materialKey] = periodData?.value || 0
          })

          return row
        })

        // Add chunk to exporter
        await exporter.addRows(
          exportGroup.id,
          exportGroup.sheets.zeroStock.sheetName,
          zeroStockRowCount === 0 ? [{}, {}, {}, ...excelChunk] : excelChunk
        )

        zeroStockRowCount += chunk.length

        // Log progress every 10000 rows
        if (zeroStockRowCount % 10000 === 0) {
          console.log(`Processed ${zeroStockRowCount} zero stock rows`)
          // Check memory usage
          const memUsage = process.memoryUsage()
          const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
          console.log(`Memory usage: ${heapUsedMB} MB`)

          // Warning at 70% of heap limit (assuming 2GB limit)
          if (heapUsedMB > 1400) {
            console.warn("⚠️ High memory usage detected")
          }
        }
      }
    )

    console.log(
      `End processing zero stock data - Total rows: ${zeroStockRowCount}`
    )

    console.log("Start generating and saving zip file")
    await exporter.generateAndSaveZipFile(filePath)
    console.log("End generating and saving zip file")

    return {
      status: true,
      filename: `${title} ${moment().format("DD-MM-YYYY")}`,
      filePath,
    }
  }

  private buildEntityMaterialColumns(
    c: CustomContext<DB>,
    materials: Array<{ id: number; label: string }>
  ) {
    return [
      { key: "no", header: c.var.t("download-report.column.no"), width: 10 },
      {
        key: "province_name",
        header: c.var.t("common.province"),
        width: 20,
      },
      {
        key: "regency_name",
        header: c.var.t("common.regency"),
        width: 20,
      },
      {
        key: "entity_id",
        header: c.var.t("common.entity_id"),
        width: 25,
      },
      {
        key: "entity_name",
        header: c.var.t("common.entity"),
        width: 25,
      },
      ...materials.map((material) => ({
        key: `sa_${material.id}`,
        header: material.label,
        width: 20,
      })),
    ]
  }

  private buildZeroStockColumns(
    c: CustomContext<DB>,
    materials: Array<{ id: number; label: string }>
  ) {
    return [
      { key: "no", header: c.var.t("download-report.column.no"), width: 10 },
      {
        key: "province_name",
        header: c.var.t("common.province"),
        width: 20,
      },
      {
        key: "regency_name",
        header: c.var.t("common.regency"),
        width: 20,
      },
      {
        key: "entity_id",
        header: c.var.t("common.entity_id"),
        width: 25,
      },
      {
        key: "entity_name",
        header: c.var.t("common.entity"),
        width: 25,
      },
      ...materials.map((material) => ({
        key: `zs_${material.id}`,
        header: material.label,
        width: 20,
      })),
    ]
  }

  private async setHeader(
    exporter: ExcelZipExporter,
    id: string,
    sheet: string,
    translation: (key: string, params?: Record<string, unknown>) => string,
    printBy?: string
  ) {
    // Add title
    exporter.setColumns(
      id,
      sheet,
      [
        {
          header: sheet,
          width: 30,
        },
      ],
      "A1"
    )

    // Add print by
    exporter.setColumns(
      id,
      sheet,
      [
        {
          header: translation("download-report.header.print_by"),
          width: 20,
        },
        {
          header: printBy || "Administrator",
          width: 30,
        },
      ],
      "A2"
    )

    // Add data update info
    exporter.setColumns(
      id,
      sheet,
      [
        {
          header: translation("download-report.header.data_update"),
          width: 20,
        },
        {
          header: exporter.getFormatDate(),
          width: 30,
        },
      ],
      "A3"
    )
  }
}
