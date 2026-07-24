import { StackedBarChart } from '#components/chart'
import { OptionType } from '#components/react-select'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../../components/DashboardBox'
import {
  GetExcursionParams,
  TempStatus,
  WhoPqsStatus,
} from '../dashboard-temperature-monitoring.types'
import { useExportTemperatureReadingsXls } from '../hooks'

type ExcursionFilterState = {
  excursion_durations: OptionType[]
  temp_min_max: OptionType | null
  is_pqs: WhoPqsStatus | null
}

type TemperatureReadingsDistributionChartProps = Readonly<{
  data?: TempStatus[]
  isLoading?: boolean
  lastUpdated?: string
  params?: GetExcursionParams
  excursionFilter: ExcursionFilterState
}>

const COLORS = {
  below: '#0C4A6E',
  between: '#38BDF8',
  normal: '#10B981',
  above: '#EF476F',
  offline: '#D1D5DB',
}

const MIN_HEIGHT = 200
const ROW_HEIGHT = 40

export default function TemperatureReadingsDistributionChart({
  data,
  isLoading,
  lastUpdated,
  params,
  excursionFilter,
}: TemperatureReadingsDistributionChartProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAssetTemperatureMonitoring')

  const { exportXls } = useExportTemperatureReadingsXls({
    params: params ?? {},
    excursionFilter,
  })

  const items = data?.length ? data : []
  const chartHeight = Math.max(MIN_HEIGHT, items.length * ROW_HEIGHT)

  const chartData = {
    labels: items.map((item) => item.name),
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
        label: t('temperature_excursion.charts.legend.normal'),
        data: items.map((item) => item.normal_temp),
        backgroundColor: COLORS.normal,
      },
      {
        label: t('temperature_excursion.charts.legend.above'),
        data: items.map((item) => item.more_than_temp),
        backgroundColor: COLORS.above,
      },
      {
        label: t('temperature_excursion.charts.legend.offline'),
        data: items.map((item) => item.offline),
        backgroundColor: COLORS.offline,
      },
    ],
  }

  return (
    <DashboardBox.Root id="temperature-readings-distribution-chart">
      <DashboardBox.Header className="ui-bg-white ui-border-b ui-border-gray-200">
        <div className="ui-flex ui-flex-col ui-items-center ui-justify-center">
          <div className="ui-flex ui-items-center ui-gap-1">
            <h3 className="ui-font-semibold ui-text-sm">
              {t('temperature_excursion.charts.readings_distribution.title')}
            </h3>
            <DashboardBox.InfoModal
              title={
                <p>
                  {t(
                    'temperature_excursion.charts.readings_distribution.title'
                  )}
                  <br />
                  {t(
                    'temperature_excursion.charts.readings_distribution.subtitle'
                  )}
                </p>
              }
            >
              <p className="ui-text-gray-500">
                {t('temperature_excursion.charts.readings_distribution.info')}
              </p>
            </DashboardBox.InfoModal>
          </div>
          <p className="ui-text-xs ui-text-gray-500">
            {t('temperature_excursion.charts.readings_distribution.subtitle')}
          </p>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: 'temperature-readings-distribution-chart',
            fileName: t(
              'temperature_excursion.charts.readings_distribution.title'
            ),
            extensions: ['png', 'jpg', 'pdf', 'xls'],
            onXlsClick: exportXls,
          }}
          withRegionSection={false}
        />
        <DashboardBox.Content isLoading={isLoading} isEmpty={!items.length}>
          <div style={{ height: chartHeight }}>
            <StackedBarChart
              data={chartData}
              layout="horizontal"
              isPercentage
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
                        return items[index]?.name ?? ''
                      },
                      label: (context) => {
                        const index = context.dataIndex
                        const item = items[index]
                        const datasetIndex = context.datasetIndex
                        const value = context.raw as number

                        const durationMap = [
                          item.duration_less_than_temp,
                          item.duration_between_temp,
                          item.duration_normal_temp,
                          item.duration_more_than_temp,
                          item.duration_offline,
                        ]
                        const duration = durationMap[datasetIndex]

                        return `${context.dataset.label}: ${numberFormatter(value, language)}% (${numberFormatter(duration, language)} hours)`
                      },
                      afterBody: (context) => {
                        const index = context[0]?.dataIndex
                        const item = items[index]
                        return `${t('temperature_excursion.charts.readings_distribution.tooltip.cold_storages_count', { count: item.rtmd })}, ${t('temperature_excursion.charts.readings_distribution.tooltip.facilities_count', { count: item.entities })}`
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    max: 100,
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
