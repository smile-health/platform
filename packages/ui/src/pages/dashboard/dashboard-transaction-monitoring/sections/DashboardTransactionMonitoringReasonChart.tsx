import { useState } from 'react'
import { BarChart } from '#components/chart'
import { OptionType } from '#components/react-select'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import useGetTransactionReasonChart from '../hooks/useGetTransactionReasonChart'

type Props = Readonly<{
  color?: string
  filter: Values<Record<string, any>>
}>

export default function DashboardTransactionMonitoringReasonChart({
  color,
  filter,
}: Props) {
  const { t } = useTranslation('dashboardMonitoringTransactions')
  const [sort, setSort] = useState<OptionType | null>(null)

  const { data, isLoading } = useGetTransactionReasonChart(filter, sort)

  return (
    <DashboardBox.Body bordered rounded>
      <DashboardBox.Config
        download={{
          targetElementId: [
            'active-filter',
            'dashboard-transaction-monitoring-tab',
          ],
          fileName: 'Dashboard Transaction Monitoring - By Transaction Reason',
          isRemoveContainerHeight: data?.length <= 100,
        }}
        sort={{
          show: true,
          value: sort,
          onChange: setSort,
          placeholder: t('title.sort.title', {
            type: t('title.reason').toLowerCase(),
          }),
        }}
      />
      <DashboardBox.Content
        isLoading={isLoading}
        isEmpty={!data?.length}
        className="ui-max-h-[500px] ui-overflow-y-auto"
      >
        <BarChart
          data={data}
          layout="horizontal"
          color={color}
          labelColor="#404040"
        />
      </DashboardBox.Content>
    </DashboardBox.Body>
  )
}
