import { TSingleOptions } from '#types/common'
import { TFunction } from 'i18next'

export interface TLatestLog {
  temp?: number
  updated_at: string
}

export interface TParentTemp {
  max_temp?: number
  min_temp?: number
}
export interface TAssetData {
  id: number
  si_no: number
  serial_number: string
  prod_year: string
  temp: number | null
  manufacture_id: number
  entity_id: number
  name: any
  type_id: number
  status: number
  lat: any
  lng: any
  model_id: number
  created_at: string
  updated_at: string
  deleted_at: any
  domain_name: any
  activity_status: any
  activity_time: any
  activity_duration: any
  alarm_status: any
  alarm_type: any
  alarm_updated_at: any
  alarm_duration: any
  power_available: any
  power_updated_at: any
  created_by: CreatedBy
  updated_by: UpdatedBy
  working_status: string
  parent_id: any
  child_pos: any
  budget_year: number
  budget_src: number
  max_temp: number
  min_temp: number
  other_type_asset: any
  other_min_temp: any
  other_max_temp: any
  other_model_asset: any
  other_capacity_nett: any
  other_capacity_gross: any
  other_manufacture: any
  other_budget_src: any
  unused_reason_id: any
  is_stock_opname: number
  working_status_id: number
  status_device: boolean
  battery: any
  signal: any
  power: any
  deleted_reason: any
  asset_vendor_id: any
  asset_communication_provider_id: any
  ownership_qty: any
  ownership_status: number
  borrowed_from: any
  electricity_available_id: number
  logger_status_id: any
  logger_status: any
  coldchain_capacity_equipment_id: number | null
  warranty_start_date: any
  warranty_end_date: any
  maintenance_schedule_id: any
  last_maintenance_date: any
  calibration_schedule_id: any
  last_calibration_date: any
  max_temp_2: any
  min_temp_2: any
  max_temp_3: any
  min_temp_3: any
  entity: Entity
  asset_type: AssetType
  asset_model: AssetModel
  manufacture: Manufacture
  maintenance_schedule: any
  calibration_schedule: any
  budget_source: BudgetSource
  asset_status: AssetStatus
  unused_reason: any
  asset_communication_provider: any
  asset_vendor: any
  borrowed_entity: any
  asset_electricity: AssetElectricity
  coldchain_capacity_equipment: ColdchainCapacityEquipment | null
  parent: TParentTemp | null
  maintainers: Maintainer[] | null
  offline: number
  latest_log: TLatestLog | null
}

export interface CreatedBy {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string | null
  gender: number
  date_of_birth: any
  mobile_phone: any
  role: number
  village_id: any
  entity_id: number
  timezone_id: any
  created_by: number
  updated_by: number
  status: number
  last_login: string
  last_device: number
  created_at: string
  updated_at: string
  address: any
  view_only: number
  change_password: number
  manufacture_id: any
  fcm_token: any
}

export interface UpdatedBy {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string | null
  gender: number
  date_of_birth: any
  mobile_phone: any
  role: number
  village_id: any
  entity_id: number
  timezone_id: any
  created_by: number
  updated_by: number
  status: number
  last_login: string
  last_device: number
  created_at: string
  updated_at: string
  address: any
  view_only: number
  change_password: number
  manufacture_id: any
  fcm_token: any
}

export interface Entity {
  id: number
  name: string
  address: string
  code: string
  village_id: any
  region_id: any
  province_id: string
  regency_id: string
  sub_district_id: string | null
  created_by: number
  updated_by: number
  deleted_by: any
  type: number
  is_vendor: number
  created_at: string
  updated_at: string
  deleted_at: any
  province: Province
  regency: Regency
  sub_district: SubDistrict | null
}

export interface Province {
  id: string
  name: string
  created_at: string
  updated_at: string
  deleted_at: any
}

export interface Regency {
  id: string
  name: string
  province_id: string
  created_at: string
  updated_at: string
  deleted_at: any
  provinceId: string
}

export interface SubDistrict {
  id: string
  name: string
  regency_id: string | null
  created_at: string
  updated_at: string
  deleted_at: any
  regencyId: string | null
}

export interface AssetType {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: any
  updated_by: number
  created_by: number
  min_temp: number
  max_temp: number
  min_temp_2: any
  max_temp_2: any
  min_temp_3: any
  max_temp_3: any
  is_coldstorage: number
  is_electricity: number
  description: any
  is_selection: boolean
  treshold_temperatures: any
}

export interface AssetModel {
  id: number
  name: string
  capacity: number
  created_at: string
  updated_at: string
  deleted_at: any
  updated_by: any
  created_by: any
  only_logger: number
  capacity_gross: number
  capacity_nett: number
  capacity_gross_2: any
  capacity_nett_2: any
  capacity_gross_3: any
  capacity_nett_3: any
}

export interface Manufacture {
  id: number
  name: string
  reference_id: any
  description: any
  contact_name: any
  phone_number: any
  email: any
  address: any
  village_id: any
  created_by: any
  updated_by: any
  deleted_by: any
  type: number
  created_at: string
  updated_at: string
  deleted_at: any
}

export interface BudgetSource {
  id: number
  name: string
}

export interface AssetStatus {
  id: number
  name: string
}

export interface AssetElectricity {
  id: number
  name: string
}

export interface ColdchainCapacityEquipment {
  id: number
  code_pqs: string
  capacity_nett_at_plus_5_c: number
  capacity_nett_at_minus_20_c: number
  capacity_nett_at_minus_86_c: number
  status: boolean
  created_by: any
  updated_by: number
  deleted_by: any
  created_at: string
  updated_at: string
  deleted_at: any
  type_pqs_id: number
  designation_cceigat_id: number
  type_pqs: TypePqs
  designation_cceigat: DesignationCceigat
}

export interface TypePqs {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: any
}

export interface DesignationCceigat {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: any
}

export interface Maintainer {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string | null
  gender: number | null
  date_of_birth: any
  mobile_phone: any
  role: number | null
  village_id: any
  entity_id: number | null
  timezone_id: number | null
  created_by: number
  updated_by: number
  status: number | null
  last_login: string | null
  last_device: number | null
  created_at: string
  updated_at: string
  address: any
  view_only: number | null
  change_password: number | null
  manufacture_id: any
  fcm_token: any
}

export type TAncientResponse = {
  page: string | number
  perPage: string | number
  total: number
  statusCode: number
  list: Array<any>
}

export type ListAssetResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: Array<number>
  data: TAssetData[]
  statusCode: number
  message?: string
  error?: string
}

// Asset Params
export type ListAssetParams = {
  page: number
  paginate: number
  keyword?: string
  manufacture_id?: TSingleOptions | number
  entity_tag_id?: TSingleOptions | number
  entity_id?: TSingleOptions | number
  province_id?: TSingleOptions | number
  regency_id?: TSingleOptions | number
  model_id?: TSingleOptions | number
  logger_status_id?: TSingleOptions | number
  only_type_logger?: TSingleOptions | number
  temp_logger?: TSingleOptions | number
  relation_asset?: TSingleOptions | number
}

// Asset Other Needs
export type TAssetMainColumn = {
  t: TFunction<['common', 'asset']>
  language: string
}
