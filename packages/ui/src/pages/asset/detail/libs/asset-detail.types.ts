import { OptionType } from '#components/react-select'

import { TAssetData } from '../../list/libs/asset-list.types'

// History Params
export type TFilterLoggerActivity = {
  asset: OptionType | null
  date_range: {
    start: string
    end: string
  }
  page?: number
  paginate?: number
}

export interface TListLoggerActivity {
  asset_pos: number
  asset_name: string
  id: number
  device_code: string
  temp: number
  status: number
  created_at: string
  updated_at: string
  asset_id: number
  entity_id: number
  long: number
  lat: number
  min_temp: any
  max_temp: any
  actual_date: string
  working_status: any
  logger_status: any
  asset: TAssetData
}
