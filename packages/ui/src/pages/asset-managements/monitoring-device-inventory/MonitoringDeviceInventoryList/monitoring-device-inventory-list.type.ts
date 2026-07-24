import { OptionType } from '#components/react-select'

export enum OperationalStatusEnum {
  ACTIVE = 1,
  INACTIVE = 2,
  UNSUBSCRIBED = 3,
}

export type MonitoringDeviceInventoryListFilterValues = {
  keyword?: string
  manufactures?: OptionType[]
  operational_status?: OptionType
  device_status_id?: OptionType
  is_device_related?: OptionType
  asset_types?: OptionType[]
  working_status?: OptionType
  rtmd_status?: OptionType
  province?: OptionType
  city?: OptionType
  health_center?: OptionType
  entity_tag?: OptionType[]
  asset_model?: OptionType[]
}

export type MonitoringDeviceInventoryListItem = {
  asset_model: AssetModel
  asset_status: AssetStatus
  asset_type: AssetType
  asset_vendor?: AssetVendor
  battery_percent?: number
  budget_source?: BudgetSource
  budget_year?: number
  created_at?: Date
  current_temp?: number
  entity: Entity
  id: number
  is_offline?: number
  is_power_available?: boolean
  rtmd_status?: OperationalStatus
  manufacturer?: Manufacturer
  production_year?: string
  serial_number: string
  signal_strength?: number
  device_status?: { id: number; name: string }
  updated_at?: Date
  updated_by?: UpdatedBy
  other_asset_model_name?: string | null
  other_manufacture_name?: string | null
}

export interface AssetModel {
  id?: number
  name?: string
}

export interface AssetStatus {
  id?: number
  name?: string
}

export interface AssetType {
  id?: number
  name?: string
}

export interface AssetVendor {
  id?: number
  name?: string
}

export interface BudgetSource {
  id?: number
  name?: string
}

export interface ContactPerson {
  id?: number
  name?: string
  phone?: string
}

export interface Entity {
  id?: number
  name?: string
  province_id?: string
  province_name?: string
  regency_id?: string
  regency_name?: string
}

export interface Manufacturer {
  id?: number
  name?: string
}

export interface WorkingStatus {
  id?: number
  name?: string
}

export interface OperationalStatus {
  id?: number
  name?: string
}

export interface UpdatedBy {
  id?: number
  name?: string
}

export interface ActiveStatus {
  id?: number
  name?: string
}

export type MonitoringDeviceInventorySortField =
  | 'serial_number'
  | 'status'
  | 'rtmd_status_name'
  | 'updated_at'
