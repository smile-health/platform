import { useEffect } from 'react'
import useSmileRouter from '#hooks/useSmileRouter'
import { useLoadingPopupStore } from '#store/loading.store'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { exportColdStorageCapacityDetail } from '../../cold-storage-capacity-detail.service'
import { useColdStorageCapacityDetail } from '../../ColdStorageCapacityDetailContext'

export const useExportColdStorageCapacityDetail = () => {
  const { i18n } = useTranslation()
  const router = useSmileRouter()
  const { id } = router.query as { id?: string }
  const { selectedProgram } = useColdStorageCapacityDetail()
  const { setLoadingPopup } = useLoadingPopupStore()

  const programId = selectedProgram?.value || undefined

  const { refetch, isLoading, isFetching } = useQuery({
    queryKey: [
      i18n.language,
      'cold-storage-capacity',
      'detail',
      'export',
      id,
      programId,
    ],
    queryFn: () =>
      exportColdStorageCapacityDetail(id!, {
        program_id: programId,
      }),
    enabled: false,
  })

  useEffect(() => {
    setLoadingPopup(isLoading || isFetching)
  }, [isLoading, isFetching, setLoadingPopup])

  return {
    export: refetch,
    isLoading: isLoading || isFetching,
  }
}
