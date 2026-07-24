import { Context } from "hono"
import { sql, SqlBool } from "kysely"
import { GetHistoryListQuery } from "./environmental-health-history.schema.js"

export class EnvironmentalHealthHistoryRepository {
  async getList(c: Context, params: GetHistoryListQuery) {
    const {
      page,
      paginate,
      keyword,
      entity_id,
      start_date,
      end_date,
      status,
      parameter_category_id,
      sample_collected_by,
      has_ikl,
      sort_by,
      sort_type,
      province_id,
      regency_id,
      health_center_id,
    } = params
    const offset = (page - 1) * paginate

    const programId = c.var.programId

    let query = c.var.trx
      .selectFrom("ws_environmental_tests as wet")
      // ws_entities for workspace-scoped entities (wet.entity_id = ws_entities.id)
      .leftJoin("ws_entities as ws_e", (join) =>
        join
          .onRef("ws_e.id", "=", "wet.entity_id")
          .on("ws_e.program_id", "=", programId)
      )
      // entities (global) as fallback for legacy records that store entities.id
      .leftJoin("entities as e", "e.id", "wet.entity_id")
      .innerJoin(
        "environmental_parameter_categories as epc",
        "wet.parameter_category_id",
        "epc.id"
      )
      .leftJoin("ws_activities as wa", "wet.activity_id", "wa.id")
      .leftJoin("entities as ee", "wet.examination_entity_id", "ee.id")
      .where("wet.deleted_at", "is", null)

    // Filter: entity_id (ws_entities.id = workspace-scoped entity id)
    if (entity_id) {
      query = query.where("ws_e.id", "=", entity_id)
    }

    // Filter: date range
    if (start_date) {
      query = query.where(sql<SqlBool>`wet.created_at >= ${`${start_date} 00:00:00`}`)
    }
    if (end_date) {
      query = query.where(sql<SqlBool>`wet.created_at <= ${`${end_date} 23:59:59`}`)
    }

    // Filter: keyword search on entity name (COALESCE ws_entities name → entities name)
    if (keyword) {
      query = query.where((eb) =>
        eb.or([
          eb(sql`COALESCE(ws_e.name, e.name)`, "like", `%${keyword}%`),
          eb("wet.sample_id", "like", `%${keyword}%`),
        ])
      )
    }

    // Filter: lab result status
    if (status) {
      query = query.where("wet.lab_result_status", "=", status)
    }

    // Filter: parameter category
    if (parameter_category_id) {
      query = query.where(
        "wet.parameter_category_id",
        "=",
        parameter_category_id
      )
    }

    // Filter: sample collected by
    if (sample_collected_by) {
      query = query.where("wet.sample_collected_by", "=", sample_collected_by)
    }

    // Filter: has IKL
    if (has_ikl !== undefined) {
      query = query.where("wet.has_ikl", "=", has_ikl ? 1 : 0)
    }

    // Filter: Province (ws_entities.province_id is varchar)
    if (province_id) {
      query = query.where("ws_e.province_id", "=", String(province_id))
    }

    // Filter: Regency (ws_entities.regency_id is varchar)
    if (regency_id) {
      query = query.where("ws_e.regency_id", "=", String(regency_id))
    }

    // Filter: Health Center (ws_entities.id = workspace entity id)
    if (health_center_id) {
      query = query.where("ws_e.id", "=", Number(health_center_id))
    }

    // Sorting
    const orderColumn =
      sort_by === "entity_name"
        ? sql`COALESCE(ws_e.name, e.name)`
        : sql.raw(`wet.${sort_by || "id"}`)
    const orderDirection = sort_type || "desc"

    const selectQuery = query.select([
      "wet.id",
      "wet.created_at",
      "wet.entity_id",
      sql<string>`COALESCE(ws_e.name, e.name)`.as("entity_name"),
      sql<string>`COALESCE(ws_e.address, e.address)`.as("entity_address"),
      "wet.parameter_category_id",
      "epc.name as parameter_category_name",
      "wet.activity_id",
      "wa.name as activity_name",
      "wet.test_material",
      "wet.sample_id",
      "wet.received_date",
      "wet.lab_result_status",
      "wet.test_start_date",
      "wet.test_end_date",
      "wet.sample_collected_by",
      "wet.location",
      "wet.collection_date",
      "wet.brand",
      "wet.packaging",
      "wet.has_ikl",
      "wet.ikl_test_date",
      "wet.ikl_score",
      "wet.examination_entity_id",
      "ee.name as examination_entity_name",
      "ee.regency_id as examination_entity_regency_id",
    ])

    const [data, countResult] = await Promise.all([
      selectQuery
        .orderBy(orderColumn as any, orderDirection)
        .limit(paginate)
        .offset(offset)
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    const testIds = data.map((d) => d.id)
    const { testResultsMap, testInventoriesMap } = await this.fetchRelatedData(
      c,
      testIds
    )

    return {
      data,
      testResultsMap,
      testInventoriesMap,
      total: Number(countResult.total),
    }
  }

  async getListForExport(c: Context, params: GetHistoryListQuery) {
    // Re-use getList with large paginate & page=1
    return await this.getList(c, {
      ...params,
      page: 1,
      paginate: 10000,
    })
  }

  async getById(c: Context, id: number) {
    const programId = c.var.programId
    const data = await c.var.trx
      .selectFrom("ws_environmental_tests as wet")
      .leftJoin("ws_entities as ws_e", (join) =>
        join
          .onRef("ws_e.id", "=", "wet.entity_id")
          .on("ws_e.program_id", "=", programId)
      )
      .leftJoin("entities as e", "e.id", "wet.entity_id")
      .innerJoin(
        "environmental_parameter_categories as epc",
        "wet.parameter_category_id",
        "epc.id"
      )
      .leftJoin("ws_activities as wa", "wet.activity_id", "wa.id")
      .leftJoin("asset_inventories as ma_ai", "wet.management_asset_id", "ma_ai.id")
      .leftJoin("asset_models as ma_model", "ma_ai.asset_model_id", "ma_model.id")
      .leftJoin("asset_working_statuses as ma_ws", "ma_ai.working_status_id", "ma_ws.id")
      .leftJoin("asset_types as ma_at", "ma_ai.asset_type_id", "ma_at.id")
      .leftJoin(
        "locations as loc_village",
        sql`loc_village.id`,
        sql`COALESCE(ws_e.village_id, e.village_id)`
      )
      .leftJoin(
        "locations as loc_subdistrict",
        sql`loc_subdistrict.id`,
        sql`COALESCE(ws_e.sub_district_id, e.sub_district_id)`
      )
      .leftJoin(
        "locations as loc_regency",
        sql`loc_regency.id`,
        sql`COALESCE(ws_e.regency_id, e.regency_id)`
      )
      .leftJoin(
        "locations as loc_province",
        sql`loc_province.id`,
        sql`COALESCE(ws_e.province_id, e.province_id)`
      )
      .leftJoin("entities as ee", "wet.examination_entity_id", "ee.id")
      .select([
        "wet.id",
        "wet.created_at",
        "wet.entity_id",
        sql<string>`COALESCE(ws_e.name, e.name)`.as("entity_name"),
        sql<string>`COALESCE(
          NULLIF(NULLIF(ws_e.address, '-'), ''),
          NULLIF(NULLIF(e.address, '-'), '')
        )`.as("entity_address"),
        sql<string | null>`NULLIF(CONCAT_WS(', ',
          loc_village.name,
          loc_subdistrict.name,
          loc_regency.name,
          loc_province.name
        ), '')`.as("entity_location_string"),
        sql<string | null>`NULLIF(CONCAT_WS(', ',
          CASE WHEN loc_village.name IS NOT NULL THEN CONCAT('Kel. ', loc_village.name) END,
          CASE WHEN loc_subdistrict.name IS NOT NULL THEN CONCAT('Kec. ', loc_subdistrict.name) END,
          loc_regency.name,
          loc_province.name
        ), '')`.as("entity_location_address"),
        sql<number | null>`wa.is_final_distribution`.as("is_final_distribution"),
        "wet.parameter_category_id",
        "epc.name as parameter_category_name",
        "wet.activity_id",
        "wa.name as activity_name",
        "wet.test_material",
        "wet.sample_id",
        "wet.received_date",
        "wet.lab_result_status",
        "wet.test_start_date",
        "wet.test_end_date",
        "wet.sample_collected_by",
        "wet.location",
        "wet.collection_date",
        "wet.brand",
        "wet.packaging",
        "wet.has_ikl",
        "wet.ikl_test_date",
        "wet.ikl_score",
        "wet.management_asset_id",
        sql<string | null>`COALESCE(ma_model.name, ma_ai.other_asset_model_name)`.as("management_asset_model_name"),
        "ma_ai.serial_number as management_asset_serial_number",
        "ma_ai.production_year as management_asset_production_year",
        "ma_ws.name as management_asset_working_status",
        "ma_at.name as management_asset_type_name",
        "wet.examination_entity_id",
        "ee.name as examination_entity_name",
        "ee.regency_id as examination_entity_regency_id",
      ])
      .where("wet.id", "=", id)
      .where("wet.deleted_at", "is", null)
      .executeTakeFirst()

    if (!data) return null

    // Fetch test results
    const testResults = await c.var.trx
      .selectFrom("ws_test_results as wtr")
      .leftJoin(
        "environmental_test_methods as etm",
        "wtr.test_methods_id",
        "etm.id"
      )
      .select([
        "wtr.id",
        "wtr.environmental_test_id",
        "wtr.analysis_parameter_id",
        "wtr.parameter_name",
        "wtr.quality_standard",
        "wtr.unit",
        "wtr.test_methods_id",
        "etm.name as test_methods_name",
        "wtr.result_value",
        "wtr.is_custom",
      ])
      .where("wtr.environmental_test_id", "=", id)
      .where("wtr.deleted_at", "is", null)
      .execute()

    // Fetch inventories
    const inventories = await c.var.trx
      .selectFrom("ws_test_inventories as wti")
      .innerJoin("ws_asset_inventories as wai", "wti.inventory_id", "wai.id")
      .innerJoin("ws_asset_models as wam", "wai.asset_model_id", "wam.id")
      .select([
        "wti.environmental_test_id",
        "wai.id",
        "wam.name as model_name",
        "wai.serial_number",
      ])
      .where("wti.environmental_test_id", "=", id)
      .where("wti.deleted_at", "is", null)
      .execute()

    return {
      data,
      testResults: testResults.map((r) => ({
        id: r.id,
        environmental_test_id: r.environmental_test_id,
        analysis_parameter_id: r.analysis_parameter_id,
        parameter_name: r.parameter_name,
        quality_standard: r.quality_standard,
        unit: r.unit,
        test_methods_id: r.test_methods_id,
        test_methods_name: r.test_methods_name,
        result_value: r.result_value,
        is_custom: r.is_custom === 1 || r.is_custom === true,
      })),
      inventories: inventories.map((inv) => ({
        id: Number(inv.id),
        model_name: inv.model_name,
        serial_number: inv.serial_number,
      })),
    }
  }

  async getDistributionDetails(c: Context, testId: number) {
    return await c.var.trx
      .selectFrom("ws_environmental_tests_detail as wetd")
      .innerJoin("ws_transactions as wt", "wetd.transaction_id", "wt.id")
      .leftJoin("ws_stocks as ws", "wt.stock_id", "ws.id")
      .leftJoin("ws_materials as wm", "ws.material_id", "wm.id")
      .leftJoin("ws_materials as wmp", "wm.parent_id", "wmp.id")
      .leftJoin("ws_batches as wb", "ws.batch_id", "wb.id")
      .leftJoin("ws_manufactures as wmf", "wb.manufacture_id", "wmf.id")
      .leftJoin("ws_orders as wo", "wt.order_id", "wo.id")
      .leftJoin("ws_entities as we_vendor", "wo.vendor_id", "we_vendor.id")
      .leftJoin(
        "ws_entities as we_customer",
        "wo.customer_id",
        "we_customer.id"
      )
      .select([
        "wt.id as transaction_id",
        sql<string>`COALESCE(wmp.name, wm.name)`.as("material_name"),
        "wm.name as material_full_name",
        "wt.change_qty as change_qty",
        "we_vendor.name as vendor_name",
        "we_customer.name as customer_name",
        "wt.actual_transaction_date as actual_transaction_date",
        "wb.code as batch_code",
        "wb.expired_date as batch_expired_date",
        "wmf.name as manufacture_name",
        "wb.production_date as batch_production_date",
        "wb.status as batch_status",
        "wt.opening_qty as opening_qty",
        "wt.created_at as created_at",
        "wt.updated_at as updated_at",
      ])
      .where("wetd.environmental_test_id", "=", testId)
      .where("wetd.is_transaction", "=", 1)
      .where("wetd.deleted_at", "is", null)
      .where("wt.deleted_at", "is", null)
      .orderBy("wt.created_at", "desc")
      .execute()
  }

  async getOnlyById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("ws_environmental_tests")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async delete(c: Context, id: number) {
    return await c.var.trx
      .updateTable("ws_environmental_tests")
      .set({ deleted_at: new Date() })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getParameterCategoryFields(c: Context, categoryId: number) {
    return await c.var.trx
      .selectFrom("environmental_parameter_categories_fields" as any)
      .select([
        "id",
        "key",
        "type_data as type",
        "label",
        "hint",
        "mandatory",
        "options",
      ])
      .where("environmental_parameter_categories_id", "=", categoryId)
      .where("deleted_at", "is", null)
      .orderBy("id", "asc")
      .execute()
  }

  async getTestFieldsByTestIds(c: Context, testIds: number[]) {
    if (testIds.length === 0) return []

    return (await c.var.trx
      .selectFrom("ws_environmental_test_field" as any)
      .select(["id", "environmental_test_id", "key", "label", "value"])
      .where("environmental_test_id", "in", testIds)
      .where("deleted_at", "is", null)
      .execute()) as Array<{
      id: number
      environmental_test_id: number
      key: string
      label: string
      value: string | null
    }>
  }

  async getTestFieldsByTestId(c: Context, testId: number) {
    return (await c.var.trx
      .selectFrom("ws_environmental_test_field" as any)
      .select(["id", "key", "label", "value"])
      .where("environmental_test_id", "=", testId)
      .where("deleted_at", "is", null)
      .execute()) as Array<{
      id: number
      key: string
      label: string
      value: string | null
    }>
  }

  private async fetchRelatedData(c: Context, testIds: number[]) {
    let testResultsMap: Record<number, Record<string, unknown>[]> = {}
    let testInventoriesMap: Record<number, Record<string, unknown>[]> = {}

    if (testIds.length === 0) {
      return { testResultsMap, testInventoriesMap }
    }

    // Fetch inventories
    const inventories = await c.var.trx
      .selectFrom("ws_test_inventories as wti")
      .innerJoin("ws_asset_inventories as wai", "wti.inventory_id", "wai.id")
      .innerJoin("ws_asset_models as wam", "wai.asset_model_id", "wam.id")
      .select([
        "wti.environmental_test_id",
        "wai.id",
        "wam.name as model_name",
        "wai.serial_number",
      ])
      .where("wti.environmental_test_id", "in", testIds)
      .where("wti.deleted_at", "is", null)
      .execute()

    testInventoriesMap = inventories.reduce(
      (acc, item) => {
        const testId = Number(item.environmental_test_id)
        if (!acc[testId]) acc[testId] = []
        acc[testId].push({
          id: Number(item.id),
          model_name: item.model_name,
          serial_number: item.serial_number,
        })
        return acc
      },
      {} as Record<number, Record<string, unknown>[]>
    )

    // Fetch test results
    const testResults = await c.var.trx
      .selectFrom("ws_test_results as wtr")
      .leftJoin(
        "environmental_test_methods as etm",
        "wtr.test_methods_id",
        "etm.id"
      )
      .select([
        "wtr.id",
        "wtr.environmental_test_id",
        "wtr.analysis_parameter_id",
        "wtr.parameter_name",
        "wtr.quality_standard",
        "wtr.unit",
        "wtr.test_methods_id",
        "etm.name as test_methods_name",
        "wtr.result_value",
        "wtr.is_custom",
      ])
      .where("wtr.environmental_test_id", "in", testIds)
      .where("wtr.deleted_at", "is", null)
      .execute()

    testResultsMap = testResults.reduce(
      (acc, result) => {
        const testId = result.environmental_test_id
        if (!acc[testId]) acc[testId] = []
        acc[testId].push({
          id: result.id,
          environmental_test_id: result.environmental_test_id,
          analysis_parameter_id: result.analysis_parameter_id,
          parameter_name: result.parameter_name,
          quality_standard: result.quality_standard,
          unit: result.unit,
          test_methods_id: result.test_methods_id,
          test_methods_name: result.test_methods_name,
          result_value: result.result_value,
          is_custom: result.is_custom === 1 || result.is_custom === true,
        })
        return acc
      },
      {} as Record<number, Record<string, unknown>[]>
    )

    return { testResultsMap, testInventoriesMap }
  }
}
