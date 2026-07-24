/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DATASOURCE } from "@/common/constants/common.js"
import { STATUS } from "@/common/constants/general.js"
import { SCHOOL_ENTITY_TAG_ID } from "@/common/constants/target.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { Datamart } from "@/common/infrastructure/database/types/datamart.js"
import {
  CursorPaginatedResponse,
  CursorUtils,
} from "@/modules/helpers/cursor-helper.js"
import { redis } from "@/common/infrastructure/redis.js"
import { env } from "@/config/env.js"
import { Context as CustomContext } from "@smile/lib/types/context.js"
import { associate } from "@smile/lib/utils.js"
import { Context } from "hono"
import { Kysely, sql, TableExpression } from "kysely"
import { BaseRepository } from "../base.repository.js"
import {
  EntityListCursorPaginatedRequestDTO,
  GetEntitiesQueries,
} from "./entity.schema.js"

export class EntityRepository extends BaseRepository<"ws_entities"> {
  private static readonly CACHE_TTL = 10 * 60 // 10 minutes in seconds

  /**
   * Create cursor from entity data
   */
  private static createEntityCursor(entityId: number, createdAt: Date): string {
    return CursorUtils.encodeCursor({
      id: entityId,
      created_at: createdAt.toISOString(),
    })
  }

  /**
   * Parse entity cursor
   */
  private static parseEntityCursor(cursor: string): {
    id: number
    created_at: string
  } {
    const decoded = CursorUtils.decodeCursor(cursor)
    return {
      id: decoded.id as number,
      created_at: decoded.created_at as string,
    }
  }

  private generateCacheKey(prefix: string, data: any): string {
    // Optimized: Use simpler hash format to reduce computation
    const key = `${prefix}:${JSON.stringify(data)}`
    // Truncate to avoid Redis key length issues
    return `entity:${key.substring(0, 200)}`
  }

