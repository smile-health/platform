import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { exportAnnualPlanningTargetGroups } from '../../services/annual-planning-target-group.services'

type Props = {
  filter: Record<string, any>
  isGlobal: boolean
}

export const useAnnualPlanningTargetGroupListExport = ({ filter, isGlobal }: Props) => {
  const exportQuery = useQuery({
    queryKey: ['export-list-annual-planning-target-group', filter.getValues(), isGlobal],
    queryFn: () => exportAnnualPlanningTargetGroups(filter.getValues(), isGlobal),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery.isLoading || exportQuery.isFetching)

  return {
    exportQuery,
  }
}
