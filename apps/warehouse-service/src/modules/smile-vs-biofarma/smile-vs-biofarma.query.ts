import { FLAG } from "@/common/constants/common.js"
import { ORDER_STATUS } from "@/common/constants/order.js"
import { SmileVsBiofarmaQueryParams } from "./smile-vs-biofarma.schema.js"

export class SmileVsBiofarmaQuery {
  generateFilters(queryParams: SmileVsBiofarmaQueryParams) {
    let filter =
      " and smile_program_id = {program_id:Int} and smile_order_type = 4 and deleted_at is null and master_deleted_at is null"

    if (queryParams.province_ids) {
      filter += " and province_id in {province_ids:Array(Int)}"
    }
    if (queryParams.regency_ids) {
      filter += " and regency_id in {regency_ids:Array(Int)}"
    }
    if (queryParams.entity_tag_ids) {
      filter += " and entity_tag_id in {entity_tag_ids:Array(Int)}"
    }
    const filterEntity = filter

    if (queryParams.activity_id) {
      filter += " and smile_order_activity_id = {activity_id:Int}"
    }
    if (queryParams.material_type_id) {
      filter += " and has(smile_material_type, {material_type_id:Int})"
    }

    if (queryParams.entity_ids) {
      filter += " and entity_id in {entity_ids:Array(Int)}"
    }
    if (queryParams.order_status) {
      filter += " and smile_order_status = {order_status:Int}"
    }
    if (queryParams.biofarma_material_name) {
      filter += " and biofarma_nama_produk = {biofarma_material_name:String}"
    }

    let filterSMDV = filter
    let filterSMILE = filter

    if (queryParams.from) {
      filterSMDV += ` and biofarma_tanggal_do >={from:DateTime('Asia/Jakarta')}`
    }
    if (queryParams.to) {
      filterSMDV += ` and biofarma_tanggal_do <={to:DateTime('Asia/Jakarta')}`
    }

    if (queryParams.material_ids) {
      filterSMILE += " and smile_material_id in {material_ids:Array(Int)}"
    }

    if (queryParams.order_status === ORDER_STATUS.FULFILLED) {
      filterSMILE += ` and (smile_order_fulfilled_at >= {from:DateTime('Asia/Jakarta')} and smile_order_fulfilled_at <={to:DateTime('Asia/Jakarta')})`
    } else if (queryParams.order_status === ORDER_STATUS.CANCELED) {
      filterSMILE += ` and (smile_order_cancelled_at >= {from:DateTime('Asia/Jakarta')} and smile_order_cancelled_at <={to:DateTime('Asia/Jakarta')})`
    } else {
      filterSMILE += ` and (smile_order_shipped_at >= {from:DateTime('Asia/Jakarta')} and smile_order_shipped_at <={to:DateTime('Asia/Jakarta')})`
    }

    return {
      filterEntity,
      filterSMILE,
      filterSMDV,
    }
  }

  getLastUpdatedQuery() {
    return `SELECT MAX(ingested_at) as last_update FROM datamart_smdv_reconciliation_v5`
  }
  getSummarySmdvQuery(params: SmileVsBiofarmaQueryParams) {
    const { filterSMDV } = this.generateFilters(params)
    return `
      SELECT sum(biofarma_jumlah_dosis) as smdv_total
      FROM datamart_smdv_reconciliation_v5
      ARRAY JOIN
        biofarma_nama_produk AS biofarma_nama_produk,
        biofarma_jumlah_dosis AS biofarma_jumlah_dosis
      WHERE 1=1 ${filterSMDV}
    `
  }

