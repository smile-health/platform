import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { listAnnualPlanningSubstitution } from '../../services/annual-planning-substitution.services'

interface Pagination {
  page: number
  paginate: number
}

type Props = {
  filter: { query: Record<string, any> }
  pagination: Pagination
}

export const useAnnualPlanningSubstitutionListData = ({
  filter,
  pagination,
}: Props) => {
  const router = useSmileRouter()
  const { id } = router.query
  const {
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningSubstitution'])

  const filterQueryKey = filter.query

  const {
    data: listAnnualPlanningSubstitutionData,
    isLoading: isLoadingListAnnualPlanningSubstitution,
    isFetching: isFetchingListAnnualPlanningSubstitution,
  } = useQuery({
    queryKey: [
      'list-annual-planning-substitution',
      filterQueryKey,
      pagination,
      language,
      id,
    ],
    queryFn: () =>
      listAnnualPlanningSubstitution(Number(id), {
        ...filterQueryKey,
        ...pagination,
      }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady,
  })

  return {
    listAnnualPlanningSubstitutionData,
    isLoadingListAnnualPlanningSubstitution,
    isFetchingListAnnualPlanningSubstitution,
  }
}
