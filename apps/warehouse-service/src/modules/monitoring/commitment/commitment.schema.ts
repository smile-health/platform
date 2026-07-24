import { z } from "zod"

const decodeTwice = (value: string) => {
  let result = value

  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(result)
      if (decoded === result) break
      result = decoded
    } catch {
      break
    }
  }

  return result
}

const ContractNumbersSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined

    const decoded = decodeTwice(val)
    const parts = decoded
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)

    return parts.length ? parts : undefined
  })

const MaterialIdsSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined

    const parts = val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)

    return parts.length ? parts : undefined
  })

export const CommitmentMonitoringQueryParamsSchema = z.object({
  year: z.coerce.number().int().min(1900),
  material_type_id: z.coerce.number().int().optional(),
  material_ids: MaterialIdsSchema,
  contract_numbers: ContractNumbersSchema,
  program_id: z.coerce.number().int().optional(),
})

export type CommitmentMonitoringQueryParams = z.infer<
  typeof CommitmentMonitoringQueryParamsSchema
>

/**
 * Response
 */
export type CommitmentSummaryResponse = {
  annual_needs: {
    value: number
    deviation: number | null
  }
  annual_commitment: {
    value: number
    deviation: number | null
  }
}

export type CommitmentNationalResponse = {
  title: string
  labels: string[]
  datasets: Array<{
    label: string
    value: number
    color: string
  }>
}

export type CommitmentProvinceResponse = {
  title: string
  data: Array<{
    is_commitment: boolean
    province: {
      id: number
      name: string
    }
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
}

export type CommitmentNeedStocksResponse = {
  title: string
  labels: string[]
  datasets: Array<{
    label: string
    value: number | null
    color: string
  }>
}

export type CommitmentRealizationTargetResponse = {
  title: string
  flags: Array<{
    step: number
    date: string
    percent: number
    quantity: number
  }>
  labels: string[]
  datasets: Array<{
    label: string
    value: number
    color: string
  }>
}

export type MaterialExcelRow = {
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
}

export type ProvinceMaterialExcelRow = {
  province_id: number
  province_name: string
  material_id: number
  material_name: string
  contract_number: string | null
  total_commitment_reguler_dose: number
  total_used_reguler_dose: number
  total_unused_reguler_dose: number
  total_used_buffer_dose: number
}

export type YearlyNeedByProvinceMaterial = {
  province_id: number
  material_id: number
  material_name: string
  need_qty: number
}

export type QuarterlyMaterialNeedRow = {
  material_name: string
  is_supporting_material: number
  total_balance: number
  needs_this_quartal: number
  is_bellow_stock: number
}

export type QuarterlyNeedsEmailUser = {
  id: number
  email: string
}
