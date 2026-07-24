import { BadRequestError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import { GetActivityQuery } from "../activity/activity.schema.js"
import { ActivityTransactionRow, EnvironmentalHealthRepository } from "./environmental-health.repository.js"
import {
  CreateEnvironmentalTestInput,
  ParameterValue,
  TestResultItem,
  UpdateEnvironmentalTestInput,
} from "./environmental-health.schema.js"
import moment from "moment"
import { EnvironmentalHealthTemplate } from "./environmental-health.excel.js"
import {
  EnvironmentalHealthDocumentGenerator,
  type EnvironmentalHealthDocumentData,
  type DocumentGenerateResult,
} from "./environmental-health.document.js"
import { EnvironmentalHealthPdfGenerator } from "./environmental-health.pdf.js"

export class EnvironmentalHealthModule {
  constructor(private readonly repo: EnvironmentalHealthRepository) {}

  #getUserGlobalId(c: Context) {
    const user = c.var.user as { global_id?: number }
    return Number(user?.global_id ?? 0)
  }

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
    const userEntity = c.var.userEntity

    return await this.repo.getEntities(c, {
      ...params,
      provinceId: userEntity?.province_id,
      regencyId: userEntity?.regency_id,
      subDistrictId: userEntity?.sub_district_id,
    })
  }

  async getVendorEntities(
    c: Context,
    params: { page: number; perPage: number; search?: string }
  ) {
    const vendorId = Number(c.var.entityId || 0)
    return await this.repo.getEntitiesByVendor(c, { ...params, vendorId })
  }

  async getActivityMaterials(c: Context, activityId: number) {
    const entityId = Number(c.var.userEntity?.global_id || 0)
    return await this.repo.getActivityMaterials(c, activityId, entityId)
  }

  async getActivities(c: Context, params: GetActivityQuery) {
    const { sort_by, sort_type } = params
    const { data, total } = await this.repo.getAllActivities(
      c,
      params,
      c.get("programId"),
      sort_by,
      sort_type
    )

    if (data.length === 0) {
      return new PaginatedResponse(params)
    }

    const list = data.map((a) => ({
      id: a.id,
      name: a.name,
      is_distribution:
        (a as { is_final_distribution?: number }).is_final_distribution ?? 0,
      is_air: a.name?.toLowerCase().includes("udara") ?? false,
    }))

    return new PaginatedResponse(params, list, total)
  }

  async getParameterCategories(c: Context, params?: { activityId?: number }) {
    // Fetch categories from database (simple list)
    // Only get active ones for the dropdown
    const categories = await this.repo.getParameterCategories(c, params)

    // Build response with labels from database and items from database
    const result = await Promise.all(
      categories.map(async (category) => {
        const fields = await this.repo.getParameterCategoryFields(
          c,
          category.id
        )

        const items = this.mapFields(c, fields)

        // Add hardcoded Inventory item for 'Kualitas Udara'
        // if (category.name?.toLowerCase().includes("udara")) {
        //   items.push(this.getInventoryItem(c))
        // }

        return {
          id: category.id,
          label: category.name ?? "",
          items,
        }
      })
    )

    return result
  }

  async getAnalysisParameters(
    c: Context,
    params?: { parameterCategoryId?: number }
  ) {
    return await this.repo.getAnalysisParameters(c, params)
  }

  async getAnalysisParameterWithMethods(
    c: Context,
    analysisParameterId: number
  ) {
    return await this.repo.getAnalysisParameterWithMethods(
      c,
      analysisParameterId
    )
  }

  async createEnvironmentalTest(
    c: Context,
    payload: CreateEnvironmentalTestInput
  ) {
    const {
      test_results,
      parameter_category_items,
      inventory_ids,
      management_asset_id,
      activity_id,
      entity_id,
      is_distribution,
      ...restData
    } = payload

    const isDistribution = is_distribution === 1
    const entityEntries = this.#parseEntityEntries(entity_id)
    const primaryEntityId = entityEntries[0].entity_id

    await this.#validateEntityIds(c, entityEntries)
    await this.#validateTransactionIds(
      c,
      isDistribution,
      entity_id,
      entityEntries
    )
    await this.#validateInventoryIds(c, inventory_ids)
    await this.#validateExaminationEntityId(c, restData.examination_entity_id)
    await this.#validateManagementAssetId(c, management_asset_id)

    const userId = this.#getUserGlobalId(c)
    const testData: Record<string, ParameterValue> = {
      ...restData,
      entity_id: primaryEntityId,
      activity_id,
      management_asset_id: management_asset_id ?? null,
      examination_entity_id: restData.examination_entity_id ?? null,
      created_by: userId,
      updated_by: userId,
    }

    // Insert environmental test
    const insertId = await this.repo.createEnvironmentalTest(c, testData)

    // Insert detail rows (one per entity)
    const details = entityEntries.map((entry) => ({
      environmental_test_id: insertId,
      entity_id: entry.entity_id,
      is_transaction: isDistribution ? 1 : 0,
      transaction_id: entry.transaction_id ?? null,
    }))
    await this.repo.createTestDetails(c, details)

    // Insert parameter_category_items to ws_environmental_test_field
    if (parameter_category_items && parameter_category_items.length > 0) {
      const fields = parameter_category_items
        .filter((param) => param.key !== "inventory")
        .map((param) => ({
          environmental_test_id: insertId,
          key: param.key,
          label: param.label ?? param.key,
          value: this.#serializeParamValue(param.value),
        }))

      await this.repo.createTestFields(c, fields)
    }

    // Insert inventories (M2M)
    if (inventory_ids && inventory_ids.length > 0) {
      await this.repo.createTestInventories(c, insertId, inventory_ids)
    }

    // If lab_result_status is 'completed' and test_results exists, insert test results
    if (
      testData.lab_result_status === "completed" &&
      test_results &&
      test_results.length > 0
    ) {
      const mappedResults = test_results.map((result: TestResultItem) => ({
        environmental_test_id: insertId,
        analysis_parameter_id: result.analysis_parameter_id ?? null,
        parameter_name: result.parameter_name,
        quality_standard: result.quality_standard ?? null,
        unit: result.unit ?? null,
        test_methods_id: result.test_methods_id,
        result_value: result.result_value ?? null,
        is_custom: result.is_custom ?? false,
      }))

      await this.repo.createTestResults(c, mappedResults)
    }

    return { id: insertId }
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
    const { page, perPage } = params
    const result = await this.repo.getHistory(c, params)
    const { data, testResultsMap, testInventoriesMap, total } = result

    // Fetch unique category IDs
    const categoryIds = [
      ...new Set(data.map((item) => item.parameter_category_id)),
    ]

    const testIds = data.map((d) => d.id)

    // Fetch test fields and detail rows in parallel
    const [allTestFields, allTestDetails] = await Promise.all([
      testIds.length > 0 ? this.repo.getTestFieldsByTestIds(c, testIds) : [],
      testIds.length > 0 ? this.repo.getTestDetailsByTestIds(c, testIds) : [],
    ])

    // Group details by environmental_test_id
    const testDetailsMap: Record<
      number,
      Array<{
        id: number
        entity_id: number
        entity_name: string | null
        is_transaction: number
        transaction_id: number | null
      }>
    > = {}
    allTestDetails.forEach((detail) => {
      const testId = Number(detail.environmental_test_id)
      if (!testDetailsMap[testId]) testDetailsMap[testId] = []
      testDetailsMap[testId].push({
        id: detail.id,
        entity_id: detail.entity_id,
        entity_name: detail.entity_name ?? null,
        is_transaction: detail.is_transaction,
        transaction_id: detail.transaction_id,
      })
    })

    // Group test fields by environmental_test_id
    const testFieldsMap: Record<
      number,
      Array<{ id: number; key: string; label: string; value: string | null }>
    > = {}
    allTestFields.forEach((field) => {
      const testId = Number(field.environmental_test_id)
      if (!testFieldsMap[testId]) testFieldsMap[testId] = []
      testFieldsMap[testId].push(field)
    })
    // Fetch fields for each category
    const categoryFieldsMap: Record<
      number,
      Awaited<
        ReturnType<EnvironmentalHealthRepository["getParameterCategoryFields"]>
      >
    > = {}
    await Promise.all(
      categoryIds.map(async (id) => {
        categoryFieldsMap[id] = await this.repo.getParameterCategoryFields(
          c,
          id
        )
      })
    )

    const mappedData = data.map((item) => {
      const testFields = categoryFieldsMap[item.parameter_category_id] || []

      return {
        id: item.id,
        created_at: item.created_at,
        entity_id: item.entity_id,
        entity_name: item.entity_name,
        entity_address: item.entity_address,
        parameter_category_id: item.parameter_category_id,
        parameter_category_name: item.parameter_category_name,
        activity_id: item.activity_id ?? null,
        activity_name: item.activity_name ?? null,
        is_air:
          item.parameter_category_name?.toLowerCase().includes("udara") ??
          false,
        parameter_category_items: this.mapParameterCategoryItems(
          c,
          item.id,
          testFields,
          testFieldsMap
        ),
        sample_id: item.sample_id,
        received_date: item.received_date,
        lab_result_status: item.lab_result_status,
        test_start_date: item.test_start_date,
        test_end_date: item.test_end_date,
        sample_collected_by: item.sample_collected_by,
        location: item.location,
        collection_date: item.collection_date,
        has_ikl: (item.has_ikl as unknown) === 1 || item.has_ikl === true,
        ikl_test_date: item.ikl_test_date,
        ikl_score: item.ikl_score ? Number(item.ikl_score) : null,
        is_qualified: item.ikl_score ? Number(item.ikl_score) >= 80 : false,
        inventory_ids: testInventoriesMap[item.id] || [],
        test_results: testResultsMap[item.id] || [],
        details: testDetailsMap[item.id] || [],
        management_asset: item.management_asset_id
          ? {
              id: item.management_asset_id,
              model_name: item.management_asset_model_name ?? null,
              serial_number: item.management_asset_serial_number ?? null,
              production_year: item.management_asset_production_year ?? null,
              working_status: item.management_asset_working_status
                ? this.translate(c, item.management_asset_working_status, item.management_asset_working_status)
                : null,
              asset_type_name: item.management_asset_type_name ?? null,
            }
          : null,
        examination_entity_id: item.examination_entity_id ?? null,
        examination_entity: item.examination_entity_id
          ? {
              id: Number(item.examination_entity_id),
              name: item.examination_entity_name ?? null,
              regency_id: item.examination_entity_regency_id ?? null,
            }
          : null,
      }
    })

    const lastPage = Math.ceil(total / perPage)

    return {
      data: mappedData,
      meta: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
      },
    }
  }

  async exportHistory(
    c: Context,
    params: {
      search?: string
      entityId?: number
      startDate?: string
      endDate?: string
      status?: "completed" | "pending"
    }
  ) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = moment().tz(timezone)
    const title = `EnvironmentalHealthHistory_${currentTime.format(
      "YYYYMMDD_HHmm"
    )}`

    // Fetch all records within filters (bypass pagination)
    const { data } = await this.getHistory(c, {
      ...params,
      page: 1,
      perPage: 1000,
      isExport: true,
    })

    if (data.length === 0) {
      throw new BadRequestError("No data found to export")
    }

    // 1. Identify dynamic columns from parameter_category_items
    const dynamicColumnLabels = new Set<string>()
    const staticHeaders = [
      "No",
      "Entity Name",
      "Entity Address",
      "Parameter Category",
      "Activity",
      "Created At",
      "Sample ID",
      "Received Date",
      "Status",
      "Test Start Date",
      "Test End Date",
      "Collected By",
      "Collection Date",
      "Location",
      "Inventory",
      "IKL",
      "IKL Test Date",
      "IKL Score",
      "IKL Qualified",
      "Parameter Name",
      "Quality Standard",
      "Unit",
      "Method Name",
      "Result Value",
    ]

    data.forEach((item) => {
      item.parameter_category_items?.forEach((p) => {
        if (p.label && !staticHeaders.includes(p.label))
          dynamicColumnLabels.add(p.label)
      })
    })
    const dynamicLabels = Array.from(dynamicColumnLabels)

    // 2. Build columns array
    const baseColumnsPrefix = [
      { header: "No", key: "no", width: 8 },
      { header: "Entity Name", key: "entity_name", width: 25 },
      { header: "Entity Address", key: "entity_address", width: 30 },
      {
        header: "Parameter Category",
        key: "parameter_category_name",
        width: 20,
      },
      { header: "Activity", key: "activity_name", width: 30 },
    ]

    const dynamicColumns = dynamicLabels.map((label) => ({
      header: label,
      key: `dynamic_${label}`,
      width: 20,
    }))

    const baseColumnsSuffix = [
      { header: "Created At", key: "created_at", width: 20 },
      { header: "Sample ID", key: "sample_id", width: 15 },
      { header: "Received Date", key: "received_date", width: 15 },
      { header: "Status", key: "lab_result_status", width: 15 },
      { header: "Test Start Date", key: "test_start_date", width: 15 },
      { header: "Test End Date", key: "test_end_date", width: 15 },
      { header: "Collected By", key: "sample_collected_by", width: 15 },
      { header: "Collection Date", key: "collection_date", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "Inventory", key: "inventories", width: 25 },
      { header: "IKL", key: "has_ikl", width: 10 },
      { header: "IKL Test Date", key: "ikl_test_date", width: 15 },
      { header: "IKL Score", key: "ikl_score", width: 10 },
      { header: "IKL Qualified", key: "is_qualified", width: 15 },
      // Test Result columns
      { header: "Parameter Name", key: "res_parameter_name", width: 20 },
      { header: "Quality Standard", key: "res_quality_standard", width: 20 },
      { header: "Unit", key: "res_unit", width: 10 },
      { header: "Method Name", key: "res_method_name", width: 25 },
      { header: "Result Value", key: "res_result_value", width: 15 },
    ]

    const columns = [
      ...baseColumnsPrefix,
      ...dynamicColumns,
      ...baseColumnsSuffix,
    ]

    // 3. Flatten data: row-per-test-result
    const rows: any[] = []
    const mergeRanges: { start: number; end: number; item: any }[] = []

    data.forEach((item, index) => {
      const startRow = rows.length + 2 // +2 because header is row 1
      const testResults = item.test_results || []
      const sampleCollectedBy = this.resolveSampleCollectedBy(
        item.sample_collected_by
      )
      const isQualified = this.resolveIsQualified(
        item.has_ikl,
        item.is_qualified
      )
      const receivedDate = item.received_date
        ? moment.utc(item.received_date).format("YYYY-MM-DD")
        : null
      const collectionDate = item.collection_date
        ? moment.utc(item.collection_date).format("YYYY-MM-DD")
        : null

      const recordData: any = {
        no: index + 1,
        entity_name: item.entity_name,
        entity_address: item.entity_address,
        parameter_category_name: item.parameter_category_name,
        activity_name: item.activity_name ?? "-",
        created_at: moment(item.created_at).format("YYYY-MM-DD HH:mm"),
        sample_id: item.sample_id,
        received_date: receivedDate,
        lab_result_status: item.lab_result_status
          ? item.lab_result_status.charAt(0).toUpperCase() +
            item.lab_result_status.slice(1)
          : null,
        test_start_date: item.test_start_date
          ? moment(item.test_start_date).format("YYYY-MM-DD")
          : null,
        test_end_date: item.test_end_date
          ? moment(item.test_end_date).format("YYYY-MM-DD")
          : null,
        sample_collected_by: sampleCollectedBy,
        collection_date: collectionDate,
        location: item.location,
        inventories: item.inventory_ids
          ?.map((inv: any) => `${inv.model_name} (${inv.serial_number})`)
          .join(", "),
        has_ikl: item.has_ikl ? "Ya" : "Tidak",
        ikl_test_date: item.ikl_test_date
          ? moment(item.ikl_test_date).format("YYYY-MM-DD")
          : null,
        ikl_score: item.ikl_score,
        is_qualified: isQualified,
        test_material: item.test_material || null,
      }

      // Add dynamic category items
      dynamicLabels.forEach((label) => {
        const field = item.parameter_category_items?.find(
          (p) => p.label === label
        )
        recordData[`dynamic_${label}`] = field?.value || null
      })

      if (testResults.length === 0) {
        rows.push(this.generateExportRow(recordData, columns))
      } else {
        testResults.forEach((res) => {
          rows.push(this.generateExportRow(recordData, columns, res))
        })
      }

      const endRow = rows.length + 1
      if (endRow > startRow) {
        mergeRanges.push({ start: startRow, end: endRow, item })
      }
    })

    const template = new EnvironmentalHealthTemplate()
    const sheetName = "Riwayat Kesling"

    await template.initSheet(sheetName)
    template.setTitle(title)
    template.setTimezone(timezone)
    template.setColumns(columns)
    await template.addRows(sheetName, rows)

    // Apply merging for record data columns (A to S/T...)
    // Prefix columns: A-D (4 cols)
    // Dynamic columns: dynamicLabels.length
    // Suffix columns: prefix A-D + dynamic length + suffix until IKL Qualified (index 18 in suffix)
    const suffixEndIndex = baseColumnsSuffix.findIndex(
      (s) => s.header === "IKL Qualified"
    )
    const totalMergeCols =
      baseColumnsPrefix.length + dynamicLabels.length + (suffixEndIndex + 1)

    for (const range of mergeRanges) {
      for (let col = 1; col <= totalMergeCols; col++) {
        const letter = this.getColLetter(col)
        template.mergeCells(
          sheetName,
          `${letter}${range.start}`,
          `${letter}${range.end}`
        )
      }
    }

    return await template.generate()
  }

  private getColLetter(n: number): string {
    let letter = ""
    while (n > 0) {
      const mod = (n - 1) % 26
      letter = String.fromCharCode(64 + mod + 1) + letter
      n = Math.floor((n - mod) / 26)
    }
    return letter
  }

  private resolveSampleCollectedBy(value: string | null): string {
    if (value === "lab") return "Lab Puskesmas"
    if (value === "customer") return "Customer"
    return value ?? ""
  }

  private resolveIsQualified(hasIkl: boolean, isQualified: boolean): string {
    if (!hasIkl) return "-"
    return isQualified ? "Memenuhi" : "Tidak Memenuhi"
  }

  private generateExportRow(
    recordData: any,
    columns: { header: string; key: string; width: number }[],
    res: any = null
  ): any {
    const row: any = {}
    columns.forEach((col) => {
      if (col.key.startsWith("res_")) {
        const resKey = col.key.replace("res_", "")
        if (resKey === "method_name") {
          row[col.key] = res?.test_methods_name ?? null
        } else if (resKey === "parameter_name") {
          row[col.key] = res?.parameter_name ?? null
        } else if (resKey === "quality_standard") {
          row[col.key] = res?.quality_standard ?? null
        } else if (resKey === "unit") {
          row[col.key] = res?.unit ?? null
        } else if (resKey === "result_value") {
          row[col.key] = res?.result_value ?? null
        }
      } else {
        row[col.key] = recordData[col.key]
      }
    })
    return row
  }

  async updateEnvironmentalTest(
    c: Context,
    id: number,
    payload: UpdateEnvironmentalTestInput
  ) {
    const existing = await this.repo.findById(c, id)
    if (!existing) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "environmental_test" })
      )
    }

    const {
      test_results,
      parameter_category_items,
      inventory_ids,
      management_asset_id,
      activity_id,
      ...restData
    } = payload

    await this.#validateInventoryIds(c, inventory_ids)
    await this.#validateExaminationEntityId(c, restData.examination_entity_id)
    await this.#validateManagementAssetId(c, management_asset_id)

    const userId = this.#getUserGlobalId(c)
    const testData: Record<string, ParameterValue> = {
      ...restData,
      activity_id,
      management_asset_id: management_asset_id ?? undefined,
      updated_by: userId,
    }

    if (Object.keys(testData).length > 0) {
      await this.repo.updateEnvironmentalTest(c, id, testData)
    }

    // Update parameter_category_items in ws_environmental_test_field
    await this.#updateParameterCategoryFields(c, id, parameter_category_items)
    await this.#updateInventories(c, id, inventory_ids)
    await this.#updateTestResults(c, id, test_results)

    return { id }
  }

  async #updateParameterCategoryFields(
    c: Context,
    id: number,
    parameter_category_items?: {
      key: string
      label?: string
      value?: unknown
    }[]
  ) {
    if (!parameter_category_items) return

    await this.repo.deleteTestFieldsByTestId(c, id)

    const fields = parameter_category_items
      .filter((param) => param.key !== "inventory")
      .map((param) => ({
        environmental_test_id: id,
        key: param.key,
        label: param.label ?? param.key,
        value: this.#serializeParamValue(param.value),
      }))

    if (fields.length > 0) {
      await this.repo.createTestFields(c, fields)
    }
  }

  async #updateInventories(c: Context, id: number, inventory_ids?: number[]) {
    if (inventory_ids === undefined) return

    await this.repo.deleteTestInventories(c, id)
    if (inventory_ids.length > 0) {
      await this.repo.createTestInventories(c, id, inventory_ids)
    }
  }

  async #updateTestResults(
    c: Context,
    id: number,
    test_results?: TestResultItem[]
  ) {
    if (!test_results || !Array.isArray(test_results)) return

    await this.repo.deleteTestResults(c, id)

    if (test_results.length > 0) {
      const mappedResults = test_results.map((result: TestResultItem) => ({
        environmental_test_id: id,
        analysis_parameter_id: result.analysis_parameter_id ?? null,
        parameter_name: result.parameter_name,
        quality_standard: result.quality_standard ?? null,
        unit: result.unit ?? null,
        test_methods_id: result.test_methods_id,
        result_value: result.result_value ?? null,
        is_custom: result.is_custom ?? false,
      }))

      await this.repo.createTestResults(c, mappedResults)
    }
  }

  async generateDocument(
    c: Context,
    id: number,
    type: "word" | "pdf" = "word"
  ): Promise<DocumentGenerateResult> {
    const record = await this.repo.getHistoryById(c, id)
    if (!record) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "environmental_test" })
      )
    }

    const { data: item, testResults } = record

    // Fetch parameter category fields definitions
    const fields = await this.repo.getParameterCategoryFields(
      c,
      item.parameter_category_id
    )

    // Fetch saved test field values from ws_environmental_test_field
    const savedTestFields = await this.repo.getTestFieldsByTestId(c, item.id)
    const testFieldsMap: Record<number, { key: string; value: unknown }[]> = {
      [item.id]: savedTestFields,
    }

    // Use mapParameterCategoryItems (same as getHistory) to get correct values
    const parameterCategoryItems = this.mapParameterCategoryItems(
      c,
      item.id,
      fields,
      testFieldsMap
    )

    // Add inventory item for 'Kualitas Udara'
    // if (item.parameter_category_name?.toLowerCase().includes("udara")) {
    //   parameterCategoryItems.push({
    //     id: 999,
    //     label: this.translate(
    //       c,
    //       "environmental_health.items.inventory.label",
    //       "Inventory / Alat"
    //     ),
    //     key: "inventory",
    //     type: "inventory",
    //     value: inventories,
    //   })
    // }

    // Map sample_collected_by enum to human-readable label
    const sampleCollectedByMap: Record<string, Record<string, string>> = {
      en: { lab: "Lab Puskesmas", customer: "Customer" },
      id: { lab: "Lab Puskesmas", customer: "Pelanggan" },
    }
    const language = c.var.language || "en"
    const rawCollectedBy = item.sample_collected_by ?? ""
    const sampleCollectedByLabel =
      sampleCollectedByMap[language]?.[rawCollectedBy] ??
      sampleCollectedByMap["en"]?.[rawCollectedBy] ??
      rawCollectedBy

    // Fetch distribution details if exists
    const distributionDetails = await this.getDistributionDetails(c, item.id)

    // Build document data
    const documentData: EnvironmentalHealthDocumentData = {
      id: item.id,
      created_at: item.created_at,
      entity_name: item.entity_name,
      entity_address: item.entity_address,
      parameter_category_name: item.parameter_category_name,
      activity_name: (item as any).activity_name ?? null,
      parameter_category_items: parameterCategoryItems.map((p) => ({
        label: p.label,
        key: p.key,
        value: p.value,
        type: p.type,
      })),
      sample_id: item.sample_id,
      received_date: item.received_date,
      lab_result_status: item.lab_result_status,
      test_start_date: item.test_start_date,
      test_end_date: item.test_end_date,
      sample_collected_by: sampleCollectedByLabel || null,
      location: item.location,
      collection_date: item.collection_date,
      management_asset: item.management_asset_id
        ? {
            id: item.management_asset_id,
            model_name: item.management_asset_model_name ?? null,
            serial_number: item.management_asset_serial_number ?? null,
            production_year: item.management_asset_production_year ?? null,
            working_status: item.management_asset_working_status
              ? this.translate(c, item.management_asset_working_status, item.management_asset_working_status)
              : null,
            asset_type_name: item.management_asset_type_name ?? null,
          }
        : null,
      has_ikl: (item.has_ikl as unknown) === 1 || item.has_ikl === true,
      ikl_test_date: item.ikl_test_date,
      ikl_score: item.ikl_score ? Number(item.ikl_score) : null,
      is_qualified: item.ikl_score ? Number(item.ikl_score) >= 80 : false,
      examination_entity: item.examination_entity_id
        ? {
            id: Number(item.examination_entity_id),
            name: item.examination_entity_name ?? null,
            regency_id: item.examination_entity_regency_id ?? null,
          }
        : null,
      test_results: testResults.map((r) => ({
        parameter_name: r.parameter_name as string,
        quality_standard: r.quality_standard as string | null,
        unit: r.unit as string | null,
        test_methods_name: r.test_methods_name as string | null,
        result_value: r.result_value as string | null,
        is_custom: (r.is_custom as unknown) === 1 || r.is_custom === true,
      })),
      distribution_details: distributionDetails,
    }

    const timezone = c.req.header("Timezone") || "Asia/Jakarta"
    const t = c.var.t

    if (type === "pdf") {
      const pdfGenerator = new EnvironmentalHealthPdfGenerator()
      return pdfGenerator.generate(documentData, { timezone, language, t })
    }

    const generator = new EnvironmentalHealthDocumentGenerator()
    return generator.generate(documentData, { timezone, language, t })
  }

  async getTransactionDetail(
    c: Context,
    query: {
      from?: string
      to?: string
      entity_tag_ids?: string
      transaction_type?: number
      page: number
      paginate: number
    }
  ) {
    const now = new Date()
    const from = query.from ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const to = query.to ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const entityId = Number(c.var.userEntity?.global_id) || undefined

    const entityTagIds = query.entity_tag_ids
      ? query.entity_tag_ids.split(",").map(Number).filter(Boolean)
      : undefined

    const { data, total } = await this.repo.getTransactionDetailMySQL(c, {
      from,
      to,
      entityId,
      entityTagIds,
      transactionType: query.transaction_type,
      page: query.page,
      paginate: query.paginate,
    })

    const seen = new Map<string, { id: number | undefined; name: string | undefined }>()
    for (const el of data) {
      const key = String(el.material_parent_id ?? el.material_parent_name ?? "")
      if (key && !seen.has(key)) {
        seen.set(key, { id: el.material_parent_id, name: el.material_parent_name })
      }
    }
    const result = Array.from(seen.values())

    const lastPage = Math.ceil(result.length / query.paginate)

    return {
      date: new Date().toISOString(),
      page: query.page,
      item_per_page: query.paginate,
      total_item: result.length,
      total_page: lastPage,
      data: result,
    }
  }

  async getActivityMaterialDetail(
    c: Context,
    activityId: number,
    query: {
      from?: string
      to?: string
      entity_tag_ids?: string
      information_type?: number
      transaction_type?: number
      material_level_id?: number
      page: number
      paginate: number
      search?: string
    }
  ) {
    const now = new Date()
    const from = query.from ?? `${now.getFullYear()}-01-01`
    const to =
      query.to ??
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const entityTagIds = query.entity_tag_ids
      ? query.entity_tag_ids.split(",").map(Number).filter(Boolean)
      : undefined

    const entityId = c.var.userEntity?.id ?? undefined

    const { data, total } = await this.repo.getTransactionDetailMySQL(c, {
      activityId,
      entityId,
      from,
      to,
      entityTagIds,
      informationType: query.information_type,
      transactionType: query.transaction_type,
      materialLevelId: query.material_level_id,
      page: query.page,
      paginate: query.paginate,
      search: query.search,
    })

    const result = data.map((el) => {
      const receiverId =
        (el as any).companion_entity_id ?? (el as any).customer_id ?? null
      const receiverName =
        el.companion_entity_name ?? el.customer_name ?? null
      return {
        entity_id: receiverId ?? el.entity_id ?? null,
        entity_name: receiverName ?? el.entity_name ?? null,
        material_id: el.material_id ?? null,
        material_name: el.material_name ?? null,
        sender: el.vendor_name ?? el.entity_name ?? null,
        receiver: receiverName,
        qty: el.value ?? 0,
        transaction_id: el.transaction_id ?? null,
        actual_transaction_date: el.actual_transaction_date ?? null,
      }
    })

    const lastPage = Math.ceil(total / query.paginate)

    return {
      date: new Date().toISOString(),
      page: query.page,
      item_per_page: query.paginate,
      total_item: total,
      total_page: lastPage,
      data: result,
    }
  }

  async getAssetInventories(c: Context, entityId: number, search?: string) {
    return await this.repo.getAssetInventories(c, entityId, search)
  }

  async getManagementAssets(
    c: Context,
    params: { page: number; perPage: number; search?: string }
  ) {
    const wsEntityId = c.var.userEntity?.global_id
    const result = await this.repo.getManagementAssets(c, wsEntityId, params)
    return {
      ...result,
      data: result.data.map((item) => ({
        ...item,
        working_status: this.translate(c, item.working_status, item.working_status),
      })),
    }
  }

  async getUnits(c: Context) {
    return await this.repo.getUnits(c)
  }

  async createUnit(c: Context, data: { name: string }) {
    const exists = await this.repo.checkUnitNameExists(c, data.name)
    if (exists) {
      throw new BadRequestError(
        c.var.t("validator.already_exists", { field: "name" })
      )
    }

    const id = await this.repo.createUnit(c, data)
    return { id }
  }

  private mapParameterCategoryItems(
    c: Context,
    itemId: number,
    testFields: {
      id: string | number
      label: string
      key: string
      type?: string
    }[],
    testFieldsMap: Record<number, { key: string; value: unknown }[]>
  ) {
    const savedFields = testFieldsMap[itemId] || []
    return testFields.map((field) => {
      const savedField = savedFields.find((f) => f.key === field.key)
      return {
        id: Number(field.id),
        label: this.translate(
          c,
          `environmental_health.items.${field.key}.label`,
          field.label
        ),
        key: field.key,
        type: field.type ?? null,
        value: savedField ? savedField.value : null,
      }
    })
  }

  #parseEntityEntries(
    entity_id: CreateEnvironmentalTestInput["entity_id"]
  ): { entity_id: number; transaction_id: number | null }[] {
    if (typeof entity_id === "object" && !Array.isArray(entity_id)) {
      return Object.entries(entity_id).map(([tid, eid]) => ({
        entity_id: Number(eid),
        transaction_id: Number(tid),
      }))
    }
    return [{ entity_id: entity_id as number, transaction_id: null }]
  }

  async #validateEntityIds(c: Context, entityEntries: { entity_id: number }[]) {
    const uniqueEntityIds = [...new Set(entityEntries.map((e) => e.entity_id))]
    const entitiesExist = await this.repo.checkEntitiesExist(c, uniqueEntityIds)
    if (!entitiesExist) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "entity_id" })
      )
    }
  }

  async #validateTransactionIds(
    c: Context,
    isDistribution: boolean,
    entity_id: CreateEnvironmentalTestInput["entity_id"],
    entityEntries: { transaction_id: number | null }[]
  ) {
    if (!isDistribution || typeof entity_id !== "object") return
    const transactionIds = entityEntries
      .map((e) => e.transaction_id)
      .filter((id): id is number => id !== null)
    if (transactionIds.length === 0) return
    const transactionsExist = await this.repo.checkTransactionsExist(
      c,
      transactionIds
    )
    if (!transactionsExist) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "transaction_id" })
      )
    }
  }

  async #validateExaminationEntityId(
    c: Context,
    examinationEntityId?: number | null
  ) {
    if (examinationEntityId == null) return
    const exists = await c.var.trx
      .selectFrom("entities")
      .select("id")
      .where("id", "=", examinationEntityId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    if (!exists) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "examination_entity_id" })
      )
    }
  }

  async #validateManagementAssetId(c: Context, managementAssetId?: number | null) {
    if (managementAssetId == null) return
    const exists = await c.var.trx
      .selectFrom("asset_inventories")
      .select("id")
      .where("id", "=", managementAssetId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    if (!exists) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "management_asset_id" })
      )
    }
  }

  async #validateInventoryIds(c: Context, inventory_ids?: number[]) {
    if (!inventory_ids || inventory_ids.length === 0) return
    const exist = await this.repo.checkInventoriesExist(c, inventory_ids)
    if (!exist) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "inventory_ids" })
      )
    }
  }

  #serializeParamValue(value: unknown): string | null {
    if (value == null) return null
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  private translate(c: Context, key: string, defaultValue: string): string {
    const translated = c.var.t(key)
    return translated === key || !translated ? defaultValue : translated
  }

  private mapFields(
    c: Context,
    fields: {
      id: string | number
      key: string
      label: string
      hint: string
      mandatory?: number | boolean
      type: string
    }[],
    item?: Record<string, unknown>
  ) {
    return fields.map((field) => ({
      id: Number(field.id),
      label: this.translate(
        c,
        `environmental_health.items.${field.key}.label`,
        field.label
      ),
      mandatory: field.mandatory === 1 || field.mandatory === true,
      hint: this.translate(
        c,
        `environmental_health.items.${field.key}.hint`,
        field.hint
      ),
      key: field.key,
      type: field.type,
      value: item ? (item[field.key] ?? null) : null,
      options: field.options ? field.options.split(",").filter(Boolean) : [],
    }))
  }

  private getInventoryItem(c: Context, value: unknown = null) {
    return {
      id: 999,
      label: this.translate(
        c,
        "environmental_health.items.inventory.label",
        "Inventory / Alat"
      ),
      mandatory: false,
      hint: this.translate(
        c,
        "environmental_health.items.inventory.hint",
        "Pilih Alat"
      ),
      key: "inventory",
      type: "dropdown",
      value: value,
      options: [],
    }
  }

  async getDistributionDetails(c: Context, testId: number) {
    const details = await this.repo.getDistributionDetails(c, testId)

    return details.map((item) => {
      return {
        material: {
          name: item.material_name,
          full_name: item.material_full_name,
        },
        distributed_by: item.vendor_name,
        distributed_to: item.customer_name,
        actual_transaction_date: item.actual_transaction_date,
        batch: {
          code: item.batch_code,
          expiration_date: item.batch_expired_date,
          manufacture: item.manufacture_name,
          production_date: item.batch_production_date,
          operational_status: item.batch_status,
        },
        created_at: item.created_at,
        updated_at: item.updated_at,
      }
    })
  }
}
