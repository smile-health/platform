/* eslint-disable @typescript-eslint/no-unused-vars */
import { DB } from "@/common/infrastructure/database/types/db.js"
import { datamart } from "@/common/infrastructure/database/datamart.js"
import env from "@/config/env.js"
import { BadRequestError } from "@smile/lib/error.js"
import { MultiSheetZipExporter } from "@smile/lib/excel/multi-sheet-zip.js"
import i18n from "@smile/lib/i18n.js"
import { logger } from "@smile/lib/logger.js"
import { createMinioClientFromEnv } from "@smile/lib/minio.js"
import { Consumer } from "@smile/lib/rabbitmq/consumer.js"
import { Context } from "@smile/lib/types/context.js"
import ExportHistoryRepository from "./export-history/export-history.repository.js"

export class BaseWorker {
  constructor(protected readonly exportHistoryRepo?: ExportHistoryRepository) {}

  public registerWorkers(consumer: Consumer<DB>) {
    throw new BadRequestError("Not implemented")
  }

  public processAsyncExport = async (
    c: Context<DB>,
    options: { export_id: number; original_filename: string; language: string },
    exporterFunc: () => Promise<MultiSheetZipExporter>
  ) => {
    if (!this.exportHistoryRepo) {
      throw new BadRequestError("export history repo not yet initialized")
    }

    const exportHistoryRepo = this.exportHistoryRepo

    // set language and datamart
    const translator = i18n.cloneInstance()
    translator.changeLanguage(options.language)
    Object.assign(c.var, { t: translator.t, datamart })

    try {
      await exportHistoryRepo.upsert(
        c,
        {
          status: "in_progress",
          log: "In Progress",
        },
        options.export_id
      )

      const minioClient = createMinioClientFromEnv()
      if (!minioClient) {
        throw new Error("Failed to create MinIO client")
      }

      const exporter = await exporterFunc()
      const endpointUrl = `${`${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`}`

      let fileUrl: string

      if (
        "createZipAndUpload" in exporter &&
        typeof exporter.createZipAndUpload === "function"
      ) {
        // New streaming exporter with createZipAndUpload support
        fileUrl = await exporter.createZipAndUpload(
          minioClient,
          endpointUrl,
          options.original_filename,
          async (progress) => {
            await exportHistoryRepo.upsert(
              c,
              {
                log: progress.message || `Uploading: ${progress.percentage}%`,
              },
              options.export_id
            )
            console.log(`Upload progress: ${progress.message}`)
          }
        )
      } else {
        // Legacy exporter using exportToMinio
        fileUrl = await exporter.exportToMinio(
          minioClient,
          endpointUrl,
          options.original_filename,
          async (progress) => {
            await exportHistoryRepo.upsert(
              c,
              {
                log: progress.message || `Uploading: ${progress.percentage}%`,
              },
              options.export_id
            )
            console.log(`Upload progress: ${progress.message}`)
          }
        )
      }

      const expiresAt = new Date()
      expiresAt.setDate(
        expiresAt.getDate() + (Number(env.EXPORT_EXCEL_EXPIRES_DAYS) || 7)
      )

      // ✅ FIX: Extract actual filename from download_url for original_filename
      // For non-ZIP: URL ends with UUID.xlsx_Part1.xlsx, extract that as original_filename
      // For ZIP: URL ends with UUID.zip, use that as original_filename
      const urlParts = fileUrl.split("/")
      const actualFilename = urlParts[urlParts.length - 1]

      await exportHistoryRepo.upsert(
        c,
        {
          status: "done",
          download_url: fileUrl,
          original_filename: actualFilename, // ✅ Update with actual uploaded filename
          expires_at: expiresAt,
          log: "Done",
        },
        options.export_id
      )

      console.log("✅ Download URL:", fileUrl)
      console.log("✅ Original Filename:", actualFilename)
    } catch (error) {
      await exportHistoryRepo.upsert(
        c,
        {
          status: "failed",
          log: `${error}`,
        },
        options.export_id
      )

      logger.error(`❌ Error exporting file: ${error}`)
    }
  }

  public transformStream = <T, R>(
    source: AsyncIterable<T>,
    transform: (item: T) => R | Promise<R>
  ): AsyncIterableIterator<R> => {
    const generator = async function* () {
      for await (const item of source) {
        yield await transform(item)
      }
    }

    return generator()
  }
}
