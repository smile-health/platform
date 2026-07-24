import { OptionType } from '#components/react-select'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { Values } from 'nuqs'

export const generatedYearOptions = (): Array<OptionType> => {
  const currentYear = new Date().getFullYear()
  const startYear = 1990
  const options = []
  for (let i = currentYear; i >= startYear; i--) {
    options.push({ value: i, label: i.toString() })
  }
  return options
}

export function handleFilter(filter: Values<Record<string, any>>) {
  const newFilter = {
    entity_type_ids: getReactSelectValue(filter?.entity_type_ids),
    type_ids: getReactSelectValue(filter?.type_ids),
    manufacture_ids: getReactSelectValue(filter?.manufacture_ids),
    province_ids: getReactSelectValue(filter?.province_ids),
    regency_ids: getReactSelectValue(filter?.regency_ids),
    entity_ids: getReactSelectValue(filter?.entity_ids),
    entity_tag_ids: getReactSelectValue(filter?.entity_tag_ids),
    model_ids: getReactSelectValue(filter?.model_ids),
    is_deleted: filter?.is_deleted,
    power_available_ids: getReactSelectValue(filter?.power_available_ids),
    ownership_status_ids: getReactSelectValue(filter?.ownership_status_ids),
    prod_years: getReactSelectValue(filter?.prod_years),
    vendor_ids: getReactSelectValue(filter?.vendor_ids),
    communication_provider_ids: getReactSelectValue(
      filter?.communication_provider_ids
    ),
    asset_capacity_ids: getReactSelectValue(filter?.asset_capacity_ids),
    budget_years: getReactSelectValue(filter?.budget_years),
    working_status_ids: getReactSelectValue(filter?.working_status_ids),
    from: filter?.from ? `${filter?.from?.toString()}` : null,
    to: filter?.to ? `${filter?.to?.toString()}` : null,
    page: filter?.page,
    paginate: filter?.paginate,
  }

  return removeEmptyObject(newFilter)
}
