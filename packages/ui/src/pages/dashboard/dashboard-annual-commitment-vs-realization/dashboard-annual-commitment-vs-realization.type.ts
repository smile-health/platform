import { TCommonResponseList } from "#types/common"
import { TFunction } from "i18next"
import { ReactNode } from "react"

export type DataStackedBar = {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
      barThickness: number
    }[]
  }
}

export type Information = {
  title: string
  description?: ReactNode
  details?: string[]
  contentClassName?: string
  listType?: 'paragraph' | 'list'
}

export type ContractNumberResponse = TCommonResponseList & {
  data: Array<{
    contract: {
      id: number
      number: string
    }
    contract_end_date: string
    contract_start_date: string
    id: number
    information: null
    updated_at: string
    user_updated_by: {
      id: number
      fullname: string
    }
    vendor: {
      id: number
      number: string
    }
    year: number
  }>
}

export type CreateFilterSchemaParams = {
  t: TFunction<'dashboardAnnualCommitmentVsRealization'>
  program_id: number | string
}

export type AnnualCommitmentVsRealizationProvinceParams = {
  year?: string | number
  material_type_id?: string | number
  material_ids?: string
  contract_number?: string
}

export type AnnualCommitmentVsRealizationChartResponse = {
  title?: string
  labels: string[] | null
  datasets: {
    label: string
    value: number
    color: string
  }[]
  flags?: {
    step: number
    date: string
    percent: number
    quantity: number
  }[]
}

export type AnnualCommitmentVsRealizationSummaryResponse = {
  annual_needs: {
    value: number
    deviation: number | null
  },
  annual_commitment: {
    value: number,
    deviation: number | null
  }
}

export type AnnualCommitmentVsRealizationProvinceData = {
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
  total_yearly_need: number
}

export type ListAnnualCommitmentVsRealizationProvinceResponse = {
  title?: string
  data: Array<AnnualCommitmentVsRealizationProvinceData>
}