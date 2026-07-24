import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { downloadTemplateAnnualPlanningTargetGroups } from '../../services/annual-planning-target-group.services'

export const useAnnualPlanningTargetGroupListDownloadTemplate = () => {
  const downloadTemplateQuery = useQuery({
    queryKey: ['download-template-annual-planning-target-group'],
    queryFn: downloadTemplateAnnualPlanningTargetGroups,
    enabled: false,
  })

  useSetLoadingPopupStore(
    downloadTemplateQuery.isLoading || downloadTemplateQuery.isFetching
  )

  return {
    downloadTemplateQuery,
  }
}
