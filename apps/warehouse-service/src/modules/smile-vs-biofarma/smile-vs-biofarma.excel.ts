import { ExcelExportOption } from "@/common/types/excel.js"
import { swapKeys, toCommaSeparated } from "@/common/utils/common.js"
import { Column, Filter } from "@smile/lib/excel/types.js"
import { Context } from "hono"
import moment from "moment"
import { MasterDataRepository } from "../../common/repositories/master-data.repository.js"
import {
  BiofarmaOrderDTO,
  SmileVsBiofarmaQueryParams,
  SummaryByEntityDTO,
  SummaryByMaterialDTO,
  SummaryResponse,
} from "./smile-vs-biofarma.schema.js"

export class SmileVsBiofarmaExcel {
  constructor(private readonly masterDataRepo: MasterDataRepository) {}

  async generateFilters(c: Context, queryParams: SmileVsBiofarmaQueryParams) {
    const {
      province_ids,
      regency_ids,
      entity_ids,
      entity_tag_ids,
      material_ids,
      material_type_ids,
      activity_id,
      order_status,
      from,
      to,
    } = queryParams
    const { t } = c.var

    const startDate = moment(from).format("DD MMMM YYYY")
    const endDate = moment(to).format("DD MMMM YYYY")

    const [
      provinces,
      regencies,
      entities,
      entityTags,
      materials,
      materialTypes,
      activities,
      orderStatuses,
    ] = await Promise.all([
      this.masterDataRepo.fetchDataByIds("location", province_ids),
      this.masterDataRepo.fetchDataByIds("location", regency_ids),
      this.masterDataRepo.fetchDataByIds("entity", entity_ids),
      this.masterDataRepo.fetchDataByIds("entity_tag", entity_tag_ids, "title"),
      this.masterDataRepo.fetchDataByIds("ws_materials", material_ids),
      this.masterDataRepo.fetchDataByIds("material_type", material_type_ids),
      this.masterDataRepo.fetchDataByIds("ws_activity", [activity_id!]),
      this.masterDataRepo.fetchDataByIds("ws_order_status", [order_status!]),
    ])

    const filters: Filter[] = [
      {
        key: t("common.province"),
        value: toCommaSeparated(provinces) ?? t("common.all"),
      },
      {
        key: t("common.regency"),
        value: toCommaSeparated(regencies) ?? t("common.all"),
      },
      {
        key: t("common.entity"),
        value: toCommaSeparated(entities) ?? t("common.all"),
      },
      {
        key: t("common.entity_tag"),
        value:
          toCommaSeparated(entityTags, (data) =>
            t(`entity_tag.label.${data.name}`)
          ) ?? t("common.all"),
      },
      {
        key: t("common.export_time"),
        value: c.toLocalDate(new Date(), "DD MMMM YYYY HH:mm:ss"),
      },
      {
        key: t("common.period"),
        value: `${startDate} - ${endDate}`,
      },
      {
        key: t("common.material"),
        value: toCommaSeparated(materials) ?? t("common.all"),
      },
      {
        key: t("common.material_type"),
        value:
          toCommaSeparated(materialTypes, (data) =>
            t(`material_type.label.${data.name}`)
          ) ?? t("common.all"),
      },
      {
        key: t("common.activity"),
        value: toCommaSeparated(activities) ?? t("common.all"),
      },
      {
        key: t("common.order_status"),
        value:
          toCommaSeparated(orderStatuses, (data) =>
            t(`order.label.${data.name}`)
          ) ?? t("common.all"),
      },
    ]

    return filters
  }

  buildSummaryExportColumns(c: Context, reverse = false): Column[] {
    const columns = [
      {
        key: "smile_qty",
        header: c.var.t("smile_vs_biofarma.label.smile_qty"),
        width: 20,
      },
      {
        key: "smdv_qty",
        header: c.var.t("smile_vs_biofarma.label.smdv_qty"),
        width: 20,
      },
      {
        key: "deviation_qty",
        header: c.var.t("smile_vs_biofarma.label.deviation_qty"),
        width: 20,
      },
      {
        key: "deviation_percentage",
        header: c.var.t("smile_vs_biofarma.label.deviation_percentage"),
        width: 20,
      },
    ]

    if (reverse) {
      ;[columns[0]!, columns[1]!] = [columns[1]!, columns[0]!]
    }

    return columns
  }

  buildByEntityExportColumns(c: Context, reverse = false): Column[] {
    const columns = [
      { key: "no", header: "No.", width: 10 },
      {
        key: "entity_name",
        header: c.var.t("common.entity"),
        width: 30,
      },
      {
        key: "smile_qty",
        header: c.var.t("smile_vs_biofarma.label.smile_qty"),
        width: 20,
      },
      {
        key: "smdv_qty",
        header: c.var.t("smile_vs_biofarma.label.smdv_qty"),
        width: 20,
      },
      {
        key: "deviation_qty",
        header: c.var.t("smile_vs_biofarma.label.deviation_qty"),
        width: 20,
      },
      {
        key: "deviation_percentage",
        header: c.var.t("smile_vs_biofarma.label.deviation_percentage"),
        width: 20,
      },
    ]

    if (reverse) {
      ;[columns[2]!, columns[3]!] = [columns[3]!, columns[2]!]
    }

    return columns
  }

