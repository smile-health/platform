import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { DASHBOARD_INVENTORY_COLOR_MAP } from '../dashboard-inventory-overview.constant'
import {
  getMapName,
  handleFilter,
  handleTemperatureClick,
  locationProcessed,
} from '../dashboard-inventory-overview.helper'
import {
  getTemperatureLocation,
  getTemperatureOverview,
} from '../dashboard-inventory-overview.service'
import { useDashboardInventoryStore } from '../dashboard-inventory-overview.store'
import {
  TDashboardInventoryOverviewFilter,
  TPieChart,
} from '../dashboard-inventory-overview.type'

type Params = {
  title: string
  filter: TDashboardInventoryOverviewFilter
}

export default function useTemperatureStatus({ title, filter }: Params) {
  const { enabled, setMap, setTitle, setStatus, setView, setTransactionType } =
    useDashboardInventoryStore()

  const { t } = useTranslation('dashboardInventoryOverview')
  const router = useSmileRouter()

  const params = handleFilter(filter)

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['temperature-overview', params],
    queryFn: () => getTemperatureOverview(params),
    staleTime: 0,
    enabled,
  })

  const { data: dataLocation } = useQuery({
    queryKey: ['temperature-location', params],
    queryFn: () => getTemperatureLocation(params),
    staleTime: 0,
    enabled,
  })

  const handleClick = (item: TPieChart) => {
    const type = item?.type
    const activeData = dataLocation?.data?.[type]
    const locations = locationProcessed(
      activeData,
      dataSource?.province,
      dataSource?.regency
    )

    setTitle(title)
    setStatus(item?.name)
    setView(dataSource?.regency?.id ? 'list' : 'map')
    setTransactionType(null)
    setMap({
      color: DASHBOARD_INVENTORY_COLOR_MAP?.[type],
      name: getMapName(dataSource?.map_name),
      data: locations ?? [],
      type: dataSource?.regency?.id ? 'entity' : 'location',
      source: 'temperature',
    })

    handleTemperatureClick({
      t,
      type,
      filter,
      getAsLinkGlobal: router.getAsLinkGlobal,
    })
  }

  return {
    isLoading: isLoading || isFetching,
    data: dataSource?.data,
    lastUpdated: dataSource?.last_updated,
    handleClick,
  }
}
