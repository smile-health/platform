import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useLoadingPopupStore } from '#store/loading.store'
import { useTranslation } from 'react-i18next'

import { exportMonitoringDeviceInventory } from '../../monitoring-device-inventory-list.service'
import { useListFilter } from '../filter/useListFilter'

const useListExport = () => {
  const { i18n } = useTranslation()
  const { setLoadingPopup } = useLoadingPopupStore()

  const filter = useListFilter()

  const queryKeyExport = [
    i18n.language,
    'monitoring-device-inventory-export',
    filter.params,
  ]

  const { refetch, isLoading, isFetching, isSuccess } = useQuery({
    queryKey: queryKeyExport,
    queryFn: () => exportMonitoringDeviceInventory(filter.params),
    enabled: false,
  })

  useEffect(() => {
    setLoadingPopup(isLoading || isFetching)
  }, [setLoadingPopup, isLoading, isFetching])

  useSetExportPopupStore(isSuccess, queryKeyExport)

  return {
    fetch: () => refetch(),
    isLoading: isLoading || isFetching,
  }
}

export default useListExport
