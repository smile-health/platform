import { useQuery } from '@tanstack/react-query'
import DashboardBigNumberSummarize from '#pages/dashboard/components/DashboardBigNumberSummarize'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../../dashboard.helper'
import { getTransactionMonitoringBigNumber } from '../dashboard-transaction-monitoring.service'

type Props = Readonly<{
  filter: Values<Record<string, any>>
}>

export default function DashboardTransactionMonitoringBigNumber({
  filter,
}: Props) {
  const { t } = useTranslation('dashboardMonitoringTransactions')
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0

  const {
    data: bigNumber,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ['transaction-monitoring-big-number', params],
    queryFn: () => getTransactionMonitoringBigNumber(params),
    enabled,
  })

  const isQty = filter?.informationType === '0'

  const type = isQty
    ? t('data.information_type.quantity')
    : t('data.information_type.frequency')

  return (
    <DashboardBigNumberSummarize
      id="dashboard-transaction-monitoring-tab"
      exportFileName="Dashboard Transaction Monitoring - Big Number"
      withContainer={false}
      value={bigNumber?.data}
      isLoading={isLoading || isFetching}
      description={t('title.total_transactions', { type })}
    />
  )
}
