import { Context } from "hono"
import { sql } from "kysely"
import { MicroplanningConfigQuery } from "./microplanning.schema.js"
export class MicroplanningRepository {
  async getVillagesBySubDistrict(c: Context, microplanningId: number) {
    return c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .select("mv.village_id")
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .execute()
  }

  async getSchoolsBySubDistrict(c: Context, microplanningId: number) {
    return c.var.trx
      .selectFrom("ws_microplanning_schools as s")
      .select("s.school_id")
      .where("s.microplanning_id", "=", microplanningId)
      .where("s.is_assigned", "=", 1)
      .execute()
  }

  async getVillagesWithTargets(c: Context, microplanningId: number) {
    return c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("wmpt.microplanning_id", "=", "mv.microplanning_id")
          .onRef("wmpt.reff_id", "=", "mv.village_id")
          .on("wmpt.reff_type", "=", "village")
          .on("wmpt.deleted_at", "is", null)
      )
      .select((eb) => [
        "mv.village_id",
        eb.fn.count("wmpt.id").as("target_count"),
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .groupBy("mv.village_id")
      .execute()
  }

  async getSchoolsWithTargets(c: Context, microplanningId: number) {
    return c.var.trx
      .selectFrom("ws_microplanning_schools as s")
      .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("wmpt.microplanning_id", "=", "s.microplanning_id")
          .onRef("wmpt.reff_id", "=", "s.school_id")
          .on("wmpt.reff_type", "=", "school")
          .on("wmpt.deleted_at", "is", null)
      )
      .select((eb) => [
        "s.school_id",
        eb.fn.count("wmpt.id").as("target_count"),
      ])
      .where("s.microplanning_id", "=", microplanningId)
      .where("s.is_assigned", "=", 1)
      .groupBy("s.school_id")
      .execute()
  }

  async getVillageEstimationStatus(
    c: Context,
    microplanningId: number,
    villageIds: number[]
  ) {
    return c.var.trx
      .selectFrom("ws_village_estimation_details as ved")
      .select("ved.village_id")
      .where("ved.microplanning_id", "=", microplanningId)
      .where("ved.village_id", "in", villageIds)
      .where("ved.deleted_at", "is", null)
      .execute()
  }

  async getSchoolEstimationStatus(
    c: Context,
    microplanningId: number,
    schoolIds: number[]
  ) {
    return c.var.trx
      .selectFrom("ws_school_estimation_details as sed")
      .select("sed.school_id")
      .where("sed.microplanning_id", "=", microplanningId)
      .where("sed.school_id", "in", schoolIds)
      .where("sed.deleted_at", "is", null)
      .groupBy("sed.school_id")
      .execute()
  }

  async getVillageMaterialNeedsStatus(
    c: Context,
    microplanningId: number,
    villageIds: number[]
  ) {
    return c.var.trx
      .selectFrom("ws_material_needs as wmn")
      .select("wmn.reference_id as village_id")
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.reference_type", "=", "village")
      .where("wmn.reference_id", "in", villageIds)
      .where("wmn.deleted_at", "is", null)
      .groupBy("wmn.reference_id")
      .execute()
  }

  async getSchoolMaterialNeedsStatus(
    c: Context,
    microplanningId: number,
    schoolIds: number[]
  ) {
    return c.var.trx
      .selectFrom("ws_material_needs as wmn")
      .select("wmn.reference_id as school_id")
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.reference_type", "=", "school")
      .where("wmn.reference_id", "in", schoolIds)
      .where("wmn.deleted_at", "is", null)
      .groupBy("wmn.reference_id")
      .execute()
  }

