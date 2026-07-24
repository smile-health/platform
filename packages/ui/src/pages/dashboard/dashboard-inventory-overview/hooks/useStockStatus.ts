import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  DASHBOARD_INVENTORY_COLOR_MAP,
  DashboardInventoryType,
} from '../dashboard-inventory-overview.constant'
import {
  getMapName,
  handleFilter,
  locationProcessed,
} from '../dashboard-inventory-overview.helper'
import {
  getInventoryLocation,
  getInventoryOverview,
} from '../dashboard-inventory-overview.service'
import {
  TransactionTypeState,
  useDashboardInventoryStore,
} from '../dashboard-inventory-overview.store'
import {
  TDashboardInventoryOverviewFilter,
  TPieChart,
} from '../dashboard-inventory-overview.type'

type Params = {
  title: string
  filter: TDashboardInventoryOverviewFilter
}

export default function useStockStatus({ title, filter }: Params) {
  const {
    enabled,
    setMap,
    setTitle,
    setStatus,
    setLastUpdated,
    setTransactionType,
    setView,
  } = useDashboardInventoryStore()

  const params = handleFilter(filter)

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['inventory-overview', params],
    queryFn: () => getInventoryOverview(params),
    staleTime: 0,
    enabled,
  })

  const {
    data: dataLocation,
    isLoading: isLoadingLocation,
    isFetching: isFetchingLocation,
  } = useQuery({
    queryKey: ['inventory-location', params],
    queryFn: () => getInventoryLocation(params),
    staleTime: 0,
    enabled,
  })

  const handleSelectMap = (type: DashboardInventoryType, isLoading = false) => {
    const activeData = dataLocation?.data?.[type]
    const locations = locationProcessed(
      activeData,
      dataSource?.province,
      dataSource?.regency
    )

    setTitle(title)
    setLastUpdated(dataSource?.last_updated)
    setView(dataSource?.regency?.id ? 'list' : 'map')
    setMap({
      color: DASHBOARD_INVENTORY_COLOR_MAP?.[type],
      name: getMapName(dataSource?.map_name),
      data: locations ?? [],
      type: dataSource?.regency?.id ? 'entity' : 'location',
      source: 'stock',
      isLoading,
    })
  }

  const handleSelectMaterial = (type: TransactionTypeState) => {
    setTransactionType(type)
  }

  useEffect(() => {
    const selectedData = dataSource?.data?.find((item) => item?.is_selected)
    const type = selectedData?.type ?? DashboardInventoryType.Normal

    setStatus(selectedData?.label ?? 'Normal')
    handleSelectMap(type, isLoadingLocation || isFetchingLocation)
  }, [dataSource, isLoadingLocation, isFetchingLocation])

  useEffect(() => {
    if (dataSource?.data?.length) {
      const selectedData = dataSource?.data?.find((item) => item?.is_selected)

      handleSelectMaterial(selectedData?.type ?? null)
    }
  }, [dataSource])

  const handleClick = (item: TPieChart) => {
    const type = item?.type

    setStatus(item?.name)
    handleSelectMap(type)
    handleSelectMaterial(type)
  }

  return {
    isLoading: isLoading || isFetching,
    data: dataSource?.data,
    lastUpdated: dataSource?.last_updated,
    handleClick,
  }
}
