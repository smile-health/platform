import { StackedBarChart } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../../components/DashboardBox'
import { TotalEventsByAsset } from '../dashboard-temperature-monitoring.types'

type ExcursionByColdStorageTypeChartProps = Readonly<{
  data?: TotalEventsByAsset[]
  isLoading?: boolean
  lastUpdated?: string
}>

const COLORS = {
  below: '#0C4A6E',
  between: '#38BDF8',
  above: '#EF476F',
}

const MIN_HEIGHT = 150
const ROW_HEIGHT = 60

export default function ExcursionByColdStorageTypeChart({
  data,
  isLoading,
  lastUpdated,
}: ExcursionByColdStorageTypeChartProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAssetTemperatureMonitoring')

  const items = data?.length ? data : []
  const chartHeight = Math.max(MIN_HEIGHT, items.length * ROW_HEIGHT)

  const chartData = {
    labels: items.map((item) => [
      item.asset_type ?? '-',
      `(${item.min_temp}°C to ${item.max_temp}°C)`,
    ]),
    datasets: [
      {
        label: t('temperature_excursion.charts.legend.below'),
        data: items.map((item) => item.less_than_temp),
        backgroundColor: COLORS.below,
      },
      {
        label: t('temperature_excursion.charts.legend.between'),
        data: items.map((item) => item.between_temp),
        backgroundColor: COLORS.between,
      },
      {
        label: t('temperature_excursion.charts.legend.above'),
        data: items.map((item) => item.more_than_temp),
        backgroundColor: COLORS.above,
      },
    ],
  }

  return (
    <DashboardBox.Root
      id="excursion-by-cold-storage-type-chart"
      className="ui-flex ui-flex-col"
    >
      <DashboardBox.Header className="ui-bg-white ui-border-b ui-border-gray-200">
        <div className="ui-flex ui-flex-col ui-items-center ui-justify-center">
          <div className="ui-flex ui-items-center ui-gap-1">
            <h3 className="ui-font-semibold ui-text-sm">
              {t('temperature_excursion.charts.excursion_by_type.title')}
            </h3>
            <DashboardBox.InfoModal
              title={
                <p>
                  {t('temperature_excursion.charts.excursion_by_type.title')}
                  <br />
                  {t('temperature_excursion.charts.excursion_by_type.subtitle')}
                </p>
              }
            >
              <p className="ui-text-gray-500">
                {t('temperature_excursion.charts.excursion_by_type.info')}
              </p>
            </DashboardBox.InfoModal>
          </div>
          <p className="ui-text-xs ui-text-gray-500">
            {t('temperature_excursion.charts.excursion_by_type.subtitle')}
          </p>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body className="ui-flex ui-flex-col ui-flex-1">
        <DashboardBox.Config
          download={{
            targetElementId: 'excursion-by-cold-storage-type-chart',
            fileName: t('temperature_excursion.charts.excursion_by_type.title'),
          }}
          withRegionSection={false}
        />
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={!items.length}
          className="ui-flex-1"
        >
          <div style={{ height: chartHeight }}>
            <StackedBarChart
              data={chartData}
              layout="horizontal"
              options={{
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      title: (context) => {
                        const index = context[0]?.dataIndex
                        const item = items[index]
                        const tempRange = `${item.min_temp}°C to ${item.max_temp}°C`
                        return `${item.asset_type} (${tempRange})`
                      },
                      label: (context) => {
                        const value = context.raw as number
                        return `${context.dataset.label}: ${numberFormatter(value, language)}`
                      },
                    },
                  },
                },
              }}
            />
          </div>
          {lastUpdated && (
            <p className="ui-text-xs ui-text-gray-500 ui-text-center ui-mt-2 ui-pb-2">
              {t('summary.last_updated_at', { time: lastUpdated })}
            </p>
          )}
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
