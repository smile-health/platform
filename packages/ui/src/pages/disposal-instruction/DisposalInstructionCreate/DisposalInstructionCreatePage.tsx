import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import ReconciliationCreateModalWarningItem from '#pages/reconciliation/ReconciliationCreate/components/ReconciliationCreateModalWarningItem'
import ResetFormModal from '#pages/self-disposal/components/SelfDisposalCreateModalReset'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import {
  DisposalInstructionCreateConsumer,
  DisposalInstructionCreateProvider,
} from './DisposalInstructionCreateContext'
import { DisposalTable } from './use-cases/display-selected-material/DisposalTable'
import { BatchQtyFormProvider } from './use-cases/fill-batch-qty-form/BatchQtyFormContext'
import { BatchQtyFormDrawer } from './use-cases/fill-batch-qty-form/BatchQtyFormDrawer'
import { ConfirmationFormModal } from './use-cases/fill-confirmation-form/ConfirmationFormModal'
import { DisposalDetailForm } from './use-cases/fill-disposal-detail-form/DisposalDetailForm'
import { MaterialSelection } from './use-cases/material-selection/MaterialSelection'

export default function DisposalInstructionCreatePage() {
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'disposalInstructionCreate'])

  return (
    <DisposalInstructionCreateProvider>
      <Meta
        title={generateMetaTitle(t('disposalInstructionCreate:page.title'))}
      />
      <DisposalInstructionCreateConsumer>
        {(disposalInstructionCreate) => (
          <Container
            title={t('disposalInstructionCreate:page.title')}
            withLayout
            backButton={{
              label: t('common:back_to_list'),
              show: true,
              onClick: () => router.push('/v5/disposal-instruction'),
            }}
          >
            <ConfirmationFormModal />
            <ResetFormModal />
            <ReconciliationCreateModalWarningItem />

            <div className="ui-space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <DisposalDetailForm />
                <MaterialSelection />
              </div>

              <BatchQtyFormProvider>
                <BatchQtyFormDrawer />
                <DisposalTable />
              </BatchQtyFormProvider>

              <div className="ui-w-full ui-mt-5">
                <div className="ui-flex ui-space-x-5 ui-justify-end">
                  <Button
                    variant="outline"
                    className="ui-w-48"
                    type="button"
                    onClick={disposalInstructionCreate.form.reset}
                  >
                    {t('common:reset')}
                  </Button>
                  <Button
                    className="ui-w-48"
                    type="button"
                    onClick={disposalInstructionCreate.form.submit}
                    disabled={
                      disposalInstructionCreate.form.values.disposal_items
                        ?.length === 0
                    }
                  >
                    {t('common:send')}
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        )}
      </DisposalInstructionCreateConsumer>
    </DisposalInstructionCreateProvider>
  )
}
