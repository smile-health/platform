import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { CallbackDataParams } from 'echarts/types/dist/shared'

export type TDashboardRabiesFilter = {
  period?: {
    start: string
    end: string
  }
  entity_tags?: OptionType[]
  provinces?: OptionType[]
  regencies?: OptionType[]
  entities?: OptionType[]
  vaccine_method?: string
  gender?: string
  identity_type?: string
  vaccine?: string
}

export type TInformation = {
  title: string
  description?: string
  details?: string[]
  contentClassName?: string
  listType?: 'paragraph' | 'list'
}

export type BaseDashboardRabiesParams = {
  from?: string
  to?: string
  entity_tag_ids?: string
  province_ids?: string
  regency_ids?: string
  entity_ids?: string
}

export type DashboardRabiesWithAdditionalParams = BaseDashboardRabiesParams & {
  vaccine_method?: string
  gender?: string
}

export type RabiesSequenceSeries = {
  name: string
  data: Array<number | string>
  color: string
  label: {
    show: boolean
    formatter: (params: CallbackDataParams) => string
  }
}

export type ProgramCoverageResponse = {
  data: TProgramCoverage
}

export type TProgramCoverage = {
  total_entity: number
  total_faskes: number
  total_hospital: number
  total_province: number
  total_regency: number
  total_faskes_denom: number
  total_hospital_denom: number
}

export type RecipientVaccineResponse = {
  data: TRecipientVaccine
}

type TRecipientVaccine = {
  total_patient: number
  total_patient_vaccine: number
  total_patient_sar: number
  total_dose: number
  total_dose_vaccine: number
  total_dose_sar: number
}

export type CareCascadeParams = DashboardRabiesWithAdditionalParams & {
  identity_type?: string
}

export type CareCascadeResponse = {
  data: TCareCascade[]
}

export type TCareCascade = {
  type_id: number
  title: string
  total: number
  drop: number
  on_schedule: number
  off_schedule: number
  stop: number
  confirmed: number
}

export type MonthlyPatientDoseParams = DashboardRabiesWithAdditionalParams & {
  vaccine?: string
}

export type MonthlyPatientDoseResponse = {
  data: TMonthlyPatientDose[]
}

export type TMonthlyPatientDose = {
  total_injection: number
  total_patient: number
  total_male: number
  total_female: number
  total_undefined: number
  total_injection_male: number
  total_injection_female: number
  total_injection_undefined: number
  month: number
  year: number
}

export type TVaccineSequence = {
  prep1: number
  prep2: number
  var1: number
  var8: number
  var2: number
  var3: number
  booster1: number
  booster2: number
}

export type TProvinceSequence = {
  value: number
} & Record<string, string>

export type MonthlyVaccineSequenceResponse = {
  data: TMonthlyVaccineSequence[]
}

export type TMonthlyVaccineSequence = {
  values: TProvinceSequence[]
  month: number
  year: number
}

export type TVaccineSquenceItem = {
  label: string
  key: keyof TMonthlyVaccineSequence
  color?: string
}

export type DashboardRabiesLocationParams =
  DashboardRabiesWithAdditionalParams & TCommonFilter

export type ProvinceResponses = TCommonResponseList & {
  data: TProvinceItem[]
  grand_total: TProvinceSequence[]
  headers: Array<string>
}

export type TProvinceGrandTotal = TProvinceSequence[]

export type TProvinceItem = {
  row: number
  id: number
  name: string
  values: TProvinceSequence[]
  total_patients: number
}

export type RegencyResponses = TCommonResponseList & {
  data: TProvinceItem[]
  headers: Array<string>
}

export type DashboardRabiesEntityParams = TCommonFilter &
  DashboardRabiesWithAdditionalParams

export type DashboardRabiesEntityResponse = TCommonResponseList & {
  data: TDashboardRabiesEntity[]
}

export type TDashboardRabiesEntity = {
  row: number
  province_id: string
  province_name: string
  regency_id: string
  regency_name: string
  entity_id: number
  entity_name: string
  patient_id: number
  patient_nik: string
  material_id: number
  material_name: string
  material_unit: string
  actual_transaction_date: string
  vaccine_sequence: number
  vaccine_type: string
  material_category: string
  injection: number
  dose: number
}
