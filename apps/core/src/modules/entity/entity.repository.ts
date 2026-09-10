import { DB } from "@/common/infrastructure/database/types/db.js"
import { originalRedis as redis } from "@/common/infrastructure/redis.js"
import { env } from "@/config/env.js"
import {
  EntityDtos,
  GetEntitiesQueries,
  TEntityDto,
} from "@/modules/entity/entity.schema.js"
import { Context as ContextDB } from "@smile-health/lib/types/context.js"
import { associate, collect } from "@smile-health/lib/utils.js"
import { Context } from "hono"
import { Expression, sql, SqlBool } from "kysely"
import { BaseRepository } from "../base.repository"
import { db } from "@/common/infrastructure/database/index.js"

export class EntityRepository extends BaseRepository<"entities"> {
  constructor() {
    super("entities")
  }

  // entities.location_id points at the deepest locations row for an entity.
  // locations.path is a materialized root-to-self ancestor path
  // (e.g. "1#23#2345"), so ancestor ids/names are derived from it instead of
  // the old flat province_id/regency_id/sub_district_id/village_id columns.
  #joinLocationHierarchy(qb: any, entityAlias = "e") {
    return qb
      .leftJoin("locations as loc", "loc.id", `${entityAlias}.location_id`)
      .leftJoin("locations as p", (join) =>
        join.on(sql`p.id = SUBSTRING_INDEX(loc.path, '#', 1)`)
      )
      .leftJoin("locations as r", (join) =>
        join.on(
          sql`r.id = CASE WHEN loc.level >= 1 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 2), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("locations as sd", (join) =>
        join.on(
          sql`sd.id = CASE WHEN loc.level >= 2 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 3), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("locations as v", (join) =>
        join.on(
          sql`v.id = CASE WHEN loc.level >= 3 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 4), '#', -1) ELSE NULL END`
        )
      )
  }

