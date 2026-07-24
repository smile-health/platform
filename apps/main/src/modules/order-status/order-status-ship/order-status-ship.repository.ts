import { Context } from "hono"
import { v7 as uuidv7 } from "uuid"
import { sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import { sanitizeStockUpdateValues } from "@/common/utils/stock-sanitizer.utils.js"
import {
  AddOrderCommentShipDTO,
  AddOrderHistoryShipDTO,
  AddPurchaseShipDTO,
  AddStockCustomerShipDTO,
  AddTransactionShipDTO,
  ChangeStockShipDTO,
  UpdateOrderAuditShipDTO,
} from "./order-status-ship.schema.js"

export class OrderStatusShipRepository extends BaseRepository<"ws_orders"> {
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
      .forUpdate() // Acquire exclusive lock
      .executeTakeFirst()
  }

  async getOrderItemStockByOrderId(c: Context, orderId: number) {
    return await c.var.trx
      .selectFrom("ws_stocks as ws")
      .innerJoin("ws_order_item_stocks as wois", (join) =>
        join
          .onRef("wois.stock_id", "=", "ws.id")
          .on("wois.deleted_at", "is", null)
          .on("wois.order_id", "=", orderId)
      )
      .innerJoin("ws_materials as wm", (join) =>
        join
          .onRef("ws.material_id", "=", "wm.id")
          .on("wm.deleted_at", "is", null)
      )
      .leftJoin("materials as mp", (join) =>
        join.onRef("wm.parent_global_id", "=", "mp.id")
      )
      .leftJoin("ws_batches as wb", (join) =>
        join.onRef("ws.batch_id", "=", "wb.id").on("wb.deleted_at", "is", null)
      )
      .forUpdate()
      .select([
        "wois.id",
        "ws.id as stock_id",
        "ws.qty as stock_qty",
        "ws.allocated_qty as stock_allocated_qty",
        "ws.in_transit_qty as stock_in_transit_qty",
        "ws.activity_id as stock_activity_id",
        "ws.entity_id as stock_entity_id",
        "wois.allocated_qty as item_stock_allocated_qty",
        "wb.code as batch_code",
        "wb.manufacture_id",
        "ws.budget_source_id",
        "ws.year",
        "ws.price",
        "ws.batch_id",
        "ws.material_id as stock_material_id",
        "ws.parent_material_id",
        "wm.name as stock_material_name",
        "wm.unit_of_consumption as stock_material_unit_of_consumption",
      ])
      .where("ws.deleted_at", "is", null)
      .where("mp.deleted_at", "is", null) // check parent material not deleted, handle duplicate ws_materials
      .execute()
  }

  async createOrderHistoryShip(c: Context, req: AddOrderHistoryShipDTO) {
    return await c.var.trx
      .insertInto("ws_order_histories")
      .values(req)
      .executeTakeFirst()
  }

  async updateOrderAuditShipByOrderId(
    c: Context,
    orderId: number,
    req: UpdateOrderAuditShipDTO
  ) {
    const result = await c.var.trx
      .updateTable("ws_order_audits")
      .set(req)
      .where("order_id", "=", orderId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return result
  }

  async updateOrderItemStock(c: Context, id: number, req: any) {
    return await c.var.trx
      .updateTable("ws_order_item_stocks")
      .set(req)
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async createOrderCommentShip(c: Context, req: AddOrderCommentShipDTO) {
    return await c.var.trx
      .insertInto("ws_order_comments")
      .values(req)
      .executeTakeFirst()
  }

  /**
   * ATOMIC UPDATE: Update stock with delta values to prevent race conditions
   * Uses database-level GREATEST to ensure non-negative values
   */
  async updateStockShipAtomic(
    c: Context,
    id: number,
    deltas: {
      qty_delta?: number
      allocated_qty_delta?: number
      in_transit_qty_delta?: number
      unreceived_qty_delta?: number
      cutoff_qty_delta?: number
      price?: number | null
      total_price?: number | null
      year?: number | null
      budget_source_id?: number | null
      updated_by: number
      updated_at: Date
    }
  ) {
    const updates: Record<string, any> = {
      updated_by: deltas.updated_by,
      updated_at: deltas.updated_at,
    }

    // Build atomic update expressions using GREATEST to prevent negative values
    if (deltas.qty_delta !== undefined) {
      updates.qty = sql`GREATEST(qty + ${deltas.qty_delta}, 0)`
    }

    if (deltas.allocated_qty_delta !== undefined) {
      updates.allocated_qty = sql`GREATEST(allocated_qty + ${deltas.allocated_qty_delta}, 0)`
    }

    if (deltas.in_transit_qty_delta !== undefined) {
      updates.in_transit_qty = sql`GREATEST(in_transit_qty + ${deltas.in_transit_qty_delta}, 0)`
    }

    if (deltas.unreceived_qty_delta !== undefined) {
      updates.unreceived_qty = sql`GREATEST(unreceived_qty + ${deltas.unreceived_qty_delta}, 0)`
    }

    if (deltas.cutoff_qty_delta !== undefined) {
      updates.cutoff_qty = sql`qty`
    }

    if (deltas.price !== undefined) {
      updates.price = deltas.price
    }

    if (deltas.total_price !== undefined) {
      updates.total_price = deltas.total_price
    }

    if (deltas.year !== undefined) {
      updates.year = deltas.year
    }

    if (deltas.budget_source_id !== undefined) {
      updates.budget_source_id = deltas.budget_source_id
    }

    return await c.var.trx
      .updateTable("ws_stocks")
      .set(updates)
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  /**
   * LEGACY: Keep for backward compatibility, but prefer updateStockShipAtomic
   */
  async updateStockShip(c: Context, id: number, req: ChangeStockShipDTO) {
    const sanitizedReq = sanitizeStockUpdateValues(req)
    return await c.var.trx
      .updateTable("ws_stocks")
      .set(sanitizedReq)
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  /**
   * ATOMIC INSERT OR GET: Insert customer stock or get existing with lock
   * Prevents race conditions when multiple requests try to create the same stock
   */
  /**
   * ATOMIC: Create or get stock customer with insert-or-get pattern
   * Prevents race conditions by:
   * 1. Using SELECT FOR UPDATE to acquire pessimistic lock
   * 2. Checking for existing stock (excluding deleted records)
   * 3. Creating new stock only if not found
   * All within single transaction
   */
  async createOrGetStockCustomerShip(
    c: Context,
    req: AddStockCustomerShipDTO & { qty: number; unreceived_qty: number }
  ): Promise<{ id: number; isNew: boolean }> {
    // First try to find existing stock with lock, excluding soft-deleted records
    const existingStock = await c.var.trx
      .selectFrom("ws_stocks")
      .select("id")
      .forUpdate()
      .where("entity_id", "=", req.entity_id)
      .where("activity_id", "=", req.activity_id)
      .where("material_id", "=", req.material_id)
      .where("deleted_at", "is", null)
      .$if(req.batch_id === null || req.batch_id === undefined, (qb) =>
        qb.where("batch_id", "is", null)
      )
      .$if(req.batch_id !== null && req.batch_id !== undefined, (qb) =>
        qb.where("batch_id", "=", req.batch_id!)
      )
      .executeTakeFirst()

    if (existingStock) {
      return { id: existingStock.id, isNew: false }
    }

    // Create new stock with all fields explicitly set to ensure consistency
    const result = await c.var.trx
      .insertInto("ws_stocks")
      .values({
        qty: req.qty,
        batch_id: req.batch_id ?? null,
        entity_id: req.entity_id,
        activity_id: req.activity_id,
        material_id: req.material_id,
        updated_at: req.updated_at,
        updated_by: req.updated_by,
        created_by: req.created_by ?? req.updated_by,
        parent_material_id: req.parent_material_id ?? null,
        unreceived_qty: req.unreceived_qty,
        price: req.price ?? null,
        budget_source_id: req.budget_source_id ?? null,
        batch_code: req.batch_code ?? null,
        manufacture_id: req.manufacture_id ?? null,
        year: req.year ?? null,
      })
      .executeTakeFirst()

    return { id: Number(result.insertId), isNew: true }
  }

  async createTransactionShip(c: Context, req: AddTransactionShipDTO) {
    return await c.var.trx
      .insertInto("ws_transactions")
      .values({ ...req, uuid: uuidv7() })
      .executeTakeFirst()
  }

  async getDetailOrderItemByOrderId(c: Context, orderId: number) {
    const result = await c.var.trx
      .selectFrom("ws_orders as wso")
      .innerJoin("ws_order_comments as woc", (join) =>
        join
          .onRef("woc.order_id", "=", "wso.id")
          .on("woc.deleted_at", "is", null)
      )
      .innerJoin("ws_order_audits as wsoa", (join) =>
        join
          .onRef("wsoa.order_id", "=", "wso.id")
          .on("wsoa.deleted_at", "is", null)
      )
      .select([
        "woc.id",
        "woc.order_id",
        "wso.sales_ref",
        "wso.taken_by_customer",
        "wsoa.estimated_date",
        "woc.comment",
        "woc.created_at",
      ])
      .where("wso.id", "=", orderId)
      .where("wso.deleted_at", "is", null)
      .execute()

    return result
  }

  async createPurchaseShip(c: Context, req: AddPurchaseShipDTO) {
    return await c.var.trx
      .insertInto("ws_purchases")
      .values(req)
      .executeTakeFirst()
  }

  async getStockCustomers(
    c: Context,
    entityId: number | null,
    activityIds: number[],
    materialIds: number[],
    batchIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_stocks as ws")
      .where("entity_id", "=", entityId)
      .where("activity_id", "in", activityIds)
      .where("material_id", "in", materialIds)
      .where("batch_id", "in", batchIds)
      .where("ws.deleted_at", "is", null)
      .forUpdate()
      .selectAll("ws")
      .execute()
  }

  async getStockCustomersNoBatch(
    c: Context,
    entityId: number | null,
    activityIds: number[],
    materialIds: number[]
  ) {
    const result = await c.var.trx
      .selectFrom("ws_stocks as ws")
      .forUpdate()
      .selectAll()
      .where("ws.batch_id", "is", null)
      .where("ws.entity_id", "=", entityId)
      .where("ws.activity_id", "in", activityIds)
      .where("ws.material_id", "in", materialIds)
      .where("ws.deleted_at", "is", null)
      .execute()
    return result
  }

  async createStockCustomerShip(c: Context, req: AddStockCustomerShipDTO) {
    return await c.var.trx
      .insertInto("ws_stocks")
      .values(req)
      .executeTakeFirst()
  }

  async getWsUsersByEntityId(c: Context, entityId: number, programId: number) {
    console.log(entityId, programId)
    return await c.var.trx
      .selectFrom("ws_users")
      .selectAll()
      .where("entity_id", "=", entityId)
      .where("program_id", "=", programId)
      .where("status", "=", 1)
      .where("role", "not in", [1, 2])
      .execute()
  }

  async getWsEntitiesByIds(c: Context, ids: number[], programId: number) {
    return await c.var.trx
      .selectFrom("ws_entities")
      .select(["id", "name", "entity_tag_id", "province_id", "regency_id"])
      .where("id", "in", ids)
      .where("program_id", "=", programId)
      .execute()
  }

  async getWsActivitiesById(c: Context, id: number, programId: number) {
    return await c.var.trx
      .selectFrom("ws_activities")
      .selectAll()
      .where("id", "=", id)
      .where("program_id", "=", programId)
      .executeTakeFirst()
  }

  async getWsEntityActivityByEntityActivityId(
    c: Context,
    entityId: number,
    activityId: number,
    currentDate: Date
  ) {
    return await c.var.trx
      .selectFrom("ws_entity_activities")
      .select(["id"])
      .where("entity_id", "=", entityId)
      .where("activity_id", "=", activityId)
      .where((eb) =>
        eb.or([eb("end_date", ">=", currentDate), eb("end_date", "is", null)])
      )
      .where("start_date", "<=", currentDate)
      .executeTakeFirst()
  }
}
