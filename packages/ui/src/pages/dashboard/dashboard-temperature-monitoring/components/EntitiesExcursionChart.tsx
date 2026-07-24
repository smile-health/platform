import { PieChart } from '#components/chart'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../../components/DashboardBox'
import { TotalEntities } from '../dashboard-temperature-monitoring.types'

type EntitiesExcursionChartProps = Readonly<{
  data?: TotalEntities
  isLoading?: boolean
  lastUpdated?: string
}>

const COLORS = ['#0C4A6E', '#38BDF8', '#EF476F']

export default function EntitiesExcursionChart({
  data,
  isLoading,
  lastUpdated,
}: EntitiesExcursionChartProps) {
  const { t } = useTranslation('dashboardAssetTemperatureMonitoring')

  const chartData = data
    ? [
        {
          name: t('temperature_excursion.charts.legend.below'),
          value: data.less_than_temp.total,
        },
        {
          name: t('temperature_excursion.charts.legend.between'),
          value: data.between_temp.total,
        },
        {
          name: t('temperature_excursion.charts.legend.above'),
          value: data.more_than_temp.total,
        },
      ]
    : []

  return (
    <DashboardBox.Root id="entities-excursion-chart">
      <DashboardBox.Header className="ui-bg-white ui-border-b ui-border-gray-200">
        <div className="ui-flex ui-flex-col ui-items-center ui-justify-center">
          <div className="ui-flex ui-items-center ui-gap-1">
            <h3 className="ui-font-semibold ui-text-sm">
              {t('temperature_excursion.charts.entities_excursion.title')}
            </h3>
            <DashboardBox.InfoModal
              title={
                <p>
                  {t('temperature_excursion.charts.entities_excursion.title')}
                  <br />
                  {t(
                    'temperature_excursion.charts.entities_excursion.subtitle'
                  )}
                </p>
              }
            >
              <p className="ui-text-gray-500">
                {t('temperature_excursion.charts.entities_excursion.info')}
              </p>
            </DashboardBox.InfoModal>
          </div>
          <p className="ui-text-xs ui-text-gray-500">
            {t('temperature_excursion.charts.entities_excursion.subtitle')}
          </p>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: 'entities-excursion-chart',
            fileName: t(
              'temperature_excursion.charts.entities_excursion.title'
            ),
          }}
          withRegionSection={false}
        />
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={!data || data?.total === 0}
        >
          <div className="ui-h-[250px]">
            <PieChart
              data={chartData}
              color={COLORS}
              radius="60%"
              center={['50%', '45%']}
              legendOptions={{ bottom: 0 }}
              labelFormatter="{c} ({d}%)"
              tooltipFormatter="{b}: {c} ({d}%)"
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
