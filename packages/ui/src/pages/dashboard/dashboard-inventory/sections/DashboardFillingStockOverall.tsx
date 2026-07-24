import { forwardRef } from 'react'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTOverall from '../../hooks/useDashboardIOTOverall'
import DashboardFillingStockChart from '../components/DashboardFillingStockChart'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

type DataTableRow = {
  label: string
  value: number
}

const DashboardFillingStockOverall = forwardRef<TDashboardIOTHandler, Props>(
  ({ filter, enabled = false }, ref) => {
    const {
      t,
      i18n: { language },
    } = useTranslation('dashboardInventory')

    const { dataSource, isLoading } = useDashboardIOTOverall(ref, {
      path: 'filling-stock',
      filter,
      enabled,
    })

    const overviewData = dataSource?.data?.categories?.map((item, index) => {
      const value = dataSource?.data?.dataset?.[0]?.data?.[index]
      return {
        label: item?.label,
        value,
      }
    })

    const columns: ColumnDef<DataTableRow>[] = [
      {
        header: t('columns.period'),
        accessorKey: 'label',
      },
      {
        header: t('stock'),
        accessorKey: 'value',
        cell: ({ getValue }: CellContext<DataTableRow, unknown>) =>
          numberFormatter(getValue<number>() ?? 0, language),
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
      },
    ]

    return (
      <DashboardOverallContainer updatedAt={dataSource?.last_updated}>
        {(view) => {
          if (view === 'chart') {
            return (
              <DashboardFillingStockChart
                data={overviewData}
                isLoading={isLoading}
                range={filter?.range}
                color={dataSource?.data?.dataset?.[0]?.color}
              />
            )
          }

          return <DataTable data={overviewData} columns={columns} />
        }}
      </DashboardOverallContainer>
    )
  }
)

DashboardFillingStockOverall.displayName = 'DashboardFillingStockOverall'

export default DashboardFillingStockOverall
