import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "hono"
import { Insertable } from "kysely"
import { BaseRepository } from "../../base.repository.js"

export class TargetEstimationNonBiasRepository extends BaseRepository<"ws_village_estimation_details"> {
  constructor() {
    super("ws_village_estimation_details")
  }

  async saveVillageDetail(
    c: Context,
    data: Insertable<DB["ws_village_estimation_details"]>
  ) {
    return c.var.trx
      .insertInto("ws_village_estimation_details")
      .values({
        ...data,
        status: 0,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
  }

  async findByVillage(c: Context, village_id: number, microplanning_id: number) {
    return c.var.trx
      .selectFrom("ws_village_estimation_details")
      .selectAll()
      .where("village_id", "=", village_id)
      .where("microplanning_id", "=", microplanning_id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findByMicroplanningAndVillage(
    c: Context,
    microplanning_id: number,
    village_id: number
  ) {
    return c.var.trx
      .selectFrom("ws_village_estimation_details as ved")
      .innerJoin("ws_microplanning as mp", "mp.id", "ved.microplanning_id")
      .selectAll("ved")
      .select(["mp.entity_id", "mp.id as microplanning_id"])
      .where("ved.microplanning_id", "=", microplanning_id)
      .where("ved.village_id", "=", village_id)
      .where("mp.deleted_at", "is", null)
      .where("ved.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async updateVillageDetail(
    c: Context,
    id: number,
    data: Partial<Insertable<DB["ws_village_estimation_details"]>>
  ) {
    return c.var.trx
      .updateTable("ws_village_estimation_details")
      .set({ ...data, status: 0, updated_by: c.var.userId })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirstOrThrow()
  }

  async getImmunizationServiceDashboard(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as loc", "loc.id", "mv.village_id")
      .leftJoin("ws_village_estimation_details as ved", (join) =>
        join
          .onRef("ved.village_id", "=", "loc.id")
          .on("ved.microplanning_id", "=", microplanningId)
          .on("ved.deleted_at", "is", null)
      )
      .select([
        "loc.id as village_id",
        "loc.name as village_name",
        "ved.outreach_service_percentage",
        "ved.facility_service_percentage",
        "ved.required_monthly_outreach_service",
        "ved.required_monthly_facility_service",
        "ved.available_outreach_service",
        "ved.available_facillity_service",
        "ved.additional_outreach_service",
        "ved.additional_facility_service",
        "ved.additional_outreach_vaccinator_service",
        "ved.additional_facility_vaccinator_service",
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .execute()
  }

  async getWorkerDataBySubDistrict(c: Context) {
    return c.var.trx
      .selectFrom("locations as loc")
      .innerJoin("ws_microplanning_villages as mv", "loc.id", "mv.village_id")
      .leftJoin("ws_village_estimation_details as ved", (join) =>
        join
          .onRef("ved.village_id", "=", "loc.id")
          .on("ved.microplanning_id", "=", c.var.microplanningId!)
          .on("ved.deleted_at", "is", null)
      )
      .select([
        "loc.id as village_id",
        "loc.name as village_name",
        "ved.health_worker_ideal_needs",
        "ved.available_worker",
        "ved.gap_health_worker",
      ])
      .where("mv.microplanning_id", "=", c.var.microplanningId!)
      .where("mv.is_assigned", "=", 1)
      .execute()
  }

  async getVillagesBySubDistrict(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    keyword?: string
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as loc", "loc.id", "mv.village_id")
      .leftJoin("ws_village_estimation_details as ved", (join) =>
        join
          .onRef("ved.village_id", "=", "loc.id")
          .on("ved.microplanning_id", "=", microplanningId)
          .on("ved.deleted_at", "is", null)
      )
      .select([
        "loc.id as village_id",
        "loc.name as village_name",
        "ved.id as village_detail_id",
        "ved.microplanning_id",
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)

    if (keyword) {
      query = query.where("loc.name", "like", `%${keyword}%`)
    }

    return query.orderBy("loc.id", "asc").execute()
  }

  async getTargetCountsByVillageId(
    c: Context,
    villageId: number,
    targetIds: number[],
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_microplanning_patient_targets as wmpt")
      .select((q) => ["wmpt.target_group_id", q.fn.count("wmpt.id").as("count")])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.reff_type", "=", "village")
      .where("wmpt.reff_id", "=", villageId)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.target_group_id", "in", targetIds)
      .groupBy("wmpt.target_group_id")
      .execute()
  }
  async getAbsoluteTargetGroup(
    c: Context,
    villageId: number,
    targetIds: number[],
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_microplan_absolute_target as wmat")
      .select((q) => [
        "wmat.target_group_id",
        q.fn.sum("wmat.qty").$castTo<string>().as("count"),
      ])
      .where("wmat.deleted_at", "is", null)
      .where("wmat.microplan_id", "=", microplanningId)
      .where("wmat.reff_type", "=", "village")
      .where("wmat.reff_id", "=", villageId)
      .where("wmat.is_out_of_school", "=", 0)
      .where("wmat.target_group_id", "in", targetIds)
      .groupBy("wmat.target_group_id")
      .execute()
  }

  async getLocationName(c: Context, locationId: number) {
    return c.var.trx
      .selectFrom("locations")
      .select("name")
      .where("id", "=", locationId)
      .executeTakeFirst()
  }

  async getVillageEstimationDetailsByMicroplanning(
    c: Context,
    villageId: number,
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_village_estimation_details as ved")
      .innerJoin("ws_microplanning as mp", "mp.id", "ved.microplanning_id")
      .select([
        "ved.id",
        "ved.microplanning_id",
        "ved.village_id",
        "ved.outreach_service_percentage",
        "ved.facility_service_percentage",
        "ved.required_monthly_outreach_service",
        "ved.required_monthly_facility_service",
        "ved.available_outreach_service",
        "ved.available_facillity_service",
        "ved.additional_outreach_service",
        "ved.additional_outreach_vaccinator_service",
        "ved.additional_facility_service",
        "ved.additional_facility_vaccinator_service",
        "ved.health_worker_ideal_needs",
        "ved.available_worker",
        "ved.gap_health_worker",
      ])
      .where("ved.village_id", "=", villageId)
      .where("ved.microplanning_id", "=", microplanningId)
      .where("ved.deleted_at", "is", null)
      .where("mp.deleted_at", "is", null)
      .executeTakeFirst()
  }
}
