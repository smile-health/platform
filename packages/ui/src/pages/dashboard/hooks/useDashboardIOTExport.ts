import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { handleFilterDashboardIOT } from '../dashboard.helper'
import { exportDashboardIOT } from '../dashboard.service'
import { TDashboardIOTFilter, TDashboardIOTSubPath } from '../dashboard.type'

type Params = {
  path: TDashboardIOTSubPath
  filter: TDashboardIOTFilter
  type: 'review' | 'material' | 'entity' | 'location' | 'entity-material'
}

export default function useDashboardIOTExport({ path, filter, type }: Params) {
  const params = handleFilterDashboardIOT(filter)

  const {
    refetch: onExport,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [`export-${path}`, params, type],
    queryFn: () => exportDashboardIOT(params, path, type),
    enabled: false,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  return { onExport }
}
