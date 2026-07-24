import { forwardRef } from 'react'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTOverall from '../../hooks/useDashboardIOTOverall'
import DashboardAbnormalStockChart from '../components/DashboardAbnormalStockChart'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

type DataTableRow = {
  label: string
  value: number
}

const DashboardAbnormalStockOverall = forwardRef<TDashboardIOTHandler, Props>(
  ({ filter, enabled = false }, ref) => {
    const {
      t,
      i18n: { language },
    } = useTranslation('dashboardInventory')

    const { dataSource, isLoading } = useDashboardIOTOverall(ref, {
      path: 'abnormal-stock',
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
        header: `${filter?.transaction_type?.label} - ${filter?.information_type?.label}`,
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
              <DashboardAbnormalStockChart
                data={overviewData}
                isLoading={isLoading}
                range={filter?.range}
                color={dataSource?.data?.dataset?.[0]?.color}
                title={`${filter?.transaction_type?.label} - ${filter?.information_type?.label}`}
              />
            )
          }

          return <DataTable data={overviewData} columns={columns} />
        }}
      </DashboardOverallContainer>
    )
  }
)

DashboardAbnormalStockOverall.displayName = 'DashboardAbnormalStockOverall'

export default DashboardAbnormalStockOverall
