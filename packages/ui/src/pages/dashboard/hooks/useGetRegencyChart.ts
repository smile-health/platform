import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { Values } from 'nuqs'

import { dataMapping, handleFilter } from '../dashboard.helper'
import { getRegencyChart } from '../dashboard.service'

export default function useGetRegencyChart(
  filter: Values<Record<string, any>>,
  sort: OptionType | null,
  type: 'stock' | 'transaction'
) {
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['regency-chart', params],
    queryFn: () => getRegencyChart(params, type),
    enabled,
  })

  const regencyChart = useMemo(() => {
    if (sort?.value === 'asc') {
      const sorted = data?.list?.toSorted(
        (a, b) => a?.regency?.id - b?.regency?.id
      )
      return dataMapping(sorted || [], 'regency.name')
    }

    if (sort?.value === 'desc') {
      const sorted = data?.list?.toSorted(
        (a, b) => b?.regency?.id - a?.regency?.id
      )
      return dataMapping(sorted || [], 'regency.name')
    }

    return dataMapping(data?.list || [], 'regency.name')
  }, [data, sort])

  return { data: regencyChart, isLoading: isLoading || isFetching }
}
