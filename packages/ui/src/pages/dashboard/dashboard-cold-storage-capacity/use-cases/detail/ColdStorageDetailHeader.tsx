import { Button } from '#components/button'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

export function ColdStorageDetailHeader() {
  const { t } = useTranslation('dashboardColdStorageCapacity')
  const { detail } = useDashboardColdStorageCapacity()

  return (
    <DashboardBox.Header className="ui-bg-gray-100 ui-pt-6 ui-border-b ui-border-gray-300 ui-w-full">
      <div className="ui-flex ui-items-start ui-justify-between ui-w-full ui-text-left">
        <div>
          <h3 className="ui-text-base ui-font-semibold">
            {t('section.details.title')}
          </h3>
          <p className="ui-text-base ui-text-gray-500">
            {t('section.details.subtitle')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={detail.onResetPqs}>
          {t('section.details.reset')}
        </Button>
      </div>
    </DashboardBox.Header>
  )
}
