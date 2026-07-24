import { SyncPublisher } from "@smile-health/lib/base/sync-publisher.js"
import { Publisher } from "@smile-health/lib/rabbitmq/publisher.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { Context } from "hono"
import { OrderCommentRepository } from "../order-comment/order-comment.repository.js"
import { OrderItemStockRepository } from "../order-item-stock/order-item-stock.repository.js"
import { OrderRepository } from "./order.repository.js"
import { CreateOrderRequest } from "./order.schema.js"

export class OrderPublisher extends SyncPublisher {
  constructor(
    protected readonly publisher: Publisher,
    protected readonly repo: OrderRepository,
    protected readonly orderItemStockRepo: OrderItemStockRepository,
    protected readonly orderCommentRepo: OrderCommentRepository
  ) {
    super(publisher)
  }

  async processCreate(
    c: Context,
    orderId: number,
    req: CreateOrderRequest
  ): Promise<void> {
    const orderWorkspace = await this.repo.findOne(c, { id: orderId })
    const orderItemsWorkspace = await this.orderItemStockRepo.find(c, {
      order_id: orderId,
    })
    const orderCommentWorkspace = await this.orderCommentRepo.findOne(c, {
      order_id: orderId,
    })

    if (orderWorkspace) {
      const payload = {
        ...req,
        ...orderWorkspace,
        order_items: orderItemsWorkspace,
        order_comment_id: orderCommentWorkspace?.id,
        program_id: c.get("programId"),
      }

     // Payload should have a OrderCreated type and schema, defined somewhere and published on event registry
     // Headers should always contain standard useful metadata: userId, programId, activityId
     // As a simple workaround this could be achieved as follow:
    //  const message = {
    //     headers: c.req.header(),
    //     metadata: {userId: , programId: , activityId: , tenantId: },
    //     payload: payload,
    //   }
    // Because the same event is created in different part of the code and payload is build manyally from different sources
    // evaluating and adding those few key metadata manually could be the easiest way
    // These metadata are important to filter and route events to subscribers in specific OpenHIM channels

      // Parse client_key from the order's metadata JSON column
      let clientKey: string | undefined
      try {
        const meta = JSON.parse(String(orderWorkspace.metadata ?? "{}"))
        clientKey = meta.client_key ?? undefined
      } catch (err) {
        console.warn(`[OrderPublisher] Failed to parse order metadata for orderId=${orderId}:`, err)
      }

      const message = {
        headers: c.req.header(),
        payload: payload,
        context: {
          program_id: c.get("programId"),
          user_id: c.var.userId,
          request_id: c.req.header("x-request-id"),
          client_key: clientKey,
        },
      }

      c.addEvent(TOPIC.ORDER_CREATED, message)
    }
  }

  async processRetryIntegrationLog(c: Context, data) {
    const message = {
      headers: c.req.header(),
      payload: {
        ...data,
        order_id: data.order_id,
        program_id: data.program_id,
        retry: true,
      },
      user: c.var.user,
      context: {
        program_id: data.program_id,
        user_id: c.var.user?.id,
        user_email: c.var.user?.email,
        request_id: c.req.header("x-request-id"),
        client_key: data.client_key,
      },
    }

    if (data.tag === "validate_order") {
      c.addEvent(TOPIC.ORDER_STATUS_ORDER_VALIDATED, message)
    } else if (data.tag === "cancel_order") {
      c.addEvent(TOPIC.ORDER_STATUS_ORDER_CANCEL, message)
    }
  }

  async processNotification(c: Context, payload) {
    payload.messageTranslation = this.publisher.setMessage(c, payload.message)
    payload.titleTranslation = this.publisher.setMessage(c, payload.title)
    await this.publisher.publishNotification(c, payload.worker, payload)
  }
}
