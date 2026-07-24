import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import cx from '#lib/cx'
import DashboardDataTable from '#pages/dashboard/components/DashboardDataTable'

import { StockTakingType } from '../dashboard-stock-taking.constant'
import {
  TCompliance,
  TMaterial,
  TResult,
  TStockTakingDashboard,
} from '../dashboard-stock-taking.type'
import DashboardStockTakingMaterialTable from './DashboardStockTakingMaterialTable'
import DashboardStockTakingSummaryGroup from './DashboardStockTakingSummaryGroup'
import DashboardStockTakingSummarySkeleton from './DashboardStockTakingSummarySkeleton'

type Table<T> = TStockTakingDashboard & {
  data: T[]
}

type Props = Readonly<{
  tab: StockTakingType
  page: number
  paginate: number
  handleChangePage: (page: number) => void
  handleChangePaginate: (paginate: number) => void
  isLoading: boolean
  isLoadingSummary?: boolean
  summary?: {
    name: string
    list?: {
      title: string
      value: number
      percentage?: number
      colorClass: string
    }[]
  }[]
  table?: Table<TCompliance | TResult | TMaterial>
  columns: Array<ColumnDef<any>>
}>

export default function DashboardStockTakingDataDisplay({
  tab,
  page,
  table,
  summary,
  columns,
  paginate,
  isLoading,
  isLoadingSummary: loadingSummaryProps,
  handleChangePage,
  handleChangePaginate,
}: Props) {
  const [loadingSummary, setLoadingSummary] = useState(tab !== 'material')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingSummary(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const isLoadingSummary = loadingSummaryProps || loadingSummary

  return (
    <div className="ui-space-y-6">
      {isLoadingSummary && tab && (
        <DashboardStockTakingSummarySkeleton type={tab} />
      )}
      {!isLoadingSummary &&
        tab !== 'material' &&
        summary?.map((item) => (
          <DashboardStockTakingSummaryGroup
            key={item?.name}
            title={item?.name}
            gridColsClass={cx({
              'ui-grid-cols-3': tab === 'entity',
              'ui-grid-cols-5': tab === 'result',
            })}
            list={item?.list}
          />
        ))}

      {tab !== 'material' ? (
        <DashboardDataTable
          data={table?.data || []}
          page={page}
          paginate={paginate}
          totalItem={table?.total_item}
          totalPage={table?.total_page}
          onChangePage={handleChangePage}
          onChangePaginate={handleChangePaginate}
          listPagination={table?.list_pagination}
          isLoading={isLoading}
          columns={columns}
        />
      ) : (
        <DashboardStockTakingMaterialTable
          page={page}
          paginate={paginate}
          isLoading={isLoading}
          handleChangePage={handleChangePage}
          handleChangePaginate={handleChangePaginate}
          table={table as Table<TMaterial>}
          key={table?.toString()}
        />
      )}
    </div>
  )
}
