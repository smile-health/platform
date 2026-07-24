import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { Values } from 'nuqs'

import { dataMapping, handleFilter } from '../dashboard.helper'
import { exportChart, getChart } from '../dashboard.service'

export default function useGetChart(
  filter: Values<Record<string, any>>,
  type: 'stock' | 'transaction'
) {
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['chart', params],
    queryFn: () => getChart(params, type),
    enabled,
    select: (res) => {
      if (res?.chart) {
        return {
          number: res?.chart?.number,
          entityTag: dataMapping(res?.chart?.entity_tag, 'entity_tag_name'),
          month: dataMapping(
            res?.chart?.by_month,
            (item) => `${item?.month} ${item?.year}`
          ),
          expiredMonth:
            type === 'stock'
              ? dataMapping(
                  res?.chart?.byExpMonth,
                  (item) => `${item?.exp_month} ${item?.exp_year}`
                )
              : undefined,
          material:
            type === 'stock'
              ? dataMapping(res?.chart?.material, 'material_name')
              : undefined,
        }
      }
      return {}
    },
  })

  const exportQuery = useQuery({
    queryKey: ['chart-export', params],
    queryFn: () => exportChart(params, type),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery?.isLoading || exportQuery?.isFetching)

  return {
    chart: data,
    isLoading: isLoading || isFetching,
    onExport: () => exportQuery.refetch(),
  }
}