  getSummarySmileQuery(params: SmileVsBiofarmaQueryParams) {
    const { filterSMILE } = this.generateFilters(params)
    return `
      SELECT sum(smile_order_stock_allocated_qty) as smile_total
      FROM datamart_smdv_reconciliation_v5
      ARRAY JOIN
        smile_nama_produk AS biofarma_nama_produk,
        smile_order_stock_allocated_qty AS smile_order_stock_allocated_qty,
        smile_material_id AS smile_material_id
      WHERE smile_order_id > 0 ${filterSMILE}
    `
  }
  getQueryDataByMaterial(params: SmileVsBiofarmaQueryParams, isExcel = false) {
    const { page = 1, paginate = 10, reverse } = params
    const offset = (Number(page) - 1) * Number(paginate)

    const limitPaging = !isExcel ? `LIMIT ${paginate} OFFSET ${offset}` : ``
    const { filterSMILE, filterSMDV } = this.generateFilters(params)

    return reverse === FLAG.TRUE
      ? `
    SELECT
      a.biofarma_nama_produk as material_biofarma,
      d.master_material_name as master_material_name,
      a.biofarma_nama_produk as name,
      COALESCE(b.smile_qty, 0) as smile_qty,
      COALESCE(c.smdv_qty, 0) as smdv_qty,
      abs(smile_qty - smdv_qty) AS deviation_qty,
      multiIf(
        least(smile_qty, smdv_qty) = 0 AND greatest(smile_qty, smdv_qty) = 0, 0,
        least(smile_qty, smdv_qty) = 0, 100,
        round(abs(smile_qty - smdv_qty) / least(smile_qty, smdv_qty), 2) * 100
      ) AS deviation_percentage
    FROM (
      SELECT
          DISTINCT COALESCE(biofarma_nama_produk, '-') as biofarma_nama_produk
      FROM datamart_smdv_reconciliation_v5 a
      ARRAY JOIN
        biofarma_nama_produk AS biofarma_nama_produk
      WHERE smile_program_id = {program_id:Int}
      ${params.biofarma_material_name ? " AND biofarma_nama_produk = {biofarma_material_name:String}" : ""}
      ${params.activity_id ? " AND smile_order_activity_id = {activity_id:Int}" : ""}
      AND biofarma_nama_produk is not null
    ) a LEFT JOIN (
      SELECT COALESCE(biofarma_nama_produk, '-') as biofarma_nama_produk, sum(smile_order_stock_allocated_qty) as smile_qty
      FROM datamart_smdv_reconciliation_v5 b
      ARRAY JOIN
        smile_nama_produk AS biofarma_nama_produk,
        smile_order_stock_allocated_qty AS smile_order_stock_allocated_qty
      WHERE 1 = 1 ${filterSMILE} GROUP BY biofarma_nama_produk
    ) as b ON TRIM(b.biofarma_nama_produk) = TRIM(a.biofarma_nama_produk)
    LEFT JOIN (
      SELECT COALESCE(biofarma_nama_produk, '-') as biofarma_nama_produk, sum(biofarma_jumlah_dosis) as smdv_qty
      FROM datamart_smdv_reconciliation_v5 c
      ARRAY JOIN
        biofarma_nama_produk AS biofarma_nama_produk,
        biofarma_jumlah_dosis AS biofarma_jumlah_dosis
      WHERE 1 = 1 ${filterSMDV} GROUP BY biofarma_nama_produk
    ) as c ON c.biofarma_nama_produk = a.biofarma_nama_produk
    LEFT JOIN (
      SELECT DISTINCT biofarma_nama_produk, master_material_name
      FROM datamart_smdv_reconciliation_v5 c
      ARRAY JOIN
        smile_nama_produk AS biofarma_nama_produk,
        smile_master_material_name AS master_material_name
      WHERE 1 = 1
    ) as d ON TRIM(d.biofarma_nama_produk) = TRIM(a.biofarma_nama_produk)
    ORDER BY deviation_qty DESC, smdv_qty DESC, smile_qty DESC, material_biofarma ASC
    ${limitPaging}
    `
      : `
    SELECT
        a.smile_material_id as master_material_id,
        a.smile_master_material_name as master_material_name,
        a.smile_nama_produk as material_biofarma,
        a.smile_master_material_name as name,
        COALESCE(b.smile_qty, 0) as smile_qty,
        COALESCE(c.smdv_qty, 0) as smdv_qty,
        abs(smile_qty - smdv_qty) AS deviation_qty,
        multiIf(
          least(smile_qty, smdv_qty) = 0 AND greatest(smile_qty, smdv_qty) = 0, 0,
          least(smile_qty, smdv_qty) = 0, 100,
          round(abs(smile_qty - smdv_qty) / least(smile_qty, smdv_qty), 2) * 100
        ) AS deviation_percentage
      FROM (
        SELECT
            DISTINCT smile_material_id,
            smile_master_material_name,
            smile_nama_produk,
            1 as is_vaccine
        FROM datamart_smdv_reconciliation_v5 a
        ARRAY JOIN
          smile_material_id AS smile_material_id,
          smile_master_material_name AS smile_master_material_name,
          smile_nama_produk as smile_nama_produk
        WHERE smile_material_id is not NULL
        AND smile_program_id = {program_id:Int}
        ${params.material_ids ? " AND smile_material_id in {material_ids:Array(Int)}" : ""}
        ${params.activity_id ? " AND smile_order_activity_id = {activity_id:Int}" : ""}
      ) a LEFT JOIN (
        SELECT smile_material_id, sum(smile_order_stock_allocated_qty) as smile_qty
        FROM datamart_smdv_reconciliation_v5 b
        ARRAY JOIN
          smile_nama_produk AS biofarma_nama_produk,
          smile_material_id AS smile_material_id,
          smile_order_stock_allocated_qty AS smile_order_stock_allocated_qty
        WHERE 1 = 1 ${filterSMILE} GROUP BY smile_material_id
      ) as b ON b.smile_material_id = a.smile_material_id
      LEFT JOIN (
        SELECT biofarma_nama_produk, sum(biofarma_jumlah_dosis) as smdv_qty
        FROM datamart_smdv_reconciliation_v5 c
        ARRAY JOIN
          biofarma_nama_produk AS biofarma_nama_produk,
          biofarma_jumlah_dosis AS biofarma_jumlah_dosis
        WHERE 1 = 1 ${filterSMDV} GROUP BY biofarma_nama_produk
      ) as c ON c.biofarma_nama_produk = a.smile_nama_produk
    ORDER BY deviation_qty DESC, smile_qty DESC, smdv_qty DESC, name ASC
    ${limitPaging}
    `
  }
  getQueryPagingMaterial(params: SmileVsBiofarmaQueryParams) {
    const { reverse } = params
    return reverse === FLAG.TRUE
      ? `
    SELECT
        count(DISTINCT biofarma_nama_produk) as total
    FROM datamart_smdv_reconciliation_v5 a
    ARRAY JOIN
      biofarma_nama_produk AS biofarma_nama_produk
    WHERE smile_program_id = {program_id:Int}
    ${params.biofarma_material_name ? " AND biofarma_nama_produk = {biofarma_material_name:String}" : ""}
    ${params.activity_id ? " AND smile_order_activity_id = {activity_id:Int}" : ""}
    AND biofarma_nama_produk is not null
    `
      : `
    SELECT
       count(DISTINCT smile_material_id) as total
    FROM datamart_smdv_reconciliation_v5 a
    ARRAY JOIN
      smile_material_id AS smile_material_id
    WHERE a.smile_material_id is not NULL
    AND smile_program_id = {program_id:Int}
    ${params.material_ids ? " AND smile_material_id in {material_ids:Array(Int)}" : ""}
    ${params.activity_id ? " AND smile_order_activity_id = {activity_id:Int}" : ""}
    `
  }
  getQueryDataByEntity(params: SmileVsBiofarmaQueryParams, isExcel = false) {
    const { page = 1, paginate = 10 } = params
    const offset = (Number(page) - 1) * Number(paginate)

    const limitPaging = !isExcel ? `LIMIT ${paginate} OFFSET ${offset}` : ``
    const { filterEntity, filterSMILE, filterSMDV } =
      this.generateFilters(params)

    return `
      SELECT
        a.entity_id as entity_id,
        a.entity_name as entity_name,
        a.entity_type as entity_type,
        a.entity_name as name,
        a.province_id,
        COALESCE(b.smile_qty, 0) as smile_qty,
        COALESCE(c.smdv_qty, 0) as smdv_qty,
        abs(smile_qty - smdv_qty) AS deviation_qty,
        multiIf(
          least(smile_qty, smdv_qty) = 0 AND greatest(smile_qty, smdv_qty) = 0, 0,
          least(smile_qty, smdv_qty) = 0, 100,
          round(abs(smile_qty - smdv_qty) / least(smile_qty, smdv_qty), 2) * 100
        ) AS deviation_percentage
      FROM (
        SELECT
            DISTINCT a.entity_id,
            a.entity_name,
            a.entity_type,
            COALESCE(a.province_id, 0) as province_id,
            a.regency_id
        FROM datamart_smdv_reconciliation_v5 a WHERE a.entity_id is not NULL
        AND smile_program_id = {program_id:Int}
        ${filterEntity}
      ) a LEFT JOIN (
        SELECT b.entity_id, sum(smile_order_stock_allocated_qty) as smile_qty
        FROM datamart_smdv_reconciliation_v5 b
        ARRAY JOIN
          smile_nama_produk AS biofarma_nama_produk,
          smile_order_stock_allocated_qty as smile_order_stock_allocated_qty,
          smile_material_id as smile_material_id
        WHERE smile_program_id = {program_id:Int}
        ${filterSMILE} GROUP BY b.entity_id
      ) as b ON b.entity_id = a.entity_id
      LEFT JOIN (
        SELECT c.entity_id, sum(biofarma_jumlah_dosis) as smdv_qty
        FROM datamart_smdv_reconciliation_v5 c
        ARRAY JOIN
          biofarma_nama_produk AS biofarma_nama_produk,
          biofarma_jumlah_dosis
        WHERE smile_program_id = {program_id:Int}
        ${filterSMDV} GROUP BY c.entity_id
      ) as c ON c.entity_id = a.entity_id
    ORDER BY deviation_qty DESC, smile_qty DESC, smdv_qty DESC, province_id ASC, a.entity_type ASC, a.entity_id ASC
    ${limitPaging}
        `
  }
  getQueryPagingEntity(params: SmileVsBiofarmaQueryParams) {
    const { filterEntity } = this.generateFilters(params)
    return `
      SELECT count(DISTINCT a.entity_id) as total
      FROM datamart_smdv_reconciliation_v5 a WHERE a.entity_id is not NULL
      ${filterEntity}
    `
  }

