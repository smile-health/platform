import { forwardRef } from 'react'
import { CellContext } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTOverall from '../../hooks/useDashboardIOTOverall'
import DashboardCountStockChart from '../components/DashboardCountStockChart'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

const DashboardCountStockOverall = forwardRef<TDashboardIOTHandler, Props>(
  ({ filter, enabled = false }, ref) => {
    const {
      t,
      i18n: { language },
    } = useTranslation('dashboardInventory')

    const { dataSource, isLoading } = useDashboardIOTOverall(ref, {
      path: 'add-remove-stock',
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

    return (
      <DashboardOverallContainer updatedAt={dataSource?.last_updated}>
        {(view) => {
          if (view === 'chart') {
            return (
              <DashboardCountStockChart
                type={filter?.period?.value}
                data={chartData}
                isLoading={isLoading}
                range={filter?.range}
                title={`${filter?.transaction_type?.label}  - ${filter?.reason?.label ?? 'Semua'}`}
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
  }
)

DashboardCountStockOverall.displayName = 'DashboardCountStockOverall'

export default DashboardCountStockOverall
