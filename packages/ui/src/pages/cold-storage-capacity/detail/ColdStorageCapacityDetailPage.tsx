'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { Alert } from '#components/alert'
import { EmptyState } from '#components/empty-state'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import {
  ColdStorageCapacityDetailProvider,
  useColdStorageCapacityDetail,
} from './ColdStorageCapacityDetailContext'
import CapacityCards from './use-cases/display-capacity-cards/CapacityCards'
import HeaderInfo from './use-cases/display-header-info/HeaderInfo'
import MaterialSection from './use-cases/display-material-section/MaterialSection'
import TemperatureStorageCard from './use-cases/display-material-section/TemperatureStorageCard'

function ColdStorageCapacityDetailContent() {
  const { t } = useTranslation('coldStorageCapacity')
  const { data, temperatureStorages } = useColdStorageCapacityDetail()

  const showWarning = data && data.projected_capacity.percentage_used > 100

  return (
    <div className="ui-space-y-6">
      <div className="ui-border ui-border-gray-200 ui-rounded ui-overflow-hidden">
        <HeaderInfo />
        <div className="ui-p-6 space-y-6">
          <CapacityCards />
          {showWarning && (
            <Alert type="danger" className="ui-border-danger-500 ui-border">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon
                  fill="none"
                  strokeWidth={2}
                  className="ui-size-4 ui-stroke-danger-500"
                />
                {t('detail.warning.message')}
              </div>
            </Alert>
          )}
        </div>
        <MaterialSection />
      </div>

      <div className="space-y-6">
        {temperatureStorages.length > 0 ? (
          temperatureStorages?.map((storage) => (
            <TemperatureStorageCard key={storage.id} data={storage} />
          ))
        ) : (
          <EmptyState
            title={t('detail.temperatureStorage.emptyState.title')}
            description={t('detail.temperatureStorage.emptyState.description')}
          />
        )}
      </div>
    </div>
  )
}

export default function ColdStorageCapacityDetailPage() {
  const { t } = useTranslation(['common', 'coldStorageCapacity'])
  const router = useSmileRouter()

  const pageTitle = t('coldStorageCapacity:detail.title')

  return (
    <ColdStorageCapacityDetailProvider>
      <Meta title={generateMetaTitle(pageTitle)} />
      <Container
        title={pageTitle}
        withLayout
        backButton={{
          show: true,
          label: t('common:back_to_list'),
          onClick: () => {
            router.pushGlobal('/v5/cold-storage-capacity')
          },
        }}
      >
        <ColdStorageCapacityDetailContent />
      </Container>
    </ColdStorageCapacityDetailProvider>
  )
}