  getQueryBiofarmaOrder(params: SmileVsBiofarmaQueryParams) {
    const { filterSMDV, filterSMILE } = this.generateFilters(params)
    const queryString = `
      SELECT
        toDate(o.smile_order_created_at) AS smile_order_created_at,
        o.smile_order_id,
        o.smile_order_status_label,
        o.province_name,
        o.regency_name,
        o.entity_name,

        z.1 AS biofarma_nama_produk,
        z.2 AS smile_order_stock_allocated_qty,
        z.3 AS smile_order_stock_received_qty,
        z.4 AS smile_batch_code,

        o.biofarma_nomor_do,
        toDate(o.smile_order_fulfilled_at) AS smile_order_fulfilled_at

      FROM
      (
          SELECT *,
              arrayZipUnaligned(
                  smile_nama_produk,
                  smile_order_stock_allocated_qty,
                  smile_order_stock_received_qty,
                  smile_batch_code
              ) AS zipped
          FROM datamart_smdv_reconciliation_v5
      ) o

      ARRAY JOIN o.zipped AS z

      WHERE o.biofarma_nomor_do IS NOT NULL ${params.reverse ? filterSMDV : filterSMILE}
    `
    return queryString
  }
  getSearchMaterialQuery(params: SmileVsBiofarmaQueryParams) {
    const { page = 1, paginate = 10, keyword } = params
    const offset = (Number(page) - 1) * Number(paginate)

    let filter = ""
    if (keyword) {
      filter += ` AND biofarma_nama_produk ILIKE '%${keyword}%'`
    }

    return `
      SELECT DISTINCT biofarma_nama_produk
      FROM datamart_smdv_reconciliation_v5
      ARRAY JOIN
        biofarma_nama_produk AS biofarma_nama_produk
      WHERE biofarma_nama_produk IS NOT NULL and smile_program_id = {program_id:Int} ${filter}
      ORDER BY biofarma_nama_produk ASC
      LIMIT ${paginate} OFFSET ${offset}
    `
  }

  getSearchMaterialPagingQuery(params: SmileVsBiofarmaQueryParams) {
    const { keyword } = params

    let filter = ""
    if (keyword) {
      filter += ` AND biofarma_nama_produk ILIKE '%${keyword}%'`
    }

    return `
      SELECT count(DISTINCT biofarma_nama_produk) as total
      FROM datamart_smdv_reconciliation_v5
      ARRAY JOIN
        biofarma_nama_produk AS biofarma_nama_produk
      WHERE biofarma_nama_produk IS NOT NULL and smile_program_id = {program_id:Int} ${filter}
    `
  }
}
