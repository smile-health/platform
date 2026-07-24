import { DB } from "@/common/infrastructure/database/types/db.js"
import env from "@/config/env.js"
import { NON_BIAS_ACTIVITY } from "@/common/constants/target.js"
import { Context } from "hono"
import { Insertable, sql } from "kysely"
import moment from "moment"

export class NonBiasImmunizationLogisticsRepository {
  async checkExistingDataByReference(
    c: Context,
    referenceId: number,
    referenceType: string,
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_material_needs as wmn")
      .select(["wmn.id", "wmn.material_target_id", "wmn.reference_id"])
      .where("wmn.reference_id", "=", referenceId)
      .where("wmn.reference_type", "=", referenceType)
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.deleted_at", "is", null)
      .execute()
  }

  async checkExistingData(
    c: Context,
    referenceId: number,
    referenceType: string,
    microplanningId: number,
    materialTargetIds: number[]
  ) {
    return c.var.trx
      .selectFrom("ws_material_needs as wmn")
      .select(["wmn.id", "wmn.material_target_id", "wmn.material_id", "wmn.reference_id"])
      .where("wmn.reference_id", "=", referenceId)
      .where("wmn.reference_type", "=", referenceType)
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.material_target_id", "in", materialTargetIds)
      .where("wmn.deleted_at", "is", null)
      .execute()
  }

