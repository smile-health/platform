import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { listPeriodOfStockTaking } from '../../services/period-of-stock-taking.services'

interface Pagination {
  page: number
  paginate: number
}

type Props = {
  filter: { query: Record<string, any> }
  pagination: Pagination
}

export const usePeriodOfStockTakingListData = ({
  filter,
  pagination,
}: Props) => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'periodOfStockTaking'])

  const filterQueryKey = {
    ...filter.query,
    date_range: {
      start: filter.query.date_range?.start?.toString() ?? null,
      end: filter.query.date_range?.end?.toString() ?? null,
    },
  }

  const {
    data: listPeriodOfStockTakingData,
    isLoading: isLoadingListPeriodOfStockTaking,
    isFetching: isFetchingListPeriodOfStockTaking,
  } = useQuery({
    queryKey: [
      'list-period-of-stock-taking',
      filterQueryKey,
      pagination,
      language,
    ],
    queryFn: () =>
      listPeriodOfStockTaking({ ...filterQueryKey, ...pagination }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady,
  })

  return {
    listPeriodOfStockTakingData,
    isLoadingListPeriodOfStockTaking,
    isFetchingListPeriodOfStockTaking,
  }
}
