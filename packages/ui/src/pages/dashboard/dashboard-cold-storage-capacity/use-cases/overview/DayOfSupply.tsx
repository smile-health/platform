import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

export default function DayOfSupply() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { overview } = useDashboardColdStorageCapacity()

  const value = overview?.data?.day_of_supply?.qty || 0

  return (
    <DashboardColdStorageCapacityBox
      id="day-of-supply"
      title={t('section.day_of_supply.title')}
      subtitle={t('section.day_of_supply.subtitle')}
      info={<p>{t('section.day_of_supply.info')}</p>}
      showConfig={false}
      lastUpdated={overview?.data?.day_of_supply?.last_update}
      isLoading={overview?.isLoading}
      isEmpty={!value}
    >
      <div className="ui-flex ui-flex-col ui-items-center ui-justify-center ui-py-6">
        <span className="ui-text-4xl ui-font-bold ui-text-[#0C3045]">
          {numberFormatter(value, language)}
        </span>
        <span className="ui-text-sm ui-text-gray-500 ui-mt-1">
          {t('section.day_of_supply.unit')}
        </span>
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
