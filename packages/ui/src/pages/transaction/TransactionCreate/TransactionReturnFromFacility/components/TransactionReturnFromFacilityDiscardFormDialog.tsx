import React, { useContext } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useHandleValueDiscardChange } from '../hooks/useHandleValueDiscardChange'
import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'
import { TTransactionReturnFacilityConsumptionData } from '../transaction-return-from-facility.type'
import { transactionReturnFromFacilityDiscardValidation } from '../transaction-return-from-facility.validation-schema'
import TransactionReturnFromFacilitySelectReason from './TransactionReturnFromFacilitySelectReason'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

const TransactionReturnFromFacilityDiscardFormDialog = () => {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const { errorForms, setErrorForms, discardStockData, setDiscardStockData } =
    useContext(TransactionReturnFromFacilityContext)
  const { handleErrorDiscard } = useHandleValueDiscardChange(t)
  const schema = transactionReturnFromFacilityDiscardValidation(t)
  const { setValue } =
    useFormContext<TTransactionReturnFacilityConsumptionData>()
  const handleValueChange = async ({
    name,
    value,
    dep,
  }: {
    name: string
    value: string | OptionType | number | null
    dep?: Array<{
      name: string
    }>
  }) => {
    const updatedDiscardStock = {
      ...discardStockData,
      [name]: value,
    } as TTransactionReturnFacilityConsumptionData

    setDiscardStockData(updatedDiscardStock)
    handleErrorDiscard({
      name,
      updatedDiscardStock,
    })
    if (dep) {
      dep.forEach((item) => {
        handleErrorDiscard({
          name: item.name,
          updatedDiscardStock,
        })
      })
    }
  }
  const handleSave = async () => {
    try {
      await schema.validate(discardStockData, { abortEarly: false })

      setValue(
        `items.${Number(discardStockData?.index)}` as keyof TTransactionReturnFacilityConsumptionData,
        discardStockData as unknown as string | undefined
      )
      setTimeout(() => {
        setDiscardStockData(null)
      }, 100)
    } catch (error: any) {
      const errors: { [key: string]: string } = {}
      error.inner.forEach((err: any) => {
        errors[err.path] = err.message
      })
      setErrorForms((prev: any) => ({
        ...prev,
        ...errors,
      }))
    }
  }

  const handleCancel = () => {
    const errorToNull = {
      discard_open_vial_qty: null,
      discard_qty: null,
      discard_reason: null,
      other_reason: null,
    }
    setErrorForms((prev: any) => ({ ...prev, ...errorToNull }))
    setDiscardStockData(null)
  }
  const isOpenVial =
    Number(discardStockData?.material?.is_open_vial) === BOOLEAN.TRUE &&
    discardStockData?.customer_is_open_vial
  return (
    <>
      <Dialog
        open={!!discardStockData}
        size="lg"
        className="z-10"
        classNameOverlay="z-10"
      >
        <Button
          className="ui-absolute ui-right-2 ui-top-2 ui-rounded ui-text-gray-800 ui-outline-none ui-border-none"
          onClick={handleCancel}
          variant="subtle"
          type="button"
        >
          <XMarkIcon className="ui-h-5 ui-w-5" />
        </Button>
        <DialogHeader className="ui-my-2">
          <h3 className="ui-text-center ui-text-xl ui-font-medium">
            {t(
              'transactionCreate:transaction_return_from_facility.input_table.detail_column.is_anything_discarded'
            )}
          </h3>
        </DialogHeader>
        <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
        <DialogContent className="ui-overflow-auto ui-my-2 ui-py-2 styled-scroll ui-scroll-pr-2">
          {isOpenVial && (
            <FormControl className="ui-my-4">
              <FormLabel className="ui-text-sm">
                {t(
                  'transactionCreate:transaction_return_from_facility.input_table.column.open_vial'
                )}
              </FormLabel>
              <InputNumberV2
                placeholder={t(
                  'transactionCreate:transaction_remove_stock.input_table.detail_column.placeholder.qty'
                )}
                disabled={Number(discardStockData?.open_vial_qty ?? 0) <= 0}
                value={discardStockData?.discard_open_vial_qty ?? ''}
                onValueChange={(values) =>
                  handleValueChange({
                    name: 'discard_open_vial_qty',
                    value: values?.floatValue as number,
                    dep: [
                      {
                        name: 'discard_reason',
                      },
                      {
                        name: 'discard_qty',
                      },
                    ],
                  })
                }
              />
              <FormErrorMessage>
                {errorForms?.discard_open_vial_qty}
              </FormErrorMessage>
            </FormControl>
          )}
          <FormControl className="ui-my-4">
            <FormLabel className="ui-text-sm">
              {isOpenVial
                ? t(
                    'transactionCreate:transaction_return_from_facility.input_table.column.close_vial'
                  )
                : t(
                    'transactionCreate:transaction_return_from_facility.input_table.detail_column.qty_discarded'
                  )}
            </FormLabel>
            <InputNumberV2
              placeholder={t(
                'transactionCreate:transaction_remove_stock.input_table.detail_column.placeholder.qty'
              )}
              value={discardStockData?.discard_qty ?? ''}
              onValueChange={(values) =>
                handleValueChange({
                  name: 'discard_qty',
                  value: values?.floatValue as number,
                  dep: [
                    {
                      name: 'discard_reason',
                    },
                    {
                      name: 'discard_open_vial_qty',
                    },
                  ],
                })
              }
            />
            <FormErrorMessage>{errorForms?.discard_qty}</FormErrorMessage>
          </FormControl>
          <FormControl className="ui-my-4">
            <FormLabel className="ui-text-sm">
              {t(
                'transactionCreate:transaction_return_from_facility.input_table.detail_column.discard_reason'
              )}
            </FormLabel>
            <TransactionReturnFromFacilitySelectReason
              handleValueChange={handleValueChange}
            />
          </FormControl>
        </DialogContent>
        <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
        <DialogFooter className="ui-w-full ui-grid ui-grid-cols-2 ui-py-6">
          <Button
            color="primary"
            variant="outline"
            className="ui-px-16"
            onClick={handleCancel}
          >
            {t('common:cancel')}
          </Button>
          <Button variant="solid" onClick={handleSave} className="ui-px-16">
            {t('common:save')}
          </Button>
        </DialogFooter>
      </Dialog>
      <style>{`
      .styled-scroll::-webkit-scrollbar {
        width: 10px;
      }
      .styled-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .styled-scroll::-webkit-scrollbar-thumb {
        background: #888;
      }
      .styled-scroll::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `}</style>
    </>
  )
}

export default TransactionReturnFromFacilityDiscardFormDialog
