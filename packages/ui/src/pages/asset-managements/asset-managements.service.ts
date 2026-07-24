import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { Color } from '#types/component'
import { TProgram } from '#types/program'
import { TUser } from '#types/user'
import { handleAxiosResponse } from '#utils/api'

import { RELATION_TYPE } from './asset-managements.constants'
import {
  TAddRTMDRelationPayload,
  TRelationResponse,
} from './asset-managements.types'
import { WorkingStatusEnum } from './storage-temperature-monitoring/StorageTemperatureMonitoringList/storage-temperature-monitoring-list.constants'

const SERVICE = SERVICE_API.CORE

export type TRelationType =
  | RELATION_TYPE.TEMPERATURE_MONITORING_DEVICE
  | RELATION_TYPE.OPERATIONAL_ASSET_INVENTORY
  | RELATION_TYPE.STORAGE_TEMPERATURE_MONITORING

export type WorkingStatusOption = {
  value: WorkingStatusEnum
  label: string
  color: Color
}

export type TSupportData = {
  id: number
  name: string
}

export type TListSupportDataResponse = TCommonResponseList & {
  data: TSupportData[]
  statusCode: number
}

export type TListUserResponse = TCommonResponseList & {
  data: TUser[]
  statusCode: number
}

export interface TLatestLog {
  temp: number
  humidity: number
  updated_at: string
  min_temp: any
  max_temp: any
}

export interface TParentTemp {
  asset_name: string
  id: number
  serial_number: string
  child_pos: any
  working_status: string
  min_temp: number
  max_temp: number
  min_temp_2: any
  max_temp_2: any
  min_temp_3: any
  max_temp_3: any
  asset_type: TSupportData
  asset_model: TSupportData | null
  manufacture: TSupportData
}
export interface TStorageTemperatureMonitoringData {
  id: number
  serial_number: string
  prod_year: string
  temp: number
  manufacture_id: number | null
  entity_id: number
  name: any
  type_id: number
  status: number
  lat: any
  lng: any
  model_id: number | null
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
  user_updated_by: UpdatedBy
  working_status: string
  parent_id: number
  child_pos: number
  budget_year: number
  budget_src: number
  max_temp: any
  min_temp: any
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
  battery: number
  signal: number
  power: boolean
  deleted_reason: any
  asset_vendor_id: number | null
  asset_communication_provider_id: number | null
  ownership_qty: any
  ownership_status: any
  borrowed_from: any
  electricity_available_id: any
  logger_status_id: number | null
  logger_status: string | null
  coldchain_capacity_equipment_id: any
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
  asset_model: AssetModel | null
  manufacture: Manufacture | null
  maintenance_schedule: any
  calibration_schedule: any
  childs: TChilds[] | []
  budget_source: any
  asset_status: TSupportData
  unused_reason: any
  asset_communication_provider: TSupportData
  asset_vendor: TSupportData
  borrowed_entity: any
  asset_electricity: any
  coldchain_capacity_equipment: any
  parent: TParentTemp
  maintainers: Maintainer[]
  offline: number
  latest_log: TLatestLog
}

export type TChilds = {
  id: number
  serial_number: string
  temp: any
  min_temp: number
  max_temp: number
  updated_at: string
  other_model_asset: any
  other_manufacture: any
  manufacture: TManufactureChild
  asset_model: TAssetModelChild
  latest_log: TLatestLog
  power: boolean
  signal: number | null
  status_device: boolean
  battery: number
}

export type TManufactureChild = {
  id: number
  name: string
  reference_id: string
  description: string
  contact_name: string
  phone_number: string
  email: any
  address: any
  village_id: string
  created_by: number
  updated_by: number
  deleted_by: any
  type: number
  created_at: string
  updated_at: string
  deleted_at: any
}

