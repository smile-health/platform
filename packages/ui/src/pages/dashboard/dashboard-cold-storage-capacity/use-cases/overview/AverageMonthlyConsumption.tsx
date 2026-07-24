import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

export default function AverageMonthlyConsumption() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { overview } = useDashboardColdStorageCapacity()

  const value = overview?.data?.average_monthly_consumption?.qty || 0

  return (
    <DashboardColdStorageCapacityBox
      id="average-monthly-consumption"
      title={t('section.avg_monthly_consumption.title')}
      subtitle={t('section.avg_monthly_consumption.subtitle')}
      info={<p>{t('section.avg_monthly_consumption.info')}</p>}
      showConfig={false}
      lastUpdated={overview?.data?.average_monthly_consumption?.last_update}
      isLoading={overview?.isLoading}
      isEmpty={!value}
    >
      <div className="ui-flex ui-flex-col ui-items-center ui-justify-center ui-py-6">
        <span className="ui-text-4xl ui-font-bold ui-text-[#0C3045]">
          {numberFormatter(value, language)}
        </span>
        <span className="ui-text-sm ui-text-gray-500 ui-mt-1">
          {t('section.avg_monthly_consumption.unit')}
        </span>
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
