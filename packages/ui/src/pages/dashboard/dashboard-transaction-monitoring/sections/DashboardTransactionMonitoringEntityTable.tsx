import { useState } from 'react'
import { OptionType } from '#components/react-select'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import DashboardDataTable from '#pages/dashboard/components/DashboardDataTable'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { DEFAULT_DOWNLOAD_EXTENSIONS } from '../../dashboard.constant'
import { TEntity } from '../../dashboard.type'
import { TransactionChartType } from '../dashboard-transaction-monitoring.constant'
import { TEntityComplete } from '../dashboard-transaction-monitoring.type'
import useGetEntityDataTable from '../hooks/useGetEntityDataTable'

type Value = TEntity | TEntityComplete

type Props = Readonly<{
  tab: TransactionChartType
  filter: Values<Record<string, any>>
}>

export default function DashboardTransactionMonitoringEntityTable({
  tab,
  filter,
}: Props) {
  const [sort, setSort] = useState<OptionType | null>(null)
  const { t } = useTranslation('dashboardMonitoringTransactions')

  const fileNameMap = {
    [TransactionChartType.Entity]: 'Entity',
    [TransactionChartType.Entity_Complete]: 'Entity Complete',
  } as Record<TransactionChartType, string>

  const isCompleteEntity = tab === TransactionChartType.Entity_Complete
  const downloadExtensions = isCompleteEntity
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
    <DashboardBox.Body bordered rounded>
      <DashboardBox.Config
        download={{
          targetElementId: [
            'active-filter',
            'dashboard-transaction-monitoring-tab',
          ],
          fileName: `Dashboard Transaction Monitoring - By ${fileNameMap?.[tab]}`,
          extensions: downloadExtensions,
        }}
        sort={{
          show: !isCompleteEntity,
          value: sort,
          onChange: setSort,
          placeholder: t('title.sort.id', {
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
