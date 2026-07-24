import { Context } from "hono"
import { EnvironmentalHealthHistoryRepository } from "./environmental-health-history.repository.js"
import { GetHistoryListQuery } from "./environmental-health-history.schema.js"
import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { BadRequestError } from "@smile-health/lib/error.js"
import moment from "moment"
import momentTZ from "moment-timezone"
import { EnvironmentalHealthHistoryTemplate } from "./environmental-health-history.excel.js"
import { EnvironmentalHealthHistoryPdfGenerator } from "./environmental-health-history.pdf.js"

export class EnvironmentalHealthHistoryModule {
  constructor(
    private readonly repository: EnvironmentalHealthHistoryRepository
  ) {}

  async list(c: Context, params: GetHistoryListQuery) {
    const result = await this.repository.getList(c, {
      ...params,
    })
    const { data, testResultsMap, testInventoriesMap, total } = result

    // Fetch unique category IDs
    const categoryIds = [
      ...new Set(data.map((item) => item.parameter_category_id)),
    ]

    // Fetch test fields for all tests in bulk
    const testIds = data.map((d) => d.id)
    const allTestFields =
      testIds.length > 0
        ? await this.repository.getTestFieldsByTestIds(c, testIds)
        : []

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
        ReturnType<
          EnvironmentalHealthHistoryRepository["getParameterCategoryFields"]
        >
      >
    > = {}
    await Promise.all(
      categoryIds.map(async (id) => {
        categoryFieldsMap[id] =
          await this.repository.getParameterCategoryFields(c, id)
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
        activity_id: item.activity_id,
        activity_name: item.activity_name,
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
        examination_entity_id:
          (item as any).examination_entity_id ?? null,
        examination_entity: (item as any).examination_entity_id
          ? {
              id: Number((item as any).examination_entity_id),
              name: (item as any).examination_entity_name ?? null,
              regency_id: (item as any).examination_entity_regency_id ?? null,
            }
          : null,
      }
    })

    return new PaginatedResponse(params, mappedData, total)
  }

  async detail(c: Context, id: number) {
    const record = await this.repository.getById(c, id)
    if (!record) return null

    const { data: item, testResults, inventories } = record

    const distributionRows = await this.repository.getDistributionDetails(c, id)
    const distribution_details = distributionRows.map((row) => ({
      material: {
        name: row.material_name,
        full_name: row.material_full_name,
      },
      quantity: Number(row.change_qty ?? 0),
      distributed_by: row.vendor_name,
      distributed_to: row.customer_name,
      actual_transaction_date: row.actual_transaction_date as string | null,
      batch: {
        code: row.batch_code,
        expiration_date: row.batch_expired_date as string | null,
        manufacture: row.manufacture_name,
        production_date: row.batch_production_date as string | null,
        operational_status: row.batch_status,
      },
      stock: {
        opening: row.opening_qty != null ? Number(row.opening_qty) : null,
        closing: null,
      },
      created_at: row.created_at as string | null,
      updated_at: row.updated_at as string | null,
    }))

    // Fetch parameter category fields
    const fields = await this.repository.getParameterCategoryFields(
      c,
      item.parameter_category_id
    )

    // Fetch saved test field values
    const savedTestFields = await this.repository.getTestFieldsByTestId(
      c,
      item.id
    )
    const testFieldsMap: Record<number, { key: string; value: unknown }[]> = {
      [item.id]: savedTestFields,
    }

    const parameterCategoryItems = this.mapParameterCategoryItems(
      c,
      item.id,
      fields,
      testFieldsMap
    )

    // Add inventory item for 'Kualitas Udara'
    if (
      item.parameter_category_name?.toLowerCase().includes("kualitas udara")
    ) {
      parameterCategoryItems.push({
        id: 999,
        label: this.translate(
          c,
          "environmental_health.items.inventory.label",
          "Inventory / Alat"
        ),
        key: "inventory",
        type: "inventory",
        value: inventories,
      })
    }

    const isFinalDistribution =
      Number((item as any).is_final_distribution ?? 0) === 1
    const locationString = (item as any).entity_location_string ?? null
    const locationAddress = (item as any).entity_location_address ?? null
    const entityNameOut = isFinalDistribution
      ? item.location || item.entity_name
      : item.entity_name
    const locationOut = locationString ?? item.location
    const rawAddress = item.entity_address
    const addressBlank =
      !rawAddress || rawAddress === "-" || rawAddress.trim() === ""
    const entityAddressOut = addressBlank
      ? (locationAddress ?? rawAddress)
      : rawAddress

    return {
      id: item.id,
      created_at: item.created_at,
      entity_id: item.entity_id,
      entity_name: entityNameOut,
      entity_address: entityAddressOut,
      parameter_category_id: item.parameter_category_id,
      parameter_category_name: item.parameter_category_name,
      activity_id: item.activity_id,
      activity_name: item.activity_name,
      parameter_category_items: parameterCategoryItems,
      sample_id: item.sample_id,
      received_date: item.received_date,
      lab_result_status: item.lab_result_status,
      test_start_date: item.test_start_date,
      test_end_date: item.test_end_date,
      sample_collected_by: item.sample_collected_by,
      location: locationOut,
      collection_date: item.collection_date,
      has_ikl: (item.has_ikl as unknown) === 1 || item.has_ikl === true,
      ikl_test_date: item.ikl_test_date,
      ikl_score: item.ikl_score ? Number(item.ikl_score) : null,
      is_qualified: item.ikl_score ? Number(item.ikl_score) >= 80 : false,
      inventory_ids: inventories,
      test_results: testResults,
      management_asset: item.management_asset_id
        ? {
            id: item.management_asset_id,
            model_name: item.management_asset_model_name ?? null,
            serial_number: item.management_asset_serial_number ?? null,
            working_status: item.management_asset_working_status
              ? this.translate(
                  c,
                  item.management_asset_working_status,
                  item.management_asset_working_status
                )
              : null,
            asset_type_name: item.management_asset_type_name ?? null,
            production_year:
              (item as any).management_asset_production_year ?? null,
          }
        : null,
      distribution_details:
        distribution_details.length > 0 ? distribution_details : null,
      examination_entity_id: (item as any).examination_entity_id ?? null,
      examination_entity: (item as any).examination_entity_id
        ? {
            id: Number((item as any).examination_entity_id),
            name: (item as any).examination_entity_name ?? null,
            regency_id: (item as any).examination_entity_regency_id ?? null,
          }
        : null,
      management_asset: (item as any).management_asset_id
        ? {
            id: Number((item as any).management_asset_id),
            model_name: (item as any).management_asset_model_name ?? null,
            serial_number: (item as any).management_asset_serial_number ?? null,
            production_year: (item as any).management_asset_production_year ?? null,
            working_status: (item as any).management_asset_working_status ?? null,
            asset_type_name: (item as any).management_asset_type_name ?? null,
          }
        : null,
    }
  }

