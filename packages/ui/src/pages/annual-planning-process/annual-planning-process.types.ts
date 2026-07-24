import { OptionType } from "#components/react-select"
import { ENTITY_TYPE } from '#constants/entity'
import { TCommonObject, TCommonResponseList } from '#types/common'

import { AnnualPlanningProcessStatus, MinMaxStatus, MinMaxStatusProvinceRegency } from './annual-planning-process.constants'

export type ListAnnualPlanningProcessParams = {
  page?: string | number
  paginate?: string | number
  program_plan_year?: string | number
  province_id?: string | number
  status?: string | number
}

export type ListCalculationResultParams = {
  page?: string | number
  paginate?: string | number
  activity_id?: string | number
  material_id?: string | number
  entity_id?: string | number
}

export type ListGroupTargetParams = {
  page?: string | number
  paginate?: string | number
}

export type GetDataDetailMonthlyCalculationResultParams = {
  material_id?: string | number
  entity_id?: string | number
}

type EKey = keyof typeof AnnualPlanningProcessStatus
type EKeyStatus = keyof typeof MinMaxStatusProvinceRegency;

export type UserTag = ENTITY_TYPE.PRIMARY_VENDOR | ENTITY_TYPE.PROVINSI | ENTITY_TYPE.KOTA | null

type ProvinceEntity = {
  id: number
  name: string
  min_max_status_province: (typeof MinMaxStatusProvinceRegency)[EKeyStatus]
  min_max_status_regency: (typeof MinMaxStatusProvinceRegency)[EKeyStatus]
  can_activated_province: boolean
  can_activated_regency: boolean
  activated_province_date: string | null
  activated_regency_date: string | null
}

export type AnnualNeedsDataProvince = {
  id?: number
  entity: {
    id: number
    name: string
  }
  program_plan: {
    id: number
    year: string
  }
  status: number
  min_max_status: MinMaxStatus.ACTIVE | MinMaxStatus.INACTIVE
  min_max_updated_at: string | null
}

export type AnnualPlanningProcessDataDistrict = {
  id: number
  status: (typeof AnnualPlanningProcessStatus)[EKey]
  program_plan: {
    id: number
    year: string
  }
}

export type ListAnnualPlanningProcessDataProvince = {
  province_entity: ProvinceEntity
  annual_needs: AnnualNeedsDataProvince[]
}

export type ListAnnualPlanningProcessDistrictResponse = TCommonResponseList & {
  data: AnnualPlanningProcessDataDistrict[]
}

export type ListAnnualPlanningProcessProvinceResponse = TCommonResponseList & {
  data: ListAnnualPlanningProcessDataProvince
}

export type AnnualPlanningProcessFormKey = 'area_program_plan' | 'population_correction' | 'usage_index'

export type AnnualPlanningProcessForm = {
  area_program_plan?: FormAreaProgramPlanForm | null
  population_correction?: FormPopulationCorrectionForm[] | null
  usage_index?: FormDefineDistrictIPForm[] | null
}

export type FormAreaProgramPlanForm = {
  id?: number | string | null
  province?: OptionType | null
  regency?: OptionType | null
  program_plan?: OptionType | null
  entity?: OptionType | null
  status?: number
}

export type FormPopulationTargetForm = {
  id?: number | null
  target_group_id?: number | null
  key?: string | null
  name?: string | null
  sub_district?: {
    id?: number | null
    name?: string | null
  } | null
  percentage?: number | null
  qty?: number | null
  change_qty?: number | null
  user?: {
    id?: number | null
    name?: string | null
  } | null
  updated_at?: string | null
  status?: number | null
  is_revised?: boolean | null
}

export type FormPopulationTargetDataForm = {
  data: FormPopulationTargetForm[]
}

export type FormPopulationCorrectionForm = {
  id?: number | null
  name?: string | null
  entity_id?: number | null
  user_updated_by?: {
    id?: number | null
    name?: string | null
  } | null
  sub_district?: {
    id?: number | string | null
    name?: string | null
  } | null
  updated_at?: string | null
  data?: FormPopulationTargetForm[] | null
}

