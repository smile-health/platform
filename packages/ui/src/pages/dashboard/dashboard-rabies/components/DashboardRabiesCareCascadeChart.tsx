import { useQuery } from '@tanstack/react-query'
import { StackedBarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { handleCareCascadeDataChart } from '../dashboard-rabies.helper'
import { getCareCascade } from '../dashboard-rabies.service'
import { CareCascadeParams } from '../dashboard-rabies.type'

export type Props = Readonly<{
  enabled?: boolean
  params: CareCascadeParams
}>

export default function DashboardRabiesCareCascadeChart({
  enabled,
  params,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardRabies')

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['rabies-care-cascade', params, language],
    queryFn: () => getCareCascade(params),
    enabled,
  })

  const chartData = handleCareCascadeDataChart(t, dataSource?.data ?? [])

  return (
    <div className="ui-space-y-4">
      <DashboardBox.Content
        className="ui-h-96"
        isEmpty={!dataSource?.data?.length}
        isLoading={isLoading || isFetching}
      >
        <StackedBarChart
          data={chartData}
          options={{
            scales: {
              y: {
                grace: '10%',
                ticks: {
                  callback(tickValue: number) {
                    return numberFormatter(tickValue, language)
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: true,
              },
              datalabels: {
                display: false,
              },
              tooltip: {
                mode: 'index',
                axis: 'x',
                intersect: false,
                callbacks: {
                  label: function (context) {
                    const label = context?.dataset?.label
                    const value = context.parsed.y ?? context.raw
                    return `${label}: ${numberFormatter(value, language)}`
                  },
                },
              },
            },
          }}
        />
      </DashboardBox.Content>
    </div>
  )
}
