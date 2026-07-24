import { OptionType } from '#components/react-select'

import {
  TDefaultObject,
  THumidityThreshold,
  TRelationData,
  TTemperatureThreshold,
} from '../../asset-managements.types'

export type StorageTemperatureMonitoringDetailHistory = {
  id: number
  asset_rtmd_id: number
  latitude: number | null
  longitude: number | null
  temperature: number | null
  humidity: number | null
  battery: number | null
  signal: number | null
  device_status: number
  is_power_connected: number | boolean | null
  actual_time: string
  created_at: string
  updated_at: string
  device_serial: string
  working_status: {
    id: number
    name: string
  }
  other_temperature_capacity: {
    id: number
    gross_capacity: number | null
    net_capacity: number | null
  } | null
  other_temperature_threshold: {
    other_min_temperature: number | null
    other_max_temperature: number | null
    other_min_threshold: number | null
    other_max_threshold: number | null
  } | null
  rtmd_status: {
    id: number
    name: string
  }
  temperature_capacity: {
    id: number
    gross_capacity: number | null
    net_capacity: number | null
  }
  temperature_threshold: {
    min_temperature: number | null
    max_temperature: number | null
    min_threshold: number | null
    max_threshold: number | null
  }
}

export type StorageTemperatureMonitoringChartData = {
  id: number
  asset_rtmd_id: number
  latitude: number | null
  longitude: number | null
  temperature: number | null
  humidity: number | null
  battery: number | null
  signal: number | null
  device_status: number
  is_power_connected: number | null
  actual_time: string
  created_at: string
  updated_at: string
  device_serial: string
  temperature_threshold: TTemperatureThreshold | null
  humidity_threshold: THumidityThreshold | null
  other_temperature_capacity: number | null
  other_temperature_threshold: number | null
}

export type StorageTemperatureMonitoringDetailFilterHistoryValues = {
  logger_id?: OptionType
  date_range?: any
}

export interface StorageTemperatureMonitoringDetail {
  asset_model: AssetModel
  asset_type: AssetType
  budget_source: BudgetSource
  contact_persons: ContactPerson[]
  communication_provider: CommunicationProvider
  created_at?: Date
  current_temp?: number
  entity: Entity
  id: number
  manufacture?: TDefaultObject
  production_year?: number
  serial_number: string
  updated_at?: string
  updated_by?: UpdatedBy
  rtmd_devices?: TRelationData[]
  working_status?: TDefaultObject
  province?: TDefaultObject
  regency?: TDefaultObject
  other_asset_model_name: string | null
  other_asset_type_name: string | null
  other_budget_source_name: string | null
  other_manufacture_name: string | null
  other_min_temperature: number | null
  other_max_temperature: number | null
  other_gross_capacity: number | null
  other_net_capacity: number | null
  budget_year?: number
  user_updated_by?: UpdatedBy
  user_created_by?: UpdatedBy
}

export interface BudgetSource {
  id?: number
  name?: string
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

export interface CommunicationProvider {
  id?: number
  name?: string
}

export interface UpdatedBy {
  firstname: string
  fullname: string
  id: number
  lastname: string
  username: string
}
