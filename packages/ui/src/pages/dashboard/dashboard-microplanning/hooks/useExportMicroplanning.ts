import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { Values } from 'nuqs'

import { handleMicroplanningFilter } from '../../dashboard.helper'
import { exportMicroplanning } from '../dashboard-microplanning.service'
import { MicroplanningDashboardType } from '../dashboard-microplanning.constant'

export default function useExportMicroplanning<T extends MicroplanningDashboardType>(
  filter: Values<Record<string, any>>,
  tab: T,
  submitKey: number
) {

  const params = handleMicroplanningFilter(filter)

  const exportQuery = useQuery({
    queryKey: ['microplanning-export', params, tab, submitKey],
    queryFn: () => exportMicroplanning(params, tab),
    enabled: false
  })

  const isExportLoading = exportQuery?.isLoading || exportQuery?.isFetching

  useSetLoadingPopupStore(
    isExportLoading
  )

  return {
    onExport: () => exportQuery.refetch(),
  }
}
