import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { Values } from 'nuqs'

import { temperatureMonitoringDashboardService } from '../services'

export default function useGetColdStorageData(
  filter: Values<Record<string, any>>
) {
  const params = removeEmptyObject({
    from: filter?.date?.start?.toString(),
    to: filter?.date?.end?.toString(),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    entity_tag_ids: getReactSelectValue(filter?.entity_tag),
    model_ids: getReactSelectValue(filter?.asset_model),
  })

  const enabled = Object.values(params)?.length > 0

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cold-storage-data', params],
    queryFn: () => temperatureMonitoringDashboardService.getColdStorage(params),
    enabled,
  })

  const exportQuery = useQuery({
    queryKey: ['cold-storage-export', params],
    queryFn: () =>
      temperatureMonitoringDashboardService.exportColdStorage(params),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery?.isLoading || exportQuery?.isFetching)

  return {
    data,
    isLoading: isLoading || isFetching,
    onExport: () => exportQuery.refetch(),
  }
}
