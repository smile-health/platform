import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import { Values } from 'nuqs'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { OptionType } from '#components/react-select'

dayjs.extend(localeData)

export function handleFilter(filter: Values<Record<string, any>>) {
  const newFilter = {
    page: filter?.page,
    paginate: filter?.paginate,
    activity_id: getReactSelectValue(filter?.activity),
    year: filter?.periode?.start
      ? Number(dayjs(filter?.periode?.start).format('YYYY'))
      : undefined,
    start_date: filter?.periode?.start ?? undefined,
    end_date: filter?.periode?.end ?? undefined,
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    entity_tag_id: getReactSelectValue(filter?.entity_tag),
  }

  return removeEmptyObject(newFilter)
}

export function getMonthNamesInRange(
  startDate: string,
  endDate: string
): OptionType[] {
  const start = dayjs(startDate).month()
  const end = dayjs(endDate).month()
  const months: OptionType[] = []

  let index = start
  let current = dayjs(startDate)

  while (index <= end) {
    months.push({
      label: current.format('MMMM'),
      value: current.format('YYYY-MM'),
    })
    index++
    current = current.add(1, 'month')
  }

  return months
}
