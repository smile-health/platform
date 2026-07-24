import { OptionType } from '#components/react-select'

export type ExcursionDuration =
  | 'less_than_one_hour'
  | 'one_to_ten_hours'
  | 'more_than_ten_hours'

export type TemperatureRangeValue = '2_to_8' | 'minus_25_to_minus_15'

export type WhoPqsStatus = '1' | '0'

// =============================================

export type DashboardFilterValues = {
  from?: string
  to?: string
  province?: OptionType
  regency?: OptionType
  entity?: OptionType
  entity_tag?: OptionType[]
  asset_model?: OptionType[]
}

export type ExcursionFilterValues = {
  excursion_durations: OptionType[]
  temp_min_max: OptionType | null
  is_pqs: WhoPqsStatus | null
}

// =============================================

export type GetColdStorageParams = {
  entity_tag?: Array<{
    label: string
    value: string
  }>
  from?: string
  to?: string
  model_ids?: string
  province?: {
    label: string
    value: string
  }
  regency?: {
    label: string
    value: string
  }
  entity?: {
    label: string
    value: string
  }
}

export type GetExcursionParams = GetColdStorageParams & {
  asset_model?: OptionType[]
  date?: {
    start: string
    end: string
  }
  excursion_durations?: string
  temp_min_max?: string
  is_pqs?: string
}

// =============================================

export type GetColdStorageResponse = {
  avg_offline_duration_daily: AvgOfflineDurationDaily[]
  rtmd_status: RtmdStatus[]
  rtmd_total: RtmdTotal
  updated_at: string
  vaccine_coldstorage: VaccineColdstorage
}

export type AvgOfflineDurationDaily = {
  between_one_ten_hour: number
  less_than_one_hour: number
  logger_date: string
  more_than_ten_hour: number
  total_between_one_ten_hour: number
  total_less_than_one_hour: number
  total_more_than_ten_hour: number
}

export type RtmdStatus = {
  asset_type: string
  id: number
  max_temp: number | null
  min_temp: number | null
  offline: number
  online: number
  total: number
  total_offline: number
  total_online: number
}

export type RtmdTotal = {
  online: number
  total: number
}

export type VaccineColdstorage = {
  rtmd: number
  total: number
}

// =============================================

export type GetExcursionResponse = {
  temp_status: TempStatus[]
  total_asset: TotalAsset[]
  total_entities: TotalEntities
  total_events_by_asset: TotalEventsByAsset[]
  total_events_by_category: TotalEventsByCategory[]
  updated_at: string
}

export type TempStatus = {
  between_temp: number
  duration_between_temp: number
  duration_less_than_temp: number
  duration_more_than_temp: number
  duration_normal_temp: number
  duration_offline: number
  entities: number
  entity_id: number
  hour_diff: number
  less_than_temp: number
  more_than_temp: number
  name: string
  normal_temp: number
  offline: number
  rtmd: number
}

export type TotalAsset = {
  between_temp: number
  less_than_temp: number
  more_than_temp: number
  week: number
  year: number
}

export type TotalEntities = {
  between_temp: {
    percentage: number
    total: number
  }
  less_than_temp: {
    percentage: number
    total: number
  }
  more_than_temp: {
    percentage: number
    total: number
  }
  total: number
}

export type TotalEventsByAsset = {
  asset_type: string
  between_temp: number
  less_than_temp: number
  max_temp: number | null
  min_temp: number | null
  more_than_temp: number
  type_id: number
}

export type TotalEventsByCategory = {
  between_temp: number
  less_than_temp: number
  more_than_temp: number
  week: number
  year: number
}
