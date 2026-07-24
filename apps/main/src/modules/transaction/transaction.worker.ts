import { TRANSACTION_TYPE } from "@/common/constants/transaction.js"
import { slave } from "@/common/infrastructure/database/slave.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { MultiSheetZipExporter } from "@smile/lib/excel/multi-sheet-zip-v3.js"
import { Consumer } from "@smile/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import { CustomContext } from "@smile/lib/types/context.js"
import { collect, formatDateWithTimezone } from "@smile/lib/utils.js"
import { Context } from "hono"
import env from "../../config/env.js"
import { BaseWorker } from "../base.worker.js"
import ExportHistoryRepository from "../export-history/export-history.repository.js"
import { TransactionRepository } from "./transaction.repository.js"
import {
  PublishTrxDTO,
  TransactionListCursorPaginatedQueries,
  TransactionListPaginatedRequestDTO,
  UpsertTransactionListDTO,
} from "./transaction.schema.js"
import { doDecrypt } from "./utils/transaction.encryption.js"

export class TransactionWorker extends BaseWorker {
  constructor(
    private readonly repo: TransactionRepository,
    protected readonly exportHistoryRepo: ExportHistoryRepository
  ) {
    super(exportHistoryRepo)
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.TRANSACTION_CREATED, async (c, msg) => {
      const { payload } = JSON.parse(msg ?? "{}") as {
        payload: PublishTrxDTO[]
      }

      const details = await this.repo.getMapDetails(c, collect(payload, "id"))

      const data = payload.map((trx) => ({
        ...(details[trx.id] as object),
        transaction_ids: trx.transaction_ids,
        discard: trx.discard,
        rabies: trx.rabies,
      }))

      for (const trx of data) {
        await this.syncToClickhouse(c, trx)

        if (trx.discard) {
          const discardTrx = await this.repo.findDetailById(
            c as Context,
            trx.discard.id
          )
          if (discardTrx) await this.syncToClickhouse(c, discardTrx)
        }
      }
    })

