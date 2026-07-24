import { RabiesQueryParams, RabiesSequences } from "./rabies.schema.js"
const PROGRAM_RABIES = 6

export class RabiesQuery {
  #generateFilterCascade(queryParams: RabiesQueryParams) {
    const { from, to, regency_ids, entity_tag_ids, province_ids, vaccine_method, gender, identity_type } =
      queryParams

    let filter = ""
    let filterSequence = ""

    if (from && to) {
      filter +=
        " and dtr.transaction_date BETWEEN {from:DateTime('Asia/Jakarta')} AND {to:DateTime('Asia/Jakarta')}"
    } else if (from) {
      filter +=
        " and dtr.transaction_date >= {from:DateTime('Asia/Jakarta')}"
    } else if (to) {
      filter +=
        " and dtr.transaction_date <= {to:DateTime('Asia/Jakarta')}"
    }

    if (regency_ids) {
      filter += " and dtr.regency_id in {regency_ids:Array(Int64)}"
    }
    if (province_ids) {
      filter += " and dtr.province_id in {province_ids:Array(Int64)}"
    }
    if (entity_tag_ids) {
      filter += " and dtr.entity_tags in {entity_tag_ids:Array(Int64)}"
    }

    if (vaccine_method) {
      filterSequence += " and seq.method_id = {vaccine_method:Int64}"
    }
    if (gender) {
      filter += " and dtr.patient_gender = {gender:Int64}"
    }

    if (identity_type) {
      filter += " and dtr.patient_identity_type = {identity_type:Int64}"
    }

