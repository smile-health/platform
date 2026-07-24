import { getReactSelectValue } from '#utils/react-select'

import { TDashboardAsikFilter } from './dashboard-asik.type'

export function handleFilter(filter: TDashboardAsikFilter) {
  return {
    from: filter?.period?.start?.toString(),
    to: filter?.period?.end?.toString(),
    target_year: getReactSelectValue(filter?.year),
    activity_id: getReactSelectValue(filter?.activity),
    material_type_id: getReactSelectValue(filter?.material_type),
    material_level_id: getReactSelectValue(filter?.material_level),
    material_id: getReactSelectValue(filter?.material),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    entity_tag_ids: getReactSelectValue(filter?.entity_tags),
  }
}
