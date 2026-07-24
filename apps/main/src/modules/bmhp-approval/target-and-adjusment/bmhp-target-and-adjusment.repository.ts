import { Context } from "hono"
import { sql } from "kysely"
import { BadRequestError } from "@smile/lib/error.js"

export class BmhpTargetAdjustmentRepository {
  /**
   * Get examinations with their target groups for a specific program plan
   * examination = "material" column in the table view
   */
  async getExaminationsByProgramPlan(
    c: Context,
    programPlanId: number,
    examinationIds?: number[]
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let examinationQuery = (c.var.trx as any)
      .selectFrom("bmhp_examinations as be")
      .innerJoin(
        "ws_program_plans as wpp" as any,
        "wpp.id",
        "be.program_plan_id"
      )
      .select(["be.id", "be.name"])
      .where("wpp.id", "=", programPlanId)
      .where("wpp.deleted_at", "is", null)
      .where("be.deleted_at", "is", null)

    if (examinationIds && examinationIds.length > 0) {
      examinationQuery = examinationQuery.where("be.id", "in", examinationIds)
    }

    // Match order and active status with monitoring
    examinationQuery = examinationQuery
      .where("be.is_active", "=", 1)
      .orderBy("be.updated_at", "desc")

    const examinations = await examinationQuery.execute()

    if (examinations.length === 0) return []

    const fetchedExaminationIds = examinations.map((e: any) => e.id)

    // Get target groups linked to each examination via ws_bmhp_examination_target_groups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetGroupRows = await (c.var.trx as any)
      .selectFrom("ws_bmhp_examination_target_groups as wetg")
      .innerJoin("target_groups as tg", "tg.id", "wetg.target_group_id")
      .select([
        "wetg.examination_id",
        "tg.id as target_group_id",
        "tg.title as name",
      ])
      .where("wetg.examination_id", "in", fetchedExaminationIds)
      .where("tg.deleted_at", "is", null)
      .execute()

    // Group target groups by examination_id
    return examinations.map((exam: any) => ({
      id: exam.id,
      name: exam.name,
      target_groups: targetGroupRows
        .filter((tg: any) => tg.examination_id === exam.id)
        .map((tg: any) => ({ id: tg.target_group_id, name: tg.name })),
    }))
  }

