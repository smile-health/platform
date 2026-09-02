import { DB, WsEntities } from "@/common/infrastructure/database/types/db.js"
import env from "@/config/env.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { CustomContext } from "@smile-health/lib/types/context.js"
import { Selectable } from "kysely"
import moment from "moment"
import momentTZ from "moment-timezone"
import { BaseWorker } from "../base.worker.js"
import ExportHistoryRepository from "../export-history/export-history.repository.js"
import { OrderRepository } from "./order.repository.js"
import { GetOrderQueries } from "./order.schema.js"
import { ORDER_STATUS } from "@/common/constants/order.js"
import { KFA_LEVEL_ID } from "@/common/constants/material.js"
import { MultiSheetZipExporter } from "@smile-health/lib/excel/multi-sheet-zip-v3.js"

export class OrderWorker extends BaseWorker {
  constructor(
    private readonly repo: OrderRepository,
    protected readonly exportHistoryRepo: ExportHistoryRepository
  ) {
    super(exportHistoryRepo)
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.ORDER_EXPORTED, async (c, msg) => {
      console.log(
        `[Order Worker] Received message from topic: ${TOPIC.ORDER_EXPORTED}`
      )
      console.log(
        `[Order Worker] Raw message:`,
        msg ? msg.substring(0, 200) + "..." : "empty"
      )

      const parseMsg = JSON.parse(msg ?? "{}")
      const {
        params,
        options,
        entityId,
        roleId,
        timezone,
        programId,
        userEntity,
        deviceType,
        activityIds,
      } = parseMsg.payload

      console.log(
        `[Order Worker] Message parsed | Export ID: ${options.export_id} | ` +
          `Entity ID: ${entityId} | Role ID: ${roleId} | Program ID: ${programId} | ` +
          `Device Type: ${deviceType} | Timezone: ${timezone}`
      )
      console.log(
        `[Order Worker] Export options | Filename: ${options.filename} | ` +
          `Original filename: ${options.original_filename} | Language: ${options.language}`
      )
      console.log(
        `[Order Worker] Query params:`,
        JSON.stringify(params, null, 2)
      )
      console.log(
        `[Order Worker] Activity IDs from payload:`,
        activityIds
      )

      // ✅ IMPORTANT: Set activityIds to context so repository can use it
      // This is normally set by middleware in HTTP context, but in worker we need to set manually
      if (activityIds && Array.isArray(activityIds)) {
        c.var.activityIds = activityIds
        console.log(
          `[Order Worker] Activity IDs set to context: ${activityIds.length} activities`
        )
      } else {
        console.warn(
          `[Order Worker] WARNING: activityIds is undefined or invalid in payload! Using fallback [-1]`
        )
        c.var.activityIds = [-1] // Fallback to no activity filter
      }

      await this.processAsyncExport(c, options, async () => {
        console.log(
          `[Order Worker] Starting processAsyncExport | Export ID: ${options.export_id}`
        )
        return await this.prepareExporter(
          c,
          options.language,
          timezone,
          params,
          entityId,
          roleId,
          programId,
          userEntity,
          deviceType,
          options
        )
      })
    })
  }

  private async prepareExporter(
    c: CustomContext<DB>,
    language: string,
    timezone: string,
    params: GetOrderQueries,
    entityId: number,
    roleId: number,
    programId: number,
    userEntity: Selectable<WsEntities>,
    deviceType: number,
    options: {
      export_id: number
      original_filename: string
      filename: string
      language: string
    }
  ) {
    try {
      // ✅ Validate activityIds
      const activityIds = c.var.activityIds
      console.log(
        `[Order Export] PrepareExporter called | ` +
          `Activity IDs: ${activityIds?.length || 0} | ` +
          `Entity ID: ${entityId} | Program ID: ${programId}`
      )

      if (!activityIds || activityIds.length === 0) {
        throw new Error("No activity IDs provided. Export cannot proceed.")
      }

      // ✅ Use ClickHouse count for consistency
      const totalCount = await this.repo.countOrderForExport(
        c,
        params,
        entityId,
        roleId,
        programId,
        userEntity,
        deviceType
      )
      console.log(`Total orders to export (ClickHouse): ${totalCount}`)

      // ✅ SMART EXPORT: Auto-determine ZIP and batch size based on totalRecords
      // - < 100k records: Single XLSX file, NO ZIP (best UX)
      // - >= 100k records: ZIP with multiple Excel parts (performance)
      const SINGLE_FILE_THRESHOLD = 100000
      const isSingleFile = totalCount < SINGLE_FILE_THRESHOLD

      // Dynamic batch size:
      // - < 100k: batchSize > totalCount (single Excel file)
      // - >= 100k: batchSize = env config (multiple parts)
      const batchSize = isSingleFile
        ? Math.max(totalCount + 1000, SINGLE_FILE_THRESHOLD)
        : env.EXPORT_EXCEL_BATCH_SIZE || 1000

      const useZip = !isSingleFile // Only ZIP if >= 100k records

      console.log(
        `[Order Export] Smart export settings | ` +
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
        `[Order Export] Fixed filename extension: ${correctOriginalFilename} (useZip: ${useZip})`
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
        timezone: timezone,
        batchSize: totalCount > SINGLE_FILE_THRESHOLD ? SINGLE_FILE_THRESHOLD : batchSize,
        bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
        tempDir: "/tmp/excel-exports/orders",
        totalRecords: totalCount,
        useZip: useZip,
        originalFilename: correctOriginalFilename,
        filename: filenameWithoutExt,
      })

      const orderGroup = {
        id: "orders",
        name: c.var.t("order.export.group_name"),
        sheets: {
          items: { sheetName: c.var.t("order.export.sheet.items") },
        },
        columns: {
          items: [
            {
              key: "order_id",
              header: c.var.t("order.label.order_id"),
              width: 15,
            },
            {
              key: "status",
              header: c.var.t("order.label.status"),
              width: 15,
            },
            {
              key: "customer_name",
              header: c.var.t("order.label.customer_name"),
              width: 50,
            },
            {
              key: "vendor_name",
              header: c.var.t("order.label.vendor_name"),
              width: 50,
            },
            {
              key: "material_name_kfa",
              header: c.var.t("order.label.material_name_kfa"),
              width: 40,
            },
            {
              key: "material_name",
              header: c.var.t("order.label.material_name"),
              width: 40,
            },
            {
              key: "order_item_reason",
              header: c.var.t("order.label.order_item_reason"),
              width: 30,
            },
            {
              key: "total_order_item",
              header: c.var.t("order.label.total_order_item"),
              width: 20,
            },
            {
              key: "received_qty",
              header: c.var.t("order.label.total_fulfilled_item"),
              width: 15,
            },
            {
              key: "activity_name",
              header: c.var.t("order.label.activity_name"),
              width: 15,
            },
            {
              key: "created_by",
              header: c.var.t("order.label.created_by"),
              width: 25,
            },
            {
              key: "created_at",
              header: c.var.t("order.label.created_at"),
              width: 15,
            },
            {
              key: "updated_at",
              header: c.var.t("order.label.updated_at"),
              width: 15,
            },
            {
              key: "updated_by",
              header: c.var.t("order.label.updated_by"),
              width: 25,
            },
            {
              key: "batch",
              header: c.var.t("order.label.batch"),
              width: 15,
            },
            {
              key: "expired_date_batch",
              header: c.var.t("order.label.expired_date_batch"),
              width: 15,
            },
            {
              key: "allocated_qty",
              header: c.var.t("order.label.allocated_qty"),
              width: 15,
            },
            {
              key: "delivery_type",
              header: c.var.t("order.label.delivery_type"),
              width: 15,
            },
            {
              key: "delivery_number",
              header: c.var.t("order.label.no_document"),
              width: 30,
            },
            {
              key: "release_date",
              header: c.var.t("order.label.release_date"),
              width: 15,
            },
            {
              key: "notes",
              header: c.var.t("order.label.notes"),
              width: 40,
            },
            {
              key: "total_confirmed_item",
              header: c.var.t("order.label.total_confirmed_item"),
              width: 20,
            },
            {
              key: "shipped_comment",
              header: c.var.t("order.label.shipped_comment"),
              width: 40,
            },
            {
              key: "confirmed_comment",
              header: c.var.t("order.label.confirmed_comment"),
              width: 40,
            },
            {
              key: "confirmed_at",
              header: c.var.t("order.label.confirmed_at"),
              width: 15,
            },
            {
              key: "allocated_at",
              header: c.var.t("order.label.allocated_at"),
              width: 15,
            },
            {
              key: "shipped_at",
              header: c.var.t("order.label.shipped_at"),
              width: 15,
            },
          ],
        },
      }

      exporter.initFileGroup(orderGroup.id, orderGroup.name)
      await exporter.initSheet(
        orderGroup.id,
        orderGroup.sheets.items.sheetName
      )
      exporter.setColumns(
        orderGroup.id,
        orderGroup.sheets.items.sheetName,
        orderGroup.columns.items
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
      const canceledOrders: Record<number, any[]> = {}

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
          `[Order Export] Initial memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      console.log(
        `[Order Export] Starting TRUE STREAMING export | DB stream batch: ${DB_BATCH_SIZE.toLocaleString()} | Excel flush: every ${env.EXPORT_EXCEL_BATCH_SIZE || 1000} rows`
      )

      try {
        // ✅ Use streaming batch retrieval
        for await (const batch of this.repo.getListOrderForExport(
          c,
          params,
          entityId,
          roleId,
          programId,
          userEntity,
          deviceType,
          DB_BATCH_SIZE
        )) {
          batchCount++
          const batchLength = batch.length
          totalRecordsProcessed += batchLength

          console.log(
            `[Order Export] Received batch #${batchCount} | Size: ${batchLength.toLocaleString()} | Total: ${totalRecordsProcessed.toLocaleString()}`
          )

          // ✅ Process each item in the batch
          for (const item of batch) {
            const isTargetStatus = [
              ORDER_STATUS.PENDING,
              ORDER_STATUS.CONFIRMED,
              ORDER_STATUS.CANCELED,
            ].includes(item.status_id)

            const isVariant =
              item.material_level_id_child === KFA_LEVEL_ID.VARIANT

            if (item.status_id === ORDER_STATUS.CANCELED) {
              if (!canceledOrders[item.id]) canceledOrders[item.id] = []
              canceledOrders[item.id].push(item)
              continue
            }

            const shouldInclude =
              isTargetStatus || (isVariant && item.stock_id)
            if (!shouldInclude) continue

            const row = this.buildRow(item, timezone, c)

            // Add single row, exporter will auto-flush every batchSize rows
            await exporter.addRows(
              orderGroup.id,
              orderGroup.sheets.items.sheetName,
              [row]
            )
          }

          // ✅ Clear batch array for GC
          batch.length = 0

          // ✅ Force GC every 10 batches
          if (batchCount % 10 === 0 && global.gc) {
            global.gc()
            console.log(`[Order Export] GC triggered after batch ${batchCount}`)
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
            `[Order Export] Batch #${batchCount.toLocaleString()} | ` +
              `Processed: ${totalRecordsProcessed.toLocaleString()} records | ` +
              `Batch size: ${batchLength.toLocaleString()} | ` +
              `Elapsed: ${elapsedSeconds}s | ` +
              `Speed: ${recordsPerSecond} records/sec`
          )
        }

        // ✅ Process canceled orders
        console.log(`[Order Export] Processing ${Object.keys(canceledOrders).length} canceled orders...`)
        await this.exportHistoryRepo.upsert(
          c,
          {
            log: `Processing canceled orders...`,
          },
          options.export_id
        )
        
        for (const orderId in canceledOrders) {
          const items = canceledOrders[orderId]

          const variantItem = items.find(
            (i) => i.material_level_id_child === KFA_LEVEL_ID.VARIANT
          )
          const selected = variantItem
            ? variantItem
            : items.find(
                (i) => i.material_level_id_parent === KFA_LEVEL_ID.TEMPLATE
              )

          if (selected) {
            const row = this.buildRow(selected, timezone, c)
            await exporter.addRows(
              orderGroup.id,
              orderGroup.sheets.items.sheetName,
              [row]
            )
            totalRecordsProcessed++
          }
        }
      } catch (error: any) {
        console.error(
          `[Order Export] ERROR during batch processing:`,
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
          `[Order Export] Before finalize: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      // ✅ Finalize - flush remaining rows to disk
      console.log("[Order Export] Finalizing: flushing remaining rows to disk...")
      await exporter.finalizeToDisk()
      console.log("[Order Export] ✅ Finalize completed - all parts saved to disk")

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
          `[Order Export] Final memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
      const avgSpeed = (
        (totalRecordsProcessed / (Date.now() - startTime)) *
        1000
      ).toFixed(2)

      console.log(
        `[Order Export] ✅ Export processing completed! | ` +
          `Total batches: ${batchCount.toLocaleString()} | ` +
          `Total records: ${totalRecordsProcessed.toLocaleString()} | ` +
          `Total time: ${totalTime}s | ` +
          `Avg speed: ${avgSpeed} records/sec | ` +
          `File type: ${fileExtension.toUpperCase()}`
      )
      console.log(
        `[Order Export] Returning exporter to base.worker for upload to MinIO as ${fileExtension.toUpperCase()}...`
      )

      // ✅ RETURN exporter to base.worker for upload
      return exporter
    } catch (error) {
      console.error("Error exporting order data:", error)
      throw error
    }
  }

  private buildRow(item: any, timezone: string, c: CustomContext<DB>) {
    return {
      order_id: item.id,
      status: item.status ? c.var.t(`order.label.${item.status}`) : "",
      customer_name: item.customer_name,
      vendor_name: item.vendor_name,
      material_name_kfa: item.material_name_kfa,
      material_name: item.material_name,
      order_item_reason: item.reason
        ? c.var.t(`order_reason.label.${item.reason}`)
        : "",
      total_order_item: item.ordered_qty,
      received_qty: item.received_qty,
      activity_name: item.activity_name,
      created_by: item.created_by,
      created_at: momentTZ(item.created_at)
        .tz(timezone)
        .format("YYYY-MM-DD HH:mm:ss"),
      updated_at: momentTZ(item.updated_at)
        .tz(timezone)
        .format("YYYY-MM-DD HH:mm:ss"),
      updated_by: item.updated_by,
      batch: item.code_batch,
      expired_date_batch: item.expired_date_batch
        ? moment(item.expired_date_batch).format("DD/MM/YYYY")
        : "",
      allocated_qty: item.allocated_qty,
      delivery_number: item.delivery_number,
      delivery_type: item.delivery_type_name,
      no_document: item.no_document,
      release_date: item.released_date
        ? moment(item.released_date).format("DD/MM/YYYY")
        : "",
      notes: item.notes,
      total_confirmed_item: item.confirmed_qty,
      shipped_comment: item.comment_shipped,
      confirmed_comment: item.comment_confirmed,
      confirmed_at: item.confirmed_at
        ? moment(item.confirmed_at).format("DD/MM/YYYY")
        : "",
      allocated_at: item.allocated_at
        ? moment(item.allocated_at).format("DD/MM/YYYY")
        : "",
      shipped_at: item.shipped_at
        ? moment(item.shipped_at).format("DD/MM/YYYY")
        : "",
    }
  }
}
