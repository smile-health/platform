import { useMemo, useState } from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import { useFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import { OptionType } from '#components/react-select'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../components/DashboardBox'
import DashboardFilter from '../components/DashboardFilter'
import AverageOfflineDurationSection from './components/AverageOfflineDurationSection'
import ColdStoragesExcursionChart from './components/ColdStoragesExcursionChart'
import EntitiesExcursionChart from './components/EntitiesExcursionChart'
import ExcursionByColdStorageTypeChart from './components/ExcursionByColdStorageTypeChart'
import ExcursionEpisodesChart from './components/ExcursionEpisodesChart'
import RtmdStatusSection from './components/RtmdStatusSection'
import SummarySection from './components/SummarySection'
import TemperatureExcursionFilter from './components/TemperatureExcursionFilter'
import TemperatureExcursionSection from './components/TemperatureExcursionSection'
import TemperatureReadingsDistributionChart from './components/TemperatureReadingsDistributionChart'
import { WhoPqsStatus } from './dashboard-temperature-monitoring.types'
import { useGetColdStorageData, useGetExcursionData } from './hooks'
import dashboardTemperatureMonitoringFilterSchema from './schemas/dashboardTemperatureMonitoringFilterSchema'

export default function DashboardTemperatureMonitoringPage() {
  const {
    t,
    i18n: { language },
  } = useTranslation(['dashboardAssetTemperatureMonitoring', 'dashboard'])
  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo(
    () => dashboardTemperatureMonitoringFilterSchema(t, language, tDashboard),
    [t, language, tDashboard]
  )

  const filter = useFilter(filterSchema)

  const [selectedDuration, setSelectedDuration] = useState<OptionType[]>([])
  const [temperatureRange, setTemperatureRange] = useState<OptionType | null>(
    null
  )
  const [whoPqsStatus, setWhoPqsStatus] = useState<WhoPqsStatus | null>('0')

  const { data: coldStorageData, isLoading: isColdStorageLoading } =
    useGetColdStorageData(filter?.query)

  const { data: excursionData, isLoading: isExcursionLoading } =
    useGetExcursionData(filter?.query, {
      excursion_durations: selectedDuration,
      temp_min_max: temperatureRange,
      is_pqs: whoPqsStatus,
    })

  const handleExcursionFilterReset = () => {
    setSelectedDuration([])
    setTemperatureRange(null)
    setWhoPqsStatus('0')
  }

  return (
    <div>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardBox.Provider filter={filter?.query} showRegion={false}>
        <DashboardFilter filter={filter} />
        <SummarySection
          data={{
            rtmd: coldStorageData?.rtmd_total,
            coldStorages: coldStorageData?.vaccine_coldstorage,
            lastUpdated: coldStorageData?.updated_at,
          }}
          isLoading={isColdStorageLoading}
        />
        <div className="ui-grid ui-grid-cols-2 ui-gap-6">
          <RtmdStatusSection
            data={{
              items: coldStorageData?.rtmd_status.sort(
                (a, b) => b.total_online - a.total_online
              ),
              lastUpdated: coldStorageData?.updated_at,
            }}
            isLoading={isColdStorageLoading}
          />
          <AverageOfflineDurationSection
            data={{
              items: coldStorageData?.avg_offline_duration_daily,
              lastUpdated: coldStorageData?.updated_at,
            }}
            isLoading={isColdStorageLoading}
          />
        </div>
        <div>
          <TemperatureExcursionSection>
            <TemperatureExcursionFilter
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              temperatureRange={temperatureRange}
              onTemperatureRangeChange={setTemperatureRange}
              whoPqsStatus={whoPqsStatus}
              onWhoPqsChange={setWhoPqsStatus}
            />
            <div className="ui-flex ui-items-center ui-justify-between ui-p-4 ui-bg-gray-200 ui-text-dark-blue ui-rounded-lg">
              <div className="ui-flex ui-items-center ui-gap-2 ui-text-sm">
                <QuestionMarkCircleIcon className="ui-size-5" />
                <span>{t('temperature_excursion.filter.hint')}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExcursionFilterReset}
              >
                {t('temperature_excursion.filter.reset')}
              </Button>
            </div>
            <div className="ui-grid ui-grid-cols-2 ui-gap-6">
              <ExcursionEpisodesChart
                data={excursionData?.total_events_by_category}
                isLoading={isExcursionLoading}
                lastUpdated={excursionData?.updated_at}
              />
              <ColdStoragesExcursionChart
                data={excursionData?.total_asset}
                isLoading={isExcursionLoading}
                lastUpdated={excursionData?.updated_at}
              />
            </div>
            <div className="ui-grid ui-grid-cols-2 ui-gap-6">
              <ExcursionByColdStorageTypeChart
                data={excursionData?.total_events_by_asset}
                isLoading={isExcursionLoading}
                lastUpdated={excursionData?.updated_at}
              />
              <EntitiesExcursionChart
                data={excursionData?.total_entities}
                isLoading={isExcursionLoading}
                lastUpdated={excursionData?.updated_at}
              />
            </div>
            <TemperatureReadingsDistributionChart
              data={excursionData?.temp_status}
              isLoading={isExcursionLoading}
              lastUpdated={excursionData?.updated_at}
              params={filter?.query}
              excursionFilter={{
                excursion_durations: selectedDuration,
                temp_min_max: temperatureRange,
                is_pqs: whoPqsStatus,
              }}
            />
          </TemperatureExcursionSection>
        </div>
      </DashboardBox.Provider>
    </div>
  )
}
