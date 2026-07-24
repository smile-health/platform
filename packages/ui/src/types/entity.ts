import { TProgram } from './program'

export type TEntitiesTypeLabel = 'FASKES' | 'PROVINSI' | 'KOTA' | 'PKC'

type TUser = {
  id: number
  username: string
  firstname: string
  lastname: string | null
  mobile_phone: string | null
}

export type TEntities = {
  // workspace
  id: number
  name: string
  entity_tag_name: string
  code: string | null
  location: string | null
  status: number

  type_label: TEntitiesTypeLabel
  address: string
  type: number
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  province_id: string
  regency_id: string
  village_id: string | null
  sub_district_id: string | null
  lat: string | null
  lng: string | null
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string | null
  is_ayosehat: number
  mapping_entity: string | null
  entity_tags: Array<{ id: number; title: string }>
  entity_tag?: { id: number; title: string }
  province: {
    id: string
    name: string
  } | null
  regency: {
    id: string
    name: string
  } | null
  sub_district: {
    id: string
    name: string
  } | null
  village: {
    id: string
    name: string
  } | null
  beneficiaries: TProgram[]
  programs: TProgram[]
  integration_client_id: number | null
  locations?: Array<{
    id: number
    name: string
    level: number
  }>
  id_satu_sehat: number | null
}

export type TDetailActivityDate = {
  id?: number | null
  activity_id?: number
  name?: string
  start_date: string | null | undefined
  end_date?: string | null
  entity_activity_id?: number | null
  is_expired?: boolean
}

export type TDetailEntity = {
  id: number
  name: string
  address: string
  code: string
  type: string | number
  entity_type?: Array<{ id: number; name: string }>
  status: number
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  province_id: string
  regency_id: string
  village_id: string | null
  sub_district_id: string
  lat: string | null
  lng: string | null
  postal_code: string | null
  is_vendor: number | null
  is_relocation: number | null
  bpom_key: string | null
  is_puskesmas: number | null
  rutin_join_date: string | null
  is_ayosehat: number | null
  users: Array<TUser> | null
  entity_tags: Array<{
    id: number
    title: string
  }> | null
  entity_tag: {
    id: number
    title: string
  } | null
  activities_date: TDetailActivityDate[] | null
  user_updated_by?: {
    firstname: string
    lastname: string
  }
  beneficiaries: TProgram[]
  programs: TProgram[]
  locations: Array<{
    id: number
    name: string
    level: number
  }>
  location: string
  entity_tag_name: string
  last_update: string | null
  entity_tag_id: number | null
  province: {
    id: string
    name: string
  }
  regency: {
    id: string
    name: string
  }
  sub_district: {
    id: string
    name: string
  }
  village: {
    id: string
    name: string
  }
  integration_client_id: number | null
  id_satu_sehat: number | null
  is_sentinel_lab?: boolean
  sentinel_lab_start_date?: string | null
  sentinel_lab_end_date?: string | null
}

export type TEntityForm = {
  id?: string
  code: string
  name: string
  type: number
  entity_tag_id?: number
  is_vendor?: number
  is_puskesmas?: number
  is_ayosehat?: number
  province_id?: string | null
  regency_id?: string | null
  sub_district_id?: string | null
  village_id?: string | null
  postal_code: string | null
  address: string
  lat: string | null
  lng: string | null
  beneficiaries_ids: number[]
  program_ids: number[]
  activities_date: Array<{
    activity_id: number
    start_date: string | null
    end_date: string | null
  }>
  rutin_join_date: string | null
  integration_client_id?: number
  id_satu_sehat: number
}

export type TUpdateActivityImplementationTimeBody = {
  activities: TDetailActivityDate[][]
}

export type TSubmitActivityImplementationTime = {
  activities: TDetailActivityDate[] | Partial<TDetailActivityDate>[]
}

