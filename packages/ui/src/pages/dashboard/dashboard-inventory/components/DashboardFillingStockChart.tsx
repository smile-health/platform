import { LineChart } from '#components/chart'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { DataValue } from '../../dashboard.type'

type Props = {
  isLoading?: boolean
  data: DataValue
  color?: string
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardFillingStockChart({
  isLoading = false,
  data,
  range,
  color,
}: Props) {
  const { t } = useTranslation('dashboardInventory')

  const subtitle =
    range?.start && range?.end
      ? t('from_to', {
          from: dayjs(range?.start).format('DD-MM-YYYY'),
          to: dayjs(range?.end).format('DD-MM-YYYY'),
        })
      : ''

  return (
    <DashboardCommonChartContainer
      isLoading={isLoading}
      isEmpty={!data?.length}
      subtitle={subtitle}
      fileName="Dashboard Inventory Filling Stock"
    >
      <LineChart data={data || []} color={color} maxVisible={11} />
    </DashboardCommonChartContainer>
  )
}
