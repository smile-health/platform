import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { AssetManagementsDetailBox } from '#pages/asset-managements/components/AssetManagementsDetailBox'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { AssetInfoHeader } from './components/AssetInfoHeader'
import { DeviceDetailInfo } from './components/DeviceDetailInfo'
import {
  StorageTemperatureMonitoringDetailConsumer,
  StorageTemperatureMonitoringDetailProvider,
} from './StorageTemperatureMonitoringDetailContext'
import { LoggerActivity } from './use-cases/display-logger-activity/LoggerActivity'
import { RelationTable } from './use-cases/display-relation-table/RelationTable'

type StorageTemperatureMonitoringDetailPageProps = Readonly<{
  isGlobal?: boolean
}>

export default function StorageTemperatureMonitoringDetailPage({
  isGlobal = false,
}: StorageTemperatureMonitoringDetailPageProps) {
  const { t } = useTranslation(['common', 'storageTemperatureMonitoringDetail'])
  const router = useSmileRouter()
  const arrayPathname = router?.pathname?.split('/')
  const grandChildRoute = arrayPathname?.[arrayPathname?.length - 2]

  return (
    <StorageTemperatureMonitoringDetailProvider isGlobal={isGlobal}>
      <StorageTemperatureMonitoringDetailConsumer>
        {({ isWarehouse }) => {
          const pageTitle = isWarehouse
            ? t('storageTemperatureMonitoringDetail:page.title_warehouse')
            : t('storageTemperatureMonitoringDetail:page.title')

          return (
            <>
              <Meta title={generateMetaTitle(pageTitle)} />
              <Container
                title={pageTitle}
                withLayout
                backButton={{
                  label: t('common:back_to_list'),
                  show: true,
                  onClick: () => {
                    router.pushGlobal(
                      `/v5/global-asset/management/storage-temperature-monitoring/${grandChildRoute}`
                    )
                  },
                }}
              >
                <div className="ui-space-y-6">
                  <AssetManagementsDetailBox className="space-y-6">
                    <AssetInfoHeader />
                    <DeviceDetailInfo />
                    <RelationTable />
                  </AssetManagementsDetailBox>
                  <AssetManagementsDetailBox className="space-y-6">
                    <LoggerActivity />
                  </AssetManagementsDetailBox>
                </div>
              </Container>
            </>
          )
        }}
      </StorageTemperatureMonitoringDetailConsumer>
    </StorageTemperatureMonitoringDetailProvider>
  )
}