export type TDetailEntityCustomer = {
  type_label: TEntitiesTypeLabel
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  province_id: string
  regency_id: string | null
  village_id: string | null
  sub_district_id: string | null
  lat: string | null
  lng: string | null
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string | null
  is_ayosehat: number
  customers: Array<{
    id: number
    name: string
    address: string
    customer_vendors: {
      customer_id: number
      vendor_id: number
    }
  }>
  mapping_entity: null
}

export type TEntityVendor = {
  id: number
  code: string
  name: string
  address: string
}

export type TEntityCustomer = {
  id: number
  code: string
  name: string
  address: string
  is_open_vial: boolean
  activities: Array<{
    id: number
    name: string
  }> | null
  customer_vendors: {
    is_consumption: number
    is_distribution: number
    is_extermination: number
  }
  entity_tags: {
    id: number
    title: string
  }[]
  mapping_entity: string | null
  [key: string]: any
}

export type TFilter = {
  keyword?: string
  type?: string
  entity_tag?: string
}

export type TEntityMasterMaterial = {
  entity_master_material_activities_id: number
  available: number
  id: number
  entity_material_id: number
  activity_id: number
  consumption_rate: number | null
  retailer_price: number | null
  tax: number | null
  min: number
  max: number
  allocated: number
  stock_on_hand: number
  created_by: number | null
  updated_by: number | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  entity_master_material: {
    stock_update?: string | null
    id: number
    material_id: number
    entity_id: number
    min: number
    max: number
    allocated_stock: number
    on_hand_stock: number
    stock_last_update: string | null
    total_open_vial: number
    updated_at: string | null
  }
  activity: {
    id: number
    name: string | null
  }
  user_updated_by: null | {
    id: number
    firstname: string | null
    lastname: string | null
  }
  unit_of_distribution: string | null
  code: string | null
  description: string | null
  pieces_per_unit: number
  unit: string | null
  temperature_sensitive: number
  managed_in_batch: number
  status: number
  is_vaccine: number
  is_stockcount: number
  is_addremove: number
  is_openvial: number
  kfa_code: string | null
  need_sequence: string | null
  parent_id: string | null
  kfa_level_id: number
  material_id: { label: string; value: number } | number | null
  name: string | null
  temperature_min: number | null
  temperature_max: number | null
}

export type TMaterialEntity = {
  material_id: number
  name: string
  min_temperature: number
  max_temperature: number
  entity_master_materials: TEntityMasterMaterial[]
} | null

export type TPayloadMaterialEntity = {
  id?: number
  entity_master_material_activities_id?: number
  material_id: number
  activity_id: number
  entity_id: number
  min: string
  max: string
  consumption_rate: number
  retailer_price: number
  tax: number
  entity_material_id?: number
}

export type TDetailCoreEntity = {
  id: number
  code: string
  name: string
  type: number
  status: number
  address: string
  country: string
  province_id: null
  regency_id: null
  sub_district_id: null
  village_id: null
  postal_code: null
  lat: null
  lng: string
  is_puskesmas: boolean
  is_vendor: boolean
  created_by: null
  updated_by: null
  created_at: string
  updated_at: string
  entity_tag: { id: number; title: string }
  workspaces: { id: number; name: string }[]
  locations: {
    id: number
    name: string
    level: number
  }[]
}

export type TActivityImpelemtationTime = {
  id: number
  name: string
  start_date: string | null
  end_date: string | null
}

export type TUpdateMaterialEntity = {
  entity_master_material_activities_id: number | null
  activity_id:
  | { id?: number | null; name?: string | null }
  | { value?: number | null; label?: string | null }
  | null
  | undefined
  entity_id: number | null
  min: number | null
  max: number | null
  consumption_rate: number | null
  retailer_price: number | null
  tax: number | null
  material_id: { label: string; value: number } | number | null
  entity_material_id: number | null
}

export type TEntityActivity = {
  end_date: string
  entity_activity_id: number
  id: number
  is_ordered_purchase: 0 | 1
  is_ordered_sales: 0 | 1
  name: string
  start_date: string
}
