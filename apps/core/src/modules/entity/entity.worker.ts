import {
  WMS_CLIENT_ID,
  WMS_PROGRAM_NAME,
} from "@/common/constants/integration.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { MultiSheetZipExporter } from "@smile-health/lib/excel/multi-sheet-zip-v3.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { CustomContext } from "@smile-health/lib/types/context.js"
import { associateField } from "@smile-health/lib/utils.js"
import env from "../../config/env.js"
import { BaseWorker } from "../base.worker.js"
import { ExportHistoryRepository } from "../export-history/export-history.repository.js"
import { WorkspaceRepository } from "../workspace/workspace.repository.js"
import { EntityRepository } from "./entity.repository.js"
import { GetEntitiesQueries } from "./entity.schema.js"

export class EntityWorker extends BaseWorker {
  constructor(
    private readonly repository: EntityRepository,
    protected readonly exportHistoryRepo: ExportHistoryRepository,
    protected readonly workspaceRepo: WorkspaceRepository
  ) {
    super(exportHistoryRepo)
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.ENTITY_EXPORTED, async (c, msg) => {
      const parseMsg = JSON.parse(msg ?? "{}")
      const { params, options, language, timezone } = parseMsg.payload

      await this.processAsyncExport(c, options, async () => {
        // Switch between V1 (old) and V2 (new) here
        return await this.prepareExporterV2(
          c,
          language,
          timezone,
          params,
          options
        )
      })
    })
  }

  private async prepareExporter(
    c: CustomContext<DB>,
    language: string,
    timezone: string,
    params: GetEntitiesQueries
  ) {
    const exporter = new MultiSheetZipExporter({
      language,
      timezone,
      batchSize: env.EXPORT_EXCEL_BATCH_SIZE,
      bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
    })

    // =========================
    // INIT SHEET CONFIG
    // =========================
    const entityGroup = {
      id: c.var.t("common.entity"),
      name: c.var.t("common.entity"),
      sheets: {
        entity: {
          sheetName: c.var.t("common.entity"),
        },
      },
      columns: {
        entity: [
          { key: "province_id", header: c.var.t("entity.label.id_province"), width: 15 },
          { key: "province", header: c.var.t("entity.label.province"), width: 30 },
          { key: "regency_id", header: c.var.t("entity.label.id_regency"), width: 20 },
          { key: "regency", header: c.var.t("entity.label.regency"), width: 35 },
          { key: "sub_district_id", header: c.var.t("entity.label.id_sub_district"), width: 20 },
          { key: "sub_district", header: c.var.t("entity.label.sub_district"), width: 30 },
          { key: "village_id", header: c.var.t("entity.label.id_villages"), width: 20 },
          { key: "village", header: c.var.t("entity.label.village"), width: 30 },
          { key: "entity_id", header: c.var.t("entity.label.id_entity"), width: 15 },
          { key: "msi_code", header: c.var.t("entity.label.msi_code"), width: 20 },
          { key: "name", header: c.var.t("entity.label.name"), width: 60 },
          { key: "code", header: c.var.t("entity.label.code"), width: 20 },
          { key: "type", header: c.var.t("entity.label.type"), width: 20 },
          { key: "entity_tag", header: c.var.t("entity.label.entity_tag"), width: 35 },
          { key: "address", header: c.var.t("entity.label.address"), width: 70 },
          { key: "programs", header: "Program", width: 20 },
          { key: "updated_at", header: c.var.t("entity.label.update_at"), width: 20 },
          { key: "created_by", header: c.var.t("entity.label.created_by"), width: 20 },
        ],
      },
    }

    const stream = await this.repository.findAllSearchableAndStreamable(
      c,
      params
    )

    exporter.initFileGroup(entityGroup.id, entityGroup.name)
    await exporter.initSheet(
      entityGroup.id,
      entityGroup.sheets.entity.sheetName
    )
    exporter.setColumns(
      entityGroup.id,
      entityGroup.sheets.entity.sheetName,
      entityGroup.columns.entity
    )

    // =========================
    // HELPERS
    // =========================
    const defaultValue = (value: string | null) => value ?? "-"

    const getTranslation = (key: string, column: string | null) => {
      if (!column) return null
      const result = c.var.t(`${key}.${column}`)
      return result.includes(".label.") ? key : result
    }

    type WorkspaceProgram = {
      id: number
      key: string
      name: string
      entity_id: number
      entity_program_id: number
      config: unknown
      is_beneficiaries: number
    }

    // =========================
    // CACHE
    // =========================
    const programNameCache = new Map<string, string>()

    const BATCH_SIZE = env.EXPORT_EXCEL_BATCH_SIZE || 100

    // =========================
    // LOAD PROGRAM (BULK)
    // =========================
    const loadProgramsByBatch = async (
      items: { id: string | number; integration_client_id?: number }[]
    ): Promise<void> => {
      const ids = items
        .map((i) => String(i.id))
        .filter((id) => !programNameCache.has(id))

      if (ids.length === 0) return

      const mapClients = associateField(items, "id", "integration_client_id")
      const rawResult = await this.workspaceRepo.getByFromMappedWorkspace(
        c,
        "entity",
        ids
      )
      const result = rawResult as Record<string, WorkspaceProgram[]>

      for (const [entityId, programs] of Object.entries(result)) {
        const names = programs.map((p) => p.name)
        if (mapClients[entityId] === WMS_CLIENT_ID) {
          names.push(WMS_PROGRAM_NAME)
        }
        programNameCache.set(entityId, names.join(", "))
      }

      // entity tanpa program → set string kosong
      for (const id of ids) {
        if (!programNameCache.has(id)) {
          programNameCache.set(
            id,
            mapClients[id] === WMS_CLIENT_ID ? WMS_PROGRAM_NAME : ""
          )
        }
      }
    }

    // =========================
    // PROCESS BATCH
    // =========================
    const processBatch = async (items: typeof batch): Promise<void> => {
      for (const item of items) {
        const programNames = programNameCache.get(String(item.id)) ?? ""

        const row = {
          province_id: defaultValue(item.province_id),
          province: defaultValue(item.province_name),
          regency_id: defaultValue(item.regency_id),
          regency: defaultValue(item.regency_name),
          sub_district_id: defaultValue(item.sub_district_id),
          sub_district: defaultValue(item.sub_district_name),
          village_id: defaultValue(item.village_id),
          village: defaultValue(item.village_name),
          entity_id: defaultValue(String(item.id)),
          msi_code: item.id_satu_sehat || "-",
          name: defaultValue(item.name),
          code: defaultValue(item.code),
          type: defaultValue(
            getTranslation("entity_type.label", item.type_name)
          ),
          entity_tag: defaultValue(
            getTranslation("entity_tag.label", item.entity_tag_name)
          ),
          address: defaultValue(item.address),
          programs: programNames || "-",
          updated_at: item.updated_at,
          created_by: defaultValue(item.created_by_name),
        }

        // ✅ Use addRows (plural) for multi-sheet-zip-v3.js
        await exporter.addRows(
          entityGroup.id,
          entityGroup.sheets.entity.sheetName,
          [row]
        )
      }
    }

    // =========================
    // STREAM LOOP (JUTAAN DATA AMAN)
    // =========================
    let batch: typeof stream extends AsyncIterable<infer T> ? T[] : never = []

    for await (const item of stream) {
      batch.push(item)

      if (batch.length >= BATCH_SIZE) {
        await loadProgramsByBatch(batch)
        await processBatch(batch)
        batch = []
      }
    }

    if (batch.length > 0) {
      await loadProgramsByBatch(batch)
      await processBatch(batch)
    }

    return exporter
  }

  // =========================
  // V2 EXPORTER (Transaction-style with batching)
  // =========================
  private async prepareExporterV2(
    c: CustomContext<DB>,
    language: string,
    timezone: string,
    params: GetEntitiesQueries,
    options: {
      export_id: number
      original_filename: string
      filename: string
      language: string
    }
  ) {
    try {
      // ✅ Get total count for smart export
      const totalCount = await this.repository.getEntitiesCountForExport(
        c,
        params
      )
      console.log(`[Entity Export] Total entities to export: ${totalCount}`)

      // ✅ SMART EXPORT: Auto-determine ZIP and batch size based on totalRecords
      const SINGLE_FILE_THRESHOLD = 100000
      const isSingleFile = totalCount < SINGLE_FILE_THRESHOLD

      // Dynamic batch size
      const batchSize = isSingleFile
        ? Math.max(totalCount + 1000, SINGLE_FILE_THRESHOLD)
        : env.EXPORT_EXCEL_BATCH_SIZE || 1000

      const useZip = !isSingleFile

      console.log(
        `[Entity Export] Smart export settings | ` +
          `Total records: ${totalCount.toLocaleString()} | ` +
          `Single file: ${isSingleFile} | ` +
          `Batch size: ${batchSize.toLocaleString()} | ` +
          `Use ZIP: ${useZip}`
      )

      // ✅ Fix filename extension based on useZip decision
      const fileExtension = useZip ? "zip" : "xlsx"
      const uuidPart = options.original_filename.split(".")[0]
      const correctOriginalFilename = `${uuidPart}.${fileExtension}`

      const filenameParts = options.filename.split(".")
      const filenameWithoutExt = filenameParts.slice(0, -1).join(".")
      const correctFilename = `${filenameWithoutExt}.${fileExtension}`

      // Update export_histories with correct filename
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
        `[Entity Export] Fixed filename extension: ${correctOriginalFilename} (useZip: ${useZip})`
      )

      // ✅ Create exporter with smart settings
      const exporter = new MultiSheetZipExporter({
        language,
        timezone,
        batchSize:
          totalCount > SINGLE_FILE_THRESHOLD
            ? SINGLE_FILE_THRESHOLD
            : batchSize,
        bucketName: env.EXPORT_EXCEL_BUCKET_NAME,
        tempDir: "/tmp/excel-exports/global-entities",
        totalRecords: totalCount,
        useZip,
        originalFilename: correctOriginalFilename,
        filename: filenameWithoutExt,
      })

      // =========================
      // INIT SHEET CONFIG
      // =========================
      const entityGroup = {
        id: c.var.t("common.entity"),
        name: c.var.t("common.entity"),
        sheets: {
          entity: {
            sheetName: c.var.t("common.entity"),
          },
        },
        columns: {
          entity: [
            { key: "province_id", header: c.var.t("entity.label.id_province"), width: 15 },
            { key: "province", header: c.var.t("entity.label.province"), width: 30 },
            { key: "regency_id", header: c.var.t("entity.label.id_regency"), width: 20 },
            { key: "regency", header: c.var.t("entity.label.regency"), width: 35 },
            { key: "sub_district_id", header: c.var.t("entity.label.id_sub_district"), width: 20 },
            { key: "sub_district", header: c.var.t("entity.label.sub_district"), width: 30 },
            { key: "village_id", header: c.var.t("entity.label.id_villages"), width: 20 },
            { key: "village", header: c.var.t("entity.label.village"), width: 30 },
            { key: "entity_id", header: c.var.t("entity.label.id_entity"), width: 15 },
            { key: "msi_code", header: c.var.t("entity.label.msi_code"), width: 20 },
            { key: "name", header: c.var.t("entity.label.name"), width: 60 },
            { key: "code", header: c.var.t("entity.label.code"), width: 20 },
            { key: "type", header: c.var.t("entity.label.type"), width: 20 },
            { key: "entity_tag", header: c.var.t("entity.label.entity_tag"), width: 35 },
            { key: "address", header: c.var.t("entity.label.address"), width: 70 },
            { key: "programs", header: "Program", width: 20 },
            { key: "updated_at", header: c.var.t("entity.label.update_at"), width: 20 },
            { key: "created_by", header: c.var.t("entity.label.created_by"), width: 20 },
          ],
        },
      }

      exporter.initFileGroup(entityGroup.id, entityGroup.name)
      await exporter.initSheet(
        entityGroup.id,
        entityGroup.sheets.entity.sheetName
      )
      exporter.setColumns(
        entityGroup.id,
        entityGroup.sheets.entity.sheetName,
        entityGroup.columns.entity
      )

      // =========================
      // HELPERS
      // =========================
      const defaultValue = (value: string | null) => value ?? "-"

      const getTranslation = (key: string, column: string | null) => {
        if (!column) return null
        const result = c.var.t(`${key}.${column}`)
        return result.includes(".label.") ? key : result
      }

      type WorkspaceProgram = {
        id: number
        key: string
        name: string
        entity_id: number
        entity_program_id: number
        config: unknown
        is_beneficiaries: number
      }

      // =========================
      // CACHE
      // =========================
      const programNameCache = new Map<string, string>()

      // =========================
      // LOAD PROGRAM (BULK)
      // =========================
      const loadProgramsByBatch = async (
        items: { id: string | number; integration_client_id?: number }[]
      ): Promise<void> => {
        const ids = items
          .map((i) => String(i.id))
          .filter((id) => !programNameCache.has(id))

        if (ids.length === 0) return

        const mapClients = associateField(items, "id", "integration_client_id")
        const rawResult = await this.workspaceRepo.getByFromMappedWorkspace(
          c,
          "entity",
          ids
        )
        const result = rawResult as Record<string, WorkspaceProgram[]>

        for (const [entityId, programs] of Object.entries(result)) {
          const names = programs.map((p) => p.name)
          if (mapClients[entityId] === WMS_CLIENT_ID) {
            names.push(WMS_PROGRAM_NAME)
          }
          programNameCache.set(entityId, names.join(", "))
        }

        // entity tanpa program → set string kosong
        for (const id of ids) {
          if (!programNameCache.has(id)) {
            programNameCache.set(
              id,
              mapClients[id] === WMS_CLIENT_ID ? WMS_PROGRAM_NAME : ""
            )
          }
        }
      }

      // =========================
      // PROCESS BATCH
      // =========================
      const processBatch = async (items: any[]): Promise<void> => {
        const rows = items.map((item) => {
          const programNames = programNameCache.get(String(item.id)) ?? ""

          return {
            province_id: defaultValue(item.province_id),
            province: defaultValue(item.province_name),
            regency_id: defaultValue(item.regency_id),
            regency: defaultValue(item.regency_name),
            sub_district_id: defaultValue(item.sub_district_id),
            sub_district: defaultValue(item.sub_district_name),
            village_id: defaultValue(item.village_id),
            village: defaultValue(item.village_name),
            entity_id: defaultValue(String(item.id)),
            msi_code: item.id_satu_sehat || "-",
            name: defaultValue(item.name),
            code: defaultValue(item.code),
            type: defaultValue(
              getTranslation("entity_type.label", item.type_name)
            ),
            entity_tag: defaultValue(
              getTranslation("entity_tag.label", item.entity_tag_name)
            ),
            address: defaultValue(item.address),
            programs: programNames || "-",
            updated_at: item.updated_at,
            created_by: defaultValue(item.created_by_name),
          }
        })

        // ✅ Use addRows (plural) for multi-sheet-zip-v3.js
        await exporter.addRows(
          entityGroup.id,
          entityGroup.sheets.entity.sheetName,
          rows
        )
      }

      // =========================
      // STREAM LOOP WITH BATCHING
      // =========================
      const DB_BATCH_SIZE = 10000
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
          `[Entity Export] Initial memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      console.log(
        `[Entity Export] Starting TRUE STREAMING export | DB stream batch: ${DB_BATCH_SIZE.toLocaleString()} | Excel flush: every ${env.EXPORT_EXCEL_BATCH_SIZE || 1000} rows`
      )

      try {
        for await (const batch of this.repository.getEntitiesForExport(
          c,
          params,
          DB_BATCH_SIZE
        )) {
          batchCount++
          const batchLength = batch.length
          totalRecordsProcessed += batchLength

          console.log(
            `[Entity Export] Received batch #${batchCount} | Size: ${batchLength.toLocaleString()} | Total: ${totalRecordsProcessed.toLocaleString()}`
          )

          // Load programs for batch
          await loadProgramsByBatch(batch)

          // Process batch
          await processBatch(batch)

          // ✅ Clear batch array for GC
          batch.length = 0

          // ✅ Force GC every 10 batches
          if (batchCount % 10 === 0 && global.gc) {
            global.gc()
            console.log(
              `[Entity Export] GC triggered after batch ${batchCount}`
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
            `[Entity Export] Batch #${batchCount.toLocaleString()} | ` +
              `Processed: ${totalRecordsProcessed.toLocaleString()} records | ` +
              `Batch size: ${batchLength.toLocaleString()} | ` +
              `Elapsed: ${elapsedSeconds}s | ` +
              `Speed: ${recordsPerSecond} records/sec`
          )
        }
      } catch (error: any) {
        console.error(
          `[Entity Export] ERROR during batch processing:`,
          error.message,
          error.stack
        )
        throw error
      }

      // ✅ Final progress update
      await updateProgress(totalRecordsProcessed, totalCount)

      // ✅ Final memory log before finalize
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Entity Export] Before finalize: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      // ✅ Finalize - flush remaining rows to disk
      console.log(
        "[Entity Export] Finalizing: flushing remaining rows to disk..."
      )
      await exporter.finalizeToDisk()
      console.log(
        "[Entity Export] ✅ Finalize completed - all parts saved to disk"
      )

      // ✅ Final memory usage log
      if (process.memoryUsage) {
        const mem = process.memoryUsage()
        console.log(
          `[Entity Export] Final memory: RSS=${(mem.rss / 1024 / 1024).toFixed(2)}MB | Heap=${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
        )
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
      const avgSpeed = (
        (totalRecordsProcessed / (Date.now() - startTime)) *
        1000
      ).toFixed(2)

      console.log(
        `[Entity Export] ✅ Export processing completed! | ` +
          `Total batches: ${batchCount.toLocaleString()} | ` +
          `Total records: ${totalRecordsProcessed.toLocaleString()} | ` +
          `Total time: ${totalTime}s | ` +
          `Avg speed: ${avgSpeed} records/sec`
      )
      console.log(
        `[Entity Export] Returning exporter to base.worker for upload to MinIO...`
      )

      return exporter
    } catch (error) {
      console.error("Error exporting entity data:", error)
      throw error
    }
  }
}
