import { forwardRef } from 'react'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import DashboardOverallContainer from '#pages/dashboard/components/DashboardOverallContainer'
import { formatNumberShort, numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTOverall from '../../hooks/useDashboardIOTOverall'
import DashboardStockAvailabilityChart from '../components/DashboardStockAvailabilityChart'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

type DataTableRow = {
  period: string
  [key: string]: string | number
}

const DashboardStockAvailabilityOverall = forwardRef<
  TDashboardIOTHandler,
  Props
>(({ filter, enabled = false }, ref) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardInventory')

  const { dataSource, isLoading } = useDashboardIOTOverall(ref, {
    path: 'stock-availability',
    filter,
    enabled,
  })

  const labels = dataSource?.data?.categories?.map(
    (category) => category?.label
  )

  const chartData = {
    labels,
    series: dataSource?.data?.dataset?.map((item) => ({
      name: item?.label,
      data: item?.data?.map((item) => (!item ? null : item)),
      color: item?.color,
      label: {
        show: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          return formatNumberShort(params?.value, language)
        },
      },
    })),
  }

  const tableData = labels?.map((label, i) => {
    const additionalData = dataSource?.data?.dataset?.reduce((a, c) => {
      return {
        ...a,
        [c?.label]: c?.data?.[i],
      }
    }, {})

    return {
      period: label,
      ...additionalData,
    }
  })

  const columns: ColumnDef<DataTableRow>[] = [
    {
      header: t('columns.period'),
      accessorKey: 'period',
    },
    ...(dataSource?.data?.dataset?.map((item) => ({
      header: item?.label,
      accessorKey: `${item?.label}`,
      cell: ({ getValue }: CellContext<DataTableRow, unknown>) =>
        numberFormatter(getValue<number>() ?? 0, language),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    })) ?? []),
  ]

  return (
    <DashboardOverallContainer updatedAt={dataSource?.last_updated}>
      {(view) => {
        if (view === 'chart') {
          return (
            <DashboardStockAvailabilityChart
              data={chartData}
              isLoading={isLoading}
              range={filter?.range}
              title={filter?.information_type?.label}
            />
          )
        }

        return (
          <DataTable
            key={labels?.toString()}
            data={tableData}
            columns={columns}
          />
        )
      }}
    </DashboardOverallContainer>
  )
})

DashboardStockAvailabilityOverall.displayName =
  'DashboardStockAvailabilityOverall'

export default DashboardStockAvailabilityOverall
