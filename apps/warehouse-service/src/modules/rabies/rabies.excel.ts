import { Context } from "hono"
import moment from "moment"
import WarehouseTemplate from "@smile-health/lib/excel/warehouse-template.js"
import { Column, Filter } from "@smile-health/lib/excel/types.js"
import { ExcelExportOption } from "@/common/types/excel.js"
import { PaginationOption } from "@/common/schemas/pagination.schema.js"
import { EntityRepository } from "../entity/entity.repository.js"
import { RabiesDetail, RabiesQueryParams } from "./rabies.schema.js"
import { RegionRepository } from "../region/region.repository.js"

export class RabiesExcel {
  constructor(
    private readonly regionRepository: RegionRepository,
    private readonly entityRepository: EntityRepository
  ) {}

  async generateReportExport(
    c: Context,
    queryParams: RabiesQueryParams,
    data: RabiesDetail[]
  ) {
    const columns: Column[] = [
      { key: "row", header: "No.", width: 10 },
      {
        key: "actual_transaction_date",
        header: c.var.t("common.date"),
        width: 15,
      },
      {
        key: "province_name",
        header: c.var.t("common.province"),
        width: 15,
      },
      {
        key: "regency_name",
        header: c.var.t("common.regency"),
        width: 15,
      },
      {
        key: "entity_name",
        header: c.var.t("common.entity"),
        width: 15,
      },
      {
        key: "patient_nik",
        header: c.var.t("common.patient_identity"),
        width: 15,
      },
      {
        key: "material_name",
        header: c.var.t("common.material"),
        width: 30,
      },
      {
        key: "material_unit",
        header: c.var.t("common.material_unit"),
        width: 15,
      },
      {
        key: "material_category",
        header: c.var.t("common.material_category"),
        width: 15,
      },
      {
        key: "vaccine_type",
        header: c.var.t("common.sequence"),
        width: 15,
      },
      {
        key: "injection",
        header: c.var.t("common.injection"),
        width: 15,
      },
    ]

    const filters = await this.generateFilters(c, queryParams)

    const option: ExcelExportOption = {
      sheetName: c.var.t("rabies.sheet.title"),
      titleBar: `${c.var.t("rabies.sheet.titlebar")}`,
      filters,
      columns,
      data,
    }

    const template = new WarehouseTemplate()
    await template.initWorkbook()

    template.initSheet(option.sheetName)
    template.setTitleBar(option.sheetName, option.columns, option.titleBar)
    template.setFilters(option.sheetName, option.filters)
    template.setColumns(option.columns, undefined, option.sheetName)
    await template.addRows(option.sheetName, option.data)

    const fileName = `${option.sheetName} ${moment().format("YYYY MM DD HH:mm:ss")}`
    template.setTitle(fileName)

    return await template.generate()
  }

  private async generateFilters(
    c: Context,
    queryParams: RabiesQueryParams
  ): Promise<Filter[]> {
    const { from, to, province_ids, entity_ids, regency_ids } = queryParams

    const startDate = moment(from).format("DD MMM YYYY")
    const endDate = moment(to).format("DD MMM YYYY")

    const filterPaginationOption: PaginationOption = {
      is_paginate: false,
      count: false,
    }

    const provinces = province_ids
      ? (
          await this.regionRepository.fetchProvinces(
            c,
            queryParams,
            filterPaginationOption
          )
        ).records
      : []

    const entities = entity_ids
      ? (
          await this.entityRepository.fetchEntities(
            c,
            queryParams,
            filterPaginationOption
          )
        ).records
      : []

    const regencies = regency_ids
      ? (
          await this.regionRepository.fetchRegencies(
            c,
            queryParams,
            filterPaginationOption
          )
        ).records
      : []

    const filters: Filter[] = [
      {
        key: c.var.t("common.from_date"),
        value: startDate,
      },
      {
        key: c.var.t("common.to_date"),
        value: endDate,
      },
      {
        key: c.var.t("common.province"),
        value:
          Array.isArray(provinces) && provinces.length > 0
            ? provinces.map((province) => province.name).join(", ")
            : c.var.t("common.all"),
      },
      {
        key: c.var.t("common.regency"),
        value:
          Array.isArray(regencies) && regencies.length > 0
            ? regencies.map((regency) => regency.name).join(", ")
            : c.var.t("common.all"),
      },
      {
        key: c.var.t("common.entity"),
        value:
          Array.isArray(entities) && entities.length > 0
            ? entities.map((entity) => entity.name).join(", ")
            : c.var.t("common.all"),
      },
    ]

    return filters
  }
}
