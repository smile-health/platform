import { useState } from 'react'
import { BarChart } from '#components/chart'
import { OptionType } from '#components/react-select'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import useGetMaterialChart from '../hooks/useGetMaterialChart'

type Props = Readonly<{
  color?: string
  filter: Values<Record<string, any>>
}>

export default function DashboardTransactionMonitoringMaterialChart({
  color,
  filter,
}: Props) {
  const { t } = useTranslation('dashboardMonitoringTransactions')
  const [sort, setSort] = useState<OptionType | null>(null)

  const { data, isLoading } = useGetMaterialChart(filter, sort)

  return (
    <DashboardBox.Body bordered rounded>
      <DashboardBox.Config
        download={{
          targetElementId: [
            'active-filter',
            'dashboard-transaction-monitoring-tab',
          ],
          fileName: 'Dashboard Transaction Monitoring - By Material',
          isRemoveContainerHeight: data?.length <= 100,
        }}
        sort={{
          show: true,
          value: sort,
          onChange: setSort,
          placeholder: t('title.sort.name', { type: 'material' }),
        }}
      />
      <DashboardBox.Content
        isLoading={isLoading}
        isEmpty={!data?.length}
        className="ui-max-h-[500px] ui-overflow-y-auto ui-border ui-border-neutral-300 ui-rounded-md"
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
