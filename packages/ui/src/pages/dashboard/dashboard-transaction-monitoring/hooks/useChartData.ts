/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { numberFormatter } from '#utils/formatter'
import { LineSeriesOption } from 'echarts/charts'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../../dashboard.helper'
import { exportChart } from '../../dashboard.service'
import { getTransactionMonitoringChart } from '../dashboard-transaction-monitoring.service'

export default function useChartData(filter: Values<Record<string, any>>) {
  const {
    i18n: { language },
  } = useTranslation()
  const paramsChart = handleFilter(filter, false)
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0

  const {
    data: mock,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['chart', paramsChart],
    queryFn: () => getTransactionMonitoringChart(paramsChart),
    enabled,
  })

  const exportQuery = useQuery({
    queryKey: ['chart-export', params],
    queryFn: () => exportChart(params, 'transaction'),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery?.isLoading || exportQuery?.isFetching)

  return {
    isLoading: isLoading || isFetching,
    onExport: () => exportQuery.refetch(),
    chart: {
      byEntityTag: {
        labels: mock?.chart?.by_entity_tag?.categories?.map(
          (category) => category?.label
        ),
        datasets: mock?.chart?.by_entity_tag?.dataset?.map(
          ({ color, ...rest }) => ({
            ...rest,
            backgroundColor: color,
            minBarLength: 1,
          })
        ),
      },
      byMonth: {
        labels: mock?.chart?.by_month?.categories?.map(
          (category) => category?.label
        ),
        series: mock?.chart?.by_month?.dataset?.map((item) => ({
          name: item?.label,
          data: item?.data,
          color: item?.color,
          label: {
            show: true,
            formatter: (params: any) => {
              return numberFormatter(params?.value, language)
            },
          },
          lineStyle: {
            type: item?.dotted_line ? 'dashed' : 'solid',
          } as LineSeriesOption['lineStyle'],
        })),
      },
    },
  }
}
