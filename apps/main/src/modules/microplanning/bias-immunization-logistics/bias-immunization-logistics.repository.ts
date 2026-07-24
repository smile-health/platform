import { BIAS_ACTIVITY } from "@/common/constants/target.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "hono"
import { Insertable, sql } from "kysely"
import moment from "moment"

export class BiasImmunizationLogisticsRepository {
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
      .select([
        "wmn.id",
        "wmn.material_target_id",
        "wmn.material_id",
        "wmn.reference_id",
      ])
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
          .onRef("wmtc.material_target_ref_id", "=", "wmn.material_target_id")
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
        "ws_vaccine_utilization_rate as wvur",
        "wmn.id",
        "wvur.material_need_id"
      )
      .leftJoin("ws_additional_needs as wan", "wmn.id", "wan.material_need_id")
      .select([
        "wmn.id as material_need_id",
        "wmn.total_needs",
        sql<
          string | null
        >`COALESCE(wmtc.injection_month, wmt.injection_month)`.as(
          "injection_month"
        ),
        // sql<number>`COALESCE(wmtc.material_id, wmt.material_id)`.as("material_id"),
        "wmn.material_id",
        sql<string>`COALESCE(wmtc.category, wmt.category)`.as("category"),
        sql<string>`COALESCE(wmtc.type, wmt.type)`.as("type"),
        "wmnd.absolute_number_of_routine_immunization",
        "wmnd.number_of_vials_used",
        "wmnd.remaining_stock as detail_remaining_stock",
        "wvur.vaccine_utilization_rate",
        "wan.remaining_stock as additional_remaining_stock",
        "wan.total as additional_total",
      ])
      .where("wmn.reference_id", "=", referenceId)
      .where("wmn.reference_type", "=", referenceType)
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.deleted_at", "is", null)

    if (mpProgramConfigId) {
      query = query.where((eb) =>
        eb.or([
          eb("wmtc.mp_program_config_id", "=", mpProgramConfigId),
          eb("wmtc.id", "is", null),
        ])
      )
    }

    return query.execute()
  }

  async getExistingMaterialAds(
    c: Context,
    referenceId: number,
    referenceType: string,
    microplanningId: number
  ) {
    return c.var.trx
      .selectFrom("ws_material_needs as wmn")
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
        "ws_vaccine_utilization_rate as wvur",
        "wmn.id",
        "wvur.material_need_id"
      )
      .leftJoin("ws_additional_needs as wan", "wmn.id", "wan.material_need_id")
      .select([
        "wmn.id as material_need_id",
        "wmn.total_needs",
        "wmt.injection_month",
        "wmn.material_id",
        "wmt.category",
        "wmt.type",
        "wmnd.absolute_number_of_routine_immunization",
        "wmnd.number_of_vials_used",
        "wmnd.remaining_stock as detail_remaining_stock",
        "wvur.vaccine_utilization_rate",
        "wan.remaining_stock as additional_remaining_stock",
        "wan.total as additional_total",
      ])
      .where("wmn.reference_id", "=", referenceId)
      .where("wmn.reference_type", "=", referenceType)
      .where("wmn.microplanning_id", "=", microplanningId)
      .where("wmn.deleted_at", "is", null)
      .execute()
  }

  async getSchoolsBySubDistrictWithMaterialNeeds(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    keyword?: string
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplanning_schools as s")
      .leftJoin("ws_material_needs as wmn", (join) =>
        join
          .onRef("wmn.reference_id", "=", "s.school_id")
          .on("wmn.reference_type", "=", "school")
          .on("wmn.microplanning_id", "=", microplanningId)
          .on("wmn.deleted_at", "is", null)
      )
      .select([
        "s.school_id",
        "s.name as school_name",
        "wmn.id as material_need_id",
      ])
      .where("s.microplanning_id", "=", microplanningId)
      .where("s.is_assigned", "=", 1)

    if (keyword) {
      query = query.where("s.name", "like", `%${keyword}%`)
    }

    return query.groupBy("s.school_id").orderBy("s.school_id", "asc").execute()
  }

  async updateMaterialNeed(
    c: Context,
    materialNeedId: number,
    totalNeeds: number | null
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
      absolute_number_of_routine_immunization: number | null
      number_of_vials_used: number | null
      remaining_stock: number | null
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
      request_qty: number | null
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
      total: number | null
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
    schoolId: number,
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
      .where("wmn.reference_id", "=", schoolId)
      .where("wmn.reference_type", "=", "school")
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
          .where("wmtc_f.category", "=", "bias")
          .where("wmtc_f.type", "=", "primary")
          .where("wmtc_f.deleted_at", "is", null)
      )
      .execute()
  }

  async getActivityId(c: Context): Promise<number | undefined> {
    const row = await c.var.trx
      .selectFrom("ws_activities")
      .select("id")
      .where("name", "=", BIAS_ACTIVITY)
      .where("program_id", "=", c.var.programId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return row ? Number(row.id) : undefined
  }

  async getConsumptionRaw(
    c: Context,
    entityId: number,
    year: number,
    activityIds?: number[],
    materialIds?: number[]
  ): Promise<{
    entity_id: number
    rows: Array<{
      material_id: number | null
      material_name: string | null
      total_qty: number | null
    }>
  }> {
    const fromDate = moment.utc(`${year - 1}-01-01`).toDate()
    const toDate = moment.utc(`${year - 1}-12-31`).toDate()

    let query = c.var.trx
      .selectFrom("ws_stocks as s")
      .innerJoin("ws_materials as m", "m.id", "s.material_id")
      .innerJoin("ws_batches as b", "b.id", "s.batch_id")
      .select([
        "m.id as material_id",
        "m.name as material_name",
        (eb) => eb.fn.sum("s.qty").as("total_qty"),
      ])
      .where("s.deleted_at", "is", null)
      .where("s.entity_id", "=", entityId)
      .where("m.deleted_at", "is", null)
      .where("m.program_id", "=", c.var.programId)
      .where("s.qty", ">", 0)
      .where((eb) =>
        eb.or([
          eb("b.expired_date", ">=", fromDate),
          eb("b.expired_date", "is", null),
        ])
      )
      .where((eb) =>
        eb.or([
          eb("b.expired_date", "<=", toDate),
          eb("b.expired_date", "is", null),
        ])
      )

    if (activityIds && activityIds.length > 0) {
      query = query.where("s.activity_id", "in", activityIds)
    }

    if (materialIds && materialIds.length > 0) {
      query = query.where("s.material_id", "in", materialIds)
    }

    const rows = await query.groupBy(["m.id", "m.name"]).execute()

    return { entity_id: entityId, rows }
  }
}
