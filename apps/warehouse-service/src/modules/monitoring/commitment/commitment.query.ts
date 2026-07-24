import { Context } from "hono"
import { CommitmentMonitoringQueryParams } from "./commitment.schema.js"

export class CommitmentQuery {
  buildSummaryFinalQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const commitmentSql = this.buildCommitmentTotalsQuery(c, queryParams)
    const usedRegulerSql = this.buildRealizationRegulerTotalsQuery(
      c,
      queryParams
    )
    const usedBufferSql = this.buildRealizationBufferTotalsQuery(c, queryParams)
    const needsSql = this.buildYearlyNeedTotalsQuery(queryParams)
    const consumedSql = this.buildConsumptionTotalsQuery(c, queryParams)
    const stockSql = this.buildStockTotalsQuery(c, queryParams)

    return `
      WITH
        commitment_totals AS (${commitmentSql}),
        reguler_totals AS (${usedRegulerSql}),
        buffer_totals AS (${usedBufferSql}),
        needs_totals AS (${needsSql}),
        consumed_totals AS (${consumedSql}),
        stock_totals AS (${stockSql})
      SELECT
        COALESCE(needs_totals.total_need, 0) AS annual_needs_value,
        (
          COALESCE(consumed_totals.total_consumed, 0)
          + COALESCE(stock_totals.total_stock, 0)
          - COALESCE(needs_totals.total_need, 0)
        ) AS annual_needs_deviation,
        (COALESCE(commitment_totals.commitment_reguler_dose, 0) + COALESCE(commitment_totals.commitment_buffer_dose, 0)) AS annual_commitment_value,
        (
          (COALESCE(reguler_totals.used_reguler_dose, 0) + (COALESCE(commitment_totals.commitment_reguler_dose, 0) - COALESCE(reguler_totals.used_reguler_dose, 0)))
          - (COALESCE(commitment_totals.commitment_reguler_dose, 0) + COALESCE(commitment_totals.commitment_buffer_dose, 0))
        ) AS annual_commitment_deviation
      FROM commitment_totals
      CROSS JOIN reguler_totals
      CROSS JOIN buffer_totals
      CROSS JOIN needs_totals
      CROSS JOIN consumed_totals
      CROSS JOIN stock_totals
    `.trim()
  }

  buildNationalFinalQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const commitmentSql = this.buildCommitmentTotalsQuery(c, queryParams)
    const usedRegulerSql = this.buildRealizationRegulerTotalsQuery(
      c,
      queryParams
    )
    const usedBufferSql = this.buildRealizationBufferTotalsQuery(c, queryParams)

    return `
      WITH
        commitment_totals AS (${commitmentSql}),
        reguler_totals AS (${usedRegulerSql}),
        buffer_totals AS (${usedBufferSql})
      SELECT
        (COALESCE(commitment_totals.commitment_buffer_dose, 0) - COALESCE(buffer_totals.used_buffer_dose, 0)) AS buffer_not_sent,
        COALESCE(buffer_totals.used_buffer_dose, 0) AS buffer_sent,
        COALESCE(reguler_totals.used_reguler_dose, 0) AS allocation_sent,
        (COALESCE(commitment_totals.commitment_reguler_dose, 0) - COALESCE(reguler_totals.used_reguler_dose, 0)) AS allocation_not_sent
      FROM commitment_totals
      CROSS JOIN reguler_totals
      CROSS JOIN buffer_totals
    `.trim()
  }

  buildNeedStocksFinalQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const needsSql = this.buildYearlyNeedTotalsQuery(queryParams)
    const consumedSql = this.buildConsumptionTotalsQuery(c, queryParams)
    const stockSql = this.buildStockTotalsQuery(c, queryParams)

    return `
      WITH
        needs AS (${needsSql}),
        cons AS (${consumedSql}),
        stock_summary AS (${stockSql})
      SELECT
        needs.total_need AS total_need,
        cons.total_consumed AS total_consumed,
        stock_summary.total_stock AS total_stock,
        needs.total_need - cons.total_consumed - stock_summary.total_stock AS total_remaining
      FROM needs
      CROSS JOIN cons
      CROSS JOIN stock_summary
    `.trim()
  }

  buildRealizationTargetFinalQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const commitmentSql = this.buildCommitmentTotalsQuery(c, queryParams)
    const usedRegulerSql = this.buildRealizationRegulerTotalsQuery(
      c,
      queryParams
    )
    const usedBufferSql = this.buildRealizationBufferTotalsQuery(c, queryParams)

    return `
      WITH
        commitment_totals AS (${commitmentSql}),
        reguler_totals AS (${usedRegulerSql}),
        buffer_totals AS (${usedBufferSql})
      SELECT
        (COALESCE(commitment_totals.commitment_reguler_dose, 0) + COALESCE(commitment_totals.commitment_buffer_dose, 0)) AS total_commitment,
        (COALESCE(reguler_totals.used_reguler_dose, 0) + COALESCE(buffer_totals.used_buffer_dose, 0)) AS commitment_sent,
        (COALESCE(commitment_totals.commitment_reguler_dose, 0) + COALESCE(commitment_totals.commitment_buffer_dose, 0)) - (COALESCE(reguler_totals.used_reguler_dose, 0) + COALESCE(buffer_totals.used_buffer_dose, 0)) AS commitment_not_sent
      FROM commitment_totals
      CROSS JOIN reguler_totals
      CROSS JOIN buffer_totals
    `.trim()
  }

  buildCommitmentTotalsQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersCondition = queryParams.contract_numbers?.length
      ? " AND dc.contract_number IN {contract_numbers:Array(String)}"
      : ""

    return `
      SELECT
        COALESCE(sumIf(toFloat64(dci.dose_quantity), dci.delivery_type_id = 1), 0) AS commitment_reguler_dose,
        COALESCE(sumIf(toFloat64(dci.dose_quantity), dci.delivery_type_id = 3 AND dci.deleted_at IS NULL), 0) AS commitment_buffer_dose,
        COALESCE(sumIf(toFloat64(dci.vial_quantity), dci.delivery_type_id = 1), 0) AS commitment_reguler_vial,
        COALESCE(sumIf(toFloat64(dci.vial_quantity), dci.delivery_type_id = 3 AND dci.deleted_at IS NULL), 0) AS commitment_buffer_vial
      FROM dim_commitments dc FINAL
      INNER JOIN dim_commitment_items dci FINAL
        ON dc.id = dci.commitment_id
        AND dci.deleted_at IS NULL
      INNER JOIN raw_ws_materials rwm FINAL
        ON rwm.id = dci.parent_material_id
      WHERE
        dc.deleted_at IS NULL
        AND dc.year = {year:Int32}
        ${materialTypeCondition}
        ${materialIdsCondition}
        ${contractNumbersCondition}
    `.trim()
  }

  buildRealizationRegulerTotalsQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeConditionCommitment = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionCommitment = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionCommitment = queryParams.contract_numbers
      ?.length
      ? " AND dc.contract_number IN {contract_numbers:Array(String)}"
      : ""

    const materialTypeConditionOrder = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionOrder = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionOrder = queryParams.contract_numbers?.length
      ? " AND dolv.po_no IN {contract_numbers:Array(String)}"
      : ""

    return `
      WITH
        base_commitment_reguler AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            dci.province_id AS c_province_id,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5
        ),
        base_realization_reguler AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            dolv.customer_province_id AS r_province_id,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5
        ),
        reguler AS (
          SELECT
            sum(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS used_reguler_dose,
            sum(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS used_reguler_vial
          FROM base_commitment_reguler c
          LEFT JOIN base_realization_reguler r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
        )
      SELECT
        COALESCE(reguler.used_reguler_dose, 0) AS used_reguler_dose,
        COALESCE(reguler.used_reguler_vial, 0) AS used_reguler_vial
      FROM reguler
    `.trim()
  }

  buildRealizationBufferTotalsQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersCondition = queryParams.contract_numbers?.length
      ? " AND dolv.po_no IN {contract_numbers:Array(String)}"
      : ""

    const contractNumbersConditionCommitment = queryParams.contract_numbers
      ?.length
      ? " AND dc.contract_number IN {contract_numbers:Array(String)}"
      : ""

    return `
      WITH
        base_commitment_buffer AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            dc.vendor_id AS c_vendor_id
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          WHERE
            st.id IN (3)
            AND dc.year = {year:Int32}
            ${materialTypeCondition}
            ${materialIdsCondition}
            ${contractNumbersConditionCommitment}
        ),
        buffer_contract_numbers AS (
          SELECT DISTINCT c_contract_number
          FROM base_commitment_buffer
        ),
        buffer_material_ids AS (
          SELECT DISTINCT c_material_id
          FROM base_commitment_buffer
        ),
        base_realization_buffer AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_buffer_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_buffer_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          INNER JOIN buffer_material_ids bmi
            ON bmi.c_material_id = rwm.id
          INNER JOIN buffer_contract_numbers bcn
            ON bcn.c_contract_number = dolv.po_no
          WHERE
            (
              dolv.delivery_type_id IN (3)
              OR (
                dolv.delivery_type_id IN (1)
                AND dolv.allocated_at < toDateTime({limit_year:String}, 'Asia/Jakarta')
              )
            )
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeCondition}
            ${materialIdsCondition}
            ${contractNumbersCondition}
          GROUP BY 1,2,3,4,5,6
        ),
        realization_buffer AS (
          SELECT
            SUM(multiIf(r_total_buffer_dose IS NOT NULL, r_total_buffer_dose, 0)) AS used_buffer_dose,
            SUM(multiIf(r_total_buffer_vial IS NOT NULL, r_total_buffer_vial, 0)) AS used_buffer_vial
          FROM base_realization_buffer
        )
      SELECT
        COALESCE(realization_buffer.used_buffer_dose, 0) AS used_buffer_dose,
        COALESCE(realization_buffer.used_buffer_vial, 0) AS used_buffer_vial
      FROM realization_buffer
    `.trim()
  }

  buildProvinceCommitmentQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const needByProvinceSql = this.buildYearlyNeedByProvinceQuery(queryParams)

    const materialTypeConditionCommitment = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionCommitment = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionCommitment = queryParams.contract_numbers
      ?.length
      ? " AND dc.contract_number IN {contract_numbers:Array(String)}"
      : ""

    const materialTypeConditionOrder = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionOrder = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionOrder = queryParams.contract_numbers?.length
      ? " AND dolv.po_no IN {contract_numbers:Array(String)}"
      : ""

    return `
      WITH
        base_commitment_reguler AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            dci.province_id AS c_province_id,
            p.name AS c_province_name,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5,6
        ),
        base_realization_reguler AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        reguler AS (
          SELECT
            c_province_id AS province_id,
            c_province_name AS province_name,
            SUM(c.c_total_reguler_dose) AS total_commitment_reguler_dose,
            SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_used_reguler_dose,
            SUM(c.c_total_reguler_dose) - SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_unused_reguler_dose,
            SUM(c.c_total_reguler_vial) AS total_commitment_reguler_vial,
            SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_used_reguler_vial,
            SUM(c.c_total_reguler_vial) - SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_unused_reguler_vial
          FROM base_commitment_reguler AS c
          LEFT JOIN base_realization_reguler AS r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
          GROUP BY 1,2
        ),
        base_commitment_buffer AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            dc.vendor_id AS c_vendor_id
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          WHERE
            st.id IN (3)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
        ),
        buffer_contract_numbers AS (
          SELECT DISTINCT c_contract_number
          FROM base_commitment_buffer
        ),
        buffer_material_ids AS (
          SELECT DISTINCT c_material_id
          FROM base_commitment_buffer
        ),
        base_realization_buffer AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_buffer_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_buffer_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          INNER JOIN buffer_material_ids bmi
            ON bmi.c_material_id = rwm.id
          INNER JOIN buffer_contract_numbers bcn
            ON bcn.c_contract_number = dolv.po_no
          WHERE
            (
              dolv.delivery_type_id IN (3)
              OR (
                dolv.delivery_type_id IN (1)
                AND dolv.allocated_at < toDateTime({limit_year:String}, 'Asia/Jakarta')
              )
            )
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        buffer AS (
          SELECT
            r_province_id AS province_id,
            r_province_name AS province_name,
            SUM(CASE WHEN r_total_buffer_dose IS NOT NULL THEN r_total_buffer_dose ELSE 0 END) AS total_used_buffer_dose,
            SUM(CASE WHEN r_total_buffer_vial IS NOT NULL THEN r_total_buffer_vial ELSE 0 END) AS total_used_buffer_vial
          FROM base_realization_buffer
          GROUP BY 1,2
        ),
        commitment_part AS (
          SELECT
            1 AS is_commitment,
            reguler.province_id AS province_id,
            reguler.province_name AS province_name,
            total_commitment_reguler_dose,
            CASE WHEN total_used_reguler_dose IS NOT NULL THEN total_used_reguler_dose ELSE 0 END AS total_used_reguler_dose,
            CASE WHEN total_unused_reguler_dose IS NOT NULL THEN total_unused_reguler_dose ELSE 0 END AS total_unused_reguler_dose,
            total_commitment_reguler_vial,
            CASE WHEN total_used_reguler_vial IS NOT NULL THEN total_used_reguler_vial ELSE 0 END AS total_used_reguler_vial,
            CASE WHEN total_unused_reguler_vial IS NOT NULL THEN total_unused_reguler_vial ELSE 0 END AS total_unused_reguler_vial,
            CASE WHEN buffer.total_used_buffer_dose IS NOT NULL THEN buffer.total_used_buffer_dose ELSE 0 END AS total_used_buffer_dose,
            CASE WHEN buffer.total_used_buffer_vial IS NOT NULL THEN buffer.total_used_buffer_vial ELSE 0 END AS total_used_buffer_vial,
            need_by_province.need_qty AS total_yearly_need
          FROM reguler
          LEFT JOIN buffer
            ON reguler.province_id = buffer.province_id
          LEFT JOIN (
            ${needByProvinceSql}
          ) AS need_by_province
            ON toInt64(reguler.province_id) = toInt64(need_by_province.province_id)
        ),
        base_commitment_reguler_no_commitment AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            dci.province_id AS c_province_id,
            p.name AS c_province_name,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5,6
        ),
        base_realization_reguler_no_commitment AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        reguler_no_commitment AS (
          SELECT
            r.r_province_id AS province_id_no_commitment,
            r.r_province_name AS province_name_no_commitment,
            SUM(multiIf(c.c_total_reguler_dose IS NOT NULL, c.c_total_reguler_dose, 0)) AS total_commitment_reguler_dose_no_commitment,
            SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_used_reguler_dose_no_commitment,
            SUM(multiIf(c.c_total_reguler_dose IS NOT NULL, c.c_total_reguler_dose, 0)) - SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_unused_reguler_dose_no_commitment,
            SUM(multiIf(c.c_total_reguler_vial IS NOT NULL, c.c_total_reguler_vial, 0)) AS total_commitment_reguler_vial_no_commitment,
            SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_used_reguler_vial_no_commitment,
            SUM(multiIf(c.c_total_reguler_vial IS NOT NULL, c.c_total_reguler_vial, 0)) - SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_unused_reguler_vial_no_commitment
          FROM base_commitment_reguler_no_commitment c
          RIGHT JOIN base_realization_reguler_no_commitment r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
          WHERE c.c_contract_number IS NULL
          GROUP BY 1,2
        ),
        base_realization_buffer_no_commitment AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_buffer_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_buffer_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          INNER JOIN buffer_material_ids bmi
            ON bmi.c_material_id = rwm.id
          INNER JOIN buffer_contract_numbers bcn
            ON bcn.c_contract_number = dolv.po_no
          WHERE
            (
              dolv.delivery_type_id IN (3)
              OR (
                dolv.delivery_type_id IN (1)
                AND dolv.allocated_at < toDateTime({limit_year:String}, 'Asia/Jakarta')
              )
            )
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            AND (
              dolv.po_no NOT IN (SELECT c_contract_number FROM buffer_contract_numbers)
              OR dolv.po_no IS NULL
            )
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        buffer_no_commitment AS (
          SELECT
            r_province_id AS province_id_no_commitment,
            r_province_name AS province_name_no_commitment,
            SUM(CASE WHEN r_total_buffer_dose IS NOT NULL THEN r_total_buffer_dose ELSE 0 END) AS total_used_buffer_dose_no_commitment,
            SUM(CASE WHEN r_total_buffer_vial IS NOT NULL THEN r_total_buffer_vial ELSE 0 END) AS total_used_buffer_vial_no_commitment
          FROM base_realization_buffer_no_commitment
          GROUP BY 1,2
        ),
        no_commitment_part AS (
          SELECT
            0 AS is_commitment,
            reguler_no_commitment.province_id_no_commitment AS province_id,
            reguler_no_commitment.province_name_no_commitment AS province_name,
            CASE WHEN total_commitment_reguler_dose_no_commitment IS NOT NULL THEN total_commitment_reguler_dose_no_commitment ELSE 0 END AS total_commitment_reguler_dose,
            CASE WHEN total_used_reguler_dose_no_commitment IS NOT NULL THEN total_used_reguler_dose_no_commitment ELSE 0 END AS total_used_reguler_dose,
            CASE WHEN total_unused_reguler_dose_no_commitment IS NOT NULL THEN total_unused_reguler_dose_no_commitment ELSE 0 END AS total_unused_reguler_dose,
            CASE WHEN total_commitment_reguler_vial_no_commitment IS NOT NULL THEN total_commitment_reguler_vial_no_commitment ELSE 0 END AS total_commitment_reguler_vial,
            CASE WHEN total_used_reguler_vial_no_commitment IS NOT NULL THEN total_used_reguler_vial_no_commitment ELSE 0 END AS total_used_reguler_vial,
            CASE WHEN total_unused_reguler_vial_no_commitment IS NOT NULL THEN total_unused_reguler_vial_no_commitment ELSE 0 END AS total_unused_reguler_vial,
            CASE WHEN total_used_buffer_dose_no_commitment IS NOT NULL THEN total_used_buffer_dose_no_commitment ELSE 0 END AS total_used_buffer_dose,
            CASE WHEN total_used_buffer_vial_no_commitment IS NOT NULL THEN total_used_buffer_vial_no_commitment ELSE 0 END AS total_used_buffer_vial,
            need_by_province.need_qty AS total_yearly_need
          FROM reguler_no_commitment
          LEFT JOIN buffer_no_commitment
            ON reguler_no_commitment.province_id_no_commitment = buffer_no_commitment.province_id_no_commitment
          LEFT JOIN (
            ${needByProvinceSql}
          ) AS need_by_province
            ON toInt64(reguler_no_commitment.province_id_no_commitment) = toInt64(need_by_province.province_id)
        )
      SELECT
        *
      FROM (
        SELECT * FROM commitment_part
        UNION ALL
        SELECT * FROM no_commitment_part
      ) rows
      ORDER BY is_commitment DESC, province_id ASC
    `.trim()
  }

  buildYearlyNeedTotalsQuery(queryParams: CommitmentMonitoringQueryParams) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersCondition = queryParams.contract_numbers?.length
      ? " AND dan.material_id IN (SELECT parent_material_id FROM material_in_contract)"
      : ""

    const defaultAnnualNeedMaterialFilterCondition = queryParams.material_ids
      ?.length
      ? ""
      : " AND dan.material_id IN (SELECT DISTINCT material_id FROM datamart_annual_need FINAL)"

    const materialInContractCte = queryParams.contract_numbers?.length
      ? `
        material_in_contract AS (
          SELECT DISTINCT parent_material_id
          FROM dim_commitment_items dci FINAL
          WHERE
            dci.year = {year:Int32}
            AND dci.program_id = {program_id:Int32}
            AND contract_number IN {contract_numbers:Array(String)}
            AND deleted_at IS NULL
            AND commitments_deleted_at IS NULL
            AND contract_deleted_at IS NULL
        )
      `
      : ""

    const withClause = queryParams.contract_numbers?.length
      ? `
      WITH
      ${materialInContractCte}
      `
      : ""

    return `
      ${withClause}
      SELECT
        COALESCE(sum(toFloat64(CEIL(dan.yearly_need / nullIf(dan.sku, 0)) * dan.sku)), 0) AS total_need
      FROM datamart_annual_need dan FINAL
      INNER JOIN raw_ws_materials rwm FINAL
        ON rwm.id = dan.material_id
      WHERE
        dan.deleted_at IS NULL
        AND dan.master_deleted_at IS NULL
        AND dan.status = 1
        AND rwm.status = 1
        AND dan.year = {year:Int32}
        ${defaultAnnualNeedMaterialFilterCondition}
        ${materialTypeCondition}
        ${materialIdsCondition}
        ${contractNumbersCondition}
    `.trim()
  }

  buildYearlyNeedByProvinceQuery(queryParams: CommitmentMonitoringQueryParams) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersCondition = queryParams.contract_numbers?.length
      ? " AND dan.material_id IN (SELECT parent_material_id FROM material_in_contract)"
      : ""

    const defaultAnnualNeedMaterialFilterCondition = queryParams.material_ids
      ?.length
      ? ""
      : " AND dan.material_id IN (SELECT DISTINCT material_id FROM datamart_annual_need FINAL)"

    const materialInContractCte = queryParams.contract_numbers?.length
      ? `
        material_in_contract AS (
          SELECT DISTINCT parent_material_id
          FROM dim_commitment_items dci FINAL
          WHERE
            dci.year = {year:Int32}
            AND dci.program_id = {program_id:Int32}
            AND contract_number IN {contract_numbers:Array(String)}
            AND deleted_at IS NULL
            AND commitments_deleted_at IS NULL
            AND contract_deleted_at IS NULL
        )
      `
      : ""

    const withClause = queryParams.contract_numbers?.length
      ? `
      WITH
      ${materialInContractCte}
      `
      : ""

    return `
      ${withClause}
      SELECT
        dan.entity_province_id AS province_id,
        COALESCE(sum(toFloat64(CEIL(dan.yearly_need / nullIf(dan.sku, 0)) * dan.sku)), 0) AS need_qty
      FROM datamart_annual_need dan FINAL
      INNER JOIN raw_ws_materials rwm FINAL
        ON rwm.id = dan.material_id
      WHERE
        dan.deleted_at IS NULL
        AND dan.master_deleted_at IS NULL
        AND dan.status = 1
        AND rwm.status = 1
        AND dan.year = {year:Int32}
        ${defaultAnnualNeedMaterialFilterCondition}
        ${materialTypeCondition}
        ${materialIdsCondition}
        ${contractNumbersCondition}
      GROUP BY dan.entity_province_id
    `.trim()
  }

  buildConsumptionTotalsQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND t.dmm_parent_id IN {material_ids:Array(Int64)}"
      : ""

    const defaultAnnualNeedMaterialFilterCondition = queryParams.material_ids
      ?.length
      ? ""
      : " AND t.dmm_parent_id IN (SELECT DISTINCT material_id FROM datamart_annual_need FINAL)"

    const contractMaterialFilterCondition = queryParams.contract_numbers?.length
      ? " AND t.dmm_parent_id IN (SELECT parent_material_id FROM material_in_contract)"
      : ""

    const materialInContractCte = queryParams.contract_numbers?.length
      ? `
        material_in_contract AS (
          SELECT DISTINCT parent_material_id
          FROM dim_commitment_items dci FINAL
          WHERE
            dci.year = {year:Int32}
            AND dci.program_id = {program_id:Int32}
            AND contract_number IN {contract_numbers:Array(String)}
            AND deleted_at IS NULL
            AND commitments_deleted_at IS NULL
            AND contract_deleted_at IS NULL
        )
      `
      : ""

    const withClause = queryParams.contract_numbers?.length
      ? `
      WITH
      ${materialInContractCte}
      `
      : ""

    return `
      ${withClause}
      SELECT
        coalesce(
          sumIf(
            toFloat64(transactions_change_qty) * -1,
            transactions_transaction_type_id IN (10, 5)
            AND transactions_order_id IS NULL
          ),
          0
        ) AS total_consumed
      FROM datamart_monitoring_transactions_v5 t FINAL
      PREWHERE toYear(t.transactions_created_at + INTERVAL 7 HOUR) = {year:Int32}
      WHERE
        transactions_deleted_at IS NULL
        AND master_deleted_at IS NULL
        AND t.entities_id IS NOT NULL
        AND entities_is_vendor = 1
        AND program_id = {program_id:Int32}
        AND entities_status = 1
        AND (
          (
            join_date <= toDate(toString({year:Int32}) || '-12-31')
            AND end_date >= toDate(toString({year:Int32}) || '-12-31')
          )
          OR (
            end_date IS NULL
            AND join_date <= toDate(toString({year:Int32}) || '-12-31')
          )
        )
        ${defaultAnnualNeedMaterialFilterCondition}
        ${contractMaterialFilterCondition}
        ${materialIdsCondition}
        ${materialTypeCondition}
    `.trim()
  }

  buildStockTotalsQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND dtv.dmm_parent_id IN {material_ids:Array(Int64)}"
      : ""

    const programCondition = queryParams.program_id
      ? " AND program_id = {program_id:Int32}"
      : ""

    const defaultAnnualNeedMaterialFilterCondition = queryParams.material_ids
      ?.length
      ? ""
      : " AND dtv.dmm_parent_id IN (SELECT DISTINCT material_id FROM datamart_annual_need FINAL)"

    const contractMaterialFilterCondition = queryParams.contract_numbers?.length
      ? " AND dtv.dmm_parent_id IN (SELECT parent_material_id FROM material_in_contract)"
      : ""

    const materialInContractCte = queryParams.contract_numbers?.length
      ? `
        material_in_contract AS (
          SELECT DISTINCT parent_material_id
          FROM dim_commitment_items dci FINAL
          WHERE
            dci.year = {year:Int32}
            AND dci.program_id = {program_id:Int32}
            AND contract_number IN {contract_numbers:Array(String)}
            AND deleted_at IS NULL
            AND commitments_deleted_at IS NULL
            AND contract_deleted_at IS NULL
        )
      `
      : ""

    return `
      WITH
      ${queryParams.contract_numbers?.length ? `${materialInContractCte},` : ""}
      stock_totals AS (
        SELECT
          rwa.program_id AS program_id,
          rws.entity_id AS entity_id,
          dtv.dmm_parent_id AS parent_material_id,
          SUM(
            CASE
              WHEN transactions_transaction_type_id = 1 THEN transactions_change_qty
              ELSE transactions_opening_qty + transactions_change_qty
            END
          ) AS qty
        FROM datamart_transactions_v5 dtv FINAL
        LEFT JOIN raw_ws_materials rwm FINAL ON dtv.dmm_parent_id = rwm.id
        LEFT JOIN raw_ws_stocks rws FINAL ON dtv.transactions_stock_id = rws.id
        LEFT JOIN raw_ws_activities rwa FINAL ON rws.activity_id = rwa.id
        LEFT JOIN raw_ws_entities rwe FINAL ON rws.entity_id = rwe.id
        WHERE
          transactions_uuid IN (
            SELECT max(transactions_uuid)
            FROM datamart_transactions_v5 dtv FINAL
            PREWHERE
              1 = 1${programCondition}
              AND toYear(toTimeZone(dtv.transactions_created_at, 'Asia/Jakarta')) BETWEEN 2021 AND {year:Int32}
            WHERE
              dtv.entities_is_vendor = 1
              AND entities_type <> 5
              AND (
                (join_date <= now() AND end_date >= now())
                OR (end_date IS NULL AND join_date <= now())
              )
              AND transactions_deleted_at IS NULL
              AND master_deleted_at IS NULL
            GROUP BY dtv.transactions_stock_id
          )
          ${defaultAnnualNeedMaterialFilterCondition}
          ${contractMaterialFilterCondition}
          ${materialIdsCondition}
          ${materialTypeCondition}
        GROUP BY rwa.program_id, rws.entity_id, dtv.dmm_parent_id
      ),
      st AS (
        SELECT
          entity_id,
          parent_material_id,
          sum(qty) AS qty
        FROM stock_totals
        GROUP BY entity_id, parent_material_id
      )
      SELECT
        coalesce(sum(toFloat64(st.qty)), 0) AS total_stock
      FROM st
    `.trim()
  }

  buildMaterialExcelQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeConditionCommitment = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionCommitment = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionCommitment = queryParams.contract_numbers
      ?.length
      ? " AND dc.contract_number IN {contract_numbers:Array(String)}"
      : ""

    const materialTypeConditionOrder = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionOrder = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionOrder = queryParams.contract_numbers?.length
      ? " AND dolv.po_no IN {contract_numbers:Array(String)}"
      : ""

    return `
      WITH
        base_commitment_reguler AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            rwm.name AS c_material_name,
            dci.province_id AS c_province_id,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5,6
        ),
        base_realization_reguler AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        reguler AS (
          SELECT
            c.c_material_id AS material_id,
            c.c_material_name AS material_name,
            c.c_contract_number AS contract_number,
            c.c_year AS commitment_year,
            MAX(r.r_year) AS realization_year,
            SUM(c.c_total_reguler_dose) AS total_commitment_reguler_dose,
            SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_used_reguler_dose,
            SUM(c.c_total_reguler_dose) - SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_unused_reguler_dose,
            SUM(c.c_total_reguler_vial) AS total_commitment_reguler_vial,
            SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_used_reguler_vial,
            SUM(c.c_total_reguler_vial) - SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_unused_reguler_vial
          FROM base_commitment_reguler c
          LEFT JOIN base_realization_reguler r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
          GROUP BY 1,2,3,4
        ),
        base_commitment_buffer AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            rwm.name AS c_material_name,
            dc.vendor_id AS c_vendor_id
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          WHERE
            st.id IN (3)
            AND dc.year = {year:Int32}
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            ${contractNumbersConditionCommitment}
        ),
        buffer_contract_numbers AS (
          SELECT DISTINCT c_contract_number
          FROM base_commitment_buffer
        ),
        buffer_material_ids AS (
          SELECT DISTINCT c_material_id
          FROM base_commitment_buffer
        ),
        commitment_buffer_totals AS (
          SELECT
            dci.parent_material_id AS material_id,
            rwm.name AS material_name,
            dc.contract_number AS contract_number,
            dc.year AS commitment_year,
            SUM(toFloat64(dci.dose_quantity)) AS total_commitment_buffer_dose,
            SUM(toFloat64(dci.vial_quantity)) AS total_commitment_buffer_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          WHERE
            st.id IN (3)
            AND dc.year = {year:Int32}
            AND dc.deleted_at IS NULL
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4
        ),
        base_realization_buffer AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_buffer_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_buffer_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          INNER JOIN buffer_material_ids bmi
            ON bmi.c_material_id = rwm.id
          INNER JOIN buffer_contract_numbers bcn
            ON bcn.c_contract_number = dolv.po_no
          WHERE
            (
              dolv.delivery_type_id IN (3)
              OR (
                dolv.delivery_type_id IN (1)
                AND dolv.allocated_at < toDateTime({limit_year:String}, 'Asia/Jakarta')
              )
            )
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        realization_buffer_totals AS (
          SELECT
            r_material_id AS material_id,
            r_contract_number AS contract_number,
            r_year AS realization_year,
            SUM(CASE WHEN r_total_buffer_dose IS NOT NULL THEN r_total_buffer_dose ELSE 0 END) AS total_used_buffer_dose,
            SUM(CASE WHEN r_total_buffer_vial IS NOT NULL THEN r_total_buffer_vial ELSE 0 END) AS total_used_buffer_vial
          FROM base_realization_buffer
          GROUP BY 1,2,3
        ),
        buffer AS (
          SELECT
            cb.material_id,
            cb.material_name,
            cb.contract_number,
            cb.commitment_year,
            rb.realization_year,
            cb.total_commitment_buffer_dose,
            COALESCE(rb.total_used_buffer_dose, 0) AS total_used_buffer_dose,
            cb.total_commitment_buffer_dose - COALESCE(rb.total_used_buffer_dose, 0) AS total_unused_buffer_dose,
            cb.total_commitment_buffer_vial,
            COALESCE(rb.total_used_buffer_vial, 0) AS total_used_buffer_vial,
            cb.total_commitment_buffer_vial - COALESCE(rb.total_used_buffer_vial, 0) AS total_unused_buffer_vial
          FROM commitment_buffer_totals cb
          LEFT JOIN realization_buffer_totals rb
            ON cb.material_id = rb.material_id
            AND cb.contract_number = rb.contract_number
        ),
        commitment_part AS (
          SELECT
            reguler.material_name AS material_name,
            reguler.contract_number AS contract_number,
            reguler.commitment_year AS commitment_year,
            COALESCE(buffer.realization_year, reguler.realization_year) AS realization_year,
            COALESCE(reguler.total_commitment_reguler_dose, 0) AS total_commitment_reguler_dose,
            COALESCE(reguler.total_commitment_reguler_vial, 0) AS total_commitment_reguler_vial,
            COALESCE(buffer.total_commitment_buffer_dose, 0) AS total_commitment_buffer_dose,
            COALESCE(buffer.total_commitment_buffer_vial, 0) AS total_commitment_buffer_vial,
            COALESCE(reguler.total_used_reguler_dose, 0) AS total_used_reguler_dose,
            COALESCE(reguler.total_used_reguler_vial, 0) AS total_used_reguler_vial,
            COALESCE(buffer.total_used_buffer_dose, 0) AS total_used_buffer_dose,
            COALESCE(buffer.total_used_buffer_vial, 0) AS total_used_buffer_vial,
            COALESCE(reguler.total_unused_reguler_dose, 0) AS total_unused_reguler_dose,
            COALESCE(reguler.total_unused_reguler_vial, 0) AS total_unused_reguler_vial,
            COALESCE(buffer.total_unused_buffer_dose, 0) AS total_unused_buffer_dose,
            COALESCE(buffer.total_unused_buffer_vial, 0) AS total_unused_buffer_vial
          FROM reguler
          LEFT JOIN buffer
            ON reguler.material_id = buffer.material_id
            AND reguler.contract_number = buffer.contract_number
        ),
        base_commitment_reguler_no_commitment AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            rwm.name AS c_material_name,
            dci.province_id AS c_province_id,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5,6
        ),
        base_realization_reguler_no_commitment AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6
        ),
        reguler_no_commitment AS (
          SELECT
            r.r_material_id AS material_id,
            r.r_material_name AS material_name,
            r.r_contract_number AS contract_number,
            MAX(c.c_year) AS commitment_year,
            MAX(r.r_year) AS realization_year,
            SUM(multiIf(c.c_total_reguler_dose IS NOT NULL, c.c_total_reguler_dose, 0)) AS total_commitment_reguler_dose,
            SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_used_reguler_dose,
            SUM(multiIf(c.c_total_reguler_dose IS NOT NULL, c.c_total_reguler_dose, 0)) - SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_unused_reguler_dose,
            SUM(multiIf(c.c_total_reguler_vial IS NOT NULL, c.c_total_reguler_vial, 0)) AS total_commitment_reguler_vial,
            SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_used_reguler_vial,
            SUM(multiIf(c.c_total_reguler_vial IS NOT NULL, c.c_total_reguler_vial, 0)) - SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_unused_reguler_vial
          FROM base_commitment_reguler_no_commitment c
          RIGHT JOIN base_realization_reguler_no_commitment r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
          WHERE c.c_contract_number IS NULL
          GROUP BY 1,2,3
        ),
        no_commitment_part AS (
          SELECT
            reguler_no_commitment.material_name AS material_name,
            reguler_no_commitment.contract_number AS contract_number,
            reguler_no_commitment.commitment_year AS commitment_year,
            reguler_no_commitment.realization_year AS realization_year,
            COALESCE(reguler_no_commitment.total_commitment_reguler_dose, 0) AS total_commitment_reguler_dose,
            COALESCE(reguler_no_commitment.total_commitment_reguler_vial, 0) AS total_commitment_reguler_vial,
            0 AS total_commitment_buffer_dose,
            0 AS total_commitment_buffer_vial,
            COALESCE(reguler_no_commitment.total_used_reguler_dose, 0) AS total_used_reguler_dose,
            COALESCE(reguler_no_commitment.total_used_reguler_vial, 0) AS total_used_reguler_vial,
            0 AS total_used_buffer_dose,
            0 AS total_used_buffer_vial,
            COALESCE(reguler_no_commitment.total_unused_reguler_dose, 0) AS total_unused_reguler_dose,
            COALESCE(reguler_no_commitment.total_unused_reguler_vial, 0) AS total_unused_reguler_vial,
            0 AS total_unused_buffer_dose,
            0 AS total_unused_buffer_vial
          FROM reguler_no_commitment
        )
      SELECT *
      FROM (
        SELECT * FROM commitment_part
        UNION ALL
        SELECT * FROM no_commitment_part
      ) final_rows
      WHERE final_rows.commitment_year IS NOT NULL
      ORDER BY material_name
    `.trim()
  }

  buildProvinceMaterialExcelQuery(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeConditionCommitment = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionCommitment = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionCommitment = queryParams.contract_numbers
      ?.length
      ? " AND dc.contract_number IN {contract_numbers:Array(String)}"
      : ""

    const materialTypeConditionOrder = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsConditionOrder = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersConditionOrder = queryParams.contract_numbers?.length
      ? " AND dolv.po_no IN {contract_numbers:Array(String)}"
      : ""

    return `
      WITH
        base_commitment_reguler AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            rwm.name AS c_material_name,
            dci.province_id AS c_province_id,
            p.name AS c_province_name,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5,6,7
        ),
        base_realization_reguler AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6,7
        ),
        reguler AS (
          SELECT
            c_province_id AS province_id,
            c_province_name AS province_name,
            c.c_material_id AS material_id,
            c.c_material_name AS material_name,
            c.c_contract_number AS contract_number,
            SUM(c.c_total_reguler_dose) AS total_commitment_reguler_dose,
            SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_used_reguler_dose,
            SUM(c.c_total_reguler_dose) - SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_unused_reguler_dose,
            SUM(c.c_total_reguler_vial) AS total_commitment_reguler_vial,
            SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_used_reguler_vial,
            SUM(c.c_total_reguler_vial) - SUM(multiIf(r.r_total_reguler_vial IS NOT NULL, r.r_total_reguler_vial, 0)) AS total_unused_reguler_vial
          FROM base_commitment_reguler AS c
          LEFT JOIN base_realization_reguler AS r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
          GROUP BY 1,2,3,4,5
        ),
        base_commitment_buffer AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            dc.vendor_id AS c_vendor_id
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          WHERE
            st.id IN (3)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
        ),
        buffer_contract_numbers AS (
          SELECT DISTINCT c_contract_number
          FROM base_commitment_buffer
        ),
        buffer_material_ids AS (
          SELECT DISTINCT c_material_id
          FROM base_commitment_buffer
        ),
        base_realization_buffer AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_buffer_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_buffer_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          INNER JOIN buffer_material_ids bmi
            ON bmi.c_material_id = rwm.id
          INNER JOIN buffer_contract_numbers bcn
            ON bcn.c_contract_number = dolv.po_no
          WHERE
            (
              dolv.delivery_type_id IN (3)
              OR (
                dolv.delivery_type_id IN (1)
                AND dolv.allocated_at < toDateTime({limit_year:String}, 'Asia/Jakarta')
              )
            )
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6,7
        ),
        buffer AS (
          SELECT
            r_province_id AS province_id,
            r_province_name AS province_name,
            r_material_id AS material_id,
            r_material_name AS material_name,
            r_contract_number AS contract_number,
            SUM(CASE WHEN r_total_buffer_dose IS NOT NULL THEN r_total_buffer_dose ELSE 0 END) AS total_used_buffer_dose,
            SUM(CASE WHEN r_total_buffer_vial IS NOT NULL THEN r_total_buffer_vial ELSE 0 END) AS total_used_buffer_vial
          FROM base_realization_buffer
          GROUP BY 1,2,3,4,5
        ),
        commitment_part AS (
          SELECT
            reguler.province_id AS province_id,
            reguler.province_name AS province_name,
            reguler.material_id AS material_id,
            reguler.material_name AS material_name,
            reguler.contract_number AS contract_number,
            total_commitment_reguler_dose,
            CASE WHEN total_used_reguler_dose IS NOT NULL THEN total_used_reguler_dose ELSE 0 END AS total_used_reguler_dose,
            CASE WHEN total_unused_reguler_dose IS NOT NULL THEN total_unused_reguler_dose ELSE 0 END AS total_unused_reguler_dose,
            CASE WHEN buffer.total_used_buffer_dose IS NOT NULL THEN buffer.total_used_buffer_dose ELSE 0 END AS total_used_buffer_dose
          FROM reguler
          LEFT JOIN buffer
            ON reguler.province_id = buffer.province_id
            AND reguler.material_id = buffer.material_id
            AND reguler.contract_number = buffer.contract_number
        ),
        base_commitment_reguler_no_commitment AS (
          SELECT
            dc.contract_number AS c_contract_number,
            dc.year AS c_year,
            dci.parent_material_id AS c_material_id,
            rwm.name AS c_material_name,
            dci.province_id AS c_province_id,
            p.name AS c_province_name,
            dc.vendor_id AS c_vendor_id,
            sum(toFloat64(dci.dose_quantity)) AS c_total_reguler_dose,
            sum(toFloat64(dci.vial_quantity)) AS c_total_reguler_vial
          FROM dim_commitments dc FINAL
          INNER JOIN dim_commitment_items dci FINAL
            ON dc.id = dci.commitment_id
            AND dci.deleted_at IS NULL
          INNER JOIN raw_ws_entities e FINAL
            ON e.id = dc.vendor_id
          INNER JOIN raw_ws_delivery_types st FINAL
            ON st.id = dci.delivery_type_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = dci.parent_material_id
          INNER JOIN raw_locations p FINAL
            ON p.id = dci.province_id
          WHERE
            dc.deleted_at IS NULL
            AND st.id IN (1)
            ${materialTypeConditionCommitment}
            ${materialIdsConditionCommitment}
            AND dc.year = {year:Int32}
            ${contractNumbersConditionCommitment}
          GROUP BY 1,2,3,4,5,6,7
        ),
        base_realization_reguler_no_commitment AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_reguler_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_reguler_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          WHERE
            dolv.delivery_type_id IN (1)
            AND dolv.allocated_at >= toDateTime({limit_year:String}, 'Asia/Jakarta')
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6,7
        ),
        reguler_no_commitment AS (
          SELECT
            r.r_province_id AS province_id_no_commitment,
            r.r_province_name AS province_name_no_commitment,
            r.r_material_id AS material_id_no_commitment,
            r.r_material_name AS material_name_no_commitment,
            r.r_contract_number AS contract_number_no_commitment,
            SUM(multiIf(c.c_total_reguler_dose IS NOT NULL, c.c_total_reguler_dose, 0)) AS total_commitment_reguler_dose_no_commitment,
            SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_used_reguler_dose_no_commitment,
            SUM(multiIf(c.c_total_reguler_dose IS NOT NULL, c.c_total_reguler_dose, 0)) - SUM(multiIf(r.r_total_reguler_dose IS NOT NULL, r.r_total_reguler_dose, 0)) AS total_unused_reguler_dose_no_commitment
          FROM base_commitment_reguler_no_commitment c
          RIGHT JOIN base_realization_reguler_no_commitment r
            ON c.c_vendor_id = r.r_vendor_id
            AND c.c_material_id = r.r_material_id
            AND c.c_province_id = r.r_province_id
            AND c.c_contract_number = r.r_contract_number
          WHERE c.c_contract_number IS NULL
          GROUP BY 1,2,3,4,5
        ),
        base_realization_buffer_no_commitment AS (
          SELECT
            dolv.po_no AS r_contract_number,
            toYear(dolv.allocated_at + interval 7 hour) AS r_year,
            rwm.id AS r_material_id,
            rwm.name AS r_material_name,
            dolv.customer_province_id AS r_province_id,
            dolv.customer_province_name AS r_province_name,
            dolv.vendor_id AS r_vendor_id,
            sum(toFloat64(rwois.allocated_qty)) AS r_total_buffer_dose,
            sum(toFloat64(rwois.allocated_qty) / nullIf(toFloat64(rwm.consumption_unit_per_distribution_unit), 0)) AS r_total_buffer_vial
          FROM datamart_order_list_v5 dolv FINAL
          INNER JOIN raw_ws_order_item_stocks rwois FINAL
            ON rwois.order_id = dolv.order_id
          INNER JOIN raw_ws_materials rwm FINAL
            ON rwm.id = rwois.parent_material_id
          INNER JOIN buffer_material_ids bmi
            ON bmi.c_material_id = rwm.id
          INNER JOIN buffer_contract_numbers bcn
            ON bcn.c_contract_number = dolv.po_no
          WHERE
            (
              dolv.delivery_type_id IN (3)
              OR (
                dolv.delivery_type_id IN (1)
                AND dolv.allocated_at < toDateTime({limit_year:String}, 'Asia/Jakarta')
              )
            )
            AND dolv.allocated_at IS NOT NULL
            AND dolv.deleted_at IS NULL
            AND dolv.master_deleted_at IS NULL
            AND dolv.status_id IN (4, 5)
            AND (
              dolv.po_no NOT IN (SELECT c_contract_number FROM buffer_contract_numbers)
              OR dolv.po_no IS NULL
            )
            ${materialTypeConditionOrder}
            ${materialIdsConditionOrder}
            ${contractNumbersConditionOrder}
          GROUP BY 1,2,3,4,5,6,7
        ),
        buffer_no_commitment AS (
          SELECT
            r_province_id AS province_id_no_commitment,
            r_province_name AS province_name_no_commitment,
            r_material_id AS material_id_no_commitment,
            r_material_name AS material_name_no_commitment,
            r_contract_number AS contract_number_no_commitment,
            SUM(CASE WHEN r_total_buffer_dose IS NOT NULL THEN r_total_buffer_dose ELSE 0 END) AS total_used_buffer_dose_no_commitment
          FROM base_realization_buffer_no_commitment
          GROUP BY 1,2,3,4,5
        ),
        no_commitment_part AS (
          SELECT
            reguler_no_commitment.province_id_no_commitment AS province_id,
            reguler_no_commitment.province_name_no_commitment AS province_name,
            reguler_no_commitment.material_id_no_commitment AS material_id,
            reguler_no_commitment.material_name_no_commitment AS material_name,
            reguler_no_commitment.contract_number_no_commitment AS contract_number,
            CASE WHEN total_commitment_reguler_dose_no_commitment IS NOT NULL THEN total_commitment_reguler_dose_no_commitment ELSE 0 END AS total_commitment_reguler_dose,
            CASE WHEN total_used_reguler_dose_no_commitment IS NOT NULL THEN total_used_reguler_dose_no_commitment ELSE 0 END AS total_used_reguler_dose,
            CASE WHEN total_unused_reguler_dose_no_commitment IS NOT NULL THEN total_unused_reguler_dose_no_commitment ELSE 0 END AS total_unused_reguler_dose,
            CASE WHEN total_used_buffer_dose_no_commitment IS NOT NULL THEN total_used_buffer_dose_no_commitment ELSE 0 END AS total_used_buffer_dose
          FROM reguler_no_commitment
          LEFT JOIN buffer_no_commitment
            ON reguler_no_commitment.province_id_no_commitment = buffer_no_commitment.province_id_no_commitment
            AND reguler_no_commitment.material_id_no_commitment = buffer_no_commitment.material_id_no_commitment
            AND reguler_no_commitment.contract_number_no_commitment = buffer_no_commitment.contract_number_no_commitment
        )
      SELECT
        province_id,
        province_name,
        material_id,
        material_name,
        contract_number,
        SUM(total_commitment_reguler_dose) AS total_commitment_reguler_dose,
        SUM(total_used_reguler_dose) AS total_used_reguler_dose,
        SUM(total_unused_reguler_dose) AS total_unused_reguler_dose,
        SUM(total_used_buffer_dose) AS total_used_buffer_dose
      FROM (
        SELECT * FROM commitment_part
        UNION ALL
        SELECT * FROM no_commitment_part
      ) rows
      GROUP BY 1,2,3,4,5
      ORDER BY province_id, material_id
    `.trim()
  }

  buildYearlyNeedByProvinceMaterialQuery(
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const materialTypeCondition = queryParams.material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int32}"
      : ""

    const materialIdsCondition = queryParams.material_ids?.length
      ? " AND rwm.id IN {material_ids:Array(Int64)}"
      : ""

    const contractNumbersCondition = queryParams.contract_numbers?.length
      ? " AND dan.material_id IN (SELECT parent_material_id FROM material_in_contract)"
      : ""

    const defaultAnnualNeedMaterialFilterCondition = queryParams.material_ids
      ?.length
      ? ""
      : " AND dan.material_id IN (SELECT DISTINCT material_id FROM datamart_annual_need FINAL)"

    const materialInContractCte = queryParams.contract_numbers?.length
      ? `
        material_in_contract AS (
          SELECT DISTINCT parent_material_id
          FROM dim_commitment_items dci FINAL
          WHERE
            dci.year = {year:Int32}
            AND dci.program_id = {program_id:Int32}
            AND contract_number IN {contract_numbers:Array(String)}
            AND deleted_at IS NULL
            AND commitments_deleted_at IS NULL
            AND contract_deleted_at IS NULL
        )
      `
      : ""

    const withClause = queryParams.contract_numbers?.length
      ? `
      WITH
      ${materialInContractCte}
      `
      : ""

    return `
      ${withClause}
      SELECT
        dan.entity_province_id AS province_id,
        dan.material_id,
        rwm.name AS material_name,
        COALESCE(sum(toFloat64(CEIL(dan.yearly_need / nullIf(dan.sku, 0)) * dan.sku)), 0) AS need_qty
      FROM datamart_annual_need dan FINAL
      INNER JOIN raw_ws_materials rwm FINAL
        ON rwm.id = dan.material_id
      WHERE
        dan.deleted_at IS NULL
        AND dan.master_deleted_at IS NULL
        AND dan.status = 1
        AND rwm.status = 1
        AND dan.year = {year:Int32}
        ${defaultAnnualNeedMaterialFilterCondition}
        ${materialTypeCondition}
        ${materialIdsCondition}
        ${contractNumbersCondition}
      GROUP BY 1,2,3
    `.trim()
  }

  buildProvinceNamesQuery() {
    return `
      SELECT
        id AS province_id,
        name AS province_name
      FROM raw_locations FINAL
      WHERE id IS NOT NULL
      ORDER BY id ASC
    `.trim()
  }

  buildQuarterlyMaterialNeedsQuery() {
    return `
      SELECT
        material_id,
        material_name,
        is_supporting_material,
        total_balance,
        needs_this_quartal,
        is_bellow_stock
      FROM datamart_quarterly_material_needs
      WHERE
        program_id = 1
        AND is_bellow_stock = 1
      ORDER BY is_supporting_material ASC, material_name ASC
    `.trim()
  }
}
