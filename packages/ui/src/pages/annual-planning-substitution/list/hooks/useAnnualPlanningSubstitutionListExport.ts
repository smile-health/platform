import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'

import { exportAnnualPlanningSubstitutions } from '../../services/annual-planning-substitution.services'

type Props = {
  filter: Record<string, any>
}

export const useAnnualPlanningSubstitutionListExport = ({ filter }: Props) => {
  const router = useSmileRouter()
  const { id: programPlanId } = router.query
  const exportQuery = useQuery({
    queryKey: [
      'export-list-annual-planning-substitution',
      filter.getValues(),
      programPlanId,
    ],
    queryFn: () =>
      exportAnnualPlanningSubstitutions(Number(programPlanId), filter.getValues()),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery.isLoading || exportQuery.isFetching)

  return {
    exportQuery,
  }
}
