import { ORDER_REASON } from "@/common/constants/order.js"
import { collect } from "@smile-health/lib/utils.js"
import { Context } from "hono"
import { OrderItemStockRepository } from "../order-item-stock/order-item-stock.repository.js"
import {
  AddOrderItemStockDTO,
  AddOrderItemStockRequest,
  EditOrderItemStockDTO,
  EditOrderItemStockRequest,
} from "../order-item-stock/order-item-stock.schema.js"
import { OrderModule } from "../order/order.module.js"
import { OrderItemStockPublisher } from "./order-item-stock.publisher.js"

export class OrderItemStockModule {
  constructor(
    private readonly repository: OrderItemStockRepository,
    private readonly publisher: OrderItemStockPublisher,
    private readonly orderModule: OrderModule
  ) {}

  async create(c: Context, id: number, body: AddOrderItemStockRequest) {
    const { order_items } = body
    const userId = Number(c.var.userId)
    const promises: any[] = []

    const order = await this.repository.getOrderById(c, id, c.get("programId"))
    promises.push(order)

    const orderItemsData: AddOrderItemStockDTO[] = order_items.map(
      (orderItem) => ({
        ...orderItem,
        order_id: id,
        qty: orderItem.ordered_qty,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
    )

    const orderData = {
      total_order_items: order!.total_order_items! + order_items.length,
    }

    promises.push(this.repository.updateOrder(c, id, orderData))

    for (const orderItem of orderItemsData) {
      const { other_reason, children, ...orderItemData } = orderItem

      const createdOrderItemStock = await this.repository.create(
        c,
        orderItemData
      )

      promises.push(createdOrderItemStock)

      if (
        other_reason &&
        orderItemData.order_reason_id === ORDER_REASON.OTHERS
      ) {
        const orderOtherReason = {
          source_id: Number(createdOrderItemStock.insertId),
          source_type: "order_item",
          content: other_reason,
          created_at: new Date(),
          updated_at: new Date(),
        }
        promises.push(this.repository.createOtherReason(c, orderOtherReason))
      }

      if (children && children.length > 0) {
        for (const child of children) {
          const childData = {
            order_id: id,
            parent_material_id: orderItemData.material_id,
            qty: child.ordered_qty,
            updated_by: userId,
            ...child,
          }
          promises.push(this.repository.create(c, childData))
        }
      }
    }

    await Promise.all(promises)

    await this.publisher.processUpdate(c, {
      order_id: id,
      program_id: c.get("programId"),
      ids: [0],
    })

    // update order item project capacity
    const childrenMaterialIds = order_items.flatMap(
      (item) => item.children?.map((child) => child.material_id) || []
    )

    const orderItems =
      await this.repository.getItemChildMaterialForAddByOrderId(
        c,
        id,
        childrenMaterialIds
      )

    if (orderItems && orderItems.length > 0) {
      for (const orderItem of orderItems) {
        const childMaterial: any = {
          ordered_qty: orderItem.ordered_qty,
          material_id: orderItem.material_id,
        }
        order_items[0]?.children?.push(childMaterial)
      }
    }

    const isAllowOrderProjectionCapacity =
      this.orderModule.isAllowOrderProjectionCapacity(c, order)

    if (isAllowOrderProjectionCapacity) {
      const projectionParams = this.orderModule.prepareProjectionParams(
        {
          id: id,
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

  async update(c: Context, body: EditOrderItemStockRequest) {
    const { order_items } = body
    const { id } = c.req.valid("param")
    const userId = Number(c.var.userId)
    const promises: any[] = []

    const orderItemsData: EditOrderItemStockDTO[] = order_items.map(
      (orderItem) => ({
        ...orderItem,
        qty: orderItem.ordered_qty,
        updated_by: userId,
        updated_at: new Date(),
      })
    )

    for (const orderItem of orderItemsData) {
      const { other_reason, id, children, ...orderItemData } = orderItem

      promises.push(this.repository.update(c, orderItemData, { id: id }))

      const otherReason =
        await this.repository.getOtherReasonBySourceIdAndSourceType(
          c,
          id,
          "order_item"
        )

      promises.push(otherReason)

      if (otherReason) {
        if (
          other_reason &&
          orderItemData.order_reason_id === ORDER_REASON.OTHERS
        ) {
          promises.push(
            this.repository.deleteOtherReason(c, id, "order_item", {
              content: other_reason,
              updated_at: new Date(),
            })
          )
        } else if (
          !other_reason &&
          orderItemData.order_reason_id !== ORDER_REASON.OTHERS
        ) {
          promises.push(
            this.repository.deleteOtherReason(c, id, "order_item", {
              deleted_at: new Date(),
            })
          )
        }
      } else if (
        other_reason &&
        orderItemData.order_reason_id === ORDER_REASON.OTHERS
      ) {
        promises.push(
          this.repository.createOtherReason(c, {
            source_id: id,
            source_type: "order_item",
            content: other_reason,
            created_at: new Date(),
            updated_at: new Date(),
          })
        )
      }

      if (children && children.length > 0) {
        for (const child of children) {
          const { id, ...childData } = child
          promises.push(
            this.repository.update(
              c,
              {
                qty: childData.ordered_qty,
                ...childData,
              },
              { id: id }
            )
          )
        }
      }
    }

    await Promise.all(promises)

    await this.publisher.processUpdate(c, {
      order_id: id,
      program_id: c.get("programId"),
      ids: collect(orderItemsData, "id"),
    })

    // update order item project capacity
    const order = await this.repository.getOrderById(c, id, c.get("programId"))

    const childrenIds = order_items.flatMap(
      (item) => item.children?.map((child) => child.id) || []
    )

    const orderItems =
      await this.repository.getItemChildMaterialForUpdateByOrderId(
        c,
        id,
        childrenIds
      )

    if (orderItems && orderItems.length > 0) {
      for (const orderItem of orderItems) {
        const childMaterial: any = {
          ordered_qty: orderItem.ordered_qty,
          id: orderItem.id,
        }
        order_items[0]?.children?.push(childMaterial)
      }
    }

    const isAllowOrderProjectionCapacity =
      this.orderModule.isAllowOrderProjectionCapacity(c, order)

    if (isAllowOrderProjectionCapacity) {
      const itemIdToMaterial = await this.orderModule.getChildItemsMaterial(
        c,
        id
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
          id: id,
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