export type FormPopulationCorrectionDataForm = {
  data: FormPopulationCorrectionForm[]
}

export type FormDefineDistrictIPForm = {
  type?: string
  id?: number | null
  material?: TCommonObject | null
  key?: string | null
  activity?: TCommonObject | null
  sku?: number | null
  national_ip?: number | null
  district_ip?: number | null
  user_updated_by?: TCommonObject | null
  updated_at?: string | null
  status?: number | null
  target_group?: TCommonObject | null
}

export type FormDefineDistrictIPDataForm = {
  data: FormDefineDistrictIPForm[]
}

export type ListInformationPopulationTarget = {
  name: string
  qty_key_1: number
  qty_key_2: number
  qty_key_3: number
  qty_key_4: number
  qty_key_5: number
  qty_key_6: number
  qty_key_7: number
  qty_key_8: number
  qty_key_9: number
}

export type ListPopulationTargetHealthCare = {
  id: number
  name: string
  sub_district: {
    id: number
    name: string
  }
  user_updated_by: {
    id: number
    name: string
  } | null
  updated_at: string | null
  data?: FormPopulationTargetForm[] | null
}

export type ListPopulationTargetPreview = {
  id: string
  name: string
  location: {
    id: number
    name: string
  } | null
  updated_at: string
  percentage: number
  qty: number
  user: {
    id: number
    name: string
  } | null
  change_qty?: number
  status?: number
}

export type ListMaterialIP = {
  material: TCommonObject | null
  activity: TCommonObject | null
  sku: number
  ip: number
  district_ip: number | null
  user_updated_by: TCommonObject | null
  updated_at: string | null
  status: number
}

export type FormCalculationResultFilterForm = {
  activity?: OptionType | null
  material?: OptionType & {
    material_subtype: number
  } | null
  entity?: OptionType | null
}

export type DataCalculationResult = {
  id: number
  entity: {
    id: number
    name: string
  }
  material: {
    id: number
    name: string
  }
  sub_district: {
    id: number
    name: string
  }
  ip: string
  yearly_need: {
    vial: number
    dosis: number
  }
  monthly_need: {
    vial: number
    dosis: number
  }
  weekly_need: {
    vial: number
    dosis: number
  }
  min: number
  max: number
  user_updated_by: {
    id: number
    name: string
  }
  updated_at: string
}

export type ListDataCalculationResultResponse = TCommonResponseList & {
  data: DataCalculationResult[]
}

export type GetDataDetailMonthlyCalculationResultResponse = {
  entity: {
    id: number
    name: string
  }
  material: {
    id: number
    name: string
  }
  activity: {
    id: number
    name: string
  }
  monthly_distributions: Array<{
    month: string
    quantity: number
  }>
}

export type TDetailAnnualPlanningProcess = {
  id: number
  entity: TCommonObject
  province: TCommonObject
  regency: TCommonObject
  status: (typeof AnnualPlanningProcessStatus)[EKey]
  year: string
}

export type CreateAnnualPlanningProcessBody = {
  province_id: number
  regency_id: number
  entity_id: number
  program_plan_id: number
}

export type UpdateAnnualPlanningProcessBody = {
  province_id?: number
  regency_id?: number
  entity_id?: number
  program_plan_id?: number
  status?: number
}

type CreateAnnualPlanningProcessPopulationEntityTargetGroups = {
  target_group_id: number
  percentage: number
  population: number
  population_correction: number
}

type CreateAnnualPlanningProcessPopulationEntity = {
  entity_id: number
  target_groups: CreateAnnualPlanningProcessPopulationEntityTargetGroups[]
}

export type CreateAnnualPlanningProcessPopulationBody = {
  annual_need_id: number
  entities: CreateAnnualPlanningProcessPopulationEntity[]
}

export type UpdateAnnualPlanningProcessPopulationBody = Array<{
  id: number
  population_correction: number
  percentage: number
  population: number
  status: number
}>

export type UpdateStatusAnnualPlanningProcessPopulationBody = {
  id: number
  entity_id: number
  target_group_id: number
  status: number
}

type CreateAnnualPlanningProcessDistrictIPMaterial = {
  material_id: number
  activity_id: number
  sku: number
  national_ip: number
  regency_ip: number
  target_group_id: number
}

