import { Context } from "hono"
import { BaseRepository } from "../base.repository"
import { sql } from "kysely"
import { CleaningUpUnallocatedInventoryRequest } from "./cleansing.schema"

export class CleansingRepository {
  constructor() {}

  async getMasterDataEntities(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("entities")
      .selectAll()
      .where("id", "=", entityId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getEntityWorkspaces(c: Context, globalEntityId: number) {
    return await c.var.trx
      .selectFrom("entity_workspaces")
      .selectAll()
      .where("entity_id", "=", globalEntityId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getEntityWorkspaceById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("entity_workspaces")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async updateEntityWorkspace(c: Context, id: number, globalEntityId: number) {
    return await c.var.trx
      .updateTable("entity_workspaces")
      .set({ entity_id: globalEntityId })
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async getUsers(c: Context, globalEntityId: number) {
    return await c.var.trx
      .selectFrom("users")
      .select(["id", "entity_id"])
      .where("entity_id", "=", globalEntityId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateUserEntity(c: Context, userId: number, globalEntityId: number) {
    return await c.var.trx
      .updateTable("users")
      .set({ entity_id: globalEntityId })
      .where("id", "=", userId)
      .executeTakeFirst()
  }

  async softDeleteEntity(c: Context, globalEntityId: number) {
    return await c.var.trx
      .updateTable("entities")
      .set({ deleted_at: new Date() })
      .where("id", "=", globalEntityId)
      .executeTakeFirst()
  }

  async getWorkspacesByEntityIds(c: Context, entityIds: number[]) {
    return await c.var.trx
      .selectFrom("entity_workspaces")
      .select(["id", "entity_id", "workspace_id"])
      .where("entity_id", "in", entityIds)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getUserWorkspacesByUserIdAndWorkspaceId(
    c: Context,
    userId: number,
    workspaceId: number
  ) {
    return await c.var.trx
      .selectFrom("user_workspaces")
      .select(["user_id", "workspace_id", "id"])
      .where("user_id", "=", userId)
      .where("workspace_id", "=", workspaceId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async updateUserWorkspaceById(c: Context, id: number, workspaceId: number) {
    return await c.var.trx
      .updateTable("user_workspaces")
      .set({ workspace_id: workspaceId })
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async getStocksByEntityId(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("ws_stocks as ws")
      .select([
        "ws.activity_id",
        "ws.id",
        "ws.material_id",
        "ws.batch_id",
        "ws.budget_source_id",
        "ws.batch_code",
        "ws.manufacture_id",
        "ws.qty",
      ])
      .where("ws.entity_id", "=", entityId)
      .where("ws.deleted_at", "is", null)
      .execute()
  }

  async getTransactionsByEntityId(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("ws_transactions as ws")
      .select([
        "ws.activity_id",
        "ws.stock_id",
        "ws.id",
        "ws.opening_qty",
        "ws.change_qty",
        "ws.order_id",
      ])
      .where("ws.entity_id", "=", entityId)
      .where("ws.deleted_at", "is", null)
      .execute()
  }

  async getOrdersByIds(c: Context, orderIds: number[]) {
    return await c.var.trx
      .selectFrom("ws_orders as ws")
      .select(["ws.id", "ws.vendor_id", "ws.customer_id"])
      .where("ws.id", "in", orderIds)
      .where("ws.deleted_at", "is", null)
      .execute()
  }

  async getProblematicStocks(
    c: Context,
    limit: number,
    offset: number
  ): Promise<
    Array<{
      customer_stock_id: number
      unreceived_qty: number
      difference_unreceived_qty: number
    }>
  > {
    // ==========================================
    // QUERY UTAMA - AGGREGATE BY CUSTOMER STOCK
    // untuk avoid duplicate customer_stock_id
    // ==========================================
    const query = c.var.trx
      .selectFrom("ws_stocks as ws")
      .innerJoin("ws_order_item_stocks as wois", "ws.id", "wois.stock_id")
      .innerJoin("ws_orders as wo", "wois.order_id", "wo.id")
      .innerJoin("ws_entities as we", "we.id", "wo.vendor_id")
      .innerJoin("ws_entities as customer", "customer.id", "wo.customer_id")
      .innerJoin("ws_materials as wm", (join) =>
        join
          .onRef("wm.id", "=", "ws.material_id")
          .on("wm.deleted_at", "is", null)
      )
      .innerJoin("ws_stocks as stock_customer", (join) =>
        join
          .onRef("stock_customer.entity_id", "=", "wo.customer_id")
          .onRef("stock_customer.activity_id", "=", "ws.activity_id")
          .onRef("stock_customer.material_id", "=", "ws.material_id")
          // ✅ NULL-safe equality untuk manufacture_id
          .on(
            sql`
            (stock_customer.manufacture_id = ws.manufacture_id 
             OR (stock_customer.manufacture_id IS NULL AND ws.manufacture_id IS NULL))
          `
          )
          // ✅ NULL-safe equality untuk batch_id
          .on(
            sql`
            (stock_customer.batch_id = ws.batch_id 
             OR (stock_customer.batch_id IS NULL AND ws.batch_id IS NULL))
          `
          )
          .on("stock_customer.deleted_at", "is", null)
      )
      .select((eb) => [
        "stock_customer.id as customer_stock_id",
        "stock_customer.unreceived_qty",
        eb.fn("sum", ["wois.allocated_qty"]).as("total_allocated_qty"),
        sql<number>`stock_customer.unreceived_qty - SUM(wois.allocated_qty)`.as(
          "difference_unreceived_qty"
        ),
      ])
      .where("ws.deleted_at", "is", null)
      .where("wo.deleted_at", "is", null)
      .where("wo.order_status_id", "=", 4)
      .groupBy(["stock_customer.id", "stock_customer.unreceived_qty"])
      .having(
        sql`
        (stock_customer.unreceived_qty IS NULL AND SUM(wois.allocated_qty) IS NOT NULL)
        OR (stock_customer.unreceived_qty IS NOT NULL AND SUM(wois.allocated_qty) IS NULL)
        OR (stock_customer.unreceived_qty != SUM(wois.allocated_qty))
      `
      )
      .limit(limit)
      .offset(offset)

    const compiled = query.compile()
    console.log("[getProblematicStocks] SQL:", compiled.sql)
    console.log("[getProblematicStocks] Parameters:", compiled.parameters)

    const result = await query.execute()

    result.slice(0, 5).forEach((row, idx) => {
      console.log(`  [${idx}]`, {
        customer_stock_id: row.customer_stock_id,
        unreceived_qty: row.unreceived_qty,
        total_allocated_qty: row.total_allocated_qty,
        difference_unreceived_qty: row.difference_unreceived_qty,
      })
    })

    return result.map((row) => ({
      customer_stock_id: Number(row.customer_stock_id),
      unreceived_qty: Number(row.unreceived_qty),
      difference_unreceived_qty: Number(row.difference_unreceived_qty),
    }))
  }
  async updateStocksUnreceivedQtyInBatch(
    c: Context,
    stocks: Array<{ stock_id: number; new_unreceived_qty: number }>
  ): Promise<any> {
    if (stocks.length === 0) {
      return { affectedRows: 0 }
    }

    console.log("[updateStocksUnreceivedQtyInBatch] Updating stocks:", stocks)

    // Update each stock with its corresponding difference value
    for (const stock of stocks) {
      await c.var.trx
        .updateTable("ws_stocks")
        .set({ unreceived_qty: stock.new_unreceived_qty })
        .where("id", "=", stock.stock_id)
        .executeTakeFirst()
    }

    console.log(
      "[updateStocksUnreceivedQtyInBatch] Updated",
      stocks.length,
      "rows"
    )
  }

  async getTransactionsForCleansing(
    c: Context,
    stock_id: number,
    entity_id: number
  ) {
    const db = c.var.trx || c.var.db

    console.log(
      "[getTransactionsForCleansing] stock_id:",
      stock_id,
      "entity_id:",
      entity_id
    )

    const result = await db
      .selectFrom("ws_stocks as ws")
      .innerJoin("ws_transactions as wt", (join) =>
        join.onRef("wt.stock_id", "=", "ws.id").on("wt.deleted_at", "is", null)
      )
      .select([
        "ws.id as stock_id",
        "wt.id as transaction_id",
        "wt.created_at",
        "wt.change_qty",
        "wt.opening_qty",
        "ws.qty as stock_qty",
        "wt.entity_activity_id",
        "wt.updated_by",
        "wt.created_by",
        "wt.activity_id",
        "wt.entity_id",
        "wt.batch_code",
        "wt.device_type",
        "wt.uuid",
      ])
      .where("ws.id", "=", stock_id)
      .where("ws.entity_id", "=", entity_id)
      .where("ws.deleted_at", "is", null)
      .execute()

    console.log("[getTransactionsForCleansing] Result:", result)

    return result
  }

  async updateTransactionsUuidInBatch(
    c: Context,
    transactions: Array<{ transaction_id: number; uuid: string }>
  ): Promise<any> {
    if (transactions.length === 0) {
      return { affectedRows: 0 }
    }

    console.log(
      "[updateTransactionsUuidInBatch] Updating transactions:",
      transactions.length
    )

    for (const trx of transactions) {
      await c.var.trx
        .updateTable("ws_transactions")
        .set({ uuid: trx.uuid, updated_at: new Date() })
        .where("id", "=", trx.transaction_id)
        .executeTakeFirst()
    }

    return { affectedRows: transactions.length }
  }

  async insertTransaction(
    c: Context,
    data: {
      activity_id: number
      entity_id: number
      stock_id: number
      batch_code: string | null
      device_type: number
      created_by: number
      updated_by: number
      opening_qty: number
      change_qty: number
      transaction_type_id: number
      transaction_reason_id?: number
      order_id?: number
      entity_activity_id?: number
      uuid?: string
      created_at?: Date
    }
  ): Promise<{ insertId: number }> {
    const result = await c.var.trx
      .insertInto("ws_transactions")
      .values({
        activity_id: data.activity_id,
        entity_id: data.entity_id,
        stock_id: data.stock_id,
        batch_code: data.batch_code,
        device_type: data.device_type,
        created_by: data.created_by,
        updated_by: data.updated_by,
        opening_qty: data.opening_qty,
        change_qty: data.change_qty,
        transaction_type_id: data.transaction_type_id,
        entity_activity_id: data.entity_activity_id,
        uuid: data.uuid,
        created_at: data.created_at || new Date(),
        updated_at: new Date(),
        deleted_at: null,
      })
      .executeTakeFirst()

    return { insertId: Number(result?.insertId) || 0 }
  }

  async insertOtherReason(
    c: Context,
    data: {
      source_id: number
      source_type: string
      content: string
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_other_reasons")
      .values({
        source_id: data.source_id,
        source_type: data.source_type,
        content: data.content,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      })
      .executeTakeFirst()

    return { insertId: Number(result?.insertId) || 0 }
  }

  async updateStockQty(
    c: Context,
    stockId: number,
    qty: number
  ): Promise<{ affectedRows: number }> {
    const result = await c.var.trx
      .updateTable("ws_stocks")
      .set({
        qty: qty,
        updated_at: new Date(),
        unreceived_qty: 0,
        in_transit_qty: 0,
      })
      .where("id", "=", stockId)
      .executeTakeFirst()

    return { affectedRows: Number(result?.numUpdatedRows ?? 0) }
  }

  async getStockIsNotVendorMoreThanZero(c: Context, stockIds?: number[]) {
    return await c.var.trx
      .selectFrom("ws_entities as we")
      .innerJoin("ws_stocks as ws", (join) =>
        join.onRef("ws.entity_id", "=", "we.id").on("ws.deleted_at", "is", null)
      )
      .select(["ws.id as stock_id", "ws.qty"])
      .where("we.is_vendor", "=", 0)
      .where("ws.qty", ">", 0)
      .$if(stockIds !== undefined && stockIds.length > 0, (qb) =>
        qb.where("ws.id", "in", stockIds!)
      )
      .execute()
  }

  async getTrsactionsLatestByStockIds(c: Context, stockIds: number[]) {
    return await c.var.trx
      .selectFrom((eb) =>
        eb
          .selectFrom("ws_transactions as wt")
          .innerJoin("ws_stocks as ws", (join) =>
            join
              .onRef("ws.id", "=", "wt.stock_id")
              .on("wt.deleted_at", "is", null)
          )
          .select([
            "wt.id as transaction_id",
            "wt.stock_id",
            "wt.created_at",
            "wt.change_qty",
            "wt.opening_qty",
            "ws.qty as stock_qty",
            "wt.entity_activity_id",
            "wt.updated_by",
            "wt.created_by",
            "wt.activity_id",
            "wt.entity_id",
            "wt.batch_code",
            "wt.device_type",
            "wt.uuid",
            sql<number>`ROW_NUMBER() OVER (PARTITION BY wt.stock_id ORDER BY wt.created_at DESC)`.as(
              "rn"
            ),
          ])
          .where("ws.id", "in", stockIds)
          .where("ws.deleted_at", "is", null)
          .where("wt.deleted_at", "is", null)
          .as("ranked")
      )
      .selectAll()
      .where("rn", "=", 1)
      .execute()
  }

  async getStockOpnameData(c: Context, periodIds: number[]) {
    return await c.var.trx
      .selectFrom("ws_stock_opnames as wso")
      .innerJoin("ws_stocks as ws", (join) =>
        join.onRef("ws.id", "=", "wso.stock_id").on("ws.deleted_at", "is", null)
      )
      .innerJoin("ws_entities as we", (join) =>
        join
          .onRef("we.id", "=", "wso.entity_id")
          .on("we.deleted_at", "is", null)
      )
      .leftJoin("ws_orders as wo", (join) =>
        join
          .onRef("wo.customer_id", "=", "we.id")
          .on("wo.order_status_id", "=", 4)
          .on("wo.deleted_at", "is", null)
      )
      .select([
        "we.id as entity_id",
        "we.name as entity_name",
        sql<number>`COUNT(DISTINCT ${sql.ref("wo.id")})`.as("active_orders"),
        sql<number>`COUNT(DISTINCT ${sql.ref("wso.stock_id")})`.as(
          "total_stocks"
        ),
        sql<string>`GROUP_CONCAT(DISTINCT ${sql.ref("wso.stock_id")} ORDER BY ${sql.ref("wso.stock_id")} SEPARATOR ', ')`.as(
          "stock_ids"
        ),
        sql<string>`GROUP_CONCAT(DISTINCT ${sql.ref("wo.id")} SEPARATOR ', ')`.as(
          "order_ids"
        ),
      ])
      .where("wso.period_id", "in", periodIds)
      .where("wso.in_transit_qty", ">", 0)
      .where("wso.deleted_at", "is", null)
      .groupBy(["we.id", "we.name"])
      .orderBy("entity_id", "asc")
      .execute()
  }

  async getStockOpnameByIds(c: Context, stockOpnameIds: number[]) {
    return await c.var.trx
      .selectFrom("ws_stock_opname_periods as wsp")
      .where("wsp.id", "in", stockOpnameIds)
      .where("wsp.deleted_at", "is", null)
      .selectAll()
      .execute()
  }

  async updateStockUnreceivedQtyAndOpnameByStockAndPeriod(
    c: Context,
    stockIds: number[],
    periodId: number
  ) {
    if (stockIds.length === 0) return

    // Update ws_stocks
    await c.var.trx
      .updateTable("ws_stocks")
      .set({ unreceived_qty: 0 })
      .where("id", "in", stockIds)
      .executeTakeFirst()

    // Update ws_stock_opnames with JOIN preserving updated_at

    await c.var.trx.executeQuery(
      sql`
        UPDATE ws_stock_opnames w
        JOIN (
          SELECT id, updated_at
          FROM ws_stock_opnames wso
          WHERE wso.stock_id in (${stockIds})
            AND wso.period_id = ${periodId}
        ) old ON w.id = old.id
        SET 
          w.in_transit_qty = 0,
          w.updated_at = old.updated_at
        WHERE w.stock_id in (${stockIds})
          AND w.period_id = ${periodId}
      `.compile(c.var.trx)
    )
  }

  async getStockOpnameDataWithOrders(
    c: Context,
    customerId: number,
    customerStockId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_stocks as ws")
      .innerJoin("ws_order_item_stocks as wois", (join) =>
        join
          .onRef("wois.stock_id", "=", "ws.id")
          .on("wois.deleted_at", "is", null)
      )
      .innerJoin("ws_orders as wo", (join) =>
        join
          .onRef("wo.id", "=", "wois.order_id")
          .on("wo.deleted_at", "is", null)
          .on("wo.order_status_id", "=", 4)
      )
      .innerJoin("ws_entities as we", (join) =>
        join.onRef("we.id", "=", "wo.vendor_id").on("we.deleted_at", "is", null)
      )
      .innerJoin("ws_entities as customer", (join) =>
        join
          .onRef("customer.id", "=", "wo.customer_id")
          .on("customer.id", "=", customerId)
          .on("customer.deleted_at", "is", null)
      )
      .innerJoin("ws_materials as wm", (join) =>
        join
          .onRef("wm.id", "=", "ws.material_id")
          .on("wm.deleted_at", "is", null)
      )
      .innerJoin("ws_stocks as stock_customer", (join) =>
        join
          .onRef("stock_customer.entity_id", "=", "wo.customer_id")
          .onRef("stock_customer.activity_id", "=", "ws.activity_id")
          .onRef("stock_customer.material_id", "=", "ws.material_id")
          .on(
            sql`
            (stock_customer.manufacture_id = ws.manufacture_id 
             OR (stock_customer.manufacture_id IS NULL AND ws.manufacture_id IS NULL))
          `
          )
          .on(
            sql`
            (stock_customer.batch_id = ws.batch_id 
             OR (stock_customer.batch_id IS NULL AND ws.batch_id IS NULL))
          `
          )
          .on("stock_customer.deleted_at", "is", null)
          .on("stock_customer.id", "=", customerStockId)
      )
      .select([
        "we.program_id",
        "ws.id as stock_id_vendor",
        "stock_customer.id as stocks_id_customer",
        "we.name as vendor_name",
        "customer.name as customer_name",
        "customer.id as entities_id_customer",
        sql<number>`SUM(${sql.ref("wois.allocated_qty")})`.as(
          "total_order_allocated_qty"
        ),
        "ws.in_transit_qty as stock_in_transit_qty",
        "stock_customer.unreceived_qty as stock_unreceived_qty_customer",
        sql<number>`(${sql.ref("stock_customer.unreceived_qty")} - SUM(${sql.ref("wois.allocated_qty")}))`.as(
          "difference_unreceived_qty"
        ),
        sql<string>`GROUP_CONCAT(${sql.ref("wo.id")} SEPARATOR ', ')`.as(
          "order_ids"
        ),
        sql<number>`COUNT(${sql.ref("wo.id")})`.as("total_orders"),
        "wm.name as material_name",
        "ws.material_id as material_id_vendor",
        "stock_customer.material_id as material_id_customer",
        "ws.batch_code as batch_code_vendor",
        "stock_customer.batch_code as batch_code_customer",
        "ws.batch_id as batch_id_vendor",
        "stock_customer.batch_id as batch_id_customer",
        "stock_customer.manufacture_id",
        "ws.manufacture_id",
        "stock_customer.unreceived_qty",
      ])
      .where("ws.deleted_at", "is", null)
      .groupBy([
        "stock_customer.id",
        "stock_customer.unreceived_qty",
        "we.program_id",
        "ws.id",
        "stock_customer.id",
        "we.name",
        "customer.name",
        "customer.id",
        "ws.in_transit_qty",
        "wm.name",
        "ws.material_id",
        "stock_customer.material_id",
        "ws.batch_code",
        "stock_customer.batch_code",
        "ws.batch_id",
        "stock_customer.batch_id",
        "stock_customer.manufacture_id",
        "ws.manufacture_id",
      ])
      .having(
        sql`${sql.ref("stock_customer.unreceived_qty")} != SUM(${sql.ref("wois.allocated_qty")})`
      )
      .execute()
  }

  async updateStockAndOpnameByDifference(
    c: Context,
    stockCustomerId: number,
    periodId: number,
    newUnreceivedQty: number
  ) {
    await c.var.trx
      .updateTable("ws_stocks")
      .set({
        unreceived_qty: newUnreceivedQty,
      })
      .where("id", "=", stockCustomerId)
      .executeTakeFirst()

    await c.var.trx.executeQuery(
      sql`
        UPDATE ws_stock_opnames w
        JOIN (
          SELECT id, updated_at
          FROM ws_stock_opnames wso
          WHERE wso.stock_id = ${stockCustomerId}
            AND wso.period_id = ${periodId}
        ) old ON w.id = old.id
        SET 
          w.in_transit_qty = ${newUnreceivedQty},
          w.updated_at = old.updated_at
        WHERE w.stock_id = ${stockCustomerId}
          AND w.period_id = ${periodId}
      `.compile(c.var.trx)
    )
  }

  async getEntityWorkspacesWithTransactionCount(
    c: Context,
    entityIds: number[]
  ) {
    if (entityIds.length === 0) return []

    return await c.var.trx
      .selectFrom("entities as e")
      .innerJoin("entity_workspaces as ew", (join) =>
        join.onRef("ew.entity_id", "=", "e.id").on("ew.deleted_at", "is", null)
      )
      .leftJoin("ws_transactions as wt", (join) =>
        join.onRef("wt.entity_id", "=", "ew.id").on("wt.deleted_at", "is", null)
      )
      .select((eb) => [
        "ew.id",
        "ew.workspace_id as program_id",
        "ew.entity_id",
        "e.id as global_id",
        "e.name",
        eb.fn("count", ["wt.id"]).as("transaction_count"),
      ])
      .where("e.id", "in", entityIds)
      .where("e.deleted_at", "is", null)
      .groupBy(["ew.id", "ew.workspace_id", "ew.entity_id", "e.id", "e.name"])
      .execute()
  }

  async getUserWorkspacesByEntityIds(c: Context, entityIds: number[]) {
    if (entityIds.length === 0) return []

    return await c.var.trx
      .selectFrom("users as u")
      .innerJoin("user_workspaces as uw", (join) =>
        join.onRef("uw.user_id", "=", "u.id").on("uw.deleted_at", "is", null)
      )
      .select([
        "uw.id",
        "uw.workspace_id as program_id",
        "u.entity_id",
        "u.id as user_id",
      ])
      .where("u.entity_id", "in", entityIds)
      .where("u.deleted_at", "is", null)
      .execute()
  }

  async softDeleteEntityWorkspace(c: Context, entityWorkspaceId: number) {
    return await c.var.trx
      .updateTable("entity_workspaces")
      .set({ deleted_at: new Date() })
      .where("id", "=", entityWorkspaceId)
      .executeTakeFirst()
  }

  async getCustomerVendorsByCustomerId(c: Context, customerId: number) {
    return await c.var.trx
      .selectFrom("ws_customer_vendors as wcv")
      .selectAll()
      .where("wcv.customer_id", "=", customerId)
      .where("wcv.deleted_at", "is", null)
      .execute()
  }

  async getCustomerVendorsByVendorId(c: Context, vendorId: number) {
    return await c.var.trx
      .selectFrom("ws_customer_vendors as wcv")
      .selectAll()
      .where("wcv.vendor_id", "=", vendorId)
      .where("wcv.deleted_at", "is", null)
      .execute()
  }

  async getEntityActivitiesByEntityId(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("ws_entity_activities as wea")
      .selectAll()
      .where("wea.entity_id", "=", entityId)
      .where("wea.deleted_at", "is", null)
      .execute()
  }

  async getEntityMaterialActivitiesByEntityId(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("ws_entity_material_activities as wema")
      .selectAll()
      .where("wema.entity_id", "=", entityId)
      .where("wema.deleted_at", "is", null)
      .execute()
  }

  async getCustomerVendorActivitiesByEntityId(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("ws_customer_vendor_activities as wcva")
      .selectAll()
      .where("wcva.customer_vendor_id", "=", entityId)
      .where("wcva.deleted_at", "is", null)
      .execute()
  }

  async softDeleteCustomerVendors(c: Context, ids: number[]) {
    if (ids.length === 0) return { affectedRows: 0 }

    const result = await c.var.trx
      .updateTable("ws_customer_vendors")
      .set({ deleted_at: new Date() })
      .where("id", "in", ids)
      .executeTakeFirst()

    return { affectedRows: Number(result?.numUpdatedRows ?? 0) }
  }

  async softDeleteEntityActivities(c: Context, ids: number[]) {
    if (ids.length === 0) return { affectedRows: 0 }

    const result = await c.var.trx
      .updateTable("ws_entity_activities")
      .set({ deleted_at: new Date() })
      .where("id", "in", ids)
      .executeTakeFirst()

    return { affectedRows: Number(result?.numUpdatedRows ?? 0) }
  }

  async softDeleteEntityMaterialActivities(c: Context, ids: number[]) {
    if (ids.length === 0) return { affectedRows: 0 }

    const result = await c.var.trx
      .updateTable("ws_entity_material_activities")
      .set({ deleted_at: new Date() })
      .where("id", "in", ids)
      .executeTakeFirst()

    return { affectedRows: Number(result?.numUpdatedRows ?? 0) }
  }

  async softDeleteCustomerVendorActivities(c: Context, ids: number[]) {
    if (ids.length === 0) return { affectedRows: 0 }

    const result = await c.var.trx
      .updateTable("ws_customer_vendor_activities")
      .set({ deleted_at: new Date() })
      .where("id", "in", ids)
      .executeTakeFirst()

    return { affectedRows: Number(result?.numUpdatedRows ?? 0) }
  }

  async updateEntityWorkspaceEntity(
    c: Context,
    workspaceId: number,
    newEntityId: number
  ) {
    return await c.var.trx
      .updateTable("entity_workspaces")
      .set({ entity_id: newEntityId })
      .where("id", "=", workspaceId)
      .executeTakeFirst()
  }

  async getTransactionByStockId(c: Context, stockId: number) {
    return await c.var.trx
      .selectFrom("ws_transactions")
      .innerJoin("ws_stocks as ws", (join) =>
        join
          .onRef("ws.id", "=", "ws_transactions.stock_id")
          .on("ws_transactions.deleted_at", "is", null)
      )
      .selectAll("ws_transactions")
      .select(["ws.qty as stock_qty", "ws.entity_id as stock_entity_id"])
      .where("ws.id", "=", stockId)
      .where("ws.deleted_at", "is", null)
      .execute()
  }

  async getUnallocatedStock(
    c: Context,
    body: CleaningUpUnallocatedInventoryRequest,
    limitOverride?: number,
    offset?: number
  ) {
    let query = c.var.trx
      .selectFrom("ws_stocks as ws")
      .innerJoin("ws_batches as wb", (join) =>
        join.onRef("wb.id", "=", "ws.batch_id").on("wb.deleted_at", "is", null)
      )
      .innerJoin("ws_materials as wm", (join) =>
        join
          .onRef("wm.id", "=", "ws.material_id")
          .on("wm.deleted_at", "is", null)
      )
      .innerJoin("ws_entities as we", "we.id", "ws.entity_id")
      .innerJoin("workspaces as w", "w.id", "we.program_id")
      .innerJoin("ws_activities as wa", "wa.id", "ws.activity_id")
      .leftJoin("ws_entity_activities as wea", (join) =>
        join
          .onRef("wea.entity_id", "=", "ws.entity_id")
          .onRef("wea.activity_id", "=", "ws.activity_id")
          .on("wea.deleted_at", "is", null)
      )
      .leftJoin("ws_entity_material_activities as wema", (join) =>
        join
          .onRef("wema.entity_id", "=", "ws.entity_id")
          .onRef("wema.activity_id", "=", "ws.activity_id")
          .onRef("wema.material_id", "=", "wm.parent_id")
          .on("wema.deleted_at", "is", null)
      )
      .where("ws.qty", ">", 0)
      .where("ws.deleted_at", "is", null)
      .where("wema.id", "is", null)
      .groupBy(["ws.id"])
      .select([
        "ws.id as stock_id",
        "ws.entity_id",
        "ws.activity_id",
        "ws.material_id",
        "ws.qty",
        "wm.name as material_name",
      ])

    if (body.start_expired_date) {
      query = query.where("wb.expired_date", ">=", body.start_expired_date)
    }

    if (body.end_expired_date) {
      query = query.where("wb.expired_date", "<=", body.end_expired_date)
    }

    // 3. Tambahkan offset HANYA JIKA ada nilainya
    if (offset !== undefined) {
      query = query.offset(offset)
    }

    // 4. Tambahkan limit (limitOverride diprioritaskan, lalu body.limit)
    const effectiveLimit = limitOverride ?? body.limit
    if (effectiveLimit) {
      query = query.limit(effectiveLimit)
    }

    // 5. Eksekusi query
    const result = await query.execute()

    return result
  }

  async softDeleteStocksById(c: Context, id: number) {
    return await c.var.trx
      .updateTable("ws_stocks")
      .set({ deleted_at: new Date() })
      .where("id", "=", id)
      .executeTakeFirst()
  }
}