  /**
   * Get all entities under a regency with their planning data
   */
  async getEntitiesWithPlanningData(
    c: Context,
    params: {
      regencyId: number
      programPlanId: number
      page: number
      paginate: number
      keyword?: string
      examinationIds?: number[]
    }
  ) {
    const {
      regencyId,
      programPlanId,
      page,
      paginate,
      keyword,
      examinationIds,
    } = params
    const offset = (page - 1) * paginate

    // Get all entities under the regency — entity_tag_id=9 = Puskesmas
    let entityQuery = c.var.trx
      .selectFrom("entities as e")
      .leftJoin("locations as reg", "reg.id", "e.regency_id")
      .select(["e.id as entity_id", "e.name as entity_name"])
      .where("e.regency_id", "=", String(regencyId))
      .where("e.entity_tag_id", "=", 9)
      .where("e.deleted_at", "is", null)

    if (keyword) {
      entityQuery = entityQuery.where("e.name", "like", `%${keyword}%`)
    }

    const [entities, totalResult] = await Promise.all([
      entityQuery
        .orderBy("e.name", "asc")
        .limit(paginate)
        .offset(offset)
        .execute(),
      entityQuery
        .select((eb) => [eb.fn.count("e.id").as("total")])
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    // Get entity IDs
    const entityIds = entities.map((e) => e.entity_id)

    if (entityIds.length === 0) {
      return { entities: [], total }
    }

    // Get planning data for these entities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planningData: any = await (
      c.var.trx
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .selectFrom("ws_bmhp_planning as wp" as any)
        .innerJoin(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "bmhp_examinations as be" as any,
          "be.id",
          "wp.examination_id"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any
    )
      .innerJoin(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "ws_bmhp_approval_periods as wap" as any,
        "wap.id",
        "wp.approval_period_id"
      )
      .leftJoin(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "ws_bmhp_planning_target_groups as wptg" as any,
        "wptg.planning_id",
        "wp.id"
      )
      .leftJoin(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "ws_users as wsu" as any,
        "wsu.id",
        "wp.updated_by"
      )
      .select([
        "wp.id as planning_id",
        "wp.entity_id",
        "wp.examination_id",
        "wp.updated_at",
        "wp.updated_by",
        "wsu.firstname as updater_firstname",
        "wsu.lastname as updater_lastname",
        "wptg.id as target_group_planning_id",
        "wptg.target_group_id",
        "wptg.sample_count",
        "wptg.test_count",
        "wptg.verification_status",
        "wptg.revision_note",
      ])
      .where("wp.entity_id", "in", entityIds)
      .where("wap.program_plan_id", "=", programPlanId)
      .where("wap.deleted_at", "is", null)
      .where("wp.deleted_at", "is", null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where((eb: any) =>
        eb.or([eb("wptg.deleted_at", "is", null), eb("wptg.id", "is", null)])
      )
      .$if(!!(examinationIds && examinationIds.length > 0), (qb: any) =>
        qb.where("wp.examination_id", "in", examinationIds)
      )
      .execute()

    return { entities, planningData, total }
  }

  /**
   * Get ALL entities (no pagination) with planning data — used for Excel export
   * Always returns all puskesmas under the regency, even without planning data
   */
  async getAllEntitiesForExport(
    c: Context,
    params: {
      regencyId: number
      programPlanId: number
      keyword?: string
      examinationIds?: number[]
    }
  ) {
    const { regencyId, programPlanId, keyword, examinationIds } = params

    let entityQuery = c.var.trx
      .selectFrom("entities as e")
      .select([
        "e.id as entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
      ])
      .where("e.regency_id", "=", String(regencyId))
      .where("e.entity_tag_id", "=", 9)
      .where("e.id_satu_sehat", "is not", null)
      .where("e.deleted_at", "is", null)

    if (keyword) {
      entityQuery = entityQuery.where("e.name", "like", `%${keyword}%`)
    }

    const entities = await entityQuery.orderBy("e.name", "asc").execute()
    const entityIds = entities.map((e) => e.entity_id)

    if (entityIds.length === 0) {
      return { entities: [], planningData: [] }
    }

    // Use leftJoin to ensure all entities are returned, even without planning data
    // Filter by program_plan_id directly through ws_bmhp_approval_periods subquery
    // This ensures consistency with the monitoring endpoint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planningData: any = await (c.var.trx as any)
      .selectFrom("entities as e")
      .leftJoin("ws_bmhp_planning as wp", (join: any) => {
        let j = join
          .onRef("wp.entity_id", "=", "e.id")
          .on("wp.approval_period_id", "in", (eb: any) =>
            eb
              .selectFrom("ws_bmhp_approval_periods")
              .select("id")
              .where("program_plan_id", "=", programPlanId)
              .where("deleted_at", "is", null)
          )
          .on("wp.deleted_at", "is", null)
        return j
      })
      .leftJoin("bmhp_examinations as be", (join: any) =>
        join
          .onRef("be.id", "=", "wp.examination_id")
          .on("be.deleted_at", "is", null)
      )
      .leftJoin("ws_bmhp_planning_target_groups as wptg", (join: any) =>
        join
          .onRef("wptg.planning_id", "=", "wp.id")
          .on("wptg.deleted_at", "is", null)
      )
      .leftJoin("ws_users as wsu", "wsu.id", "wp.updated_by")
      .select([
        "e.id as entity_id",
        "wp.id as planning_id",
        "wp.examination_id",
        "wp.updated_at",
        "wp.updated_by",
        "wsu.firstname as updater_firstname",
        "wsu.lastname as updater_lastname",
        "wptg.id as target_group_planning_id",
        "wptg.target_group_id",
        "wptg.sample_count",
        "wptg.test_count",
        "wptg.original_target",
        "wptg.verification_status",
        "wptg.revision_note",
      ])
      .where("e.id", "in", entityIds)
      .where("e.deleted_at", "is", null)
      .where("e.id_satu_sehat", "is not", null)
      .where("wp.deleted_at", "is", null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where((eb: any) =>
        eb.or([eb("wptg.deleted_at", "is", null), eb("wptg.id", "is", null)])
      )
      .$if(!!(examinationIds && examinationIds.length > 0), (qb: any) =>
        qb.where("wp.examination_id", "in", examinationIds)
      )
      .execute()

    // Add logic to check if all existing planning target group records are verification_status === 1
    const totalExistingData = planningData.filter(
      (pd: any) => pd.target_group_planning_id !== null
    )

    const seeCalculation =
      totalExistingData.length > 0 &&
      totalExistingData.every(
        (pd: any) =>
          pd.verification_status === 1 || pd.verification_status === 0
      )

    return { entities, planningData, seeCalculation }
  }

  /**
   * Create or update planning
   */
  async upsertPlanning(
    c: Context,
    data: {
      entity_id: number
      approval_period_id: number
      examination_id: number
      status: string
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (c.var.trx as any)
      .insertInto("ws_bmhp_planning")
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .onDuplicateKeyUpdate({
        status: data.status,
        deleted_at: null,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .execute()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planning = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning")
      .select("id")
      .where("entity_id", "=", data.entity_id)
      .where("approval_period_id", "=", data.approval_period_id)
      .where("examination_id", "=", data.examination_id)
      .where("deleted_at", "is", null)
      .executeTakeFirstOrThrow()

    return { id: Number(planning.id) }
  }

  /**
   * Create or update planning target group
   */
  async upsertPlanningTargetGroup(
    c: Context,
    data: {
      id?: number
      planning_id: number
      target_group_id: number
      sample_count: number
      test_count: number
      /** 0=pending, 1=approved, 2=rejected */
      verification_status: number
      revision_note?: string
    }
  ) {
    if (data.id) {
      // Update existing record
      await c.var.trx
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .updateTable("ws_bmhp_planning_target_groups" as any)
        .set({
          sample_count: data.sample_count,
          test_count: data.test_count,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verification_status: data.verification_status as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          revision_note: (data.revision_note ?? null) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verified_by: c.var.userId as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verified_at: new Date() as any,
          updated_by: c.var.userId,
          updated_at: new Date(),
        })
        .where("id", "=", data.id)
        .execute()

      return { id: data.id }
    } else {
      // Insert new record
      const result = await c.var.trx
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insertInto("ws_bmhp_planning_target_groups" as any)
        .values({
          planning_id: data.planning_id,
          target_group_id: data.target_group_id,
          sample_count: data.sample_count,
          test_count: data.test_count,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verification_status: data.verification_status as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          revision_note: (data.revision_note ?? null) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verified_by: c.var.userId as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verified_at: new Date() as any,
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .executeTakeFirstOrThrow()

      return { id: Number(result.insertId) }
    }
  }

  /**
   * Find or create an approval period for a regency entity + programPlanId.
   * Used to link revision notifications back to a kabupaten-level approval period.
   */
  async getOrCreateApprovalPeriod(
    c: Context,
    regencyEntityId: number,
    programPlanId: number
  ): Promise<number> {
    const existing = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("ws_bmhp_approval_periods" as any)
      .select("id")
      .where("entity_id", "=", regencyEntityId)
      .where("program_plan_id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (existing) return Number(existing.id)

    const inserted = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insertInto("ws_bmhp_approval_periods" as any)
      .values({
        entity_id: regencyEntityId,
        program_plan_id: programPlanId,
        // status 0 = draft
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 0 as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current_step: 1 as any,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return Number(inserted.insertId)
  }

  /**
   * Insert a revision notification for a puskesmas entity.
   * Called when a target group item is rejected (verification_status=2).
   */
  async insertRevisionNotification(
    c: Context,
    data: {
      approval_period_id: number
      puskesmas_entity_id: number
      message: string
    }
  ) {
    await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insertInto("ws_bmhp_revision_notifications" as any)
      .values({
        approval_period_id: data.approval_period_id,
        puskesmas_entity_id: data.puskesmas_entity_id,
        message: data.message,
        sent_by: c.var.userId,
      })
      .execute()
  }

  /**
   * Get examination ID by program plan
   */
  async getExaminationIdByProgramPlan(c: Context, programPlanId: number) {
    const result = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("bmhp_examinations" as any)
      .select("id")
      .where("program_plan_id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result?.id ? Number(result.id) : null
  }

  /**
   * Get year from program plan
   */
  async getYearByProgramPlan(c: Context, programPlanId: number) {
    const result = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("ws_program_plans" as any)
      .select("year")
      .where("id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result?.year ? Number(result.year) : null
  }

  /**
   * Get all data needed for the Add Target Drawer (GET /verifications/target-input)
   * Returns entity info (with province/regency), program_plan, examinations+TGs,
   * and existing planning rows for that entity.
   */
  async getTargetInputForEntity(
    c: Context,
    programPlanId: number,
    entityId: number
  ) {
    // 1. Look up program plan by id + approach_id=4
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programPlan = await (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .select(["wpp.id", "wpp.year"])
      .where("wpp.id", "=", programPlanId)
      .where("wpp.approach_id", "=", 4)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()

    if (!programPlan) return null

    // 2. Get entity info with province + regency from locations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entity = await (c.var.trx as any)
      .selectFrom("entities as e")
      .leftJoin("locations as reg", "reg.id", "e.regency_id")
      .leftJoin("locations as prov", "prov.id", "e.province_id")
      .select([
        "e.id as entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
        "reg.id as regency_id",
        "reg.name as regency_name",
        "prov.id as province_id",
        "prov.name as province_name",
      ])
      .where("e.id", "=", entityId)
      .where("e.deleted_at", "is", null)
      .executeTakeFirst()

    if (!entity) return null

    // 3. Get all examinations+target-groups for the program plan year
    const examinations = await this.getExaminationsByProgramPlan(
      c,
      programPlanId
    )

    if (examinations.length === 0) {
      return { programPlan, entity, examinations, planningData: [] }
    }

    const fetchedExaminationIds = examinations.map((e: any) => e.id)

    // 4. Get existing planning data for this specific entity
    const planningData: any = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .leftJoin(
        "ws_bmhp_planning_target_groups as wptg",
        "wptg.planning_id",
        "wp.id"
      )
      .select([
        "wp.id as planning_id",
        "wp.examination_id",
        "wptg.id as target_group_planning_id",
        "wptg.target_group_id",
        "wptg.sample_count",
        "wptg.test_count",
        "wptg.original_target",
        "wptg.verification_status",
      ])
      .where("wp.entity_id", "=", entityId)
      .where("wap.program_plan_id", "=", programPlanId)
      .where("wp.examination_id", "in", fetchedExaminationIds)
      .where("wp.deleted_at", "is", null)
      .where((eb: any) =>
        eb.or([eb("wptg.deleted_at", "is", null), eb("wptg.id", "is", null)])
      )
      .execute()

    return { programPlan, entity, examinations, planningData }
  }

  /**
   * Upsert adjustment targets for a specific entity.
   * Only test_count (adjustment_target) is written — sample_count (target) is never touched.
   */
  async upsertTargetInput(
    c: Context,
    data: {
      programPlanId: number
      entityId: number
      year: number
      targetInput: Array<{
        id: number | null
        examination_id: number
        target_id: number | null
        target: number
      }>
    }
  ) {
    let updatedCount = 0

    // Use the logged-in user's entity (kabupaten/dinas) as the approval period owner
    // NOT the regency_id of the puskesmas entity.
    // Must use userEntity.global_id (references entities.id) — NOT c.var.entityId
    // which is ws_entities.id and would violate the ws_bmhp_ap_entity_fk FK constraint.
    const kabupatenEntityId = Number((c.var as any).userEntity?.global_id)

    const approvalPeriodId = await this.getOrCreateApprovalPeriod(
      c,
      kabupatenEntityId,
      data.programPlanId
    )

    // Group items by examination_id so we can ensure one planning row per examination
    const byExamination = data.targetInput.reduce(
      (acc, item) => {
        acc[item.examination_id] ??= []
        acc[item.examination_id]!.push(item)
        return acc
      },
      {} as Record<number, typeof data.targetInput>
    )

    for (const [examinationIdStr, items] of Object.entries(byExamination)) {
      const examinationId = Number(examinationIdStr)

      // Check if planning already exists AND has no target_groups (NA state)
      // Only preserve NA if planning existed BEFORE this request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingPlanning = await (c.var.trx as any)
        .selectFrom("ws_bmhp_planning as wp")
        .innerJoin(
          "ws_bmhp_approval_periods as wap",
          "wap.id",
          "wp.approval_period_id"
        )
        .select("wp.id")
        .where("wp.entity_id", "=", data.entityId)
        .where("wap.program_plan_id", "=", data.programPlanId)
        .where("wp.examination_id", "=", examinationId)
        .where("wp.deleted_at", "is", null)
        .executeTakeFirst()

      let isCurrentlyNA = false
      if (existingPlanning) {
        // Planning exists, check if it has any target_groups
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasTargetGroups = await (c.var.trx as any)
          .selectFrom("ws_bmhp_planning_target_groups")
          .select("id")
          .where("planning_id", "=", existingPlanning.id)
          .where("deleted_at", "is", null)
          .executeTakeFirst()
        isCurrentlyNA = !hasTargetGroups
      }

      // Ensure ws_bmhp_planning exists for this entity+approval_period_id+examination
      const planningResult = await this.upsertPlanning(c, {
        entity_id: data.entityId,
        approval_period_id: approvalPeriodId,
        examination_id: examinationId,
        status: "DRAFT",
      })
      const planningId = Number(planningResult.id)

      for (const item of items) {
        await this._upsertTargetGroupItem(c, planningId, item, isCurrentlyNA)
        updatedCount++
      }
    }

    return updatedCount
  }

  private async _upsertTargetGroupItem(
    c: Context,
    planningId: number,
    item: { id: number | null; target_id: number | null; target: number },
    isCurrentlyNA: boolean = false
  ) {
    // Resolve id: use the one provided, otherwise query DB
    let resolvedId = item.id
    if (resolvedId === null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let existingQuery = (c.var.trx as any)
        .selectFrom("ws_bmhp_planning_target_groups")
        .select("id")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where("planning_id" as any, "=", planningId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where("deleted_at" as any, "is", null)
      // Use IS NULL for Bukan Skrining (target_id=null), otherwise use = value
      existingQuery =
        item.target_id === null
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existingQuery.where("target_group_id" as any, "is", null)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existingQuery.where("target_group_id" as any, "=", item.target_id)
      const existing = await existingQuery.executeTakeFirst()
      if (existing) resolvedId = Number(existing.id)
    }

    if (resolvedId === null) {
      // Insert new record — test_count=0 (adjustment is set separately)
      // target_group_id can be null for Bukan Skrining examinations
      // If planning was NA (no target groups), preserve that by setting verification_status=1
      const verificationStatus = isCurrentlyNA ? 1 : 0
      await c.var.trx
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insertInto("ws_bmhp_planning_target_groups" as any)
        .values({
          planning_id: planningId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          target_group_id: item.target_id as any,
          sample_count: 0,
          original_target: item.target,
          test_count: 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verification_status: verificationStatus as any,
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .execute()
    } else {
      // Update existing record — only write target (original_target),
      // leave sample_count untouched (preserve puskesmas original)
      await c.var.trx
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .updateTable("ws_bmhp_planning_target_groups" as any)
        .set({
          original_target: item.target,
          updated_by: c.var.userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updated_at: new Date() as any,
        })
        .where("id", "=", resolvedId)
        .execute()
    }
  }

  /**
   * Helper to handle the actual UPSERT logic for target input items per examination
   */
  private async _handleTargetInputItems(
    c: Context,
    planningId: number,
    items: Array<{
      id: number | null
      examination_id: number
      target_id: number | null
      target: number
    }>
  ): Promise<number> {
    let count = 0
    for (const item of items) {
      if (item.target_id === null) continue // Skip inserting target groups for Bukan Skrining

      if (item.id === null) {
        // Insert new record — test_count=0 (adjustment is set separately)
        await c.var.trx
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insertInto("ws_bmhp_planning_target_groups" as any)
          .values({
            planning_id: planningId,
            target_group_id: item.target_id,
            sample_count: item.target,
            test_count: 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            verification_status: 0 as any,
            created_by: c.var.userId,
            updated_by: c.var.userId,
          })
          .execute()
      } else {
        // Update existing record — only write target (sample_count)
        await c.var.trx
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .updateTable("ws_bmhp_planning_target_groups" as any)
          .set({
            sample_count: item.target,
            updated_by: c.var.userId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updated_at: new Date() as any,
          })
          .where("id", "=", item.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .where("planning_id" as any, "=", planningId)
          .execute()
      }
      count++
    }
    return count
  }

  /**
   * Update All Verification Status for a specific entity.
   * Used when approving/rejecting all target groups at once in the drawer.
   */
  async bulkUpdateVerificationStatus(
    c: Context,
    data: {
      programPlanId: number
      status: number
      entityId: number
    }
  ) {
    const { programPlanId, status, entityId } = data

    // update status ws_bmhp_planning_target_groups.verification_status, but skip rows with verification_status=0 (not submitted)
    await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .updateTable("ws_bmhp_planning_target_groups" as any)
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verification_status: status as any,
        updated_by: c.var.userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updated_at: new Date() as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verified_by: c.var.userId as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verified_at: new Date() as any,
      })
      .where("planning_id", "in", (qb: any) =>
        qb
          .selectFrom("ws_bmhp_planning as wp")
          .innerJoin(
            "ws_bmhp_approval_periods as wap",
            "wap.id",
            "wp.approval_period_id"
          )
          .select("wp.id")
          .where("wap.program_plan_id", "=", programPlanId)
          .where("wap.entity_id", "=", entityId)
      )
      .where("verification_status", "!=", 0)
      .execute()

    // update ws_bmhp_planning updated_by and updated_at
    await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .updateTable("ws_bmhp_planning" as any)
      .set({
        updated_by: c.var.userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updated_at: new Date() as any,
      })
      .where("approval_period_id", "in", (qb: any) =>
        qb
          .selectFrom("ws_bmhp_approval_periods as wap")
          .select("wap.id")
          .where("wap.program_plan_id", "=", programPlanId)
          .where("wap.entity_id", "=", entityId)
      )
      .execute()
  }

  /**
   * Update verification status for a specific target group item.
   * Used when approving/rejecting a single target group in the drawer.
   *
   * Flow:
   *   1. Find or create the approval period (kabupaten level)
   *   2. Find existing planning (ws_bmhp_planning) — do NOT change its status yet
   *   3. Check if ws_bmhp_planning_target_groups has NO rows linked to this planning
   *      → YES (no target groups): set ws_bmhp_planning.status = 'REVISION'
   *                                insert new ws_bmhp_planning_target_groups row with verification_status = 2
   *      → NO (has target groups): upsert the specific (planning_id, target_group_id) row
   *                                with the provided verification_status (no status change on planning)
   */
  async updateVerificationStatus(
    c: Context,
    data: {
      programPlanId: number
      targetGroupId: number
      materialId: number
      entityId: number
      status: number
    }
  ) {
    const { programPlanId, targetGroupId, materialId, entityId, status } = data

    // Step 1: Find or create approval period using the logged-in kabupaten entity's global_id
    const kabupatenGlobalId = Number(c.var.userEntity.global_id)
    const approvalPeriodId = await this.getOrCreateApprovalPeriod(
      c,
      kabupatenGlobalId,
      programPlanId
    )

    // Step 2: Find the existing planning row — do NOT upsert/change status here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planning = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning")
      .select("id")
      .where("entity_id", "=", entityId)
      .where("approval_period_id", "=", approvalPeriodId)
      .where("examination_id", "=", materialId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    // If the planning row doesn't exist yet, create it (status stays as-is, not forced to REVISION)
    let planningId: number
    if (planning) {
      planningId = Number(planning.id)
    } else {
      const inserted = await this.upsertPlanning(c, {
        entity_id: entityId,
        approval_period_id: approvalPeriodId,
        examination_id: materialId,
        status: "DRAFT",
      })
      planningId = Number(inserted.id)
    }

    // Step 3a: Check if planning has any active target groups (for not-applicable case)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyActiveTargetGroup = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups")
      .select("id")
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    // Step 3b: Check for specific active (planning_id, target_group_id) row
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingTargetGroup = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups")
      .select("id")
      .where("planning_id", "=", planningId)
      .where("target_group_id", "=", targetGroupId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    let targetGroupResultId: number

    if (!anyActiveTargetGroup) {
      // Planning has NO active target groups → not-applicable case
      // Set planning.status = 'REVISION', use verification_status = 2
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (c.var.trx as any)
        .updateTable("ws_bmhp_planning")
        .set({
          status: "REVISION",
          updated_by: c.var.userId,
          updated_at: new Date(),
        })
        .where("id", "=", planningId)
        .execute()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inserted = await (c.var.trx as any)
        .insertInto("ws_bmhp_planning_target_groups")
        .values({
          planning_id: planningId,
          target_group_id: targetGroupId,
          sample_count: 0,
          test_count: 0,
          verification_status: 2,
          verified_by: c.var.userId,
          verified_at: new Date(),
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .executeTakeFirstOrThrow()

      targetGroupResultId = Number(inserted.insertId)
    } else if (existingTargetGroup) {
      // Planning has target groups and the specific one exists → update it
      // Capture pre-update planning state to detect not_applicable cascade
      const wasNotApplicable = await this.isPlanningNotApplicable(c, planningId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (c.var.trx as any)
        .updateTable("ws_bmhp_planning_target_groups")
        .set({
          verification_status: status,
          verified_by: c.var.userId,
          verified_at: new Date(),
          updated_by: c.var.userId,
          updated_at: new Date(),
        })
        .where("id", "=", Number(existingTargetGroup.id))
        .execute()

      if (wasNotApplicable) {
        await this.cascadeVerificationStatusToAllTargetGroups(
          c,
          planningId,
          status
        )
      }

      targetGroupResultId = Number(existingTargetGroup.id)
    } else {
      // Planning has other target groups but NOT this specific one → insert it
      const wasNotApplicable = await this.isPlanningNotApplicable(c, planningId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inserted = await (c.var.trx as any)
        .insertInto("ws_bmhp_planning_target_groups")
        .values({
          planning_id: planningId,
          target_group_id: targetGroupId,
          sample_count: 0,
          test_count: 0,
          verification_status: status,
          verified_by: c.var.userId,
          verified_at: new Date(),
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .executeTakeFirstOrThrow()

      if (wasNotApplicable) {
        await this.cascadeVerificationStatusToAllTargetGroups(
          c,
          planningId,
          status
        )
      }

      targetGroupResultId = Number(inserted.insertId)
    }

    // Always update planning's updated_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (c.var.trx as any)
      .updateTable("ws_bmhp_planning")
      .set({
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", planningId)
      .execute()

    return { id: targetGroupResultId }
  }

  /**
   * Update the approval_status of a program plan
   */
  async updateProgramPlanApprovalStatus(
    c: Context,
    programPlanId: number,
    status: number,
    regencyId: number,
    requireSignature: boolean = true
  ) {
    const userId = c.var.userId

    let approvalSignatureId: number | null = null

    if (requireSignature) {
      // Validate KAKO user has a signature
      const userSignature = await (c.var.trx as any)
        .selectFrom("bmhp_approval_signatures")
        .select("id")
        .where("user_id", "=", userId)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      if (!userSignature) {
        throw new BadRequestError(
          "Anda belum memiliki tanda tangan. Silakan input tanda tangan terlebih dahulu."
        )
      }

      approvalSignatureId = Number(userSignature.id)
    }

    const existing = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods")
      .select("id")
      .where("program_plan_id", "=", programPlanId)
      .where("entity_id", "=", regencyId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (existing) {
      const updateSet: Record<string, unknown> = {
        status: status,
        updated_by: userId,
        updated_at: new Date(),
      }
      if (approvalSignatureId !== null) {
        updateSet.approval_signature_id = approvalSignatureId
      }
      await (c.var.trx as any)
        .updateTable("ws_bmhp_approval_periods")
        .set(updateSet)
        .where("id", "=", Number(existing.id))
        .execute()
    } else {
      await (c.var.trx as any)
        .insertInto("ws_bmhp_approval_periods")
        .values({
          program_plan_id: programPlanId,
          entity_id: regencyId,
          status: status,
          approval_signature_id: approvalSignatureId,
          current_step: 1,
          ...(remainingStockDate !== undefined && {
            remaining_stock_date: remainingStockDate,
          }),
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute()
    }

    // If status = 2 (revision), also update NA plannings to REVISION
    if (status === 2) {
      await this.updateNAPlanningsToRevision(c, programPlanId)
    }
  }

  /**
   * Update NA plannings (no target_groups OR test_count=0 AND verification_status in [1,2]) to REVISION
   */
  private async updateNAPlanningsToRevision(
    c: Context,
    programPlanId: number
  ) {
    // Find all plannings linked to this program plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const naPlannings = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .leftJoin(
        "ws_bmhp_planning_target_groups as wptg",
        (join: any) =>
          join
            .onRef("wptg.planning_id", "=", "wp.id")
            .on("wptg.deleted_at", "is", null)
      )
      .select("wp.id")
      .where("wap.program_plan_id", "=", programPlanId)
      .where("wp.deleted_at", "is", null)
      .where((eb: any) =>
        eb.or([
          // Case 1: no target_groups at all
          eb("wptg.id", "is", null),
          // Case 2: target_group exists with test_count=0 AND verification_status in [1,2]
          eb.and([
            eb("wptg.test_count", "=", 0),
            eb("wptg.verification_status", "in", [1, 2]),
          ]),
        ])
      )
      .distinct()
      .execute()

    if (naPlannings.length === 0) return

    // Update these plannings to REVISION status
    const planningIds = naPlannings.map((p: any) => Number(p.id))
    await (c.var.trx as any)
      .updateTable("ws_bmhp_planning")
      .set({
        status: "REVISION",
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "in", planningIds)
      .execute()
  }

  /**
   * Check whether a planning currently qualifies as "not_applicable":
   * has at least one target group AND all target groups have
   * verification_status IN (1, 2) AND test_count = 0.
   */
  async isPlanningNotApplicable(
    c: Context,
    planningId: number
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups")
      .select((eb: any) => eb.fn.count("id").as("count"))
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    const totalCount = Number(total?.count ?? 0)
    if (totalCount === 0) return false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const disqualifying = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups")
      .select((eb: any) => eb.fn.count("id").as("count"))
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .where((eb: any) =>
        eb.or([
          eb("verification_status", "not in", [1, 2]),
          eb("test_count", "!=", 0),
        ])
      )
      .executeTakeFirst()

    return Number(disqualifying?.count ?? 0) === 0
  }

  /**
   * Set verification_status to the given value for ALL target groups in the planning.
   */
  async cascadeVerificationStatusToAllTargetGroups(
    c: Context,
    planningId: number,
    status: number
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (c.var.trx as any)
      .updateTable("ws_bmhp_planning_target_groups")
      .set({
        verification_status: status,
        verified_by: c.var.userId,
        verified_at: new Date(),
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("planning_id", "=", planningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  /**
   * Set ws_bmhp_planning.status = 'REVISION' for plannings under the given
   * program_plan_id whose current state is "not_applicable":
   * - Has at least one target group
   * - All target groups: verification_status IN (1, 2) AND test_count = 0
   */
  async markNotApplicablePlanningsAsRevision(
    c: Context,
    programPlanId: number
  ) {
    await sql`
      UPDATE ws_bmhp_planning wp
      INNER JOIN ws_bmhp_approval_periods wap
        ON wap.id = wp.approval_period_id
        AND wap.deleted_at IS NULL
      SET
        wp.status = 'REVISION',
        wp.updated_by = ${c.var.userId},
        wp.updated_at = NOW()
      WHERE wp.deleted_at IS NULL
        AND wap.program_plan_id = ${programPlanId}
        AND EXISTS (
          SELECT 1 FROM ws_bmhp_planning_target_groups wptg
          WHERE wptg.planning_id = wp.id AND wptg.deleted_at IS NULL
        )
        AND NOT EXISTS (
          SELECT 1 FROM ws_bmhp_planning_target_groups wptg
          WHERE wptg.planning_id = wp.id
            AND wptg.deleted_at IS NULL
            AND (wptg.verification_status NOT IN (1, 2) OR wptg.test_count != 0)
        )
    `.execute(c.var.trx as any)
  }

  async findRegencyIdByEntityIdSatuSehat(c: Context, entityId: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (c.var.trx as any)
      .selectFrom("entities")
      .select("regency_id")
      .where("id", "=", entityId)
      .where("id_satu_sehat", "is not", null)
      .executeTakeFirst()
    return result?.regency_id ? Number(result.regency_id) : undefined
  }

  async findPlanningTargetGroupIdByIdAndPlanning(
    c: Context,
    id: number,
    planningId: number
  ): Promise<number | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingRecord = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups" as any)
      .select("id")
      .where("id" as any, "=", id)
      .where("planning_id" as any, "=", planningId)
      .where("deleted_at" as any, "is", null)
      .executeTakeFirst()
    return existingRecord?.id ? Number(existingRecord.id) : undefined
  }

  /**
   * Get entity information by ID
   */
  async getEntityInfo(c: Context, entityId: number) {
    return await c.var.trx
      .selectFrom("entities")
      .select(["id", "name", "entity_tag_id", "regency_id"])
      .where("id", "=", entityId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  /**
   * Find kabupaten entity by regency_id (entity_tag_id = 7)
   */
  async getKabupatenByRegencyId(c: Context, regencyId: string) {
    return await c.var.trx
      .selectFrom("entities")
      .select(["id", "name"])
      .where("regency_id", "=", regencyId)
      .where("entity_tag_id", "=", 7)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  /**
   * Get the puskesmas entity_id associated with a program_plan_id.
   * This queries ws_bmhp_approval_periods to find entities linked to the program plan.
   * Returns the first entity_id found (used for notification targeting).
   */
  async getEntityIdByProgramPlan(
    c: Context,
    programPlanId: number
  ): Promise<number | null> {
    const result = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods")
      .select("entity_id")
      .where("program_plan_id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result?.entity_id ? Number(result.entity_id) : null
  }

  /**
   * Log BMHP revision notification to database.
   * Saves record to ws_bmhp_revision_notifications table.
   */
  async saveRevisionNotificationLog(
    c: Context,
    data: {
      user_id: number
      program_plan_id: number
      notification_type: string
      message: string
      status: string
    }
  ): Promise<void> {
    await c.var.trx
      .insertInto("ws_bmhp_revision_notifications" as any)
      .values({
        user_id: data.user_id,
        program_plan_id: data.program_plan_id,
        notification_type: data.notification_type,
        message: data.message,
        status: data.status,
        created_at: new Date(),
      })
      .execute()
  }

  /**
   * Get ministry recapitulation - material-level aggregated data for a specific entity
   * Used for GET /bmhp-approval/ministry-recapitulation
   *
   * Returns material-level aggregated data with:
   * - material_id, name, unit
   * - total_kebutuhan: SUM of lab_usage from ws_bmhp_planning_materials
   * - sisa_stok: stock_on_hand from ws_bmhp_stock_recaps
   * - usulan_pengadaan: calculated as MAX(0, total_kebutuhan - sisa_stok)
   * - proposal_buffer: usulan_pengadaan * 1.1 (10% buffer)
   * - hasil_desk: SUM of test_count from ws_bmhp_planning_target_groups
   */
  async getMinistryRecapitulationDetail(
    c: Context,
    params: { programPlanId: number; entityId?: number; provinceId?: number }
  ) {
    const { programPlanId, entityId, provinceId } = params

    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods as wap")
      .innerJoin("ws_program_plans as pp", "pp.id", "wap.program_plan_id")
      .innerJoin("entities as e", "e.id", "wap.entity_id")
      .leftJoin("locations as reg", "reg.id", "e.regency_id")
      .leftJoin("locations as prov", "prov.id", "e.province_id")
      .select([
        "prov.name as province_name",
        "reg.name as regency_name",
        "pp.year as year",
        "wap.remaining_stock_date",
      ])
      .where("wap.program_plan_id", "=", programPlanId)
      .where("wap.deleted_at", "is", null)

    if (provinceId) {
      query = query.where("e.province_id", "=", provinceId)
    } else if (entityId) {
      query = query.where("wap.entity_id", "=", entityId)
    }

    const row = await query.executeTakeFirst()

    if (!row) {
      if (provinceId) {
        const fallback = await (c.var.trx as any)
          .selectFrom("locations as prov")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .leftJoin("ws_program_plans as pp", (join: any) =>
            join.on("pp.id", "=", (eb: any) => eb.val(programPlanId))
          )
          .select(["prov.name as province_name", "pp.year as year"])
          .where("prov.id", "=", provinceId)
          .executeTakeFirst()

        return {
          province_name: fallback?.province_name ?? null,
          regency_name: null,
          year: fallback?.year ?? null,
          remaining_stock_date: null,
        }
      }

      const fallback = await (c.var.trx as any)
        .selectFrom("entities as e")
        .leftJoin("locations as reg", "reg.id", "e.regency_id")
        .leftJoin("locations as prov", "prov.id", "e.province_id")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .leftJoin("ws_program_plans as pp", (join: any) =>
          join.on("pp.id", "=", (eb: any) => eb.val(programPlanId))
        )
        .select([
          "prov.name as province_name",
          "reg.name as regency_name",
          "pp.year as year",
        ])
        .where("e.id", "=", entityId)
        .where("e.deleted_at", "is", null)
        .executeTakeFirst()

      return {
        province_name: fallback?.province_name ?? null,
        regency_name: fallback?.regency_name ?? null,
        year: fallback?.year ?? null,
        remaining_stock_date: null,
      }
    }

    return {
      province_name: row.province_name ?? null,
      regency_name: row.regency_name ?? null,
      year: row.year ?? null,
      remaining_stock_date: row.remaining_stock_date ?? null,
    }
  }

  async getMinistryRecapitulationByEntity(
    c: Context,
    params: {
      programPlanId: number
      entityId: number
      page?: number
      itemPerPage?: number
    }
  ) {
    const { programPlanId, entityId, page, itemPerPage } = params

    // Get entity info to determine regencyCode and provinceCode
    const entityInfo = await (c.var.trx as any)
      .selectFrom("entities as e")
      .select(["e.regency_id", "e.province_id"])
      .where("e.id", "=", entityId)
      .where("e.deleted_at", "is", null)
      .executeTakeFirst()

    if (!entityInfo) {
      return []
    }

    // Get the approval period ID for stock recaps
    const approvalPeriod = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods")
      .select("id")
      .where("program_plan_id", "=", programPlanId)
      .where("entity_id", "=", entityId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    const approvalPeriodId = approvalPeriod?.id

    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_material_variant as mv")
      // is_variant = 1 → material (no variant) → use ws_materials for name & unit
      .leftJoin("ws_materials as m", (join: any) =>
        join
          .onRef("m.global_id", "=", "mv.material_id")
          .on("m.deleted_at", "is", null)
      )
      // is_variant = 0 → has variant → use variant_detail for name & unit
      .leftJoin("ws_bmhp_material_variant_detail as mvd", (join: any) =>
        join
          .onRef("mvd.material_variant_id", "=", "mv.id")
          .on("mvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_cons", "mu_cons.id", "m.unit_of_consumption_id")
      // Stock recaps for remaining_stock / proposal_qty
      .leftJoin("ws_bmhp_stock_recaps as sr", (join: any) =>
        join
          .onRef("sr.material_id", "=", "mv.material_id")
          .on("sr.approval_period_id", "=", approvalPeriodId ?? sql.raw("NULL"))
          .on("sr.deleted_at", "is", null)
          .on(
            sql`CASE WHEN mv.is_variant = 0 THEN sr.variant_id = mvd.id ELSE sr.variant_id IS NULL END`
          )
      )
      .select([
        sql<number>`mv.id`.as("id"),
        sql<number>`mv.material_id`.as("material_id"),
        sql<number>`mv.is_variant`.as("is_variant"),
        sql<number>`MAX(mvd.id)`.as("variant_id"),
        // is_variant=0 → has variant: use mvd.name; is_variant=1 → material only: use m.name
        sql<string>`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`.as(
          "name"
        ),
        // always use unit_of_consumption from ws_materials
        sql<string>`COALESCE(mu_cons.name, '-')`.as("unit"),
        sql<number>`COALESCE(sr.stock_on_hand, 0)`.as("remaining_stock"),
        sql<number>`COALESCE(sr.desk_result, 0)`.as("desk_result"),
        sql<number>`COALESCE(sr.proposal_qty, 0)`.as("proposal_qty"),
        sql<number>`COALESCE(sr.buffer_qty, 0)`.as("buffer_qty"),
      ])
      .where("mv.program_plan_id", "=", programPlanId)
      .where("mv.deleted_at", "is", null)
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "!=",
        ""
      )
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "is not",
        null
      )
      .groupBy([
        "mv.id",
        "mv.material_id",
        "mv.is_variant",
        "m.name",
        "m.unit_of_consumption_id",
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        sql`COALESCE(mu_cons.name, '-')`
      ])
      .orderBy("name", "asc")

    // Apply pagination only when both page and itemPerPage are provided
    if (page !== undefined && itemPerPage !== undefined) {
      const offset = (page - 1) * itemPerPage
      query = query.limit(itemPerPage).offset(offset)
    }

    const rows = await query.execute()

    // Determine regencyCode for filtering
    const regencyCode = entityInfo.regency_id
    const provinceCode = entityInfo.province_id

    // Get material_ids for fetching total needs
    const materialIds: number[] = (rows as any[])
      .map((r): number => Number(r.material_id))
      .filter((v, i, self): boolean => self.indexOf(v) === i)

    let totalNeedsMap: Map<string, number> = new Map()

    if (materialIds.length > 0) {
      totalNeedsMap = await this.getTotalNeedsMapForMinistryRecap(
        c,
        programPlanId,
        entityId,
        regencyCode,
        provinceCode,
        materialIds
      )
    }

    return rows.map((row: any) => {
      // For variant materials (is_variant=0), look up by variant_detail id (d_ key).
      // For plain materials (is_variant=1), look up by material_template_id (t_ key).
      const totalNeeds = Number(row.is_variant) === 0 && row.variant_id
        ? (totalNeedsMap.get("d_" + row.variant_id) ?? totalNeedsMap.get("t_" + row.id) ?? 0)
        : (totalNeedsMap.get("t_" + row.id) ?? 0)

      const remainingStock = Number(row.remaining_stock)
      const deskResult = Number(row.desk_result ?? 0)

      return {
        id: Number(row.id),
        material_id: Number(row.material_id),
        variant_id: Number(row.is_variant) === 0 ? (Number(row.variant_id) || null) : null,
        name: row.name ?? "",
        unit: row.unit || "-",
        total_kebutuhan: totalNeeds,
        sisa_stok: remainingStock,
        usulan_pengadaan: Number(row.proposal_qty ?? 0),
        proposal_buffer: Number(row.buffer_qty ?? 0),
        hasil_desk: deskResult,
      }
    })
  }

  /**
   * Count total items for ministry recapitulation pagination
   */
  async countAllMinistryRecapitulation(
    c: Context,
    params: {
      programPlanId: number
      entityId: number
    }
  ): Promise<number> {
    const { programPlanId, entityId } = params

    // Get entity info to determine regencyCode and provinceCode
    const entityInfo = await (c.var.trx as any)
      .selectFrom("entities as e")
      .select(["e.regency_id", "e.province_id"])
      .where("e.id", "=", entityId)
      .where("e.deleted_at", "is", null)
      .executeTakeFirst()

    if (!entityInfo) {
      return 0
    }

    // Subquery mirroring GROUP BY from getMinistryRecapitulationByEntity
    // so the count reflects the exact number of paginated rows
    const subquery = (c.var.trx as any)
      .selectFrom("ws_bmhp_material_variant as mv")
      .leftJoin("ws_materials as m", (join: any) =>
        join
          .onRef("m.global_id", "=", "mv.material_id")
          .on("m.deleted_at", "is", null)
      )
      .leftJoin("ws_bmhp_material_variant_detail as mvd", (join: any) =>
        join
          .onRef("mvd.material_variant_id", "=", "mv.id")
          .on("mvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_cons", "mu_cons.id", "m.unit_of_consumption_id")
      .select([
        sql<number>`mv.id`.as("id"),
        sql<string>`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`.as("name"),
        sql<string>`COALESCE(mu_cons.name, '-')`.as("unit"),
      ])
      .where("mv.program_plan_id", "=", programPlanId)
      .where("mv.deleted_at", "is", null)
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "!=",
        ""
      )
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "is not",
        null
      )
      .groupBy(["mv.id", sql.raw("`name`"), sql.raw("`unit`")])

    const result = await (c.var.trx as any)
      .selectFrom(subquery.as("subq"))
      .select([sql<number>`COUNT(*)`.as("total")])
      .executeTakeFirst()

    return Number(result?.total ?? 0)
  }

  /**
   * Get total_kebutuhan (lab_usage) for a list of material_ids from ws_bmhp_planning_materials.
   * Similar to getTotalNeedsMap in procurement-recapitulation but adapted for ministry recapitulation.
   */
  async getTotalNeedsMapForMinistryRecap(
    c: Context,
    program_plan_id: number,
    entityId: number,
    regencyCode: string | null,
    provinceCode: number | null,
    materialIds: number[]
  ): Promise<Map<string, number>> {
    if (materialIds.length === 0) return new Map()
    if (!regencyCode && !provinceCode) return new Map()

    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as pm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as ptg",
        "ptg.id",
        "pm.planning_target_group_id"
      )
      .innerJoin("ws_bmhp_planning as p", "p.id", "ptg.planning_id")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        (join: any) =>
          join
            .onRef("wap.id", "=", "p.approval_period_id")
            .on("wap.program_plan_id", "=", (eb: any) => eb.val(program_plan_id))
            .on("wap.deleted_at", "is", null)
      )
      .innerJoin("entities as e", "e.id", "p.entity_id")
      .innerJoin(
        "ws_bmhp_material_variant as wbmv",
        "wbmv.id",
        "pm.material_template_id"
      )
      // planning-side variant detail → get its name
      .leftJoin("ws_bmhp_material_variant_detail as pm_mvd", (join: any) =>
        join
          .onRef("pm_mvd.id", "=", "pm.variant_id")
          .on("pm_mvd.deleted_at", "is", null)
      )
      // procurement-side variant detail → match by name under the same wbmv
      .leftJoin("ws_bmhp_material_variant_detail as r_mvd", (join: any) =>
        join
          .onRef("r_mvd.material_variant_id", "=", "wbmv.id")
          .onRef("r_mvd.name", "=", "pm_mvd.name")
          .on("r_mvd.deleted_at", "is", null)
      )
      .select([
        sql<number>`wbmv.material_id`.as("material_id"),
        sql<number>`pm.material_template_id`.as("material_template_id"),
        sql<number | null>`r_mvd.id`.as("variant_detail_id"),
        sql<number>`SUM(pm.lab_usage)`.as("total_needed"),
      ])
      .where("wbmv.material_id", "in", materialIds)
      .where("pm.deleted_at", "is", null)
      .where("ptg.deleted_at", "is", null)
      .where("p.deleted_at", "is", null)
      .where("wap.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .where("wbmv.deleted_at", "is", null)

    if (regencyCode) {
      query = query.where("e.regency_id", "=", regencyCode)
    } else {
      query = query.where("e.province_id", "=", provinceCode)
    }

    const rows = await query
      .groupBy("wbmv.material_id")
      .groupBy("pm.material_template_id")
      .groupBy("r_mvd.id")
      .execute()

    const resultMap = new Map<string, number>()
    for (const r of rows as any[]) {
      const needed = Number(r.total_needed)
      if (!needed) continue

      const key = r.variant_detail_id == null
        ? `t_${r.material_template_id}`
        : `d_${r.variant_detail_id}`
      resultMap.set(key, (resultMap.get(key) ?? 0) + needed)
    }

    return resultMap
  }

  /**
   * Get hasil_desk (test_count) for a list of material_ids from ws_bmhp_planning_target_groups.
   * Aggregates test_count from planning materials joined via planning_target_groups.
   */
  async getVerificationMapForMinistryRecap(
    c: Context,
    program_plan_id: number,
    entityId: number,
    regencyCode: string | null,
    provinceCode: number | null,
    materialIds: number[]
  ): Promise<Map<string, number>> {
    if (materialIds.length === 0) return new Map()
    if (!regencyCode && !provinceCode) return new Map()

    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as pm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as ptg",
        "ptg.id",
        "pm.planning_target_group_id"
      )
      .innerJoin("ws_bmhp_planning as p", "p.id", "ptg.planning_id")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        (join: any) =>
          join
            .onRef("wap.id", "=", "p.approval_period_id")
            .on("wap.program_plan_id", "=", (eb: any) => eb.val(program_plan_id))
            .on("wap.deleted_at", "is", null)
      )
      .innerJoin("entities as e", "e.id", "p.entity_id")
      .innerJoin(
        "ws_bmhp_material_variant as wbmv",
        "wbmv.id",
        "pm.material_template_id"
      )
      // planning-side variant detail → get its name
      .leftJoin("ws_bmhp_material_variant_detail as pm_mvd", (join: any) =>
        join
          .onRef("pm_mvd.id", "=", "pm.variant_id")
          .on("pm_mvd.deleted_at", "is", null)
      )
      // procurement-side variant detail → match by name under the same wbmv
      .leftJoin("ws_bmhp_material_variant_detail as r_mvd", (join: any) =>
        join
          .onRef("r_mvd.material_variant_id", "=", "wbmv.id")
          .onRef("r_mvd.name", "=", "pm_mvd.name")
          .on("r_mvd.deleted_at", "is", null)
      )
      .select([
        sql<number>`wbmv.material_id`.as("material_id"),
        sql<number>`pm.material_template_id`.as("material_template_id"),
        sql<number | null>`r_mvd.id`.as("variant_detail_id"),
        sql<number>`SUM(ptg.test_count)`.as("total_hasil_desk"),
      ])
      .where("wbmv.material_id", "in", materialIds)
      .where("pm.deleted_at", "is", null)
      .where("ptg.deleted_at", "is", null)
      .where("p.deleted_at", "is", null)
      .where("wap.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .where("wbmv.deleted_at", "is", null)

    if (regencyCode) {
      query = query.where("e.regency_id", "=", regencyCode)
    } else {
      query = query.where("e.province_id", "=", provinceCode)
    }

    const rows = await query
      .groupBy("wbmv.material_id")
      .groupBy("pm.material_template_id")
      .groupBy("r_mvd.id")
      .execute()

    const resultMap = new Map<string, number>()
    for (const r of rows as any[]) {
      const hasilDesk = Number(r.total_hasil_desk)
      if (!hasilDesk) continue

      const key = r.variant_detail_id == null
        ? `t_${r.material_template_id}`
        : `d_${r.variant_detail_id}`
      resultMap.set(key, (resultMap.get(key) ?? 0) + hasilDesk)
    }

    return resultMap
  }
}