  // Derives entities.location_id (the deepest location) from whichever of
  // the legacy flat ids the caller (API request / excel import) still
  // provides. Accepts string | number | null | undefined | "".
  #deriveLocationId(fields: {
    province_id?: string | number | null
    regency_id?: string | number | null
    sub_district_id?: string | number | null
    village_id?: string | number | null
  }): number | null {
    const { village_id, sub_district_id, regency_id, province_id } = fields
    const deepest = [village_id, sub_district_id, regency_id, province_id]
      .map((v) => (v === "" || v === null || v === undefined ? null : v))
      .find((v) => v !== null)

    return deepest != null && !isNaN(Number(deepest)) ? Number(deepest) : null
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

  async getActiveEntities(c: Context) {
    const rows = await c.var.trx
      .selectFrom("entities")
      .select(["id", "name"])
      .where("deleted_at", "is", null)
      .where("type", "=", 2)
      .where("status", "=", 1)
      .orderBy("id")
      .execute()

    return rows.map((r) => ({ id: Number(r.id), name: String(r.name) }))
  }

  private async invalidateEntityCache(entityId?: number): Promise<void> {
    if (!env.ENABLE_CACHE) return

    try {
      // Get all cache keys that match entity patterns
      const patterns = ["entity:*", "notification:*"]

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

  #generateQueryWhereClause(c: Context, query, params: GetEntitiesQueries) {
    const {
      keyword,
      id_satu_sehat,
      type_ids,
      entity_tag_ids,
      program_ids,
      province_ids,
      regency_ids,
      sub_district_ids,
      village_ids,
      is_vendor,
    } = params

    if (keyword) {
      query = query.where((eb) =>
        eb.or([
          eb("e.name", "like", `%${keyword}%`),
          eb("e.code", "like", `%${keyword}%`),
        ])
      )
    }

    if (type_ids) {
      query = query.where("e.type", "in", type_ids)
    }

    if (id_satu_sehat) {
      query = query.where((eb) => {
        const conditions = id_satu_sehat.map((code) =>
          eb("e.id_satu_sehat", "like", `%${code}%`)
        )
        return eb.or(conditions)
      })
    }

    if (entity_tag_ids) {
      query = query.where("entity_tag_id", "in", entity_tag_ids)
    }

    // Requires the caller to have joined the locations hierarchy
    // (see #joinLocationHierarchy) so that p/r/sd/v aliases exist.
    if (village_ids) {
      query = query.where("v.id", "in", village_ids)
    }
    if (sub_district_ids) {
      query = query.where("sd.id", "in", sub_district_ids)
    }
    if (regency_ids) {
      query = query.where("r.id", "in", regency_ids)
    }
    if (province_ids) {
      query = query.where("p.id", "in", province_ids)
    }
    if (is_vendor !== undefined) {
      query = query.where("e.is_vendor", "=", is_vendor)
    }

    if (program_ids?.length > 0) {
      query = query.where(
        "e.id",
        "in",
        c.var.trx
          .selectFrom("entity_workspaces")
          .select("entity_id")
          .where("workspace_id", "in", program_ids)
      )
    }

    return query
  }

  async getListEntity(c: Context, params: GetEntitiesQueries) {
    const { page, paginate, sort_by, sort_type } = params
    const offset = (page - 1) * paginate
    const { client, trx } = c.var
    let query = trx
      .selectFrom("entities as e")
      .select([
        sql`a.metadata`.as("external_properties"),
        "a.client_id as integration_client_id",
      ])
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .leftJoin("entity_tags as e_tags", (join) =>
        join
          .onRef("e_tags.id", "=", "e.entity_tag_id")
          .on("e_tags.deleted_at", "is", null)
      )
      .leftJoin("entity_types as e_types", (join) =>
        join
          .onRef("e_types.id", "=", "e.type")
          .on("e_types.deleted_at", "is", null)
      )
      .$if(!!client, (qb) => qb.where("a.client_id", "=", client!.getId()))
      .where("e.deleted_at", "is", null)

    query = this.#joinLocationHierarchy(query)

    let countQuery = trx
      .selectFrom("entities as e")
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .$if(!!client, (qb) => qb.where("a.client_id", "=", client!.getId()))
      .where("e.deleted_at", "is", null)

    countQuery = this.#joinLocationHierarchy(countQuery)

    query = this.#generateQueryWhereClause(c, query, params)
    countQuery = this.#generateQueryWhereClause(c, countQuery, params)

    const [list, totalList] = await Promise.all([
      query
        .select([
          "e.id",
          "e.name",
          "e.code",
          "e.type",
          "e.status",
          "e.entity_tag_id",
          "e.location_id",
          "e.id_satu_sehat",
          "e.is_puskesmas",
          "e.is_vendor",
          "e_tags.id as tag_id",
          "e_tags.title as tag",
          "e_types.id as type_id",
          "e_types.name as type_name",
          sql<string>`CONCAT_WS(', ', v.name, sd.name, r.name, p.name)`.as(
            "location"
          ),
          "p.id as province_id",
          "r.id as regency_id",
          "sd.id as sub_district_id",
          "v.id as village_id",
          "p.name as province_name",
          "r.name as regency_name",
          "sd.name as sub_district_name",
          "v.name as village_name",
          "p.level as province_level",
          "r.level as regency_level",
          "sd.level as sub_district_level",
          "v.level as village_level",
        ]) // Do NOT select e.external_properties here
        .$if(!!sort_by, (qb) => {
          // Only allow sorting by these columns
          const allowedSortColumns = [
            "name",
            "location",
            "tag",
            "code",
            "id_satu_sehat",
          ]
          if (
            typeof sort_by === "string" &&
            allowedSortColumns.includes(sort_by)
          ) {
            return qb.orderBy(`e.${sort_by}`, sort_type ?? "asc")
          }
          return qb
        })
        .limit(paginate)
        .offset(offset)
        .execute(),
      countQuery.select([sql`count(*)`.as("total")]).executeTakeFirst(),
    ])

    return {
      list: list.map((entity) => ({
        ...entity,
        tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
        type_name: this.#getTranslation(
          c,
          "entity_type.label",
          entity.type_name
        ),
      })),
      total: Number(totalList?.total) || 0,
    }
  }

  async exists(
    c: Context,
    id: number,
    entityType?: number
  ): Promise<number | null> {
    const row = await c.var.trx
      .selectFrom("entities")
      .select(["id"])
      .where("deleted_at", "is", null)
      .where("status", "=", 1)
      .$if(entityType != null, (qb) => qb.where("type", "=", entityType!))
      .where("id", "=", id)
      .executeTakeFirst()

    return row?.id ?? null
  }

  async findById(c: Context, entityID: number, withDetails = true) {
    const { client, trx } = c.var

    let entity = await trx
      .selectFrom("entities as e")
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .$if(!!client, (qb) => qb.where("a.client_id", "=", client!.getId()))
      .select(["a.metadata", "a.client_id as integration_client_id"])
      .where("e.id", "=", entityID)
      .selectAll("e")
      .executeTakeFirst()

    if (!entity && client) {
      entity = await trx
        .selectFrom("entities as e")
        .leftJoin("integration_associations as a", (join) =>
          join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
        )
        .select(["a.metadata", "a.client_id as integration_client_id"])
        .where("e.id", "=", entityID)
        .selectAll("e")
        .executeTakeFirst()
    }

    if (!withDetails) {
      return entity
    }

    // entity.location_id points at the deepest location; locations.path
    // (materialized ancestor path, ids joined by '#') gives us the rest of
    // the hierarchy (province/regency/sub_district/village) in one lookup.
    const deepestLocation = entity.location_id
      ? await trx
          .selectFrom("locations")
          .select("path")
          .where("id", "=", entity.location_id)
          .executeTakeFirst()
      : undefined

    const locationIds = (deepestLocation?.path ?? String(entity.location_id))
      .split("#")
      .map(Number)
      .filter((id) => !isNaN(id))

    const [tag, locations, type] = await Promise.all([
      trx
        .selectFrom("entity_tags")
        .select(["entity_tags.id", "entity_tags.title"])
        .where("id", "=", entity.entity_tag_id)
        .executeTakeFirst(),
      trx
        .selectFrom("locations")
        .select(["locations.id", "locations.name", "locations.level"])
        .orderBy("locations.level")
        .where(
          "id",
          "in",
          locationIds.filter((id) => !isNaN(id))
        )
        .execute(),
      trx
        .selectFrom("entity_types")
        .select(["id", "name"])
        .where("id", "=", entity.type)
        .execute(),
    ])

    const { metadata, ...restEntity } = entity

    return {
      ...restEntity,
      external_properties: metadata ?? entity.external_properties,
      entity_tag: tag
        ? {
            ...tag,
            title: this.#getTranslation(c, "entity_tag.label", tag.title),
          }
        : tag,
      entity_type: type.map((t) => ({
        ...t,
        name: this.#getTranslation(c, "entity_type.label", t.name),
      })),
      locations,
    }
  }

  async findByIds(c: Context, entityIDs: number[]): Promise<TEntityDto[]> {
    const trx = c.var.trx
    const entity = await trx
      .selectFrom("entities")
      .where("id", "in", entityIDs)
      .selectAll()
      .execute()

    return EntityDtos.parse(entity)
  }

  async findByIdsMapped(c: Context, entityIDs: number[]) {
    const entities = await this.findByIds(c, entityIDs)
    return associate(entities, "id")
  }

  async findByCode(c: Context, code: string) {
    return await c.var.trx
      .selectFrom("entities")
      .where("code", "=", code)
      .selectAll()
      .executeTakeFirst()
  }

  async findByCodes(c: Context, codes: string[]) {
    return await c.var.trx
      .selectFrom("entities")
      .where("code", "in", codes)
      .selectAll()
      .execute()
  }

  async findByIdSatuSehat(c: Context, idSatuSehat: number[]) {
    if (idSatuSehat.length === 0) return []
    return await c.var.trx
      .selectFrom("entities")
      .where("id_satu_sehat", "in", idSatuSehat)
      .selectAll()
      .execute()
  }

  async findByCodeAndExceptId(c: Context, code: string, entityID: number) {
    return await c.var.trx
      .selectFrom("entities")
      .where("code", "=", code)
      .where("id", "<>", entityID)
      .selectAll()
      .executeTakeFirst()
  }

  async findBasicById(c: Context, entityID: number) {
    const { client, trx } = c.var

    const entity = await trx
      .selectFrom("entities as e")
      .leftJoin("locations as loc", "loc.id", "e.location_id")
      .leftJoin("locations as prov", (join) =>
        join.on(sql`prov.id = SUBSTRING_INDEX(loc.path, '#', 1)`)
      )
      .leftJoin("locations as city", (join) =>
        join.on(
          sql`city.id = CASE WHEN loc.level >= 1 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 2), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("locations as sub_district", (join) =>
        join.on(
          sql`sub_district.id = CASE WHEN loc.level >= 2 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 3), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .leftJoin("locations as village", (join) =>
        join.on(
          sql`village.id = CASE WHEN loc.level >= 3 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 4), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("entity_types as ets", "ets.id", "e.type")
      .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
      .$if(!client, (qb) => qb.select(["e.external_properties"]))
      .select([
        "e.id",
        "e.name",
        "e.type",
        "e.address",
        sql<number>`CAST(e.lat AS DOUBLE)`.as("latitude"),
        sql<number>`CAST(e.lng AS DOUBLE)`.as("longitude"),
        "et.title as tag",
        "prov.id as province_id",
        "city.id as regency_id",
        "sub_district.id as sub_district_id",
        "village.id as village_id",
        "e.integration_type",
        sql<string>`if(ets.id IS NULL, NULL, JSON_OBJECT(
          'id', ets.id,
          'name', ets.name,
          'integration_type', ets.integration_type,
          'external_properties', ets.external_properties
        ))`.as("entity_type"),
        "a.metadata as external_properties",
        "a.client_id as integration_client_id",
        "prov.name as province_name",
        "city.name as regency_name",
      ])
      .select(
        sql<string>`CONCAT_WS(', ', village.name, sub_district.name, city.name, prov.name)`.as(
          "location"
        )
      )
      .where("e.id", "=", entityID)
      .$if(!!client, (qb) => qb.where("a.client_id", "=", client!.getId()))
      .executeTakeFirst()

    if (!entity) return entity
    return {
      ...entity,
      tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
    }
  }

  async findBasicAllByIds(c: Context, entityIDs: number[]) {
    const entities = await c.var.trx
      .selectFrom("entities as e")
      .leftJoin("locations as loc", "loc.id", "e.location_id")
      .leftJoin("locations as prov", (join) =>
        join.on(sql`prov.id = SUBSTRING_INDEX(loc.path, '#', 1)`)
      )
      .leftJoin("locations as city", (join) =>
        join.on(
          sql`city.id = CASE WHEN loc.level >= 1 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 2), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("entity_tags as et", "et.id", "e.entity_tag_id")
      .select(["e.id", "e.name", "e.type", "e.address", "et.title as tag"])
      .select(sql<string>`concat(city.name, ', ', prov.name)`.as("location"))
      .where("e.id", "in", entityIDs)
      .execute()

    return associate(
      entities.map((entity) => ({
        ...entity,
        tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
      })),
      "id"
    )
  }

  async findAllSearchableAndStreamable(
    c: ContextDB<DB>,
    params: GetEntitiesQueries
  ) {
    return c.var.trx
      .selectFrom("entities as e")
      .leftJoin("locations as loc", "loc.id", "e.location_id")
      .leftJoin("locations as prov", (join) =>
        join.on(sql`prov.id = SUBSTRING_INDEX(loc.path, '#', 1)`)
      )
      .leftJoin("locations as reg", (join) =>
        join.on(
          sql`reg.id = CASE WHEN loc.level >= 1 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 2), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("locations as sub", (join) =>
        join.on(
          sql`sub.id = CASE WHEN loc.level >= 2 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 3), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("locations as vil", (join) =>
        join.on(
          sql`vil.id = CASE WHEN loc.level >= 3 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(loc.path, '#', 4), '#', -1) ELSE NULL END`
        )
      )
      .leftJoin("entity_types as et", "et.id", "e.type")
      .leftJoin("entity_tags as tag", "tag.id", "e.entity_tag_id")
      .leftJoin("users as u", "u.id", "e.created_by")
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .where("e.deleted_at", "is", null)
      .where((query) => {
        const filters: Expression<SqlBool>[] = []
        if (params.keyword) {
          filters.push(query("e.name", "like", `%${params.keyword}%`))
        }
        if (params.province_ids) {
          filters.push(query("prov.id", "in", params.province_ids))
        }
        if (params.regency_ids) {
          filters.push(query("reg.id", "in", params.regency_ids))
        }
        if (params.sub_district_ids) {
          filters.push(query("sub.id", "in", params.sub_district_ids))
        }
        if (params.village_ids) {
          filters.push(query("vil.id", "in", params.village_ids))
        }
        if (params.entity_tag_ids) {
          const entityTagIds = params.entity_tag_ids
            .map(Number)
            .filter((id) => !isNaN(id))
          filters.push(query("e.entity_tag_id", "in", entityTagIds))
        }
        if (params.type_ids) {
          const typeIds = params.type_ids.map(Number).filter((id) => !isNaN(id))
          filters.push(query("e.type", "in", typeIds))
        }
        return query.and(filters)
      })
      .$if(params.program_ids?.length > 0, (qb) =>
        qb.where(
          "e.id",
          "in",
          c.var.trx
            .selectFrom("entity_workspaces")
            .select("entity_id")
            .where("workspace_id", "in", params.program_ids)
        )
      )
      .$if(!!params.integration_client_id, (qb) =>
        qb.where("a.client_id", "=", params.integration_client_id!)
      )
      .select([
        "e.id",
        "a.client_id as integration_client_id",
        "e.type",
        "et.name as type_name",
        "e.name",
        "e.address",
        "e.location_id",
        "vil.id as village_id",
        "vil.name as village_name",
        "e.code",
        "prov.id as province_id",
        "prov.name as province_name",
        "reg.id as regency_id",
        "reg.name as regency_name",
        "sub.id as sub_district_id",
        "sub.name as sub_district_name",
        "e.id_satu_sehat",
        "e.status",
        "tag.title as entity_tag_name",
        "u.username as created_by_name",
        "e.updated_at",
        sql<string>`DATE_FORMAT(e.updated_at, '%d %M %Y')`.as("updated_at"),
      ])
      .stream()
  }

  async save(c: Context, data: TEntityDto): Promise<number> {
    const {
      province_id,
      regency_id,
      sub_district_id,
      village_id,
      ...rest
    } = data as TEntityDto & {
      province_id?: string | number | null
      regency_id?: string | number | null
      sub_district_id?: string | number | null
      village_id?: string | number | null
    }

    const entity = await c.var.trx
      .insertInto("entities")
      .values({
        ...rest,
        location_id: this.#deriveLocationId({
          province_id,
          regency_id,
          sub_district_id,
          village_id,
        }),
      })
      .executeTakeFirst()

    // Invalidate cache after creating new entity
    this.invalidateEntityCache()

    return Number(entity.insertId)
  }

  async update(c: Context, data: TEntityDto, entityID: number) {
    const {
      province_id,
      regency_id,
      sub_district_id,
      village_id,
      ...rest
    } = data as TEntityDto & {
      province_id?: string | number | null
      regency_id?: string | number | null
      sub_district_id?: string | number | null
      village_id?: string | number | null
    }

    // Only touch location_id if the caller actually supplied one of the
    // legacy flat location fields - a partial update that doesn't mention
    // location must not null it out.
    const touchesLocation =
      "province_id" in data ||
      "regency_id" in data ||
      "sub_district_id" in data ||
      "village_id" in data

    await c.var.trx
      .updateTable("entities")
      .set({
        ...rest,
        ...(touchesLocation
          ? {
              location_id: this.#deriveLocationId({
                province_id,
                regency_id,
                sub_district_id,
                village_id,
              }),
            }
          : {}),
      })
      .where("id", "=", entityID)
      .executeTakeFirst()

    // Invalidate cache after update
    this.invalidateEntityCache(entityID)
  }

  async getIdAndNameStream(c: Context) {
    return c.var.trx
      .selectFrom("entities as e")
      .where("e.deleted_at", "is", null)
      .select(["e.id", "e.name"])
      .stream()
  }

  async findInWorkspace(c: Context, id: number) {
    const records = await c.var.trx
      .selectFrom("entity_workspaces")
      .innerJoin("entities", "entities.id", "entity_workspaces.entity_id")
      .where("entity_id", "=", id)
      .selectAll("entities")
      .select([
        "entity_workspaces.id as ws_id",
        "entity_workspaces.workspace_id as program_id",
      ])
      .execute()

    return records
  }

  async findInCustomerVendor(c: Context, id: number) {
    const rows = await c.var.trx
      .selectFrom("entity_workspaces")
      .select("id")
      .where("entity_id", "=", id)
      .execute()
    if (rows.length === 0) {
      return false
    }

    const entityIds = collect(rows, "id")

    const exist = await c.var.trx
      .selectFrom("ws_customer_vendors")
      .where((eb) =>
        eb("customer_id", "in", entityIds).or(eb("vendor_id", "in", entityIds))
      )
      .select("id")
      .limit(1)
      .executeTakeFirst()

    return !!exist
  }

  async getListEntityIsAsset(
    c: Context,
    entityId: number,
    params: GetEntitiesQueries,
    provinceId?: number,
    regencyId?: number,
    subDistrictId?: number,
    villageId?: number
  ) {
    const { page, paginate, sort_by, sort_type } = params
    const offset = (page - 1) * paginate
    const { client, trx } = c.var

    let query = trx
      .selectFrom("entities as e")
      .select([
        sql`a.metadata`.as("external_properties"),
        "a.client_id as integration_client_id",
      ])
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .leftJoin("entity_tags as e_tags", (join) =>
        join
          .onRef("e_tags.id", "=", "e.entity_tag_id")
          .on("e_tags.deleted_at", "is", null)
      )
      .leftJoin("entity_types as e_types", (join) =>
        join
          .onRef("e_types.id", "=", "e.type")
          .on("e_types.deleted_at", "is", null)
      )
      .$if(!!client, (qb) => qb.where("a.client_id", "=", client!.getId()))
      .where("e.deleted_at", "is", null)
      .where("e.id", "!=", entityId)

    query = this.#joinLocationHierarchy(query)

    let countQuery = trx
      .selectFrom("entities as e")
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .$if(!!client, (qb) => qb.where("a.client_id", "=", client!.getId()))
      .where("e.deleted_at", "is", null)

    countQuery = this.#joinLocationHierarchy(countQuery)

    // Legacy LEVEL 1-4 branches used to compare against the 4 flat
    // province/regency/sub_district/village columns on `entities`, treating
    // an entity as belonging to a drill-down node if it matched exactly or
    // if it only had data up to a parent level ("X parent" branches).
    // With entities.location_id + locations.path (materialized ancestor
    // path, ids joined by '#'), that whole family of branches collapses to:
    // "the entity's location is the requested node itself, or one of its
    // ancestors" - i.e. loc.id appears in the target node's path.
    const targetId = villageId ?? subDistrictId ?? regencyId ?? provinceId

    if (targetId) {
      if (provinceId && regencyId && !subDistrictId && !villageId) {
        const regencyValidation = await trx
          .selectFrom("locations")
          .select("id")
          .where("id", "=", regencyId)
          .where("parent_id", "=", provinceId)
          .executeTakeFirst()

        if (!regencyValidation) {
          return { list: [], total: 0 }
        }
      }

      if (provinceId && regencyId && subDistrictId && !villageId) {
        const hierarchyValidation = await trx
          .selectFrom("locations as sd")
          .innerJoin("locations as r", "r.id", "sd.parent_id")
          .select("sd.id")
          .where("sd.id", "=", subDistrictId)
          .where("sd.parent_id", "=", regencyId)
          .where("r.parent_id", "=", provinceId)
          .executeTakeFirst()

        if (!hierarchyValidation) {
          return { list: [], total: 0 }
        }
      }

      if (provinceId && regencyId && subDistrictId && villageId) {
        const hierarchyValidation = await trx
          .selectFrom("locations as v")
          .innerJoin("locations as sd", "sd.id", "v.parent_id")
          .innerJoin("locations as r", "r.id", "sd.parent_id")
          .select("v.id")
          .where("v.id", "=", villageId)
          .where("v.parent_id", "=", subDistrictId)
          .where("sd.parent_id", "=", regencyId)
          .where("r.parent_id", "=", provinceId)
          .executeTakeFirst()

        if (!hierarchyValidation) {
          return { list: [], total: 0 }
        }
      }

      const target = await trx
        .selectFrom("locations")
        .select("path")
        .where("id", "=", targetId)
        .executeTakeFirst()

      if (!target?.path) {
        return { list: [], total: 0 }
      }

      query = query
        .where("e.country", "=", "ID")
        .where(sql<boolean>`FIND_IN_SET(loc.id, REPLACE(${target.path}, '#', ','))`)

      countQuery = countQuery
        .where("e.country", "=", "ID")
        .where(sql<boolean>`FIND_IN_SET(loc.id, REPLACE(${target.path}, '#', ','))`)
    }

    // Keyword search
    if (params.keyword) {
      query = query.where((eb) =>
        eb.or([
          eb("e.name", "like", `%${params.keyword}%`),
          eb("e.code", "like", `%${params.keyword}%`),
        ])
      )
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb("e.name", "like", `%${params.keyword}%`),
          eb("e.code", "like", `%${params.keyword}%`),
        ])
      )
    }

    const [list, totalList] = await Promise.all([
      query
        .select([
          "e.id",
          "e.name",
          "e.code",
          "e.type",
          "e.status",
          "e.entity_tag_id",
          "e.location_id",
          "e.id_satu_sehat",
          "e.is_puskesmas",
          "e.is_vendor",
          "e_tags.id as tag_id",
          "e_tags.title as tag",
          "e_types.id as type_id",
          "e_types.name as type_name",
          sql<string>`CONCAT_WS(', ', v.name, sd.name, r.name, p.name)`.as(
            "location"
          ),
          "p.id as province_id",
          "r.id as regency_id",
          "sd.id as sub_district_id",
          "v.id as village_id",
          "p.name as province_name",
          "r.name as regency_name",
          "sd.name as sub_district_name",
          "v.name as village_name",
          "p.level as province_level",
          "r.level as regency_level",
          "sd.level as sub_district_level",
          "v.level as village_level",
        ])
        .$if(!!sort_by, (qb) => {
          const allowedSortColumns = [
            "name",
            "location",
            "tag",
            "code",
            "id_satu_sehat",
          ]
          if (
            typeof sort_by === "string" &&
            allowedSortColumns.includes(sort_by)
          ) {
            return qb.orderBy(`e.${sort_by}`, sort_type ?? "asc")
          }
          return qb
        })
        .groupBy("e.id")
        .limit(paginate)
        .offset(offset)
        .execute(),
      countQuery.select([sql`count(*)`.as("total")]).executeTakeFirst(),
    ])

    return {
      list: list.map((entity) => ({
        ...entity,
        tag: this.#getTranslation(c, "entity_tag.label", entity.tag),
        type_name: this.#getTranslation(
          c,
          "entity_type.label",
          entity.type_name
        ),
      })),
      total: Number(totalList?.total) || 0,
    }
  }

  async createImportLogs(c: Context, data: any) {
    const { trx } = c.var
    const importLog = await trx
      .insertInto("import_logs")
      .values(data)
      .executeTakeFirst()

    return Number(importLog.insertId)
  }

  async updateImportLogs(c: Context, data: any, importLogID: number) {
    await db
      .updateTable("import_logs")
      .set(data)
      .where("id", "=", importLogID)
      .execute()
  }

  async getImportLogs(c: Context, importLogID: number) {
    return await c.var.trx
      .selectFrom("import_logs")
      .selectAll()
      .where("id", "=", importLogID)
      .executeTakeFirst()
  }

  async deleteImportLogs(c: Context, importLogID: number) {
    await c.var.trx
      .deleteFrom("import_logs")
      .where("id", "=", importLogID)
      .executeTakeFirst()
  }

  async getImportLogsByUserId(c: Context, userID: number) {
    return await c.var.trx
      .selectFrom("import_logs")
      .selectAll()
      .where("user_id", "=", userID)
      .where("progress", "<", 100)
      .executeTakeFirst()
  }

  async findLabByEntityId(c: Context, entityID: number) {
    const now = new Date()

    return await c.var.trx
      .selectFrom("ws_sentinel_laboratory")
      .selectAll()
      .where("entity_id", "=", entityID)
      .where("start_date", "<=", now)
      .where("end_date", ">=", now)
      .executeTakeFirst()
  }

  async findSentinelLabByEntityId(c: Context, entityID: number) {
    return await c.var.trx
      .selectFrom("ws_sentinel_laboratory")
      .selectAll()
      .where("entity_id", "=", entityID)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async upsertSentinelLab(
    c: Context,
    entityId: number,
    startDate: string,
    endDate: string
  ) {
    const existing = await this.findSentinelLabByEntityId(c, entityId)

    if (existing) {
      await c.var.trx
        .updateTable("ws_sentinel_laboratory")
        .set({
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          updated_by: c.var.accountID,
          updated_at: new Date(),
        })
        .where("id", "=", existing.id)
        .execute()
    } else {
      await c.var.trx
        .insertInto("ws_sentinel_laboratory")
        .values({
          entity_id: entityId,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          created_by: c.var.accountID,
          updated_by: c.var.accountID,
        })
        .execute()
    }
  }

  async deleteSentinelLabByEntityId(c: Context, entityId: number) {
    await c.var.trx
      .updateTable("ws_sentinel_laboratory")
      .set({
        deleted_at: new Date(),
        deleted_by: c.var.accountID,
      })
      .where("entity_id", "=", entityId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getEntitiesCountForExport(
    c: ContextDB<DB>,
    params: GetEntitiesQueries
  ): Promise<number> {
    const result = await c.var.trx
      .selectFrom("entities as e")
      .leftJoin("integration_associations as a", (join) =>
        join.onRef("a.internal_id", "=", "e.id").on("a.type", "=", "entity")
      )
      .$call((qb) => this.#joinLocationHierarchy(qb))
      .where("e.deleted_at", "is", null)
      .where((query) => {
        const filters: Expression<SqlBool>[] = []
        if (params.keyword) {
          filters.push(query("e.name", "like", `%${params.keyword}%`))
        }
        if (params.province_ids) {
          filters.push(query("p.id", "in", params.province_ids))
        }
        if (params.regency_ids) {
          filters.push(query("r.id", "in", params.regency_ids))
        }
        if (params.sub_district_ids) {
          filters.push(query("sd.id", "in", params.sub_district_ids))
        }
        if (params.village_ids) {
          filters.push(query("v.id", "in", params.village_ids))
        }
        if (params.entity_tag_ids) {
          const entityTagIds = params.entity_tag_ids
            .map(Number)
            .filter((id) => !isNaN(id))
          filters.push(query("e.entity_tag_id", "in", entityTagIds))
        }
        if (params.type_ids) {
          const typeIds = params.type_ids.map(Number).filter((id) => !isNaN(id))
          filters.push(query("e.type", "in", typeIds))
        }
        return query.and(filters)
      })
      .$if(params.program_ids?.length > 0, (qb) =>
        qb.where(
          "e.id",
          "in",
          c.var.trx
            .selectFrom("entity_workspaces")
            .select("entity_id")
            .where("workspace_id", "in", params.program_ids)
        )
      )
      .$if(!!params.integration_client_id, (qb) =>
        qb.where("a.client_id", "=", params.integration_client_id!)
      )
      .select(sql<number>`count(*)`.as("count"))
      .executeTakeFirst()

    return Number(result?.count ?? 0)
  }

  async *getEntitiesForExport(
    c: ContextDB<DB>,
    params: GetEntitiesQueries,
    batchSize: number = 1000
  ) {
    const stream = await this.findAllSearchableAndStreamable(c, params)

    let batch: any[] = []
    for await (const item of stream) {
      batch.push(item)

      if (batch.length >= batchSize) {
        yield batch
        batch = []
      }
    }

    if (batch.length > 0) {
      yield batch
    }
  }
}
