import { forwardRef } from 'react'
import { DataTable } from '#components/data-table'
import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTOverall from '../../hooks/useDashboardIOTOverall'
import DashboardOrderResponseTimeChart from '../components/DashboardOrderResponseTimeChart'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

const DashboardOrderResponseTimeOverall = forwardRef<
  TDashboardIOTHandler,
  Props
>(({ filter, enabled = false }, ref) => {
  const { t } = useTranslation('dashboardOrder')

  const { dataSource, isLoading } = useDashboardIOTOverall(ref, {
    path: 'order-response',
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
    meta: {
      headerClassName: 'ui-text-center',
      cellClassName: 'ui-text-center',
    },
  }))

  return (
    <DashboardOverallContainer updatedAt={dataSource?.last_updated}>
      {(view) => {
        if (view === 'chart') {
          return (
            <DashboardOrderResponseTimeChart
              type={filter?.period?.value}
              data={chartData}
              isLoading={isLoading}
              range={filter?.range}
            />
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
})

DashboardOrderResponseTimeOverall.displayName =
  'DashboardOrderResponseTimeOverall'

export default DashboardOrderResponseTimeOverall