    return { filter, filterSequence }
  }

  #generateFilter(queryParams: RabiesQueryParams) {
    const { from, to, entity_ids, regency_ids, entity_tag_ids, province_ids, vaccine, vaccine_method, gender } =
      queryParams

    let filter = ""
    let filterEntity = ""

    if (from && to) {
      filter +=
        " and dtr.transactions_actual_date BETWEEN {from:DateTime('Asia/Jakarta')} AND {to:DateTime('Asia/Jakarta')}"
    } else if (from) {
      filter +=
        " and dtr.transactions_actual_date >= {from:DateTime('Asia/Jakarta')}"
    } else if (to) {
      filter +=
        " and dtr.transactions_actual_date <= {to:DateTime('Asia/Jakarta')}"
    }

    if (vaccine) {
      filter += " and dtr.material_category = {vaccine:String}"
    }

    if (entity_ids) {
      filter += " and dtr.entities_id in {entity_ids:Array(Int64)}"
      filterEntity += " and rwe.id in {entity_ids:Array(Int64)}"
    }
    if (regency_ids) {
      filter += " and dtr.entities_regency_id in {regency_ids:Array(Int64)}"
      filterEntity += " and rwe.regency_id in {regency_ids:Array(Int64)}"
    }
    if (province_ids) {
      filter += " and dtr.entities_province_id in {province_ids:Array(Int64)}"
      filterEntity += " and rwe.province_id in {province_ids:Array(Int64)}"
    }
    if (entity_tag_ids) {
      filter +=
        " and dtr.entities_entity_tag_id in {entity_tag_ids:Array(Int64)}"
      filterEntity += " and rwe.entity_tag_id in {entity_tag_ids:Array(Int64)}"
    }

    if (vaccine_method) {
      filter += " and dtr.vaccine_method_id = {vaccine_method:Int64}"
    }
    if (gender) {
      filter += " and dtr.patient_gender = {gender:Int64}"
    }

    return { filterRabies: filter, filterEntity }
  }

  programCoverage(queryParams: RabiesQueryParams) {
    const { filterRabies } = this.#generateFilter(queryParams)

    let query = `select 
                    count(distinct dtr.entities_id) total_entity,
                    uniqExactIf(dtr.entities_id, dtr.entities_is_vendor = 1 and dtr.entities_entity_tag_id = 9) total_faskes,
                    uniqExactIf(dtr.entities_id, dtr.entities_entity_tag_id = 11) as total_hospital,
                    count(distinct dtr.entities_province_id) as total_province,
                    count(distinct dtr.entities_regency_id) as total_regency
                from datamart_transactions_rabies dtr final WHERE dtr.consumption_deleted_at is NULL ${filterRabies}`

    return query
  }

  denomEntities(queryParams: RabiesQueryParams) {
    const { filterEntity } = this.#generateFilter(queryParams)

    let query = `SELECT 
                    uniqExactIf(rwe.id, rwe.is_vendor = 1 and rwe.entity_tag_id = 9) total_faskes_denom,
                    uniqExactIf(rwe.id, rwe.entity_tag_id = 11) as total_hospital_denom
                 FROM raw_ws_entities rwe final WHERE rwe.deleted_at is NULL AND rwe.program_id = ${PROGRAM_RABIES} 
                 ${filterEntity}`

    return query
  }

  recipientVaccine(queryParams: RabiesQueryParams) {
    const { filterRabies } = this.#generateFilter(queryParams)

    let queryPatient = `select 
        count(distinct dtr.patient_id) as total_patient,
        uniqExactIf(dtr.patient_id, dtr.vaccine_sequence_id is not null) as total_patient_vaccine,
        uniqExactIf(dtr.patient_id, dtr.vaccine_sequence_id is null) as total_patient_sar
    from datamart_transactions_rabies dtr final WHERE dtr.consumption_deleted_at is NULL AND dtr.patient_id is not NULL ${filterRabies}`

    let queryDose = `SELECT  
      sum(t.total_dose) as total_dose,
      sum(t.total_dose_vaccine) as total_dose_vaccine,
      sum(t.total_dose_sar) as total_dose_sar
    FROM (SELECT
        dtr.transactions_id,
        max(abs(dtr.transactions_change_qty)) AS total_dose,
        maxIf(abs(dtr.transactions_change_qty), dtr.vaccine_sequence_id >= 1) AS total_dose_vaccine,
        maxIf(abs(dtr.transactions_change_qty), dtr.vaccine_sequence_id IS NULL) AS total_dose_sar
    FROM datamart_transactions_rabies dtr
    WHERE dtr.consumption_deleted_at IS NULL AND dtr.patient_id is not NULL ${filterRabies}
    GROUP BY dtr.transactions_id) t`

    return {
      queryPatient,
      queryDose
    }
  }

  monthlyPatientInjection(queryParams: RabiesQueryParams) {
    const { filterRabies } = this.#generateFilter(queryParams)
    let query = `select 
        toMonth(toDateTime(dtr.transactions_actual_date, 'Asia/Jakarta')) as month,
	      toYear(toDateTime(dtr.transactions_actual_date, 'Asia/Jakarta')) as year,
        ifNull(sum(dtr.consumption_injection_count),0) as total_injection,
        ifNull(count(distinct dtr.patient_id),0) as total_patient,
        ifNull(countIf(distinct dtr.patient_id, dtr.patient_gender = '1'),0) as total_male,
        ifNull(countIf(distinct dtr.patient_id, dtr.patient_gender = '2'),0) as total_female,
        ifNull(countIf(distinct dtr.patient_id, dtr.patient_gender = '0' or dtr.patient_gender is null),0) as total_undefined,
        ifNull(sumIf(dtr.consumption_injection_count, dtr.patient_gender = '1'), 0) total_injection_male,
        ifNull(sumIf(dtr.consumption_injection_count, dtr.patient_gender = '2'),0) total_injection_female,
        ifNull(sumIf(dtr.consumption_injection_count, dtr.patient_gender = '0' or dtr.patient_gender is null),0) total_injection_undefined
        from datamart_transactions_rabies dtr final
        where 
        consumption_deleted_at is null
        and dtr.transactions_actual_date is not NULL
        and dtr.transactions_change_qty != 0
        ${filterRabies}
        group by month, year
        order by year, month`

    return query
  }

  rabiesSequences(queryParams: RabiesQueryParams) {
    const { vaccine_method } = queryParams
    let filter = ""
    if (vaccine_method) {
      filter += " and method_id = {vaccine_method:Int64}"
    }

    return `SELECT DISTINCT vs.title FROM raw_ws_vaccine_sequences vs WHERE vs.deleted_at is NULL AND vs.protocol_id = 1 ${filter} ORDER BY vs.sort asc, vs.day_start asc`
  }

  monthlyVaccineSequences(queryParams: RabiesQueryParams) {
    const { filterRabies: filter } = this.#generateFilter(queryParams)

    return `select
          toMonth(toDateTime(dtr.transactions_actual_date, 'Asia/Jakarta')) as month,
	        toYear(toDateTime(dtr.transactions_actual_date, 'Asia/Jakarta')) as year,
          dtr.vaccine_sequence_title as title,
          sum(dtr.consumption_injection_count) as total
        from datamart_transactions_rabies dtr final
          where 
          dtr.consumption_deleted_at is NULL
          and dtr.transactions_actual_date is not NULL
          and dtr.transactions_change_qty != 0
          ${filter}
          group by month, year, title
          order by year, month`
  }

  buildSelectingCount(data_sequences: RabiesSequences[]) {
    let selectColumns = ""
    for (let item of data_sequences) {
      selectColumns += `sumIf(dtr.consumption_injection_count, dtr.vaccine_sequence_title = '${item.title}' and dtr.transactions_change_qty != 0) as \`${item.title}\`,`
    }
    return selectColumns
  }

  consumptionByProvince(queryParams: RabiesQueryParams, data_sequences: RabiesSequences[]) {
    const { filterRabies: filter } = this.#generateFilter(queryParams)
    const selectedColumns = this.buildSelectingCount(data_sequences)

    return `select
          dtr.entities_province_id as province_id,
          dtr.entities_province_name as province_name,
          ${selectedColumns}
          count(distinct dtr.patient_id) as total_patient
        from datamart_transactions_rabies dtr final
          where 
          dtr.consumption_deleted_at is NULL
          AND dtr.vaccine_sequence_id is not null
          ${filter}
          group by province_id, province_name
          order by province_id`
  }

  grandTotalConsumptionByProvince(
    queryParams: RabiesQueryParams,
    data_sequences: RabiesSequences[]
  ) {
    const { filterRabies: filter } = this.#generateFilter(queryParams)
    const selectedColumns = this.buildSelectingCount(data_sequences)

    return `select
          ${selectedColumns}
          count(distinct dtr.patient_id) as total_patient
        from datamart_transactions_rabies dtr final
          where 
          dtr.consumption_deleted_at is NULL
          AND dtr.vaccine_sequence_id is not null
          ${filter}`
  }


  buildQueryProvince(queryParams: RabiesQueryParams, is_count = false) {
    let filter = ""

    const { province_ids, paginate, offset } = queryParams
    if (province_ids) {
      filter += " and p.id in {province_ids:Array(Int64)}"
    }

    if (is_count) return `select count(p.id) as count from raw_locations p final where p.level = 0 ${filter}`

    return `select p.id, p.name from raw_locations p final where p.level = 0 ${filter} order by p.id LIMIT ${paginate} OFFSET ${offset}`
  }

  buildQueryRegency(queryParams: RabiesQueryParams, is_count = false) {
    let filter = ""

    const { province_ids, paginate, offset } = queryParams
    if (province_ids) {
      filter += " and r.parent_id in {province_ids:Array(Int64)}"
    }

    if (is_count) return `select count(r.id) as count from raw_locations r final JOIN raw_locations p ON r.parent_id = p.id where r.level = 1 ${filter}`

    return `select r.id, r.name, p.id as province_id, p.name as province_name from raw_locations r final JOIN raw_locations p ON r.parent_id = p.id where r.level = 1 ${filter} order by r.id LIMIT ${paginate} OFFSET ${offset}`
  }

  consumptionByRegency(queryParams: RabiesQueryParams, data_sequences: RabiesSequences[]) {
    const { filterRabies: filter } = this.#generateFilter(queryParams)
    const selectedColumns = this.buildSelectingCount(data_sequences)

    return `select
          dtr.entities_regency_id as regency_id,
          dtr.entities_regency_name as regency_name,
          ${selectedColumns}
          count(distinct dtr.patient_id) as total_patient
        from datamart_transactions_rabies dtr final
          where 
          dtr.consumption_deleted_at is NULL
          AND dtr.vaccine_sequence_id is not null
          ${filter}
          group by regency_id, regency_name
          order by regency_id`
  }

  transactionConsumptionDetail(queryParams: RabiesQueryParams, isCount = false, isPaginate = true) {
    const { filterRabies: filter } = this.#generateFilter(queryParams)

    if (isCount) {
      return `SELECT count() as count FROM datamart_transactions_rabies dtr final WHERE dtr.consumption_deleted_at is NULL AND dtr.patient_id is not null ${filter}`
    }

    const limit = isPaginate ? `LIMIT ${queryParams.paginate} OFFSET ${queryParams.offset}` : ""

    return `SELECT
          dtr.entities_province_id,
          dtr.entities_province_name,
          dtr.entities_regency_id,
          dtr.entities_regency_name,
          dtr.entities_id,
          dtr.entities_name,
          dtr.patient_id,
          dtr.patient_nik,
          dtr.vaccine_sequence_title,
          dtr.transactions_material_id,
          dtr.material_name,
          dtr.material_unit_of_consumption,
          toDateTime(dtr.transactions_actual_date, 'Asia/Jakarta') as transactions_actual_date,
          dtr.vaccine_sequence_id,
          dtr.material_category,
          dtr.transactions_change_qty,
          dtr.consumption_injection_count
        FROM datamart_transactions_rabies dtr final
        WHERE dtr.consumption_deleted_at is NULL AND dtr.patient_id is not null ${filter}
        ORDER BY dtr.transactions_actual_date asc ${limit}`
  }

  buildCascadeQuery(queryParams: RabiesQueryParams) {
    const { filter, filterSequence } = this.#generateFilterCascade(queryParams)
    return `SELECT 
      seq.title as title,
      seq.type_id as type_id,
      countIf(dtr.patient_id, dtr.status = 'On Schedule') as on_schedule,
      countIf(dtr.patient_id, dtr.status  = 'LTFU') * -1 as \`drop\`,
      countIf(dtr.patient_id, dtr.status  = 'Off Schedule') as off_schedule,
      countIf(dtr.patient_id, dtr.status = 'Confirmed Health') as confirmed,
      countIf(dtr.patient_id, dtr.status != 'LTFU' and dtr.status != 'Waiting') as total
    FROM raw_ws_vaccine_sequences seq
    LEFT JOIN datamart_vaccine_sequence_dump dtr 
    ON dtr.vaccine_sequence_id  = seq.id
    ${filter}
    WHERE seq.protocol_id = 1
    ${filterSequence}
    group by seq.title, seq.type_id, seq.sort
    order by seq.sort ASC`
  }

}
