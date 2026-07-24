import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { Values } from 'nuqs'

import { dataMapping, handleFilter } from '../../dashboard.helper'
import { getTransactionReasonChart } from '../dashboard-transaction-monitoring.service'

export default function useGetTransactionReasonChart(
  filter: Values<Record<string, any>>,
  sort: OptionType | null
) {
  const params = handleFilter(filter)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['transaction-reason-chart', params],
    queryFn: () => getTransactionReasonChart(params),
  })

  const transactionReason = useMemo(() => {
    if (sort?.value === 'asc') {
      const sorted = data?.list?.toSorted((a, b) =>
        a?.transaction_reason?.name.localeCompare(b?.transaction_reason?.name)
      )
      return dataMapping(sorted || [], 'transaction_reason.name')
    }

    if (sort?.value === 'desc') {
      const sorted = data?.list?.toSorted((a, b) =>
        b?.transaction_reason?.name.localeCompare(a?.transaction_reason?.name)
      )
      return dataMapping(sorted || [], 'transaction_reason.name')
    }

    return dataMapping(data?.list || [], 'transaction_reason.name')
  }, [data, sort])

  return { data: transactionReason, isLoading: isLoading || isFetching }
}
