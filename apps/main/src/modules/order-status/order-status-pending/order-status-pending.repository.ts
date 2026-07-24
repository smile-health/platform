import { Context } from "hono"
import { BaseRepository } from "../../base.repository.js"
import {
  AddOrderHistoryPendingDTO,
  ChangeOrderItemStockPendingDTO,
} from "./order-status-pending.schema.js"

export class OrderStatusPendingRepository extends BaseRepository<"ws_orders"> {
  constructor(filterProgram = false, filterActivity = false) {
    super("ws_orders", filterProgram, filterActivity)
  }

  async getOrderById(c: Context, id: number, programId: number) {
    return await c.var.trx
      .selectFrom("ws_orders as wso")
      .selectAll()
      .leftJoin("ws_activities as wsa", (join) =>
        join
          .onRef("wsa.id", "=", "wso.activity_id")
          .on("wsa.program_id", "=", programId)
          .on("wsa.deleted_at", "is", null)
      )
      .where("wso.id", "=", id)
      .where("wso.deleted_at", "is", null)
      .executeTakeFirst()
  }

  /**
   * GET ORDER WITH LOCK: Prevents concurrent updates to same order
   * Uses SELECT FOR UPDATE to acquire pessimistic lock
   */
  async getOrderByIdWithLock(c: Context, id: number, programId: number) {
    return await c.var.trx
      .selectFrom("ws_orders as wso")
      .selectAll()
      .leftJoin("ws_activities as wsa", (join) =>
        join
          .onRef("wsa.id", "=", "wso.activity_id")
          .on("wsa.program_id", "=", programId)
          .on("wsa.deleted_at", "is", null)
      )
      .where("wso.id", "=", id)
      .where("wso.deleted_at", "is", null)
      .forUpdate()  // Acquire exclusive lock
      .executeTakeFirst()
  }

  async getOrderItemStockByOrderId(c: Context, orderId: number) {
    return await c.var.trx
      .selectFrom("ws_order_item_stocks as wois")
      .selectAll()
      .where("wois.order_id", "=", orderId)
      .where("wois.deleted_at", "is", null)
      .execute()
  }

  async updateOrderItemStockPendingByOrderItemId(
    c: Context,
    id: number,
    req: ChangeOrderItemStockPendingDTO
  ) {
    const result = await c.var.trx
      .updateTable("ws_order_item_stocks")
      .set(req)
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return result
  }

  async createOrderHistoryPending(c: Context, req: AddOrderHistoryPendingDTO) {
    return await c.var.trx
      .insertInto("ws_order_histories")
      .values(req)
      .executeTakeFirst()
  }

  async deleteOrderItemProjectionConfirmed(c: Context, orderId: number) {
    return await c.var.trx
      .deleteFrom("ws_order_item_projection_capacities")
      .where("order_id", "=", orderId)
      .where("is_confirm", "=", 1)
      .execute()
  }
}
