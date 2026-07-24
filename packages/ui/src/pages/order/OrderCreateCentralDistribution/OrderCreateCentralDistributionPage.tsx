'use client'

import React, { useRef, useState } from 'react'
import { Button } from '#components/button'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import OrderCreateModalMaterialCompanion from '../components/OrderCreateModalMaterialCompanion'
import { handleExternalSubmit } from '../order.helper'
import OrderContainer from '../OrderContainer'
import OrderCreateCentralDistributionDetailBatch from './components/OrderCreateCentralDistributionDetailBatch'
import OrderCreateCentralDistributionInput from './components/OrderCreateCentralDistributionInput'
import OrderCreateCentralDistributionTableForm from './components/OrderCreateCentralDistributionTableForm'
import OrderCreateCentralDistributionTableMaterial from './components/OrderCreateCentralDistributionTableMaterial'
import useOrderCreateCentralDistribution from './hooks/useOrderCreateCentralDistribution'
import useOrderCreateCentralDistributionPermission from './hooks/useOrderCreateCentralDistributionPermission'
import { TDrawerQuantity } from './order-create-central-distribution.type'

export default function OrderCreateCentralDistributionPage() {
  useOrderCreateCentralDistributionPermission()
  const { t } = useTranslation('orderCentralDistribution')
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

  const {
    methods,
    append,
    remove,
    onSubmit,
    companionList,
    onCheckIsValid,
    onSetOrderItems,
    isPendingMutateOrder,
  } = useOrderCreateCentralDistribution({
    onShowConfirmation: () =>
      setIsShowConfirmation({
        show: true,
        type: 'submit',
      }),
    onShowModalCompanion: setShowModalCompanion,
  })

  const childProps = {
    append,
    remove,
  }

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
        isLoading={isPendingMutateOrder}
        open={isShowConfirmation?.show}
        setOpen={(show: boolean) =>
          setIsShowConfirmation((prev) => ({ ...prev, show }))
        }
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
          <OrderCreateCentralDistributionInput />
          <OrderCreateCentralDistributionTableMaterial {...childProps} />
          <OrderCreateCentralDistributionTableForm
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
              type="button"
              className="ui-w-52"
              disabled={!order_items?.length}
              onClick={onCheckIsValid}
            >
              {t('action.save')}
            </Button>
          </div>
        </form>
      </FormProvider>
      <OrderCreateCentralDistributionDetailBatch
        {...drawerQuantity}
        key={JSON.stringify(drawerQuantity)}
        setOpen={(open) => setDrawerQuantity({ data: null, index: 0, open })}
        onSubmit={onSetOrderItems}
      />
    </OrderContainer>
  )
}
