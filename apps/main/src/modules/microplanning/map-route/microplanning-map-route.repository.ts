import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "hono"
import { Kysely, sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import {
  MAX_ITERATION_ITEM_CONFIG,
  STATUS,
} from "./microplanning-map-route.constants.js"
import { SubmitMicroplanningMapRouteRequest } from "./microplanning-map-route.schema.js"

export class MicroplanningMapRouteRepository extends BaseRepository<"ws_map_routes"> {
  constructor() {
    super("ws_map_routes", false)
  }

  // ========================= START FOR RESPONSE ========================================

  private extendedQuery(c: Context) {
    const { trx, programId } = c.var
    return trx
      .withRecursive("numbers", (db) =>
        db
          .selectFrom(sql<{ n: number }>`(SELECT 0 AS n)`.as("init"))
          .select("n")
          .unionAll(
            db
              .selectFrom("numbers")
              .select(sql<number>`n + 1`.as("n"))
              .where("n", "<", MAX_ITERATION_ITEM_CONFIG)
          )
      )
      .with("road_type", (db) =>
        db
          .selectFrom("ws_microplanning_config as wmc")
          .innerJoin("numbers", (join) => join.onTrue())
          .select([
            sql<string>`
          JSON_UNQUOTE(JSON_EXTRACT(wmc.config, CONCAT('$[', n, '].id')))
        `.as("id"),
            sql<string>`
          JSON_UNQUOTE(JSON_EXTRACT(wmc.config, CONCAT('$[', n, '].name')))
        `.as("name"),
          ])
          .where("wmc.key", "=", "road_type")
          .where("wmc.deleted_at", "is", null)
          .where("wmc.program_id", "=", programId).where(sql<boolean>`
        JSON_EXTRACT(wmc.config, CONCAT('$[', n, ']')) IS NOT NULL
      `)
      )
      .with("destination_category", (db) =>
        db
          .selectFrom("ws_microplanning_config as wmc")
          .innerJoin("numbers", (join) => join.onTrue())
          .select([
            sql<string>`
          JSON_UNQUOTE(JSON_EXTRACT(wmc.config, CONCAT('$[', n, '].id')))
        `.as("id"),
            sql<string>`
          JSON_UNQUOTE(JSON_EXTRACT(wmc.config, CONCAT('$[', n, '].name')))
        `.as("name"),
          ])
          .where("wmc.key", "=", "destination_category")
          .where("wmc.deleted_at", "is", null)
          .where("wmc.program_id", "=", programId).where(sql<boolean>`
        JSON_EXTRACT(wmc.config, CONCAT('$[', n, ']')) IS NOT NULL
      `)
      )
      .with("destination_type", (db) =>
        db
          .selectFrom("ws_microplanning_config as wmc")
          .innerJoin("numbers", (join) => join.onTrue())
          .select([
            sql<string>`
          JSON_UNQUOTE(JSON_EXTRACT(wmc.config, CONCAT('$[', n, '].id')))
        `.as("id"),
            sql<string>`
          JSON_UNQUOTE(JSON_EXTRACT(wmc.config, CONCAT('$[', n, '].name')))
        `.as("name"),
          ])
          .where("wmc.key", "=", "destination_type")
          .where("wmc.deleted_at", "is", null)
          .where("wmc.program_id", "=", programId).where(sql<boolean>`
        JSON_EXTRACT(wmc.config, CONCAT('$[', n, ']')) IS NOT NULL
      `)
      )
      .with("ordered_stops", (db) =>
        db
          .selectFrom("ws_map_route_stops as wmrs")
          .innerJoin(
            "ws_map_destinations as wmd",
            "wmrs.destination_id",
            "wmd.id"
          )
          .leftJoin("destination_category as dc", "wmd.category", "dc.id")
          .leftJoin("destination_type as dt", "wmd.sub_type", "dt.id")
          .leftJoin("road_type as rt", "wmd.road_type", "rt.id")
          .select([
            "wmrs.id",
            "wmrs.route_id",
            "wmrs.destination_id",
            sql`JSON_OBJECT(
              'id', wmd.id,
              'name', wmd.name,
              'latitude', wmd.latitude,
              'longitude', wmd.longitude,
              'destination_category', JSON_OBJECT('id', CAST(dc.id as SIGNED), 'name', dc.name),
              'destination_type', JSON_OBJECT('id', CAST(dt.id as SIGNED), 'name', dt.name)
            )`.as("destination"),
            sql`JSON_OBJECT('id', CAST(rt.id as SIGNED), 'name', rt.name)`.as(
              "road_type"
            ),
            sql`CAST(wmd.distance_meters as DOUBLE)`.as("distance_meters"),
            sql`CAST(wmd.duration_seconds as DOUBLE)`.as("duration_seconds"),
          ])
          .where("wmrs.deleted_at", "is", null)
          .where("wmd.deleted_at", "is", null)
          .orderBy("wmrs.id", "asc")
      )
  }

  private baseQuery(ctx: Context) {
    return this.extendedQuery(ctx)
      .selectFrom("ws_map_routes as wmr")
      .leftJoin("ws_users as wsu_created", "wsu_created.id", "wmr.created_by")
      .leftJoin("ws_users as wsu_updated", "wsu_updated.id", "wmr.updated_by")
      .leftJoin(
        "ws_map_service_points as wmsp",
        "wmsp.id",
        "wmr.service_point_id"
      )
      .leftJoin("ws_microplanning as wm", "wm.id", "wmr.microplanning_id")
      .where("wmr.deleted_at", "is", null)
  }

  private selectFields() {
    return [
      "wmr.id",
      sql`JSON_OBJECT(
        'id', wm.id,
        'year', wm.year
      )`.as("microplanning"),
      sql`JSON_OBJECT(
        'id', wmsp.id,
        'longitude', wmsp.longitude,
        'latitude', wmsp.latitude
      )`.as("service_point"),
      "wmr.status",
      sql`(SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'id', os.id,
        'destination', os.destination,
        'road_type', os.road_type,
        'distance_meters', os.distance_meters,
        'duration_seconds', os.duration_seconds
      )) FROM ordered_stops os WHERE os.route_id = wmr.id)`.as("route_stops"),
      "wmr.created_at",
      "wmr.updated_at",
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

  async getDetailMicroplanningMapRoute({ context: c }: { context: Context }) {
    const base = this.baseQuery(c)
    const fetchedRouter = await base
      .select(this.selectFields())
      .where(
        "wmr.service_point_id",
        "=",
        c.var.resolvedServicePoint?.id as number
      )
      .executeTakeFirst()

    return fetchedRouter
  }

  async getIdMicroplanningMapRoute({ context: c }: { context: Context }) {
    const fetchedRouterId = await c.var.trx
      .selectFrom("ws_map_routes as wmr")
      .select(["wmr.id"])
      .where("wmr.deleted_at", "is", null)
      .where(
        "wmr.service_point_id",
        "=",
        c.var.resolvedServicePoint?.id as number
      )
      .executeTakeFirst()

    return fetchedRouterId
  }

  findServicePoint({ c }: { c: Context }) {
    const entityId = c.var.entityId
    const microplanningId = c.var.microplanningId

    const servicePoint = c.var.trx
      .selectFrom("ws_map_service_points as wmsp")
      .select(["wmsp.id", "wmsp.microplanning_id"])
      .where("wmsp.deleted_at", "is", null)
      .where("wmsp.entity_id", "=", entityId as number)
      .where("wmsp.microplanning_id", "=", microplanningId as number)
      .executeTakeFirst()

    return servicePoint
  }

  findDestinations({
    c,
    servicePointId,
    destinationIds,
  }: {
    c: Context
    servicePointId: number
    destinationIds: number[]
  }) {
    const destination = c.var.trx
      .selectFrom("ws_map_destinations as wmd")
      .select(["wmd.id", "wmd.road_type"])
      .where("wmd.deleted_at", "is", null)
      .where("wmd.service_point_id", "=", servicePointId)
      .where("wmd.id", "in", destinationIds)
      .execute()

    return destination
  }

  private mapStops({
    destinationIds,
    routeId,
    userId,
    now,
  }: {
    destinationIds: SubmitMicroplanningMapRouteRequest["destination_ids"]
    routeId: number
    userId?: number
    now: Date
  }) {
    return destinationIds.map((destination_id) => ({
      destination_id: Number(destination_id),
      route_id: routeId,
      created_by: userId,
      updated_by: userId,
      created_at: now,
      updated_at: now,
    }))
  }

  private async replaceMicroplanningRouteStops({
    ctx,
    routeId,
    destinationIds,
    userId,
    now,
  }: {
    ctx: Context
    routeId: number
    destinationIds: SubmitMicroplanningMapRouteRequest["destination_ids"]
    userId?: number
    now: Date
  }) {
    await ctx.var.trx
      .updateTable("ws_map_route_stops")
      .set({
        deleted_at: now,
        deleted_by: userId,
      })
      .where("route_id", "=", routeId)
      .execute()

    const mappedStops = this.mapStops({
      destinationIds,
      routeId,
      userId,
      now,
    })

    await ctx.var.trx
      .insertInto("ws_map_route_stops")
      .values(mappedStops)
      .execute()
  }

  private async createMicroplanningRoute({
    trx,
    servicePoint,
    userId,
    now,
  }: {
    trx: Kysely<DB>
    servicePoint: {
      id: number
      microplanning_id: number
    }
    userId?: number
    now: Date
  }): Promise<number> {
    const result = await trx
      .insertInto("ws_map_routes")
      .values({
        microplanning_id: servicePoint.microplanning_id,
        service_point_id: servicePoint.id,
        status: STATUS.INACTIVE,
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      })
      .executeTakeFirstOrThrow()

    return Number(result.insertId)
  }

  private async insertMicroplanningRouteStops({
    ctx,
    routeId,
    destinationIds,
    userId,
    now,
  }: {
    ctx: Context
    routeId: number
    destinationIds: SubmitMicroplanningMapRouteRequest["destination_ids"]
    userId?: number
    now: Date
  }) {
    const mappedStops = this.mapStops({
      destinationIds,
      routeId,
      userId,
      now,
    })

    await ctx.var.trx
      .insertInto("ws_map_route_stops")
      .values(mappedStops)
      .execute()
  }

  async submitMicroplanningMapRoute({
    context: c,
    body,
  }: {
    context: Context
    body: SubmitMicroplanningMapRouteRequest
  }) {
    const { destination_ids } = body

    const now = new Date()
    const userId = c.var.user?.id

    const servicePoint = c.var.resolvedServicePoint
    const destinations = c.var.resolvedDestinations

    if (!servicePoint || destinations.length === 0) return false

    const existingRoute = await this.getIdMicroplanningMapRoute({
      context: c,
    })

    if (existingRoute) {
      await c.var.trx
        .updateTable(`${this.tableName}`)
        .set({ status: STATUS.INACTIVE, updated_by: userId, updated_at: now })
        .where("id", "=", existingRoute.id)
        .execute()

      await this.replaceMicroplanningRouteStops({
        ctx: c,
        routeId: existingRoute.id,
        destinationIds: destination_ids,
        userId,
        now,
      })

      return
    }

    const routeId = await this.createMicroplanningRoute({
      trx: c.var.trx,
      servicePoint,
      userId,
      now,
    })

    await this.insertMicroplanningRouteStops({
      ctx: c,
      routeId,
      destinationIds: destination_ids,
      userId,
      now,
    })
  }

  async deleteMicroplanningMapRoute({ context: c }: { context: Context }) {
    const getMapRoute = await this.getIdMicroplanningMapRoute({
      context: c,
    })
    const now = new Date()
    const userId = c.var.user?.id

    await c.var.trx
      .updateTable(`${this.tableName}`)
      .set({
        status: STATUS.INACTIVE,
        deleted_at: now,
        deleted_by: userId,
      })
      .where("id", "=", getMapRoute?.id as number)
      .executeTakeFirstOrThrow()

    await c.var.trx
      .updateTable(`ws_map_route_stops`)
      .set({
        deleted_at: now,
        deleted_by: userId,
      })
      .where("route_id", "=", getMapRoute?.id as number)
      .executeTakeFirstOrThrow()
  }

  // ========================= END FOR RESPONSE ========================================
}
