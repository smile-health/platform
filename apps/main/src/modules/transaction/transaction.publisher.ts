import { SyncPublisher } from "@smile/lib/base/sync-publisher.js"
import { Publisher } from "@smile/lib/rabbitmq/publisher.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import { Context } from "hono"
import { TransactionRepository } from "./transaction.repository.js"
import { PublishTrxDTO } from "./transaction.schema.js"

export class TransactionPublisher extends SyncPublisher {
  constructor(
    publisher: Publisher,
    private readonly repo: TransactionRepository
  ) {
    super(publisher)
  }

  async processCreate(c: Context, messages: PublishTrxDTO[]) {
    if (messages.length === 0) return

    const message = {
      payload: messages,
    }

    // Use c.addEvent if available (Hono context), otherwise publish directly (Worker context)
    if ('addEvent' in c && typeof c.addEvent === 'function') {
      c.addEvent(TOPIC.TRANSACTION_CREATED, message)
    } else {
      await this.publisher.publish(TOPIC.TRANSACTION_CREATED, message)
    }
  }
}
