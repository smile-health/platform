import { forwardRef } from 'react'
import { CellContext } from '@tanstack/react-table'
import { StackedBarChart } from '#components/chart'
import { DataTable } from '#components/data-table'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'
import { formatNumberShort, numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTOverall from '../../hooks/useDashboardIOTOverall'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

const DashboardDiscardOverall = forwardRef<TDashboardIOTHandler, Props>(
  ({ filter, enabled = false }, ref) => {
    const {
      t,
      i18n: { language },
    } = useTranslation('dashboardDiscard')

    const { dataSource, isLoading } = useDashboardIOTOverall(ref, {
      path: 'stock-discard',
      filter,
      enabled,
    })

    const labels = dataSource?.data?.categories?.map(
      (category) => category?.label
    )
    const chartData = {
      labels,
      datasets: dataSource?.data?.dataset?.map(({ color, ...rest }) => ({
        ...rest,
        backgroundColor: color,
        maxBarThickness: 150,
      })),
    }

    const tableData = dataSource?.data?.dataset?.map((item) => {
      const additionalData = item?.data?.reduce((a, c, i) => {
        return {
          ...a,
          [labels[i]]: c,
        }
      }, {})
      return {
        label: item?.label,
        ...additionalData,
      }
    })

    const conditionalColumns = labels?.map((label) => ({
      header: label,
      accessorKey: `${label}`,
      cell: ({ getValue }: CellContext<unknown, unknown>) =>
        numberFormatter(getValue<number>() ?? 0, language),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    }))

    const subtitle =
      filter?.range?.start && filter?.range?.end
        ? t('from_to', {
            from: dayjs(filter?.range?.start).format('DD-MM-YYYY'),
            to: dayjs(filter?.range?.end).format('DD-MM-YYYY'),
          })
        : ''

    return (
      <DashboardOverallContainer updatedAt={dataSource?.last_updated}>
        {(view) => {
          if (view === 'chart') {
            return (
              <DashboardCommonChartContainer
                isLoading={isLoading}
                isEmpty={!chartData?.datasets?.length}
                subtitle={subtitle}
                fileName="Dashboard Discard"
              >
                <StackedBarChart
                  data={chartData}
                  options={{
                    scales: {
                      y: {
                        ticks: {
                          callback(tickValue: number) {
                            return formatNumberShort(tickValue, language)
                          },
                        },
                      },
                      x: {
                        ticks: {
                          minRotation: filter?.period?.value === 'day' ? 45 : 0,
                          maxRotation: 45,
                          font: {
                            size: filter?.period?.value === 'day' ? 10 : 12,
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                      },
                      datalabels: {
                        display: (context) => {
                          const dataIndex = context.dataIndex
                          const datasets = context.chart.data.datasets

                          const lastPositiveIndex = [...datasets]
                            .map((ds, i) => ({ ds, i }))
                            .filter(
                              ({ ds, i }) =>
                                context.chart.isDatasetVisible(i) &&
                                ((ds.data?.[dataIndex] as number) ?? 0) > 0
                            )
                            .at(-1)?.i

                          return context.datasetIndex === lastPositiveIndex
                        },
                        anchor: 'end',
                        align: 'end',
                        color: '#404040',
                        formatter: (_, context) => {
                          const index = context.dataIndex

                          const chartData = context.chart.data.datasets
                          const total = chartData?.reduce(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (sum: number, ds: any, i) => {
                              const isActive = context.chart.isDatasetVisible(i)
                              return sum + (isActive ? ds?.data?.[index] : 0)
                            },
                            0
                          )

                          return formatNumberShort(total, language)
                        },
                      },
                    },
                  }}
                />
              </DashboardCommonChartContainer>
            )
          }

          return (
            <DataTable
              key={labels?.toString()}
              data={tableData}
              columns={[
                {
                  header: t('columns.type'),
                  accessorKey: 'label',
                },
                ...conditionalColumns,
              ]}
            />
          )
        }}
      </DashboardOverallContainer>
    )
  }
)

DashboardDiscardOverall.displayName = 'DashboardDiscardOverall'

export default DashboardDiscardOverall
