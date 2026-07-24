import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  DashboardInventoryMapsColorClass,
  DashboardInventoryOverviewColor,
  DashboardInventoryType,
} from '../dashboard-inventory-overview.constant'
import {
  getBarChartColor,
  handleFilter,
} from '../dashboard-inventory-overview.helper'
import { getInventoryMaterialEntities } from '../dashboard-inventory-overview.service'
import { useDashboardInventoryStore } from '../dashboard-inventory-overview.store'
import {
  TBarChart,
  TDashboardInventoryOverviewFilter,
} from '../dashboard-inventory-overview.type'

type Params = {
  filter: TDashboardInventoryOverviewFilter
}

export default function useGetLocation({ filter }: Params) {
  const { t } = useTranslation('dashboardInventoryOverview')
  const { map, transactionType, material_id } = useDashboardInventoryStore()

  const { data, color } = map

  const params = handleFilter({
    ...filter,
    transaction_type: transactionType as DashboardInventoryType,
    material_id: material_id as string,
  })

  const {
    data: dataEntity,
    isLoading: isLoadingEntity,
    isFetching: isFetchingEntity,
  } = useQuery({
    queryKey: ['inventory-material-entities', params],
    queryFn: () => getInventoryMaterialEntities(params),
    staleTime: 0,
    enabled: !!transactionType && !!material_id,
  })

  const listLocation: TBarChart[] = data?.map((item) => {
    const tooltip = item?.tooltip?.formatter as string
    return {
      y: item?.name,
      x: item?.value,
      extra: {
        id: item?.id,
        name: item?.name,
        province: item?.province,
        regency: item?.regency,
        tooltip: tooltip.replace(/<span[^>]*>(.*?)<\/span>/g, '$1'),
      },
    }
  })

  const entityChart = dataEntity?.data?.map((item) => ({
    y: item?.name,
    x: item?.value,
    extra: {
      province: item?.province,
      regency: item?.regency,
      tooltip: t('entity_tooltip', {
        value: item?.value,
        count: item?.value / 100,
      }),
    },
  }))

  const listLocationColor = data?.map((item) => {
    return getBarChartColor(item?.value, color)
  })

  const legendByColor = DashboardInventoryMapsColorClass?.[color]
  const entityColor = map?.color as DashboardInventoryOverviewColor

  return {
    data: {
      location: listLocation,
      entities: entityChart ?? [],
    },
    color: {
      legend: legendByColor,
      location: listLocationColor,
      entity: entityColor,
    },
    isLoading: isLoadingEntity || isFetchingEntity,
  }
}