export type CreateAnnualPlanningProcessDistrictIPBody = {
  annual_need_id: number
  ips: CreateAnnualPlanningProcessDistrictIPMaterial[]
}

export type UpdateAnnualPlanningProcessDistrictIPBody = Array<{
  id: number
  regency_ip: number
  status: number
}>;

export type UpdateStatusAnnualPlanningProcessDistrictIPBody = Array<{
  id: number
  status: number
}>

export type CreateAnnualPlanningProcessResultBody = {
  annual_need_id: number
}

export type UpdateAnnualPlanningProcessResultBody = {
  annual_need_result_id: number
}

export type ActivateMinMaxProvinceAnnualPlanningProcessBody = {
  province_id: number
  program_plan_id: number
}

export type ActivateMinMaxDistrictAnnualPlanningProcessBody = {
  program_plan_id: number
  annual_need_ids: number[]
}

export type GetProgramPlanResponse = TCommonResponseList & {
  data: Array<{
    id: number
    year: number
    approach: {
      id: number
      name: string
    }
    status: {
      target_group: boolean
      population: boolean
      needs_calculation: boolean
      material_ratio: boolean
    }
    program_id: number
    is_active: boolean
    user_created_by: {
      id: number
      username: string
      firstname: string
      lastname: string
    }
    user_updated_by: {
      id: number
      username: string
      firstname: string
      lastname: string
    } | null
  }>
  statusCode: number
}

type GroupTarget = {
  id: number
  name: string
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  created_by: number | null
  updated_by: number | null
  user_created_by: null | {
    id: number
    username: string
    firstname: string
    lastname: string
  }
  user_updated_by: null | {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}

export type ListGroupTargetResponse = TCommonResponseList & {
  data: GroupTarget[]
}

export type DataCentralPopulation = {
  year_plan: string
  approach: string
  province: {
    id: number
    name: string
  }
  entity: {
    id: number
    name: string
  }
  population_data: Array<{
    id: number
    name: string
    population_number: number
  }>
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  user_created_by?: null | {
    id: number
    username: string
    firstname: string
    lastname: string
  }
  user_updated_by?: null | {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}

export type MaterialIP = {
  id: number
  material: {
    id: number
    name: string
  }
  activity: {
    id: number
    name: string
  }
  sku: number
  ip: number
  national_ip?: number
  regency_ip?: number
  user_updated_by: {
    id: number
    name: string
  }
  updated_at: string
  status: number
  target_group?: {
    id: number
    name: string
  } | null
}

export type ListMaterialIPResponse = TCommonResponseList & {
  data: MaterialIP[]
}

export type GetDetailAnnualPlanningProcessResponse = {
  id: number
  province: {
    id: number
    name: string
  }
  regency: {
    id: number
    name: string
  }
  program_plan: {
    id: number
    year: string
  }
  status: number
}

export type GetDetailAnnualPlanningProcessPopulationTarget = {
  id?: number
  entity: {
    id: number
    name: string
  }
  sub_district: {
    id: number
    name: string
  } | null
  annual_need_populations: Array<{
    id: number
    target_group_name: string
    target_group_id: number
    percentage: number
    population: number
    population_correction: number
    status: number
  }>
  user_updated_by: {
    id: number
    name: string
  } | null
  updated_at: string | null
}

export type GetDetailAnnualPlanningProcessPopulationTargetResponse = {
  data: GetDetailAnnualPlanningProcessPopulationTarget[]
}

export type GetDetailAnnualPlanningProcessDistrictIPResponse = {
  province: {
    id: number
    name: string
  }
  regency: {
    id: number
    name: string
  }
  program_plan: {
    id: number
    year: string
  }
  data: Array<{
    id: number
    material: {
      id: number
      name: string
    }
    activity: {
      id: number
      name: string
    }
    sku: number
    ip?: number
    national_ip?: number
    regency_ip?: number
    user_updated_by: {
      id: number
      name: string
    }
    updated_at: string
    status: number
    target_group?: {
      id: number
      name: string
    } | null
  }>
}
