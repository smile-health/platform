export type GetMaterialsResponse = {
  total: number
  page: number
  perPage: number
  list: MaterialsData[]
}

export type MaterialsData = {
  material_companion_label: string
  manufactures_label: string
  material_activities_label: string
  user_updated_by_label: string
  status_label: string
  kfa_level_label: string
  parent_label: string
  parent_kfa_code_label: string
  id: number
  name: string
  unit_of_distribution: string
  code: string
  description: string
  pieces_per_unit: number
  unit: string
  temperature_sensitive: number
  temperature_min: number
  temperature_max: number
  created_by?: number
  updated_by: number
  deleted_by: any
  managed_in_batch: number
  status: number
  is_vaccine: number
  is_stockcount: number
  is_addremove: number
  is_openvial: number
  kfa_code?: string
  need_sequence?: number
  range_temperature_id: any
  kfa_level_id?: number
  parent_id: any
  created_at: string
  updated_at: string
  deleted_at: any
  mapping_master_material?: TMappingMasterMaterial
  manufactures: TManufacture[]
  material_companion: TMaterialCompanion[]
  user_updated_by: TUserUpdatedBy
  material_activities: TMaterialActivity[]
}

export type TMappingMasterMaterial = {
  id: number
  id_material_smile: number
  code_kfa_ingredients: string
  code_kfa_product_template: string
  code_kfa_product_variant: string
  code_kfa_packaging: string
  id_kfa: string
  code_biofarma: string
  code_bpom: string
  name_material_smile: string
  name_kfa_ingredients: string
  name_kfa_product_template: string
  name_kfa_product_variant: string
  name_kfa_packaging: string
}

export type TManufacture = {
  id: number
  name: string
}

export type TMaterialCompanion = {
  id: number
  name: string
}

export type TUserUpdatedBy = {
  id: number
  firstname: string
  lastname?: string
}

export type TMaterialActivity = {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
}
