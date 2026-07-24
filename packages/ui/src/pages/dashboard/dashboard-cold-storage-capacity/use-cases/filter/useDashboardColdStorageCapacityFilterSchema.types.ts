import { OptionType } from '#components/react-select'

export type DashboardColdStorageCapacityFilterParams = {
  period: {
    start: string
    end: string
  }
  province: OptionType
  regency: OptionType
  entity: OptionType
  entity_tag: OptionType[]
}
