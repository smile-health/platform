import {
  THumidityThreshold,
  TTemperatureThreshold,
} from '../../asset-managements.types'

export interface StorageTemperatureMonitoringModel {
  id: number
  serial_number: string
  created_at: string
  updated_at: string
  asset_model: AssetModel
  asset_type: AssetType
  manufacture: Manufacture
  working_status: WorkingStatus
  entity: Entity
  province: Province
  regency: Regency
  rtmd_devices: RtmdDevice[]
  user_updated_by: UserUpdatedBy
  other_asset_model_name: string | null
  other_asset_type_name: string | null
  other_borrowed_from_entity_name: string | null
  other_budget_source_name: string | null
  other_manufacture_name: string | null
}

interface AssetModel {
  id: number
  name: string
}

interface AssetType {
  id: number
  name: string
  temperature_thresholds: TTemperatureThreshold[]
  humidity_thresholds: THumidityThreshold[]
}

interface Manufacture {
  id: number
  name: string
}

interface WorkingStatus {
  id: number
  name: string
}

interface Entity {
  id: number
  name: string
  is_puskesmas: number
}

interface Province {
  id: string
  name: string
}

interface Regency {
  id: string
  name: string
}

interface RtmdDevice {
  id: number
  serial_number: string
  sensor_qty: number
  asset_model: AssetModel
  asset_type: AssetType
  manufacture: Manufacture
  latest_log: LatestLog
  other_asset_model_name?: string | null
  other_manufacture_name?: string | null
  description?: string | null
}

interface LatestLog {
  temperature: number
  humidity: number
  battery: number
  signal: number
  device_status: number
  is_power_connected: number
  updated_at: string
  actual_time: string
}

interface UserUpdatedBy {
  id: number
  username: string
  firstname: string
  lastname: string
  fullname: string
}