export type TAssetModelChild = {
  id: number
  name: string
  capacity: number
  created_at: string
  updated_at: string
  deleted_at: any
  updated_by: number
  created_by: number
  only_logger: number
  capacity_gross: number
  capacity_nett: number
  capacity_gross_2: any
  capacity_nett_2: any
  capacity_gross_3: any
  capacity_nett_3: any
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
  updated_by: number | null
  created_by: number | null
  min_temp: number | null
  max_temp: number | null
  min_temp_2: number | null
  max_temp_2: number | null
  min_temp_3: number | null
  max_temp_3: number | null
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
  lastname: any
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
  fcm_token: string
}

export type TAncientResponse = {
  page: string | number
  perPage: string | number
  total: number
  statusCode: number
  list: Array<any>
}

export type TListStorageTemperatureMonitoringResponse = TCommonResponseList & {
  data: TStorageTemperatureMonitoringData[]
  statusCode: number
}

export type TAssetInventory = {
  id: number
  serial_number: string
  production_year: number
  created_at: string
  updated_at: string
  asset_model: {
    id: number
    name: string
    net_capacity: number
    gross_capacity: number
  }
  asset_type: {
    id: number
    name: string
    min_temperature: number
    max_temperature: number
  }
  manufacture: {
    id: number
    name: string
  }
  working_status: {
    id: number
    name: string
  }
  entity: {
    id: number
    name: string
    is_puskesmas: number
  }
  entity_tag: {
    id: number
    title: string
  }
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
    name: any
  }
  village: {
    id: string
    name: any
  }
  contact_person: {
    first: {
      id: number
      name: string
      number: string
    }
    second: {
      id: number
      name: string
      number: string
    }
    third: {
      id: number
      name: string
      number: string
    }
  }
  ownership: {
    id: number
    name: string
    qty: number
  }
  borrowed_from: {
    id: number
    name: string
  }
  budget_source: {
    id: number
    name: string
    year: number
  }
  electricity: {
    id: number
    name: string
  }
  warranty: {
    asset_vendor_id: number
    asset_vendor_name: string
    start_date: string
    end_date: string
  }
  calibration: {
    asset_vendor_id: number
    asset_vendor_name: string
    last_date: string
    schedule_id: number
    name: string
  }
  maintenance: {
    asset_vendor_id: number
    asset_vendor_name: string
    last_date: string
    schedule_id: number
    name: string
  }
  status: {
    id: number
    name: string
  }
  programs: TProgram[]
  user_created_by: {
    id: number
    username: string
    firstname: string
    lastname: any
  }
  user_updated_by: {
    id: number
    username: string
    firstname: string
    lastname: any
  }
  other_asset_model_name?: string
  other_asset_type_name?: string
  other_budget_source_name?: string
  other_gross_capacity?: number
  other_manufacture_name?: string
  other_max_temperature?: number
  other_min_temperature?: number
  other_net_capacity?: number
  other_borrowed_from_entity_name?: string
}

// Asset Params
export type ListStorageTemperatureMonitoringParams = {
  page: number
  paginate: number
  keyword?: string
  asset_type_ids?: number[]
  manufacture_ids?: number[]
  is_device_related?: string | boolean
  rtmd_status?: string
  province_id?: number
  city_id?: number
  health_center_id?: number
  entity_tag_ids?: number[]
  temperature_filter?: string
  asset_model_ids?: number[]
}

export const listRelationDevice = async ({
  id,
  type,
}: {
  id: number
  type: TRelationType
}) => {
  const fetchListTempLogger = await axios.get(
    `${SERVICE}/${type === RELATION_TYPE.TEMPERATURE_MONITORING_DEVICE ? 'asset-inventories' : 'asset-monitoring-devices'}/${id}/${type}`,
    {
      cleanParams: true,
    }
  )
  const result = handleAxiosResponse<TRelationResponse>(fetchListTempLogger)
  return result
}

export const upsertLoggerRelation = async (
  id: number,
  data?: TAddRTMDRelationPayload
) => {
  const result = await axios.put(
    `${SERVICE}/asset-inventories/${id}/rtmds`,
    data,
    {
      cleanParams: true,
    }
  )

  return result?.data
}
