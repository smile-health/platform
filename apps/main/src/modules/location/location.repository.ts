import { LOCATION_KEY } from "@/common/constants/location.js"
import { associate } from "@smile/lib/utils.js"
import { Context } from "hono"
import { sql } from "kysely"

export class LocationRepository {
  async getLocationByLevelStreamData(c: Context, level: number) {
    return c.var.trx
      .selectFrom("locations")
      .where("level", "=", level)
      .select(["id", "name"])
      .orderBy("id", "asc")
      .stream()
  }

  async findByID(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("locations")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async getLocationMapped(c: Context, locationIds: number[]) {
    if (!locationIds || locationIds.length === 0) return {}

    const rows = await c.var.trx
      .selectFrom("locations")
      .selectAll()
      .where("id", "in", locationIds)
      .execute()

    return associate(rows, "id")
  }

  async getDetails(c: Context, locationID: number) {
    const detail = {}
    let parentID = -1

    while (parentID !== 0) {
      const location = await this.findByID(
        c,
        parentID > 0 ? parentID : locationID
      )
      if (!location) {
        break
      }

      const key = LOCATION_KEY[location.level ?? -1] ?? ""
      detail[key] = {
        id: location.id,
        name: location.name,
      }

      parentID = location.parent_id ?? 0
    }

    return detail
  }

  async getLocations(c: Context, level: number, parentID: number = 0) {
    return await c.var.trx
      .selectFrom("locations")
      .selectAll()
      .where("level", "=", level)
      .$if(parentID > 0, (eb) => eb.where("parent_id", "=", parentID))
      .execute()
  }

  async getLocationsByMicroplanningId(c: Context, microplanningId: number, isAssigned?: number) {
    return await c.var.trx
      .selectFrom("locations as l")
      .selectAll("l")
      .innerJoin("ws_microplanning_villages as mv", "l.id", "mv.village_id")
      .where("mv.microplanning_id", "=", microplanningId)
      .$if(!!isAssigned, (qb) => qb.where("mv.is_assigned", "=", isAssigned!))
      .execute()
  }

  async getTotalCountByLevel(c: Context, level: number) {
    const row = await c.var.trx
      .selectFrom("locations")
      .where("level", "=", level)
      .select((eb) => eb.fn.countAll().as("total"))
      .executeTakeFirst()

    return Number(row?.total ?? 0)
  }

  async findTargetsByLocation(
    c: Context,
    sub_district_id: number,
    target_group_id: number,
    microplanningId: number
  ) {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as l", "l.id", "mv.village_id")
      .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("wmpt.reff_id", "=", "mv.village_id")
          .onRef("wmpt.microplanning_id", "=", "mv.microplanning_id")
          .on("wmpt.reff_type", "=", "village")
          .on("wmpt.deleted_at", "is", null)
          .on("wmpt.target_group_id", "=", target_group_id)
      )
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .select((q) => [
        "l.id",
        sql<string>`CONCAT('DESA ', l.name)`.as("village_name"),
        q.fn.count("wmpt.id").as("total"),
      ])
      .groupBy("l.id")
      .execute()

    const sum = result.reduce(
      (acc, item) => acc + Number(item.total),
      0
    )

    return { result, sum }
  }

  async getTargetCountsByLocationId(
    c: Context,
    village_id: number,
    target_group_ids: number[]
  ) {
    const results = await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin("ws_microplanning_patient_targets as wmpt", "wp.id", "wmpt.patient_id")
      .where("wp.residential_village_id", "=", village_id)
      .where("wmpt.target_group_id", "in", target_group_ids)
      .where("wp.deleted_at", "is", null)
      .where("wmpt.microplanning_id", "=", c.var.microplanningId!)
      .select((eb) => ["wmpt.target_group_id", eb.fn.count("wp.id").as("count")])
      .groupBy("wmpt.target_group_id")
      .execute()

    const counts: Record<number, number> = {}
    results.forEach((row) => {
      counts[row.target_group_id!] = Number(row.count)
    })

    return target_group_ids.map((id) => ({
      target_group_id: id,
      count: counts[id] || 0,
    }))
  }

  async getBatchTargetCountsByLocationIds(
    c: Context,
    village_ids: number[],
    target_group_ids: number[],
    microplanningId: number
  ) {
    if (village_ids.length === 0) {
      return []
    }

    const results = await c.var.trx
      .selectFrom("ws_patients as t")
      .innerJoin("ws_microplanning_patient_targets as wmpt", "t.id", "wmpt.patient_id")
      .leftJoin("ws_microplanning as m", (join) =>
        join.onRef("m.id", "=", "wmpt.microplanning_id")
      )
      .where("t.residential_village_id", "in", village_ids)
      .where("wmpt.target_group_id", "in", target_group_ids)
      .where("m.id", "=", microplanningId)
      .where("t.deleted_at", "is", null)
      .select((eb) => [
        "t.residential_village_id as residence_village_id",
        "wmpt.target_group_id",
        eb.fn.count("t.id").as("count"),
      ])
      .groupBy(["t.residential_village_id", "wmpt.target_group_id"])
      .execute()

    const countsByVillage = new Map<number, Map<number, number>>()

    results.forEach((row) => {
      if (!countsByVillage.has(row.residence_village_id!)) {
        countsByVillage.set(row.residence_village_id!, new Map())
      }
      countsByVillage
        .get(row.residence_village_id!)!
        .set(row.target_group_id!, Number(row.count))
    })

    return village_ids.map((villageId) => ({
      village_id: villageId,
      counts: target_group_ids.map((targetGroupId) => ({
        target_group_id: targetGroupId,
        count: countsByVillage.get(villageId)?.get(targetGroupId) || 0,
      })),
    }))
  }
}
