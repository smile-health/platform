import { SyncPublisher } from "@smile/lib/base/sync-publisher.js"
import { Publisher } from "@smile/lib/rabbitmq/publisher.js"
import { Context } from "hono"
import { EntityRepository } from "./entity.repository.js"

export interface ImportEntityJobPayload {
  headers: Record<string, string | undefined>
  rows: any[]
  userId: number
  accountId: number
  importLogId: number
}

export class EntityImportPublisher extends SyncPublisher {
  constructor(
    protected readonly publisher: Publisher,
    protected readonly repo: EntityRepository
  ) {
    super(publisher)
  }

  async processLargeImport(
    c: Context,
    rows: any[],
    accountID: number
  ): Promise<void> {
    const importLogId = await this.repo.createImportLogs(c, {
      user_id: accountID,
      program_id: undefined,
      progress: 0,
      category_id: 1,
    })

    const message: ImportEntityJobPayload = {
      headers: c.req.header(),
      rows,
      userId: accountID,
      accountId: accountID,
      importLogId: importLogId,
    }

    // Using a new topic for entity import jobs
    await this.publish("ENTITY_IMPORT_REQUESTED", message)
  }
}
