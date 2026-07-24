import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import {
  MAX_ITERATION_ITEM_CONFIG,
  STATUS,
} from "./microplanning-map-destination.constants.js"
import {
  GetListMicroplanningMapDestinationParams,
  SubmitMicroplanningMapDestinationItemRequest,
  SubmitMicroplanningMapDestinationRequest,
} from "./microplanning-map-destination.schema.js"

export class MicroplanningMapDestinationRepository extends BaseRepository<"ws_map_destinations"> {
  constructor() {
    super("ws_map_destinations", false)
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
  }

  private baseQuery(ctx: Context) {
    return this.extendedQuery(ctx)
      .selectFrom("ws_map_destinations as wmd")
      .leftJoin("ws_users as wsu_created", "wsu_created.id", "wmd.created_by")
      .leftJoin("ws_users as wsu_updated", "wsu_updated.id", "wmd.updated_by")
      .innerJoin(
        "ws_map_service_points as wmsp",
        "wmsp.id",
        "wmd.service_point_id"
      )
      .innerJoin("ws_microplanning as wm", "wm.id", "wmd.microplanning_id")
      .leftJoin("destination_type as dt", "wmd.sub_type", "dt.id")
      .leftJoin("destination_category as dc", "wmd.category", "dc.id")
      .leftJoin("road_type as rt", "wmd.road_type", "rt.id")
      .where("wmsp.entity_id", "=", ctx.var?.entityId as number)
      .where("wmd.microplanning_id", "=", ctx.var?.microplanningId as number)
  }

