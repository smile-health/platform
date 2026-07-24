import { TCommonObject } from './common'

export type TMaterialResponse = {
  page: number
  perPage: number
  total: number
  list: TMaterialList[] | TMaterial[] | TMaterialTypeList[]
}

export type TMaterial = {
  material_companion_label: string
  manufactures_label: string
  material_activities_label: string
  user_updated_by_label: string
  status_label: string
  id: number
  name: string
  unit_of_distribution: string
  consumption_unit_per_distribution_unit?: number
  code: string
  description: string
  pieces_per_unit: number
  unit: string
  temperature_sensitive: number
  temperature_min?: number
  temperature_max?: number
  created_by: number
  updated_by: number
  deleted_by: any
  managed_in_batch: number
  is_managed_in_batch?: number
  status: number
  is_vaccine: number
  is_stockcount: number
  is_addremove: number
  is_openvial: number
  kfa_code: any
  need_sequence?: number
  created_at: string
  updated_at: string
  deleted_at: any
  material_type: TMaterialType
  mapping_master_material?: TMappingMasterMaterial
  material_activities: TMaterialActivity[]
  manufactures: TManufacture[]
  material_companion: TMaterialCompanion[]
  user_updated_by: TUserUpdatedBy
  max_temperature: number
  min_temperature: number
  material_subtype: TCommonObject
}

export type TMaterialType = {
  id: number
  name: string
}

export type TMappingMasterMaterial = {
  id: number
  id_material_smile: number
  code_kfa_ingredients: string
  code_kfa_product_template?: string
  code_kfa_product_variant: any
  code_kfa_packaging: any
  id_kfa: any
  code_biofarma: any
  code_bpom: any
  name_kfa_ingredients: any
  name_kfa_product_template: any
  name_kfa_product_variant: any
  name_kfa_packaging: any
}

export type TMaterialActivity = {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
}

export type TManufacture = {
  id: number
  name: string
}

export type TMaterialCompanion = {
  id: number
  name: string
}
export type TMaterialList = {
  id: number
  name: string
  description: string
  material_level_id: number
  code: string
  hierarchy_code: string
  unit_of_consumption_id: number
  unit_of_distribution_id: number
  consumption_unit_per_distribution_unit: number
  is_temperature_sensitive: number
  min_retail_price: number
  max_retail_price: number
  min_temperature: number
  max_temperature: number
  material_type_id: number
  is_managed_in_batch: number
  status: number
  created_by: number
  updated_by: number
  deleted_by: number
  created_at: string
  updated_at: string
  deleted_at: any
  programs: TProgram[]
  user_created_by: TUserCreatedBy
  user_updated_by: TUserUpdatedBy
  material_activities?: string
}

export type TProgram = {
  id: number
  key: string
  name: string
  material_id: number
  config: TConfig
}

export type TConfig = {
  material: TMaterialConfig
}

export type TMaterialConfig = {
  is_hierarchy_enabled: boolean
}

export type TUserCreatedBy = {
  id: number
  username: string
  firstname: string
  lastname: string
}

export type TUserUpdatedBy = {
  id: number
  username: string
  firstname: string
  lastname: string
}

export interface TMaterialTypeList {
  id: number
  name: string
  created_by: number
  updated_by: string
  activity_id: string
  created_at: string
  updated_at: string
  deleted_at: string
}
