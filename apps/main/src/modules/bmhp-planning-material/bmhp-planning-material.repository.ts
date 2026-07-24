import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../base.repository.js"
import {
  GetBmhpPlanningMaterialsQueries,
  GetMaterialQueries,
  GetProductVariantQueries,
  FindVariantsRequest,
} from "./bmhp-planning-material.schema.js"

export class BmhpMaterialRepository extends BaseRepository<"bmhp_materials"> {
  constructor() {
    super("bmhp_materials", false) // No program filter for bmhp_materials
  }

  async findWithPagination(c: Context, query: GetBmhpPlanningMaterialsQueries) {
    const {
      page,
      paginate,
      bmhp_material_id,
      is_reagen,
      is_active,
      keyword,
      sort_by,
      sort_type,
      program_plan_id,
    } = query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "created_at"
    const sortType = sort_type || "desc"

    let dbQuery = c.var.trx
      .selectFrom("bmhp_materials")
      .leftJoin("ws_users as cu", "cu.id", "bmhp_materials.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bmhp_materials.created_by")
      .select([
        "bmhp_materials.id",
        "bmhp_materials.program_plan_id",
        "bmhp_materials.name",
        "bmhp_materials.is_reagen",
        "bmhp_materials.description",
        "bmhp_materials.is_active",
        "bmhp_materials.created_at",
        "bmhp_materials.updated_at",
        "bmhp_materials.created_by",
        "bmhp_materials.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bmhp_materials.deleted_at", "is", null)

    // Filter by bmhp_material_id if provided
    if (bmhp_material_id) {
      dbQuery = dbQuery.where("id", "=", bmhp_material_id)
    }

    // Filter by is_reagen if provided
    if (is_reagen !== undefined) {
      dbQuery = dbQuery.where("is_reagen", "=", is_reagen)
    }

    // Filter by is_active if provided
    if (is_active !== undefined) {
      dbQuery = dbQuery.where("is_active", "=", is_active)
    }

    // Keyword search if provided
    if (keyword) {
      dbQuery = dbQuery.where("name", "like", `%${keyword}%`)
    }

    // Filter by program_plan_id if provided
    if (program_plan_id) {
      dbQuery = dbQuery.where("program_plan_id", "=", program_plan_id)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .orderBy(sortBy, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("bmhp_materials")
        .select((eb) => [eb.fn.count("id").as("total")])
        .where("deleted_at", "is", null)
        .$if(!!bmhp_material_id, (qb) => qb.where("id", "=", bmhp_material_id))
        .$if(is_reagen !== undefined, (qb) =>
          qb.where("is_reagen", "=", is_reagen)
        )
        .$if(is_active !== undefined, (qb) =>
          qb.where("is_active", "=", is_active)
        )
        .$if(!!keyword, (qb) => qb.where("name", "like", `%${keyword}%`))
        .$if(!!program_plan_id, (qb) =>
          qb.where("program_plan_id", "=", program_plan_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findDetailById(c: Context, id: number) {
    return c.var.trx
      .selectFrom("bmhp_materials")
      .leftJoin("ws_users as cu", "cu.id", "bmhp_materials.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bmhp_materials.created_by")
      .select([
        "bmhp_materials.id",
        "bmhp_materials.program_plan_id",
        "bmhp_materials.name",
        "bmhp_materials.is_reagen",
        "bmhp_materials.description",
        "bmhp_materials.is_active",
        "bmhp_materials.created_at",
        "bmhp_materials.updated_at",
        "bmhp_materials.created_by",
        "bmhp_materials.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bmhp_materials.id", "=", id)
      .where("bmhp_materials.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findMaterialsWithPagination(c: Context, query: GetMaterialQueries) {
    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wm.global_id", "wbmv.material_id")
      .select([
        "wm.global_id as id",
        "wm.name",
        "wm.updated_at",
        "wm.updated_by",
      ])
      .where("wbmv.deleted_at", "is", null)
      .$if(!!query.program_plan_id, (qb) =>
        qb.where("wbmv.program_plan_id", "=", query.program_plan_id)
      )
      .$if(!!query.keyword, (qb) =>
        qb.where("wm.name", "like", `%${query.keyword}%`)
      )

    dbQuery = dbQuery.orderBy("wm.name", "asc").groupBy("wm.global_id")

    if (query.paginate && query.page) {
      const offset = (query.page - 1) * query.paginate
      dbQuery = dbQuery.limit(query.paginate).offset(offset)
    }

    let countQuery = c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wm.global_id", "wbmv.material_id")
      .select((eb) => [
        eb.fn.count<number>("wm.global_id").distinct().as("total"),
      ])
      .where("wbmv.deleted_at", "is", null)
      .$if(!!query.program_plan_id, (qb) =>
        qb.where("wbmv.program_plan_id", "=", query.program_plan_id)
      )
      .$if(!!query.keyword, (qb) =>
        qb.where("wm.name", "like", `%${query.keyword}%`)
      )

    const [data, totalResult] = await Promise.all([
      dbQuery.execute(),
      countQuery.executeTakeFirst(),
    ])

    return {
      data,
      total: Number(totalResult?.total ?? 0),
    }
  }

  async findMaterialVariantsByMaterialIds(c: Context, materialIds: number[]) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wm.global_id", "wbmv.material_id")
      .select([
        "wbmv.id",
        "wbmv.material_id",
        "wm.name",
        "wbmv.is_variant",
        "wbmv.created_at",
        "wbmv.updated_at",
        "wbmv.updated_by",
      ])
      .where("wbmv.material_id", "in", materialIds)
      .where("wbmv.deleted_at", "is", null)
      .groupBy("wbmv.material_id")
      .execute()
  }

  async findVariants(c: Context, params: FindVariantsRequest) {
    const baseQuery = c.var.trx
      .selectFrom("ws_materials as wm")
      .select([
        "wm.global_id",
        "wm.name",
        "wm.parent_global_id",
        "wm.material_level_id",
        "wm.unit_of_consumption_id as unit_id",
        "wm.unit_of_consumption as unit_name",
        "wm.created_at",
        "wm.updated_at",
        "wm.updated_by",
      ])
      .where("wm.deleted_at", "is", null)
      .$if(!!params.material_ids && params.is_variant === 1, (qb) =>
        qb.where("wm.parent_global_id", "in", params.material_ids)
      )
      .$if(!!params.material_ids && params.is_variant === 0, (qb) =>
        qb.where("wm.global_id", "in", params.material_ids)
      )
      .$if(params.material_level_id !== undefined, (qb) =>
        qb.where("wm.material_level_id", "=", params.material_level_id)
      )
      .$if(!!params.keyword, (qb) =>
        qb.where("wm.name", "like", `%${params.keyword}%`)
      )

    let query = baseQuery
    if (params.paginate && params.page) {
      const offset = (params.page - 1) * params.paginate
      query = query.limit(params.paginate).offset(offset)
    }

    query = query.orderBy("wm.name", "asc").groupBy("wm.global_id")

    const [data, totalResult] = await Promise.all([
      query.execute(),
      c.var.trx
        .selectFrom("ws_materials as wm")
        .select((eb) => [eb.fn.count("wm.global_id").as("total")])
        .where("wm.deleted_at", "is", null)
        .$if(!!params.material_ids, (qb) =>
          qb.where("wm.parent_global_id", "in", params.material_ids)
        )
        .$if(params.material_level_id !== undefined, (qb) =>
          qb.where("wm.material_level_id", "=", params.material_level_id)
        )
        .$if(!!params.keyword, (qb) =>
          qb.where("wm.name", "like", `%${params.keyword}%`)
        )
        .executeTakeFirst(),
    ])

    return {
      data,
      total: Number(totalResult?.total ?? 0),
    }
  }

  async findMaterialVariants(c: Context, params: FindVariantsRequest) {
    let query = c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin(
        "ws_bmhp_material_variant_detail as wbmvd",
        "wbmvd.material_variant_id",
        "wbmv.id"
      )
      .leftJoin("ws_materials as wm", "wm.global_id", "wbmvd.material_id")
      .leftJoin("material_units as mu", "mu.id", "wbmvd.unit_id")
      .select([
        "wm.global_id",
        "wm.name",
        "wm.parent_global_id",
        "wm.material_level_id",
        "wbmvd.test_qty as qty",
        "wbmvd.unit_id",
        "mu.name as unit_name",
        "wm.unit_of_consumption_id",
        "wm.unit_of_consumption as unit_of_consumption_name",
        "wm.updated_at",
        "wm.updated_by",
      ])
      .where("wbmv.deleted_at", "is", null)
      .where("wbmvd.deleted_at", "is", null)
      .$if(!!params.material_ids, (qb) =>
        qb.where("wbmv.material_id", "in", params.material_ids)
      )
      .$if(!!params.keyword, (qb) =>
        qb.where("wm.name", "like", `%${params.keyword}%`)
      )

    if (params.paginate && params.page) {
      const offset = (params.page - 1) * params.paginate
      query = query.limit(params.paginate).offset(offset)
    }

    query = query.orderBy("wm.name", "asc").groupBy("wm.global_id")

    const [data, totalResult] = await Promise.all([
      query.execute(),
      c.var.trx
        .selectFrom("ws_bmhp_material_variant as wbmv")
        .innerJoin(
          "ws_bmhp_material_variant_detail as wbmvd",
          "wbmvd.material_variant_id",
          "wbmv.id"
        )
        .innerJoin("ws_materials as wm", "wm.global_id", "wbmvd.material_id")
        .select((eb) => [eb.fn.count("wm.global_id").as("total")])
        .where("wbmv.deleted_at", "is", null)
        .$if(!!params.material_ids, (qb) =>
          qb.where("wbmv.material_id", "in", params.material_ids)
        )
        .$if(params.material_level_id !== undefined, (qb) =>
          qb.where("wm.material_level_id", "=", params.material_level_id)
        )
        .$if(!!params.keyword, (qb) =>
          qb.where("wm.name", "like", `%${params.keyword}%`)
        )
        .executeTakeFirst(),
    ])

    return {
      data,
      total: Number(totalResult?.total ?? 0),
    }
  }

  async findVariantsWithPagination(
    c: Context,
    query: GetProductVariantQueries
  ) {
    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wbmv.material_id", "wm.global_id")
      .leftJoin("ws_users as cu", "cu.id", "wbmv.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "wbmv.created_by")
      .select([
        "wbmv.id",
        "wbmv.material_id",
        "wm.name as material_name",
        "wbmv.created_at",
        "wbmv.updated_at",
        "wbmv.created_by",
        "wbmv.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("wbmv.deleted_at", "is", null)
      .$if(!!query.program_plan_id, (qb) =>
        qb.where("wbmv.program_plan_id", "=", query.program_plan_id)
      )

    let countQuery = c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wbmv.material_id", "wm.global_id")
      .select((eb) => [eb.fn.countAll().as("total")])
      .where("wbmv.deleted_at", "is", null)
      .$if(!!query.program_plan_id, (qb) =>
        qb.where("wbmv.program_plan_id", "=", query.program_plan_id)
      )

    if (query.keyword) {
      dbQuery = dbQuery.where("wm.name", "like", `%${query.keyword}%`)
      countQuery = countQuery.where("wm.name", "like", `%${query.keyword}%`)
    }

    if (query.paginate && query.page) {
      const offset = (query.page - 1) * query.paginate
      dbQuery = dbQuery.limit(query.paginate).offset(offset)
    }

    dbQuery = dbQuery.orderBy("wbmv.created_at", "desc").groupBy("wm.global_id")

    const [data, totalResult] = await Promise.all([
      dbQuery.execute(),
      countQuery.executeTakeFirst(),
    ])

    return {
      data,
      total: Number(totalResult?.total ?? 0),
    }
  }

  async createVariant(
    c: Context,
    data: { material_id: number; is_variant?: number; program_plan_id?: number }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_material_variant")
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return Number(result.insertId)
  }

  async createVariantDetails(
    c: Context,
    data: Array<{
      material_variant_id: number
      material_id: number
      name: string
      test_qty: number
      unit_id: number
    }>
  ) {
    const values = data.map((item) => ({
      ...item,
      created_by: c.var.userId,
      updated_by: c.var.userId,
    }))

    return await c.var.trx
      .insertInto("ws_bmhp_material_variant_detail")
      .values(values)
      .execute()
  }

  async findVariantByMaterialId(c: Context, materialId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant")
      .selectAll()
      .where("material_id", "=", materialId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findVariantByMaterialAndProgramPlan(
    c: Context,
    materialId: number,
    programPlanId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant")
      .selectAll()
      .where("material_id", "=", materialId)
      .where("program_plan_id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findVariantById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wbmv.material_id", "wm.global_id")
      .leftJoin("ws_users as cu", "cu.id", "wbmv.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "wbmv.created_by")
      .select([
        "wbmv.id",
        "wbmv.material_id",
        "wm.name as material_name",
        "wbmv.is_variant",
        "wbmv.created_at",
        "wbmv.updated_at",
        "wbmv.created_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("wbmv.id", "=", id)
      .where("wbmv.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findVariantDetailsByVariantId(
    c: Context,
    variantId: number | number[]
  ) {
    const ids = Array.isArray(variantId) ? variantId : [variantId]
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant_detail as wbmvd")
      .leftJoin("ws_materials as wm", "wm.global_id", "wbmvd.material_id")
      .leftJoin("material_units as mu", "mu.id", "wbmvd.unit_id")
      .select([
        "wbmvd.id",
        "wbmvd.material_variant_id",
        "wbmvd.material_id",
        "wbmvd.name",
        "wbmvd.test_qty",
        "wbmvd.unit_id",
        "mu.name as unit_name",
      ])
      .where("wbmvd.material_variant_id", "in", ids)
      .where("wbmvd.deleted_at", "is", null)
      .groupBy([
        "wbmvd.name",
        // "wbmvd.id",
        "wbmvd.material_variant_id",
        "wbmvd.material_id",
        // "wbmvd.test_qty",
        // "wbmvd.unit_id",
        // "mu.name",
        // "wm.unit_of_consumption_id",
        // "wm.unit_of_consumption",
      ])
      .execute()
  }

  async updateVariant(
    c: Context,
    id: number,
    data: { material_id: number; is_variant?: number; program_plan_id?: number }
  ) {
    return await c.var.trx
      .updateTable("ws_bmhp_material_variant")
      .set({
        ...data,
        updated_by: c.var.userId,
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async deleteVariant(c: Context, id: number) {
    return await c.var.trx
      .updateTable("ws_bmhp_material_variant")
      .set({
        deleted_at: new Date(),
        deleted_by: c.var.userId,
      })
      .where("id", "=", id)
      .execute()
  }

  async deleteVariantDetailsByVariantId(c: Context, variantId: number) {
    return await c.var.trx
      .updateTable("ws_bmhp_material_variant_detail")
      .set({
        deleted_at: new Date(),
        deleted_by: c.var.userId,
      })
      .where("material_variant_id", "=", variantId)
      .execute()
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const [targetMaterialResult, planningMaterialResult] = await Promise.all([
      c.var.trx
        .selectFrom("ws_bmhp_examination_target_materials")
        .select((eb) => [eb.fn.count("id").as("count")])
        .where("bmhp_material_id", "=", id)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_bmhp_planning_materials" as any)
        .select((eb: any) => [eb.fn.count("id").as("count")])
        .where("material_template_id", "=", id)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
    ])
    return (
      Number(targetMaterialResult?.count || 0) > 0 ||
      Number(planningMaterialResult?.count || 0) > 0
    )
  }

  async checkVariantUsage(c: Context, id: number): Promise<boolean> {
    const [planningResult, materialDetailResult] = await Promise.all([
      c.var.trx
        .selectFrom("ws_bmhp_planning_materials" as any)
        .select((eb: any) => [eb.fn.count("id").as("count")])
        .where("material_id", "=", id)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_bmhp_material_details")
        .select((eb) => [eb.fn.count("id").as("count")])
        .where("material_id", "=", id)
        .executeTakeFirst(),
    ])
    return (
      Number(planningResult?.count || 0) > 0 ||
      Number(materialDetailResult?.count || 0) > 0
    )
  }
}

export class BmhpMaterialDetailRepository extends BaseRepository<"ws_bmhp_material_details"> {
  constructor() {
    super("ws_bmhp_material_details", false) // No program filter
  }

  async findByBmhpMaterialId(c: Context, bmhpMaterialId: number) {
    return await this.find(c, { bmhp_material_id: bmhpMaterialId })
  }

  async findOneByBmhpMaterialIdAndMaterialId(
    c: Context,
    bmhpMaterialId: number,
    materialId: number
  ) {
    return await this.findOne(c, {
      bmhp_material_id: bmhpMaterialId,
      material_id: materialId,
    })
  }

  async deleteByBmhpMaterialId(c: Context, bmhpMaterialId: number) {
    return await this.delete(c, { bmhp_material_id: bmhpMaterialId })
  }
}
