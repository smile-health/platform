import { sql } from "kysely"
import { Context } from "hono"

export class EnvironmentalHealthRepository {
  async getEntities(
    c: Context,
    params: {
      page: number
      perPage: number
      search?: string
      provinceId?: string | null
      regencyId?: string | null
      subDistrictId?: string | null
    }
  ) {
    const { page, perPage, search, provinceId, regencyId, subDistrictId } =
      params
    const offset = (page - 1) * perPage

    let query = c.var.trx
      .selectFrom("entities as e")
      .where("e.entity_tag_id", "in", [42, 43, 44, 45])
      .where("e.deleted_at", "is", null)

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb("e.name", "like", `%${search}%`),
          eb("e.address", "like", `%${search}%`),
        ])
      )
    }

    if (provinceId) {
      query = query.where("e.province_id", "=", provinceId)
    }

    if (regencyId) {
      query = query.where("e.regency_id", "=", regencyId)
    }

    if (subDistrictId) {
      query = query.where("e.sub_district_id", "=", subDistrictId)
    }

    const [data, countResult] = await Promise.all([
      query
        .selectAll("e")
        .select([
          sql<number | null>`(
            SELECT wo.id FROM ws_orders wo
            INNER JOIN ws_entities we ON we.id = wo.customer_id
            INNER JOIN ws_customer_vendors wcv
              ON wcv.customer_id = wo.customer_id
              AND wcv.vendor_id = wo.vendor_id
              AND wcv.deleted_at IS NULL
              AND wcv.is_distribution = 1
            WHERE we.global_id = e.id AND wo.deleted_at IS NULL
            ORDER BY wo.created_at DESC
            LIMIT 1
          )`.as("last_order_id"),
          sql<Date | null>`(
            SELECT wo.created_at FROM ws_orders wo
            INNER JOIN ws_entities we ON we.id = wo.customer_id
            INNER JOIN ws_customer_vendors wcv
              ON wcv.customer_id = wo.customer_id
              AND wcv.vendor_id = wo.vendor_id
              AND wcv.deleted_at IS NULL
              AND wcv.is_distribution = 1
            WHERE we.global_id = e.id AND wo.deleted_at IS NULL
            ORDER BY wo.created_at DESC
            LIMIT 1
          )`.as("last_distribution_date"),
          sql<string | null>`(
            SELECT wos.name FROM ws_orders wo
            INNER JOIN ws_entities we ON we.id = wo.customer_id
            INNER JOIN ws_customer_vendors wcv
              ON wcv.customer_id = wo.customer_id
              AND wcv.vendor_id = wo.vendor_id
              AND wcv.deleted_at IS NULL
              AND wcv.is_distribution = 1
            INNER JOIN ws_order_statuses wos ON wos.id = wo.order_status_id
            WHERE we.global_id = e.id AND wo.deleted_at IS NULL
            ORDER BY wo.created_at DESC
            LIMIT 1
          )`.as("last_distribution_status"),
        ])
        .orderBy(sql`last_distribution_date IS NULL`, "asc")
        .orderBy("last_distribution_date", "desc")
        .orderBy("e.id", "desc")
        .limit(perPage)
        .offset(offset)
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data,
      total: Number(countResult.total),
      page,
      perPage,
    }
  }

  async getEntitiesByVendor(
    c: Context,
    params: {
      page: number
      perPage: number
      search?: string
      vendorId: number
    }
  ) {
    const { page, perPage, search, vendorId } = params
    const offset = (page - 1) * perPage

    let query = c.var.trx
      .selectFrom("ws_entities as e")
      .innerJoin("ws_customer_vendors as cv", "cv.customer_id", "e.id")
      .leftJoin("locations as p", (join) =>
        join.onRef("p.id", "=", "e.province_id").on("p.level", "=", 0)
      )
      .leftJoin("locations as r", (join) =>
        join
          .onRef("r.id", "=", "e.regency_id")
          .onRef("r.parent_id", "=", "p.id")
          .on("r.level", "=", 1)
      )
      .leftJoin("locations as sd", (join) =>
        join
          .onRef("sd.id", "=", "e.sub_district_id")
          .onRef("sd.parent_id", "=", "r.id")
          .on("sd.level", "=", 2)
      )
      .where("cv.vendor_id", "=", vendorId)
      .where("cv.is_consumption", "=", 1)
      .where("cv.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)

    if (search) {
      query = query.where("e.name", "like", `%${search}%`)
    }

    const [data, countResult] = await Promise.all([
      query
        .select([
          "e.id",
          "e.name",
          "e.address",
          "e.province_id",
          "e.regency_id",
          "e.sub_district_id",
          sql<string>`CONCAT_WS(', ', sd.name, r.name, p.name)`.as("location"),
          sql<number | null>`(
            SELECT wo.id FROM ws_orders wo
            WHERE wo.customer_id = e.id AND wo.deleted_at IS NULL
              AND wo.vendor_id = ${vendorId}
            ORDER BY wo.created_at DESC LIMIT 1
          )`.as("last_order_id"),
          sql<Date | null>`(
            SELECT wo.created_at FROM ws_orders wo
            WHERE wo.customer_id = e.id AND wo.deleted_at IS NULL
              AND wo.vendor_id = ${vendorId}
            ORDER BY wo.created_at DESC LIMIT 1
          )`.as("last_distribution_date"),
          sql<string | null>`(
            SELECT wos.name FROM ws_orders wo
            INNER JOIN ws_order_statuses wos ON wos.id = wo.order_status_id
            WHERE wo.customer_id = e.id AND wo.deleted_at IS NULL
              AND wo.vendor_id = ${vendorId}
            ORDER BY wo.created_at DESC LIMIT 1
          )`.as("last_distribution_status"),
        ])
        .orderBy(sql`last_distribution_date IS NULL`, "asc")
        .orderBy(sql`last_distribution_date`, "desc")
        .orderBy("e.id", "desc")
        .limit(perPage)
        .offset(offset)
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data,
      total: Number(countResult.total),
      page,
      perPage,
    }
  }

  async getParameterCategories(c: Context, params?: { activityId?: number }) {
    let query = c.var.trx
      .selectFrom("environmental_parameter_categories as epc")
      .select(["epc.id", "epc.name"])
      .where("epc.deleted_at", "is", null)

    if (params?.activityId) {
      query = query
        .innerJoin(
          "ws_activity_environmental_parameter_categories as waepc",
          "waepc.environmental_parameter_categories_id",
          "epc.id"
        )
        .where("waepc.activity_id", "=", params.activityId)
    }

    return await query.orderBy("epc.id", "asc").execute()
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

  async getAnalysisParameters(
    c: Context,
    params?: { parameterCategoryId?: number }
  ) {
    const rows = await this.fetchAnalysisParameterRows(c, params)
    const methodIds = this.extractUniqueMethodIds(rows, "test_method_id")

    const [validationRules, options] = await this.fetchValidationAndOptions(
      c,
      methodIds
    )

    return this.groupRowsToParameters(rows, validationRules, options, {
      methodIdKey: "test_method_id",
      methodNameKey: "test_method_name",
      includeExtendedFields: true,
    })
  }

  private async fetchAnalysisParameterRows(
    c: Context,
    params?: { parameterCategoryId?: number }
  ) {
    let query = c.var.trx
      .selectFrom("environmental_analysis_parameters as eap")
      .innerJoin(
        "ws_environmental_parameter_category_details as wepcd",
        "eap.id",
        "wepcd.env_analysis_parameter_id"
      )
      .leftJoin(
        "environmental_test_methods as etm",
        "wepcd.env_test_method_id",
        "etm.id"
      )
      .leftJoin("environmental_units as eu", "eap.unit_id", "eu.id")
      .select([
        "wepcd.env_analysis_parameter_id as id",
        "wepcd.env_parameter_category_id as parameter_category_id",
        "wepcd.id as env_parameter_category_detail_id",
        "eap.name as name",
        "eap.unit_id",
        "eu.name as unit",
        "eap.result_data_type",
        "etm.quality_standard",
        "etm.name as test_method_name",
        "etm.id as test_method_id",
      ])
      .where("eap.deleted_at", "is", null)
      .where("wepcd.deleted_at", "is", null)

    if (params?.parameterCategoryId) {
      query = query.where(
        "wepcd.env_parameter_category_id",
        "=",
        params.parameterCategoryId
      )
    }

    return await query.orderBy("eap.id", "asc").execute()
  }

  private extractUniqueMethodIds(
    rows: Array<Record<string, unknown>>,
    methodIdKey: string
  ): number[] {
    return [
      ...new Set(
        rows
          .map((r) => (r[methodIdKey] ? Number(r[methodIdKey]) : null))
          .filter((id): id is number => id !== null)
      ),
    ]
  }

  private async fetchValidationAndOptions(
    c: Context,
    methodIds: number[]
  ): Promise<[any[], any[]]> {
    if (methodIds.length === 0) return [[], []]

    return await Promise.all([
      this.getValidationRulesByMethodIds(c, methodIds),
      this.getOptionsByMethodIds(c, methodIds),
    ])
  }

  private groupRowsToParameters(
    rows: Array<Record<string, unknown>>,
    validationRules: any[],
    options: any[],
    config: {
      methodIdKey: string
      methodNameKey: string
      includeExtendedFields: boolean
    }
  ) {
    const parameterMap = new Map<number, any>()

    for (const row of rows) {
      const parameterId = Number(row.id)
      this.ensureParameterInMap(parameterMap, parameterId, row, config)
      this.addTestMethodToParameter(
        parameterMap.get(parameterId),
        row,
        validationRules,
        options,
        config
      )
    }

    return Array.from(parameterMap.values())
  }

  private ensureParameterInMap(
    parameterMap: Map<number, any>,
    parameterId: number,
    row: Record<string, unknown>,
    config: { includeExtendedFields: boolean }
  ) {
    if (parameterMap.has(parameterId)) return

    const baseParameter = {
      id: parameterId,
      name: row.name,
      unit_id: row.unit_id,
      unit: row.unit,
      test_methods: [],
    }

    if (config.includeExtendedFields) {
      Object.assign(baseParameter, {
        parameter_category_id: row.parameter_category_id,
        env_parameter_category_detail_id: row.env_parameter_category_detail_id,
        result_data_type: row.result_data_type,
      })
    }

    parameterMap.set(parameterId, baseParameter)
  }

  private addTestMethodToParameter(
    parameter: any,
    row: Record<string, unknown>,
    validationRules: any[],
    options: any[],
    config: { methodIdKey: string; methodNameKey: string }
  ) {
    const methodIdValue = row[config.methodIdKey]
    if (!methodIdValue) return

    const methodId = Number(methodIdValue)
    const alreadyExists = parameter.test_methods.some(
      (m: any) => m.id === methodId
    )
    if (alreadyExists) return

    const methodValidation = validationRules.find(
      (v) => Number(v.test_method_id) === methodId
    )
    const methodOptions = options
      .filter((o) => Number(o.test_method_id) === methodId)
      .map((o) => o.option_value)

    parameter.test_methods.push({
      id: methodId,
      name: row[config.methodNameKey],
      unit_id: row.unit_id,
      unit: row.unit,
      quality_standard: row.quality_standard,
      validation: this.mapValidation(methodValidation, methodOptions),
    })
  }

  async getAnalysisParameterWithMethods(c: Context, categoryId: number) {
    const rows = await this.fetchParameterWithMethodsRows(c, categoryId)
    const methodIds = this.extractUniqueMethodIds(rows, "method_id")

    const [validationRules, options] = await this.fetchValidationAndOptions(
      c,
      methodIds
    )

    return this.groupRowsToParameters(rows, validationRules, options, {
      methodIdKey: "method_id",
      methodNameKey: "method_name",
      includeExtendedFields: false,
    })
  }

  private async fetchParameterWithMethodsRows(c: Context, categoryId: number) {
    return await c.var.trx
      .selectFrom("environmental_analysis_parameters as eap")
      .innerJoin(
        "ws_environmental_parameter_category_details as wepcd",
        "eap.id",
        "wepcd.env_analysis_parameter_id"
      )
      .leftJoin(
        "environmental_test_methods as etm",
        "wepcd.env_test_method_id",
        "etm.id"
      )
      .leftJoin("environmental_units as eu", "eap.unit_id", "eu.id")
      .select([
        "eap.id",
        "eap.name",
        "eap.unit_id",
        "eu.name as unit",
        "etm.id as method_id",
        "etm.name as method_name",
        "etm.quality_standard",
      ])
      .where("wepcd.env_parameter_category_id", "=", categoryId)
      .where("eap.deleted_at", "is", null)
      .where("wepcd.deleted_at", "is", null)
      .orderBy("eap.id", "asc")
      .execute()
  }

  private mapValidation(
    methodValidation: Record<string, unknown> | undefined,
    methodOptions: string[]
  ) {
    if (!methodValidation) return null

    return {
      result_format_type: methodValidation.result_format_type,
      validation_type: methodValidation.validation_type,
      min_value: methodValidation.min_value
        ? Number(methodValidation.min_value)
        : null,
      max_value: methodValidation.max_value
        ? Number(methodValidation.max_value)
        : null,
      comparison_operator: methodValidation.comparison_operator || null,
      comparison_value: methodValidation.comparison_value
        ? Number(methodValidation.comparison_value)
        : null,
      allow_decimal: !!methodValidation.allow_decimal,
      options: methodOptions,
    }
  }

  async getValidationRulesByMethodIds(c: Context, methodIds: number[]) {
    return await c.var.trx
      .selectFrom("environmental_parameter_validation_rules" as any)
      .selectAll()
      .where("test_method_id", "in", methodIds)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getOptionsByMethodIds(c: Context, methodIds: number[]) {
    return await c.var.trx
      .selectFrom("environmental_parameter_options" as any)
      .select(["test_method_id", "option_value", "sort_order"])
      .where("test_method_id", "in", methodIds)
      .where("deleted_at", "is", null)
      .orderBy("sort_order", "asc")
      .execute()
  }

  async createEnvironmentalTest(c: Context, data: Record<string, unknown>) {
    const result = await c.var.trx
      .insertInto("ws_environmental_tests")
      .values(data)
      .executeTakeFirst()

    return Number(result?.insertId)
  }

  async createTestInventories(
    c: Context,
    testId: number,
    inventoryIds: number[]
  ) {
    if (inventoryIds.length === 0) return

    const values = inventoryIds.map((id) => ({
      environmental_test_id: testId,
      inventory_id: id,
    }))

    await c.var.trx.insertInto("ws_test_inventories").values(values).execute()
  }

  async checkInventoriesExist(c: Context, ids: number[]) {
    if (ids.length === 0) return true

    const count = await c.var.trx
      .selectFrom("ws_asset_inventories")
      .select((fn) => fn.fn.countAll().as("total"))
      .where("id", "in", ids)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return Number(count?.total) === ids.length
  }

  async checkEntitiesExist(c: Context, ids: number[]) {
    if (ids.length === 0) return true

    const count = await c.var.trx
      .selectFrom("ws_entities")
      .select((fn) => fn.fn.countAll().as("total"))
      .where("id", "in", ids)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return Number(count?.total) === ids.length
  }

  async checkTransactionsExist(c: Context, ids: number[]) {
    if (ids.length === 0) return true

    const count = await c.var.trx
      .selectFrom("ws_transactions")
      .select((fn) => fn.fn.countAll().as("total"))
      .where("id", "in", ids)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return Number(count?.total) === ids.length
  }

  async createTestDetails(
    c: Context,
    details: Array<{
      environmental_test_id: number
      entity_id: number
      is_transaction: number
      transaction_id: number | null
    }>
  ) {
    if (details.length === 0) return
    await c.var.trx
      .insertInto("ws_environmental_tests_detail")
      .values(details)
      .execute()
  }

  async getTestDetailsByTestIds(c: Context, testIds: number[]) {
    if (testIds.length === 0) return []
    return (await c.var.trx
      .selectFrom("ws_environmental_tests_detail as wetd")
      .leftJoin("ws_entities as we", "wetd.entity_id", "we.id")
      .select([
        "wetd.id",
        "wetd.environmental_test_id",
        "wetd.entity_id",
        "wetd.is_transaction",
        "wetd.transaction_id",
        "we.name as entity_name",
      ])
      .where("wetd.environmental_test_id", "in", testIds)
      .where("wetd.deleted_at", "is", null)
      .execute()) as Array<{
      id: number
      environmental_test_id: number
      entity_id: number
      is_transaction: number
      transaction_id: number | null
      entity_name: string | null
    }>
  }

  async createTestResults(c: Context, results: Record<string, unknown>[]) {
    if (results.length === 0) {
      return
    }

    await c.var.trx.insertInto("ws_test_results").values(results).execute()
  }

  async getHistory(
    c: Context,
    params: {
      page: number
      perPage: number
      search?: string
      entityId?: number
      startDate?: string
      endDate?: string
      status?: "completed" | "pending"
      isExport?: boolean
    }
  ) {
    const {
      page,
      perPage,
      search,
      entityId,
      startDate,
      endDate,
      status,
      isExport,
    } = params
    const offset = (page - 1) * perPage

    let query = c.var.trx
      .selectFrom("ws_environmental_tests as wet")
      .leftJoin("entities as e", "wet.entity_id", "e.id")
      .leftJoin("ws_entities as we_main", "wet.entity_id", "we_main.id")
      .leftJoin("users as u", "wet.created_by", "u.id")
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
      .leftJoin("entities as ee", "wet.examination_entity_id", "ee.id")
      .where("wet.deleted_at", "is", null)

    if (entityId) {
      query = query.where("u.entity_id", "=", entityId)
    }

    if (startDate) {
      query = query.where("wet.created_at", ">=", `${startDate} 00:00:00`)
    }

    if (endDate) {
      query = query.where("wet.created_at", "<=", `${endDate} 23:59:59`)
    }

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb("e.name", "like", `%${search}%`),
          eb("we_main.name", "like", `%${search}%`),
          eb("wet.sample_id", "like", `%${search}%`),
        ])
      )
    }

    if (status) {
      query = query.where("wet.lab_result_status", "=", status)
    }

    if (isExport) {
      const data = await query
        .select([
          "wet.id",
          "wet.created_at",
          "wet.entity_id",
          sql<string | null>`COALESCE(e.name, we_main.name)`.as("entity_name"),
          sql<string | null>`COALESCE(e.address, we_main.address)`.as(
            "entity_address"
          ),
          "wet.parameter_category_id",
          "wet.activity_id",
          "wa.name as activity_name",
          "epc.name as parameter_category_name",
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
          sql<
            string | null
          >`COALESCE(ma_model.name, ma_ai.other_asset_model_name)`.as(
            "management_asset_model_name"
          ),
          "ma_ai.serial_number as management_asset_serial_number",
          "ma_ai.production_year as management_asset_production_year",
          "ma_ws.name as management_asset_working_status",
          "ma_at.name as management_asset_type_name",
          "wet.examination_entity_id",
          "ee.name as examination_entity_name",
          "ee.regency_id as examination_entity_regency_id",
        ])
        .orderBy("wet.id", "desc")
        .execute()

      const exportTestIds = data.map((d) => d.id)
      let testResultsMap: Record<number, Record<string, unknown>[]> = {}
      let testInventoriesMap: Record<number, Record<string, unknown>[]> = {}

      if (exportTestIds.length > 0) {
        // Fetch inventories
        const inventories = await c.var.trx
          .selectFrom("ws_test_inventories as wti")
          .innerJoin(
            "ws_asset_inventories as wai",
            "wti.inventory_id",
            "wai.id"
          )
          .innerJoin("ws_asset_models as wam", "wai.asset_model_id", "wam.id")
          .select([
            "wti.environmental_test_id",
            "wai.id",
            "wam.name as model_name",
            "wai.serial_number",
          ])
          .where("wti.environmental_test_id", "in", exportTestIds)
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
          .where("wtr.environmental_test_id", "in", exportTestIds)
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
      }

      return {
        data,
        testResultsMap,
        testInventoriesMap,
        total: data.length,
      }
    }

    const [data, countResult] = await Promise.all([
      query
        .select([
          "wet.id",
          "wet.created_at",
          "wet.entity_id",
          sql<string | null>`COALESCE(e.name, we_main.name)`.as("entity_name"),
          sql<string | null>`COALESCE(e.address, we_main.address)`.as(
            "entity_address"
          ),
          "wet.parameter_category_id",
          "wet.activity_id",
          "wa.name as activity_name",
          "epc.name as parameter_category_name",
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
          sql<
            string | null
          >`COALESCE(ma_model.name, ma_ai.other_asset_model_name)`.as(
            "management_asset_model_name"
          ),
          "ma_ai.serial_number as management_asset_serial_number",
          "ma_ai.production_year as management_asset_production_year",
          "ma_ws.name as management_asset_working_status",
          "ma_at.name as management_asset_type_name",
          "wet.examination_entity_id",
          "ee.name as examination_entity_name",
          "ee.regency_id as examination_entity_regency_id",
        ])
        .orderBy("wet.id", "desc")
        .limit(perPage)
        .offset(offset)
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    const testIds = data.map((d) => d.id)
    let testResultsMap: Record<number, Record<string, unknown>[]> = {}
    let testInventoriesMap: Record<number, Record<string, unknown>[]> = {}

    if (testIds.length > 0) {
      // Fetch inventories for these tests
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
          if (!acc[testId]) {
            acc[testId] = []
          }
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
    }

    const total = Number(countResult.total)

    return {
      data,
      testResultsMap,
      testInventoriesMap,
      total,
    }
  }

  async findById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("ws_environmental_tests")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  /**
   * Fetch a single environmental test record with all related data
   * (entity, parameter category, test results, inventories).
   * Reuses the same query pattern as getHistory but for a single ID.
   */
  async getHistoryById(c: Context, id: number) {
    const data = await c.var.trx
      .selectFrom("ws_environmental_tests as wet")
      .leftJoin("entities as e", "wet.entity_id", "e.id")
      .leftJoin("ws_entities as we_main", "wet.entity_id", "we_main.id")
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
      .leftJoin("entities as ee", "wet.examination_entity_id", "ee.id")
      .select([
        "wet.id",
        "wet.created_at",
        "wet.entity_id",
        sql<string | null>`COALESCE(e.name, we_main.name)`.as("entity_name"),
        sql<string | null>`COALESCE(e.address, we_main.address)`.as(
          "entity_address"
        ),
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
        sql<
          string | null
        >`COALESCE(ma_model.name, ma_ai.other_asset_model_name)`.as(
          "management_asset_model_name"
        ),
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

  async updateEnvironmentalTest(
    c: Context,
    id: number,
    data: Record<string, unknown>
  ) {
    return await c.var.trx
      .updateTable("ws_environmental_tests")
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getTestResults(c: Context, environmentalTestId: number) {
    return await c.var.trx
      .selectFrom("ws_test_results")
      .selectAll()
      .where("environmental_test_id", "=", environmentalTestId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async deleteTestResults(c: Context, environmentalTestId: number) {
    return await c.var.trx
      .updateTable("ws_test_results")
      .set({ deleted_at: new Date() })
      .where("environmental_test_id", "=", environmentalTestId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async deleteTestInventories(c: Context, environmentalTestId: number) {
    return await c.var.trx
      .updateTable("ws_test_inventories")
      .set({ deleted_at: new Date() })
      .where("environmental_test_id", "=", environmentalTestId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getAssetInventories(c: Context, entityId: number, search?: string) {
    let query = c.var.trx
      .selectFrom("ws_asset_inventories as wai")
      .leftJoin("ws_asset_models as wam", "wai.asset_model_id", "wam.id")
      .leftJoin("ws_entities as we", "wai.entity_id", "we.id")
      .select([
        "wai.id",
        "wam.name as model_name",
        "wai.other_asset_model_name",
        "wai.serial_number",
      ])
      .where("we.global_id", "=", entityId)
      .where("wai.deleted_at", "is", null)

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb("wam.name", "like", `%${search}%`),
          eb("wai.other_asset_model_name", "like", `%${search}%`),
          eb("wai.serial_number", "like", `%${search}%`),
        ])
      )
    }

    const rows = await query.execute()
    return rows.map((row) => ({
      id: row.id,
      model_name: row.model_name ?? row.other_asset_model_name,
      serial_number: row.serial_number,
    }))
  }

  async getManagementAssets(
    c: Context,
    entityId: number,
    params: { page: number; perPage: number; search?: string }
  ) {
    const { page, perPage, search } = params
    const offset = (page - 1) * perPage

    const programId = c.var.programId

    let query = c.var.trx
      .selectFrom("asset_inventories as ai")
      .leftJoin("asset_models as am", "ai.asset_model_id", "am.id")
      .leftJoin("asset_types as at", "ai.asset_type_id", "at.id")
      .innerJoin(
        "asset_working_statuses as aws",
        "ai.working_status_id",
        "aws.id"
      )
      .innerJoin(
        "asset_inventory_workspaces as aiw",
        "aiw.asset_inventory_id",
        "ai.id"
      )
      .leftJoin("ws_asset_inventories as wai", (join) =>
        join.onRef("ai.id", "=", "wai.id").on("wai.program_id", "=", programId)
      )
      .leftJoin("ws_asset_models as wam", "wai.asset_model_id", "wam.id")
      .leftJoin(
        "ws_asset_working_statuses as waws",
        "wai.asset_working_status_id",
        "waws.id"
      )
      .where("ai.deleted_at", "is", null)
      .where("ai.entity_id", "=", entityId)
      .where("aiw.workspace_id", "=", programId)
      .where("aiw.status", "=", 1)
      .where("aws.id", "=", 1)
      .where("aws.deleted_at", "is", null)
      .where(
        sql`LOWER(COALESCE(at.name, ai.other_asset_type_name))`,
        "like",
        "%pemeriksaan udara%"
      )

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb("am.name", "like", `%${search}%`),
          eb("ai.other_asset_model_name", "like", `%${search}%`),
          eb("ai.serial_number", "like", `%${search}%`),
          eb("wam.name", "like", `%${search}%`),
          eb("wai.other_asset_model_name", "like", `%${search}%`),
          eb("wai.serial_number", "like", `%${search}%`),
        ])
      )
    }

    const [rows, countResult] = await Promise.all([
      query
        .select([
          "ai.id",
          "am.name as model_name",
          "ai.other_asset_model_name",
          "ai.serial_number",
          "ai.production_year",
          "aws.name as working_status",
          "at.name as asset_type_name",
          "ai.other_asset_type_name",
          "wam.name as ws_model_name",
          "wai.other_asset_model_name as ws_other_model_name",
          "wai.serial_number as ws_serial_number",
          "wai.production_year as ws_production_year",
          "waws.name as ws_working_status",
        ])
        .limit(perPage)
        .offset(offset)
        .execute(),
      query.select((fn) => fn.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return {
      data: rows.map((row) => ({
        id: row.id,
        model_name: row.ws_model_name ?? row.ws_other_model_name ?? row.model_name ?? row.other_asset_model_name,
        serial_number: row.ws_serial_number ?? row.serial_number,
        production_year: row.production_year ?? null,
        working_status: row.ws_working_status ?? row.working_status,
        asset_type_name: row.asset_type_name,
      })),
      total: Number(countResult?.total || 0),
    }
  }

  async getUnits(c: Context) {
    return await c.var.trx
      .selectFrom("environmental_units" as any)
      .select(["id", "name"])
      .where("deleted_at", "is", null)
      .orderBy("id", "asc")
      .execute()
  }

  async createUnit(c: Context, data: { name: string }) {
    const result = await c.var.trx
      .insertInto("environmental_units" as any)
      .values({
        name: data.name,
      })
      .executeTakeFirstOrThrow()

    return Number(result.insertId)
  }

  async checkUnitNameExists(c: Context, name: string) {
    const result = await c.var.trx
      .selectFrom("environmental_units" as any)
      .select("id")
      .where("name", "=", name)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return !!result
  }

  // ==================== Environmental Test Field Methods ====================

  async createTestFields(
    c: Context,
    fields: Array<{
      environmental_test_id: number
      key: string
      label: string
      value: string | null
    }>
  ) {
    if (fields.length === 0) return

    await c.var.trx
      .insertInto("ws_environmental_test_field" as any)
      .values(fields)
      .execute()
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

  async deleteTestFieldsByTestId(c: Context, testId: number) {
    return await c.var.trx
      .updateTable("ws_environmental_test_field" as any)
      .set({ deleted_at: new Date() })
      .where("environmental_test_id", "=", testId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getAllActivities(
    c: Context,
    params: GetActivityQuery,
    programId: number,
    sortBy: string | undefined | null = "updated_at",
    sortType: string | undefined | null = "desc"
  ) {
    let query = c.var.trx.selectFrom("ws_activities").orderBy("status", "desc")

    if (params.keyword)
      query = query.where("name", "like", `%${params.keyword}%`)
    if (params.status !== undefined)
      query = query.where("status", "=", Number(params.status))
    if (params.code) query = query.where("code", "=", params.code)
    if (sortBy)
      query = query.orderBy(
        sortBy as keyof WsActivities,
        sortType as OrderByDirectionExpression
      )

    const offset = (params.page - 1) * params.paginate
    const [activities, count] = await Promise.all([
      query
        .limit(params.paginate)
        .offset(offset)
        .selectAll()
        .where("status", "=", 1)
        .where("deleted_at", "is", null)
        .where("program_id", "=", programId)
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .where("status", "=", 1)
        .where("deleted_at", "is", null)
        .where("program_id", "=", programId)
        .executeTakeFirstOrThrow(),
    ])

    return {
      data: activities,
      total: Number(count.total),
    }
  }

  async getActivityById(c: Context, activityId: number) {
    return await c.var.trx
      .selectFrom("ws_activities")
      .selectAll()
      .where("id", "=", activityId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
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

  async getActivityMaterials(c: Context, activityId: number, entityId: number) {
    return await c.var.trx
      .selectFrom("ws_entity_material_activities as ema")
      .innerJoin("ws_materials as m", "m.id", "ema.material_id")
      .select(["m.id as material_id", "m.name as material_name"])
      .where("ema.activity_id", "=", activityId)
      // .where("ema.entity_id", "=", entityId)
      .where("ema.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .groupBy("m.id")
      .execute()
  }

  async getTransactionDetailMySQL(
    c: Context,
    params: {
      activityId?: number
      entityId?: number
      from: string
      to: string
      entityTagIds?: number[]
      informationType?: number
      transactionType?: number
      materialLevelId?: number
      page: number
      paginate: number
      search?: string
    }
  ): Promise<{ data: ActivityTransactionRow[]; total: number }> {
    return this.#getActivityTransactionDetailMySQL(c, params)
  }

  async #getActivityTransactionDetailMySQL(
    c: Context,
    params: {
      activityId?: number
      entityId?: number
      from: string
      to: string
      entityTagIds?: number[]
      informationType?: number
      transactionType?: number
      materialLevelId?: number
      page: number
      paginate: number
      search?: string
    }
  ): Promise<{ data: ActivityTransactionRow[]; total: number }> {
    const programId = c.var.programId
    const offset = (params.page - 1) * params.paginate
    const fromDt = `${params.from} 00:00:00`
    const toDt = `${params.to} 23:59:59`

    let query = c.var.trx
      .selectFrom("ws_transactions as wt")
      .leftJoin("ws_entities as we", "wt.entity_id", "we.id")
      .leftJoin("locations as l_province", "we.province_id", "l_province.id")
      .leftJoin("locations as l_regency", "we.regency_id", "l_regency.id")
      .leftJoin("ws_stocks as ws", "wt.stock_id", "ws.id")
      .leftJoin("ws_materials as wm", "ws.material_id", "wm.id")
      .leftJoin("ws_materials as wmp", "wm.parent_id", "wmp.id")
      .leftJoin(
        "ws_transaction_types as wtt",
        "wt.transaction_type_id",
        "wtt.id"
      )
      .leftJoin(
        "ws_transaction_reasons as wtr_reason",
        "wt.transaction_reason_id",
        "wtr_reason.id"
      )
      .leftJoin("ws_orders as wo", "wt.order_id", "wo.id")
      .leftJoin("ws_entities as wo_vendor", "wo.vendor_id", "wo_vendor.id")
      .leftJoin(
        "ws_entities as wo_customer",
        "wo.customer_id",
        "wo_customer.id"
      )
      .leftJoin(
        "ws_entities as wt_companion",
        "wt.companion_entity_id",
        "wt_companion.id"
      )
      .leftJoin(
        "locations as l_cust_prov",
        "wo_customer.province_id",
        "l_cust_prov.id"
      )
      .leftJoin(
        "locations as l_cust_reg",
        "wo_customer.regency_id",
        "l_cust_reg.id"
      )
      .leftJoin("ws_batches as wb", "ws.batch_id", "wb.id")
      .leftJoin("ws_manufactures as wmf", "wb.manufacture_id", "wmf.id")
      .leftJoin("ws_activities as wa", "wt.activity_id", "wa.id")
      .where("wt.deleted_at", "is", null)
      .where("wt.created_at", ">=", fromDt)
      .where("wt.created_at", "<=", toDt)
      .where("wa.program_id", "=", programId)
      .where("we.is_vendor", "=", 1)
      .where("we.status", "=", 1)

    if (params.activityId !== undefined) {
      query = query.where("wt.activity_id", "=", params.activityId)
    }

    if (params.entityId !== undefined) {
      query = query.where("we.id", "=", params.entityId)
    }

    if (params.entityTagIds && params.entityTagIds.length > 0) {
      query = query.where("we.entity_tag_id", "in", params.entityTagIds)
    }

    if (params.materialLevelId !== undefined) {
      query = query.where("wm.material_level_id", "=", params.materialLevelId)
    }

    if (params.search) {
      const term = `%${params.search}%`
      query = query.where((eb) =>
        eb.or([
          eb("wm.name", "like", term),
          eb("wmp.name", "like", term),
          eb("we.name", "like", term),
          eb("wo_customer.name", "like", term),
          eb("wo_vendor.name", "like", term),
          eb("wt_companion.name", "like", term),
          eb("wa.name", "like", term),
        ])
      )
    }


    if (params.transactionType !== undefined) {
      switch (params.transactionType) {
        case 2:
          query = query
            .where("wt.transaction_type_id", "=", 2)
            .where("wo.order_type_id", "in", [1, 2, 4])
            .where("wo.order_status_id", "in", [4, 5])
            .where(sql<boolean>`wt.order_id IS NOT NULL`)
          break
        case 3:
          query = query
            .where("wt.transaction_type_id", "=", 3)
            .where("wo.order_type_id", "in", [1, 2, 4])
            .where("wo.order_status_id", "=", 5)
          break
        case 4:
          query = query.where("wt.transaction_type_id", "in", [4, 9])
          break
        case 7:
          query = query.where("wt.transaction_type_id", "=", 7)
          break
        case 8:
          query = query.where("wt.transaction_type_id", "=", 8)
          break
        case 101:
          query = query
            .where("wt.transaction_type_id", "=", 3)
            .where("wo.order_type_id", "=", 3)
            .where("wo.order_status_id", "=", 5)
          break
        case 102:
          query = query
            .where("wt.transaction_type_id", "=", 2)
            .where("wo.order_type_id", "=", 3)
            .where("wo.order_status_id", "in", [4, 5])
          break
        case 103:
          query = query
            .where("wt.transaction_type_id", "in", [10, 5])
            .where("wt.order_id", "is", null)
          break
      }
    }

    if (params.informationType === 0) {
      query = query.where((eb) =>
        eb.or([
          eb("wo_customer.id", "is not", null),
          eb("wt_companion.id", "is not", null),
        ])
      )
    }

    const selectQuery = query
      .select([
        "we.id as entity_id",
        "we.name as entity_name",
        "l_province.id as province_id",
        "l_province.name as province_name",
        "l_regency.id as regency_id",
        "l_regency.name as regency_name",
        "wm.id as material_id",
        "wm.name as material_name",
        "wm.unit_of_consumption as material_unit",
        "wmp.id as material_parent_id",
        "wmp.name as material_parent_name",
        "wb.id as batch_id",
        "wb.code as batch_code",
        "wb.expired_date as expired_date",
        "wmf.id as manufacture_id",
        "wmf.name as manufacture_name",
        "wo_vendor.id as vendor_id",
        "wo_vendor.name as vendor_name",
        "wa.name as activity_name",
        "l_cust_prov.id as customer_province_id",
        "l_cust_prov.name as customer_province_name",
        "l_cust_reg.id as customer_regency_id",
        "l_cust_reg.name as customer_regency_name",
        "wo_customer.id as customer_id",
        "wo_customer.name as customer_name",
        "wt_companion.id as companion_entity_id",
        "wt_companion.name as companion_entity_name",
        "wt.created_at as created_at",
        "wt.actual_transaction_date as actual_transaction_date",
        "wt.transaction_type_id as transaction_type_id",
        "wtt.title as transaction_type_name",
        "wt.transaction_reason_id as transaction_reason_id",
        "wtr_reason.title as transaction_reason_name",
        "wt.id as transaction_id",
        sql<number>`1`.as("count"),
        sql<number>`ABS(wt.change_qty)`.as("value"),
      ])
      .orderBy("wt.created_at", "desc")

    const [data, countResult] = await Promise.all([
      selectQuery.limit(params.paginate).offset(offset).execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data: data as unknown as ActivityTransactionRow[],
      total: Number(countResult.total),
    }
  }
}

export interface ActivityTransactionRow {
  entity_id?: number
  entity_name?: string
  province_id?: number
  province_name?: string
  regency_id?: number
  regency_name?: string
  material_id?: number
  material_name?: string
  material_unit?: string
  material_parent_id?: number
  material_parent_name?: string
  batch_code?: string
  batch_id?: number
  expired_date?: string
  manufacture_id?: number
  manufacture_name?: string
  vendor_id?: number
  vendor_name?: string
  activity_name?: string
  customer_province_id?: number
  customer_province_name?: string
  customer_regency_id?: number
  customer_regency_name?: string
  customer_id?: number
  customer_name?: string
  companion_entity_id?: number
  companion_entity_name?: string
  created_at?: string
  transaction_type_id?: number
  transaction_type_name?: string
  transaction_reason_id?: number
  transaction_reason_name?: string
  transaction_id?: number
  count?: number
  value?: number
  actual_transaction_date?: string
}
