import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../base.repository.js"
import {
  GetBmhpMaterialsUnitDetailsQueries,
  GetVariantDetailsQueries,
} from "./bmhp-materials-unit-details.schema.js"

export class BmhpMaterialsUnitDetailRepository extends BaseRepository<"ws_bmhp_materials_unit_details"> {
  constructor() {
    super("ws_bmhp_materials_unit_details", false) // No program filter
  }

  async findWithPagination(
    c: Context,
    query: GetBmhpMaterialsUnitDetailsQueries
  ) {
    const {
      page,
      paginate,
      bmhp_material_details_id,
      variant_material_id,
      sort_by,
      sort_type,
    } = query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "created_at"
    const sortType = sort_type || "desc"

    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_materials_unit_details")
      .selectAll()
      .where("deleted_at", "is", null)

    if (bmhp_material_details_id) {
      dbQuery = dbQuery.where(
        "bmhp_material_details_id",
        "=",
        bmhp_material_details_id
      )
    }

    if (variant_material_id) {
      dbQuery = dbQuery.where("variant_material_id", "=", variant_material_id)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .orderBy(sortBy, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("ws_bmhp_materials_unit_details")
        .select((eb) => [eb.fn.count("id").as("total")])
        .where("deleted_at", "is", null)
        .$if(!!bmhp_material_details_id, (qb) =>
          qb.where("bmhp_material_details_id", "=", bmhp_material_details_id)
        )
        .$if(!!variant_material_id, (qb) =>
          qb.where("variant_material_id", "=", variant_material_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findByIdWithDetails(c: Context, id: number) {
    const detail = await c.var.trx
      .selectFrom("ws_bmhp_materials_unit_details")
      .leftJoin(
        "ws_materials as parent_material",
        "parent_material.id",
        "ws_bmhp_materials_unit_details.bmhp_material_details_id"
      )
      .leftJoin(
        "ws_materials as child_material",
        "child_material.id",
        "ws_bmhp_materials_unit_details.variant_material_id"
      )
      .select([
        "ws_bmhp_materials_unit_details.id",
        "ws_bmhp_materials_unit_details.bmhp_material_details_id",
        "ws_bmhp_materials_unit_details.variant_material_id",
        "ws_bmhp_materials_unit_details.qty_per_package",
        "ws_bmhp_materials_unit_details.test_qty_per_package",
        "ws_bmhp_materials_unit_details.consumption_per_test",
        "ws_bmhp_materials_unit_details.created_at",
        "ws_bmhp_materials_unit_details.updated_at",
        "ws_bmhp_materials_unit_details.deleted_at",
        "ws_bmhp_materials_unit_details.created_by",
        "ws_bmhp_materials_unit_details.updated_by",
        "ws_bmhp_materials_unit_details.deleted_by",
        "parent_material.name as parent_material_name",
        "child_material.name as child_material_name",
      ])
      .where("ws_bmhp_materials_unit_details.id", "=", id)
      .where("ws_bmhp_materials_unit_details.deleted_at", "is", null)
      .executeTakeFirst()

    return detail
  }

  async findByParentAndChildMaterialId(
    c: Context,
    parentMaterialId: number,
    childMaterialId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_bmhp_materials_unit_details")
      .selectAll()
      .where("bmhp_material_details_id", "=", parentMaterialId)
      .where("variant_material_id", "=", childMaterialId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findByParentMaterialId(c: Context, parentMaterialId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_materials_unit_details as mud")
      .innerJoin(
        "ws_bmhp_material_details as bmd",
        "bmd.id",
        "mud.variant_material_id"
      )
      .innerJoin("ws_materials as m", "m.id", "bmd.material_id")
      .select([
        "mud.id",
        "m.name as name",
        "m.unit_of_distribution as unit",
        "mud.qty_per_package",
        "mud.test_qty_per_package",
        "mud.consumption_per_test",
      ])
      .where("mud.bmhp_material_details_id", "=", parentMaterialId)
      .where("mud.deleted_at", "is", null)
      .groupBy("m.global_id")
      .execute()
  }

  async findByChildMaterialId(c: Context, childMaterialId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_materials_unit_details as mud")
      .innerJoin(
        "ws_bmhp_material_details as bmd",
        "bmd.id",
        "mud.bmhp_material_details_id"
      )
      .innerJoin("ws_materials as m", "m.id", "bmd.material_id")
      .select([
        "mud.id",
        "m.name as name",
        "m.unit_of_distribution as unit",
        "mud.qty_per_package",
        "mud.test_qty_per_package",
        "mud.consumption_per_test",
      ])
      .where("mud.variant_material_id", "=", childMaterialId)
      .where("mud.deleted_at", "is", null)
      .execute()
  }

  // Get target groups by IDs
  async getTargetGroups(c: Context, targetIds: number[]) {
    return await c.var.trx
      .selectFrom("target_groups")
      .select(["id", "title as name"])
      .where("id", "in", targetIds)
      .execute()
  }

  // Get examination target materials for a target group within a specific examination
  async getExamTargetMaterials(
    c: Context,
    examinationId: number,
    targetGroupId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups as etg")
      .innerJoin(
        "ws_bmhp_examination_target_materials as etm",
        "etm.exam_target_group_id",
        "etg.id"
      )
      .innerJoin("bmhp_materials as bm", "bm.id", "etm.bmhp_material_id")
      .innerJoin(
        "ws_bmhp_material_details as bmd",
        "bmd.bmhp_material_id",
        "bm.id"
      )
      .innerJoin("ws_materials as m", "m.global_id", "bmd.material_id")
      .select([
        "bm.id",
        "bm.name as title",
        "bm.is_reagen",
        "m.unit_of_consumption as unit",
        "m.consumption_unit_per_distribution_unit as qty",
        "m.material_subtype",
      ])
      .where("etg.examination_id", "=", examinationId)
      .where("etg.target_group_id", "=", targetGroupId)
      .where("etm.deleted_at", "is", null)
      .where("bmd.deleted_at", "is", null)
      .groupBy("bm.id")
      .execute()
  }

  async getMaterialVariants(c: Context, materialId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .select(["wbmv.id", "wbmv.is_variant"])
      .where("wbmv.material_id", "=", materialId)
      .where("wbmv.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getMaterialVariantsDetail(c: Context, materialIds: number[]) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant_detail as wbmvd")
      .select(["wbmvd.id", "wbmvd.test_qty as qty"])
      .where("wbmvd.material_id", "in", materialIds)
      .where("wbmvd.deleted_at", "is", null)
      .executeTakeFirst()
  }

  // Get unit detail by child material ID
  async getUnitDetailByChildMaterialId(c: Context, childMaterialId: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_material_details as bmd")
      .innerJoin("ws_materials as m", "m.global_id", "bmd.material_id")
      .select(["m.id", "m.name as name"])
      .where("bmd.bmhp_material_id", "=", childMaterialId)
      .where("bmd.deleted_at", "is", null)
      .execute()
  }

  async getTemplate(c: Context, targetGroupId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups as etg")
      .innerJoin(
        "ws_bmhp_examination_target_materials as etm",
        "etm.exam_target_group_id",
        "etg.id"
      )
      .innerJoin("bmhp_materials as bm", "bm.id", "etm.bmhp_material_id")
      .innerJoin(
        "ws_bmhp_material_details as bmd",
        "bmd.bmhp_material_id",
        "bm.id"
      )
      .innerJoin("ws_materials as m", "m.global_id", "bmd.material_id")
      .select(["m.id", "m.name as title"])
      .where("etg.target_group_id", "=", targetGroupId)
      .execute()
  }

  async findByBmhpMaterialId(c: Context, bmhpMaterialId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_details")
      .selectAll()
      .where("bmhp_material_id", "=", bmhpMaterialId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getTemplateMaterial(
    c: Context,
    materialIds: number[],
    programPlanId?: number
  ) {
    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wm.global_id", "wbmv.material_id")
      .select([
        "wbmv.id",
        "wbmv.material_id",
        "wm.name as title",
        "wbmv.is_variant",
        "wm.material_type",
        "wm.material_subtype",
        "wbmv.created_at",
      ])
      .where("wbmv.material_id", "in", materialIds)
      .where("wbmv.deleted_at", "is", null)

    if (programPlanId) {
      dbQuery = dbQuery.where("wbmv.program_plan_id", "=", programPlanId)
    }

    return await dbQuery.groupBy("wbmv.material_id").execute()
  }

  async findVariantById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant as wbmv")
      .innerJoin("ws_materials as wm", "wbmv.material_id", "wm.global_id")
      .select(["wbmv.id", "wbmv.material_id", "wm.name as material_name"])
      .where("wbmv.material_id", "=", id)
      .where("wbmv.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findVariantDetailsByVariantId(c: Context, variantId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_material_variant_detail as wbmvd")
      .leftJoin("material_units as mu", "mu.id", "wbmvd.unit_id")
      .select([
        "wbmvd.material_variant_id",
        "wbmvd.material_id",
        "wbmvd.name",
        "wbmvd.test_qty",
        "wbmvd.unit_id",
        "mu.name as unit_name",
      ])
      .where("wbmvd.material_variant_id", "=", variantId)
      .where("wbmvd.deleted_at", "is", null)
      .execute()
  }

  async findVariantDetailsWithPagination(
    c: Context,
    materialVariantId: number,
    query: GetVariantDetailsQueries
  ) {
    const { page, paginate, keyword } = query
    const offset = (page - 1) * paginate

    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_material_variant_detail as wbmvd")
      .leftJoin("ws_bmhp_material_variant as wbmv", "wbmv.id", "wbmvd.material_variant_id")
      .leftJoin("ws_materials as wm", "wm.global_id", "wbmv.material_id")
      .select([
        "wbmvd.id",
        "wbmvd.material_variant_id",
        "wbmvd.material_id",
        "wbmvd.name",
        sql<number>`COALESCE(wbmvd.test_qty, 1)`.as("test_qty"),
        "wm.unit_of_consumption_id as unit_id",
        "wm.unit_of_consumption as unit_name",
      ])
      .where("wbmvd.material_variant_id", "=", materialVariantId)
      .where("wbmvd.deleted_at", "is", null)

    dbQuery = dbQuery.groupBy("wbmvd.id")

    if (keyword) {
      dbQuery = dbQuery.where("wbmvd.name", "like", `%${keyword}%`)
    }

    const [data, totalResult] = await Promise.all([
      dbQuery.limit(paginate).offset(offset).execute(),
      c.var.trx
        .selectFrom("ws_bmhp_material_variant_detail as wbmvd")
        .select((eb) => [eb.fn.count("wbmvd.id").as("total")])
        .where("wbmvd.material_variant_id", "=", materialVariantId)
        .where("wbmvd.deleted_at", "is", null)
        .$if(!!keyword, (qb) => qb.where("wbmvd.name", "like", `%${keyword}%`))
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { data, total }
  }

  // Get variants from ws_materials based on parent_id and material_level_id = 3
  async findVariantsByParentMaterialId(c: Context, parentMaterialId: number) {
    return await c.var.trx
      .selectFrom("ws_materials as wm")
      .select(["wm.id", "wm.name"])
      .where("wm.parent_id", "=", parentMaterialId)
      .where("wm.material_level_id", "=", 3)
      .where("wm.deleted_at", "is", null)
      .execute()
  }
}
