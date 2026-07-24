import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { StorageTemperatureMonitoringListProvider } from './StorageTemperatureMonitoringListContext'
import { ListTable } from './use-cases/displayData/ListTable'
import { ListFilter } from './use-cases/filter/ListFilter'

type StorageTemperatureMonitoringListPageProps = {
  isGlobal?: boolean
}

export default function StorageTemperatureMonitoringListPage({
  isGlobal = false,
}: StorageTemperatureMonitoringListPageProps) {
  const { t } = useTranslation(['storageTemperatureMonitoringList'])

  return (
    <StorageTemperatureMonitoringListProvider isGlobal={isGlobal}>
      <Meta
        title={generateMetaTitle(
          t('storageTemperatureMonitoringList:table.title')
        )}
      />
      <Container
        title={t('storageTemperatureMonitoringList:table.title')}
        hideTabs={isGlobal}
      >
        <div className="ui-space-y-6">
          <ListFilter />
          <ListTable />
        </div>
      </Container>
    </StorageTemperatureMonitoringListProvider>
  )
}
