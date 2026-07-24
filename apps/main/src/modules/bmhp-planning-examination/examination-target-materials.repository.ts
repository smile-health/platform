import { Context } from "hono"
import { BaseRepository } from "@/modules/base.repository.js"
import { GetExaminationTargetMaterialsQuery } from "./bmhp-examination.schema.js"

export class ExaminationTargetMaterialsRepository extends BaseRepository<"ws_bmhp_examination_target_materials"> {
  constructor() {
    super(
      "ws_bmhp_examination_target_materials",
      /* filterProgram */ false,
      /* filterActivity */ false,
      /* useSoftDelete */ true,
      /* useAudit */ true
    )
  }

  async findWithPagination(c: Context, query: GetExaminationTargetMaterialsQuery) {
    const { page, paginate, bmhp_material_id, exam_target_group_id, sort_by, sort_type } = query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "created_at"
    const sortType = sort_type || "desc"

    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_examination_target_materials as wetm")
      .innerJoin(
        "ws_bmhp_examination_target_groups as wetg",
        "wetg.id",
        "wetm.exam_target_group_id"
      )
      .innerJoin(
        "target_groups as btg",
        "btg.id",
        "wetg.target_group_id"
      )
      .innerJoin(
        "bmhp_materials as bm",
        "bm.id",
        "wetm.bmhp_material_id"
      )
      .select([
        "wetm.id",
        "wetm.exam_target_group_id",
        "wetm.bmhp_material_id",
        "btg.title as target_group_name",
        "wetm.created_at",
        "wetm.updated_at",
      ])
      .where("wetm.deleted_at", "is", null)

    if (bmhp_material_id) {
      dbQuery = dbQuery.where("wetm.bmhp_material_id", "=", bmhp_material_id)
    }

    if (exam_target_group_id) {
      dbQuery = dbQuery.where("wetm.exam_target_group_id", "=", exam_target_group_id)
    }

    const [data, totalResult] = await Promise.all([
      dbQuery
        .orderBy(`wetm.${sortBy}`, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("ws_bmhp_examination_target_materials as wetm")
        .select((eb) => [eb.fn.count("wetm.id").as("total")])
        .where("wetm.deleted_at", "is", null)
        .$if(!!bmhp_material_id, (qb) =>
          qb.where("wetm.bmhp_material_id", "=", bmhp_material_id)
        )
        .$if(!!exam_target_group_id, (qb) =>
          qb.where("wetm.exam_target_group_id", "=", exam_target_group_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return {
      list: data,
      total,
    }
  }

  async findByIdWithDetails(c: Context, id: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_examination_target_materials as wetm")
      .innerJoin(
        "ws_bmhp_examination_target_groups as wetg",
        "wetg.id",
        "wetm.exam_target_group_id"
      )
      .innerJoin(
        "target_groups as btg",
        "btg.id",
        "wetg.target_group_id"
      )
      .innerJoin(
        "bmhp_materials as bm",
        "bm.id",
        "wetm.bmhp_material_id"
      )
      .select([
        "wetm.id",
        "wetm.exam_target_group_id",
        "wetm.bmhp_material_id",
        "btg.title as target_group_name",
        "bm.name as material_name",
        "wetm.created_at",
        "wetm.updated_at",
      ])
      .where("wetm.id", "=", id)
      .where("wetm.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findByMaterialId(c: Context, materialId: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_examination_target_materials as wetm")
      .innerJoin(
        "ws_bmhp_examination_target_groups as wetg",
        "wetg.id",
        "wetm.exam_target_group_id"
      )
      .innerJoin(
        "target_groups as btg",
        "btg.id",
        "wetg.target_group_id"
      )
      .innerJoin(
        "bmhp_materials as bm",
        "bm.id",
        "wetm.bmhp_material_id"
      )
      .select([
        "wetm.id",
        "wetm.exam_target_group_id",
        "wetm.bmhp_material_id",
        "btg.title as target_group_name",
        "bm.name as material_name",
        "wetm.created_at",
        "wetm.updated_at",
      ])
      .where("wetm.bmhp_material_id", "=", materialId)
      .where("wetm.deleted_at", "is", null)
      .execute()
  }

  async findByExamTargetGroupId(c: Context, examTargetGroupId: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_examination_target_materials as wetm")
      .innerJoin(
        "ws_bmhp_examination_target_groups as wetg",
        "wetg.id",
        "wetm.exam_target_group_id"
      )
      .innerJoin(
        "target_groups as btg",
        "btg.id",
        "wetg.target_group_id"
      )
      .innerJoin(
        "bmhp_materials as bm",
        "bm.id",
        "wetm.bmhp_material_id"
      )
      .select([
        "wetm.id",
        "wetm.exam_target_group_id",
        "wetm.bmhp_material_id",
        "btg.title as target_group_name",
        "bm.name as material_name",
        "wetm.created_at",
        "wetm.updated_at",
      ])
      .where("wetm.exam_target_group_id", "=", examTargetGroupId)
      .where("wetm.deleted_at", "is", null)
      .execute()
  }

  async findByExaminationId(c: Context, examinationId: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_examination_target_materials as wetm")
      .innerJoin(
        "ws_bmhp_examination_target_groups as wetg",
        "wetg.id",
        "wetm.exam_target_group_id"
      )
      .innerJoin(
        "target_groups as btg",
        "btg.id",
        "wetg.target_group_id"
      )
      .innerJoin(
        "bmhp_materials as bm",
        "bm.id",
        "wetm.bmhp_material_id"
      )
      .select([
        "wetm.id",
        "wetm.exam_target_group_id",
        "wetm.bmhp_material_id",
        "wetg.target_group_id",
        "btg.title as target_group_name",
        "bm.name as material_name",
      ])
      .where("wetg.examination_id", "=", examinationId)
      .where("wetm.deleted_at", "is", null)
      .execute()
  }

  async deleteByExamTargetGroupId(c: Context, examTargetGroupId: number) {
    await this.delete(c, { exam_target_group_id: examTargetGroupId })
  }
}
