import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "hono"
import { Kysely, sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import { STATUS } from "./microplanning-map-service-point.constants.js"
import { SubmitMicroplanningMapServicePointRequest } from "./microplanning-map-service-point.schema.js"

export class MicroplanningMapServicePointRepository extends BaseRepository<"ws_map_service_points"> {
  constructor() {
    super("ws_map_service_points", false)
  }

  // ========================= START FOR RESPONSE ========================================

  private baseQuery(trx: Kysely<DB>) {
    return trx
      .selectFrom(`${this.tableName} as wmsp`)
      .leftJoin("ws_users as wsu_created", "wsu_created.id", "wmsp.created_by")
      .leftJoin("ws_users as wsu_updated", "wsu_updated.id", "wmsp.updated_by")
      .leftJoin("ws_entities as we", "we.id", "wmsp.entity_id")
      .leftJoin("ws_microplanning as wm", "wm.id", "wmsp.microplanning_id")
  }

  private selectFields() {
    return [
      "wmsp.id",
      sql`JSON_OBJECT(
        'id', wm.id,
        'year', wm.year
      )`.as("microplanning"),
      sql`JSON_OBJECT(
        'id', we.id,
        'name', we.name
      )`.as("entity"),
      sql`CAST(wmsp.latitude AS DOUBLE)`.as("latitude"),
      sql`CAST(wmsp.longitude AS DOUBLE)`.as("longitude"),
      "wmsp.status",
      "wmsp.created_at",
      "wmsp.updated_at",
      this.userJson("wsu_created").as("user_created_by"),
      this.userJson("wsu_updated").as("user_updated_by"),
    ] as const
  }

  private userJson(alias: string) {
    return sql`
    CASE
      WHEN (${sql.ref(`${alias}.id`)} IS NOT NULL) THEN
        JSON_OBJECT(
          'id', ${sql.ref(`${alias}.id`)},
          'username', ${sql.ref(`${alias}.username`)},
          'firstname', ${sql.ref(`${alias}.firstname`)},
          'lastname', ${sql.ref(`${alias}.lastname`)}
        )
      ELSE NULL
    END
  `
  }

  async submitMicroplanningMapServicePoint({
    context: c,
    body,
  }: {
    context: Context
    body: SubmitMicroplanningMapServicePointRequest
  }) {
    const { latitude, longitude } = body
    const entityId = c.var?.entityId as number
    const now = new Date()
    const userId = c.var.user?.id as number
    const microplanning_id = c.var.microplanningId!

    const servicePoint = await this.getDetailMicroplanningMapServicePointId({
      context: c,
    })
    const servicePointId = servicePoint?.id as number

    if (servicePointId) {
      await c.var.trx
        .updateTable(`${this.tableName}`)
        .set({
          microplanning_id,
          latitude,
          longitude,
          status: STATUS.INACTIVE,
          updated_by: userId,
          updated_at: now,
        })
        .where("id", "=", servicePointId)
        .execute()
      return
    }

    const existingDeleted = await c.var.trx
      .selectFrom(`${this.tableName} as wmsp`)
      .select(["wmsp.id"])
      .where("wmsp.entity_id", "=", entityId)
      .where("wmsp.deleted_at", "is not", null)
      .where("wmsp.microplanning_id", "=", microplanning_id)
      .executeTakeFirst()

    if (existingDeleted) {
      await c.var.trx
        .updateTable(`${this.tableName}`)
        .set({
          latitude,
          longitude,
          status: STATUS.INACTIVE,
          created_at: now,
          created_by: userId,
          updated_at: now,
          updated_by: userId,
          deleted_at: null,
          deleted_by: null,
        })
        .where("id", "=", existingDeleted.id)
        .execute()
      return
    }

    await c.var.trx
      .insertInto(`${this.tableName}`)
      .values({
        microplanning_id,
        entity_id: entityId,
        latitude,
        longitude,
        status: STATUS.INACTIVE,
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      })
      .onDuplicateKeyUpdate({
        latitude,
        longitude,
        updated_by: userId,
        updated_at: now,
      })
      .execute()
  }

  async getDetailMicroplanningMapServicePoint({
    context: c,
  }: {
    context: Context
  }) {
    const entityId = c.var?.entityId as number
    const microplanning_id = c.var.microplanningId!

    return this.baseQuery(c.var.trx)
      .where("wmsp.microplanning_id", "=", microplanning_id)
      .select(this.selectFields())
      .where("wmsp.deleted_at", "is", null)
      .where("wmsp.entity_id", "=", entityId)
      .executeTakeFirst()
  }

  async deleteMicroplanningMapServicePoint({
    context: c,
  }: {
    context: Context
  }) {
    const now = new Date()
    const userId = c.var.user?.id as number

    const servicePoint = await this.getDetailMicroplanningMapServicePointId({
      context: c,
    })
    const servicePointId = servicePoint?.id as number

    await c.var.trx
      .updateTable(`${this.tableName}`)
      .set({
        status: STATUS.INACTIVE,
        deleted_at: now,
        deleted_by: userId,
      })
      .where("id", "=", servicePointId)
      .where("deleted_at", "is", null)
      .execute()

    const microplanningMapDestinations = await c.var.trx
      .selectFrom("ws_map_destinations as wmd")
      .select(["wmd.id"])
      .where("wmd.service_point_id", "=", servicePointId)
      .where("wmd.deleted_at", "is", null)
      .execute()

    if (microplanningMapDestinations.length > 0) {
      await c.var.trx
        .updateTable("ws_map_destinations")
        .set({
          status: STATUS.INACTIVE,
          deleted_at: now,
          deleted_by: userId,
        })
        .where("service_point_id", "=", servicePointId)
        .where("deleted_at", "is", null)
        .execute()
    }

    const microplanningMapRoutes = await c.var.trx
      .selectFrom("ws_map_routes as wmr")
      .select(["wmr.id"])
      .where("wmr.service_point_id", "=", servicePointId)
      .where("wmr.deleted_at", "is", null)
      .executeTakeFirst()

    if (microplanningMapRoutes) {
      await c.var.trx
        .updateTable("ws_map_routes")
        .set({
          status: STATUS.INACTIVE,
          deleted_at: now,
          deleted_by: userId,
        })
        .where("service_point_id", "=", servicePointId)
        .where("deleted_at", "is", null)
        .execute()

      await c.var.trx
        .updateTable("ws_map_route_stops")
        .set({
          deleted_at: now,
          deleted_by: userId,
        })
        .where("route_id", "=", microplanningMapRoutes.id)
        .where("deleted_at", "is", null)
        .execute()
    }
  }

  // ========================= END FOR RESPONSE ========================================

  // ========================= START FOR MIDDLEWARE ========================================
  async getDetailMicroplanningMapServicePointId({
    context: c,
  }: {
    context: Context
  }) {
    const entityId = c.var?.entityId as number
    const microplanning_id = c.var.microplanningId!

    return c.var.trx
      .selectFrom(`${this.tableName} as wmsp`)
      .select(["wmsp.id"])
      .where("wmsp.deleted_at", "is", null)
      .where("wmsp.entity_id", "=", entityId)
      .where("wmsp.microplanning_id", "=", microplanning_id)
      .executeTakeFirst()
  }
  // ========================= END FOR MIDDLEWARE ========================================
}
