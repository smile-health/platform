import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import { sanitizeStockUpdateValues } from "@/common/utils/stock-sanitizer.utils.js"
import { sql } from "kysely"
export class OrderAllocationRepository extends BaseRepository<"ws_orders"> {
  constructor(filterProgram = false, filterActivity = true) {
    super("ws_orders", filterProgram, filterActivity)
  }

  async getCheckStockByIds(
    c: Context,
    stock_ids: number[],
    activity_ids: number[],
    programId: number,
    entity_id: number,
    material_ids: number[]
  ) {
    if (
      stock_ids.length === 0 ||
      activity_ids.length === 0 ||
      material_ids.length === 0
    ) {
      return []
    }

    return await c.var.trx
      .selectFrom("ws_activities as wsa")
      .leftJoin("ws_stocks as wss", (join) =>
        join
          .onRef("wsa.id", "=", "wss.activity_id")
          .on("wss.deleted_at", "is", null)
      )
      .leftJoin("ws_materials as wsm", (join) =>
        join
          .onRef("wsm.id", "=", "wss.material_id")
          .on("wsm.deleted_at", "is", null)
      )
      .select([
        "wss.activity_id",
        "wss.qty",
        "wsm.name",
        "wss.id",
        "wss.material_id",
        "wss.allocated_qty",
        "wss.parent_material_id",
      ])
      .where("wss.id", "in", stock_ids)
      .where("wsa.program_id", "=", programId)
      .where("wss.entity_id", "=", entity_id)
      .where("wss.activity_id", "in", activity_ids)
      .where("wss.material_id", "in", material_ids)
      .execute()
  }

  async updateStockById(c: Context, stock_id: number, qty: number) {
    return await c.var.trx
      .updateTable("ws_stocks")
      .set({
        allocated_qty: sql`GREATEST(allocated_qty + ${qty}, 0)`,
        updated_at: new Date(),
      })
      .where("id", "=", stock_id)
      .executeTakeFirst()
  }

  async getWSEntityActivitiesByActivityIdAndEntityId(
    c: Context,
    activityIds: number[],
    entityId: number
  ) {
    const today = new Date().toISOString().split("T")[0]
    return c.var.trx
      .selectFrom("ws_entity_activities as wea")
      .selectAll("wea")
      .where("wea.activity_id", "in", activityIds)
      .where("wea.entity_id", "=", entityId)
      .where((eb) =>
        eb.or([eb("wea.end_date", ">=", today), eb("wea.end_date", "is", null)])
      )
      .where("wea.start_date", "<=", today)
      .execute()
  }

  async getEntityMaterialActivities(
    c: Context,
    entityId: number,
    materialIds: number[],
    activityIds: number[]
  ) {
    if (materialIds.length === 0 || activityIds.length === 0) {
      return []
    }

    return c.var.trx
      .selectFrom("ws_entity_material_activities as wema")
      .select(["wema.activity_id", "wema.material_id", "wema.entity_id"])
      .where("wema.entity_id", "=", entityId)
      .where("wema.material_id", "in", materialIds)
      .where("wema.activity_id", "in", activityIds)
      .execute()
  }

  async getCheckStockByIdsWithLock(
    c: Context,
    stock_ids: number[],
    activity_ids: number[],
    programId: number,
    entity_id: number,
    material_ids: number[]
  ) {
    if (
      stock_ids.length === 0 ||
      activity_ids.length === 0 ||
      material_ids.length === 0
    ) {
      return []
    }

    return await c.var.trx
      .selectFrom("ws_activities as wsa")
      .leftJoin("ws_stocks as wss", (join) =>
        join
          .onRef("wsa.id", "=", "wss.activity_id")
          .on("wss.deleted_at", "is", null)
      )
      .leftJoin("ws_materials as wsm", (join) =>
        join
          .onRef("wsm.id", "=", "wss.material_id")
          .on("wsm.deleted_at", "is", null)
      )
      .select([
        "wss.activity_id",
        "wss.qty",
        "wsm.name",
        "wss.id",
        "wss.material_id",
        "wss.allocated_qty",
        "wss.parent_material_id",
      ])
      .where("wss.id", "in", stock_ids)
      .where("wsa.program_id", "=", programId)
      .where("wss.entity_id", "=", entity_id)
      .where("wss.activity_id", "in", activity_ids)
      .where("wss.material_id", "in", material_ids)
      .forUpdate()
      .execute()
  }

  async revalidateStockAvailability(
    c: Context,
    stock_id: number,
    requested_qty: number
  ) {
    const stock = await c.var.trx
      .selectFrom("ws_stocks")
      .select(["id", "qty", "allocated_qty"])
      .where("id", "=", stock_id)
      .forUpdate()
      .executeTakeFirst()

    if (!stock) {
      return null
    }

    const available = stock.qty - stock?.allocated_qty!

    return {
      ...stock,
      available,
      canAllocate: available >= requested_qty,
    }
  }
}
