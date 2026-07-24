'use client'

import React, { useState } from 'react'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import useSmileRouter from '#hooks/useSmileRouter'
import { CommonType } from '#types/common'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import OrderCreateReturnModalNeedRelation from '#pages/order/OrderCreateReturn/components/OrderCreateReturnModalNeedRelation'

import TransactionCreateAdditionalTransactionTable from './components/TransactionCreateAdditionalTransactionTable'
import TransactionCreateFilterListForm from './components/TransactionCreateFilterListForm'
import { TransactionCreateMaterialSelect } from './components/TransactionCreateMaterialSelect'
import TransactionCreateModalAcknowledge from './components/TransactionCreateModalAcknowledge'
import TransactionCreateModalWarningItem from './components/TransactionCreateModalWarningItem'
import TransactionCreateModalWarningRemoveMaterial from './components/TransactionCreateModalWarningRemoveMaterial'
import TransactionCreateTransactionDetailForm from './components/TransactionCreateTransactionDetailForm'
import { TransactionCreateTransactionTable } from './components/TransactionCreateTransactionTable'
import { TransactionCreateCancellationContext } from './context/TransactionCreateCancellationProvider'
import { useCreateTransaction } from './hooks/useCreateTransaction'
import { useTransactionCreateCancellationList } from './hooks/useTransactionCreateCancellationList'
import { TRANSACTION_TYPE } from './transaction-create.constant'

const TransactionCreatePage: React.FC<CommonType> = () => {
  const { t } = useTranslation(['transactionCreate', 'transaction', 'common'])
  const {
    methods,
    onSubmit,
    handleTitle,
    type,
    titleTable,
    isSuperAdmin,
    modalAcknowledge,
    setModalAcknowledge,
    showModalNeedRelation,
    setShowModalNeedRelation,
    needRelationData,
  } = useCreateTransaction()
  const contextCancellation = useTransactionCreateCancellationList({ methods })
  const [openModalReset, setOpenModalReset] = useState<boolean>(false)
  const router = useSmileRouter()
  const { items } = methods.watch()
  return (
    <TransactionCreateCancellationContext.Provider value={contextCancellation}>
      <Container
        title={t('transactionCreate:title', {
          type: handleTitle()?.title,
        })}
        withLayout
        backButton={{
          label: t('common:back_to_list'),
          show: true,
          onClick: () => {
            router.push('/v5/transaction')
          },
        }}
      >
        <Meta title={`SMILE | ${t('transactionCreate:transaction_form')}`} />
        <TransactionCreateModalWarningRemoveMaterial />
        <TransactionCreateModalWarningItem />
        <div className="ui-my-6">
          <h1 className="ui-text-lg ui-font-bold">
            {t('transaction:transaction_create')}
          </h1>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <div className="ui-flex ui-space-x-5">
              <TransactionCreateTransactionDetailForm
                isSuperAdmin={isSuperAdmin}
              />
              {[
                TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
                TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
              ].includes(Number(type as string)) ? (
                <TransactionCreateFilterListForm />
              ) : (
                <TransactionCreateMaterialSelect />
              )}
            </div>

            <div className="ui-mt-5 ui-w-full ui-p-6 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
              <h1 className="ui-font-bold">
                {titleTable}
                <TransactionCreateTransactionTable />
              </h1>
            </div>

            <TransactionCreateAdditionalTransactionTable />

            <div className="ui-w-full ui-mt-5">
              <div className="ui-flex ui-space-x-5 ui-justify-end">
                <Button
                  variant="outline"
                  className="ui-w-48"
                  type="button"
                  onClick={() => setOpenModalReset(true)}
                >
                  Reset
                </Button>
                <Button
                  className="ui-w-48"
                  type="submit"
                  disabled={!items || items?.length === 0}
                >
                  {t('transactionCreate:send')}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
        <ModalConfirmation
          open={openModalReset}
          onSubmit={() => location.reload()}
          setOpen={() => setOpenModalReset(!openModalReset)}
          title={t('transactionCreate:reset_dialog.title')}
          description={t('transactionCreate:reset_dialog.description')}
        />
        <TransactionCreateModalAcknowledge
          open={modalAcknowledge}
          handleClose={() => setModalAcknowledge(false)}
          handleSubmit={onSubmit}
        />
        {showModalNeedRelation !== undefined && (
          <OrderCreateReturnModalNeedRelation
            open={showModalNeedRelation}
            setOpen={setShowModalNeedRelation}
            header={needRelationData?.header || ''}
            message={needRelationData?.message || ''}
            list={needRelationData?.list || []}
          />
        )}
      </Container>
    </TransactionCreateCancellationContext.Provider>
  )
}

export default TransactionCreatePage
