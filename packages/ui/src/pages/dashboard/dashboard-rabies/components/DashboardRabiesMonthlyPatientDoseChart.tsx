import { useQuery } from '@tanstack/react-query'
import { StackedBarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { secondTopTick } from '../../dashboard.helper'
import { getMonthlyPatientDose } from '../dashboard-rabies.service'
import { MonthlyPatientDoseParams } from '../dashboard-rabies.type'

export type Props = Readonly<{
  enabled?: boolean
  params: MonthlyPatientDoseParams
}>

export default function DashboardRabiesMonthlyPatientDoseChart({
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
    queryKey: ['rabies-monthly-patient-dose', params, language],
    queryFn: () => getMonthlyPatientDose(params),
    enabled,
  })

  const labels = dataSource?.data?.map((item) => {
    return dayjs(`${item?.year}-${item?.month}`).format('MMM YYYY')
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: t('label.total_patient'),
        data: dataSource?.data?.map((item) => item?.total_patient),
        backgroundColor: '#06B051',
      },
      {
        label: t('label.total_injection'),
        data: dataSource?.data?.map((item) => item?.total_injection),
        backgroundColor: '#1BA8DF',
      },
    ],
  }

  return (
    <div className="ui-space-y-4">
      <DashboardBox.Content
        className="ui-h-96"
        isEmpty={!dataSource?.data?.length}
        isLoading={isLoading || isFetching}
      >
        <StackedBarChart
          data={chartData}
          isStacked={false}
          isShortedNumber={false}
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
                anchor: 'end',
                color: (ctx) => {
                  const yScale = ctx.chart.scales.y
                  const threshold = secondTopTick(yScale)
                  const value = Number(
                    ctx.dataset.data[ctx.dataIndex] as number
                  )
                  return value >= threshold ? '#FFF' : '#404040'
                },
                align: (ctx) => {
                  const yScale = ctx.chart.scales.y
                  const threshold = secondTopTick(yScale)
                  const value = Number(
                    ctx.dataset.data[ctx.dataIndex] as number
                  )
                  return value >= threshold ? 'start' : 'end'
                },
                rotation: (ctx) => {
                  const index = ctx.dataIndex
                  const value = Number(ctx.dataset?.data?.[index] ?? 0)

                  return value > 0 ? -90 : 0
                },
              },
              tooltip: {
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