  async getMicroplanningById(c: Context, microplanningId: number) {
    return c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "entity_id", "year", "status"])
      .where("id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getMicroplanningYearsByEntity(c: Context, entityId: number) {
    return c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "year", "status"])
      .where("entity_id", "=", entityId)
      .where("deleted_at", "is", null)
      .orderBy("year")
      .execute()
  }

  async getLastTwoYearMicroplanningIds(c: Context, year: number) {
    const prevYear = year - 1

    const microplannings = await c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "entity_id", "year", "status"])
      .where("entity_id", "=", c.var.entityId!)
      .where("year", "in", [prevYear, year])
      .where("deleted_at", "is", null)
      .orderBy("year")
      .execute()

    return [
      microplannings.find((m) => m.year === prevYear)?.id,
      microplannings.find((m) => m.year === year)?.id,
    ]
  }

  async checkMapIsCreated(c: Context, microplanningId: number) {
    const { trx, entityId } = c.var

    const servicePoint = await trx
      .selectFrom("ws_map_service_points as msp")
      .select("msp.id")
      .where("msp.entity_id", "=", entityId as number)
      .where("msp.microplanning_id", "=", microplanningId)
      .where("msp.deleted_at", "is", null)
      .executeTakeFirst()

    if (!servicePoint) {
      return {
        service_point_exists: false,
        destination_exists: false,
        route_exists: false,
      }
    }

    const [destination, route] = await Promise.all([
      trx
        .selectFrom("ws_map_destinations as md")
        .select("md.id")
        .where("md.microplanning_id", "=", microplanningId)
        .where("md.deleted_at", "is", null)
        .executeTakeFirst(),

      trx
        .selectFrom("ws_map_routes as mr")
        .select("mr.id")
        .where("mr.microplanning_id", "=", microplanningId)
        .where("mr.deleted_at", "is", null)
        .executeTakeFirst(),
    ])

    return {
      service_point_exists: true,
      destination_exists: Boolean(destination),
      route_exists: Boolean(route),
    }
  }

  async updateMicroplanningStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_microplanning")
      .set({ status, updated_at: new Date() })
      .where("id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateTargetStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_patient_targets")
      .set({ status, updated_at: new Date() })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateVillageEstimationStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_village_estimation_details")
      .set({ status, updated_at: new Date() })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateSchoolEstimationStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_school_estimation_details")
      .set({ status, updated_at: new Date() })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateMaterialNeedsStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_material_needs")
      .set({ status, updated_at: new Date() })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateServicePointStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    const now = new Date()
    const userId = c.var.user?.id

    return c.var.trx
      .updateTable("ws_map_service_points")
      .set({ status, updated_at: now, updated_by: userId })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateDestinationStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    const now = new Date()
    const userId = c.var.user?.id

    return c.var.trx
      .updateTable("ws_map_destinations")
      .set({ status, updated_at: now, updated_by: userId })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateRouteStatus(c: Context, microplanningId: number, status: number) {
    const now = new Date()
    const userId = c.var.user?.id

    return c.var.trx
      .updateTable("ws_map_routes")
      .set({ status, updated_at: now, updated_by: userId })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateProblemSolutionStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_problem_solutions")
      .set({ status, updated_at: new Date() })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updatePriorityAreasStatus(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_priority_areas")
      .set({ status, updated_at: new Date() })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async hasUnsubmittedTargets(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_microplanning_patient_targets")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async hasUnsubmittedVillageEstimation(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_village_estimation_details")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async hasUnsubmittedSchoolEstimation(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_school_estimation_details")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async hasUnsubmittedMaterialNeeds(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_material_needs")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async hasUnsubmittedMapData(c: Context, microplanningId: number) {
    const [sp, dest, route] = await Promise.all([
      c.var.trx
        .selectFrom("ws_map_service_points")
        .select("id")
        .where("microplanning_id", "=", microplanningId)
        .where("status", "=", 0)
        .where("deleted_at", "is", null)
        .limit(1)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_map_destinations")
        .select("id")
        .where("microplanning_id", "=", microplanningId)
        .where("status", "=", 0)
        .where("deleted_at", "is", null)
        .limit(1)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_map_routes")
        .select("id")
        .where("microplanning_id", "=", microplanningId)
        .where("status", "=", 0)
        .where("deleted_at", "is", null)
        .limit(1)
        .executeTakeFirst(),
    ])
    return !!(sp || dest || route)
  }

  async hasUnsubmittedPriorityAreas(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_microplanning_priority_areas")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async hasUnsubmittedProblemSolutions(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_microplanning_problem_solutions")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async hasUnsubmittedActivityPlans(c: Context, microplanningId: number) {
    const row = await c.var.trx
      .selectFrom("ws_microplanning_activity_plans")
      .select("id")
      .where("microplanning_id", "=", microplanningId)
      .where("status", "=", 0)
      .where("deleted_at", "is", null)
      .limit(1)
      .executeTakeFirst()
    return !!row
  }

  async getMicroplanningConfig(c: Context, query: MicroplanningConfigQuery) {
    const programId = c.var.programId

    return await c.var.trx
      .selectFrom("ws_microplanning_config")
      .select(["program_id", "key", "config"])
      .where("deleted_at", "is", null)
      .where("program_id", "=", programId)
      .$if(Boolean(query.key), (qb) => qb.where("key", "in", query.key!))
      .execute()
  }

  async getSchoolsByMicroplanningId(
    c: Context,
    microplanningId: number,
    params: { keyword?: string }
  ) {
    const { keyword } = params

    let query = c.var.trx
      .selectFrom("ws_microplanning_schools")
      .where("microplanning_id", "=", microplanningId)
      .where("is_assigned", "=", 1)
      .select([
        "school_id as id",
        "name",
        sql<number>`CAST(lat AS DOUBLE)`.as("latitude"),
        sql<number>`CAST(lng AS DOUBLE)`.as("longitude"),
      ])

    if (keyword && keyword !== "") {
      query = query.where("name", "like", `%${keyword}%`)
    }

    const [list, count] = await Promise.all([
      query.execute(),
      query
        .clearSelect()
        .select((eb) => eb.fn.countAll().as("total"))
        .executeTakeFirst(),
    ])

    return { list, total: Number(count?.total ?? 0) }
  }

  async getNumberOfTargets(c: Context, microplanningId: number) {
    const VILLAGE_TARGET_GROUPS = [1, 2, 3, 9]

    const result = await c.var.trx
      .selectFrom("ws_microplanning_patient_targets")
      .select(["target_group_id"])
      .select((eb) => eb.fn.count("id").as("count"))
      .where("microplanning_id", "=", microplanningId)
      .where("target_group_id", "in", VILLAGE_TARGET_GROUPS)
      .where("deleted_at", "is", null)
      .groupBy("target_group_id")
      .execute()

    return result.map((row) => ({
      target_group_id: Number(row.target_group_id),
      count: Number(row.count),
    }))
  }

  async getCommunityHealthWorkerTotalAdditionalNeeds(
    c: Context,
    microplanningId: number
  ) {
    const result = await c.var.trx
      .selectFrom("ws_village_estimation_details")
      .select("gap_health_worker")
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()

    return result
      .filter((row) => Number(row.gap_health_worker) > 0)
      .reduce((sum, row) => sum + Number(row.gap_health_worker), 0)
  }

  async getVaccinatorNeeds(c: Context, microplanningId: number) {
    const result = await c.var.trx
      .selectFrom("ws_village_estimation_details")
      .select([
        "additional_facility_vaccinator_service",
        "additional_outreach_vaccinator_service",
      ])
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result
  }

  async getImmunizationServiceDays(c: Context, microplanningId: number) {
    const result = await c.var.trx
      .selectFrom("ws_school_estimation_details")
      .select(["schedule_month", "required_service_days"])
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()

    const august = result
      .filter((row) => row.schedule_month === "August")
      .reduce((sum, row) => sum + Number(row.required_service_days ?? 0), 0)

    const november = result
      .filter((row) => row.schedule_month === "November")
      .reduce((sum, row) => sum + Number(row.required_service_days ?? 0), 0)

    return { august, november }
  }

  async getProblemSolutionVillageCounts(
    c: Context,
    microplanningId: number,
    villageIds: number[]
  ) {
    return c.var.trx
      .selectFrom("ws_microplanning_problem_solutions")
      .select(["village_id"])
      .select((eb) =>
        eb.fn.count<number>("problem_type_id").distinct().as("problem_type_count")
      )
      .where("microplanning_id", "=", microplanningId)
      .where("village_id", "in", villageIds)
      .where("deleted_at", "is", null)
      .groupBy("village_id")
      .execute()
  }

  async getActivityPlanProgress(c: Context, microplanningId: number) {
    const [totalResult, completedResult] = await Promise.all([
      c.var.trx
        .selectFrom("ws_microplanning_activity_plans")
        .select(c.var.trx.fn.countAll<number>().as("count"))
        .where("microplanning_id", "=", microplanningId)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_microplanning_activity_plans")
        .select(c.var.trx.fn.countAll<number>().as("count"))
        .where("microplanning_id", "=", microplanningId)
        .where("objective", "is not", null)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
    ])

    return {
      total: Number(totalResult?.count ?? 0),
      completed: Number(completedResult?.count ?? 0),
    }
  }
}
