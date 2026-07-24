import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { listProgramPlan } from '../../services/program-plan.services'

interface Pagination {
  page: number
  paginate: number
}

type Props = {
  filter?: { query: Record<string, unknown> }
  pagination: Pagination
  querySorting?: Record<string, unknown>
}

export const useProgramPlanListData = ({
  filter,
  pagination,
  querySorting,
}: Props) => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'programPlan'])

  const filterQueryKey = filter?.query

  const {
    data: listProgramPlanData,
    isLoading: isLoadingListProgramPlan,
    isFetching: isFetchingListProgramPlan,
  } = useQuery({
    queryKey: [
      'list-program-plan',
      filterQueryKey,
      pagination,
      querySorting,
      language,
    ],
    queryFn: () =>
      listProgramPlan({ ...filterQueryKey, ...pagination, ...querySorting }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady,
  })

  return {
    listProgramPlanData,
    isLoadingListProgramPlan,
    isFetchingListProgramPlan,
  }
}