  private selectFields() {
    return [
      "wmd.id",
      "wmd.name",
      sql`JSON_OBJECT(
        'id', wm.id,
        'year', wm.year
      )`.as("microplanning"),
      sql`JSON_OBJECT(
        'id', wmsp.id,
        'latitude', wmsp.latitude,
        'longitude', wmsp.longitude
      )`.as("service_point"),
      sql`JSON_OBJECT(
        'id', rt.id,
        'name', rt.name
      )`.as("road_type"),
      sql`JSON_OBJECT(
        'id', dt.id,
        'name', dt.name
      )`.as("destination_type"),
      sql`JSON_OBJECT(
        'id', dc.id,
        'name', dc.name
      )`.as("destination_category"),
      "wmd.notes",
      sql`CAST(wmd.latitude AS DOUBLE)`.as("latitude"),
      sql`CAST(wmd.longitude AS DOUBLE)`.as("longitude"),
      sql`CAST(wmd.distance_meters AS DOUBLE)`.as("distance_meters"),
      sql`CAST(wmd.duration_seconds AS DOUBLE)`.as("duration_seconds"),
      "wmd.status",
      "wmd.created_at",
      "wmd.updated_at",
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

  getExistingItemsByServicePointId({
    c,
    service_point_id,
  }: {
    c: Context
    service_point_id: number
  }) {
    return c.var.trx
      .selectFrom("ws_map_destinations as wmd")
      .select(["wmd.id"])
      .where("wmd.deleted_at", "is", null)
      .where("wmd.service_point_id", "=", service_point_id)
      .execute()
  }

  async getListMicroplanningMapDestination({
    context: c,
    params,
  }: {
    context: Context
    params: GetListMicroplanningMapDestinationParams
  }) {
    const { category } = params
    const base = this.baseQuery(c)
    let list = base
      .select(this.selectFields())
      .orderBy("wmd.created_at", "asc")
      .where("wmd.deleted_at", "is", null)
    if (category) {
      list = list.where("wmd.category", "=", category)
    }

    const result = await list.execute()
    return result
  }

  async getDetailMicroplanningMapDestination({
    context: c,
    id,
  }: {
    context: Context
    id: number
  }) {
    return this.baseQuery(c)
      .where("wmd.id", "=", id)
      .select(this.selectFields())
      .where("wmd.deleted_at", "is", null)
      .where("wmsp.entity_id", "=", c.var?.entityId as number)
      .executeTakeFirst()
  }

  private async softDeleteDestinations({
    c,
    destinationIds,
    now,
    userId,
  }: {
    c: Context
    destinationIds: number[]
    now: Date
    userId?: number
  }) {
    if (!destinationIds.length) return

    // --- Soft delete destinations
    await c.var.trx
      .updateTable(this.tableName)
      .set({
        status: STATUS.INACTIVE,
        deleted_at: now,
        deleted_by: userId,
      })
      .where("id", "in", destinationIds)
      .execute()

    // --- Soft delete route stops
    await c.var.trx
      .updateTable("ws_map_route_stops")
      .set({
        deleted_at: now,
        deleted_by: userId,
      })
      .where("destination_id", "in", destinationIds)
      .where("deleted_at", "is", null)
      .execute()
  }

  private buildDestinationPayload({
    destination,
    servicePoint,
    subTypes,
    userId,
    now,
  }: {
    destination: SubmitMicroplanningMapDestinationItemRequest
    servicePoint: { id: number; microplanning_id: number }
    subTypes?: { id: number; category_id: number }[]
    userId?: number
    now: Date
  }) {
    return {
      service_point_id: servicePoint.id,
      microplanning_id: servicePoint.microplanning_id,
      name: destination.name,
      category: subTypes?.find(
        (item) => Number(item.id) === Number(destination.sub_type)
      )?.category_id,
      sub_type: destination.sub_type,
      latitude: destination.latitude.toString(),
      longitude: destination.longitude.toString(),
      distance_meters: destination.distance_meters?.toString() ?? null,
      duration_seconds: destination.duration_seconds?.toString() ?? null,
      road_type: destination.road_type,
      notes: destination.notes,
      updated_by: userId,
      updated_at: now,
      status: STATUS.INACTIVE,
      deleted_at: null,
      deleted_by: null,
    }
  }

  async submitMicroplanningMapDestination({
    context: c,
    body,
  }: {
    context: Context
    body: SubmitMicroplanningMapDestinationRequest
  }) {
    const { destinations } = body

    const now = new Date()
    const userId = c.var.user?.id
    const servicePoint = c.var.resolvedServicePoint!
    const subTypes = c.var.resolvedMPConfig?.subTypes

    const existingItems = await this.getExistingItemsByServicePointId({
      c,
      service_point_id: servicePoint.id,
    })

    const existingIds = new Set(
      existingItems
        .map((item) => item.id)
        .filter((id): id is number => id !== null)
    )

    const toInsert: SubmitMicroplanningMapDestinationItemRequest[] = []
    const toUpdate: SubmitMicroplanningMapDestinationItemRequest[] = []

    for (const destination of destinations) {
      if (destination.id && existingIds.has(destination.id)) {
        toUpdate.push(destination)
      } else {
        toInsert.push(destination)
      }
    }

    // --- DELETE
    const incomingIds = new Set(toUpdate.map((item) => Number(item.id)))

    const idsToDelete = [...existingIds].filter(
      (id) => !incomingIds.has(Number(id))
    )
    if (idsToDelete.length > 0)
      await this.softDeleteDestinations({
        c,
        destinationIds: idsToDelete,
        now,
        userId,
      })

    // --- UPDATE
    if (toUpdate.length) {
      await Promise.all(
        toUpdate.map((destination) =>
          c.var.trx
            .updateTable(this.tableName)
            .set(
              this.buildDestinationPayload({
                destination,
                servicePoint,
                subTypes,
                userId,
                now,
              })
            )
            .where("id", "=", Number(destination.id))
            .execute()
        )
      )
    }

    // --- INSERT
    if (toInsert.length) {
      await c.var.trx
        .insertInto(this.tableName)
        .values(
          toInsert.map((destination) => ({
            ...this.buildDestinationPayload({
              destination,
              servicePoint,
              subTypes,
              userId,
              now,
            }),
            created_at: now,
            created_by: userId,
          }))
        )
        .execute()
    }
  }

  async deleteMicroplanningMapDestination({
    context: c,
    id,
  }: {
    context: Context
    id: number
  }) {
    const now = new Date()
    const userId = c.var.user?.id

    await this.softDeleteDestinations({
      c,
      destinationIds: [id],
      now,
      userId,
    })
  }

  async getMicroplanningConfigIds({
    context,
    key,
  }: {
    context: Context
    key: "destination_type" | "road_type"
  }) {
    const selectKeyMap = {
      road_type: [
        sql<string>`JSON_UNQUOTE(JSON_EXTRACT(config, CONCAT('$[', seq.n, '].id')))`.as(
          "id"
        ),
      ],
      destination_type: [
        sql<string>`JSON_UNQUOTE(JSON_EXTRACT(config, CONCAT('$[', seq.n, '].id')))`.as(
          "id"
        ),
        sql<string>`JSON_UNQUOTE(JSON_EXTRACT(config, CONCAT('$[', seq.n, '].category_id')))`.as(
          "category_id"
        ),
      ],
    }
    const query = context.var.trx
      .withRecursive("seq", (qb) =>
        qb
          .selectFrom(sql<{ n: number }>`(SELECT 0 AS n)`.as("init"))
          .select("n")
          .unionAll(
            qb
              .selectFrom("seq")
              .select(sql<number>`n + 1`.as("n"))
              .where(({ eb, selectFrom }) =>
                eb(
                  sql<number>`n + 1`,
                  "<",
                  selectFrom("ws_microplanning_config")
                    .select([sql<number>`JSON_LENGTH(config)`.as("len")])
                    .where("key", "=", key)
                    .where("deleted_at", "is", null)
                    .limit(1)
                )
              )
          )
      )
      .selectFrom("ws_microplanning_config")
      .innerJoin("seq", (join) => join.onTrue())
      .where("key", "=", key)
      .where("deleted_at", "is", null)

    return await query.select(selectKeyMap[key]).execute()
  }

  // ========================= END FOR RESPONSE ========================================
}
