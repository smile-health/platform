import {
  EntityDenom,
  MonthlyRabiesSequences,
  RabiesCoverage,
  RabiesMonthlyPatientInjection,
  RabiesQueryParams,
  RabiesRecipientVaccine,
  RabiesSequences,
} from "./rabies.schema.js"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { RabiesQuery } from "./rabies.query.js"
import { Context } from "hono"
import crypto from "crypto"

export class RabiesRepository {
  constructor(private readonly rabiesQuery: RabiesQuery) { }

  private readonly doDecrypt = (encrypted: string): string => {
    const iv = process.env.IV_KEY
    const encKey = process.env.ENCRYPT_KEY

    if (!iv || !encKey) {
      throw new Error(
        "Missing required environment variables: IV_KEY and ENCRYPT_KEY must be set"
      )
    }

    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", encKey, iv)
      let decrypted = decipher.update(encrypted, "base64", "utf8")
      decrypted += decipher.final("utf8")
      return decrypted
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error(`Failed to decrypt the text: ${error.message}`)
    }

    return "-"
  }


  async fetchRabiesCoverage(queryParams: RabiesQueryParams) {
    const queryCoverage = this.rabiesQuery.programCoverage(queryParams)
    return await execQuery<RabiesCoverage[]>(queryCoverage, queryParams)
  }

  async fetchEntityDenom(queryParams: RabiesQueryParams) {
    const queryDenom = this.rabiesQuery.denomEntities(queryParams)
    return await execQuery<EntityDenom[]>(queryDenom, queryParams)
  }

  async lastUpdatedAt() {
    const result = await execQuery<any>(
      "SELECT ingested_at as last_updated_at FROM datamart_transactions_rabies ORDER BY ingested_at DESC LIMIT 1"
    )

    console.log(result)

    return result[0]?.last_updated_at ?? null
  }

  async getRabiesCoverage(queryParams: RabiesQueryParams) {
    const data_coverage = await this.fetchRabiesCoverage(queryParams)
    const data_denom = await this.fetchEntityDenom(queryParams)

    return {
      ...(data_coverage[0] ?? {}),
      ...(data_denom[0] ?? {}),
    }
  }

  async getRecipientVaccine(queryParams: RabiesQueryParams) {
    const { queryPatient, queryDose } = this.rabiesQuery.recipientVaccine(queryParams)

    const [dataPatient, dataDose] = await Promise.all([
      execQuery<RabiesRecipientVaccine[]>(queryPatient, queryParams),
      execQuery<RabiesRecipientVaccine[]>(queryDose, queryParams),
    ])

    const data1 = dataPatient.length ? dataPatient[0] : {
      total_patient: 0,
      total_patient_vaccine: 0,
      total_patient_sar: 0,
    }

    const data2 = dataDose.length ? dataDose[0] : {
      total_dose: 0,
      total_dose_vaccine: 0,
      total_dose_sar: 0,
    }

    return {
      ...data1,
      ...data2
    }
  }

  async getRabiesMonthlyInjection(queryParams: RabiesQueryParams) {
    const query = this.rabiesQuery.monthlyPatientInjection(queryParams)
    const data = await execQuery<RabiesMonthlyPatientInjection>(query, queryParams)
    return data
  }

  async getRabiesVaccineSequences(queryParams: RabiesQueryParams) {
    const query = this.rabiesQuery.rabiesSequences(queryParams)
    const data = await execQuery<RabiesSequences[]>(query, queryParams)
    return data
  }

  async getDataMonthlySequences(queryParams: RabiesQueryParams) {
    const query = this.rabiesQuery.monthlyVaccineSequences(queryParams)
    const data = await execQuery<MonthlyRabiesSequences[]>(query, queryParams)
    return data
  }

  transformDataMonthlySequences(c: Context, data: MonthlyRabiesSequences[], sequences: RabiesSequences[]) {
    const translatedSequences = sequences.map(it => ({ key: it.title, title: c.var.t(it.title) }))
    const lookup = new Map<string, { key: string, title: string, value: number }[]>()
    const sequencesMap: { month: number, year: number, values: { key: string, title: string, value: number }[] }[] = []

    for (const item of data) {
      const key = `${item.year}-${item.month}`
      let values = lookup.get(key)

      if (!values) {
        values = translatedSequences.map(it => ({ ...it, value: 0 }))
        lookup.set(key, values)
        sequencesMap.push({ month: item.month, year: item.year, values })
      }

      const entry = values.find(it => it.key === item.title)
      if (entry) entry.value = item.total
    }

    return sequencesMap
  }

  async getProvinces(c: Context, queryParams: RabiesQueryParams) {
    const [data, countResult] = await Promise.all([
      execQuery<any[]>(this.rabiesQuery.buildQueryProvince(queryParams), queryParams),
      execQuery<any[]>(this.rabiesQuery.buildQueryProvince(queryParams, true), queryParams),
    ])
    return { data, count: countResult[0]?.count ?? 0 }
  }

  async getRegencies(c: Context, queryParams: RabiesQueryParams) {
    const [data, countResult] = await Promise.all([
      execQuery<any[]>(this.rabiesQuery.buildQueryRegency(queryParams), queryParams),
      execQuery<any[]>(this.rabiesQuery.buildQueryRegency(queryParams, true), queryParams),
    ])
    return { data, count: countResult[0]?.count ?? 0 }
  }

  async getConsumptionByProvince(c: Context, queryParams: RabiesQueryParams, data_province: any[]) {
    const sequences = await this.getRabiesVaccineSequences(queryParams)
    const grandTotalQuery = this.rabiesQuery.grandTotalConsumptionByProvince(queryParams, sequences)
    const grandTotal = await execQuery<any[]>(grandTotalQuery, queryParams)
    queryParams.province_ids = data_province.map(it => it.id)
    const query = this.rabiesQuery.consumptionByProvince(queryParams, sequences)
    const data = await execQuery<any[]>(query, queryParams)
    const headers = sequences.map(it => c.var.t(it.title))

    const { offset } = queryParams
    return {
      headers,
      data: data_province.map((it, index) => ({
        row: offset + index + 1,
        ...it,
        total_patients: data.find(d => d.province_id == it.id)?.total_patient ?? 0,
        values: sequences.map(seq => ({
          label: c.var.t(seq.title),
          value: data.find(d => d.province_id == it.id)?.[seq.title] ?? 0
        }))
      })),
      grand_total: sequences.map(seq => ({
        label: c.var.t(seq.title),
        value: grandTotal[0]?.[seq.title] ?? 0
      }))
    }
  }

  async rabiesConsumptionByProvince(c: Context, queryParams: RabiesQueryParams) {
    const { data: data_province, count } = await this.getProvinces(c, queryParams)
    const { data, headers, grand_total } = await this.getConsumptionByProvince(c, queryParams, data_province)

    return {
      headers,
      data,
      count,
      grand_total
    }
  }

  async getConsumptionByRegency(
    c: Context,
    queryParams: RabiesQueryParams,
    data_regencies: any[]
  ) {
    const sequences = await this.getRabiesVaccineSequences(queryParams)
    if (!queryParams.regency_ids) {
      queryParams.regency_ids = data_regencies.map(it => it.id)
    }
    const query = this.rabiesQuery.consumptionByRegency(queryParams, sequences)
    const data = await execQuery<any[]>(query, queryParams)
    const headers = sequences.map(it => c.var.t(it.title))

    const { offset } = queryParams
    return {
      headers,
      data: data_regencies.map((it, index) => ({
        row: offset + index + 1,
        ...it,
        total_patients: data.find(d => d.regency_id == it.id)?.total_patient ?? 0,
        values: sequences.map(seq => ({
          label: c.var.t(seq.title),
          value: data.find(d => d.regency_id == it.id)?.[seq.title] ?? 0
        }))
      }))
    }
  }

  async rabiesConsumptionByRegency(c: Context, queryParams: RabiesQueryParams) {
    const { data: data_regencies, count } = await this.getRegencies(c, queryParams)
    const { data, headers } = await this.getConsumptionByRegency(c, queryParams, data_regencies)

    return {
      headers,
      data,
      count
    }
  }

  async getTransactionConsumptionDetail(queryParams: RabiesQueryParams) {
    const [data, countResult] = await Promise.all([
      execQuery<any[]>(this.rabiesQuery.transactionConsumptionDetail(queryParams), queryParams),
      execQuery<any[]>(this.rabiesQuery.transactionConsumptionDetail(queryParams, true), queryParams),
    ])
    return { data, count: countResult[0]?.count ?? 0 }
  }

  private maskId(value: string): string {
    if (!value) return ""

    const len = value.length
    if (len <= 1) return "*"

    const visible = Math.max(1, Math.min(Math.floor(len / 4), Math.floor((len - 1) / 2)))
    const start = value.slice(0, visible)
    const end = value.slice(-visible)
    const masked = Math.max(len - visible * 2, 1)

    return start + "*".repeat(masked) + end
  }


  #nikMask(nik: string) {
    if (!nik) return '-'
    const nikDec = this.doDecrypt(nik)
    return this.maskId(nikDec)
  }

  private readonly mappingDetailRabies = (c: Context, item: any, index: number, offset: number) => ({
    row: offset + index + 1,
    province_id: item.entities_province_id,
    province_name: item.entities_province_name,
    regency_id: item.entities_regency_id,
    regency_name: item.entities_regency_name,
    entity_id: item.entities_id,
    entity_name: item.entities_name,
    patient_id: item.patient_id,
    patient_nik: this.#nikMask(item.patient_nik),
    vaccine_type: c.var.t(item.vaccine_sequence_title),
    material_id: item.transactions_material_id,
    material_name: item.material_name,
    material_unit: c.var.t(`material_unit.label.${item.material_unit_of_consumption}`),
    actual_transaction_date: item.transactions_actual_date,
    vaccine_sequence: item.vaccine_sequence_id,
    material_category: item.material_category,
    injection: item.transactions_change_qty != 0 ? item.consumption_injection_count : 0,
    dose: Math.abs(item.transactions_change_qty)
  })

  async rabiesTransactionConsumptionDetail(c: Context, queryParams: RabiesQueryParams) {
    const { offset } = queryParams
    const { data, count } = await this.getTransactionConsumptionDetail(queryParams)
    return {
      data: data.map((item, index) => this.mappingDetailRabies(c, item, index, offset)),
      count
    }
  }

  async getTransactionConsumptionsXLS(c: Context, queryParams) {
    const data = await execQuery<any[]>(this.rabiesQuery.transactionConsumptionDetail(queryParams, false, false), queryParams)
    return data.map((item, index) => this.mappingDetailRabies(c, item, index, 0))
  }

  async getRabiesCascade(c: Context, queryParams: RabiesQueryParams) {
    const data = await execQuery<any[]>(this.rabiesQuery.buildCascadeQuery(queryParams), queryParams)
    return data.map((item) => ({
      ...item,
      title: c.var.t(item.title)
    }))
  }

}
