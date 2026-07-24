import { ORDER_STATUS } from "@/common/constants/order.js"
import { Context } from "hono"
import { OrderModule } from "../../order/order.module.js"
import { OrderStatusPendingRepository } from "./order-status-pending.repository.js"
import {
  AddOrderHistoryPendingDTO,
  ChangeOrderItemStockPendingDTO,
  ChangeOrderStatusPendingDTO,
} from "./order-status-pending.schema.js"

export class OrderStatusPendingModule {
  constructor(
    private readonly repository: OrderStatusPendingRepository,
    private readonly orderModule: OrderModule
  ) {}

  async update(c: Context, orderId: number) {
    const userId = Number(c.var.userId)
    const promises: any[] = []

    const orderItemStocks = await this.repository.getOrderItemStockByOrderId(
      c,
      orderId
    )

    for (const orderItemStock of orderItemStocks) {
      const itemData: ChangeOrderItemStockPendingDTO = {
        qty: orderItemStock.ordered_qty,
        confirmed_qty: 0,
        updated_by: userId,
        updated_at: new Date(),
      }

      promises.push(
        this.repository.updateOrderItemStockPendingByOrderItemId(
          c,
          orderItemStock.id,
          itemData
        )
      )
    }

    const orderData: ChangeOrderStatusPendingDTO = {
      order_status_id: ORDER_STATUS.PENDING,
      updated_by: userId,
      updated_at: new Date(),
    }

    const orderHistoryData: AddOrderHistoryPendingDTO = {
      order_id: orderId,
      order_status_id: ORDER_STATUS.PENDING,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    }

    promises.push(this.repository.update(c, orderData, { id: orderId }))

    promises.push(
      this.repository.createOrderHistoryPending(c, orderHistoryData)
    )

    await Promise.all(promises)

    // update order item project capacity
    const order = await this.repository.getOrderById(
      c,
      orderId,
      c.get("programId")
    )

    const isAllowOrderProjectionCapacity =
      this.orderModule.isAllowOrderProjectionCapacity(c, order)

    if (isAllowOrderProjectionCapacity) {
      const order_items = await this.orderModule.buildRollBackToPending(
        c,
        orderId
      )

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

      await this.repository.deleteOrderItemProjectionConfirmed(c, orderId)
    }
  }
}
