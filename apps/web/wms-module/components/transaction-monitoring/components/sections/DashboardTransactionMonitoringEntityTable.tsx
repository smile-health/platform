import { useState } from 'react';
import { OptionType } from '@repo/ui/components/react-select';
import DashboardBox from '../DashboardBox';
import DashboardDataTable from '../DashboardDataTable';
import { Values } from 'nuqs';
import { useTranslation } from 'react-i18next';

import { TEntity } from '@/types/transaction-monitoring';
import {
  TransactionChartType,
  DEFAULT_DOWNLOAD_EXTENSIONS,
} from '../../constants/transaction-monitoring.constant';
import useGetEntityDataTable from '../../hooks/useGetEntityDataTable';

type Value = TEntity;

type Props = Readonly<{
  tab: TransactionChartType;
  filter: Values<Record<string, any>>;
}>;

export default function DashboardTransactionMonitoringEntityTable({
  tab,
  filter,
}: Props) {
  const [sort, setSort] = useState<OptionType | null>(null);
  const { t } = useTranslation('transactionMonitoring');

  const fileNameMap = {
    [TransactionChartType.Entity]: 'Entity',
    [TransactionChartType.Entity_Group]: 'Entity Group',
    [TransactionChartType.Entity_Complete]: 'Entity Complete',
  } as Record<TransactionChartType, string>;

  const isCompleteEntity = tab === TransactionChartType.Entity_Complete;
  const downloadExtensions = isCompleteEntity
    ? [...DEFAULT_DOWNLOAD_EXTENSIONS, 'xlsx']
    : DEFAULT_DOWNLOAD_EXTENSIONS;

  const {
    dataSource,
    columns,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  } = useGetEntityDataTable(filter, tab, sort?.value);

  return (
    <DashboardBox.Body>
      <DashboardBox.Config
        download={{
          targetElementId: 'dashboard-transaction-monitoring-tab',
          fileName: `Dashboard Transaction Monitoring - By ${fileNameMap?.[tab]}`,
          extensions: downloadExtensions,
        }}
        sort={{
          show: true,
          value: sort,
          onChange: setSort,
          placeholder: t('title.sort_province'),
        }}
      />
      <DashboardBox.Content isLoading={isLoading}>
        <DashboardDataTable<Value>
          data={(dataSource?.data?.data as Value[]) ?? []}
          page={page}
          paginate={paginate}
          columns={columns}
          totalItem={dataSource?.data.pagination.total}
          totalPage={dataSource?.data.pagination.pages}
          listPagination={dataSource?.list_pagination}
          onChangePage={handleChangePage}
          onChangePaginate={handleChangePaginate}
        />
      </DashboardBox.Content>
    </DashboardBox.Body>
  );
}
