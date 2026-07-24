import { DB } from "@/common/infrastructure/database/types/db.js"
import { MultiSheetZipExporter } from "@smile-health/lib/excel/multi-sheet-zip-v4.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { CustomContext } from "@smile-health/lib/types/context.js"
import { Context } from "hono"
import env from "../../config/env.js"
import { BaseWorker } from "../base.worker.js"
import { EntityMaterialRepository } from "../entity-material/entity-material.repository.js"
import ExportHistoryRepository from "../export-history/export-history.repository.js"
import { StockRepository } from "./stock.repository.js"
import { GetStocksQueries, StockGroupExporter } from "./stock.schema.js"
import momentTZ from "moment-timezone"
import moment from "moment"

export class StockWorker extends BaseWorker {
  constructor(
    private readonly stockRepo: StockRepository,
    private readonly entityMaterialRepo: EntityMaterialRepository,
    protected readonly exportHistoryRepo: ExportHistoryRepository
  ) {
    super(exportHistoryRepo)
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.VIEW_STOCK_EXPORTED, async (c, msg) => {
      const parseMsg = JSON.parse(msg ?? "{}")
      const { params, options, language, timezone, config } = parseMsg.payload

      await this.processAsyncExport(c, options, async () => {
        return await this.prepareExporterV2(
          c,
          language,
          timezone,
          params,
          config,
          options
        )
      })
    })
  }

  private async prepareExporter(
    c: CustomContext<DB>,
    language: string,
    timezone: string,
    params: GetStocksQueries,
    config: { material: { is_hierarchy_enabled?: boolean } }
  ) {
    const isHierarchy = config.material.is_hierarchy_enabled ?? false

    const exporter = new MultiSheetZipExporter({
      language,
      timezone,
      batchSize: env.EXPORT_EXCEL_BATCH_SIZE,
      bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
    })

    const stockGroup: StockGroupExporter = {
      id: c.var.t("common.stock"),
      name: c.var.t("common.stock"),
      sheets: {
        materialVariants: {
          sheetName: c.var.t("material_level.label.variant"),
        },
      },
      columns: {
        materialVariants: [
          { header: c.var.t("stock.sheet.entity_id"), width: 10 },
          { header: c.var.t("stock.sheet.entity_name"), width: 40 },
          { header: c.var.t("stock.sheet.province"), width: 30 },
          { header: c.var.t("stock.sheet.regency"), width: 30 },
          { header: c.var.t("stock.sheet.sub_district"), width: 30 },
          { header: c.var.t("stock.sheet.entity_type"), width: 10 },
          { header: c.var.t("stock.sheet.material_name_template"), width: 60 },
          { header: c.var.t("stock.sheet.material_name_variant"), width: 80 },
          { header: c.var.t("stock.sheet.material_hierarchy_code"), width: 30 },
          { header: c.var.t("stock.sheet.material_code"), width: 30 },
          { header: c.var.t("stock.sheet.batch_code"), width: 15 },
          { header: c.var.t("stock.sheet.expired_date"), width: 20 },
          { header: c.var.t("stock.sheet.activity"), width: 15 },
          { header: c.var.t("stock.sheet.qty"), width: 10 },
          { header: c.var.t("stock.sheet.min"), width: 5 },
          { header: c.var.t("stock.sheet.max"), width: 5 },
          { header: c.var.t("stock.sheet.price"), width: 10 },
          { header: c.var.t("stock.sheet.total_price"), width: 10 },
          { header: c.var.t("stock.sheet.budget_source"), width: 15 },
          { header: c.var.t("stock.sheet.budget_year"), width: 15 },
        ],
      },
    }

    if (isHierarchy) {
      stockGroup.sheets.materialTemplate = {
        sheetName: c.var.t("material_level.label.template"),
      }
      stockGroup.columns.materialTemplate = [
        { header: c.var.t("stock.sheet.entity_id"), width: 10 },
        { header: c.var.t("stock.sheet.entity_name"), width: 40 },
        { header: c.var.t("stock.sheet.province"), width: 30 },
        { header: c.var.t("stock.sheet.regency"), width: 30 },
        { header: c.var.t("stock.sheet.sub_district"), width: 30 },
        { header: c.var.t("stock.sheet.entity_type"), width: 10 },
        { header: c.var.t("stock.sheet.material_name"), width: 80 },
        { header: c.var.t("stock.sheet.material_hierarchy_code"), width: 30 },
        { header: c.var.t("stock.sheet.material_code"), width: 30 },
        { header: c.var.t("stock.sheet.on_hand_qty"), width: 10 },
        { header: c.var.t("stock.sheet.allocated_qty"), width: 10 },
        { header: c.var.t("stock.sheet.in_transit_qty"), width: 10 },
        { header: c.var.t("stock.sheet.available_qty"), width: 10 },
        { header: c.var.t("stock.sheet.min"), width: 5 },
        { header: c.var.t("stock.sheet.max"), width: 5 },
      ]
      // Sheet 1
      await this.#configExcel(exporter, stockGroup, "materialTemplate", true)
    }

    // Sheet 2, if hierarchy
    await this.#configExcel(
      exporter,
      stockGroup,
      "materialVariants",
      !isHierarchy
    )

    if (isHierarchy) {
      const hierarchyStream = await this.stockRepo.getHierarchyStreamData(
        c as Context,
        params
      )
      const variantStream = await this.stockRepo.getStreamData(
        c as Context,
        params,
        isHierarchy
      )

      console.log("processing template")

      await Promise.all([
        exporter.addRows(
          stockGroup.id,
          stockGroup.sheets.materialTemplate!.sheetName,
          this.transformStream(hierarchyStream, (item) => ({
            ...item,
            entity_type: item.entity_type
              ? c.var.t("entity_type.label." + item.entity_type)
              : "",
          }))
        ),

        exporter.addRows(
          stockGroup.id,
          stockGroup.sheets.materialVariants!.sheetName,
          this.transformStream(variantStream, (item) => ({
            ...item,
            entity_type: item.entity_type
              ? c.var.t("entity_type.label." + item.entity_type)
              : "",
          }))
        ),
      ])
    } else {
      const variantStream = await this.stockRepo.getStreamData(
        c as Context,
        params,
        isHierarchy
      )

      await exporter.addRows(
        stockGroup.id,
        stockGroup.sheets.materialVariants!.sheetName,
        variantStream.map((item) => ({
          ...item,
          entity_type: item.entity_type
            ? c.var.t("entity_type.label." + item.entity_type)
            : "",
        }))
      )
    }

    return exporter
  }

  async #configExcel(
    exporter: MultiSheetZipExporter,
    stockGroup: StockGroupExporter,
    groupId: string,
    initGroup: boolean = false
  ) {
    if (initGroup) {
      exporter.initFileGroup(stockGroup.id, stockGroup.name)
    }

    if (!stockGroup.sheets[groupId]?.sheetName) return

    await exporter.initSheet(
      stockGroup.id,
      stockGroup.sheets[groupId].sheetName
    )
    exporter.setColumns(
      stockGroup.id,
      stockGroup.sheets[groupId].sheetName,
      stockGroup.columns[groupId] ?? []
    )
  }

  private async prepareExporterV2(
    c: CustomContext<DB>,
    language: string,
    timezone: string,
    params: GetStocksQueries,
    config: { material: { is_hierarchy_enabled?: boolean } },
    options: {
      export_id: number
      original_filename: string
      filename: string
      language: string
    }
  ) {
    try {
      const isHierarchy = config.material.is_hierarchy_enabled ?? false

      // ✅ Use exact count for consistency (now getListStocksForExport returns individual records)
      let totalCount = 0
      let templateCount = 0
      let variantCount = 0

      if (isHierarchy) {
        const counts = await Promise.all([
          this.stockRepo.countStocksForExport(c, params, true),
          this.stockRepo.countStocksForExport(c, params, false),
        ])
        templateCount = counts[0]
        variantCount = counts[1]
        totalCount = templateCount + variantCount
        console.log(
          `[Stock Export] Count Hierarchy -> Template: ${templateCount}, Variant: ${variantCount}`
        )
      } else {
        totalCount = await this.stockRepo.countStocksForExport(c, params, false)
        variantCount = totalCount
      }
      console.log(`Total stocks to export: ${totalCount}`)

      // ✅ SMART EXPORT: Auto-determine ZIP and batch size based on totalRecords
      // - < 100k records per sheet: Single XLSX file, NO ZIP (best UX)
      // - >= 100k records on any sheet: ZIP with multiple Excel parts (performance)
      const SINGLE_FILE_THRESHOLD = 100000

      const isSingleFile = isHierarchy
        ? templateCount < SINGLE_FILE_THRESHOLD &&
          variantCount < SINGLE_FILE_THRESHOLD
        : totalCount < SINGLE_FILE_THRESHOLD

      // Dynamic batch size:
      // - Single Excel file: batchSize > totalCount (gabungan) agar tidak pecah part
      // - Multiple parts: batchSize = env config
      const batchSize = isSingleFile
        ? Math.max(totalCount + 1000, SINGLE_FILE_THRESHOLD)
        : env.EXPORT_EXCEL_BATCH_SIZE || 1000

      const useZip = !isSingleFile // Only ZIP if >= 100k records

      console.log(
        `[Stock Export] Smart export settings | ` +
          `Total records: ${totalCount.toLocaleString()} | ` +
          `Single file: ${isSingleFile} | ` +
          `Batch size: ${batchSize.toLocaleString()} | ` +
          `Use ZIP: ${useZip}`
      )

      // ✅ Update filename extension based on useZip decision
      const fileExtension = useZip ? "zip" : "xlsx"

      // Extract UUID from original_filename (format: UUID.extension)
      const uuidPart = options.original_filename.split(".")[0]
      const correctOriginalFilename = `${uuidPart}.${fileExtension}`

      // Extract base filename and timestamp from filename (format: Name_timestamp.extension)
      const filenameParts = options.filename.split(".")
      const filenameWithoutExt = filenameParts.slice(0, -1).join(".")
      const correctFilename = `${filenameWithoutExt}.${fileExtension}`

      // Update export_histories with correct filename extension
      await this.exportHistoryRepo.upsert(
        c,
        {
          original_filename: correctOriginalFilename,
          filename: correctFilename,
          log: `Preparing ${fileExtension.toUpperCase()} export (${totalCount.toLocaleString()} records)`,
        },
        options.export_id
      )

      console.log(
        `[Stock Export] Fixed filename extension: ${correctOriginalFilename} (useZip: ${useZip})`
      )

      // ✅ Update progress: Initializing Excel structure
      await this.exportHistoryRepo.upsert(
        c,
        {
          log: `Initializing Excel structure...`,
        },
        options.export_id
      )

      // ✅ Initialize exporter with smart settings
      const exporter = new MultiSheetZipExporter({
        language,
        timezone,
        batchSize: batchSize,
        bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
        tempDir: "/tmp/excel-exports/stocks",
        totalRecords: totalCount,
        useZip: useZip,
        originalFilename: correctOriginalFilename,
        filename: filenameWithoutExt,
      })

      // ✅ Build stock group - Now getListStocksForExport returns full details
      const stockGroup: StockGroupExporter = {
        id: c.var.t("common.stock"),
        name: c.var.t("common.stock"),
        sheets: {
          materialVariants: {
            sheetName: c.var.t("material_level.label.variant"),
          },
        },
        columns: {
          materialVariants: [
            {
              key: "entity_id",
              header: c.var.t("stock.sheet.entity_id"),
              width: 10,
            },
            {
              key: "entity_name",
              header: c.var.t("stock.sheet.entity_name"),
              width: 40,
            },
            {
              key: "province",
              header: c.var.t("stock.sheet.province"),
              width: 30,
            },
            {
              key: "regency",
              header: c.var.t("stock.sheet.regency"),
              width: 30,
            },
            {
              key: "sub_district",
              header: c.var.t("stock.sheet.sub_district"),
              width: 30,
            },
            {
              key: "entity_type",
              header: c.var.t("stock.sheet.entity_type"),
              width: 10,
            },
            {
              key: "material_name",
              header: c.var.t("stock.sheet.material_name_variant"),
              width: 80,
            },
            {
              key: "material_hierarchy_code",
              header: c.var.t("stock.sheet.material_hierarchy_code"),
              width: 30,
            },
            {
              key: "material_code",
              header: c.var.t("stock.sheet.material_code"),
              width: 30,
            },
            {
              key: "batch_code",
              header: c.var.t("stock.sheet.batch_code"),
              width: 15,
            },
            {
              key: "expired_date",
              header: c.var.t("stock.sheet.expired_date"),
              width: 20,
            },
            {
              key: "activity",
              header: c.var.t("stock.sheet.activity"),
              width: 15,
            },
            {
              key: "qty",
              header: c.var.t("stock.sheet.qty"),
              width: 10,
            },
            {
              key: "min",
              header: c.var.t("stock.sheet.min"),
              width: 5,
            },
            {
              key: "max",
              header: c.var.t("stock.sheet.max"),
              width: 5,
            },
            {
              key: "price",
              header: c.var.t("stock.sheet.price"),
              width: 10,
            },
            {
              key: "total_price",
              header: c.var.t("stock.sheet.total_price"),
              width: 10,
            },
            {
              key: "budget_source",
              header: c.var.t("stock.sheet.budget_source"),
              width: 15,
            },
            {
              key: "year",
              header: c.var.t("stock.sheet.budget_year"),
              width: 15,
            },
          ],
        },
      }

      if (isHierarchy) {
        stockGroup.sheets.materialTemplate = {
          sheetName: c.var.t("material_level.label.template"),
        }
        stockGroup.columns.materialTemplate = [
          {
            key: "entity_id",
            header: c.var.t("stock.sheet.entity_id"),
            width: 10,
          },
          {
            key: "entity_name",
            header: c.var.t("stock.sheet.entity_name"),
            width: 40,
          },
          {
            key: "province",
            header: c.var.t("stock.sheet.province"),
            width: 30,
          },
          {
            key: "regency",
            header: c.var.t("stock.sheet.regency"),
            width: 30,
          },
          {
            key: "sub_district",
            header: c.var.t("stock.sheet.sub_district"),
            width: 30,
          },
          {
            key: "entity_type",
            header: c.var.t("stock.sheet.entity_type"),
            width: 10,
          },
          {
            key: "material_name",
            header: c.var.t("stock.sheet.material_name"),
            width: 80,
          },
          {
            key: "material_hierarchy_code",
            header: c.var.t("stock.sheet.material_hierarchy_code"),
            width: 30,
          },
          {
            key: "material_code",
            header: c.var.t("stock.sheet.material_code"),
            width: 30,
          },
          {
            key: "total_qty",
            header: c.var.t("stock.sheet.on_hand_qty"),
            width: 10,
          },
          {
            key: "total_allocated_qty",
            header: c.var.t("stock.sheet.allocated_qty"),
            width: 10,
          },
          {
            key: "total_in_transit_qty",
            header: c.var.t("stock.sheet.in_transit_qty"),
            width: 10,
          },
          {
            key: "total_available_qty",
            header: c.var.t("stock.sheet.available_qty"),
            width: 10,
          },
          {
            key: "min",
            header: c.var.t("stock.sheet.min"),
            width: 5,
          },
          {
            key: "max",
            header: c.var.t("stock.sheet.max"),
            width: 5,
          },
        ]
      }

      // ✅ Initialize Excel sheets
      await this.#configExcel(exporter, stockGroup, "materialTemplate", true)
      await this.#configExcel(
        exporter,
        stockGroup,
        "materialVariants",
        !isHierarchy
      )

      // ✅ Update progress: Excel structure ready, starting data processing
      await this.exportHistoryRepo.upsert(
        c,
        {
          log: `Excel structure ready. Starting data processing...`,
        },
        options.export_id
      )

      // ✅ OPTIMIZED: DB streaming with batch size 1000 for better memory usage
      const DB_BATCH_SIZE = 1000
      let totalRecordsProcessed = 0
      let batchCount = 0
      const startTime = Date.now()
      let lastProgressUpdate = 0

      // Helper function to update progress
      const updateProgress = async (current: number, total: number) => {
        const progress =
          total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0
        // Only update if progress changed by at least 5%
        if (progress - lastProgressUpdate >= 5 || progress === 100) {
          lastProgressUpdate = progress
          await this.exportHistoryRepo.upsert(
            c,
            {
              log: `Processing: ${progress}% (${current}/${total} records)`,
            },
            options.export_id
          )
          console.log(`Export progress: ${progress}% (${current}/${total})`)
        }
      }

      // ✅ Log initial memory usage
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Stock Export] Initial memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      console.log(
        `[Stock Export] Starting TRUE STREAMING export | DB stream batch: ${DB_BATCH_SIZE.toLocaleString()} | Excel flush: every ${env.EXPORT_EXCEL_BATCH_SIZE || 1000} rows`
      )

      try {
        // ✅ Use correct streaming methods
        if (isHierarchy) {
          console.log(`[Stock Export] Processing template stocks...`)

          // ✅ Template sheet needs AGGREGATED quantities from getHierarchyStreamData()
          const hierarchyStream =
            await this.stockRepo.getHierarchyStreamDataIncludingUnrelated(
              c as Context,
              params
            )

          // Process stream with batching
          let streamBatch: any[] = []
          for await (const row of hierarchyStream) {
            streamBatch.push(row)

            if (streamBatch.length >= DB_BATCH_SIZE) {
              batchCount++
              totalRecordsProcessed += streamBatch.length

              const batchRows = streamBatch.map(
                (item) => this.buildStockRow(item, timezone, c, true) // isTemplate=true
              )

              await exporter.addRows(
                stockGroup.id,
                stockGroup.sheets.materialTemplate!.sheetName,
                batchRows
              )

              streamBatch = []

              if (batchCount % 10 === 0 && global.gc) {
                global.gc()
                console.log(
                  `[Stock Export] GC triggered after batch ${batchCount}`
                )
              }

              await updateProgress(totalRecordsProcessed, totalCount)
            }
          }

          // Process remaining rows
          if (streamBatch.length > 0) {
            batchCount++
            totalRecordsProcessed += streamBatch.length

            const batchRows = streamBatch.map(
              (item) => this.buildStockRow(item, timezone, c, true) // isTemplate=true
            )

            await exporter.addRows(
              stockGroup.id,
              stockGroup.sheets.materialTemplate!.sheetName,
              batchRows
            )
          }

          // ✅ Process variant stocks
          console.log(`[Stock Export] Processing variant stocks...`)
          await this.exportHistoryRepo.upsert(
            c,
            {
              log: `Processing variant stocks...`,
            },
            options.export_id
          )

          for await (const batch of this.stockRepo.getListStocksForExport(
            c,
            params,
            false,
            DB_BATCH_SIZE
          )) {
            batchCount++
            const batchLength = batch.length
            totalRecordsProcessed += batchLength

            console.log(
              `[Stock Export] Variant batch #${batchCount} | Size: ${batchLength.toLocaleString()} | Total: ${totalRecordsProcessed.toLocaleString()}`
            )

            // Process all items in batch together
            const batchRows = batch.map((item) =>
              this.buildStockRow(item, timezone, c)
            )

            // Add all rows at once
            await exporter.addRows(
              stockGroup.id,
              stockGroup.sheets.materialVariants!.sheetName,
              batchRows
            )

            // Clear batch for GC
            batch.length = 0

            // Force GC every 10 batches
            if (batchCount % 10 === 0 && global.gc) {
              global.gc()
              console.log(
                `[Stock Export] GC triggered after batch ${batchCount}`
              )
            }

            // Update progress after each batch
            await updateProgress(totalRecordsProcessed, totalCount)

            // Log progress per batch
            const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2)
            const recordsPerSecond = (
              (totalRecordsProcessed / (Date.now() - startTime)) *
              1000
            ).toFixed(2)

            console.log(
              `[Stock Export] Variant batch #${batchCount.toLocaleString()} | ` +
                `Processed: ${totalRecordsProcessed.toLocaleString()} records | ` +
                `Batch size: ${batchLength.toLocaleString()} | ` +
                `Elapsed: ${elapsedSeconds}s | ` +
                `Speed: ${recordsPerSecond} records/sec`
            )
          }
        } else {
          // Non-hierarchy: only variant stocks
          for await (const batch of this.stockRepo.getListStocksForExport(
            c,
            params,
            false,
            DB_BATCH_SIZE
          )) {
            batchCount++
            const batchLength = batch.length
            totalRecordsProcessed += batchLength

            console.log(
              `[Stock Export] Received batch #${batchCount} | Size: ${batchLength.toLocaleString()} | Total: ${totalRecordsProcessed.toLocaleString()}`
            )

            // Process all items in batch together
            const batchRows = batch.map((item) =>
              this.buildStockRow(item, timezone, c)
            )

            // Add all rows at once
            await exporter.addRows(
              stockGroup.id,
              stockGroup.sheets.materialVariants!.sheetName,
              batchRows
            )

            // Clear batch for GC
            batch.length = 0

            // Force GC every 10 batches
            if (batchCount % 10 === 0 && global.gc) {
              global.gc()
              console.log(
                `[Stock Export] GC triggered after batch ${batchCount}`
              )
            }

            // Update progress after each batch
            await updateProgress(totalRecordsProcessed, totalCount)

            // Log progress per batch
            const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2)
            const recordsPerSecond = (
              (totalRecordsProcessed / (Date.now() - startTime)) *
              1000
            ).toFixed(2)

            console.log(
              `[Stock Export] Batch #${batchCount.toLocaleString()} | ` +
                `Processed: ${totalRecordsProcessed.toLocaleString()} records | ` +
                `Batch size: ${batchLength.toLocaleString()} | ` +
                `Elapsed: ${elapsedSeconds}s | ` +
                `Speed: ${recordsPerSecond} records/sec`
            )
          }
        }
      } catch (error: any) {
        console.error(
          `[Stock Export] ERROR during batch processing:`,
          error.message,
          error.stack
        )
        throw error
      }

      // ✅ Final progress update
      await updateProgress(totalRecordsProcessed, totalCount)

      // ✅ Update progress: Starting finalization
      await this.exportHistoryRepo.upsert(
        c,
        {
          log: `Finalizing export file...`,
        },
        options.export_id
      )

      // ✅ Final memory log before finalize
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Stock Export] Before finalize: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      // ✅ Finalize - flush remaining rows to disk
      console.log(
        "[Stock Export] Finalizing: flushing remaining rows to disk..."
      )
      await exporter.finalizeToDisk()
      console.log(
        "[Stock Export] ✅ Finalize completed - all parts saved to disk"
      )

      // ✅ Update progress: File ready, preparing to upload
      await this.exportHistoryRepo.upsert(
        c,
        {
          log: `File ready. Uploading to storage...`,
        },
        options.export_id
      )

      // ✅ Final memory usage log
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Stock Export] Final memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
      const avgSpeed = (
        (totalRecordsProcessed / (Date.now() - startTime)) *
        1000
      ).toFixed(2)

      console.log(
        `[Stock Export] ✅ Export processing completed! | ` +
          `Total batches: ${batchCount.toLocaleString()} | ` +
          `Total records: ${totalRecordsProcessed.toLocaleString()} | ` +
          `Total time: ${totalTime}s | ` +
          `Avg speed: ${avgSpeed} records/sec | ` +
          `File type: ${fileExtension.toUpperCase()}`
      )
      console.log(
        `[Stock Export] Returning exporter to base.worker for upload to MinIO as ${fileExtension.toUpperCase()}...`
      )

      // ✅ RETURN exporter to base.worker for upload
      return exporter
    } catch (error) {
      console.error("Error exporting stock data:", error)
      throw error
    }
  }

  private buildStockRow(
    item: any,
    timezone: string,
    c: CustomContext<DB>,
    isTemplate: boolean = false
  ) {
    // Base fields for both template and variant rows
    const baseRow = {
      entity_id: item.entity_id,
      entity_name: item.entity_name,
      province: item.province || "",
      regency: item.regency || "",
      sub_district: item.sub_district || "",
      entity_type: item.entity_type
        ? c.var.t("entity_type.label." + item.entity_type)
        : "",
      material_name: item.material_name,
      material_hierarchy_code: item.material_hierarchy_code || "",
      material_code: item.material_code || "",
      min: item.min || 0,
      max: item.max || 0,
    }

    // Template sheet: aggregated quantities from hierarchy data
    if (isTemplate) {
      return {
        ...baseRow,
        total_qty: item.total_qty || 0,
        total_allocated_qty: item.total_allocated_qty || 0,
        total_in_transit_qty: item.total_in_transit_qty || 0,
        total_available_qty: item.total_available_qty || 0,
      }
    }

    // Variant sheet: individual item details
    return {
      ...baseRow,
      batch_code: item.batch_code || "",
      expired_date: item.expired_date || "",
      activity: item.activity || "",
      qty: item.qty || 0,
      price: item.price || 0,
      total_price: item.total_price || 0,
      budget_source: item.budget_source || "",
      year: item.year || 0,
    }
  }
}
