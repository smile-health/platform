import { FLAG } from "@/common/constants/common.js"
import { calculatePagination } from "@/common/utils/pagination.js"
import WarehouseTemplate from "@smile/lib/excel/warehouse-template.js"
import { Context } from "hono"
import { round } from "lodash"
import moment from "moment"
import { LocationModule } from "../location/location.module.js"
import { SmileVsBiofarmaExcel } from "./smile-vs-biofarma.excel.js"
import { SmileVsBiofarmaRepository } from "./smile-vs-biofarma.repository.js"
import {
  SmileVsBiofarmaQueryParams,
  SummaryResponse,
} from "./smile-vs-biofarma.schema.js"

export class SmileVsBiofarmaModule {
  constructor(
    private readonly smileVsBiofarmaRepository: SmileVsBiofarmaRepository,
    private readonly locationModule: LocationModule,
    private readonly smileVsBiofarmaExcel: SmileVsBiofarmaExcel
  ) {}

  async getSummaryData(
    c: Context,
    queryParams: SmileVsBiofarmaQueryParams
  ): Promise<SummaryResponse> {
    const { reverse } = queryParams

    const [smdvData, smileData] = await Promise.all([
      this.smileVsBiofarmaRepository.fetchSmdvSummary(queryParams),
      this.smileVsBiofarmaRepository.fetchSmileSummary(queryParams),
    ])

    const smdv_qty = smdvData[0]?.smdv_total ?? 0
    const smile_qty = smileData[0]?.smile_total ?? 0

    const deviation_qty =
      reverse === FLAG.TRUE
        ? Number(smdv_qty) - Number(smile_qty)
        : Number(smile_qty) - Number(smdv_qty)

    const diffPct = (a: number, b: number): number =>
      round(
        Math.min(a, b) === 0
          ? Math.max(a, b) === 0
            ? 0
            : a < b
              ? -100
              : 100
          : ((a - b) / Math.min(a, b)) * 100
      )

    return reverse === FLAG.TRUE
      ? {
          smdv_qty,
          smile_qty,
          deviation_qty,
          deviation_percentage: diffPct(smdv_qty, smile_qty),
        }
      : {
          smile_qty,
          smdv_qty,
          deviation_qty,
          deviation_percentage: diffPct(smile_qty, smdv_qty),
        }
  }

  async getListDataByMaterial(
    c: Context,
    queryParams: SmileVsBiofarmaQueryParams,
    isExcel = false
  ) {
    const { page, paginate, reverse } = queryParams
    const { data, count } =
      await this.smileVsBiofarmaRepository.fetchMaterialData(
        queryParams,
        isExcel
      )

    const mappedData = data.map((item, index) => {
      const isNegative =
        reverse === FLAG.TRUE
          ? item.smdv_qty < item.smile_qty
          : item.smile_qty < item.smdv_qty

      return {
        row: index + 1 + ((page || 1) - 1) * (paginate || 10),
        material: {
          id: item.master_material_id ?? null,
          name: item.master_material_name ?? item.material_biofarma,
        },
        material_name: item.name,
        smile_material_name: item.master_material_name,
        biofarma_material_name: item.material_biofarma,
        smile_qty: item.smile_qty || 0,
        smdv_qty: item.smdv_qty || 0,
        deviation_qty: isNegative ? -item.deviation_qty : item.deviation_qty,
        deviation_percentage: isNegative
          ? -item.deviation_percentage
          : item.deviation_percentage,
      }
    })

    const lastUpdated = await this.smileVsBiofarmaRepository.fetchLastUpdated()

    return {
      date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      last_updated: lastUpdated?.last_update,
      ...calculatePagination(count[0]!.total, page || 1, paginate || 10),
      data: mappedData,
    }
  }

  async searchMaterial(c: Context, queryParams: SmileVsBiofarmaQueryParams) {
    const { page, paginate } = queryParams
    const { data, count } =
      await this.smileVsBiofarmaRepository.searchMaterialData(queryParams)

    const mappedData = data.map((item, index) => {
      return {
        row: index + 1 + ((page || 1) - 1) * (paginate || 10),
        name: item.biofarma_nama_produk,
      }
    })

    return {
      ...calculatePagination(count[0]!.total, page || 1, paginate || 10),
      data: mappedData,
    }
  }

  async getListDataByEntity(
    c: Context,
    queryParams: SmileVsBiofarmaQueryParams,
    isExcel = false
  ) {
    const { page = 1, paginate = 10, reverse } = queryParams
    const { data, count } =
      await this.smileVsBiofarmaRepository.fetchEntityData(queryParams, isExcel)

    const mappedData = data.map((item, index) => {
      const isNegative =
        reverse === FLAG.TRUE
          ? item.smdv_qty < item.smile_qty
          : item.smile_qty < item.smdv_qty

      return {
        row: index + 1 + ((page || 1) - 1) * (paginate || 10),
        entity: {
          id: item.entity_id,
          name: item.entity_name,
        },
        entity_name: item.entity_name,
        smile_qty: item.smile_qty || 0,
        smdv_qty: item.smdv_qty || 0,
        deviation_qty: isNegative ? -item.deviation_qty : item.deviation_qty,
        deviation_percentage: isNegative
          ? -item.deviation_percentage
          : item.deviation_percentage,
      }
    })

    const lastUpdated = await this.smileVsBiofarmaRepository.fetchLastUpdated()

    return {
      date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      last_updated: lastUpdated?.last_update,
      ...calculatePagination(count[0]!.total, page || 1, paginate || 10),
      data: mappedData,
    }
  }

  async getExport(c: Context, queryParams: SmileVsBiofarmaQueryParams) {
    const { reverse } = queryParams

    // Fetch data for all three sheets without pagination
    const [summaryData, byEntityData, byMaterialData, biofarmaOrders] =
      await Promise.all([
        this.getSummaryData(c, queryParams),
        this.getListDataByEntity(c, queryParams, true),
        this.getListDataByMaterial(c, queryParams, true),
        this.getBiofarmaOrdersData(queryParams),
      ])

    // Generate filters
    const filters = await this.smileVsBiofarmaExcel.generateFilters(
      c,
      queryParams
    )

    // Build export options for all sheets
    const options = this.smileVsBiofarmaExcel.buildSmileVsBiofarmaExportOptions(
      c,
      summaryData,
      byEntityData.data,
      byMaterialData.data,
      biofarmaOrders,
      filters,
      reverse === FLAG.TRUE
    )

    // Generate Excel file with multiple sheets
    const template = new WarehouseTemplate()
    const MAX_FILTER_ROWS = 6
    await template.initWorkbook()

    for await (const option of options) {
      template.initSheet(option.sheetName)
      template.setTitleBar(option.sheetName, option.columns, option.titleBar)
      template.setFilters(option.sheetName, option.filters, MAX_FILTER_ROWS)
      template.setColumns(option.columns, undefined, option.sheetName)
      await template.addRows(option.sheetName, option.data)
    }

    const fileName = reverse === FLAG.TRUE ? "smdv_vs_smile" : "smile_vs_smdv"
    template.setTitle(c.var.t(`smile_vs_biofarma.label.${fileName}`))
    template.setTimezone(c.var.timezone)
    template.setLanguage(c.var.language)

    return await template.generate()
  }

  async getBiofarmaOrdersData(queryParams: SmileVsBiofarmaQueryParams) {
    const data =
      await this.smileVsBiofarmaRepository.fetchBiofarmaOrders(queryParams)

    const mappedData = data.map((item, index) => {
      return {
        row: index + 1,
        ...item,
      }
    })

    return mappedData
  }
}
