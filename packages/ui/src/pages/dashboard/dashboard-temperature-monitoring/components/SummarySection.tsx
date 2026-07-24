import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  RtmdTotal,
  VaccineColdstorage,
} from '../dashboard-temperature-monitoring.types'
import DashboardTemperatureMonitoringBox from './DashboardTemperatureMonitoringBox'

type SummarySectionProps = Readonly<{
  data?: {
    coldStorages?: VaccineColdstorage
    rtmd?: RtmdTotal
    lastUpdated?: string
  }
  isLoading?: boolean
}>

export default function SummarySection({
  data,
  isLoading,
}: SummarySectionProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAssetTemperatureMonitoring')

  const lastUpdatedText = data?.lastUpdated
    ? t('summary.last_updated_at', { time: data.lastUpdated })
    : undefined

  const coldStoragesMetrics = [
    {
      value: data?.coldStorages?.total ?? 0,
      label: t('summary.total'),
      lastUpdated: lastUpdatedText,
    },
    {
      value: data?.coldStorages?.rtmd ?? 0,
      label: t('summary.relation_to_rtmd'),
      lastUpdated: lastUpdatedText,
    },
  ]

  const rtmdsMetrics = [
    {
      value: data?.rtmd?.total ?? 0,
      label: t('summary.total'),
      lastUpdated: lastUpdatedText,
    },
    {
      value: data?.rtmd?.online ?? 0,
      label: t('summary.online'),
      lastUpdated: lastUpdatedText,
    },
  ]

  return (
    <div className="ui-grid ui-grid-cols-2 ui-gap-6 ui-mt-6">
      <DashboardTemperatureMonitoringBox
        id="summary-cold-storages"
        title={t('title.number_of_cold_storages')}
        info={
          <div className="ui-space-y-4 ui-text-gray-500">
            <p>
              {t('summary.total')}: {t('summary.cold_storages_info.total')}
            </p>
            <p>
              {t('summary.relation_to_rtmd')}:{' '}
              {t('summary.cold_storages_info.relation_to_rtmd')}
            </p>
          </div>
        }
        isLoading={isLoading}
        showConfig={false}
      >
        <div className="ui-grid ui-grid-cols-2 ui-divide-x ui-divide-neutral-300">
          {coldStoragesMetrics.map((metric, index) => (
            <div
              key={index}
              className="ui-text-center ui-py-4 ui-px-12 ui-space-y-2"
            >
              <p className="ui-text-3xl ui-font-bold ui-text-neutral-800">
                {numberFormatter(metric.value, language)}
              </p>
              <p className="ui-text-sm ui-text-neutral-600 ui-font-semibold">
                {metric.label}
              </p>
              {metric.lastUpdated && (
                <p className="ui-text-xs ui-text-neutral-400">
                  {metric.lastUpdated}
                </p>
              )}
            </div>
          ))}
        </div>
      </DashboardTemperatureMonitoringBox>

      <DashboardTemperatureMonitoringBox
        id="summary-rtmds"
        title={t('title.number_of_rtmds')}
        info={
          <div className="ui-space-y-4 ui-text-gray-500">
            <p>
              {t('summary.total')}: {t('summary.rtmds_info.total')}
            </p>
            <p>
              {t('summary.online')}: {t('summary.rtmds_info.online')}
            </p>
          </div>
        }
        isLoading={isLoading}
        showConfig={false}
      >
        <div className="ui-grid ui-grid-cols-2 ui-divide-x ui-divide-neutral-300">
          {rtmdsMetrics.map((metric, index) => (
            <div
              key={index}
              className="ui-text-center ui-py-4 ui-px-12 ui-space-y-2"
            >
              <p className="ui-text-3xl ui-font-bold ui-text-neutral-800">
                {numberFormatter(metric.value, language)}
              </p>
              <p className="ui-text-sm ui-text-neutral-600 ui-font-semibold">
                {metric.label}
              </p>
              {metric.lastUpdated && (
                <p className="ui-text-xs ui-text-neutral-400 ui-pb-2">
                  {metric.lastUpdated}
                </p>
              )}
            </div>
          ))}
        </div>
      </DashboardTemperatureMonitoringBox>
    </div>
  )
}
