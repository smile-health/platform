import { SyncPublisher } from "@smile/lib/base/sync-publisher.js"
import { Publisher } from "@smile/lib/rabbitmq/publisher.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import { Context } from "hono"
import { CreateOrderDinRequest } from "./din.schemas.js"

export interface OrderCancel {
  cancel_reason: number | null | undefined
  reason_text: string | null | undefined
  comment: string | null | undefined
  order_id: number
  program_id: number
}
export class OrderCreateFromDinPublisher extends SyncPublisher {
  constructor(publisher: Publisher) {
    super(publisher)
  }

  async processCreate<T extends CreateOrderDinRequest>(c: Context, data: T) {
    const message: any = {
      payload: {
        data,
      },
      user: c.var.user,
      client: c.var.client,
      program_id: c.var.programId,
      // Simpan URL untuk logging di worker
      requestUrl: c.var.requestUrl || c.req?.url,
      context: {
        program_id: c.var.programId,
        user_id: c.var.user?.id,
        user_email: c.var.user?.email,
        client_key: c.var.client?.key,
      },
    }

    // Add headers only if c.req is available (Hono context)
    if ("req" in c && c.req) {
      message.headers = c.req.header()
      message.context.request_id = c.req.header("x-request-id")
    }

    // Use c.addEvent if available (Hono context), otherwise publish directly (Worker context)
    if ("addEvent" in c && typeof c.addEvent === "function") {
      c.addEvent(TOPIC.ORDER_CREATED_FROM_DIN, message)
    } else {
      await this.publisher.publish(TOPIC.ORDER_CREATED_FROM_DIN, message)
    }
  }
}
