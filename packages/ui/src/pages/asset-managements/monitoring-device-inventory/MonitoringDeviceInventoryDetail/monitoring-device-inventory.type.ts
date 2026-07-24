import {
  THumidityThreshold,
  TTemperatureThreshold,
} from '../../asset-managements.types'

export interface MonitoringDeviceInventoryDetail {
  asset_model: AssetModel
  asset_type: AssetType
  asset_vendor?: AssetVendor
  battery_percent?: number
  budget_source?: BudgetSource
  budget_year?: number
  contact_persons: ContactPerson[]
  communication_provider: CommunicationProvider
  created_at?: Date
  current_temp?: number
  entity: Entity
  id: number
  is_offline?: boolean
  is_power_available?: boolean
  manufacturer?: Manufacturer
  rtmd_status?: RtmdStatus
  device_status?: DeviceStatus
  production_year?: number
  serial_number: string
  signal_strength?: number
  updated_at?: string
  updated_by?: UpdatedBy
  other_min_temperature?: number
  other_max_temperature?: number
}

export interface AssetModel {
  id?: number
  name?: string
}

export interface AssetType {
  id?: number
  name?: string
  temperature_thresholds?: TTemperatureThreshold[]
  humidity_thresholds?: THumidityThreshold[]
  is_warehouse?: number
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
  address?: string
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

export interface RtmdStatus {
  id: number
  name: string
}

export interface DeviceStatus {
  id: number
  name: string
}

export interface CommunicationProvider {
  id?: number
  name?: string
}

export interface UpdatedBy {
  id?: number
  name?: string
}
