import cx from '#lib/cx'
import { growthbook } from '#lib/growthbook'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { Values } from 'nuqs'

import { TEntityItem } from './user-activity.type'

export function handleFilter(filter: Values<Record<string, any>>) {
  const isShowCustomerActivity = growthbook.getFeatureValue(
    'dashboard.user_activity.customer',
    false
  )

  const newFilter = {
    page: filter?.page,
    paginate: filter?.paginate,
    from: filter?.periode?.start,
    to: filter?.periode?.end,
    activity_ids: getReactSelectValue(filter?.activity),
    material_type_ids: getReactSelectValue(filter?.material_type),
    material_ids: getReactSelectValue(filter?.material),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    entity_tag_ids: getReactSelectValue(filter?.entity_tags),
    ...(isShowCustomerActivity && {
      is_customer_activity: filter?.is_customer_activity || '0',
      customer_tag_ids: getReactSelectValue(filter?.customer_tags),
    }),
  }

  return removeEmptyObject(newFilter)
}

const processedEntityOverview = (overview: Record<string, number>[]) => {
  return overview.reduce((acc, item) => {
    const newData = Object.values(item)
    return [...acc, ...newData]
  }, [])
}

export function getLabelOptions(isActive = false) {
  return {
    formatter: '  {label|{b}: }{count|{c}}  {percent|{d}%}  ',
    backgroundColor: isActive ? '#F0FDF4' : '#FEF2F2',
    borderColor: '#073B4C',
    borderWidth: 1,
    borderRadius: 4,
    rich: {
      label: {
        color: '#073B4C',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 33,
      },
      count: {
        fontSize: 14,
        color: '#073B4C',
      },
      percent: {
        color: '#fff',
        backgroundColor: isActive ? '#22C55E' : '#EF4444',
        padding: [3, 4],
        borderRadius: 4,
      },
    },
  }
}

export function handleEntityTableData(
  data: TEntityItem[],
  page: number,
  paginate: number,
  lang: string,
  isShowCustomerActivity = false
) {
  return data?.reduce((acc, curr, index) => {
    const overview = processedEntityOverview(curr?.overview)
    const news = [
      {
        value: (page - 1) * paginate + (index + 1),
        class:
          'ui-sticky ui-left-0 ui-min-w-14 ui-w-14 ui-border-r ui-border-gray-300',
      },
      {
        value: curr?.name,
        class:
          'ui-sticky ui-left-14 ui-min-w-48 ui-w-48 ui-border-r ui-border-gray-300',
      },
      ...(isShowCustomerActivity
        ? [
            {
              value: curr?.customer_name ?? '-',
              class:
                'ui-sticky ui-left-[248px] ui-min-w-48 ui-w-48 ui-border-r ui-border-gray-300',
            },
          ]
        : []),
      ...overview.map((item) => ({
        value: item,
        class: cx('ui-text-center', {
          'ui-bg-sky-100': item > 0,
        }),
      })),
      {
        value: curr?.total_active_days,
        class: cx('ui-sticky ui-border-l ui-border-gray-300 ui-text-center', {
          'ui-right-[225px]': lang === 'en',
          'ui-right-[210px]': lang === 'id',
        }),
      },
      {
        value: curr?.total_inactive_days,
        class: cx('ui-sticky ui-border-l ui-border-gray-300 ui-text-center', {
          'ui-right-[160px]': lang === 'en',
          'ui-right-[150px]': lang === 'id',
        }),
      },
      {
        value: curr?.total_frequency,
        class: cx('ui-sticky ui-border-l ui-border-gray-300 ui-text-center', {
          'ui-right-[80px]': lang === 'en',
          'ui-right-[75px]': lang === 'id',
        }),
      },
      {
        value: curr?.average_frequency,
        class:
          'ui-sticky ui-right-0 ui-border-l ui-border-gray-300 ui-text-center',
      },
    ]

    return [...acc, news]
  }, [])
}
