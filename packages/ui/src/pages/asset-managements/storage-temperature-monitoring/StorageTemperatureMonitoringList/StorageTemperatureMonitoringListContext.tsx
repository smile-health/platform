import React, { createContext, useContext, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { usePermission } from '#hooks/usePermission'
import { AxiosResponseWithStatusCode } from '#utils/api'
import { useTranslation } from 'react-i18next'

import { GetStorageTemperatureMonitoringDetailHistoryResponse } from '../StorageTemperatureMonitoringDetail/storage-temperature-monitoring-detail.service'
import { getStorageTemperatureMonitoringList } from './storage-temperature-monitoring-list.service'
import { useListFilter } from './use-cases/filter/useListFilter'

type StorageTemperatureMonitoringListContextValue = {
  isLoading: boolean
  isEmpty: boolean
  response?: AxiosResponseWithStatusCode<GetStorageTemperatureMonitoringDetailHistoryResponse>
  filter: ReturnType<typeof useListFilter>
  queryKey: unknown[]
  isGlobal?: boolean
  isWarehouse?: boolean
}

const StorageTemperatureMonitoringListContext = createContext<
  StorageTemperatureMonitoringListContextValue | undefined
>(undefined)

export const StorageTemperatureMonitoringListProvider: React.FC<{
  children: React.ReactNode
  isGlobal?: boolean
}> = ({ children, isGlobal = false }) => {
  usePermission('storage-temperature-monitoring-global-view')
  const pathname = usePathname()

  const { i18n } = useTranslation('storageTemperatureMonitoring')
  const isWarehouse = pathname?.split('/').pop() === 'warehouse'

  const filter = useListFilter()

  const queryKey = useMemo(
    () => [
      isWarehouse,
      i18n.language,
      'storage-temperature-monitoring',
      filter?.params,
      filter?.sorting,
    ],
    [i18n.language, filter?.params, filter?.sorting, isWarehouse]
  )

  const finalParams = {
    ...filter?.params,
    is_warehouse: isWarehouse ? 1 : 0,
    is_cce: isWarehouse ? 0 : 1,
  }

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => getStorageTemperatureMonitoringList(finalParams),
  })

  const providerValue = useMemo(
    () => ({
      isLoading: isLoading || isFetching,
      isEmpty: response?.total_item === 0,
      response: response as
        | AxiosResponseWithStatusCode<GetStorageTemperatureMonitoringDetailHistoryResponse>
        | undefined,
      filter,
      queryKey,
      isGlobal,
      isWarehouse,
    }),
    [isLoading, isFetching, response, filter, queryKey, isGlobal, isWarehouse]
  )

  return (
    <StorageTemperatureMonitoringListContext.Provider value={providerValue}>
      {children}
    </StorageTemperatureMonitoringListContext.Provider>
  )
}

export const useStorageTemperatureMonitoringList = () => {
  const context = useContext(StorageTemperatureMonitoringListContext)
  if (!context) {
    throw new Error(
      'useStorageTemperatureMonitoringList must be used within a StorageTemperatureMonitoringListProvider'
    )
  }
  return context
}
