import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "hono"
import { Insertable, sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"

export class TargetEstimationBiasRepository extends BaseRepository<"ws_school_estimation_details"> {
  constructor() {
    super("ws_school_estimation_details")
  }

  async saveSchoolDetail(
    c: Context,
    data: Insertable<DB["ws_school_estimation_details"]>
  ) {
    return c.var.trx
      .insertInto("ws_school_estimation_details")
      .values({
        ...data,
        status: 0,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
  }

  async findByMicroplanningAndSchool(
    c: Context,
    microplanning_id: number,
    school_id: number
  ) {
    return c.var.trx
      .selectFrom("ws_school_estimation_details as sed")
      .innerJoin("ws_microplanning as mp", "mp.id", "sed.microplanning_id")
      .selectAll("sed")
      .select(["mp.entity_id", "mp.id as microplanning_id"])
      .where("sed.microplanning_id", "=", microplanning_id)
      .where("sed.school_id", "=", school_id)
      .where("mp.deleted_at", "is", null)
      .where("sed.deleted_at", "is", null)
      .execute()
  }

  async updateSchoolDetail(
    c: Context,
    id: number,
    data: Partial<Insertable<DB["ws_school_estimation_details"]>>
  ) {
    return c.var.trx
      .updateTable("ws_school_estimation_details")
      .set({ ...data, status: 0, updated_by: c.var.userId })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirstOrThrow()
  }

  async getSchoolsBySubDistrict(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    keyword?: string
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplanning_schools as ms")
      .leftJoin("ws_school_estimation_details as sed", (join) =>
        join
          .onRef("sed.school_id", "=", "ms.school_id")
          .on("sed.microplanning_id", "=", microplanningId)
          .on("sed.deleted_at", "is", null)
      )
      .select([
        "ms.school_id",
        "ms.name as school_name",
        "sed.microplanning_id",
      ])
      .where("ms.microplanning_id", "=", microplanningId)
      .where("ms.is_assigned", "=", 1)
      .distinct()

    if (keyword) {
      query = query.where("ms.name", "like", `%${keyword}%`)
    }

    return query.orderBy("ms.school_id", "asc").execute()
  }

  async getImmunizationServiceDashboard(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_microplanning_schools as ms")
      .leftJoin("ws_school_estimation_details as sed", (join) =>
        join
          .onRef("sed.school_id", "=", "ms.school_id")
          .on("sed.microplanning_id", "=", microplanningId)
          .on("sed.deleted_at", "is", null)
      )
      .select((eb) => [
        "ms.school_id as entity_id",
        "ms.name as entity_name",
        eb.fn
          .coalesce(
            eb.fn.sum(
              sql<number>`CASE WHEN sed.schedule_month = 'August' THEN sed.required_service ELSE 0 END`
            ),
            sql.lit(0)
          )
          .as("august_service_point"),
        eb.fn
          .coalesce(
            eb.fn.sum(
              sql<number>`CASE WHEN sed.schedule_month = 'August' THEN sed.required_service_days ELSE 0 END`
            ),
            sql.lit(0)
          )
          .as("august_service_days"),
        eb.fn
          .coalesce(
            eb.fn.sum(
              sql<number>`CASE WHEN sed.schedule_month = 'August' THEN sed.available_vaccinator ELSE 0 END`
            ),
            sql.lit(0)
          )
          .as("august_vaccinator"),
        eb.fn
          .coalesce(
            eb.fn.sum(
              sql<number>`CASE WHEN sed.schedule_month = 'November' THEN sed.required_service ELSE 0 END`
            ),
            sql.lit(0)
          )
          .as("november_service_point"),
        eb.fn
          .coalesce(
            eb.fn.sum(
              sql<number>`CASE WHEN sed.schedule_month = 'November' THEN sed.required_service_days ELSE 0 END`
            ),
            sql.lit(0)
          )
          .as("november_service_days"),
        eb.fn
          .coalesce(
            eb.fn.sum(
              sql<number>`CASE WHEN sed.schedule_month = 'November' THEN sed.available_vaccinator ELSE 0 END`
            ),
            sql.lit(0)
          )
          .as("november_vaccinator"),
      ])
      .where("ms.microplanning_id", "=", microplanningId)
      .where("ms.is_assigned", "=", 1)
      .groupBy("ms.school_id")
      .execute()
  }

  async getTargetCountsByEntityId(
    c: Context,
    entityId: number,
    targetIds: number[],
    microplanningIds: number | number[]
  ) {
    const ids = Array.isArray(microplanningIds)
      ? microplanningIds
      : [microplanningIds]
    return c.var.trx
      .selectFrom("ws_microplanning_patient_targets as wmpt")
      .select((q) => [
        "wmpt.target_group_id",
        q.fn.count("wmpt.id").as("count"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.reff_type", "=", "school")
      .where("wmpt.reff_id", "=", entityId)
      .where("wmpt.microplanning_id", "in", ids)
      .where("wmpt.target_group_id", "in", targetIds)
      .groupBy("wmpt.target_group_id")
      .execute()
  }
  async getBatchTargetCountsByEntityIds(
    c: Context,
    entityIds: number[],
    targetIds: number[],
    microplanningId: number
  ) {
    if (entityIds.length === 0) return []

    const results = await c.var.trx
      .selectFrom("ws_microplanning_patient_targets as wmpt")
      .select((q) => [
        "wmpt.reff_id as entity_id",
        "wmpt.target_group_id",
        q.fn.count("wmpt.id").as("count"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.reff_type", "=", "school")
      .where("wmpt.reff_id", "in", entityIds)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.target_group_id", "in", targetIds)
      .groupBy(["wmpt.reff_id", "wmpt.target_group_id"])
      .execute()

    const countsByEntity = new Map<number, Map<number, number>>()

    results.forEach((row) => {
      if (row.entity_id == null || row.target_group_id == null) return
      if (!countsByEntity.has(row.entity_id)) {
        countsByEntity.set(row.entity_id, new Map())
      }
      countsByEntity
        .get(row.entity_id)!
        .set(row.target_group_id, Number(row.count))
    })

    return entityIds.map((entityId) => ({
      entity_id: entityId,
      counts: targetIds.map((targetGroupId) => ({
        target_group_id: targetGroupId,
        count: countsByEntity.get(entityId)?.get(targetGroupId) ?? 0,
      })),
    }))
  }

  async getSchoolName(c: Context, entityId: number) {
    return c.var.trx
      .selectFrom("ws_entities")
      .select("name")
      .where("id", "=", entityId)
      .where("program_id", "=", c.var.programId)
      .executeTakeFirst()
  }

  async getSchoolEstimationDetailsByMicroplanning(
    c: Context,
    schoolId: number,
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_school_estimation_details as sed")
      .innerJoin("ws_microplanning as mp", "mp.id", "sed.microplanning_id")
      .select([
        "sed.id",
        "sed.microplanning_id",
        "sed.school_id",
        "sed.schedule_month",
        "sed.required_service",
        "sed.required_service_days",
        "sed.available_vaccinator",
      ])
      .where("sed.school_id", "=", schoolId)
      .where("sed.microplanning_id", "=", microplanningId)
      .where("sed.deleted_at", "is", null)
      .where("mp.deleted_at", "is", null)
      .execute()
  }

  async getOutOfSchoolTargetCounts(
    c: Context,
    subDistrictId: number,
    targetIds: number[],
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_microplanning_patient_targets as wmpt")
      .innerJoin("ws_patients as t", "t.id", "wmpt.patient_id")
      .select((q) => [
        "wmpt.target_group_id",
        "t.gender",
        q.fn.count("t.id").as("count"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.target_group_id", "is not", null)
      .where("wmpt.reff_type", "!=", "school")
      .where("wmpt.subdistrict_id", "=", subDistrictId)
      .where("wmpt.target_group_id", "in", targetIds)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .groupBy(["wmpt.target_group_id", "t.gender"])
      .execute()
  }
}
