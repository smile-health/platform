import { Context } from "hono"
import { sql } from "kysely"
import { GetListPlanningQuery } from "./bmhp-planning.schema.js"

export class BmhpPlanningRepository {
  /**
   * Find the kabupaten/dinkes entity (entity_tag_id = 7) for a given regency_id
   */
  async findKabupatenByRegencyId(c: Context, regencyId: string) {
    return await c.var.trx
      .selectFrom("entities")
      .select(["id", "name", "regency_id"])
      .where("regency_id", "=", regencyId)
      .where("entity_tag_id", "=", 7) // Dinkes Kabupaten
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async createPlanning(
    c: Context,
    data: {
      entity_id: number
      approval_period_id: number
      examination_id: number
      status: string
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_planning" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async updatePlanning(
    c: Context,
    id: number,
    data: {
      status?: string
    }
  ) {
    await c.var.trx
      .updateTable("ws_bmhp_planning" as any)
      .set({
        ...data,
        updated_by: c.var.userId,
        updated_at: new Date(),
        deleted_at: null,
      })
      .where("id", "=", id)
      .execute()
  }

  async createPlanningTargetGroup(
    c: Context,
    data: {
      planning_id: number
      target_group_id: number
      sample_count: number
      test_count: number
      verification_status?: number
    },
    keepRevision = false
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_planning_target_groups" as any)
      .values({
        ...data,
        verification_status: 1,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createPlanningMethod(
    c: Context,
    data: {
      planning_id: number
      method_id: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_planning_methods" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createPlanningMaterial(
    c: Context,
    data: {
      planning_target_group_id: number
      material_id: number
      material_template_id?: number
      variant_id?: number
      method_id?: number
      lab_usage?: number
      calculated_requirement?: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_planning_materials" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async findList(c: Context, entityId: number, params: GetListPlanningQuery) {
    let query: any = c.var.trx
      .selectFrom("ws_bmhp_planning as wp")
      .leftJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .leftJoin(
        "bmhp_examination_types as bet",
        "bet.id",
        "be.examination_type_id"
      )
      .leftJoin("entities as e", "e.id", "wp.entity_id")
      .select([
        "wp.id",
        "wp.entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
        sql<number>`(SELECT wpp.year FROM ws_program_plans wpp INNER JOIN ws_bmhp_approval_periods wap2 ON wap2.program_plan_id = wpp.id WHERE wap2.id = wp.approval_period_id AND wap2.deleted_at IS NULL AND wpp.deleted_at IS NULL LIMIT 1)`.as(
          "year"
        ),
        sql<number>`(SELECT wap2.program_plan_id FROM ws_bmhp_approval_periods wap2 WHERE wap2.id = wp.approval_period_id AND wap2.deleted_at IS NULL LIMIT 1)`.as(
          "program_plan_id"
        ),
        "wp.examination_id",
        "be.name as examination_name",
        "bet.name as examination_type",
        "wp.status",
        "wp.submitted_at",
        "wp.approved_at",
        "wp.created_at",
        "wp.updated_at",
        sql<number>`COALESCE((SELECT COUNT(*) FROM ws_bmhp_planning_target_groups WHERE planning_id = wp.id AND deleted_at IS NULL AND sample_count != 0 AND test_count != 0), 0)`.as(
          "target_group_count"
        ),
        sql<number>`(SELECT CASE WHEN wap2.status IN (1, 3) THEN 1 ELSE 0 END FROM ws_bmhp_approval_periods wap2 WHERE wap2.id = wp.approval_period_id AND wap2.deleted_at IS NULL LIMIT 1)`.as(
          "is_approved"
        ),
        sql<boolean>`EXISTS(
          SELECT 1
          FROM ws_bmhp_planning_target_groups wptg
          INNER JOIN ws_bmhp_planning wp2 ON wp2.id = wptg.planning_id AND wp2.deleted_at IS NULL
          INNER JOIN ws_bmhp_approval_periods wap3 ON wap3.id = wp2.approval_period_id AND wap3.deleted_at IS NULL
          WHERE wptg.planning_id = wp.id
            AND wptg.verification_status = 2
            AND wptg.deleted_at IS NULL
            AND wap3.status = 2
        )`.as("revision"),
      ])
      .where("wp.entity_id", "=", entityId)
      .where("wp.deleted_at", "is", null)
      .where((eb) =>
        eb.or([
          eb(
            "wp.id",
            "in",
            eb
              .selectFrom("ws_bmhp_planning_target_groups as wptg_filter")
              .select("wptg_filter.planning_id")
              .where("wptg_filter.verification_status", "in", [1, 2])
              .where("wptg_filter.deleted_at", "is", null)
          ),
          eb(
            "wp.id",
            "not in",
            eb
              .selectFrom("ws_bmhp_planning_target_groups as wptg_check")
              .select("wptg_check.planning_id")
              .where("wptg_check.deleted_at", "is", null)
          ),
        ])
      )

    if (params.year) {
      query = query.where("wp.approval_period_id", "in", (eb: any) =>
        eb
          .selectFrom("ws_bmhp_approval_periods as wap_y")
          .select("wap_y.id")
          .where("wap_y.deleted_at", "is", null)
          .where("wap_y.program_plan_id", "in", (eb2: any) =>
            eb2
              .selectFrom("ws_program_plans as wpp_y")
              .select("wpp_y.id")
              .where("wpp_y.year", "=", params.year)
              .where("wpp_y.deleted_at", "is", null)
          )
      )
    }

    if (params.examination_id) {
      query = query.where("wp.examination_id", "=", params.examination_id)
    }

    if (params.status) {
      query = query.where("wp.status", "=", params.status)
    }

    if (params.search) {
      query = query.where("be.name", "like", `%${params.search}%`)
    }

    query = query.where(
      sql<boolean>`EXISTS (SELECT 1 FROM ws_bmhp_planning_target_groups wptg_f WHERE wptg_f.planning_id = wp.id AND wptg_f.deleted_at IS NULL AND wptg_f.verification_status != 0)`
    )

    if (params.paginate && params.page) {
      const offset = (params.page - 1) * params.paginate
      query = query.limit(params.paginate).offset(offset)
    }

    query = query.orderBy("wp.updated_at", "desc")

    const [data, totalResult] = await Promise.all([
      query.execute(),
      query
        .clearSelect()
        .clearOrderBy()
        .clearLimit()
        .clearOffset()
        .select(c.var.trx.fn.count("wp.id").as("total"))
        .executeTakeFirst(),
    ])

    return { list: data, total: Number(totalResult?.total ?? 0) }
  }

  async findPlanningByEntityYearExamination(
    c: Context,
    entityId: number,
    year: number,
    examinationId: number
  ) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning as wp" as any)
      .select(["wp.id", "wp.status", "wp.deleted_at"])
      .where("wp.entity_id", "=", entityId)
      .where("wp.examination_id", "=", examinationId)
      .where("wp.deleted_at", "is", null)
      .where("wp.approval_period_id", "in", (eb: any) =>
        eb
          .selectFrom("ws_bmhp_approval_periods as wap")
          .select("wap.id")
          .where("wap.deleted_at", "is", null)
          .where("wap.program_plan_id", "in", (eb2: any) =>
            eb2
              .selectFrom("ws_program_plans as wpp")
              .select("wpp.id")
              .where("wpp.year", "=", year)
              .where("wpp.deleted_at", "is", null)
          )
      )
      .executeTakeFirst()
  }

  async findPlanningByEntityYearExaminationAny(
    c: Context,
    entityId: number,
    year: number,
    examinationId: number
  ) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning as wp" as any)
      .select(["wp.id", "wp.status", "wp.deleted_at"])
      .where("wp.entity_id", "=", entityId)
      .where("wp.examination_id", "=", examinationId)
      .where("wp.approval_period_id", "in", (eb: any) =>
        eb
          .selectFrom("ws_bmhp_approval_periods as wap")
          .select("wap.id")
          .where("wap.deleted_at", "is", null)
          .where("wap.program_plan_id", "in", (eb2: any) =>
            eb2
              .selectFrom("ws_program_plans as wpp")
              .select("wpp.id")
              .where("wpp.year", "=", year)
              .where("wpp.deleted_at", "is", null)
          )
      )
      .executeTakeFirst()
  }

  async findApprovalPeriodByEntityAndYear(
    c: Context,
    entityId: number,
    year: number
  ) {
    const programId = Number(c.var.programId)
    return c.var.trx
      .selectFrom("ws_bmhp_approval_periods as wap" as any)
      .innerJoin(
        "ws_program_plans as wpp" as any,
        "wpp.id",
        "wap.program_plan_id"
      )
      .select(["wap.id", "wap.program_plan_id"])
      .where("wap.entity_id", "=", entityId)
      .where("wpp.year", "=", year)
      .where("wpp.program_id", "=", programId)
      .where("wap.deleted_at", "is", null)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findOrCreateApprovalPeriodByEntityAndYear(
    c: Context,
    entityId: number,
    year: number
  ) {
    // Try to find existing approval period
    const existing = await this.findApprovalPeriodByEntityAndYear(
      c,
      entityId,
      year
    )

    if (existing) {
      return existing
    }

    const programId = Number(c.var.programId)

    // Find or create program_plan for this year with program_id
    let programPlan = await c.var.trx
      .selectFrom("ws_program_plans as wpp" as any)
      .select("id")
      .where("wpp.year", "=", year)
      .where("wpp.program_id", "=", programId)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()

    // Create program_plan if it doesn't exist
    if (!programPlan) {
      const programPlanResult = await c.var.trx
        .insertInto("ws_program_plans" as any)
        .values({
          program_id: programId,
          year,
          approach_id: 4,
          status: 0, // draft status
          is_active: 1,
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .executeTakeFirstOrThrow()

      programPlan = { id: Number(programPlanResult.insertId) }
    }

    // Create approval period
    const approvalPeriodResult = await c.var.trx
      .insertInto("ws_bmhp_approval_periods" as any)
      .values({
        entity_id: entityId,
        program_plan_id: programPlan.id,
        status: 0, // draft status
        current_step: 1,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return {
      id: Number(approvalPeriodResult.insertId),
      program_plan_id: programPlan.id,
    }
  }

  async findPlanningById(c: Context, id: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning as wp" as any)
      .select([
        "wp.id",
        "wp.entity_id",
        sql<number>`(SELECT wpp.year FROM ws_program_plans wpp INNER JOIN ws_bmhp_approval_periods wap ON wap.program_plan_id = wpp.id WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL AND wpp.deleted_at IS NULL LIMIT 1)`.as(
          "year"
        ),
        sql<number>`(SELECT wap.program_plan_id FROM ws_bmhp_approval_periods wap WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL LIMIT 1)`.as(
          "program_plan_id"
        ),
        "wp.examination_id",
        "wp.status",
        "wp.created_at",
        "wp.updated_at",
        sql<number>`(SELECT CASE WHEN wap.status IN (1, 3) THEN 1 ELSE 0 END FROM ws_bmhp_approval_periods wap WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL LIMIT 1)`.as(
          "is_approved"
        ),
        sql<boolean>`EXISTS(
          SELECT 1
          FROM ws_bmhp_planning_target_groups wptg
          INNER JOIN ws_bmhp_approval_periods wap ON wap.id = wp.approval_period_id
          WHERE wptg.planning_id = wp.id
            AND wptg.verification_status = 2
            AND wptg.deleted_at IS NULL
            AND wap.status = 2
            AND wap.deleted_at IS NULL
        )`.as("revision"),
      ])
      .where("wp.id", "=", id)
      .where("wp.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findDetailPlanning(c: Context, id: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning as wp" as any)
      .leftJoin("bmhp_examinations as be" as any, "be.id", "wp.examination_id")
      .leftJoin(
        "bmhp_examination_types as bet" as any,
        "bet.id",
        "be.examination_type_id"
      )
      .leftJoin("entities as e" as any, "e.id", "wp.entity_id")
      .select([
        "wp.id",
        "wp.entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
        sql<number>`(SELECT wpp.year FROM ws_program_plans wpp INNER JOIN ws_bmhp_approval_periods wap ON wap.program_plan_id = wpp.id WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL AND wpp.deleted_at IS NULL LIMIT 1)`.as(
          "year"
        ),
        sql<number>`(SELECT wap.program_plan_id FROM ws_bmhp_approval_periods wap WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL LIMIT 1)`.as(
          "program_plan_id"
        ),
        "wp.examination_id",
        "be.name as examination_name",
        "bet.name as examination_type",
        "wp.status",
        "wp.submitted_at",
        "wp.approved_at",
        "wp.created_at",
        "wp.updated_at",
        sql<number>`(SELECT CASE WHEN wap.status IN (1, 3) THEN 1 ELSE 0 END FROM ws_bmhp_approval_periods wap WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL LIMIT 1)`.as(
          "is_approved"
        ),
        sql<boolean>`EXISTS(
          SELECT 1
          FROM ws_bmhp_planning_target_groups wptg
          INNER JOIN ws_bmhp_approval_periods wap ON wap.id = wp.approval_period_id
          WHERE wptg.planning_id = wp.id
            AND wptg.verification_status = 2
            AND wptg.deleted_at IS NULL
            AND wap.status = 2
            AND wap.deleted_at IS NULL
        )`.as("revision"),
      ])
      .where("wp.id", "=", id)
      .where("wp.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findDetailMethods(c: Context, planningId: number) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning_methods as wpm" as any)
      .leftJoin(
        "bmhp_examination_methods as bem" as any,
        "bem.id",
        "wpm.method_id"
      )
      .select(["bem.name as method_name"])
      .where("wpm.planning_id", "=", planningId)
      .where("wpm.deleted_at", "is", null)
      .execute()
  }

  async findDetailTargetGroups(c: Context, planningId: number) {
    return this.findDetailTargetGroupsBulk(c, [planningId])
  }

  async findDetailTargetGroupsBulk(c: Context, planningIds: number[]) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning_target_groups as wptg" as any)
      .leftJoin("target_groups as tg" as any, "tg.id", "wptg.target_group_id")
      .leftJoin("ws_bmhp_planning as wp" as any, "wp.id", "wptg.planning_id")
      .select([
        "wptg.id",
        "wptg.planning_id",
        "wptg.target_group_id",
        "tg.title as target_name",
        "wptg.sample_count",
        "wptg.test_count",
        "wptg.verification_status",
        sql<number>`CASE WHEN wptg.verification_status = 2 THEN 1 ELSE 0 END`.as(
          "revision"
        ),
      ])
      .where("wptg.planning_id", "in", planningIds)
      .where("wptg.deleted_at", "is", null)
      .execute()
  }

  async findDetailMethodsBulk(c: Context, planningIds: number[]) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning_methods as wpm" as any)
      .leftJoin(
        "bmhp_examination_methods as bem" as any,
        "bem.id",
        "wpm.method_id"
      )
      .select(["wpm.planning_id", "bem.name as method_name"])
      .where("wpm.planning_id", "in", planningIds)
      .where("wpm.deleted_at", "is", null)
      .execute()
  }

  async findDetailMaterials(c: Context, targetGroupIds: number[]) {
    return c.var.trx
      .selectFrom("ws_bmhp_planning_materials as wpmm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as wptg",
        "wptg.id",
        "wpmm.planning_target_group_id"
      )
      .innerJoin("ws_bmhp_planning as wp", "wp.id", "wptg.planning_id")
      .leftJoin("bmhp_materials as bm", "bm.id", "wpmm.material_id")
      .leftJoin(
        "ws_bmhp_material_variant as wbmv",
        "wbmv.id",
        "wpmm.material_template_id"
      )
      .leftJoin(
        "ws_bmhp_material_variant_detail as wbmvd",
        "wbmvd.id",
        "wpmm.variant_id"
      )
      .leftJoin(
        "ws_materials as wm_template",
        "wm_template.global_id",
        "wbmv.material_id"
      )
      .leftJoin("ws_materials as wm", "wm.global_id", "wbmvd.material_id")
      .select([
        "wpmm.id",
        "wpmm.planning_target_group_id",
        "bm.is_reagen",
        "bm.name as material_name",
        "wpmm.lab_usage",
        "wm_template.name as product_template",
        sql<string>`(
          SELECT bmvd.name FROM ws_bmhp_material_variant_detail bmvd
          WHERE bmvd.id = wpmm.variant_id AND bmvd.deleted_at IS NULL
          LIMIT 1
        )`.as("product_variant"),
        sql<number>`(
          SELECT bmvd2.test_qty FROM ws_bmhp_material_variant_detail bmvd2
          WHERE bmvd2.id = wpmm.variant_id AND bmvd2.deleted_at IS NULL
          LIMIT 1
        )`.as("test_qty"),
        "wpmm.calculated_requirement",
        sql<string>`COALESCE(wm.unit_of_consumption, wm_template.unit_of_consumption)`.as(
          "estimated_unit"
        ),
        "wbmv.is_variant",
        sql<string>`COALESCE(wm.material_type, wm_template.material_type)`.as("material_type"),
        sql<string>`COALESCE(wm.material_subtype, wm_template.material_subtype)`.as("material_subtype"),
        sql<number>`(SELECT CASE WHEN wptg2.verification_status = 2 THEN 1 ELSE 0 END FROM ws_bmhp_planning_target_groups wptg2 WHERE wptg2.id = wpmm.planning_target_group_id AND wptg2.deleted_at IS NULL LIMIT 1)`.as(
          "revision"
        ),
      ])
      .where("wpmm.planning_target_group_id", "in", targetGroupIds)
      .where("wpmm.deleted_at", "is", null)
      .groupBy("wpmm.id")
      .execute()
  }

  async deletePlanning(c: Context, id: number) {
    // Hard-delete materials and target groups so (planning_id, target_group_id)
    // unique index doesn't block re-insertion if the same planning is recreated later
    await c.var.trx
      .deleteFrom("ws_bmhp_planning_materials" as any)
      .where(
        "planning_target_group_id",
        "in",
        c.var.trx
          .selectFrom("ws_bmhp_planning_target_groups" as any)
          .select("id")
          .where("planning_id", "=", id)
      )
      .execute()

    await Promise.all([
      c.var.trx
        .deleteFrom("ws_bmhp_planning_target_groups" as any)
        .where("planning_id", "=", id)
        .execute(),
      c.var.trx
        .deleteFrom("ws_bmhp_planning_methods" as any)
        .where("planning_id", "=", id)
        .execute(),
    ])

    // Soft-delete the planning row itself to preserve audit history
    await c.var.trx
      .updateTable("ws_bmhp_planning" as any)
      .set({ deleted_at: new Date() })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async deletePlanningChildren(c: Context, planningId: number) {
    // delete materials via target group ids
    await c.var.trx
      .deleteFrom("ws_bmhp_planning_materials" as any)
      .where(
        "planning_target_group_id",
        "in",
        c.var.trx
          .selectFrom("ws_bmhp_planning_target_groups" as any)
          .select("id")
          .where("planning_id", "=", planningId)
      )
      .execute()

    // delete target groups and methods
    await Promise.all([
      c.var.trx
        .deleteFrom("ws_bmhp_planning_target_groups" as any)
        .where("planning_id", "=", planningId)
        .execute(),
      c.var.trx
        .deleteFrom("ws_bmhp_planning_methods" as any)
        .where("planning_id", "=", planningId)
        .execute(),
    ])
  }

  async deletePlanningMaterialsAndMethods(c: Context, planningId: number) {
    await c.var.trx
      .deleteFrom("ws_bmhp_planning_materials" as any)
      .where(
        "planning_target_group_id",
        "in",
        c.var.trx
          .selectFrom("ws_bmhp_planning_target_groups" as any)
          .select("id")
          .where("planning_id", "=", planningId)
      )
      .execute()

    await c.var.trx
      .deleteFrom("ws_bmhp_planning_methods" as any)
      .where("planning_id", "=", planningId)
      .execute()
  }

  async resetPlanningTargetGroups(c: Context, planningId: number) {
    // Reset test_count to 0 and verification_status to 1 for all target groups of the planning
    await c.var.trx
      .updateTable("ws_bmhp_planning_target_groups" as any)
      .set({
        test_count: 0,
        verification_status: 1,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("planning_id", "=", planningId)
      .execute()
  }

  async seedPlanningTargetGroupsFromExamination(
    c: Context,
    planningId: number,
    examinationId: number
  ) {
    const examTargetGroups = await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups" as any)
      .select(["target_group_id"])
      .where("examination_id", "=", examinationId)
      .execute()

    if (examTargetGroups.length === 0) return

    const existing = await c.var.trx
      .selectFrom("ws_bmhp_planning_target_groups" as any)
      .select(["id", "target_group_id"])
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .execute()

    const existingByTgId = new Map<number, number>(
      existing.map((row: any) => [
        Number(row.target_group_id),
        Number(row.id),
      ])
    )

    for (const row of examTargetGroups) {
      const tgId = Number((row as any).target_group_id)
      const existingId = existingByTgId.get(tgId)

      if (existingId === undefined) {
        await c.var.trx
          .insertInto("ws_bmhp_planning_target_groups" as any)
          .values({
            planning_id: planningId,
            target_group_id: tgId,
            sample_count: 0,
            test_count: 0,
            verification_status: 1,
            created_by: c.var.userId,
            updated_by: c.var.userId,
          })
          .executeTakeFirstOrThrow()
      } else {
        await c.var.trx
          .updateTable("ws_bmhp_planning_target_groups" as any)
          .set({
            test_count: 0,
            verification_status: 1,
            updated_by: c.var.userId,
            updated_at: new Date(),
          })
          .where("id", "=", existingId)
          .execute()
      }
    }
  }

  async findExaminationTargetGroups(c: Context, examinationId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups" as any)
      .select(["target_group_id"])
      .where("examination_id", "=", examinationId)
      .execute()
  }

  async findPlanningTargetGroups(c: Context, planningId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_planning_target_groups" as any)
      .select(["target_group_id"])
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async findProgramPlansWithStatus(
    c: Context,
    params: {
      paginate?: number
      page?: number
      is_final?: boolean
    }
  ) {
    const programId = Number(c.var.programId)
    const userEntityId = c.var.userEntity?.global_id

    // Get the entity (puskesmas with entity_tag_id = 9)
    const userEntity = await c.var.trx
      .selectFrom("entities")
      .select(["id", "entity_tag_id", "regency_id"])
      .where("id", "=", userEntityId)
      .executeTakeFirst()

    if (!userEntity) {
      return { list: [], total: 0 }
    }

    // Find parent dinkes (entity_tag_id = 7) by regency_id
    let dinkeEntityId: number | null = null

    if (userEntity.entity_tag_id === 7) {
      // User is already dinkes
      dinkeEntityId = userEntity.id
    } else if (userEntity.entity_tag_id === 9 && userEntity.regency_id) {
      // User is puskesmas, find parent dinkes by regency
      const dinkes = await c.var.trx
        .selectFrom("entities")
        .select("id")
        .where("regency_id", "=", userEntity.regency_id)
        .where("entity_tag_id", "=", 7)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      dinkeEntityId = dinkes?.id ?? null
    }

    if (!dinkeEntityId) {
      return { list: [], total: 0 }
    }

    // Get program plans with their approval period status
    // Use a subquery to get MAX approval_period_status per program plan to avoid duplicates
    const subquery = c.var.trx
      .selectFrom("ws_bmhp_approval_periods as wap")
      .select([
        "wap.program_plan_id",
        c.var.trx.fn.max("wap.status").as("max_approval_status"),
      ])
      .where("wap.entity_id", "=", dinkeEntityId)
      .where("wap.deleted_at", "is", null)
      .groupBy("wap.program_plan_id")
      .as("approval_status")

    let query = c.var.trx
      .selectFrom("ws_program_plans as wpp")
      .leftJoin(subquery, "approval_status.program_plan_id", "wpp.id")
      .select([
        "wpp.id",
        "wpp.year",
        "wpp.status",
        sql<number>`CASE WHEN approval_status.max_approval_status IN (1, 3) THEN 1 ELSE 0 END`.as(
          "approval_period_status"
        ),
        "wpp.created_at",
        "wpp.updated_at",
      ])
      .where("wpp.program_id", "=", programId)
      .where("wpp.approach_id", "=", 4)
      .where("wpp.is_active", "=", 1)
      .where("wpp.status", "=", 1)
      .where("wpp.deleted_at", "is", null)

    let countQuery = c.var.trx
      .selectFrom("ws_program_plans as wpp")
      .select(c.var.trx.fn.count("wpp.id").as("total"))
      .where("wpp.program_id", "=", programId)
      .where("wpp.approach_id", "=", 4)
      .where("wpp.is_active", "=", 1)
      .where("wpp.status", "=", 1)
      .where("wpp.deleted_at", "is", null)

    query = query.orderBy("wpp.year", "asc")

    if (params.paginate && params.page) {
      const offset = (params.page - 1) * params.paginate
      query = query.limit(params.paginate).offset(offset)
    }

    const [data, totalResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirst(),
    ])

    return {
      list: data,
      total: Number(totalResult?.total ?? 0),
    }
  }

  async createExaminationTargetMaterial(
    c: Context,
    data: {
      exam_target_group_id: number
      bmhp_material_id: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_examination_target_materials" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createExaminationParameter(
    c: Context,
    data: {
      examination_id: number
      parameter_id: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_examination_parameters" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createExaminationTargetGroup(
    c: Context,
    data: {
      examination_id: number
      target_group_id: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_examination_target_groups" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createExaminationMethod(
    c: Context,
    data: {
      examination_id: number
      method_id: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_examination_methods" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createTargetMaterial(
    c: Context,
    data: {
      exam_target_group_id: number
      bmhp_material_id: number
    }
  ) {
    const result = await c.var.trx
      .insertInto("ws_bmhp_target_materials" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createBmhpParameter(
    c: Context,
    data: {
      name: string
      description?: string
      is_active?: boolean
    }
  ) {
    const result = await c.var.trx
      .insertInto("bmhp_parameters" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createBmhpTargetGroup(
    c: Context,
    data: {
      name: string
      description?: string
      is_active?: boolean
    }
  ) {
    const result = await c.var.trx
      .insertInto("bmhp_target_groups" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async createBmhpExaminationMethod(
    c: Context,
    data: {
      name: string
      description?: string
      is_active?: boolean
    }
  ) {
    const result = await c.var.trx
      .insertInto("bmhp_examination_methods" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  /**
   * Get planning edit data for a specific history (planning) and target group
   * Returns default data if planning doesn't exist yet
   */
  async findPlanningEditData(
    c: Context,
    historyId: number,
    targetGroupId: number
  ) {
    // Get planning and target group info
    const planning = await c.var.trx
      .selectFrom("ws_bmhp_planning as wp" as any)
      .innerJoin(
        "ws_bmhp_planning_target_groups as wptg" as any,
        "wptg.planning_id",
        "wp.id"
      )
      .leftJoin("target_groups as tg" as any, "tg.id", "wptg.target_group_id")
      .leftJoin("bmhp_examinations as be" as any, "be.id", "wp.examination_id")
      .select([
        "wptg.id",
        "wptg.target_group_id",
        "tg.title as target_name",
        "wptg.sample_count",
        "wptg.test_count",
        "wptg.verification_status",
        "wp.id as planning_id",
        sql<number>`(SELECT wap.program_plan_id FROM ws_bmhp_approval_periods wap WHERE wap.id = wp.approval_period_id AND wap.deleted_at IS NULL LIMIT 1)`.as(
          "program_plan_id"
        ),
        "wp.entity_id",
        "wp.examination_id",
        "be.name as examination_name",
        sql<number>`0`.as("revision"),
      ])
      .where("wp.id", "=", historyId)
      .where("wptg.target_group_id", "=", targetGroupId)
      .where("wp.deleted_at", "is", null)
      .where("wptg.deleted_at", "is", null)
      .executeTakeFirst()

    // If planning doesn't exist, get target group info for defaults
    if (!planning) {
      const targetGroup = await c.var.trx
        .selectFrom("target_groups as tg" as any)
        .select(["tg.id", "tg.title"])
        .where("tg.id", "=", targetGroupId)
        .where("tg.deleted_at", "is", null)
        .executeTakeFirst()

      return {
        id: null,
        target_group_id: targetGroupId,
        target_name: targetGroup?.title || null,
        sample_count: 0,
        test_count: 0,
        verification_status: 0,
        revision: 0,
        materials: [],
      }
    }

    // Get materials for this target group
    const materials = await c.var.trx
      .selectFrom("ws_bmhp_planning_materials as wpmm" as any)
      .innerJoin(
        "ws_bmhp_planning_target_groups as wptg",
        "wptg.id",
        "wpmm.planning_target_group_id"
      )
      .leftJoin("bmhp_materials as bm", "bm.id", "wpmm.material_id")
      .leftJoin(
        "ws_bmhp_material_variant as wbmv",
        "wbmv.id",
        "wpmm.material_template_id"
      )
      .leftJoin(
        "ws_bmhp_material_variant_detail as wbmvd",
        "wbmvd.id",
        "wpmm.variant_id"
      )
      .leftJoin(
        "ws_materials as wm_template",
        "wm_template.global_id",
        "wbmv.material_id"
      )
      .leftJoin("ws_materials as wm", "wm.global_id", "wbmvd.material_id")
      .leftJoin("bmhp_examination_methods as bem", "bem.id", "wpmm.method_id")
      .select([
        "wpmm.id",
        "wpmm.planning_target_group_id",
        "bm.is_reagen",
        "bm.name as material_name",
        "wpmm.lab_usage",
        "wm_template.name as product_template",
        sql<string>`(
          SELECT bmvd2.name FROM ws_bmhp_material_variant_detail bmvd2
          WHERE bmvd2.id = wpmm.variant_id AND bmvd2.deleted_at IS NULL
          LIMIT 1
        )`.as("product_variant"),
        sql<number>`(
          SELECT bmvd3.test_qty FROM ws_bmhp_material_variant_detail bmvd3
          WHERE bmvd3.id = wpmm.variant_id AND bmvd3.deleted_at IS NULL
          LIMIT 1
        )`.as("test_qty"),
        "wpmm.calculated_requirement",
        sql<string>`COALESCE(wm.unit_of_consumption, wm_template.unit_of_consumption)`.as(
          "estimated_unit"
        ),
        "wbmv.is_variant",
        sql<string>`COALESCE(wm.material_type, wm_template.material_type)`.as(
          "material_type"
        ),
        sql<string>`COALESCE(wm.material_subtype, wm_template.material_subtype)`.as(
          "material_subtype"
        ),
        "bem.name as method_name",
        sql<number>`0`.as("revision"),
      ])
      .where("wpmm.planning_target_group_id", "=", planning.id)
      .where("wpmm.deleted_at", "is", null)
      .execute()

    return {
      ...planning,
      materials: materials.map((m: any) => ({
        ...m,
        method: m.method_name || "",
      })),
    }
  }

  /**
   * Update planning with target groups and materials (mobile edit)
   * Creates planning if it doesn't exist
   */
  async updatePlanningEdit(
    c: Context,
    entityId: number,
    approvalPeriodEntityId: number,
    data: {
      examination_id: number
      program_plan_id: number
      status?: string
      target_groups: Array<{
        target_group_id: number
        sample_count: number
        test_count: number
      }>
      materials?: Array<{
        target_group_index: number
        material_id: number
        material_template_id?: number
        variant_id?: number
        method_id?: number
        lab_usage?: number
        calculated_requirement?: number
      }>
    }
  ) {
    // Get year from ws_program_plans
    const programPlan = await c.var.trx
      .selectFrom("ws_program_plans as wpp" as any)
      .select(["wpp.id", "wpp.year"])
      .where("wpp.id", "=", data.program_plan_id)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()

    if (!programPlan) {
      throw new Error(`Program plan with ID ${data.program_plan_id} not found`)
    }

    const year = Number(programPlan.year)

    // Find existing planning
    let existingPlanning = await c.var.trx
      .selectFrom("ws_bmhp_planning as wp" as any)
      .select(["wp.id", "wp.approval_period_id"])
      .where("wp.entity_id", "=", entityId)
      .where("wp.examination_id", "=", data.examination_id)
      .where("wp.deleted_at", "is", null)
      .executeTakeFirst()

    // Create planning if it doesn't exist
    if (!existingPlanning) {
      // Get or create approval period using dinkes entity_id and the year from program_plan
      const approvalPeriod =
        await this.findOrCreateApprovalPeriodByEntityAndYear(
          c,
          approvalPeriodEntityId,
          year
        )

      const planningResult = await c.var.trx
        .insertInto("ws_bmhp_planning" as any)
        .values({
          entity_id: entityId,
          approval_period_id: approvalPeriod.id,
          examination_id: data.examination_id,
          status: data.status ?? "DRAFT",
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .executeTakeFirstOrThrow()

      existingPlanning = {
        id: Number(planningResult.insertId),
        approval_period_id: approvalPeriod.id,
      }
    }

    const planningId = Number(existingPlanning.id)

    // Update planning status if provided
    // if (data.status) {
    await c.var.trx
      .updateTable("ws_bmhp_planning" as any)
      .set({
        status: data.status,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", planningId)
      .execute()
    // }

    // Update or create target groups
    const targetGroupIds: number[] = []
    for (const tg of data.target_groups) {
      const id = await this.upsertTargetGroup(c, planningId, tg)
      targetGroupIds.push(id)
    }

    // Update materials
    if (data.materials && data.materials.length > 0) {
      await this.updatePlanningMaterials(c, data.materials, targetGroupIds)
    }

    return { id: planningId }
  }

  private async updatePlanningMaterials(
    c: Context,
    materials: Array<{
      target_group_index: number
      material_id: number
      material_template_id?: number
      variant_id?: number
      method_id?: number
      lab_usage?: number
      calculated_requirement?: number
    }>,
    targetGroupIds: number[]
  ): Promise<void> {
    // Get existing materials to track which ones to keep
    const existingMaterials = await c.var.trx
      .selectFrom("ws_bmhp_planning_materials" as any)
      .select(["id", "planning_target_group_id"])
      .where("planning_target_group_id", "in", targetGroupIds)
      .where("deleted_at", "is", null)
      .execute()

    const materialIdsToDelete = new Set(
      existingMaterials.map((m: any) => Number(m.id))
    )

    // Update or insert materials
    for (const mat of materials) {
      const targetGroupId = targetGroupIds[mat.target_group_index]
      if (!targetGroupId) continue

      // Try to find existing material
      const existing = await c.var.trx
        .selectFrom("ws_bmhp_planning_materials" as any)
        .select("id")
        .where("planning_target_group_id", "=", targetGroupId)
        .where("material_id", "=", mat.material_id)
        .where("material_template_id", "=", mat.material_template_id ?? null)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      if (existing) {
        await c.var.trx
          .updateTable("ws_bmhp_planning_materials" as any)
          .set({
            lab_usage: mat.lab_usage ?? 0,
            calculated_requirement: mat.calculated_requirement ?? 0,
            variant_id: mat.variant_id ?? null,
            method_id: mat.method_id ?? null,
            updated_by: c.var.userId,
            updated_at: new Date(),
          })
          .where("id", "=", Number(existing.id))
          .execute()
        materialIdsToDelete.delete(Number(existing.id))
      } else {
        await c.var.trx
          .insertInto("ws_bmhp_planning_materials" as any)
          .values({
            planning_target_group_id: targetGroupId,
            material_id: mat.material_id,
            material_template_id: mat.material_template_id ?? null,
            variant_id: mat.variant_id ?? null,
            method_id: mat.method_id ?? null,
            lab_usage: mat.lab_usage ?? 0,
            calculated_requirement: mat.calculated_requirement ?? 0,
            created_by: c.var.userId,
            updated_by: c.var.userId,
          })
          .execute()
      }
    }

    // Delete materials that are no longer in the request
    if (materialIdsToDelete.size > 0) {
      await c.var.trx
        .updateTable("ws_bmhp_planning_materials" as any)
        .set({ deleted_at: new Date() })
        .where("id", "in", Array.from(materialIdsToDelete))
        .execute()
    }
  }

  async setUnselectedTargetGroupsVerification(
    c: Context,
    planningId: number,
    selectedTargetGroupIds: number[],
    status: number
  ) {
    let q = (c.var.trx as any)
      .updateTable("ws_bmhp_planning_target_groups" as any)
      .set({
        verification_status: status,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)

    if (selectedTargetGroupIds.length > 0) {
      q = q.where("target_group_id", "not in", selectedTargetGroupIds)
    }

    await q.execute()
  }

  async upsertPlanningTargetGroup(
    c: Context,
    planningId: number,
    tg: { target_group_id: number; sample_count: number; test_count: number }
  ): Promise<number> {
    return this.upsertTargetGroup(c, planningId, tg)
  }

  private async upsertTargetGroup(
    c: Context,
    planningId: number,
    tg: { target_group_id: number; sample_count: number; test_count: number }
  ): Promise<number> {
    const existing = await c.var.trx
      .selectFrom("ws_bmhp_planning_target_groups as wptg" as any)
      .select("id")
      .where("planning_id", "=", planningId)
      .where("target_group_id", "=", tg.target_group_id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (existing) {
      await c.var.trx
        .updateTable("ws_bmhp_planning_target_groups" as any)
        .set({
          sample_count: tg.sample_count,
          test_count: tg.test_count,
          updated_by: c.var.userId,
          updated_at: new Date(),
        })
        .where("id", "=", Number(existing.id))
        .execute()
      return Number(existing.id)
    }

    const result = await c.var.trx
      .insertInto("ws_bmhp_planning_target_groups" as any)
      .values({
        planning_id: planningId,
        target_group_id: tg.target_group_id,
        sample_count: tg.sample_count,
        test_count: tg.test_count,
        verification_status: 1,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
    return Number(result.insertId)
  }

  async findCityDistrictHeatlOfficeTargetData(
    c: Context,
    entityId: number,
    examinationId: number,
    requestedYearProgramPlanId: number,
    targetYearProgramPlanId: number,
    targetGroupIds: number[]
  ) {
    // Get exam name by ID (exam may be from any program_plan)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const examName = await (c.var.trx as any)
      .selectFrom("bmhp_examinations as be")
      .select("be.name")
      .where("be.id", "=", examinationId)
      .where("be.deleted_at", "is", null)
      .executeTakeFirst()

    if (!examName) return []

    // Find target year exam with same name (case-insensitive)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetYearExam = await (c.var.trx as any)
      .selectFrom("bmhp_examinations as be")
      .select("be.id")
      .where((eb) =>
        eb(
          c.var.trx.fn("LOWER", [eb.ref("be.name")]),
          "=",
          examName.name.toLowerCase()
        )
      )
      .where("be.program_plan_id", "=", targetYearProgramPlanId)
      .where("be.deleted_at", "is", null)
      .executeTakeFirst()

    if (!targetYearExam) return []

    const result = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups as wptg")
      .innerJoin("ws_bmhp_planning as wp", "wp.id", "wptg.planning_id")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .innerJoin("ws_program_plans as wpp", "wpp.id", "wap.program_plan_id")
      .select(["wptg.target_group_id", "wptg.sample_count", "wptg.test_count"])
      .where("wp.entity_id", "=", entityId)
      .where("wp.examination_id", "=", targetYearExam.id)
      .where("wpp.id", "=", targetYearProgramPlanId)
      .where("wptg.target_group_id", "in", targetGroupIds)
      .where("wp.deleted_at", "is", null)
      .where("wap.deleted_at", "is", null)
      .where("wpp.deleted_at", "is", null)
      .where("wptg.deleted_at", "is", null)
      .execute()

    return result
  }

  async findRequestedYearOriginalTarget(
    c: Context,
    entityId: number,
    examinationId: number,
    requestedYearProgramPlanId: number,
    targetGroupIds: number[]
  ) {
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups as wptg")
      .innerJoin("ws_bmhp_planning as wp", "wp.id", "wptg.planning_id")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .innerJoin("ws_program_plans as wpp", "wpp.id", "wap.program_plan_id")
      .select(["wptg.target_group_id", "wptg.original_target"])
      .where("wp.entity_id", "=", entityId)
      .where("wp.examination_id", "=", examinationId)
      .where("wpp.id", "=", requestedYearProgramPlanId)
      .where("wptg.target_group_id", "in", targetGroupIds)
      .where("wp.deleted_at", "is", null)
      .where("wap.deleted_at", "is", null)
      .where("wpp.deleted_at", "is", null)
      .where("wptg.deleted_at", "is", null)
      .execute()
  }

  async findTargetGroupsByIds(c: Context, targetGroupIds: number[]) {
    return (c.var.trx as any)
      .selectFrom("target_groups as tg")
      .select(["tg.id", "tg.title as name"])
      .where("tg.id", "in", targetGroupIds)
      .where("tg.deleted_at", "is", null)
      .execute()
  }

  async findProgramPlansByYearAndApproach(
    c: Context,
    year: number,
    approachId: number = 4
  ) {
    const programId = Number(c.var.programId)
    return (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .select("wpp.id")
      .where("wpp.year", "=", year)
      .where("wpp.approach_id", "=", approachId)
      .where("wpp.program_id", "=", programId)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findPreviousYearMaterials(
    c: Context,
    planningId: number,
    currentYear: number,
    entityId: number
  ) {
    // Get current planning exam
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planning = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .select(["wp.examination_id", "wap.program_plan_id"])
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .where("wp.id", "=", planningId)
      .where("wp.deleted_at", "is", null)
      .executeTakeFirst()

    if (!planning) return []

    // Get exam name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exam = await (c.var.trx as any)
      .selectFrom("bmhp_examinations as be")
      .select("be.name")
      .where("be.id", "=", planning.examination_id)
      .where("be.deleted_at", "is", null)
      .executeTakeFirst()

    if (!exam) return []

    // Get previous year program plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevYearPlan = await (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .select("wpp.id")
      .where("wpp.year", "=", currentYear - 1)
      .where("wpp.approach_id", "=", 4)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()

    if (!prevYearPlan) return []

    // Get previous year exam with same name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevExam = await (c.var.trx as any)
      .selectFrom("bmhp_examinations as be")
      .select("be.id")
      .where((eb) =>
        eb(
          c.var.trx.fn("LOWER", [eb.ref("be.name")]),
          "=",
          exam.name.toLowerCase()
        )
      )
      .where("be.program_plan_id", "=", prevYearPlan.id)
      .where("be.deleted_at", "is", null)
      .executeTakeFirst()

    if (!prevExam) return []

    // Get previous year materials (match by material name, not ID)
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as wbpm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as wptg",
        "wptg.id",
        "wbpm.planning_target_group_id"
      )
      .innerJoin("ws_bmhp_planning as wp", "wp.id", "wptg.planning_id")
      .innerJoin("bmhp_materials as bm", "bm.id", "wbpm.material_id")
      .select([
        "wptg.target_group_id",
        "bm.name as material_name",
        "wbpm.lab_usage as prev_lab_usage",
      ])
      .where("wp.entity_id", "=", entityId)
      .where("wp.examination_id", "=", prevExam.id)
      .where("wbpm.deleted_at", "is", null)
      .where("wptg.deleted_at", "is", null)
      .where("wp.deleted_at", "is", null)
      .where("bm.deleted_at", "is", null)
      .execute()
  }

  async createBmhpMaterial(
    c: Context,
    data: {
      name: string
      is_reagen?: boolean
      description?: string
      is_active?: boolean
    }
  ) {
    const result = await c.var.trx
      .insertInto("bmhp_materials" as any)
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  /**
   * Check if planning has submitted target group data
   * Returns false if: no target_groups exist OR all have test_count=0 AND verification_status=0
   * Returns true if: at least one target_group has test_count > 0 OR verification_status > 0
   */
  async planningHasSubmittedTargetGroup(
    c: Context,
    planningId: number
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups")
      .select("id")
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .where((eb: any) =>
        eb.or([
          eb("test_count", ">", 0),
          eb("verification_status", ">", 0),
        ])
      )
      .executeTakeFirst()

    return !!result
  }
}
