import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'

import { downloadTemplateAnnualPlanningSubstitutions } from '../../services/annual-planning-substitution.services'

export const useAnnualPlanningSubstitutionListDownloadTemplate = () => {
  const router = useSmileRouter()
  const { id: programPlanId } = router.query
  const downloadTemplateQuery = useQuery({
    queryKey: ['download-template-annual-planning-substitution', programPlanId],
    queryFn: () =>
      downloadTemplateAnnualPlanningSubstitutions(Number(programPlanId)),
    enabled: false,
  })

  useSetLoadingPopupStore(
    downloadTemplateQuery.isLoading || downloadTemplateQuery.isFetching
  )

  return {
    downloadTemplateQuery,
  }
}
