import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BOOLEAN } from '#constants/common'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useLoadingPopupStore } from '#store/loading.store'
import { useTranslation } from 'react-i18next'

import { exportStorageTemperatureMonitoring } from '../../storage-temperature-monitoring-list.service'
import { useStorageTemperatureMonitoringList } from '../../StorageTemperatureMonitoringListContext'
import { useListFilter } from '../filter/useListFilter'

const useListExport = () => {
  const { i18n } = useTranslation()
  const { setLoadingPopup } = useLoadingPopupStore()

  const storageTemperatureMonitoringList = useStorageTemperatureMonitoringList()
  const isWarehouse = storageTemperatureMonitoringList?.isWarehouse

  const filter = useListFilter()

  const finalParams = {
    ...filter.params,
    is_warehouse: isWarehouse ? BOOLEAN.TRUE : BOOLEAN.FALSE,
    is_cce: isWarehouse ? BOOLEAN.FALSE : BOOLEAN.TRUE,
  }

  const queryKeyExport = [
    i18n.language,
    'storage-temperature-monitoring-export',
    finalParams,
  ]

  const { refetch, isLoading, isFetching, isSuccess } = useQuery({
    queryKey: queryKeyExport,
    queryFn: () => exportStorageTemperatureMonitoring(finalParams),
    enabled: false,
  })

  useEffect(() => {
    setLoadingPopup(isLoading || isFetching)
  }, [setLoadingPopup, isLoading, isFetching])

  useSetExportPopupStore(isSuccess, queryKeyExport)

  return {
    fetch: () => refetch(),
    isLoading: isLoading || isFetching,
    isSuccess,
  }
}

export default useListExport
