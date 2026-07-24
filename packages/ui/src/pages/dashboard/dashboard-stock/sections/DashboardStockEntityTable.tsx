import { useState } from 'react'
import { OptionType } from '#components/react-select'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import DashboardDataTable from '#pages/dashboard/components/DashboardDataTable'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { DEFAULT_DOWNLOAD_EXTENSIONS } from '../../dashboard.constant'
import { TEntity } from '../../dashboard.type'
import { StockChartType } from '../dashboard-stock.constant'
import { TMaterialEntity, TStockEntity } from '../dashboard-stock.type'
import useGetEntityDataTable from '../hooks/useGetEntityDataTable'

type Value = TEntity | TMaterialEntity | TStockEntity

type Props = Readonly<{
  tab: StockChartType
  filter: Values<Record<string, any>>
}>

export default function DashboardStockEntityTable({ tab, filter }: Props) {
  const [sort, setSort] = useState<OptionType | null>(null)
  const { t } = useTranslation('dashboardStock')

  const fileNameMap = {
    [StockChartType.Entity]: 'Entity',
    [StockChartType.Material_Entity]: 'Material Entity',
    [StockChartType.Stock_Entity]: 'Stock Entity',
  } as Record<StockChartType, string>

  const isStockEntity = tab === StockChartType.Stock_Entity
  const downloadExtensions = isStockEntity
    ? [...DEFAULT_DOWNLOAD_EXTENSIONS, 'csv']
    : DEFAULT_DOWNLOAD_EXTENSIONS

  const {
    dataSource,
    columns,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  } = useGetEntityDataTable(filter, tab, sort?.value)

  return (
    <DashboardBox.Body>
      <DashboardBox.Config
        download={{
          targetElementId: 'dashboard-stock-tab',
          fileName: `Dashboard Stock - By ${fileNameMap?.[tab]}`,
          extensions: downloadExtensions,
        }}
        sort={{
          show: !isStockEntity,
          value: sort,
          onChange: setSort,
          placeholder: t('title.sort_by', {
            type: t('title.entity.main').toLowerCase(),
          }),
        }}
      />
      <DashboardBox.Content isLoading={isLoading}>
        <DashboardDataTable<Value>
          data={(dataSource?.data as Value[]) ?? []}
          page={page}
          paginate={paginate}
          columns={columns}
          totalItem={dataSource?.total_item}
          totalPage={dataSource?.total_page}
          listPagination={dataSource?.list_pagination}
          onChangePage={handleChangePage}
          onChangePaginate={handleChangePaginate}
        />
      </DashboardBox.Content>
    </DashboardBox.Body>
  )
}
