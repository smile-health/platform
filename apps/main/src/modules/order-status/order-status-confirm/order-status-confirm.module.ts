import { ORDER_STATUS } from "@/common/constants/order.js"
import { Context } from "hono"
import { OrderModule } from "../../order/order.module.js"
import { OrderStatusConfirmPublisher } from "./order-status-confirm.publisher.js"
import { OrderStatusConfirmRepository } from "./order-status-confirm.repository.js"
import {
  AddOrderCommentConfirmDTO,
  AddOrderHistoryConfirmDTO,
  ChangeOrderItemStockConfirmRequest,
  ChangeOrderStatusConfirmDTO,
  ChangeOrderStatusConfirmRequest,
  UpdateOrderAuditConfrimDTO,
} from "./order-status-confirm.schema.js"

export class OrderStatusConfirmModule {
  constructor(
    private readonly repository: OrderStatusConfirmRepository,
    private readonly publisher: OrderStatusConfirmPublisher,
    private readonly orderModule: OrderModule
  ) {}

  async update(
    c: Context,
    orderId: number,
    body: ChangeOrderStatusConfirmRequest
  ) {
    const { order_items, comment } = body
    const userId = Number(c.var.userId)
    const promises: any[] = []

    const orderItemsData: ChangeOrderItemStockConfirmRequest[] =
      order_items.map((orderItem) => ({
        ...orderItem,
        qty: orderItem.confirmed_qty,
        updated_by: userId,
        updated_at: new Date(),
      }))

    for (const orderItem of orderItemsData) {
      const { id, children, ...orderItemData } = orderItem

      if (children && children.length > 0) {
        for (const child of children) {
          const { id, ...childData } = child
          const newChildData = {
            qty: childData.confirmed_qty,
            updated_by: userId,
            updated_at: new Date(),
            ...childData,
          }
          promises.push(
            this.repository.updateOrderItemStockConfirmByOrderItemId(
              c,
              id,
              newChildData
            )
          )
        }
      }

      promises.push(
        this.repository.updateOrderItemStockConfirmByOrderItemId(
          c,
          id,
          orderItemData
        )
      )
    }

    const orderData: ChangeOrderStatusConfirmDTO = {
      order_status_id: ORDER_STATUS.CONFIRMED,
      updated_by: userId,
      updated_at: new Date(),
    }

    const orderHistoryData: AddOrderHistoryConfirmDTO = {
      order_id: orderId,
      order_status_id: ORDER_STATUS.CONFIRMED,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const orderAuditData: UpdateOrderAuditConfrimDTO = {
      confirmed_at: new Date(),
      updated_at: new Date(),
      confirmed_by: userId,
      updated_by: userId,
    }

    promises.push(this.repository.update(c, orderData, { id: orderId }))

    promises.push(
      this.repository.createOrderHistoryConfirm(c, orderHistoryData)
    )

    promises.push(
      this.repository.updateOrderAuditConfirmByOrderId(
        c,
        orderId,
        orderAuditData
      )
    )

    if (comment) {
      const orderCommentData: AddOrderCommentConfirmDTO = {
        order_id: orderId,
        user_id: userId,
        order_status_id: ORDER_STATUS.CONFIRMED,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        comment: comment,
      }
      promises.push(
        this.repository.createOrderCommentConfirm(c, orderCommentData)
      )
    }

    await Promise.all(promises)

    // Fetch order before publish — used for both client_key extraction and projection capacity below
    const order = await this.repository.getOrderById(
      c,
      orderId,
      c.get("programId")
    )

    let clientKey: string | undefined
    try {
      const meta = JSON.parse(String(order?.metadata ?? "{}"))
      clientKey = meta.client_key ?? undefined
    } catch (err) {
      console.warn(
        `[OrderStatusConfirmModule] Failed to parse order metadata for orderId=${orderId}:`,
        err
      )
    }

    await this.publisher.processUpdate(c, {
      order_id: orderId,
      program_id: c.get("programId"),
      user_id: userId,
      client_key: clientKey,
    })

    const itemIdToMaterial = await this.orderModule.getChildItemsMaterial(
      c,
      orderId
    )
    const isAllowOrderProjectionCapacity =
      this.orderModule.isAllowOrderProjectionCapacity(c, order)

    if (isAllowOrderProjectionCapacity) {
      const itemIdToMaterial = await this.orderModule.getChildItemsMaterial(
        c,
        orderId
      )

      for (const item of order_items) {
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            child["material_id"] = itemIdToMaterial.get(child.id)
          }
        }
      }

      const projectionParams = this.orderModule.prepareProjectionParams(
        {
          id: orderId,
          customer_id: order?.customer_id,
          status: order?.order_status_id,
        },
        order_items
      )
      await this.orderModule.saveOrderItemProjectionCapacity(
        c,
        projectionParams
      )
    }
  }
}
