export type MaterialDisposal = {
  id: number
  name: string
  code: string
  hierarchy_code: string | null
  material_level_id: number
  min_temperature: number
  max_temperature: number
  status: number
  material_activities: MaterialActivity[]
  material_type: MaterialType
}

type MaterialActivity = {
  id: number
  name: string
  material_id: number
  is_ordered_purchase: number
  is_ordered_sales: number
  is_sequence: number
  is_patient: number
}

type MaterialType = {
  id: number
  name: string
}

export type ActivityDisposal = {
  id: number
  name: string
  code: string | null
  is_ordered_sales: number
  is_ordered_purchase: number
  created_by: number
  updated_by: number
  deleted_by: string | null
  is_patient_id: number
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export type BatchDisposal = {
  manufacture_name: string
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_id: number
  status: number
}

export type EntityTagDisposal = {
  id: number
  title: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export type EntityDisposal = {
  type_label: string
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  province_id: string | null
  regency_id: string | null
  village_id: string | null
  sub_district_id: string | null
  lat: string | null
  lng: string | null
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string  | null
  is_ayosehat: number
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
  entity_tags: EntityTag[]
}

type EntityTag = {
  id: number
  entity_entity_tags: EntityEntityTags
}

type EntityEntityTags = {
  entity_id: number
  entity_tag_id: number
}

export type ProvinciesDisposal = {
  id: string
  name: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export type RegenciesDisposal = {
  id: string
  name: string
  province_id: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  provinceId: string
}

export type CustomerDisposal = {
  id: number
  code: string
  name: string
  address: string
  users: User[]
  entity_tags: EntityTag[]
  mapping_entity: null | string
  customer_vendors: CustomerVendors
}

type User = {
  id: number
  username: string
  firstname: string
  lastname?: string
  mobile_phone: null | string
}

type CustomerVendors = {
  is_consumption: number
  is_distribution: number
  is_extermination: number
}
