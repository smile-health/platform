import { STATUS } from "@/common/constants/common.js"
import { ENTITY_TAG } from "@/common/constants/entity.js"
import { db, execQuery } from "@/common/infrastructure/database/index.js"
import { Context } from "hono"
import { CommitmentQuery } from "./commitment.query.js"
import {
  CommitmentMonitoringQueryParams,
  QuarterlyMaterialNeedRow,
  QuarterlyNeedsEmailUser,
} from "./commitment.schema.js"

export class CommitmentRepository {
  constructor(private readonly query: CommitmentQuery) {}

  private buildClickhouseParams(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const limitYear = `${queryParams.year}-01-01 00:00:00`

    return {
      year: queryParams.year,
      limit_year: limitYear,
      material_type_id: queryParams.material_type_id,
      material_ids: queryParams.material_ids,
      contract_numbers: queryParams.contract_numbers,
      program_id: 1,
    }
  }

  async getSummaryFinal(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildSummaryFinalQuery(c, queryParams)

    const result = await execQuery<
      Array<{
        annual_needs_value: number
        annual_needs_deviation: number | null
        annual_commitment_value: number
        annual_commitment_deviation: number | null
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))

    return (
      result[0] ?? {
        annual_needs_value: 0,
        annual_needs_deviation: null,
        annual_commitment_value: 0,
        annual_commitment_deviation: null,
      }
    )
  }

  async getNationalFinal(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildNationalFinalQuery(c, queryParams)

    const result = await execQuery<
      Array<{
        buffer_not_sent: number
        buffer_sent: number
        allocation_sent: number
        allocation_not_sent: number
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))

    return (
      result[0] ?? {
        buffer_not_sent: 0,
        buffer_sent: 0,
        allocation_sent: 0,
        allocation_not_sent: 0,
      }
    )
  }

  async getNeedStocksFinal(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildNeedStocksFinalQuery(c, queryParams)

    const result = await execQuery<
      Array<{
        total_need: number
        total_consumed: number
        total_stock: number
        total_remaining: number
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))

    return (
      result[0] ?? {
        total_need: 0,
        total_consumed: 0,
        total_stock: 0,
        total_remaining: 0,
      }
    )
  }

  async getRealizationTargetFinal(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildRealizationTargetFinalQuery(c, queryParams)

    const result = await execQuery<
      Array<{
        total_commitment: number
        commitment_sent: number
        commitment_not_sent: number
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))

    return (
      result[0] ?? {
        total_commitment: 0,
        commitment_sent: 0,
        commitment_not_sent: 0,
      }
    )
  }

  async getProvinceRows(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildProvinceCommitmentQuery(c, queryParams)

    const result = await execQuery<
      Array<{
        is_commitment: number
        province_id: number
        province_name: string
        total_commitment_reguler_dose: number
        total_used_reguler_dose: number
        total_unused_reguler_dose: number
        total_commitment_reguler_vial: number
        total_used_reguler_vial: number
        total_unused_reguler_vial: number
        total_used_buffer_dose: number
        total_used_buffer_vial: number
        total_yearly_need: number | null
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))

    return result
  }

  async getMaterialExcelRows(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildMaterialExcelQuery(c, queryParams)

    return await execQuery<
      Array<{
        material_name: string
        contract_number: string
        commitment_year: number
        realization_year: number | null
        total_commitment_reguler_dose: number
        total_commitment_reguler_vial: number
        total_commitment_buffer_dose: number
        total_commitment_buffer_vial: number
        total_used_reguler_dose: number
        total_used_reguler_vial: number
        total_used_buffer_dose: number
        total_used_buffer_vial: number
        total_unused_reguler_dose: number
        total_unused_reguler_vial: number
        total_unused_buffer_dose: number
        total_unused_buffer_vial: number
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))
  }

  async getProvinceMaterialExcelRows(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildProvinceMaterialExcelQuery(c, queryParams)

    return await execQuery<
      Array<{
        province_id: number
        province_name: string
        material_id: number
        material_name: string
        contract_number: string | null
        total_commitment_reguler_dose: number
        total_used_reguler_dose: number
        total_unused_reguler_dose: number
        total_used_buffer_dose: number
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))
  }

  async getYearlyNeedByProvinceMaterial(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const sql = this.query.buildYearlyNeedByProvinceMaterialQuery(queryParams)

    return await execQuery<
      Array<{
        province_id: number
        material_id: number
        material_name: string
        need_qty: number
      }>
    >(sql, this.buildClickhouseParams(c, queryParams))
  }

  async getProvinceNames() {
    const sql = this.query.buildProvinceNamesQuery()

    return await execQuery<
      Array<{
        province_id: number
        province_name: string
      }>
    >(sql)
  }

  async getQuarterlyMaterialNeeds(): Promise<QuarterlyMaterialNeedRow[]> {
    const sql = this.query.buildQuarterlyMaterialNeedsQuery()

    return await execQuery<QuarterlyMaterialNeedRow[]>(sql)
  }

  async getQuarterlyNeedsEmailUsers(): Promise<QuarterlyNeedsEmailUser[]> {
    const users = await db
      .selectFrom("ws_users as wu")
      .innerJoin("ws_entities as we", "we.id", "wu.entity_id")
      .select(["wu.global_id as id", "wu.email"])
      .where("we.entity_tag_id", "=", ENTITY_TAG.MINISTRY_OF_HEALTH)
      .where("we.deleted_at", "is", null)
      .where((eb) =>
        eb.and([eb("wu.email", "is not", null), eb("wu.email", "!=", "")])
      )
      .where("wu.status", "=", STATUS.ACTIVE)
      .where("wu.program_id", "=", 1)
      .where("wu.deleted_by", "is", null)
      .execute()

    return users as QuarterlyNeedsEmailUser[]
  }
}
