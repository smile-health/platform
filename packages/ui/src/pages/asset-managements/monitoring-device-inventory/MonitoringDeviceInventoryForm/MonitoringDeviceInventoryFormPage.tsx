import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import { generateMetaTitle } from '#utils/strings'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useTranslation } from 'react-i18next'

import {
  MonitoringDeviceInventoryFormConsumer,
  MonitoringDeviceInventoryFormProvider,
} from './MonitoringDeviceInventoryFormContext'
import { AssetSpecificationSection } from './use-cases/fill-asset-specification/AssetSpecificationSection'
import { BudgetSection } from './use-cases/fill-budget/BudgetSection'
import { EntitySection } from './use-cases/fill-entity/EntitySection'
import { OperationalStatusSection } from './use-cases/fill-operational-status/OperationalStatusSection'

type MonitoringDeviceInventoryFormPageProps = Readonly<{
  isGlobal?: boolean
  mode?: 'create' | 'edit'
}>

export default function MonitoringDeviceInventoryFormPage({
  isGlobal = false,
  mode = 'create',
}: MonitoringDeviceInventoryFormPageProps) {
  const isFeatureEnabled = useFeatureIsOn('monitoring_device_inventory')
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryForm'])
  const router = useSmileRouter()

  if (!isFeatureEnabled) return <Error403Page />

  const pageTitle = t(
    mode === 'create'
      ? 'monitoringDeviceInventoryForm:page.title_create'
      : 'monitoringDeviceInventoryForm:page.title_edit'
  )

  return (
    <MonitoringDeviceInventoryFormProvider isGlobal={isGlobal} mode={mode}>
      <Meta title={generateMetaTitle(pageTitle)} />
      <MonitoringDeviceInventoryFormConsumer>
        {(monitoringDeviceInventoryForm) => (
          <Container
            title={pageTitle}
            withLayout
            backButton={{
              label: t('common:back_to_list'),
              show: true,
              onClick: () =>
                router.pushGlobal(
                  '/v5/global-asset/management/monitoring-device-inventory'
                ),
            }}
          >
            {monitoringDeviceInventoryForm.isLoading ? (
              <div className="ui-w-full ui-flex ui-justify-center ui-items-center ui-py-20">
                <div className="ui-text-center">
                  <div className="ui-animate-spin ui-rounded-full ui-h-12 ui-w-12 ui-border-b-2 ui-border-primary ui-mx-auto"></div>
                  <p className="ui-mt-4 ui-text-gray-600">
                    {t('common:loading_popup.description')}...
                  </p>
                </div>
              </div>
            ) : (
              <div className="ui-w-[50%] ui-mx-auto ui-space-y-6">
                <AssetSpecificationSection />
                <OperationalStatusSection />
                <EntitySection />
                <BudgetSection />

                <div className="ui-w-full ui-mt-5">
                  <div className="ui-flex ui-space-x-5 ui-justify-end">
                    <Button
                      variant="outline"
                      className="ui-w-48"
                      type="button"
                      onClick={() =>
                        router.pushGlobal(
                          '/v5/global-asset/management/monitoring-device-inventory'
                        )
                      }
                    >
                      {t('common:back')}
                    </Button>
                    <Button
                      className="ui-w-48"
                      type="button"
                      onClick={monitoringDeviceInventoryForm.form.submit}
                    >
                      {t('common:save')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Container>
        )}
      </MonitoringDeviceInventoryFormConsumer>
    </MonitoringDeviceInventoryFormProvider>
  )
}
