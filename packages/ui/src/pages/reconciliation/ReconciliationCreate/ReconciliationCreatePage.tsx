'use client'

import { useState } from 'react'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { generateMetaTitle } from '#utils/strings'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import ReconciliationCreateModalWarningItem from './components/ReconciliationCreateModalWarningItem'
import ReconciliationDetailForm from './components/ReconciliationDetailForm'
import ReconciliationMaterilSelectForm from './components/ReconciliationMaterilSelectForm'
import ReconciliationTableForm from './components/ReconciliationTableForm'
import { useReconciliationCreate } from './hooks/useReconciliationCreate'

const ReconciliationCreatePage = () => {
  const { t } = useTranslation(['common', 'reconciliation'])
  const [openModalReset, setOpenModalReset] = useState<boolean>(false)
  const router = useSmileRouter()
  const { methods, onSubmit, isSuperAdmin, isPending } =
    useReconciliationCreate()
  useSetLoadingPopupStore(isPending)
  return (
    <Container
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.push('/v5/reconciliation')
        },
      }}
      title={t('reconciliation:title.create.reconciliation')}
      withLayout
    >
      <Meta
        title={generateMetaTitle(
          t('reconciliation:title.create.reconciliation')
        )}
      />
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="ui-flex ui-space-x-5">
            <ReconciliationDetailForm isSuperAdmin={isSuperAdmin} />
            <ReconciliationMaterilSelectForm />
          </div>
          <ReconciliationTableForm />
          <div className="ui-w-full ui-mt-5">
            <div className="ui-flex ui-space-x-5 ui-justify-end">
              <Button
                variant="outline"
                className="ui-w-48"
                type="button"
                onClick={() => setOpenModalReset(true)}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button
                className="ui-w-48"
                type="submit"
                disabled={
                  !methods.watch().opname_stock_items ||
                  methods.watch().opname_stock_items?.length === 0 ||
                  isPending
                }
              >
                {t('reconciliation:create.send')}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
      <ReconciliationCreateModalWarningItem />
      <ModalConfirmation
        open={openModalReset}
        onSubmit={() => location.reload()}
        setOpen={() => setOpenModalReset(!openModalReset)}
        title={t('reconciliation:create.reset_dialog.title')}
        description={t('reconciliation:create.reset_dialog.description')}
      />
    </Container>
  )
}

export default ReconciliationCreatePage