  private async invalidateEntityCache(entityId?: number): Promise<void> {
    if (!env.ENABLE_CACHE) return

    try {
      // Get all cache keys that match entity patterns
      const patterns = [
        "entity:list:*",
        "entity:detail:*",
        "entity:basic_mapped:*",
        "entity:basic:*",
        "entity:ids:*",
        "entity:satu_sehat:*",
      ]

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      }

      console.log("Entity cache invalidated successfully")
    } catch (error) {
      console.warn("Failed to invalidate entity cache:", error)
    }
  }

  constructor(filterProgram = true, filterActivity = false) {
    super("ws_entities", filterProgram, filterActivity)
  }

  readonly #getTranslation = (
    c: Context,
    key: string,
    column: string | null
  ) => {
    if (!column) return null
    const result = c.var.t(`${key}.${column}`)
    return result.includes(".label.") ? key : result
  }

  #generateQueryWhereClause(
    query,
    params: GetEntitiesQueries,
    useSlave: boolean
  ) {
    const {
      keyword,
      type_ids,
      id_satu_sehat,
      province_ids,
      regency_ids,
      sub_district_ids,
      is_vendor,
      village_ids,
      status,
    } = params

    if (keyword) {
      // Fixed: Removed duplicate where clause - use OR condition once
      query = query.where((eb) =>
        eb.or([
          eb("e.name", useSlave ? "ilike" : "like", `%${keyword}%`),
          eb("e.code", useSlave ? "ilike" : "like", `%${keyword}%`),
        ])
      )
    }

    if (type_ids && type_ids.length > 0) {
      query = query.where("e.type", "in", type_ids)
    }

    if (id_satu_sehat && id_satu_sehat.length > 0) {
      query = query.where("e.id_satu_sehat", "in", id_satu_sehat)
    }

    if (is_vendor !== undefined) {
      query = query.where("e.is_vendor", "=", is_vendor)
    }

    if (village_ids && village_ids.length > 0) {
      query = query.where("e.village_id", "in", village_ids)
    } else if (sub_district_ids && sub_district_ids.length > 0) {
      query = query.where("e.sub_district_id", "in", sub_district_ids)
    } else if (regency_ids && regency_ids.length > 0) {
      query = query.where("e.regency_id", "in", regency_ids)
    } else if (province_ids && province_ids.length > 0) {
      query = query.where("e.province_id", "in", province_ids)
    }

    if (status !== undefined) {
      query = query.where("e.status", "=", Number(status))
    }

    return query
  }

  async getListEntity(c: Context, params: GetEntitiesQueries) {
    // Generate cache key based on method name and parameters
    if (env.ENABLE_CACHE) {
      const cacheKey = this.generateCacheKey("getListEntity", params)

      // Check cache first
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.warn("Redis cache read error:", error)
      }
    }

    const {
      page,
      paginate,
      entity_tag_ids,
      sort_by,
      sort_type,
      is_asset,
      province_id,
      regency_id,
      sub_district_id,
      integration_client_id,
    } = params

    // Validate pagination to prevent memory exhaustion
    const validatedPageSize = Math.min(paginate || 20, 1000)
    const offset = ((page || 1) - 1) * validatedPageSize

    let source = env.ENTITY_LIST_SOURCE

    // force to mysql for entity with integration client
    if (integration_client_id) {
      source = DATASOURCE.MYSQL
    }

    const useSlave = [DATASOURCE.DATAMART, DATASOURCE.CLICKHOUSE].includes(
      source
    )

    let useDatamart = false
    let query: Kysely<DB> | Kysely<Datamart>

    switch (source) {
      case DATASOURCE.DATAMART:
        query = c.var.datamart
        useDatamart = true
        break
      case DATASOURCE.CLICKHOUSE:
        query = c.var.slave
        break
      default:
        query = c.var.trx
        break
    }

    if (useDatamart) {
      query = query
        .selectFrom(
          sql`raw_ws_entities as e FINAL` as unknown as TableExpression<
            Datamart,
            never
          >
        )
        .leftJoin("raw_locations as p", (eb) =>
          eb.on("p.id", "=", sql`toInt64(e.province_id)`)
        )
        .leftJoin("raw_locations as r", (eb) =>
          eb.on("r.id", "=", sql`toInt64(e.regency_id)`)
        )
        .leftJoin("raw_locations as sd", (eb) =>
          eb.on("sd.id", "=", sql`toInt64(e.sub_district_id)`)
        )
        .leftJoin("raw_locations as v", (eb) =>
          eb.on("v.id", "=", sql`toInt64(e.village_id)`)
        )
        .leftJoin("raw_entity_types as etp", "etp.id", "e.type")
        .leftJoin(
          "raw_entity_tags as et",
          "et.id",
          "e.entity_tag_id"
        ) as typeof query
    } else {
      query = query
        .selectFrom("ws_entities as e")
        .leftJoin("locations as p", "p.id", "e.province_id")
        .leftJoin("locations as r", "r.id", "e.regency_id")
        .leftJoin("locations as sd", "sd.id", "e.sub_district_id")
        .leftJoin("locations as v", "v.id", "e.village_id")
        .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
        .leftJoin("entity_types as etp", "etp.id", "e.type")
    }

    if (entity_tag_ids && entity_tag_ids.length > 0) {
      query = query.where("entity_tag_id", "in", entity_tag_ids)
    }

    if (is_asset && is_asset === 1) {
      if (province_id && !regency_id && !sub_district_id) {
        const provinces = await c.var.trx
          .selectFrom("locations")
          .select(["id"])
          .where("level", "=", 0)
          .execute()
        const provinceIds = provinces.map((item) => String(item.id))

        query = query.where("e.province_id", "in", provinceIds)
        query = query.where("e.regency_id", "is", null)
        query = query.where("e.sub_district_id", "is", null)
        query = query.where("e.type", "=", 1)
      }

      if (province_id && regency_id && !sub_district_id) {
        const regencies = await c.var.trx
          .selectFrom("locations")
          .select(["id"])
          .where("parent_id", "=", Number(province_id))
          .execute()
        const regencyIds = regencies.map((item) => String(item.id))

        query = query.where("e.province_id", "=", province_id)
        query = query.where((eb) =>
          eb.or([
            eb.and([
              eb("e.regency_id", "in", regencyIds),
              eb("e.sub_district_id", "is", null),
              eb("e.type", "=", 2),
            ]),
            eb.and([
              eb("e.regency_id", "is", null),
              eb("e.sub_district_id", "is", null),
              eb("e.type", "=", 1),
            ]),
          ])
        )
      }

      if (province_id && regency_id && sub_district_id) {
        const subDistricts = await c.var.trx
          .selectFrom("locations")
          .select(["id"])
          .where(
            "parent_id",
            "in",
            c.var.trx
              .selectFrom("locations")
              .select(["id"])
              .where("parent_id", "=", Number(province_id))
          )
          .execute()
        const subDistrictIds = subDistricts.map((item) => String(item.id))

        query = query.where("e.province_id", "=", province_id)
        query = query.where((eb) =>
          eb.or([
            eb.and([
              eb("e.sub_district_id", "in", subDistrictIds),
              eb("e.type", "=", 3),
              eb("e.is_puskesmas", "=", 1),
            ]),
            eb.and([
              eb("e.regency_id", "=", regency_id),
              eb("e.sub_district_id", "is", null),
              eb("e.type", "=", 2),
            ]),
          ])
        )
      }
    }

    query = this.#generateQueryWhereClause(query, params, useSlave)
    query = query
      .where("e.program_id", "=", params.program_id! ?? 0)
      .where("e.deleted_at", "is", null)
      .$if(integration_client_id, (qb) =>
        qb.innerJoin("integration_associations as ia", (join) =>
          join
            .onRef("ia.internal_id", "=", "e.global_id")
            .on("ia.client_id", "=", integration_client_id)
            .on("ia.type", "=", "entity")
        )
      )

    const [list, count] = await Promise.all([
      query
        .select([
          "e.id as id",
          "e.code",
          "e.id_satu_sehat",
          "e.name as name",
          "e.status",
          "et.id as entity_tag_id",
          "etp.id as entity_type_id",
          "etp.name as entity_type_name",
          "p.id as province_id",
          "p.name as province_name",
          "r.id as regency_id",
          "r.name as regency_name",
          "sd.id as sub_district_id",
          "sd.name as sub_district_name",
          "v.name as village_name",
          sql<string>`et.title`.as("tag"),
          "et.is_open_vial as is_open_vial",
          sql<string>`CONCAT_WS(', ', v.name, sd.name, r.name, p.name)`.as(
            "location"
          ),
          useDatamart ? sql`COUNT(*) OVER ()`.as("total") : sql`0`.as("total"),
          "e.village_id as village_id",
        ])
        .limit(validatedPageSize)
        .offset(offset)
        .$if(sort_by === "name", (qb) => qb.orderBy("e.name", sort_type))
        .$if(sort_by === "location", (qb) => qb.orderBy("location", sort_type))
        .$if(sort_by === "tag", (qb) => qb.orderBy("et.id", sort_type))
        .$if(sort_by === "code", (qb) => qb.orderBy("e.code", sort_type))
        .$if(!sort_by && Boolean(sort_type), (qb) =>
          qb.orderBy("e.id", sort_type)
        )
        .$if(!sort_by, (qb) => qb.orderBy("e.id", "desc"))
        .execute(),
      useDatamart
        ? Promise.resolve(null)
        : this.getCountEntitiesFromCache(query, params),
    ])

    const result = {
      list: list.map((entity) => ({
        ...entity,
        type: this.#getTranslation(
          c,
          "entity_type.label",
          entity.entity_type_name
        ),
        tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
      })),
      total: useDatamart ? Number(list[0]?.total) : count,
    }

    // Cache the result
    if (env.ENABLE_CACHE) {
      try {
        const cacheKey = this.generateCacheKey("getListEntity", params)
        await redis.setex(
          cacheKey,
          EntityRepository.CACHE_TTL,
          JSON.stringify(result)
        )
      } catch (error) {
        console.warn("Redis cache write error:", error)
      }
    }

    return result
  }

  async getListEntityCursor(
    c: Context,
    params: EntityListCursorPaginatedRequestDTO & {
      program_id?: number
    }
  ) {
    const { cursor, paginate, ...filters } = params

    let source = env.ENTITY_LIST_SOURCE

    // force to mysql for entity with integration client
    if (filters.integration_client_id) {
      source = DATASOURCE.MYSQL
    }

    const useSlave = [DATASOURCE.DATAMART, DATASOURCE.CLICKHOUSE].includes(
      source
    )

    let useDatamart = false
    let query: any

    switch (source) {
      case DATASOURCE.DATAMART:
        query = c.var.datamart
        useDatamart = true
        break
      case DATASOURCE.CLICKHOUSE:
        query = c.var.slave
        break
      default:
        query = c.var.trx
        break
    }

    if (useDatamart) {
      query = query
        .selectFrom(
          sql`raw_ws_entities as e FINAL` as unknown as TableExpression<
            Datamart,
            never
          >
        )
        .leftJoin("raw_locations as p", (eb) =>
          eb.on("p.id", "=", sql`toInt64(e.province_id)`)
        )
        .leftJoin("raw_locations as r", (eb) =>
          eb.on("r.id", "=", sql`toInt64(e.regency_id)`)
        )
        .leftJoin("raw_locations as sd", (eb) =>
          eb.on("sd.id", "=", sql`toInt64(e.sub_district_id)`)
        )
        .leftJoin("raw_locations as v", (eb) =>
          eb.on("v.id", "=", sql`toInt64(e.village_id)`)
        )
        .leftJoin("raw_entity_types as etp", "etp.id", "e.type")
        .leftJoin(
          "raw_entity_tags as et",
          "et.id",
          "e.entity_tag_id"
        ) as typeof query
    } else {
      query = query
        .selectFrom("ws_entities as e")
        .leftJoin("locations as p", "p.id", "e.province_id")
        .leftJoin("locations as r", "r.id", "e.regency_id")
        .leftJoin("locations as sd", "sd.id", "e.sub_district_id")
        .leftJoin("locations as v", "v.id", "e.village_id")
        .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
        .leftJoin("entity_types as etp", "etp.id", "e.type")
    }

    // Apply entity_tag_ids filter
    if (filters.entity_tag_ids && filters.entity_tag_ids.length > 0) {
      query = query.where("entity_tag_id", "in", filters.entity_tag_ids)
    }

    // Apply is_asset filter logic (same as getListEntity)
    if (filters.is_asset && filters.is_asset === 1) {
      if (
        filters.province_id &&
        !filters.regency_id &&
        !filters.sub_district_id
      ) {
        const provinces = await c.var.trx
          .selectFrom("locations")
          .select(["id"])
          .where("level", "=", 0)
          .execute()
        const provinceIds = provinces.map((item) => String(item.id))

        query = query.where("e.province_id", "in", provinceIds)
        query = query.where("e.regency_id", "is", null)
        query = query.where("e.sub_district_id", "is", null)
        query = query.where("e.type", "=", 1)
      }

      if (
        filters.province_id &&
        filters.regency_id &&
        !filters.sub_district_id
      ) {
        const regencies = await c.var.trx
          .selectFrom("locations")
          .select(["id"])
          .where("parent_id", "=", Number(filters.province_id))
          .execute()
        const regencyIds = regencies.map((item) => String(item.id))

        query = query.where("e.province_id", "=", filters.province_id)
        query = query.where((eb) =>
          eb.or([
            eb.and([
              eb("e.regency_id", "in", regencyIds),
              eb("e.sub_district_id", "is", null),
              eb("e.type", "=", 2),
            ]),
            eb.and([
              eb("e.regency_id", "is", null),
              eb("e.sub_district_id", "is", null),
              eb("e.type", "=", 1),
            ]),
          ])
        )
      }

      if (
        filters.province_id &&
        filters.regency_id &&
        filters.sub_district_id
      ) {
        const subDistricts = await c.var.trx
          .selectFrom("locations")
          .select(["id"])
          .where(
            "parent_id",
            "in",
            c.var.trx
              .selectFrom("locations")
              .select(["id"])
              .where("parent_id", "=", Number(filters.province_id))
          )
          .execute()
        const subDistrictIds = subDistricts.map((item) => String(item.id))

        query = query.where("e.province_id", "=", filters.province_id)
        query = query.where((eb) =>
          eb.or([
            eb.and([
              eb("e.sub_district_id", "in", subDistrictIds),
              eb("e.type", "=", 3),
              eb("e.is_puskesmas", "=", 1),
            ]),
            eb.and([
              eb("e.regency_id", "=", filters.regency_id),
              eb("e.sub_district_id", "is", null),
              eb("e.type", "=", 2),
            ]),
          ])
        )
      }
    }

    // Apply where clause filters
    const queryParams = { ...params } as any as GetEntitiesQueries
    query = this.#generateQueryWhereClause(query, queryParams, useSlave)
    query = query
      .where("e.program_id", "=", params.program_id ?? 0)
      .where("e.deleted_at", "is", null)
      .$if(!!filters.integration_client_id, (qb) =>
        qb.innerJoin("integration_associations as ia", (join) =>
          join
            .onRef("ia.internal_id", "=", "e.global_id")
            .on("ia.client_id", "=", filters.integration_client_id!)
            .on("ia.type", "=", "entity")
        )
      )

    // Apply cursor-based pagination
    if (cursor) {
      try {
        const { id, created_at } = EntityRepository.parseEntityCursor(cursor)
        query = query.where((eb) =>
          eb.or([
            eb("e.created_at", "<", created_at),
            eb.and([eb("e.created_at", "=", created_at), eb("e.id", "<", id)]),
          ])
        )
      } catch (error) {
        throw new Error("Invalid cursor format")
      }
    }

    // Select fields
    query = query.select([
      "e.id as id",
      "e.code",
      "e.id_satu_sehat",
      "e.name as name",
      "e.status",
      "e.created_at",
      "et.id as entity_tag_id",
      "etp.id as entity_type_id",
      "etp.name as entity_type_name",
      "p.id as province_id",
      "p.name as province_name",
      "r.id as regency_id",
      "r.name as regency_name",
      "sd.id as sub_district_id",
      "sd.name as sub_district_name",
      "v.name as village_name",
      sql<string>`et.title`.as("tag"),
      "et.is_open_vial as is_open_vial",
      sql<string>`CONCAT_WS(', ', v.name, sd.name, r.name, p.name)`.as(
        "location"
      ),
      "e.village_id as village_id",
    ])

    // Order by created_at DESC, id DESC for consistent pagination
    query = query
      .$if(filters.sort_by === "name", (qb) =>
        qb.orderBy("e.name", filters.sort_type)
      )
      .$if(filters.sort_by === "location", (qb) =>
        qb.orderBy("location", filters.sort_type)
      )
      .$if(filters.sort_by === "tag", (qb) =>
        qb.orderBy("et.id", filters.sort_type)
      )
      .$if(filters.sort_by === "code", (qb) =>
        qb.orderBy("e.code", filters.sort_type)
      )
      .orderBy("e.created_at", "desc")
      .orderBy("e.id", "desc")

    // Fetch one extra record to determine if there's a next page
    const data = await query.limit(paginate + 1).execute()

    const hasNextPage = data.length > paginate
    const entities = hasNextPage ? data.slice(0, paginate) : data

    let nextCursor: string | undefined
    let previousCursor: string | undefined

    if (hasNextPage && entities.length > 0) {
      const lastEntity = entities[entities.length - 1]
      nextCursor = EntityRepository.createEntityCursor(
        lastEntity.id,
        new Date(lastEntity.created_at)
      )
    }

    if (cursor && entities.length > 0) {
      const firstEntity = entities[0]
      previousCursor = EntityRepository.createEntityCursor(
        firstEntity.id,
        new Date(firstEntity.created_at)
      )
    }

    // Map entities with translations
    const mappedEntities = entities.map((entity) => ({
      ...entity,
      type: this.#getTranslation(
        c,
        "entity_type.label",
        entity.entity_type_name
      ),
      tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
    }))

    return new CursorPaginatedResponse(
      { paginate, cursor },
      mappedEntities,
      hasNextPage,
      !!cursor, // has previous page if cursor exists
      nextCursor,
      previousCursor
    )
  }

  async getCountEntitiesFromCache(query: any, params: GetEntitiesQueries) {
    const { sort_by, sort_type, page, paginate, ...queryParams } = params
    const sorted = Object.keys(queryParams)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => `${k}=${queryParams[k]}`)
      .join("&")

    const cacheKey = `ws_entities:count:${sorted}`

    try {
      const count = await redis.get(cacheKey)
      if (!count) {
        throw new Error("Cache not found")
      }

      return Number(count)
    } catch (error) {
      console.warn("Redis cache read error:", error)

      const count = await query
        .select(sql<number>`COUNT(*)`.as("total"))
        .executeTakeFirst()
      console.log(count.total)
      await redis.setex(cacheKey, EntityRepository.CACHE_TTL, count.total)
      return count.total
    }
  }

  async findByCodeOrGlobalId(c: Context, code: string, globalID: number) {
    return c.var.trx
      .selectFrom("ws_entities")
      .where((cb) =>
        cb.or([cb("global_id", "=", globalID), cb("code", "=", code)])
      )
      .selectAll()
      .executeTakeFirst()
  }

  async getEntityDetail(c: Context, id: number, programId: number) {
    if (env.ENABLE_CACHE) {
      const cacheKey = this.generateCacheKey("getEntityDetail", {
        id,
        programId,
      })

      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.warn("Redis cache read error:", error)
      }
    }

    const result = await c.var.trx
      .selectFrom("ws_entities as e")
      .leftJoin("locations as p", "p.id", "e.province_id")
      .leftJoin("locations as r", "r.id", "e.regency_id")
      .leftJoin("locations as sd", "sd.id", "e.sub_district_id")
      .leftJoin("locations as v", "v.id", "e.village_id")
      .leftJoin("entity_types as etp", "etp.id", "e.type")
      .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
      .select([
        "e.id",
        "e.code",
        "e.name",
        "e.status",
        "e.id_satu_sehat",
        "e.lat",
        "e.lng",
        "e.address",
        "e.type",
        "e.updated_at",
        "e.is_vendor",
        sql<string>`CONCAT_WS(', ', v.name, sd.name, r.name, p.name)`.as(
          "location"
        ),
        "e.entity_tag_id as entity_tag_id",
        "et.title as entity_tag_name",
        "et.is_open_vial as is_open_vial",
        "etp.name as entity_type_name",
        "e.is_relocation",
      ])
      .where("e.id", "=", id)
      .where("e.program_id", "=", programId)
      .where("e.deleted_at", "is", null)
      .executeTakeFirst()
    if (!result) return result

    const finalResult = {
      ...result,
      type: this.#getTranslation(
        c,
        "entity_type.label",
        result.entity_type_name
      ),
      entity_tag_name: this.#getTranslation(
        c,
        "entity_tag.label",
        result.entity_tag_name
      ),
    }

    if (env.ENABLE_CACHE) {
      try {
        const cacheKey = this.generateCacheKey("getEntityDetail", {
          id,
          programId,
        })
        await redis.setex(
          cacheKey,
          EntityRepository.CACHE_TTL,
          JSON.stringify(finalResult)
        )
      } catch (error) {
        console.warn("Redis cache write error:", error)
      }
    }

    return finalResult
  }

  async getEntitiesStreamData(c: Context, params: GetEntitiesQueries) {
    const { entity_tag_ids, sort_by, sort_type } = params

    // Handle big data query using stream process
    let query = c.var.trx
      .selectFrom("ws_entities as e")
      .leftJoin("locations as p", "p.id", "e.province_id")
      .leftJoin("locations as r", "r.id", "e.regency_id")
      .leftJoin("locations as sd", "sd.id", "e.sub_district_id")
      .leftJoin("locations as v", "v.id", "e.village_id")
      .leftJoin("users as u", "u.id", "e.created_by")
      .leftJoin("entity_types as etp", "etp.id", "e.type")
      .where("e.program_id", "=", params.program_id ?? 0)

    let listEntityTags = c.var.trx
      .selectFrom("entity_tags as et")
      .select(["id", "title"])

    if (entity_tag_ids) {
      listEntityTags = listEntityTags.where("id", "in", entity_tag_ids)
      query = query
        .innerJoin(listEntityTags.as("et"), "et.id", "e.entity_tag_id")
        .$if(sort_by === "tag", (qb) => qb.orderBy("et.id", sort_type))
    } else {
      query = query
        .leftJoin(listEntityTags.as("et"), "et.id", "e.entity_tag_id")
        .$if(sort_by === "tag", (qb) => qb.orderBy("et.id", sort_type))
    }

    query = this.#generateQueryWhereClause(query, params, false)

    const stream = query
      .where("e.deleted_at", "is", null)
      .select([
        "e.id",
        "e.type",
        "etp.name as entity_type_name",
        "e.name",
        "e.address",
        "e.village_id",
        "v.name as village_name",
        "e.code",
        "e.id_satu_sehat",
        "e.province_id",
        "p.name as province_name",
        "e.regency_id",
        "r.name as regency_name",
        "e.sub_district_id",
        "sd.name as sub_district_name",
        "e.status",
        sql<string>`et.title`.as("entity_tag_name"),
        "e.is_vendor",
        "e.is_relocation",
        "e.updated_at",
        sql<string>`CONCAT_WS(' ', u.firstname, u.lastname)`.as(
          "full_user_name"
        ),
        sql<string>`CONCAT_WS(', ', v.name, sd.name, r.name, p.name)`.as(
          "location"
        ),
      ])
      .$if(sort_by === "name", (qb) => qb.orderBy("e.name", sort_type))
      .$if(sort_by === "location", (qb) => qb.orderBy("location", sort_type))
      .$if(sort_by === "code", (qb) => qb.orderBy("e.code", sort_type))
      .$if(!sort_by && Boolean(sort_type), (qb) =>
        qb.orderBy("e.id", sort_type)
      )
      .$if(!sort_by, (qb) => qb.orderBy("e.id", "desc"))
      .stream()

    return stream
  }

  async getBasicDetailMapped(c: Context, entityIds: number[]) {
    if (env.ENABLE_CACHE) {
      const cacheKey = this.generateCacheKey("getBasicDetailMapped", {
        entityIds: entityIds.sort((a, b) => a - b),
      })

      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.warn("Redis cache read error:", error)
      }
    }

    const entities = await c.var.trx
      .selectFrom("ws_entities as e")
      .leftJoin("locations as prov", "prov.id", "e.province_id")
      .leftJoin("locations as city", "city.id", "e.regency_id")
      .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
      .select([
        "e.id",
        "e.name",
        "e.type",
        "e.address",
        "et.title as tag",
        "e.id_satu_sehat",
        "e.updated_at",
      ])
      .select(sql<string>`concat(city.name, ', ', prov.name)`.as("location"))
      .where("e.id", "in", entityIds)
      .execute()

    const result = associate(
      entities.map((entity) => ({
        ...entity,
        tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
      })),
      "id"
    )

    if (env.ENABLE_CACHE) {
      try {
        const cacheKey = this.generateCacheKey("getBasicDetailMapped", {
          entityIds: entityIds.sort((a, b) => a - b),
        })
        await redis.setex(
          cacheKey,
          EntityRepository.CACHE_TTL,
          JSON.stringify(result)
        )
      } catch (error) {
        console.warn("Redis cache write error:", error)
      }
    }

    return result
  }

  async getBasicDetail(c: Context, entityID: number) {
    if (env.ENABLE_CACHE) {
      const cacheKey = this.generateCacheKey("getBasicDetail", { entityID })

      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.warn("Redis cache read error:", error)
      }
    }

    const entity = await c.var.trx
      .selectFrom("ws_entities as e")
      .leftJoin("locations as prov", "prov.id", "e.province_id")
      .leftJoin("locations as city", "city.id", "e.regency_id")
      .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
      .select([
        "e.id",
        "e.global_id",
        "e.name",
        "e.type",
        "e.address",
        "et.title as tag",
        "city.name as city_name",
        "prov.name as province_name",
        "e.id_satu_sehat",
        "e.updated_at",
      ])
      .select(sql<string>`concat(city.name, ', ', prov.name)`.as("location"))
      .where("e.id", "=", entityID)
      .executeTakeFirst()

    if (!entity) return entity

    const result = {
      ...entity,
      tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
    }

    if (env.ENABLE_CACHE) {
      try {
        const cacheKey = this.generateCacheKey("getBasicDetail", { entityID })
        await redis.setex(
          cacheKey,
          EntityRepository.CACHE_TTL,
          JSON.stringify(result)
        )
      } catch (error) {
        console.warn("Redis cache write error:", error)
      }
    }

    return result
  }

  async updateStatusEntity(
    c: Context,
    status: number,
    id: number,
    programId: number
  ) {
    const result = await c.var.trx
      .updateTable("entity_workspaces")
      .set({ status })
      .where("id", "=", id)
      .where("workspace_id", "=", programId)
      .executeTakeFirst()

    // Invalidate cache after update
    this.invalidateEntityCache(id)

    return result
  }

  async checkActiveOrder(c: Context, id: number) {
    const activeOrder = await c.var.trx
      .selectFrom("ws_orders")
      .select(["customer_id", "vendor_id"])
      .where("deleted_at", "is", null)
      .where(
        "activity_id",
        "in",
        c.var.activityIds.length > 0 ? c.var.activityIds : [-1]
      )
      .where((eb) =>
        eb.or([eb("customer_id", "=", id), eb("vendor_id", "=", id)])
      )
      .executeTakeFirst()

    return activeOrder
  }

  async checkRelationCustomerVendor(c: Context, id: number) {
    const customerVendorRelation = await c.var.trx
      .selectFrom("ws_customer_vendors")
      .select(["customer_id", "vendor_id"])
      .where("deleted_at", "is", null)
      .where("program_id", "=", c.var.programId)
      .where((eb) =>
        eb.or([eb("customer_id", "=", id), eb("vendor_id", "=", id)])
      )
      .executeTakeFirst()

    return customerVendorRelation
  }

  async updateEntityProgram<
    T extends { [key: string]: string | number | Date | null },
  >(c: Context, id: number, data: T) {
    const result = await c.var.trx
      .updateTable("entity_workspaces")
      .set(data)
      .where("id", "=", id)
      .where("workspace_id", "=", c.var.programId)
      .executeTakeFirstOrThrow()

    // Invalidate cache after update
    this.invalidateEntityCache(id)

    return result
  }

  async updateStatusVendorEntity(
    c: Context,
    status: number,
    is_relocation: number,
    id: number,
    programId: number
  ) {
    const result = await c.var.trx
      .updateTable("entity_workspaces")
      .set({ is_vendor: status, is_relocation })
      .where("id", "=", id)
      .where("workspace_id", "=", programId)
      .executeTakeFirst()

    // Invalidate cache after update
    this.invalidateEntityCache(id)

    return result
  }

  async findByIds(c: Context, id: number[]) {
    if (env.ENABLE_CACHE) {
      const cacheKey = this.generateCacheKey("findByIds", {
        id: id.sort((a, b) => a - b),
        programId: c.var.programId,
      })

      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.warn("Redis cache read error:", error)
      }
    }

    const result = await c.var.trx
      .selectFrom("ws_entities")
      .select(["id", "name"])
      .where("id", "in", id)
      .where("deleted_at", "is", null)
      .where("program_id", "=", c.var.programId)
      .execute()

    if (env.ENABLE_CACHE) {
      try {
        const cacheKey = this.generateCacheKey("findByIds", {
          id: id.sort((a, b) => a - b),
          programId: c.var.programId,
        })
        await redis.setex(
          cacheKey,
          EntityRepository.CACHE_TTL,
          JSON.stringify(result)
        )
      } catch (error) {
        console.warn("Redis cache write error:", error)
      }
    }

    return result
  }

  async findByIdSatuSehat(c: Context, idSatuSehat: number) {
    if (env.ENABLE_CACHE) {
      const cacheKey = this.generateCacheKey("findByIdSatuSehat", {
        idSatuSehat,
      })

      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.warn("Redis cache read error:", error)
      }
    }

    const records = await c.var.trx
      .selectFrom("ws_entities")
      .where("id_satu_sehat", "=", idSatuSehat)
      .where("deleted_at", "is", null)
      .select(["id", "global_id", "name"])
      .executeTakeFirst()

    if (env.ENABLE_CACHE) {
      try {
        const cacheKey = this.generateCacheKey("findByIdSatuSehat", {
          idSatuSehat,
        })
        await redis.setex(
          cacheKey,
          EntityRepository.CACHE_TTL,
          JSON.stringify(records)
        )
      } catch (error) {
        console.warn("Redis cache write error:", error)
      }
    }

    return records
  }

  async getInactiveHealthcareFacilities(
    c: CustomContext<DB>,
    limit: number,
    offset: number,
    entityIds?: number[]
  ) {
    const latestTransactions = c.var.trx
      .selectFrom("ws_transactions as t")
      .innerJoin("ws_entity_activities as ea", "ea.id", "t.entity_activity_id")
      .select([
        "ea.entity_id",
        sql<string>`MAX(t.created_at)`.as("last_transaction_date"),
      ])
      .where("t.deleted_at", "is", null)
      .groupBy("ea.entity_id")
      .as("latest_tx")

    const entityActivities = c.var.trx
      .selectFrom("ws_entity_activities as ea")
      .innerJoin("ws_activities as a", "a.id", "ea.activity_id")
      .select([
        "ea.entity_id",
        sql<string>`MIN(ea.start_date)`.as("first_activity_date"),
      ])
      .where("a.status", "=", STATUS.ACTIVE)
      .where("a.deleted_at", "is", null)
      .where("ea.deleted_at", "is", null)
      .where("ea.start_date", "is not", null)
      .where(
        sql<boolean>`
        ea.end_date IS NULL OR ea.end_date > NOW()
      `
      )
      .groupBy("ea.entity_id")
      .as("entity_acts")

    return await c.var.trx
      .selectFrom("ws_entities as e")
      .innerJoin(entityActivities, "entity_acts.entity_id", "e.id")
      .leftJoin(latestTransactions, "latest_tx.entity_id", "e.id")
      .leftJoin("locations as r", "r.id", "e.regency_id")
      .select([
        "e.id as entity_id",
        "e.type as entity_type_id",
        "e.name as customer_entity_name",
        "r.name as regency_name",
        sql<number>`
          FLOOR(TIMESTAMPDIFF(SECOND,
            COALESCE(latest_tx.last_transaction_date, entity_acts.first_activity_date),
            NOW()) / 86400)
        `.as("inactive_days"),
      ])
      .where("e.is_vendor", "=", 1)
      .where("e.deleted_at", "is", null)
      .where(
        sql<boolean>`
          FLOOR(TIMESTAMPDIFF(SECOND,
            COALESCE(latest_tx.last_transaction_date, entity_acts.first_activity_date),
            NOW()) / 86400) IN (7, 14, 21, 28, 35, 42, 49, 56)
        `
      )
      .limit(limit)
      .offset(offset)
      .$if(entityIds !== undefined && entityIds.length > 0, (qb) =>
        qb.where("e.id", "in", entityIds!)
      )
      .execute()
  }

  async findTargetsByEntities(
    c: Context,
    sub_district_id: number,
    target_group_id: number,
    microplanningId: number
  ) {
    const schoolTargets = await c.var.trx
      .selectFrom("ws_microplanning_schools as s")
      .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("wmpt.reff_id", "=", "s.school_id")
          .onRef("wmpt.microplanning_id", "=", "s.microplanning_id")
          .on("wmpt.reff_type", "=", "school")
          .on("wmpt.deleted_at", "is", null)
          .on("wmpt.target_group_id", "=", target_group_id)
      )
      .select((q) => [
        "s.school_id as id",
        "s.name as village_name",
        q.fn.count("wmpt.id").as("total"),
      ])
      .where("s.microplanning_id", "=", microplanningId)
      .where("s.is_assigned", "=", 1)
      .groupBy("s.school_id")
      .execute()

    const sum = schoolTargets.reduce((acc, item) => acc + Number(item.total), 0)

    return { schoolTargets, sum }
  }

  async findById(c: Context, entity_id: number) {
    const result = await c.var.trx
      .selectFrom("entities as e")
      .leftJoin("locations as p", "p.id", "e.province_id")
      .leftJoin("locations as c", "c.id", "e.regency_id")
      .leftJoin("locations as d", "d.id", "e.sub_district_id")
      .where("e.deleted_at", "is", null)
      .where("e.id", "=", entity_id)
      .select([
        "p.id as province_id",
        "p.name as province",
        "c.id as city_id",
        "c.name as city",
        "d.id as district_id",
        "d.name as district",
        "e.id as school_id",
        "e.name as school_name",
      ])
      .executeTakeFirst()
    return result
  }
}
