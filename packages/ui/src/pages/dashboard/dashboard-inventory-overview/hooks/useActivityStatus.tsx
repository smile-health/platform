import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { DASHBOARD_INVENTORY_COLOR_MAP } from '../dashboard-inventory-overview.constant'
import {
  getMapName,
  handleFilter,
  locationProcessed,
} from '../dashboard-inventory-overview.helper'
import {
  getActivityLocation,
  getActivityOverview,
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

export default function useActivityStatus({ title, filter }: Params) {
  const { enabled, setMap, setTitle, setStatus, setView, setTransactionType } =
    useDashboardInventoryStore()

  const params = handleFilter(filter)

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['activity-overview', params],
    queryFn: () => getActivityOverview(params),
    staleTime: 0,
    enabled,
  })

  const { data: dataLocation } = useQuery({
    queryKey: ['activity-location', params],
    queryFn: () => getActivityLocation(params),
    staleTime: 0,
    enabled,
  })

  const handleClick = useCallback(
    (item: TPieChart) => {
      {
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
          source: 'activity',
        })
      }
    },
    [
      dataLocation,
      dataSource,
      setMap,
      setStatus,
      setTitle,
      setView,
      setTransactionType,
      title,
    ]
  )

  return {
    isLoading: isLoading || isFetching,
    data: dataSource?.data,
    lastUpdated: dataSource?.last_updated,
    axisName: dataSource?.axis_name,
    handleClick,
  }
}