  async saveMaterialNeed(
    c: Context,
    data: Insertable<DB["ws_material_needs"]>
  ) {
    const result = await c.var.trx
      .insertInto("ws_material_needs")
      .values({
        ...data,
        status: 0,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  }

  async saveMaterialNeedDetail(
    c: Context,
    data: Insertable<DB["ws_material_needs_details"]>
  ) {
    return c.var.trx
      .insertInto("ws_material_needs_details")
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
  }

  async saveMonthlyVaccineNeedDetail(
    c: Context,
    data: Insertable<DB["ws_monthly_vaccine_need_details"]>
  ) {
    return c.var.trx
      .insertInto("ws_monthly_vaccine_need_details")
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
  }

  async saveAdditionalNeed(
    c: Context,
    data: Insertable<DB["ws_additional_needs"]>
  ) {
    return c.var.trx
      .insertInto("ws_additional_needs")
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
  }

  async saveVaccineUtilizationRate(
    c: Context,
    data: Insertable<DB["ws_vaccine_utilization_rate"]>
  ) {
    return c.var.trx
      .insertInto("ws_vaccine_utilization_rate")
      .values({
        ...data,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()
  }

  async getExistingMaterialNeeds(
    c: Context,
    referenceId: number,
    referenceType: string,
    microplanningId: number,
    mpProgramConfigId?: number | null
  ) {
    let query = c.var.trx
      .selectFrom("ws_material_needs as wmn")
      .leftJoin("ws_mp_material_target_config as wmtc", (join) =>
        join
          .onRef("wmtc.id", "=", "wmn.material_target_id")
          .on("wmtc.deleted_at", "is", null)
      )
      .leftJoin("ws_material_targets as wmt", (join) =>
        join
          .onRef("wmt.id", "=", "wmn.material_target_id")
          .on("wmt.deleted_at", "is", null)
      )
      .leftJoin(
        "ws_material_needs_details as wmnd",
        "wmn.id",
        "wmnd.material_need_id"
      )
      .leftJoin(
        "ws_monthly_vaccine_need_details as wmnvd",
        "wmn.id",
        "wmnvd.material_need_id"
      )
      .leftJoin(
        "ws_vaccine_utilization_rate as wvur",
        "wmn.id",
        "wvur.material_need_id"
      )
      .leftJoin("ws_additional_needs as wan", "wmn.id", "wan.material_need_id")
      .select([
        "wmn.id as material_need_id",
        "wmn.total_needs",
        // sql<number>`COALESCE(wmtc.material_id, wmt.material_id)`.as("material_id"),
        "wmn.material_id",
        sql<string>`COALESCE(wmtc.category, wmt.category)`.as("category"),
        sql<string>`COALESCE(wmtc.type, wmt.type)`.as("type"),
        "wmnd.absolute_number_of_routine_immunization",
        "wmnd.number_of_vials_used",
        "wmnd.remaining_stock as detail_remaining_stock",
        "wmnvd.min_stock",
        "wmnvd.max_stock",
        "wmnvd.request_qty",
        "wvur.vaccine_utilization_rate",
        "wan.remaining_stock as additional_remaining_stock",
        "wan.total as additional_total",
      ])
      .where("wmn.reference_id", "=", referenceId)
      .where("wmn.reference_type", "=", referenceType)
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.deleted_at", "is", null)


    return query.execute()
  }

  async getVillagesBySubDistrictWithMaterialNeeds(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    keyword?: string
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as l", "l.id", "mv.village_id")
      .leftJoin("ws_material_needs as wmn", (join) =>
        join
          .onRef("wmn.reference_id", "=", "l.id")
          .on("wmn.reference_type", "=", "village")
          .on("wmn.microplanning_id", "=", microplanningId)
          .on("wmn.deleted_at", "is", null)
      )
      .select([
        "l.id as village_id",
        "l.name as village_name",
        "wmn.id as material_need_id",
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)

    if (keyword) {
      query = query.where("l.name", "like", `%${keyword}%`)
    }

    return query.groupBy("l.id").orderBy("l.id", "asc").execute()
  }

  async getSubDistrictsByDistrictId(c: Context, districtId: number) {
    return c.var.trx
      .selectFrom("locations as l")
      .select(["l.id", "l.name", "l.level"])
      .where("l.id", "=", districtId)
      .where("l.level", "in", [1, 2])
      .orderBy("l.id", "asc")
      .executeTakeFirstOrThrow()
  }

  async getSubDistrictIdsByRegencyId(c: Context, regencyId: number) {
    const rows = await c.var.trx
      .selectFrom("locations as l")
      .select(["l.id"])
      .where("l.parent_id", "=", regencyId)
      .where("l.level", "=", 2)
      .orderBy("l.id", "asc")
      .execute()
    return rows.map((r) => r.id)
  }

  async getEntitiesBySubDistrictIds(c: Context, subDistrictIds: number[]) {
    if (subDistrictIds.length === 0) return []
    return c.var.trx
      .selectFrom("ws_entities as e")
      .select(["e.id", "e.global_id", "e.name", "e.sub_district_id", "e.province_id"])
      .where("e.sub_district_id", "in", subDistrictIds.map(String))
      .where("e.entity_tag_id", "=", 9)
      .where("e.deleted_at", "is", null)
      .execute()
  }

  async updateMaterialNeed(
    c: Context,
    materialNeedId: number,
    totalNeeds: number
  ) {
    return c.var.trx
      .updateTable("ws_material_needs")
      .set({
        total_needs: totalNeeds,
        status: 0,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", materialNeedId)
      .where("deleted_at", "is", null)
      .executeTakeFirstOrThrow()
  }

  async updateMaterialNeedDetail(
    c: Context,
    materialNeedId: number,
    data: {
      absolute_number_of_routine_immunization: number
      number_of_vials_used: number
      remaining_stock: number
    }
  ) {
    return c.var.trx
      .updateTable("ws_material_needs_details")
      .set({
        ...data,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("material_need_id", "=", materialNeedId)
      .executeTakeFirstOrThrow()
  }

  async updateMonthlyVaccineNeedDetail(
    c: Context,
    materialNeedId: number,
    data: {
      min_stock: number
      max_stock: number
      request_qty: number
    }
  ) {
    return c.var.trx
      .updateTable("ws_monthly_vaccine_need_details")
      .set({
        ...data,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("material_need_id", "=", materialNeedId)
      .executeTakeFirstOrThrow()
  }

  async updateVaccineUtilizationRate(
    c: Context,
    materialNeedId: number,
    vaccineUtilizationRate: number
  ) {
    return c.var.trx
      .updateTable("ws_vaccine_utilization_rate")
      .set({
        vaccine_utilization_rate: vaccineUtilizationRate,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("material_need_id", "=", materialNeedId)
      .executeTakeFirstOrThrow()
  }

  async updateAdditionalNeed(
    c: Context,
    materialNeedId: number,
    data: {
      remaining_stock: number
      total: number
    }
  ) {
    return c.var.trx
      .updateTable("ws_additional_needs")
      .set({
        ...data,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("material_need_id", "=", materialNeedId)
      .executeTakeFirstOrThrow()
  }

  async getLastYearAbsoluteImmunization(
    c: Context,
    villageId: number,
    entityId: number,
    year: number
  ) {
    return c.var.trx
      .selectFrom("ws_material_needs as wmn")
      .innerJoin("ws_microplanning as wmp", "wmp.id", "wmn.microplanning_id")
      .leftJoin(
        "ws_material_needs_details as wmnd",
        "wmn.id",
        "wmnd.material_need_id"
      )
      .select([
        "wmn.material_id",
        "wmnd.absolute_number_of_routine_immunization",
        "wmnd.number_of_vials_used",
      ])
      .where("wmn.reference_id", "=", villageId)
      .where("wmn.reference_type", "=", "village")
      .where("wmn.deleted_at", "is", null)
      .where("wmp.entity_id", "=", entityId)
      .where("wmp.year", "=", year)
      .where("wmp.deleted_at", "is", null)
      .execute()
  }

  async getTransactionQtyByEntity(
    c: Context,
    entityId: number,
    transactionTypeId: number = 2
  ) {
    return c.var.trx
      .selectFrom("ws_transactions as t")
      .leftJoin("ws_stocks as s", "t.stock_id", "s.id")
      .leftJoin("ws_materials as m", "s.material_id", "m.id")
      .select([
        "m.id as material_id",
        "m.code",
        "m.name",
        "t.opening_qty",
        "t.change_qty",
        "s.qty",
      ])
      .where("t.entity_id", "=", entityId)
      .where("t.transaction_type_id", "=", transactionTypeId)
      .where("m.id", "in", (qb) =>
        qb
          .selectFrom("ws_mp_material_target_config as wmtc_f")
          .select("wmtc_f.material_id")
          .where("wmtc_f.category", "=", "non_bias")
          .where("wmtc_f.type", "=", "primary")
          .where("wmtc_f.deleted_at", "is", null)
      )
      .execute()
  }

  async getConsumptionByParentMaterial(
    c: Context,
    entityId: number,
    year: number,
    activityId: number
  ) {
    const yearFormat = moment({ year })
    const yearFrom = yearFormat.startOf("year").format("YYYY-MM-DD HH:mm:ss")
    const yearTo = yearFormat.endOf("year").format("YYYY-MM-DD HH:mm:ss")

    return c.var.trx
      .selectFrom("ws_transactions as t")
      .innerJoin("ws_stocks as s", "s.id", "t.stock_id")
      .innerJoin("ws_materials as m", "m.id", "s.material_id")
      .select([
        "m.parent_id as parent_material_id",
        (eb) => eb.fn("abs", [eb.fn.sum(eb.ref("t.change_qty"))]).as("value"),
      ])
      .where("t.entity_id", "=", entityId)
      .where("t.activity_id", "=", activityId)
      .where("t.transaction_type_id", "in", [10, 5])
      .where("t.created_at", ">=", yearFrom)
      .where("t.created_at", "<=", yearTo)
      .where("t.order_id", "is", null)
      .where("t.deleted_at", "is", null)
      .where("m.parent_id", "is not", null)
      .groupBy("m.parent_id")
      .execute()
  }

  async getConsumptionFromWarehouseReport(
    c: Context,
    entityId: number,
    provinceId: number,
    regencyId: number,
    year: number,
    activityIds: number[] = [26],
    entityTagIds?: number[]
  ): Promise<Map<number, number>> {
    const previousYear = year - 1
    const from = `${previousYear}-01-01`
    const to = `${previousYear}-12-31`

    const params = new URLSearchParams({
      from,
      to,
      material_level_id: "2",
      entity_id: String(entityId),
      province_id: String(provinceId),
      regency_id: String(regencyId),
      information_type: "0",
      transaction_type: "103",
      activity_ids: "48",
    })

    if (entityTagIds && entityTagIds.length > 0) {
      params.set("entity_tag_ids", entityTagIds.join(","))
    }

    const baseUrl = env.SMILE_URL ?? ""
    const url = `${baseUrl}/warehouse-report/monitoring/transaction/material?${params.toString()}`

    const token = c.req.header("authorization") ?? ""
    const programId = c.req.header("x-program-id") ?? "1"

    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        authorization: token,
        "x-program-id": programId,
        "device-type": "web",
        timezone: "Asia/Jakarta",
      },
    })

    if (!res.ok) {
      return new Map()
    }

    const data = (await res.json()) as {
      list: Array<{ material: { id: number }; value: number }>
    }

    const map = new Map<number, number>()
    for (const item of data.list ?? []) {
      map.set(item.material.id, item.value ?? 0)
    }
    return map
  }

  async getActivityId(c: Context): Promise<number | undefined> {
    const row = await c.var.trx
      .selectFrom("ws_activities")
      .select("id")
      .where("name", "=", NON_BIAS_ACTIVITY)
      .where("program_id", "=", c.var.programId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return row ? Number(row.id) : undefined
  }
}
