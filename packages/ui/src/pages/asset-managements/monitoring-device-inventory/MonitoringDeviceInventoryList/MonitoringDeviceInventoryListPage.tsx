import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import Error403Page from '#pages/error/Error403Page'
import { generateMetaTitle } from '#utils/strings'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useTranslation } from 'react-i18next'

import { MonitoringDeviceInventoryListProvider } from './MonitoringDeviceInventoryListContext'
import { ListTable } from './use-cases/displayData/ListTable'
import { ListFilter } from './use-cases/filter/ListFilter'

type MonitoringDeviceInventoryListPageProps = {
  isGlobal?: boolean
}

export default function MonitoringDeviceInventoryListPage({
  isGlobal = false,
}: MonitoringDeviceInventoryListPageProps) {
  const isFeatureEnabled = useFeatureIsOn('monitoring_device_inventory')
  const { t } = useTranslation(['monitoringDeviceInventoryList'])

  if (!isFeatureEnabled) return <Error403Page />

  return (
    <MonitoringDeviceInventoryListProvider isGlobal={isGlobal}>
      <Meta
        title={generateMetaTitle(
          t('monitoringDeviceInventoryList:table.title')
        )}
      />
      <Container
        title={t('monitoringDeviceInventoryList:table.title')}
        hideTabs={isGlobal}
      >
        <div className="ui-space-y-6">
          <ListFilter />
          <ListTable />
        </div>
      </Container>
    </MonitoringDeviceInventoryListProvider>
  )
}