    consumer.route(TOPIC.TRANSACTION_EXPORTED, async (c, msg) => {
      const parseMsg = JSON.parse(msg ?? "{}")
      const {
        params,
        options,
        language,
        timezone,
        config,
        programName,
        activityIds,
        programId,
      } = parseMsg.payload

      await this.processAsyncExport(c, options, async () => {
        c.var["activityIds"] = activityIds
        c.var["programId"] = programId
        console.log(
          `[Export] Activity IDs set: ${activityIds?.length || 0} activities | ` +
          `First activity: ${activityIds?.[0] || "none"}`
        )

        return await this.prepareExporter(
          c,
          language,
          timezone,
          params,
          typeof config === "string" ? JSON.parse(config) : config,
          programName,
          options
        )
      })
    })
  }

  private async syncToClickhouse(
    c: CustomContext<DB>,
    payload: UpsertTransactionListDTO
  ) {
    return await this.repo.insertTransactionList(payload)
  }

  private isValidDate(date: any): date is Date {
    return (
      date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 0
    )
  }

  private parseDateSafely(dateValue: any): string | null {
    if (
      dateValue == null ||
      dateValue === "" ||
      dateValue === "0000-00-00" ||
      dateValue === "0000-00-00 00:00:00"
    ) {
      return null
    }

    const date = new Date(dateValue)

    if (!this.isValidDate(date)) {
      return null
    }

    return date.toISOString().split("T")[0] ?? null
  }

  private buildRowExcel(
    translate,
    isHierarchyEnabled,
    programName,
    timezone,
    item
  ) {
    const row = {
      entity_id: item.entity_id,
      entity_name: item.entity_name,
      ...(isHierarchyEnabled
        ? {
          parent_material_id: item.parent_material_id,
          parent_material_name: item.parent_material_name,
        }
        : {}),
      material_id: item.material_id,
      material_name: item.material_name,
      activity_name: item.activity_name,
      opening_qty: item.opening_qty,
      change_qty: item.change_qty,
      closing_qty: item.closing_qty,
      transaction_type_title: translate(
        `transaction.type.${item.transaction_type_id}`
      ),
      transaction_reason_title: item.transaction_reason_title
        ? translate(`transaction.reason.${item.transaction_reason_title}`)
        : item.transaction_reason_title,
      customer_name: item.companion_entity_id
        ? item.companion_entity_name
        : item.customer_name,
      vendor_name: item.companion_entity_id
        ? item.entity_name
        : item.vendor_name,
      order_id: item.order_id,
      order_status_label: item.order_status_label
        ? translate(`order.status.${item.order_status_label}`)
        : item.order_status_label,
      order_type_label: item.order_type_label
        ? translate(`order.type.${item.order_type_label}`)
        : item.order_type_label,
      stock_activity_name: item.stock_activity_name,
      stock_allocated_qty: item.stock_allocated_qty,
      batch_code: item.batch_code,
      batch_expired_date: this.parseDateSafely(item.batch_expired_date),
      manufacture_name: item.manufacture_name,
      actual_transaction_date: this.parseDateSafely(
        item.actual_transaction_date
      ),
      source_program_name: programName,
      source_activity_name: item.activity_name,
      companion_program_name: item.companion_program_name ?? null,
      companion_activity_name: item.companion_activity_name ?? null,
      patient_id: item.patient_id ?? "-",
      patient_nik: doDecrypt(item.patient_nik),
      patient_name: doDecrypt(item.patient_name),
      sequence_title: item.sequence_title ? translate(item.sequence_title) : "",
      patient_kipi:
        item.patient_kipi
          ?.split(";")
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => {
            const key = `reaction.label.${value}`
            const translated = translate(key)
            return translated === key ? value : translated
          })
          .join("; ") ?? "-",
      created_by_fullname:
        `${item.created_by_firstname ?? ""} ${item.created_by_lastname ?? ""}`.trim(),
      created_at: formatDateWithTimezone(item.created_at, timezone),
    }

    if (item.transaction_type_id === TRANSACTION_TYPE.RECEIPTS) {
      ;[row.customer_name, row.vendor_name] = [
        row.vendor_name,
        row.customer_name,
      ]
    }

    return row
  }

  private async prepareExporter(
    c: CustomContext<DB>,
    language: string,
    timezone: string,
    params: TransactionListPaginatedRequestDTO,
    config: { material: { is_hierarchy_enabled?: boolean } },
    programName: string,
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
        `[Export] PrepareExporter called | ` +
        `Activity IDs: ${activityIds?.length || 0} | ` +
        `First ID: ${activityIds?.[0] || "none"}`
      )

      if (!activityIds || activityIds.length === 0) {
        throw new Error("No activity IDs provided. Export cannot proceed.")
      }

      const isHierarchyEnabled = config.material.is_hierarchy_enabled ?? false

      // ✅ Use ClickHouse count (same as API /count) for consistency
      // Convert params to TransactionListCursorPaginatedQueries for getTransactionCount
      const countParams: TransactionListCursorPaginatedQueries = {
        ...params,
        paginate: 50,
      }
      const totalCount = await this.repo.getTransactionCount(
        c as Context,
        countParams
      )
      console.log(`Total transactions to export (ClickHouse): ${totalCount}`)

      // ✅ SMART EXPORT: Auto-determine ZIP and batch size based on totalRecords
      // - < 1M records: Single XLSX file, NO ZIP (best UX)
      // - >= 1M records: ZIP with multiple Excel parts (performance)
      const SINGLE_FILE_THRESHOLD = 100000
      const isSingleFile = totalCount < SINGLE_FILE_THRESHOLD

      // Dynamic batch size:
      // - < 1M: batchSize > totalCount (single Excel file)
      // - >= 1M: batchSize = env config (multiple parts)
      const batchSize = isSingleFile
        ? Math.max(totalCount + 1000, SINGLE_FILE_THRESHOLD) // Ensure single file
        : env.EXPORT_EXCEL_BATCH_SIZE || 1000

      const useZip = !isSingleFile // Only ZIP if >= 1M records

      console.log(
        `[Export] Smart export settings | ` +
        `Total records: ${totalCount.toLocaleString()} | ` +
        `Single file: ${isSingleFile} | ` +
        `Batch size: ${batchSize.toLocaleString()} | ` +
        `Use ZIP: ${useZip}`
      )

      // ✅ FIX: Update filename extension based on useZip decision
      const fileExtension = useZip ? "zip" : "xlsx"

      // Extract UUID from original_filename (format: UUID.extension)
      const uuidPart = options.original_filename.split(".")[0]
      const correctOriginalFilename = `${uuidPart}.${fileExtension}`

      // Extract base filename and timestamp from filename (format: Name_timestamp.extension)
      const filenameParts = options.filename.split(".")
      const filenameWithoutExt = filenameParts.slice(0, -1).join(".")
      const correctFilename = `${filenameWithoutExt}.${fileExtension}`

      // Update export_histories with correct filename extension (temporary, will be overridden after upload)
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
        `[Export] Fixed filename extension: ${correctOriginalFilename} (useZip: ${useZip})`
      )

      // ✅ SAFEST: Module-specific temp directory with smart ZIP
      const exporter = new MultiSheetZipExporter({
        language,
        timezone: timezone,
        batchSize:
          totalCount > SINGLE_FILE_THRESHOLD
            ? SINGLE_FILE_THRESHOLD
            : batchSize,
        bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
        tempDir: "/tmp/excel-exports/transactions", // Module-specific base directory
        totalRecords: totalCount, // For auto-determining ZIP
        useZip: useZip, // false = single XLSX, true = ZIP
        originalFilename: correctOriginalFilename, // Pass corrected filename for upload
        filename: filenameWithoutExt,
      })

      const transactionsGroup = {
        id: "transactions",
        name: c.var.t("transaction.export.title"),
        sheets: {
          transaction: { sheetName: c.var.t("transaction.export.title") },
        },
        columns: {
          transaction: [
            {
              key: "entity_id",
              header: c.var.t("transaction.export.entity_id"),
              width: 10,
            },
            {
              key: "entity_name",
              header: c.var.t("transaction.export.entity_name"),
              width: 40,
            },
            ...(isHierarchyEnabled
              ? [
                {
                  key: "parent_material_id",
                  header: c.var.t("transaction.export.parent_material_id"),
                  width: 10,
                },
                {
                  key: "parent_material_name",
                  header: c.var.t("transaction.export.parent_material_name"),
                  width: 40,
                },
              ]
              : []),
            {
              key: "material_id",
              header: c.var.t("transaction.export.material_id"),
              width: 10,
            },
            {
              key: "material_name",
              header: c.var.t("transaction.export.material_name"),
              width: 40,
            },
            {
              key: "activity_name",
              header: c.var.t("transaction.export.activity_name"),
              width: 20,
            },
            {
              key: "opening_qty",
              header: c.var.t("transaction.export.opening_qty"),
              width: 15,
            },
            {
              key: "change_qty",
              header: c.var.t("transaction.export.change_qty"),
              width: 10,
            },
            {
              key: "closing_qty",
              header: c.var.t("transaction.export.closing_qty"),
              width: 15,
            },
            {
              key: "transaction_type_title",
              header: c.var.t("transaction.export.transaction_type_title"),
              width: 20,
            },
            {
              key: "transaction_reason_title",
              header: c.var.t("transaction.export.transaction_reason_title"),
              width: 20,
            },
            {
              key: "customer_name",
              header: c.var.t("transaction.export.customer_name"),
              width: 20,
            },
            {
              key: "vendor_name",
              header: c.var.t("transaction.export.vendor_name"),
              width: 20,
            },
            {
              key: "order_id",
              header: c.var.t("transaction.export.order_id"),
              width: 20,
            },
            {
              key: "order_status_label",
              header: c.var.t("transaction.export.order_status_label"),
              width: 20,
            },
            {
              key: "order_type_label",
              header: c.var.t("transaction.export.order_type"),
              width: 20,
            },
            {
              key: "stock_activity_name",
              header: c.var.t("transaction.export.stock_activity_name"),
              width: 20,
            },
            {
              key: "stock_allocated_qty",
              header: c.var.t("transaction.export.stock_allocated_qty"),
              width: 15,
            },
            {
              key: "batch_code",
              header: c.var.t("transaction.export.batch_code"),
              width: 20,
            },
            {
              key: "batch_expired_date",
              header: c.var.t("transaction.export.batch_expired_date"),
              width: 20,
            },
            {
              key: "manufacture_name",
              header: c.var.t("transaction.export.manufacture_name"),
              width: 20,
            },
            {
              key: "actual_transaction_date",
              header: c.var.t("transaction.export.actual_transaction_date"),
              width: 20,
            },
            {
              key: "source_program_name",
              header: c.var.t("transaction.export.source_program"),
              width: 20,
            },
            {
              key: "source_activity_name",
              header: c.var.t("transaction.export.source_activity"),
              width: 20,
            },
            {
              key: "companion_program_name",
              header: c.var.t("transaction.export.companion_program"),
              width: 20,
            },
            {
              key: "companion_activity_name",
              header: c.var.t("transaction.export.companion_activity"),
              width: 20,
            },
            {
              key: "patient_id",
              header: c.var.t("transaction.export.patient_id"),
              width: 20,
            },
            {
              key: "patient_nik",
              header: c.var.t("transaction.export.patient_nik"),
              width: 20,
            },
            {
              key: "patient_name",
              header: c.var.t("transaction.export.patient_name"),
              width: 30,
            },
            {
              key: "sequence_title",
              header: c.var.t("transaction.export.sequence"),
              width: 20,
            },
            {
              key: "patient_kipi",
              header: c.var.t("transaction.export.patient_kipi"),
              width: 40,
            },
            {
              key: "created_by_fullname",
              header: c.var.t("transaction.export.created_by_fullname"),
              width: 20,
            },
            {
              key: "created_at",
              header: c.var.t("transaction.export.created_at"),
              width: 20,
            },
          ],
        },
      }

      exporter.initFileGroup(transactionsGroup.id, transactionsGroup.name)
      await exporter.initSheet(
        transactionsGroup.id,
        transactionsGroup.sheets.transaction.sheetName
      )
      exporter.setColumns(
        transactionsGroup.id,
        transactionsGroup.sheets.transaction.sheetName,
        transactionsGroup.columns.transaction
      )

      Object.assign(c.var, { slave })

      // ✅ OPTIMASI: DB streaming dengan batch size 1000 untuk memory usage yang lebih baik
      // Method menggunakan MySQL stream API untuk true streaming
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
          `[Export] Initial memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      console.log(
        `[Export] Starting TRUE STREAMING export | DB stream batch: ${DB_BATCH_SIZE.toLocaleString()} | Excel flush: every ${env.EXPORT_EXCEL_BATCH_SIZE || 1000} rows`
      )

      try {
        for await (const batch of this.repo.getTransactionListForExport(
          c as any,
          params,
          DB_BATCH_SIZE,
          { includeKipi: c.var.programId === 8 }
        )) {
          batchCount++
          const batchLength = batch.length
          totalRecordsProcessed += batchLength

          console.log(
            `[Export] Received batch #${batchCount} | Size: ${batchLength.toLocaleString()} | Total: ${totalRecordsProcessed.toLocaleString()}`
          )

          // ✅ OPTIMASI: Process per row, langsung flush (jangan accumulate!)
          for (const item of batch) {
            const row = this.buildRowExcel(
              c.var.t,
              isHierarchyEnabled,
              programName,
              timezone,
              item
            )

            // Add single row, exporter akan auto-flush setiap batchSize rows
            await exporter.addRows(
              transactionsGroup.id,
              transactionsGroup.sheets.transaction.sheetName,
              [row]
            )
          }

          // ✅ OPTIMASI: Clear batch array untuk GC
          batch.length = 0

          // ✅ OPTIMASI: Force GC setiap 10 batches
          if (batchCount % 10 === 0 && global.gc) {
            global.gc()
            console.log(`[Export] GC triggered after batch ${batchCount}`)
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
            `[Export] Batch #${batchCount.toLocaleString()} | ` +
            `Processed: ${totalRecordsProcessed.toLocaleString()} records | ` +
            `Batch size: ${batchLength.toLocaleString()} | ` +
            `Elapsed: ${elapsedSeconds}s | ` +
            `Speed: ${recordsPerSecond} records/sec`
          )
        }
      } catch (error: any) {
        console.error(
          `[Export] ERROR during batch processing:`,
          error.message,
          error.stack
        )
        throw error
      }

      // ✅ Final progress update
      await updateProgress(totalRecordsProcessed, totalCount)

      // ✅ OPTIMASI: Final memory log before finalize
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Export] Before finalize: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      // ✅ PENTING: Finalize - flush remaining rows ke disk
      console.log("[Export] Finalizing: flushing remaining rows to disk...")
      await exporter.finalizeToDisk()
      console.log("[Export] ✅ Finalize completed - all parts saved to disk")

      // ✅ OPTIMASI: Final memory usage log
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Export] Final memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
      const avgSpeed = (
        (totalRecordsProcessed / (Date.now() - startTime)) *
        1000
      ).toFixed(2)

      console.log(
        `[Export] ✅ Export processing completed! | ` +
        `Total batches: ${batchCount.toLocaleString()} | ` +
        `Total records: ${totalRecordsProcessed.toLocaleString()} | ` +
        `Total time: ${totalTime}s | ` +
        `Avg speed: ${avgSpeed} records/sec`
      )
      console.log(
        `[Export] Returning exporter to base.worker for upload to MinIO...`
      )

      // ✅ RETURN exporter ke base.worker untuk upload
      // Upload akan dilakukan di processAsyncExport (base.worker.ts)
      return exporter
    } catch (error) {
      console.error("Error exporting transaction data:", error)
      throw error
    }
  }
}
