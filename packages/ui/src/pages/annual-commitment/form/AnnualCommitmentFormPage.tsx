import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import {
  AnnualCommitmentFormConsumer,
  AnnualCommitmentFormProvider,
} from './AnnualCommitmentFormContext'
import { BufferTable } from './use-cases/buffer-table/BufferTable'
import { CentralAllocationTable } from './use-cases/central-allocation-table/CentralAllocationTable'
import { AnnualCommitmentDetailForm } from './use-cases/fill-detail-form/AnnualCommitmentDetailForm'

export default function AnnualCommitmentFormPage() {
  const isFeatureEnabled = useFeatureIsOn('annual_commitment')
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'annualCommitmentForm'])

  if (!isFeatureEnabled) return <Error403Page />

  return (
    <AnnualCommitmentFormProvider>
      <AnnualCommitmentFormConsumer>
        {({
          mode,
          form,
          showNoMaterialModal,
          setShowNoMaterialModal,
          confirmSubmitWithoutMaterial,
        }) => (
          <>
            <Meta
              title={generateMetaTitle(
                t(`annualCommitmentForm:page.title.${mode}`)
              )}
            />
            <Container
              title={t(`annualCommitmentForm:page.title.${mode}`)}
              withLayout
              backButton={{
                label: t('common:back_to_list'),
                show: true,
                onClick: () => router.push('/v5/annual-commitment'),
              }}
            >
              <div className="ui-space-y-6">
                <AnnualCommitmentDetailForm />
                <CentralAllocationTable />
                <BufferTable />

                <div className="ui-w-full ui-mt-5">
                  <div className="ui-flex ui-space-x-5 ui-justify-end">
                    <Button
                      variant="outline"
                      className="ui-w-48"
                      type="button"
                      onClick={() => router.push('/v5/annual-commitment')}
                    >
                      {t('annualCommitmentForm:button.back')}
                    </Button>
                    <Button
                      className="ui-w-48"
                      type="button"
                      onClick={form.submit}
                    >
                      {t('annualCommitmentForm:button.save')}
                    </Button>
                  </div>
                </div>
              </div>
            </Container>

            <ModalConfirmation
              open={showNoMaterialModal}
              setOpen={setShowNoMaterialModal}
              onSubmit={confirmSubmitWithoutMaterial}
              title={t('annualCommitmentForm:modal.confirmNoMaterial.title')}
              description={t(
                'annualCommitmentForm:modal.confirmNoMaterial.description'
              )}
              type="update"
            />
          </>
        )}
      </AnnualCommitmentFormConsumer>
    </AnnualCommitmentFormProvider>
  )
}
