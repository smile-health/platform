import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePermission } from '#hooks/usePermission'
import { AxiosResponseWithStatusCode } from '#utils/api'
import { useTranslation } from 'react-i18next'

import {
  getMonitoringDeviceInventoryList,
  GetMonitoringDeviceInventoryListResponse,
} from './monitoring-device-inventory-list.service'
import { useListFilter } from './use-cases/filter/useListFilter'

type MonitoringDeviceInventoryListContextValue = {
  isLoading: boolean
  isEmpty: boolean
  response?: AxiosResponseWithStatusCode<GetMonitoringDeviceInventoryListResponse>
  filter: ReturnType<typeof useListFilter>
  queryKey: unknown[]
  isGlobal?: boolean
}

const MonitoringDeviceInventoryListContext = createContext<
  MonitoringDeviceInventoryListContextValue | undefined
>(undefined)

export const MonitoringDeviceInventoryListProvider: React.FC<{
  children: React.ReactNode
  isGlobal?: boolean
}> = ({ children, isGlobal = false }) => {
  usePermission('monitoring-device-inventory-global-view')

  const { i18n } = useTranslation('monitoringDeviceInventoryList')

  const filter = useListFilter()

  const queryKey = [
    i18n.language,
    'monitoring-device-inventory',
    filter.params,
    filter.sorting,
  ]

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => getMonitoringDeviceInventoryList(filter.params),
  })

  return (
    <MonitoringDeviceInventoryListContext.Provider
      value={{
        isLoading: isLoading || isFetching,
        isEmpty: response?.total_item === 0,
        response,
        filter,
        queryKey,
        isGlobal,
      }}
    >
      {children}
    </MonitoringDeviceInventoryListContext.Provider>
  )
}

export const useMonitoringDeviceInventoryList = () => {
  const context = useContext(MonitoringDeviceInventoryListContext)
  if (!context) {
    throw new Error(
      'useMonitoringDeviceInventoryList must be used within a MonitoringDeviceInventoryListProvider'
    )
  }
  return context
}
