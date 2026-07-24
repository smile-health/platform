import { ColumnDef } from '@tanstack/react-table'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectLabel, getReactSelectValue } from '#utils/react-select'
import { Values } from 'nuqs'

import { SummaryListItem } from './dashboard-stock-taking.type'

type ObjectDetail<T, S> = {
  isLoading: boolean
  isLoadingSummary?: boolean
  table?: T
  summary?: S
  columns?: Array<ColumnDef<any>>
  onExport?: VoidFunction
}

type MyHookReturn<T, S> = readonly [
  (param?: string | number | boolean) => void,
  Readonly<ObjectDetail<T, S>>,
]

export function createHookReturn<T, S>(
  fn: (param?: string | number | boolean) => void,
  table: T,
  isLoading: boolean,
  isLoadingSummary?: boolean,
  summary?: S,
  columns?: Array<ColumnDef<any>>,
  onExport?: VoidFunction
): MyHookReturn<T, S> {
  return [
    fn,
    {
      isLoading,
      isLoadingSummary,
      table,
      summary,
      columns,
      onExport,
    },
  ]
}

export function handleFilter(filter: Values<Record<string, any>>) {
  const newFilter = {
    period_id: filter?.period?.value?.id,
    from: filter?.period?.value?.start
      ? `${filter?.period?.value?.start} 00:00:00`
      : null,
    to: filter?.period?.value?.end
      ? `${filter?.period?.value?.end} 23:59:59`
      : null,
    activity_ids: getReactSelectValue(filter?.activity),
    material_level_id: '2',
    material_type_ids: getReactSelectValue(filter?.material_type),
    material_ids: getReactSelectValue(filter?.material),
    batch_code: getReactSelectLabel(filter?.batch),
    start_expired_date: filter?.expired?.start
      ? `${filter?.expired?.start} 00:00:00`
      : null,
    end_expired_date: filter?.expired?.end
      ? `${filter?.expired?.end} 23:59:59`
      : null,
    entity_tag_ids: getReactSelectValue(filter?.entity_tags),
    province_ids: getReactSelectValue(filter?.province),
    regency_ids: getReactSelectValue(filter?.regency),
    entity_ids: getReactSelectValue(filter?.entity),
  }

  return removeEmptyObject(newFilter)
}

export function generateSummary<T>(
  data?: T[],
  list?: SummaryListItem[],
  nameKey = 'entity_tag.name'
) {
  return data?.map((_item) => {
    return {
      name: eval(`_item.${nameKey}`),
      list: list?.map((el) => ({
        title: el?.title,
        value: eval(`_item.${el.valueKey}`),
        ...(el.percentageKey && {
          percentage: eval(`_item.${el.percentageKey}`),
        }),
        colorClass: el.colorClass,
      })),
    }
  })
}
