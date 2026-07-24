import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import { GetMonitoringQuery } from "./bmhp-approval-monitoring.schema.js"

export type PuskesmasRow = {
  puskesmas_entity_id: number
  puskesmas_name: string
  sub_district_name: string | null
  examination_id: number | null // null = tidak punya ws_bmhp_planning
  has_target_group: number // > 0 = punya target group, 0 = tidak punya
  tg_verif_1_or_2: number // count target groups with verification_status IN (1, 2)
  tg_verif_0: number // count target groups with verification_status = 0
  tg_test_zero: number // count target groups with test_count = 0
  tg_complete: number // count target groups with test_count != 0 AND sample_count != 0
}

export class BmhpApprovalMonitoringRepository extends BaseRepository<"ws_bmhp_planning"> {
  constructor() {
    super("ws_bmhp_planning", false, false, true, true)
  }

  async findActiveExaminations(
    c: Context,
    params: {
      examination_id?: number
      examination_ids?: string
      program_plan_id?: number
    }
  ) {
    let query = c.var.trx
      .selectFrom("bmhp_examinations as be")
      .select(["be.id", "be.name"])
      .where("be.is_active", "=", 1)
      .where("be.deleted_at", "is", null)

    if (params.examination_ids) {
      const ids = params.examination_ids
        .split(",")
        .map(Number)
        .filter((id) => !isNaN(id))
      if (ids.length > 0) {
        query = query.where("be.id", "in", ids)
      }
    } else if (params.examination_id) {
      query = query.where("be.id", "=", params.examination_id)
    }

    if (params.program_plan_id) {
      query = query.where("be.program_plan_id", "=", params.program_plan_id)
    }

    return query.orderBy("be.updated_at", "desc").execute()
  }

  async findRows(
    c: Context,
    params: GetMonitoringQuery
  ): Promise<{ rows: PuskesmasRow[]; examinations: { id: number; name: string }[] }> {
    const {
      keyword,
      examination_id,
      examination_ids,
      program_plan_id,
      entity_id,
      entity_ids,
      regency_id,
    } = params

    const examinations = await this.findActiveExaminations(c, {
      examination_id,
      examination_ids,
      program_plan_id,
    })

    const programPlan = await (c.var.trx as any)
      .selectFrom("ws_program_plans")
      .select(["id"])
      .where("id", "=", program_plan_id)
      .where("program_id", "=", c.var.programId)
      .where("approach_id", "=", 4)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (!programPlan) {
      return { rows: [], examinations }
    }

    const userRegencyId = (c.var as any).userEntity?.regency_id

    let RegencyIdKako: string | undefined = undefined
    if (regency_id) {
      const regencyEntity = await (c.var.trx as any)
        .selectFrom("entities")
        .select("regency_id")
        .where("id", "=", regency_id)
        .where("id_satu_sehat", "is not", null)
        .executeTakeFirst()
      RegencyIdKako = regencyEntity?.regency_id
    }

    let query = (c.var.trx as any)
      .selectFrom("entities as e")
      .leftJoin("locations as l", "l.id", "e.sub_district_id")
      .leftJoin("ws_bmhp_planning as wp", (join: any) => {
        let j = join
          .onRef("wp.entity_id", "=", "e.id")
          .on("wp.approval_period_id", "in", (eb: any) => eb.selectFrom("ws_bmhp_approval_periods").select("id").where("program_plan_id", "=", program_plan_id))
          .on("wp.deleted_at", "is", null)

        if (examination_ids) {
          const ids = examination_ids
            .split(",")
            .map(Number)
            .filter((id) => !isNaN(id))
          if (ids.length > 0) {
            j = j.on("wp.examination_id", "in", ids as any)
          }
        } else if (examination_id) {
          j = j.on("wp.examination_id", "=", (eb: any) =>
            eb.val(examination_id)
          )
        }
        return j
      })
      .leftJoin("bmhp_examinations as be", (join: any) =>
        join
          .onRef("be.id", "=", "wp.examination_id")
          .on("be.deleted_at", "is", null)
      )
      .select([
        sql<number>`e.id`.as("puskesmas_entity_id"),
        sql<string>`e.name`.as("puskesmas_name"),
        sql<string | null>`l.name`.as("sub_district_name"),
        "wp.examination_id",
        sql<number>`COALESCE((
          SELECT COUNT(*) FROM ws_bmhp_planning_target_groups wptg
          WHERE wp.id IS NOT NULL AND wptg.planning_id = wp.id AND wptg.deleted_at IS NULL
        ), 0)`.as("has_target_group"),
        sql<number>`COALESCE((
          SELECT COUNT(*) FROM ws_bmhp_planning_target_groups wptg
          WHERE wp.id IS NOT NULL AND wptg.planning_id = wp.id AND wptg.verification_status IN (1, 2) AND wptg.deleted_at IS NULL
        ), 0)`.as("tg_verif_1_or_2"),
        sql<number>`COALESCE((
          SELECT COUNT(*) FROM ws_bmhp_planning_target_groups wptg
          WHERE wp.id IS NOT NULL AND wptg.planning_id = wp.id AND wptg.verification_status = 0 AND wptg.deleted_at IS NULL
        ), 0)`.as("tg_verif_0"),
        sql<number>`COALESCE((
          SELECT COUNT(*) FROM ws_bmhp_planning_target_groups wptg
          WHERE wp.id IS NOT NULL AND wptg.planning_id = wp.id AND wptg.test_count = 0 AND wptg.deleted_at IS NULL
        ), 0)`.as("tg_test_zero"),
        sql<number>`COALESCE((
          SELECT COUNT(*) FROM ws_bmhp_planning_target_groups wptg
          WHERE wp.id IS NOT NULL AND wptg.planning_id = wp.id AND wptg.test_count != 0 AND wptg.sample_count != 0 AND wptg.deleted_at IS NULL
        ), 0)`.as("tg_complete"),
      ])
      .where("e.entity_tag_id", "=", 9)

    if (entity_ids) {
      const ids = entity_ids
        .split(",")
        .map(Number)
        .filter((id) => !isNaN(id))
      if (ids.length > 0) {
        query = query.where("e.id", "in", ids)
      }
    } else if (entity_id) {
      query = query.where("e.id", "=", entity_id)
    } else if (regency_id) {
      query = query.where("e.regency_id", "=", String(RegencyIdKako))
    } else if (userRegencyId) {
      query = query.where("e.regency_id", "=", String(userRegencyId))
    }

    let finalQuery = query
    .where("e.id_satu_sehat", "is not", null)
    .where("e.deleted_at", "is", null)

    if (keyword) {
      finalQuery = finalQuery.where("e.name", "like", `%${keyword}%`)
    }

    const rows: PuskesmasRow[] = await finalQuery
      .orderBy("e.name", "asc")
      .execute()

    return { rows, examinations }
  }
}
