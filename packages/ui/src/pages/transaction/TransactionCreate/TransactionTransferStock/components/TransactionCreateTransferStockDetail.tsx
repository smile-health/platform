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

import useTransactionCreateTransferStockBatch from '../hooks/useTransactionCreateTransferStockBatch'
import type {
  CreateTransactionChild,
  TransactionCreateTransferStockDetail,
} from '../transaction-transfer-stock.type'
import TransactionCraeteTransferStockTableDetail from './TransactionCraeteTransferStockTableDetail'

const TransactionCreateTransferStockDetail = ({
  handleClose,
  isOpen,
  idRow,
  items,
  setValueParent,
  triggerParent,
  errorsParent,
}: TransactionCreateTransferStockDetail) => {
  const { methods, checkValidity, resetBatch } =
    useTransactionCreateTransferStockBatch()
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')
  const batches = items?.[idRow]?.batches
  useEffect(() => {
    methods.reset({
      batches,
    })
  }, [batches, isOpen, methods.reset])
  const onSubmit: SubmitHandler<CreateTransactionChild> = (data) => {
    if (data?.batches) {
      setValueParent(`items.${idRow}.batches`, data.batches)
      triggerParent([`items.${idRow}.batches`])
      handleClose(false)
    }
  }
  useEffect(() => {
    if (errorsParent?.items?.[idRow]?.batches)
      methods.setError('batches', errorsParent?.items?.[idRow].batches)
  }, [errorsParent?.items?.[idRow]?.batches])
  return (
    <FormProvider {...methods}>
      <Drawer
        placement="bottom"
        open={isOpen}
        size="full"
        sizeHeight="lg"
        closeOnOverlayClick={false}
        onOpenChange={handleClose}
      >
        <DrawerHeader className="ui-border">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('transaction_transfer_stock.caption_detail_batch', {
                type: items?.[idRow]?.managed_in_batch ? 'Batch' : 'Detail',
              })}
            </h6>
            <Button
              id={`close-batch-${idRow}`}
              data-testid={`close-batch-${idRow}`}
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => handleClose(false)}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent>
          <div className="ui-grid ui-grid-cols-[40%_40%] ui-gap-4 ui-mb-1">
            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                Material
              </h2>
              <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                {items?.[idRow]?.material_name}
              </p>
            </div>
            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('table.column.available_stock')}
              </h2>
              <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                {numberFormatter(items?.[idRow]?.available_stock, language)}
              </p>
            </div>
          </div>
          <TransactionCraeteTransferStockTableDetail
            indexData={idRow}
            items={items?.[idRow]}
          />
        </DrawerContent>
        <DrawerFooter className="ui-border">
          <button
            id={`reset-batch-${idRow}`}
            data-testid={`reset-batch-${idRow}`}
            type="button"
            onClick={() => {
              methods.setValue(
                'batches',
                resetBatch({
                  currentBatch: batches,
                })
              )
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

export default TransactionCreateTransferStockDetail
