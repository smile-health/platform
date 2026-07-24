import { OptionType } from '#components/react-select'

export type StorageTemperatureMonitoringListFilterValues = {
  keyword?: string
  asset_types?: OptionType[]
  manufactures?: OptionType[]
  relation?: OptionType
  operational_status?: OptionType
  province?: OptionType
  city?: OptionType
  primary_healthcare?: OptionType
  entity_tags?: OptionType[]
  temperature_filter?: OptionType
  asset_models?: OptionType[]
}
