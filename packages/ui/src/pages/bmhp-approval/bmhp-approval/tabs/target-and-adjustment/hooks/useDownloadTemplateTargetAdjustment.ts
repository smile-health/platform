import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { downloadTemplateTargetAdjustment } from '../services/target-adjustment.service'

export const useDownloadTemplateTargetAdjustment = (programPlanId: number) => {
  const downloadTemplateQuery = useQuery({
    queryKey: ['download-template-target-adjustment', programPlanId],
    queryFn: () => downloadTemplateTargetAdjustment(programPlanId),
    enabled: false,
  })

  useSetLoadingPopupStore(
    downloadTemplateQuery.isLoading || downloadTemplateQuery.isFetching
  )

  return { downloadTemplateQuery }
}