  buildByMaterialExportColumns(c: Context, reverse = false): Column[] {
    const columns = [
      { key: "no", header: "No.", width: 10 },
      {
        key: "smile_material_name",
        header: c.var.t("smile_vs_biofarma.label.smile_material"),
        width: 30,
      },
      {
        key: "biofarma_material_name",
        header: c.var.t("smile_vs_biofarma.label.smdv_material"),
        width: 30,
      },
      {
        key: "smile_qty",
        header: c.var.t("smile_vs_biofarma.label.smile_qty"),
        width: 20,
      },
      {
        key: "smdv_qty",
        header: c.var.t("smile_vs_biofarma.label.smdv_qty"),
        width: 20,
      },
      {
        key: "deviation_qty",
        header: c.var.t("smile_vs_biofarma.label.deviation_qty"),
        width: 20,
      },
      {
        key: "deviation_percentage",
        header: c.var.t("smile_vs_biofarma.label.deviation_percentage"),
        width: 20,
      },
    ]

    if (reverse) {
      ;[columns[1]!, columns[2]!] = [columns[2]!, columns[1]!]
      ;[columns[3]!, columns[4]!] = [columns[4]!, columns[3]!]
    }

    return columns
  }

  buildBiofarmaOrdersExportColumns(c: Context, reverse = false): Column[] {
    const columns = [
      { key: "row", header: "No.", width: 10 },
      {
        key: "smile_order_created_at",
        header: c.var.t("smile_vs_biofarma.label.created_at"),
        width: 20,
      },
      {
        key: "smile_order_id",
        header: c.var.t("smile_vs_biofarma.label.smile_order_id"),
        width: 20,
      },
      {
        key: "smile_order_status_label",
        header: c.var.t("smile_vs_biofarma.label.smile_order_status_label"),
        width: 20,
      },
      { key: "province_name", header: c.var.t("common.province"), width: 20 },
      { key: "regency_name", header: c.var.t("common.regency"), width: 20 },
      { key: "entity_name", header: c.var.t("common.entity"), width: 30 },
      {
        key: "smile_order_stock_allocated_qty",
        header: c.var.t(
          "smile_vs_biofarma.label.smile_order_stock_allocated_qty"
        ),
        width: 20,
      },
      {
        key: "smile_order_stock_received_qty",
        header: c.var.t(
          "smile_vs_biofarma.label.smile_order_stock_received_qty"
        ),
        width: 20,
      },
      {
        key: "biofarma_nama_produk",
        header: c.var.t("smile_vs_biofarma.label.biofarma_nama_produk"),
        width: 30,
      },
      {
        key: "biofarma_nomor_do",
        header: c.var.t("smile_vs_biofarma.label.biofarma_nomor_do"),
        width: 20,
      },
      {
        key: "smile_batch_code",
        header: c.var.t("smile_vs_biofarma.label.smile_batch_code"),
        width: 20,
      },
      {
        key: "smile_order_fulfilled_at",
        header: c.var.t("smile_vs_biofarma.label.smile_order_fulfilled_at"),
        width: 20,
      },
    ]

    if (reverse) {
      ;[columns[2]!, columns[3]!] = [columns[3]!, columns[2]!]
    }

    return columns
  }

  buildSmileVsBiofarmaExportOptions(
    c: Context,
    summaryData: SummaryResponse,
    byEntityData: SummaryByEntityDTO[],
    byMaterialData: SummaryByMaterialDTO[],
    biofarmaOrders: BiofarmaOrderDTO[],
    filters: Filter[],
    reverse = false
  ): ExcelExportOption[] {
    const options: ExcelExportOption[] = []

    // Summary Sheet
    options.push({
      sheetName: c.var.t("smile_vs_biofarma.label.summary_sheet"),
      titleBar: c.var.t("smile_vs_biofarma.label.summary_sheet"),
      filters,
      columns: this.buildSummaryExportColumns(c, reverse),
      data: [
        {
          ...summaryData,
          deviation_percentage: `${summaryData.deviation_percentage}%`,
        },
      ],
    })

    // By Entity Sheet
    options.push({
      sheetName: c.var.t("smile_vs_biofarma.label.by_entity_sheet"),
      titleBar: c.var.t("smile_vs_biofarma.label.by_entity_sheet"),
      filters,
      columns: this.buildByEntityExportColumns(c, reverse),
      data: byEntityData.map((item, index: number) => {
        const row = {
          no: index + 1,
          entity_name: item.entity_name,
          smile_qty: item.smile_qty,
          smdv_qty: item.smdv_qty,
          deviation_qty: item.deviation_qty,
          deviation_percentage: `${item.deviation_percentage}%`,
        }

        if (reverse) {
          swapKeys(row, "smdv_qty", "smile_qty")
        }

        return row
      }),
    })

    // By Material Sheet
    options.push({
      sheetName: c.var.t("smile_vs_biofarma.label.by_material_sheet"),
      titleBar: c.var.t("smile_vs_biofarma.label.by_material_sheet"),
      filters,
      columns: this.buildByMaterialExportColumns(c, reverse),
      data: byMaterialData.map((item, index: number) => {
        const row = {
          no: index + 1,
          smile_material_name: item.smile_material_name,
          biofarma_material_name: item.biofarma_material_name,
          smile_qty: item.smile_qty,
          smdv_qty: item.smdv_qty,
          deviation_qty: item.deviation_qty,
          deviation_percentage: `${item.deviation_percentage}%`,
        }

        if (reverse) {
          swapKeys(row, "smile_material_name", "biofarma_material_name")
          swapKeys(row, "smdv_qty", "smile_qty")
        }

        return row
      }),
    })

    // Biofarma Orders Sheet
    options.push({
      sheetName: c.var.t("smile_vs_biofarma.label.biofarma_orders_sheet"),
      titleBar: c.var.t("smile_vs_biofarma.label.biofarma_orders_sheet"),
      filters,
      columns: this.buildBiofarmaOrdersExportColumns(c),
      data: biofarmaOrders.map((item) => ({
        ...item,
        smile_order_status_label: c.var.t(
          `order.label.${item.smile_order_status_label}`
        ),
      })),
    })

    return options
  }
}
