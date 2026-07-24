import React, { useEffect } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { numberFormatter } from '#utils/formatter'
import { FormProvider, SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateAddStockBatch } from '../hooks/useTransactionCreateAddStockBatch'
import {
  ModalBatchDetail,
  TransactionAddStockChild,
} from '../transaction-add-stock.type'
import TransactionCreateAddStockTableDetailBatch from './TransactionCreateAddStockTableDetailBatch'

const TransactionCreateAddStockTableDetail: React.FC<ModalBatchDetail> = ({
  handleClose,
  isOpen,
  idRow,
  item,
  setValueParent,
  triggerParent,
  activity,
  setItem,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreateAddStock')
  const batches = item?.batches
  const { methods, resetBatch, checkValidity } =
    useTransactionCreateAddStockBatch()
  const onSubmit: SubmitHandler<TransactionAddStockChild> = (data) => {
    if (data?.batches) {
      setValueParent(`items.${idRow}.batches`, data.batches)
      triggerParent([`items.${idRow}.batches`])
      handleClose(false)
      setItem?.(null)
    }
  }

  useEffect(() => {
    methods.reset({
      batches,
    })
  }, [batches, isOpen, methods.reset])

  return (
    <FormProvider {...methods}>
      <Drawer
        placement="bottom"
        open={isOpen}
        size="full"
        sizeHeight="lg"
        id="drawer-batch"
        closeOnOverlayClick={false}
      >
        <DrawerHeader className="ui-border">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('caption_detail_batch', {
                type: item?.managed_in_batch ? 'Batch' : 'Detail',
              })}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => {
                handleClose(false)
                setItem?.(null)
              }}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent>
          <div className="ui-p-4" id="transaction-detail-table">
            <div className="ui-space-y-6">
              <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mb-1">
                <div>
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    Material
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {item?.material_name}
                  </p>
                </div>
                <div>
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    {t('table.column.stock_on_hand')}
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {numberFormatter(item?.on_hand_stock, language)}
                    <span className="ui-text-neutral-500 ui-text-xs ui-font-normal ui-ml-1">
                      min: {numberFormatter(item?.min, language)}, {t('max')} :{' '}
                      {numberFormatter(item?.max, language)}
                    </span>
                  </p>
                </div>
                <div>
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    {t('table.column.available_stock')}
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {numberFormatter(item?.available_stock, language)}
                  </p>
                </div>
              </div>
              <TransactionCreateAddStockTableDetailBatch
                indexData={idRow}
                unit={item?.unit ?? ''}
                isManageInBatch={item?.managed_in_batch ?? 0}
                temperature_sensitive={item?.temperature_sensitive ?? 0}
                pieces_per_unit={item?.pieces_per_unit ?? 0}
                activity={activity}
                material_id={item?.material_id ?? 0}
              />
            </div>
          </div>
        </DrawerContent>
        <DrawerFooter className="ui-border">
          <button
            id={`reset-batch-${idRow}`}
            data-testid={`reset-batch-${idRow}`}
            type="button"
            onClick={() => {
              methods.setValue('batches', resetBatch())
              methods.clearErrors('batches')
            }}
            className="ui-w-20 focus:outline-none"
          >
            <div className="ui-flex ui-flex-row ui-text-sm ui-space-x-3 ui-text-primary-600">
              <Reload className="ui-size-5" />
              <div>Reset</div>
            </div>
          </button>

          <Button
            id={`save-batch-${idRow}`}
            data-testid={`save-batch-${idRow}`}
            className="ui-w-48"
            onClick={() => {
              checkValidity()
              methods.handleSubmit(onSubmit)()
            }}
          >
            {t('save')}
          </Button>
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  )
}

export default TransactionCreateAddStockTableDetail
