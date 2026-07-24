import { BarChart } from '#components/chart'
import { OptionType } from '#components/react-select'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import { formatNumberShort } from '#utils/formatter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type Props = {
  isLoading?: boolean
  data: OptionType[]
  title?: string
  color?: string
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardAbnormalStockChart({
  isLoading = false,
  data,
  title,
  color,
  range,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardInventory')

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
      title={title}
      subtitle={subtitle}
      fileName="Dashboard Inventory Abnormal Stock"
    >
      <BarChart
        color={color}
        labelColor="#404040"
        data={data || []}
        formatValue={(value) => {
          return formatNumberShort(value as unknown as number, language)
        }}
        options={{
          scales: {
            y: {
              grace: '10%',
              ticks: {
                callback(tickValue: number) {
                  return formatNumberShort(tickValue, language)
                },
              },
            },
          },
        }}
      />
    </DashboardCommonChartContainer>
  )
}
