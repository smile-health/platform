import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import { Values } from 'nuqs'

function getTypeId(regency: string, entity: string) {
  if (entity) return 3
  if (regency) return 2
  return 1
}

export function handleFilter(filter: Values<Record<string, any>>) {
  const province_id = getReactSelectValue(filter?.province)
  const regency_id = getReactSelectValue(filter?.regency)
  const entity_id = getReactSelectValue(filter?.entity)

  const newFilter = {
    activity_id: getReactSelectValue(filter?.activity),
    province_id,
    regency_id,
    entity_id,
    month: dayjs(filter?.periode?.start).format('MM'),
    year: dayjs(filter?.periode?.start).format('YYYY'),
    entity_type_id: getTypeId(regency_id, entity_id),
  }

  return removeEmptyObject(newFilter)
}
