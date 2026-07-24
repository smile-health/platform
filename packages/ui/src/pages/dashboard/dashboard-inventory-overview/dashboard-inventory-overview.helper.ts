import { OptionType } from '#components/react-select'
import { toast } from '#components/toast'
import { MAP_CODE_TO_SLUG } from '#constants/map'
import { hasPermission } from '#shared/permission/index'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { TFunction } from 'i18next'
import { UseFormSetValue } from 'react-hook-form'

import {
  DASHBOARD_INVENTORY_LABEL_COLOR,
  DashboardInventoryMapsColor,
  DashboardInventoryOverviewColor,
  DashboardInventoryType,
} from './dashboard-inventory-overview.constant'
import {
  TCommon,
  TDashboardInventoryOverviewFilter,
  TLocation,
} from './dashboard-inventory-overview.type'

export function handleFilter(filter: TDashboardInventoryOverviewFilter) {
  const newFilter = {
    from: filter?.period_start?.toString(),
    to: filter?.period_end?.toString(),
    activity_ids: getReactSelectValue(filter?.activity),
    material_type_id: getReactSelectValue(filter?.material_type),
    material_ids: getReactSelectValue(filter?.material),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_tag_id: getReactSelectValue(filter?.entity_tag),
    transaction_type: filter?.transaction_type,
    working_status_id: getReactSelectValue(filter?.operational_status),
  }

  if (filter?.material_id) {
    delete newFilter.material_ids
    return removeEmptyObject({ ...newFilter, material_id: filter?.material_id })
  }

  return removeEmptyObject(newFilter)
}

export function getLabelOptions(color: DashboardInventoryOverviewColor) {
  const background = DASHBOARD_INVENTORY_LABEL_COLOR[color]

  return {
    formatter: '  {label|{b} } {percent|{d}%}  ',
    backgroundColor: background?.colorLight,
    borderColor: '#073B4C',
    borderWidth: 1,
    borderRadius: 4,
    alignTo: 'edge',
    position: 'outer',
    edgeDistance: 15,
    rich: {
      label: {
        color: '#073B4C',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 33,
      },
      percent: {
        color: '#fff',
        backgroundColor: background?.color,
        padding: [3, 4],
        borderRadius: 4,
      },
    },
  }
}

export function locationProcessed(
  data?: TLocation[],
  province?: TCommon,
  regency?: TCommon
) {
  return data?.map((item) => {
    return {
      id: item?.id,
      name: item?.name,
      value: item?.percent,
      province,
      regency,
      emphasis: {
        itemStyle: {
          areaColor: item?.percent ? '#BBF7D0' : undefined,
        },
      },
      label: {
        show: Boolean(item?.percent),
      },
      tooltip: {
        confine: true,
        show: Boolean(item?.percent),
        formatter: `<span class="ui-whitespace-pre-wrap">${item.tooltip}</span>`,
      },
    }
  })
}

export function getBarChartColor(
  value: number,
  color = DashboardInventoryOverviewColor.Green
) {
  const barColor = DashboardInventoryMapsColor[color]

  if (value <= 10) return barColor?.[0]
  if (value <= 25) return barColor?.[1]
  if (value <= 50) return barColor?.[2]
  if (value <= 90) return barColor?.[3]
  return barColor?.[4]
}

export function getMapName(map_name?: string) {
  if (map_name) {
    return MAP_CODE_TO_SLUG?.[map_name]
  }
}

const encode = (value: Partial<OptionType> | OptionType[]) =>
  encodeURIComponent(JSON.stringify(value))
const doubleEncode = (str: string) => encodeURIComponent(str)

export function handleMapClick({
  item,
  setValue,
  mapType = 'location',
  getAsLink,
  type,
  source = 'stock',
  filter,
  onCallback,
}: {
  item: TCommon & {
    province?: TCommon
    regency?: TCommon
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  mapType?: string
  getAsLink: (url: string) => string
  type: DashboardInventoryType | null
  source?: string
  filter: TDashboardInventoryOverviewFilter
  onCallback: VoidFunction
}) {
  const newData = {
    label: item?.name,
    value: item?.id,
  }

  const province = {
    label: item?.province?.name,
    value: item?.province?.id,
  }

  const regency = {
    label: item?.regency?.name,
    value: item?.regency?.id,
  }

  if (item?.regency) {
    // The logic below handles cases where a regency exists.
    // In this scenario, we should generate a redirect URL to the view stock page.

    const entityObj = {
      ...newData,
      province_id: item?.province?.id,
      regency_id: item?.regency?.id,
    }

    const onlyHaveQty = type === DashboardInventoryType.ZeroStock ? 0 : 1

    let url =
      `/v5/stock?page=1` +
      `&province_id=${doubleEncode(encode(province))}` +
      `&regency_id=${doubleEncode(encode(regency))}` +
      `&entity_id=${doubleEncode(encode(entityObj))}` +
      `&only_have_qty=${onlyHaveQty}`

    if (filter?.activity?.length === 1) {
      url = url + `&activity_id=${doubleEncode(encode(filter?.activity?.[0]))}`
    }

    if (filter?.material_type?.value) {
      const materialType = filter?.material_type
      url = url + `&material_type_id=${doubleEncode(encode(materialType))}`
    }

    if (filter?.material?.length) {
      url = url + `&material_id=${encode(filter?.material)}`
    }

    if (mapType === 'entity' && source === 'stock') {
      window.open(getAsLink(url), '_blank') // open new tab
    }
    return
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })

  if (item?.province) {
    // If the item contains a province, set the province filter
    // and use the current item as the regency filter value.
    setValue('province', province)
    setValue('regency', newData)
  } else {
    // If no province is provided, simply set the province filter using the item data.
    setValue('province', newData)
  }

  setTimeout(onCallback, 200)
}

export function handleTemperatureClick({
  t,
  type,
  filter,
  getAsLinkGlobal,
}: {
  t: TFunction<'dashboardInventoryOverview'>
  type: DashboardInventoryType
  filter: TDashboardInventoryOverviewFilter
  getAsLinkGlobal: (url: string) => string
}) {
  if (filter?.province && filter?.regency) {
    const relation = {
      label: t('with_relation'),
      value: 1,
    }

    const temperature = {
      [DashboardInventoryType.High]: {
        label: t('temperature.above'),
        value: 'above',
      },
      [DashboardInventoryType.Low]: {
        label: t('temperature.below'),
        value: 'below',
      },
      [DashboardInventoryType.Normal]: {
        label: 'Normal',
        value: 'normal',
      },
    } as Record<DashboardInventoryType, OptionType>

    let url =
      '/v5/global-asset/management/storage-temperature-monitoring/cold-chain-equipment' +
      `?province=${doubleEncode(encode(filter?.province))}` +
      `&regency=${doubleEncode(encode(filter?.regency))}` +
      `&is_device_related=${doubleEncode(encode(relation))}`

    if (filter?.entity_tag) {
      url = url + `&entity_tag=${doubleEncode(encode([filter?.entity_tag]))}`
    }

    if (filter?.operational_status) {
      const params = doubleEncode(encode(filter?.operational_status))
      url = url + `&rtmd_status=${params}`
    }

    if (type !== DashboardInventoryType.Unknown) {
      url =
        url + `&temperature_filter=${doubleEncode(encode(temperature[type]))}`
    }

    if (hasPermission('storage-temperature-monitoring-global-view')) {
      window.open(getAsLinkGlobal(url), '_blank')
    } else {
      toast.danger({
        id: 'no-access-asset-management',
        description: t('no_access_asset_management'),
      })
    }
  }
}
