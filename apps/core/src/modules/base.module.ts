/* eslint-disable @typescript-eslint/no-unused-vars */
import { DB } from "@/common/infrastructure/database/types/db.js"
import { BadRequestError } from "@smile/lib/error.js"
import { Consumer } from "@smile/lib/rabbitmq/consumer.js"
import { randomUUID } from "crypto"
import { Context } from "hono"
import { ExportHistoryRepository } from "./export-history"
import { getConnection } from "@/common/infrastructure/mq"
import { Publisher as MQPublisher } from "@smile/lib/rabbitmq/publisher"

interface Publisher {
  publish(topic: string, message: unknown)
}

export class BaseModule {
  constructor(
    protected exportHistoryRepo?: ExportHistoryRepository,
    protected publisher?: Publisher
  ) {}
  public registerWorkers(consumer: Consumer<DB>) {
    throw new BadRequestError("Not implemented")
  }

  public handleAsyncExport = async (
    c: Context,
    topic: string,
    body: { filename: string; params: object; ext?: string }
  ) => {
    if (!this.exportHistoryRepo) {
      this.exportHistoryRepo = new ExportHistoryRepository()
    }

    if (!this.publisher) {
      this.publisher = new MQPublisher(getConnection)
    }

    const { filename, params, ext } = body
    const extension = ext || "zip"
    let options = {
      original_filename: `${randomUUID()}.${extension}`,
      filename: `${filename}_${Date.now()}.${extension}`,
      export_id: 0,
      language: c.var.language,
      timezone: c.var.timezone,
      role: c.var.role,
      entityId: c.var.entityId,
      deviceType: c.var.deviceType,
    }

    const exportHistory = await this.exportHistoryRepo.upsert(c, {
      program_id: c.var.programId,
      original_filename: options.original_filename,
      filename: options.filename,
      created_by: c.var.accountID,
      log: "Start Process",
    })

    options = {
      ...options,
      export_id:
        "insertId" in exportHistory
          ? Number(exportHistory.insertId)
          : exportHistory.id,
    }

    const message = {
      headers: c.req.header(),
      payload: {
        params,
        options,
        config: c.var.config,
        language: c.var.language,
        timezone: c.req.header("Timezone"),
        programId: c.var.programId,
      },
    }

    await this.publisher.publish(topic, message)

    return { status: "success" }
  }
}
