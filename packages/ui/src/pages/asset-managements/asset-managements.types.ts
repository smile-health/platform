import { OptionType } from '#components/react-select'
import { TCommonResponseList } from '#types/common'

import { AssetType } from './monitoring-device-inventory/MonitoringDeviceInventoryDetail/monitoring-device-inventory.type'

export type TAddRTMDRelationPayload = {
  id: number
  sensor_qty?: number
  description?: string | null
}[]

export type TDefaultObject = {
  id?: string | number
  name?: string
}

export type TRelationResponse = TCommonResponseList & {
  statusCode: number
  data: TRelationData[]
}

export type TCreateLoggerSubmit = {
  monitoring_device: OptionType | null
  sensor_qty: OptionType | null
}

export type TCreateLoggerPayload = {
  id: number
  sensor_qty: number
}[]

export type TCreateWarehouseSubmit = {
  monitoring_device: OptionType | null
  description?: string | null
}

export type TCreateWarehousePayload = {
  id: number
  description?: string | null
}[]

export type TRelationData = {
  id: number
  sensor_qty: number
  serial_number: string
  asset_model: TDefaultObject
  asset_type: AssetType
  manufacture: TDefaultObject
  description?: string | null
  latest_log: {
    temperature: number
    updated_at: string
    actual_time: string | null
    battery?: number | null
    device_status?: number | null
    humidity?: number | null
    is_power_connected?: number | null
    signal?: number | null
  }
}

export type TTemperatureThreshold = {
  min_temperature: number
  max_temperature: number
  is_active?: number | null
}

export type THumidityThreshold = {
  asset_type_humidity_id: number | null
  asset_type_id: number | null
  humidity_threshold_id: number | null
  min_humidity: number | null
  max_humidity: number | null
  is_active?: number | null
}
