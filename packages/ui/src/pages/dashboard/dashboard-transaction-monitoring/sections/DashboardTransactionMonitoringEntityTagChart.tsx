import { StackedBarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { ChartData } from 'chart.js'
import { useTranslation } from 'react-i18next'

import { secondTopTick } from '../../dashboard.helper'

type Props = Readonly<{
  isLoading?: boolean
  data: ChartData<'bar', number[]>
}>

export default function DashboardTransactionMonitoringEntityTagChart({
  isLoading,
  data,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardMonitoringTransactions')

  return (
    <DashboardBox.Root id="dashboard-transaction-monitoring-entity-tag">
      <DashboardBox.Header bordered>
        {t('title.transaction_by', {
          section: t('title.entity.tag'),
        })}
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: [
              'active-filter',
              'dashboard-transaction-monitoring-entity-tag',
            ],
            fileName: 'Dashboard Transaction Monitoring - By Entity Tag',
          }}
        />
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={!data?.datasets?.length}
          className="ui-h-96"
        >
          <StackedBarChart
            data={data}
            isStacked={false}
            isShortedNumber={false}
            options={{
              scales: {
                y: {
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
              },
            }}
          />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
