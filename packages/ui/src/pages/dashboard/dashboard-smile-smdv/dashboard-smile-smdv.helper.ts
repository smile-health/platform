import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import { Values } from 'nuqs'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

dayjs.extend(localeData)

export function handleFilter(filter: Values<Record<string, any>>) {
  const newFilter = {
    page: filter?.page,
    paginate: filter?.paginate,
    activity_id: getReactSelectValue(filter?.activity_id),
    from: filter?.period?.start?.toString() ?? undefined,
    to: filter?.period?.end?.toString() ?? undefined,
    province_ids: getReactSelectValue(filter?.province_ids),
    regency_ids: getReactSelectValue(filter?.regency_ids),
    entity_ids: getReactSelectValue(filter?.entity_ids),
    entity_tag_ids: getReactSelectValue(filter?.entity_tag_ids),
    material_ids: getReactSelectValue(filter?.material_ids) ?? undefined,
    order_status: getReactSelectValue(filter?.order_status),
    material_type_ids: getReactSelectValue(filter?.material_type_id),
  }

  return removeEmptyObject(newFilter)
}
