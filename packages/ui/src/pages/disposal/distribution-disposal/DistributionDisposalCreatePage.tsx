import React from 'react'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import SelfDisposalCreateModalReset from '#pages/self-disposal/components/SelfDisposalCreateModalReset'
import { FormProvider } from 'react-hook-form'

import { useModalResetStore } from '../../self-disposal/self-disposal.store'
import DistributionDisposalFormDetail from './components/DistributionDisposalFormDetail'
import DistributionDisposalFormMaterial from './components/DistributionDisposalFormMaterial'
import DistributionDisposalFormModalCreateConfirmation from './components/DistributionDisposalFormModalCreateConfirmation'
import DistributionDisposalFormTable from './components/DistributionDisposalFormTable'
import DistributionDisposalModalWarningItem from './components/DistributionDisposalModalWarningItem'
import { useDistributionDisposalCreatePage } from './hooks/useDistributionDisposalCreatePage'

const DistributionDisposalCreatePage: React.FC = () => {
  const {
    t,
    back,
    handleSubmit,
    order_items,
    methods,
    openConfirm,
    setOpenConfirm,
    handleOpenConfirm,
    onSubmit,
    isSuperAdmin,
  } = useDistributionDisposalCreatePage()
  const { setModalReset } = useModalResetStore()

  return (
    <Container
      title={t('distributionDisposal:form.title.create')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => back(),
      }}
    >
      <Meta title={t('distributionDisposal:form.meta')} />

      <DistributionDisposalModalWarningItem />

      <DistributionDisposalFormModalCreateConfirmation
        open={openConfirm.open}
        handleClose={() => setOpenConfirm({ open: false, data: null })}
        handleConfirm={(data) => onSubmit(data)}
      />

      <SelfDisposalCreateModalReset />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleOpenConfirm)}>
          <div className="ui-flex ui-space-x-5">
            <DistributionDisposalFormDetail isSuperAdmin={isSuperAdmin} />
            <DistributionDisposalFormMaterial />
          </div>
          <div className="ui-mt-5 ui-w-full ui-p-6 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
            <h1 className="ui-font-bold">
              {t('distributionDisposal:form.material.table_title')}
              <DistributionDisposalFormTable />
            </h1>
          </div>
          <div className="ui-w-full ui-mt-5">
            <div className="ui-flex ui-space-x-5 ui-justify-end">
              <Button
                variant="outline"
                className="ui-w-48"
                type="button"
                onClick={() => setModalReset(true)}
              >
                {t('common:reset')}
              </Button>
              <Button
                className="ui-w-48"
                type="submit"
                disabled={!order_items || order_items?.length === 0}
              >
                {t('common:send')}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Container>
  )
}

export default DistributionDisposalCreatePage
