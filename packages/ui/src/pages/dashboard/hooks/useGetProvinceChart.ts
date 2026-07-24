import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { Values } from 'nuqs'

import { dataMapping, handleFilter } from '../dashboard.helper'
import { getProvinceChart } from '../dashboard.service'

export default function useGetProvinceChart(
  filter: Values<Record<string, any>>,
  sort: OptionType | null,
  type: 'stock' | 'transaction'
) {
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['province-chart', params],
    queryFn: () => getProvinceChart(params, type),
    enabled,
  })

  const provinceChart = useMemo(() => {
    if (sort?.value === 'asc') {
      const sorted = data?.list?.toSorted(
        (a, b) => a?.province?.id - b?.province?.id
      )
      return dataMapping(sorted || [], 'province.name')
    }

    if (sort?.value === 'desc') {
      const sorted = data?.list?.toSorted(
        (a, b) => b?.province?.id - a?.province?.id
      )
      return dataMapping(sorted || [], 'province.name')
    }

    return dataMapping(data?.list || [], 'province.name')
  }, [data, sort])

  return { data: provinceChart, isLoading: isLoading || isFetching }
}