  async delete(c: Context, id: number) {
    await this.repository.delete(c, id)
    return { id }
  }

  async exportExcel(c: Context, params: GetHistoryListQuery) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const title = `EnvironmentalHealthHistory_${currentTime.format(
      "YYYYMMDD_HHmm"
    )}`

    // Fetch all records within filters (bypass pagination)
    const listResult = await this.list(c, {
      ...params,
      page: 1,
      paginate: 10000,
    })

    const data = listResult.data

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

    data.forEach((item: any) => {
      item.parameter_category_items?.forEach((p: any) => {
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
      { header: "Activity", key: "activity_name", width: 20 },
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

    data.forEach((item: any, index: number) => {
      const startRow = rows.length + 2
      const testResults = item.test_results || []
      const recordData = this.buildRecordData(item, index, dynamicLabels)

      if (testResults.length === 0) {
        rows.push(this.generateRow(recordData, columns))
      } else {
        testResults.forEach((res: any) => {
          rows.push(this.generateRow(recordData, columns, res))
        })
      }

      const endRow = rows.length + 1
      if (endRow > startRow) {
        mergeRanges.push({ start: startRow, end: endRow, item })
      }
    })

    const template = new EnvironmentalHealthHistoryTemplate()
    const sheetName = "Riwayat Kesling"

    await template.initSheet(sheetName)
    template.setTitle(title)
    template.setTimezone(timezone)
    template.setColumns(columns)
    await template.addRows(sheetName, rows)

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

  private resolveSampleCollectedBy(value: string): string {
    if (value === "lab") return "Lab Puskesmas"
    if (value === "customer") return "Customer"
    return value
  }

  private resolveIsQualified(item: any): string {
    if (!item.has_ikl) return "-"
    return item.is_qualified ? "Memenuhi" : "Tidak Memenuhi"
  }

  private buildRecordData(
    item: any,
    index: number,
    dynamicLabels: string[]
  ): any {
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
      activity_name: item.activity_name,
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
      sample_collected_by: this.resolveSampleCollectedBy(
        item.sample_collected_by
      ),
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
      is_qualified: this.resolveIsQualified(item),
      test_material: item.test_material ?? null,
    }

    dynamicLabels.forEach((label) => {
      const field = item.parameter_category_items?.find(
        (p: any) => p.label === label
      )
      let value = field?.value ?? null
      if (field?.type === "date" && value) {
        value = moment(value as string).format("YYYY-MM-DD HH:mm")
      }
      recordData[`dynamic_${label}`] = value
    })

    return recordData
  }

  private generateRow(
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

  async exportPdf(c: Context, id: number) {
    const detailData = await this.detail(c, id)
    if (!detailData) {
      throw new BadRequestError(
        c.var.t("validator.not_exist", { field: "environmental_test" })
      )
    }

    const timezone = c.req.header("Timezone") || "Asia/Jakarta"
    const language = c.var.language || "id"
    const t = c.var.t

    // Map sample_collected_by enum to human-readable label (same as environmental-health module)
    const sampleCollectedByMap: Record<string, Record<string, string>> = {
      en: { lab: "Lab Puskesmas", customer: "Customer" },
      id: { lab: "Lab Puskesmas", customer: "Pelanggan" },
    }
    const rawCollectedBy = detailData.sample_collected_by ?? ""
    const sampleCollectedByLabel =
      sampleCollectedByMap[language]?.[rawCollectedBy] ??
      sampleCollectedByMap["en"]?.[rawCollectedBy] ??
      rawCollectedBy

    // Apply localized values to detail data for PDF
    const localizedData = {
      ...detailData,
      sample_collected_by: sampleCollectedByLabel || null,
      distribution_details: detailData.distribution_details ?? [],
    }

    const pdfGenerator = new EnvironmentalHealthHistoryPdfGenerator()
    return pdfGenerator.generate(localizedData, { timezone, language, t })
  }

  private mapParameterCategoryItems(
    c: Context,
    itemId: number,
    testFields: { id: string | number; label: string; key: string }[],
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
        type: (field as any).type ?? null,
        value: savedField ? savedField.value : null,
      }
    })
  }

  private translate(c: Context, key: string, defaultValue: string): string {
    const translated = c.var.t(key)
    return translated === key || !translated ? defaultValue : translated
  }
}