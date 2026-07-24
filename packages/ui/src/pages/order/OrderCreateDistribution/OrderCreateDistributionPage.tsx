'use client'

import React, { useRef, useState } from 'react'
import { Button } from '#components/button'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { usePermission } from '#hooks/usePermission'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import OrderCreateModalMaterialCompanion from '../components/OrderCreateModalMaterialCompanion'
import { handleExternalSubmit } from '../order.helper'
import OrderContainer from '../OrderContainer'
import OrderCreateDistributionDetailBatch from './components/OrderCreateDistributionDetailBatch'
import OrderCreateDistributionInput from './components/OrderCreateDistributionInput'
import OrderCreateDistributionTableForm from './components/OrderCreateDistributionTableForm'
import OrderCreateDistributionTableMaterial from './components/OrderCreateDistributionTableMaterial'
import useOrderCreateDistribution from './hooks/useOrderCreateDistribution'
import { TDrawerQuantity } from './order-create-distribution.type'
import OrderCreateReturnModalNeedRelation from '../OrderCreateReturn/components/OrderCreateReturnModalNeedRelation'

export default function OrderCreateDistributionPage() {
  usePermission('order-mutate')
  const { t } = useTranslation('orderDistribution')
  const formRef = useRef<HTMLFormElement | null>(null)
  const [drawerQuantity, setDrawerQuantity] = useState<TDrawerQuantity>({
    open: false,
    index: 0,
    data: null,
  })
  const [isShowConfirmation, setIsShowConfirmation] = useState({
    show: false,
    type: 'submit',
  })
  const [showModalCompanion, setShowModalCompanion] = useState(false)
  const [showModalNeedRelation, setShowModalNeedRelation] = useState(false)
  const [needRelationData, setNeedRelationData] = useState({
    header: '',
    message: '',
    list: [] as string[],
  })

  const {
    methods,
    append,
    remove,
    onSubmit,
    companionList,
    onCheckIsValid,
    onSetOrderItems,
    isPendingMutateOrder,
  } = useOrderCreateDistribution({
    onShowConfirmation: () =>
      setIsShowConfirmation({
        show: true,
        type: 'submit',
      }),
    onShowModalCompanion: setShowModalCompanion,
    onNeedRelation: (payload) => {
      setNeedRelationData(payload)
      setShowModalNeedRelation(true)
    },
  })

  const childProps = {
    append,
    remove,
  }

  const activity = methods.watch('activity')
  const order_items = methods.watch('order_items')
  const isReset = isShowConfirmation?.type === 'reset'

  return (
    <OrderContainer
      title={t('title')}
      metaTitle={t('title')}
      backButton={{
        show: true,
      }}
    >
      <ModalConfirmation
        open={isShowConfirmation?.show}
        setOpen={(show: boolean) =>
          setIsShowConfirmation((prev) => ({ ...prev, show }))
        }
        isLoading={isPendingMutateOrder}
        description={
          isReset ? t('info.confirmation.reset') : t('info.confirmation.submit')
        }
        onSubmit={() => {
          if (isReset) {
            methods.reset()
          } else {
            handleExternalSubmit(formRef)
          }
        }}
      />
      <OrderCreateReturnModalNeedRelation
        open={showModalNeedRelation}
        setOpen={setShowModalNeedRelation}
        header={needRelationData.header}
        message={needRelationData.message}
        list={needRelationData.list}
      />
      <OrderCreateModalMaterialCompanion
        show={showModalCompanion}
        setShow={setShowModalCompanion}
        companionList={companionList}
        onNext={() => {
          setIsShowConfirmation({
            show: true,
            type: 'submit',
          })
        }}
      />
      <FormProvider {...methods}>
        <form
          ref={formRef}
          onSubmit={methods.handleSubmit(onSubmit)}
          className="ui-grid ui-grid-cols-2 ui-gap-6"
        >
          <OrderCreateDistributionInput />
          <OrderCreateDistributionTableMaterial {...childProps} />
          <OrderCreateDistributionTableForm
            {...childProps}
            setDrawerQuantity={setDrawerQuantity}
          />
          <div className="ui-flex ui-justify-end ui-gap-2 ui-col-span-2">
            <Button
              id="btn-reset-form"
              data-testid="btn-reset-form"
              variant="outline"
              type="button"
              onClick={() =>
                setIsShowConfirmation({
                  show: true,
                  type: 'reset',
                })
              }
              className="ui-w-52"
            >
              Reset
            </Button>
            <Button
              id="btn-submit"
              data-testid="btn-submit"
              className="ui-w-52"
              type="button"
              onClick={onCheckIsValid}
              disabled={!order_items?.length}
            >
              {t('action.save')}
            </Button>
          </div>
        </form>
      </FormProvider>
      <OrderCreateDistributionDetailBatch
        {...drawerQuantity}
        key={JSON.stringify(drawerQuantity)}
        activity={activity}
        setOpen={(open) => setDrawerQuantity({ data: null, index: 0, open })}
        onSubmit={onSetOrderItems}
      />
    </OrderContainer>
  )
}
