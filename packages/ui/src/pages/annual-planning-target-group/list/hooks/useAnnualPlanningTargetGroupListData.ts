import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { listAnnualPlanningTargetGroup } from '../../services/annual-planning-target-group.services'

interface Pagination {
  page: number
  paginate: number
}

type Props = {
  filter: { query: Record<string, any> }
  pagination: Pagination
  isGlobal: boolean
}

export const useAnnualPlanningTargetGroupListData = ({
  filter,
  pagination,
  isGlobal,
}: Props) => {
  const router = useSmileRouter()
  const { id: planId } = router.query ?? {}
  const {
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningTargetGroup'])

  const programPlanId = router.query?.id
  
  if (!isGlobal && programPlanId) {
    filter.query.programPlanId = Number(programPlanId)
  }

  const filterQueryKey = filter.query

  const {
    data: listAnnualPlanningTargetGroupData,
    isLoading: isLoadingListAnnualPlanningTargetGroup,
    isFetching: isFetchingListAnnualPlanningTargetGroup,
  } = useQuery({
    queryKey: [
      'list-annual-planning-target-group',
      filterQueryKey,
      pagination,
      language,
      isGlobal,
      planId,
    ],
    queryFn: () =>
      listAnnualPlanningTargetGroup(
        {
          ...filterQueryKey,
          ...pagination,
          programPlanId: planId ? Number(planId) : null,
        },
        isGlobal
      ),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady,
  })

  return {
    listAnnualPlanningTargetGroupData,
    isLoadingListAnnualPlanningTargetGroup,
    isFetchingListAnnualPlanningTargetGroup,
  }
}
