import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import { BadRequestError } from "@smile/lib/error.js"
import {
  GetApprovalListQuery,
  APPROVAL_STATUS,
  APPROVAL_STATUS_LABELS,
  GetProvinceApprovalListQuery,
} from "./bmhp-approval.schema.js"
import { ENTITY_TAG, ENTITY_TYPE } from "@/common/constants/entity.js"

export class BmhpApprovalRepository extends BaseRepository<"ws_program_plans"> {
  constructor() {
    super("ws_program_plans", false, false, true, true)
  }

  /**
   * List ws_program_plans with approach_id = 4 (BMHP approach).
   * ws_program_plans is the parent table for BMHP approval.
   */
  async findApprovalProgramPlanList(
    c: Context,
    params: GetApprovalListQuery,
    programId: number
  ) {
    const { page, paginate, program_plan_id, keyword, regency_id } = params
    const offset = (page - 1) * paginate
    // Scope the approval period lookup to the caller's own entity to prevent
    // duplicate rows (one period exists per regency entity).
    // Priority: regency_id from params > logged-in user's entity_id
    const userEntityId = Number(regency_id ?? c.var.userEntity.global_id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .leftJoin("ws_users as wsu_created", "wsu_created.id", "wpp.created_by")
      .leftJoin("ws_users as wsu_updated", "wsu_updated.id", "wpp.updated_by")
      .leftJoin("ws_bmhp_approval_periods as wbap", (join: any) =>
        join
          .onRef("wbap.program_plan_id", "=", "wpp.id")
          .on("wbap.entity_id", "=", userEntityId)
          .on("wbap.deleted_at", "is", null)
      )
      .where("wpp.deleted_at", "is", null)
      .where("wpp.approach_id", "=", 4)
      .where("wpp.program_id", "=", programId)
      .where("wpp.status", "=", 1)
      .where((eb: any) =>
        eb.exists(
          eb
            .selectFrom("bmhp_examinations")
            .select("id")
            .whereRef("program_plan_id", "=", "wpp.id")
            .where("deleted_at", "is", null)
        )
      )

    if (program_plan_id) {
      query = query.where("wpp.id", "=", program_plan_id)
    }

    if (keyword) {
      query = query.where("wpp.name", "like", `%${keyword}%`)
    }

    const [list, totalResult] = await Promise.all([
      query
        .select([
          "wpp.id",
          "wpp.year",
          "wbap.status as approval_status",
          "wpp.program_id",
          "wpp.updated_at",
          "wsu_created.id as id_created",
          "wsu_created.username as username_created",
          "wsu_created.firstname as firstname_created",
          "wsu_created.lastname as lastname_created",
          "wsu_updated.id as id_updated",
          "wsu_updated.username as username_updated",
          "wsu_updated.firstname as firstname_updated",
          "wsu_updated.lastname as lastname_updated",
        ])
        .orderBy("wpp.year", "asc")
        .limit(paginate)
        .offset(offset)
        .execute(),

      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = list.map((row: any) => ({
      id: row.id,
      year: row.year,
      approval_status: row.approval_status ?? APPROVAL_STATUS.ONDESK,
      status:
        APPROVAL_STATUS_LABELS[row.approval_status ?? APPROVAL_STATUS.ONDESK],
      notes: row.notes ?? null,
      program_id: row.program_id,
      updated_at: row.updated_at,
      user_created_by: row.id_created
        ? {
            id: row.id_created,
            username: row.username_created,
            firstname: row.firstname_created,
            lastname: row.lastname_created,
          }
        : null,
      user_updated_by: row.id_updated
        ? {
            id: row.id_updated,
            username: row.username_updated,
            firstname: row.firstname_updated,
            lastname: row.lastname_updated,
          }
        : null,
    }))

    return { list: mapped, total: Number(totalResult?.total) || 0 }
  }

  /**
   * Find a single ws_program_plans record by id with related user info.
   */
  async findApprovalProgramPlanById(
    c: Context,
    programPlanId: number,
    programId: number
  ) {
    const userEntityId = Number((c.var as any).userEntity?.global_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .leftJoin("ws_users as wsu_created", "wsu_created.id", "wpp.created_by")
      .leftJoin("ws_users as wsu_updated", "wsu_updated.id", "wpp.updated_by")
      .leftJoin("ws_bmhp_approval_periods as wbap", (join: any) =>
        join
          .onRef("wbap.program_plan_id", "=", "wpp.id")
          .on("wbap.entity_id", "=", userEntityId)
          .on("wbap.deleted_at", "is", null)
      )
      .where("wpp.deleted_at", "is", null)
      .where("wpp.id", "=", programPlanId)
      .where("wpp.program_id", "=", programId)
      .where("wpp.approach_id", "=", 4)
      .select([
        "wpp.id",
        "wpp.year",
        "wbap.status as approval_status",
        "wpp.program_id",
        "wpp.created_at",
        "wpp.updated_at",
        "wsu_created.id as id_created",
        "wsu_created.username as username_created",
        "wsu_created.firstname as firstname_created",
        "wsu_created.lastname as lastname_created",
        "wsu_updated.id as id_updated",
        "wsu_updated.username as username_updated",
        "wsu_updated.firstname as firstname_updated",
        "wsu_updated.lastname as lastname_updated",
      ])
      .executeTakeFirst()

    if (!row) return null

    return {
      id: row.id,
      year: row.year,
      approval_status: row.approval_status ?? APPROVAL_STATUS.ONDESK,
      status:
        APPROVAL_STATUS_LABELS[row.approval_status ?? APPROVAL_STATUS.ONDESK],
      notes: row.notes ?? null,
      program_id: row.program_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_created_by: row.id_created
        ? {
            id: row.id_created,
            username: row.username_created,
            firstname: row.firstname_created,
            lastname: row.lastname_created,
          }
        : null,
      user_updated_by: row.id_updated
        ? {
            id: row.id_updated,
            username: row.username_updated,
            firstname: row.firstname_updated,
            lastname: row.lastname_updated,
          }
        : null,
    }
  }

  /**
   * Update ws_program_plans.approval_status to REVISION (2) and set notes.
   * If an entity_id is provided as a parent (e.g. dinkes kabupaten), also update
   * all ws_bmhp_planning records for entities under that parent.
   */
  async reviewProgramPlan(c: Context, programPlanId: number, notes?: string) {
    // Update ws_bmhp_approval_periods status to REVISION
    await (c.var.trx as any)
      .updateTable("ws_bmhp_approval_periods")
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: APPROVAL_STATUS.REVISION as any,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("program_plan_id", "=", programPlanId)
      .execute()

    // Update ws_program_plans notes
    await (c.var.trx as any)
      .updateTable("ws_program_plans")
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notes: (notes ?? null) as any,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", programPlanId)
      .execute()

    // Also mark all ws_bmhp_planning records linked to this program plan as REVISION
    await (c.var.trx as any)
      .updateTable("ws_bmhp_planning as wp")
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "REVISION" as any,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("wp.approval_period_id", "in", (eb: any) =>
        eb
          .selectFrom("ws_bmhp_approval_periods")
          .select("id")
          .where("program_plan_id", "=", programPlanId)
      )
      .where("wp.deleted_at", "is", null)
      .execute()

    return { program_plan_id: programPlanId }
  }

  /**
   * List city health offices under a province and their approval status.
   */
  async findProvinceApprovalList(
    c: Context,
    params: GetProvinceApprovalListQuery,
    userProvinceId: string
  ) {
    const { page, paginate, program_plan_id, keyword, province_id } = params
    const offset = (page - 1) * paginate

    // Use province_id from params if provided, otherwise use user's province_id
    const filterProvinceId = province_id ? String(province_id) : userProvinceId

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (c.var.trx as any)
      .selectFrom("entities as e")
      .where("e.type", "=", ENTITY_TYPE.KOTA)
      .where("e.entity_tag_id", "=", ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE) // City District Health Office
      .where("e.deleted_at", "is", null)
      .leftJoin("ws_bmhp_approval_periods as wap", (join: any) =>
        join
          .onRef("wap.entity_id", "=", "e.id")
          .on("wap.program_plan_id", "=", (eb: any) =>
            eb.val(Number(program_plan_id))
          )
          .on("wap.deleted_at", "is", null)
      )
      .leftJoin("ws_users as wsu", "wsu.id", "wap.updated_by")
      .where("e.province_id", "=", filterProvinceId)
      .where("e.deleted_at", "is", null)

    if (keyword) {
      query = query.where("e.name", "like", `%${keyword}%`)
    }

    const [list, totalResult, ministrySubmission, allReviewedResult] = await Promise.all([
      query
        .select([
          "e.id as entity_id",
          "e.name as regency_name",
          "wap.id as approval_period_id",
          "wap.status as approval_status",
          "wap.updated_at",
          "wsu.firstname as firstname_updated",
          "wsu.lastname as lastname_updated",
        ])
        .orderBy("e.name", "asc")
        .limit(paginate)
        .offset(offset)
        .execute(),

      query
        .select((eb: any) => eb.fn.countAll().as("total"))
        .select(
          sql<number>`SUM(CASE WHEN wap.status IN (1, 3) THEN 1 ELSE 0 END)`.as(
            "submitted"
          )
        )
        .select(
          sql<number>`SUM(CASE WHEN wap.status IS NULL OR wap.status IN (0, 2) THEN 1 ELSE 0 END)`.as(
            "not_submitted"
          )
        )
        .select(
          sql<number>`SUM(CASE WHEN wap.status = 3 THEN 1 ELSE 0 END)`.as(
            "reviewed"
          )
        )
        .executeTakeFirst(),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c.var.trx as any)
        .selectFrom("ws_bmhp_approval_period_province as app")
        .innerJoin("entities as e2", (join: any) =>
          join
            .onRef("e2.id", "=", "app.entity_id")
            .on("e2.province_id", "=", userProvinceId)
            .on("e2.entity_tag_id", "=", ENTITY_TAG.PROVINCE_HEALTH_OFFICE)
            .on("e2.deleted_at", "is", null)
        )
        .select("app.status")
        .where("app.program_plan_id", "=", Number(program_plan_id))
        .where("app.deleted_at", "is", null)
        .where("app.status", "!=", 0)
        .executeTakeFirst(),

      // Unfiltered check: all regencies under this province have approval_status = 3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c.var.trx as any)
        .selectFrom("entities as e_all")
        .where("e_all.type", "=", ENTITY_TYPE.KOTA)
        .where("e_all.entity_tag_id", "=", ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE)
        .where("e_all.province_id", "=", userProvinceId)
        .where("e_all.deleted_at", "is", null)
        .leftJoin("ws_bmhp_approval_periods as wap_all", (join: any) =>
          join
            .onRef("wap_all.entity_id", "=", "e_all.id")
            .on("wap_all.program_plan_id", "=", (eb: any) => eb.val(Number(program_plan_id)))
            .on("wap_all.deleted_at", "is", null)
        )
        .select((eb: any) => [
          eb.fn.count("e_all.id").as("total"),
          sql<number>`SUM(CASE WHEN wap_all.status = 3 THEN 1 ELSE 0 END)`.as("all_reviewed"),
        ])
        .executeTakeFirst(),
    ])

    // Get approval period IDs from the list
    const approvalPeriodIds = list
      .map((row: any) => row.approval_period_id)
      .filter((id: number | null) => id != null)

    // Check desk results for each approval period
    let deskResultMap: Map<number, { has_desk_result: number; approver_kemkes: number }> = new Map()
    if (approvalPeriodIds.length > 0) {
      const deskResults = await (c.var.trx as any)
        .selectFrom("ws_bmhp_desk_results as wdr")
        .select("wdr.approval_period_id")
        .where("wdr.approval_period_id", "in", approvalPeriodIds)
        .where("wdr.deleted_at", "is", null)
        .execute()

      // Initialize all with 0
      for (const id of approvalPeriodIds) {
        deskResultMap.set(id, { has_desk_result: 0, approver_kemkes: 0 })
      }

      // Set to 1 if has desk result
      for (const dr of deskResults as any[]) {
        deskResultMap.set(Number(dr.approval_period_id), { has_desk_result: 1, approver_kemkes: 1 })
      }
    }

    const mapped = list.map((row: any, index: number) => {
      const approvalStatus = row.approval_status ?? 0
      let reportStatus = "Not Submitted"
      let reviewStatus = "Not Yet Reviewed"
      let action = "Awaiting Submission"

      // Province Status Mapping:
      // 0 = Not Submitted
      // 1 = Submitted, Not Yet Reviewed
      // 2 = Not Submitted
      // 3 = Submitted, Reviewed
      if (approvalStatus === 1) {
        reportStatus = "Submitted"
        action = "Mark Reviewed"
      } else if (approvalStatus === 3) {
        reportStatus = "Submitted"
        reviewStatus = "Reviewed"
        action = "Change Status"
      }

      // Check if this regency has desk result
      const deskResultInfo = row.approval_period_id
        ? (deskResultMap.get(Number(row.approval_period_id)) ?? { has_desk_result: 0, approver_kemkes: 0 })
        : { has_desk_result: 0, approver_kemkes: 0 }

      // status_kemenkes logic:
      // - approval_status = 0 → 2 (Not Submitted)
      // - approval_status = 3 AND approver_kemkes = 0 → 0 (Approved by province, not yet by Kemkes)
      // - approval_status = 3 AND approver_kemkes = 1 → 3 (Approved by both)
      let status_kemenkes = 0
      if (approvalStatus === 0) {
        status_kemenkes = 2
      } else if (approvalStatus === 3 && deskResultInfo.approver_kemkes === 1) {
        status_kemenkes = 3
      }

      return {
        no: offset + index + 1,
        entity_id: row.entity_id,
        regency_name: row.regency_name,
        program_plan_id: Number(program_plan_id),
        report_status: reportStatus,
        review_status: reviewStatus,
        updated_at: row.updated_at,
        updated_by: row.firstname_updated
          ? `${row.firstname_updated} ${row.lastname_updated ?? ""}`.trim()
          : null,
        action,
        approval_status: approvalStatus,
        sudah_di_setujui: deskResultInfo.has_desk_result,
        approver_kemkes: deskResultInfo.approver_kemkes,
        status_kemenkes: status_kemenkes,
      }
    })

    // Count regencies with desk results for meta
    const regenciesWithDeskResult = Array.from(deskResultMap.values()).filter(
      (v) => v.has_desk_result === 1
    ).length

    return {
      list: mapped,
      total: Number(totalResult?.total) || 0,
      meta: {
        submitted: Number(totalResult?.submitted) || 0,
        not_submitted: Number(totalResult?.not_submitted) || 0,
        reviewed: Number(totalResult?.reviewed) || 0,
        submitted_to_ministry:
          !!ministrySubmission ||
          Number(allReviewedResult?.total) !== Number(allReviewedResult?.all_reviewed),
        sudah_di_setujui_count: regenciesWithDeskResult,
      },
    }
  }

  /**
   * Update the approval status for a specific entity's approval period.
   */
  async updateProvinceApprovalStatus(
    c: Context,
    programPlanId: number,
    status: number,
    entityId: number
  ) {
    await (c.var.trx as any)
      .updateTable("ws_bmhp_approval_periods")
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("program_plan_id", "=", programPlanId)
      .where("entity_id", "=", entityId)
      .execute()

    return { program_plan_id: programPlanId }
  }
  /**
   * Submit to Kemenkes by Creating 1 data in ws_bmhp_approval_period_province
   * and link all existing ws_bmhp_approval_periods with status=3 to it.
   */
  async submitProvinceApproval(
    c: Context,
    programPlanId: number,
    userProvinceId: string,
    entityId: number
  ) {
    const trx = c.var.trx as any

    // Check if submission record already exists
    const existingSubmission = await trx
      .selectFrom("ws_bmhp_approval_period_province")
      .select("id")
      .where("program_plan_id", "=", programPlanId)
      .where("entity_id", "=", entityId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (existingSubmission) {
      // Record already exists, return existing data without inserting
      const newProvincePeriodId = Number(existingSubmission.id)

      // Still update all matching ws_bmhp_approval_periods if needed
      const updated = await trx
        .updateTable("ws_bmhp_approval_periods")
        .set({
          approval_period_province_id: newProvincePeriodId,
          updated_by: c.var.userId,
          updated_at: new Date(),
        })
        .where("program_plan_id", "=", programPlanId)
        .where("status", "=", 3)
        .where("approval_period_province_id", "is", null) // Only update if not already linked
        .where("entity_id", "in", (eb: any) =>
          eb
            .selectFrom("entities")
            .select(sql`CAST(regency_id AS UNSIGNED)`)
            .where("province_id", "=", userProvinceId)
            .where("entity_tag_id", "=", ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE)
        )
        .executeTakeFirst()

      return {
        province_approval_id: newProvincePeriodId,
        updated_periods_count: Number(updated.numUpdatedRows || 0)
      }
    }

    // Check if there are any city/regency periods under this province that are NOT status = 3
    const pendingPeriods = await trx
      .selectFrom("ws_bmhp_approval_periods as wap")
      .select((eb: any) => eb.fn.countAll().as("pending_count") )
      .where("wap.program_plan_id", "=", programPlanId)
      .where("wap.status", "!=", 3)
      .where("wap.deleted_at", "is", null)
      .where("wap.entity_id", "in", (eb: any) =>
        eb
          .selectFrom("entities")
          .select(sql`CAST(regency_id AS UNSIGNED)`)
          .where("province_id", "=", userProvinceId)
          .where("entity_tag_id", "=", ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE)
      )
      .executeTakeFirst()

    if (Number(pendingPeriods?.pending_count || 0) > 0) {
      throw new BadRequestError(
        `Tidak dapat mensubmit ke Kemenkes karena masih ada ${pendingPeriods.pending_count} kabupaten/kota yang belum berstatus Final Approved.`
      )
    }

    // Create the province submission record
    const insertResult = await trx
      .insertInto("ws_bmhp_approval_period_province")
      .values({
        program_plan_id: programPlanId,
        entity_id: entityId, // <-- The actual entity that logged in
        status: 1,
        submitted_at: new Date(),
        submitted_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    const newProvincePeriodId = Number(insertResult.insertId)

    if (!newProvincePeriodId) {
      throw new BadRequestError("Failed to create province submission")
    }

    // Update all matching ws_bmhp_approval_periods (status = 3, under current province, same program plan)
    const updated = await trx
      .updateTable("ws_bmhp_approval_periods")
      .set({
        approval_period_province_id: newProvincePeriodId,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("program_plan_id", "=", programPlanId)
      .where("status", "=", 3) // Only those that are final approved by province
      .where("entity_id", "in", (eb: any) =>
        eb
          .selectFrom("entities")
          .select(sql`CAST(regency_id AS UNSIGNED)`)
          .where("province_id", "=", userProvinceId)
          .where("entity_tag_id", "=", ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE)
      )
      .executeTakeFirst()

    return {
      province_approval_id: newProvincePeriodId,
      updated_periods_count: Number(updated.numUpdatedRows || 0),
    }
  }

  /**
   * Get entity data with regency/province information by entity_id
   */
  async findRegencyIdByEntityId(c: Context, entityId: number) {
    const result = await (c.var.trx as any)
      .selectFrom("entities")
      .select("regency_id")
      .where("id", "=", entityId)
      .executeTakeFirst()

    return result?.regency_id ?? null
  }

  async getEntityWithRegency(c: Context, entityId: number) {
    const result = await (c.var.trx as any)
      .selectFrom("entities as e")
      .leftJoin("locations as reg", "reg.id", "e.regency_id")
      .leftJoin("locations as prov", "prov.id", "e.province_id")
      .leftJoin("locations as sub", "sub.id", "e.sub_district_id")
      .select([
        "e.id",
        "e.name",
        "e.entity_tag_id",
        "e.regency_id",
        "e.province_id",
        "e.sub_district_id",
        sql<string>`reg.name`.as("regency_name"),
        sql<string>`prov.name`.as("province_name"),
        sql<string>`sub.name`.as("sub_district_name"),
      ])
      .where("e.id", "=", entityId)
      .where("e.deleted_at", "is", null)
      .executeTakeFirst()

    return result || null
  }

  async getPuskesmasByParentEntity(
    c: Context,
    params: {
      page: number
      paginate: number
      keyword?: string
      entity_regency_id?: number
    }
  ): Promise<{ list: unknown[]; total: number }> {
    const { page, paginate, keyword, entity_regency_id } = params
    const offset = (page - 1) * paginate

    let regency_id: string | null | undefined = c.var.userEntity?.regency_id

    if (entity_regency_id) {
      const regencyEntity = await c.var.trx
        .selectFrom("entities as e")
        .select("e.regency_id")
        .where("e.id", "=", entity_regency_id)
        .executeTakeFirst()
      regency_id = regencyEntity?.regency_id
    }

    let query = c.var.trx
      .selectFrom("entities as e")
      .where("e.entity_tag_id", "=", 9)
      .where("e.id_satu_sehat", "is not", null)
      .$if(regency_id != null, (qb) =>
        qb.where("e.regency_id", "=", regency_id!)
      )
      .where("e.deleted_at", "is", null)

    if (keyword) {
      query = query.where("e.name", "like", `%${keyword}%`)
    }

    const [list, countResult] = await Promise.all([
      query
        .select([
          "e.id",
          "e.code",
          "e.name",
          "e.status",
          "e.province_id",
          "e.regency_id",
          "e.sub_district_id",
          "e.village_id",
          "e.id_satu_sehat",
          "e.address",
          "e.lat",
          "e.lng",
        ])
        .orderBy("e.name", "asc")
        .limit(paginate)
        .offset(offset)
        .execute(),
      query
        .select((eb) => eb.fn.countAll<number>().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return { list, total: Number(countResult.total) }
  }

  async getSignature(c: Context, userId: number) {
    const signature = await (c.var.trx as any)
      .selectFrom("bmhp_approval_signatures")
      .select([
        "id",
        "name",
        "position",
        "signature_url",
        "program",
      ])
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return signature ? {
      id: Number(signature.id),
      name: signature.name,
      position: signature.position,
      signature_url: signature.signature_url,
      program: signature.program,
    } : null
  }

  async upsertSignature(
    c: Context,
    userId: number,
    payload: { name: string; position?: string | null; signature_url: string; program?: string | null }
  ): Promise<number> {
    const trx = c.var.trx as any

    const existing = await trx
      .selectFrom("bmhp_approval_signatures")
      .select("id")
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (existing) {
      const existingId = Number(existing.id)

      // Check if this signature is referenced in any active approval period or desk result
      const usedInPeriod = await trx
        .selectFrom("ws_bmhp_approval_periods")
        .select("id")
        .where("approval_signature_id", "=", existingId)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      const usedInDeskResult = await trx
        .selectFrom("ws_bmhp_desk_results")
        .select("id")
        .where("approval_signature_id", "=", existingId)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      if (usedInPeriod || usedInDeskResult) {
        // Signature is in use — soft-delete current record and insert new one
        await trx
          .updateTable("bmhp_approval_signatures")
          .set({
            deleted_at: new Date(),
            updated_at: new Date(),
            updated_by: userId,
          })
          .where("id", "=", existingId)
          .execute()

        const result = await trx
          .insertInto("bmhp_approval_signatures")
          .values({
            user_id: userId,
            name: payload.name,
            position: payload.position ?? null,
            signature_url: payload.signature_url,
            program: payload.program ?? null,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: userId,
            updated_by: userId,
          })
          .executeTakeFirst()
        return Number(result.insertId)
      } else {
        // Signature not in use — update in place
        await trx
          .updateTable("bmhp_approval_signatures")
          .set({
            name: payload.name,
            position: payload.position ?? null,
            signature_url: payload.signature_url,
            program: payload.program ?? null,
            updated_at: new Date(),
            updated_by: userId,
          })
          .where("id", "=", existingId)
          .execute()
        return existingId
      }
    } else {
      const result = await trx
        .insertInto("bmhp_approval_signatures")
        .values({
          user_id: userId,
          name: payload.name,
          position: payload.position ?? null,
          signature_url: payload.signature_url,
          program: payload.program ?? null,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: userId,
          updated_by: userId,
        })
        .executeTakeFirst()
      return Number(result.insertId)
    }
  }

}
