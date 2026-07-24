import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { Values } from 'nuqs'

import { dataMapping, handleFilter } from '../../dashboard.helper'
import { getMaterialChart } from '../dashboard-transaction-monitoring.service'

export default function useGetMaterialChart(
  filter: Values<Record<string, any>>,
  sort: OptionType | null
) {
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['material-chart', params],
    queryFn: () => getMaterialChart(params),
    enabled,
  })

  const materialChart = useMemo(() => {
    if (sort?.value === 'asc') {
      const sorted = data?.list?.toSorted((a, b) =>
        a?.material?.name.localeCompare(b?.material?.name)
      )
      return dataMapping(sorted || [], 'material.name')
    }

    if (sort?.value === 'desc') {
      const sorted = data?.list?.toSorted((a, b) =>
        b?.material?.name.localeCompare(a?.material?.name)
      )
      return dataMapping(sorted || [], 'material.name')
    }

    return dataMapping(data?.list || [], 'material.name')
  }, [data, sort])

  return { data: materialChart, isLoading: isLoading || isFetching }
}
