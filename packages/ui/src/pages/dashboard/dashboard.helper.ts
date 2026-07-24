import cx from '#lib/cx'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { Scale } from 'chart.js'
import { Values } from 'nuqs'

import {
  DataValue,
  TDashboardIOTCategory,
  TDashboardIOTDatasetTable,
  TDashboardIOTFilter,
  TDashboardIOTType,
} from './dashboard.type'
import { RequestloginResponse } from '#types/auth'
import { hasPermission } from '#shared/permission/index'

export function handleFilter(
  filter: Values<Record<string, any>>,
  includeTransactionType = true
) {
  const sort = {
    asc: '0',
    desc: '1',
  }

  const newFilter = {
    page: filter?.page,
    paginate: filter?.paginate,
    from: (filter?.periode_start || filter?.period?.start)?.toString(),
    to: (filter?.periode_end || filter?.period?.end)?.toString(),
    activity_ids: getReactSelectValue(filter?.activity),
    material_type_ids: getReactSelectValue(filter?.material_type),
    material_level_id: getReactSelectValue(filter?.material_level),
    material_ids: getReactSelectValue(filter?.material),
    start_expired_date: filter?.expired?.start
      ? `${filter?.expired?.start} 00:00:00`
      : null,
    end_expired_date: filter?.expired?.end
      ? `${filter?.expired?.end} 23:59:59`
      : null,
    entity_tag_ids: getReactSelectValue(filter?.entity_tags),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    information_type: filter?.informationType,
    transaction_type: includeTransactionType
      ? filter?.transaction_type
      : undefined,
    sort_by_id: sort?.[filter?.sort as keyof typeof sort],
  }

  return removeEmptyObject(newFilter)
}

export function handleMicroplanningFilter(filter: Values<Record<string, any>>) {
  const sort = {
    asc: '0',
    desc: '1',
  }

  const newFilter = {
    page: filter?.page,
    paginate: filter?.paginate,
    start_date: (filter?.periode_start || filter?.period?.start)?.toString(),
    end_date: (filter?.periode_end || filter?.period?.end)?.toString(),
    target_group: getReactSelectValue(filter?.target_group),
    gender: getReactSelectValue(filter?.gender),
    province_ids: getReactSelectValue(filter?.province),
    city_ids: getReactSelectValue(filter?.city),
    district_ids: getReactSelectValue(filter?.sub_district),
    village_ids: getReactSelectValue(filter?.village),
    material_id: getReactSelectValue(filter?.material),
    batch_ids: getReactSelectValue(filter?.batch),
    sort_by_ids: sort?.[filter?.sort as keyof typeof sort],
  }

  return removeEmptyObject(newFilter)
}

export function dataMapping(
  data: any[],
  labelKey: string | ((item: any) => string),
  valueKey = 'value'
): DataValue {
  const res = data?.map((item) => {
    const label =
      typeof labelKey === 'string'
        ? (eval(`item.${labelKey}`) ?? '-')
        : labelKey(item)

    return {
      label,
      value: item?.[valueKey] ?? 0,
    }
  })

  return res
}

export function handleFilterDashboardIOT(filter: TDashboardIOTFilter) {
  return {
    period: filter?.period?.value,
    from: filter?.range?.start?.toString(),
    to: filter?.range?.end?.toString(),
    activity_ids: getReactSelectValue(filter?.activity),
    material_type_ids: getReactSelectValue(filter?.material_type),
    material_level_id: getReactSelectValue(filter?.material_level),
    material_ids: getReactSelectValue(filter?.material),
    entity_tag_ids: getReactSelectValue(filter?.entity_tags),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    information_type: getReactSelectValue(filter?.information_type),
    reason_id: getReactSelectValue(filter?.reason),
    reason_ids: getReactSelectValue(filter?.reasons),
    transaction_type: getReactSelectValue(filter?.transaction_type),
  }
}

export function secondTopTick(scale: Scale): number {
  const ticks = scale?.ticks ?? []
  const n = ticks.length
  if (n >= 2 && typeof ticks[n - 2]?.value === 'number') {
    return ticks[n - 2].value as number
  }
  const max = scale.max ?? 0
  const min = scale.min ?? 0
  const step = n > 1 ? (max - min) / (n - 1) : max - min || 1
  return max - step // fallback kalau ticks belum tersedia/aneh
}

export function getDashboardIOTHeaders(
  categories: TDashboardIOTCategory[],
  dataTypes: TDashboardIOTType[] = []
) {
  const periodLabels =
    categories?.map((category) => ({
      label: category?.label,
      colSpan: dataTypes?.length,
      class:
        '[&:not(:last-child)]:ui-border-r ui-border-gray-300 ui-text-center',
    })) || []

  const types = periodLabels?.flatMap(() => {
    return dataTypes?.flatMap((type) => ({
      label: type?.label,
      colSpan: 1,
      class:
        '[&:not(:last-child)]:ui-border-r ui-border-gray-300 ui-text-center',
    }))
  })

  return { periodLabels, types }
}

export function getDashboardIOTDataTable({
  page,
  paginate,
  periodLabels,
  data = [],
  types = [],
  formatter,
}: {
  page: number
  paginate: number
  periodLabels: { label: string; colSpan: number; class: string }[]
  data?: TDashboardIOTDatasetTable[]
  types?: TDashboardIOTType[]
  formatter: (val: number) => string
}) {
  return data?.map((item, index) => {
    let rows = [
      {
        value: (page - 1) * paginate + (index + 1),
        class: 'ui-sticky ui-left-0 ui-min-w-14 ui-w-14',
      },
      {
        value: item?.name,
        class:
          'ui-sticky ui-left-14 ui-min-w-60 ui-w-60 ui-border-r ui-border-gray-300',
      },
    ]

    periodLabels.forEach((_, i) => {
      const p = item?.period?.[i]
      const values = types?.map((type) => ({
        value: formatter(p?.[type?.key]),
        class: cx('ui-text-center', {
          'ui-bg-sky-100': p?.[type?.key] > 0.099,
        }),
      }))

      rows = [...rows, ...values]
    })

    return rows
  })
}

export const filterOfUser = (user: RequestloginResponse) => {
  const userEntity = user?.entity
  const hasGlobalPermission = hasPermission('dashboard-enable-select-entity')

  const defaultProvince = userEntity?.province
    ? {
        value: userEntity.province.id,
        label: userEntity.province.name,
      }
    : null

  const defaultRegency = userEntity?.regency
    ? {
        value: userEntity.regency.id,
        label: userEntity.regency.name,
      }
    : null

  return {
    defaultProvince: !hasGlobalPermission ? defaultProvince : null,
    defaultRegency: !hasGlobalPermission ? defaultRegency : null,
  }
}