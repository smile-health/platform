import { SyncPublisher } from "@smile/lib/base/sync-publisher.js"
import { Publisher } from "@smile/lib/rabbitmq/publisher.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import { Context } from "hono"

export interface OrderCancel {
  cancel_reason: number | null | undefined
  reason_text: string | null | undefined
  comment: string | null | undefined
  order_id: number
  program_id: number
  user_id?: number
  client_key?: string
}
export class OrderStatusCancelPublisher extends SyncPublisher {
  constructor(publisher: Publisher) {
    super(publisher)
  }

  async processUpdate<T extends OrderCancel>(c: Context, data: T) {
    const message = {
      headers: c.req.header(),
      payload: {
        data,
        order_id: data.order_id,
        program_id: data.program_id,
      },
      user: c.var.user,
      context: {
        program_id: data.program_id,
        user_id: data.user_id,
        user_email: c.var.user?.email,
        request_id: c.req.header("x-request-id"),
        client_key: data.client_key,
      },
    }

    // Add headers only if c.req is available (Hono context)
    if ("req" in c && c.req) {
      message.headers = c.req.header()
    }

    // Use c.addEvent if available (Hono context), otherwise publish directly (Worker context)
    if ("addEvent" in c && typeof c.addEvent === "function") {
      c.addEvent(TOPIC.ORDER_STATUS_ORDER_CANCEL, message)
    } else {
      await this.publisher.publish(TOPIC.ORDER_STATUS_ORDER_CANCEL, message)
    }
  }
}
