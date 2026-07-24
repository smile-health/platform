import React from 'react'
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
import XMark from '#components/icons/XMark'
import { InputNumberV2 } from '#components/input-number-v2'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { numberFormatter } from '#utils/formatter'
import { Controller, FormProvider, SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateAddStockBudgetSource } from '../hooks/useTransactionCreateAddStockBudgetSource'
import { loadBudgetSource } from '../transaction-add-stock.service'
import {
  BudgetSourceForm,
  ModalAddBudgetSource,
} from '../transaction-add-stock.type'
import { listYear } from '../utils/helpers'

const currency = process.env.CURRENCY

const TransactionCreateAddStockBudgetSourceModal = ({
  setIsOpen,
  isOpen,
  index,
  item,
  unit,
  setValueBatch,
  triggerParent,
}: ModalAddBudgetSource) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreateAddStock')
  const { methods, handleSave } = useTransactionCreateAddStockBudgetSource({
    setIsOpen,
    isOpen,
    index,
    item,
    unit,
    setValueBatch,
    triggerParent,
  })
  const { control, trigger, setValue, reset, watch } = methods
  const onSubmit: SubmitHandler<BudgetSourceForm> = (data) => {
    handleSave({ data })
  }
  return (
    <FormProvider {...methods}>
      <Dialog
        open={isOpen}
        closeOnOverlayClick={false}
        className="z-10"
        classNameOverlay="z-10"
        size="lg"
      >
        <DialogHeader border>
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('table.column.budget_info')}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => {
                reset()
                setIsOpen(false)
              }}
            >
              <XMark />
            </Button>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="ui-flex ui-flex-col ui-space-y-5">
            <div>
              <FormLabel>{t('table.column.unit')}</FormLabel>
              <div className="ui-font-bold">{unit}</div>
            </div>
            <Controller
              key={`${index.indexItems}-${index.indexBatch}`}
              control={control}
              name={`budget_source`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required={Boolean(watch().is_purchase)}>
                    {t('table.column.budget_source')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    value={value}
                    id={`select-transaction-material-budget-source-${index.indexItems}-${index.indexBatch}`}
                    loadOptions={loadBudgetSource}
                    debounceTimeout={300}
                    isClearable
                    placeholder={t('choose_budget_source')}
                    additional={{
                      page: 1,
                      restricted: t('restricted'),
                    }}
                    isOptionDisabled={(
                      option: OptionType & { isDisabled?: boolean }
                    ) => {
                      return !!option?.isDisabled
                    }}
                    onChange={(option) => {
                      onChange(option)
                      if (option === null) methods.reset()
                      trigger([`budget_source_price`, `budget_source_year`])
                    }}
                    menuPosition="fixed"
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
            <Controller
              key={`${index.indexItems}-${index.indexBatch}`}
              control={control}
              name={`budget_source_year`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required={Boolean(watch().is_purchase)}>
                    {t('table.column.budget_year')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    value={value}
                    id={`select-transaction-material-budget-source-year-${index.indexItems}-${index.indexBatch}`}
                    options={listYear()}
                    isClearable
                    placeholder={t('choose_budget_year')}
                    onChange={(option) => {
                      onChange(option)
                      trigger([`budget_source_price`, `budget_source`])
                    }}
                    menuPosition="fixed"
                    error={!!error?.message}
                    disabled={!watch().budget_source}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
            <Controller
              key={`${index.indexItems}-${index.indexBatch}`}
              control={control}
              name={`budget_source_price`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required={Boolean(watch().is_purchase)}>
                    {t('table.column.total_price')}
                    {` (${currency})`}
                  </FormLabel>
                  <InputNumberV2
                    {...field}
                    isPriceTag
                    id={`transaction-add-stock-budget-source-price-${index.indexItems}-${index.indexBatch}`}
                    placeholder={t('enter_total_price')}
                    value={value ?? ''}
                    min={0}
                    error={!!error?.message}
                    disabled={!watch().budget_source_year}
                    onValueChange={(values: any) => {
                      const { floatValue } = values
                      if (floatValue === undefined) {
                        onChange('')
                        setValue('total_price_input', null, {
                          shouldDirty: true,
                        })
                        return
                      }

                      onChange(floatValue)
                      const quantity = item?.change_qty
                      const calculated =
                        floatValue && quantity
                          ? Number(floatValue) / Number(quantity)
                          : undefined
                      setValue(`total_price_input`, calculated, {
                        shouldDirty: true,
                      })
                      trigger([`budget_source_year`, `budget_source`])
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
            <div className="ui-flex ui-flex-col ui-space-y-1">
              <FormLabel>
                {t('table.column.purchase_per_unit')}
                {` (${currency})`}
              </FormLabel>
              <div className="ui-font-bold">
                {`${numberFormatter(watch()?.total_price_input || 0, language, 'currency')} `}
                /{unit}
              </div>
              <div className="ui-text-xs ui-text-neutral-500">
                {t('info_purchase_price')}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="ui-border ui-flex ui-flex-row">
          <Button
            color="danger"
            variant="default"
            className="w-full"
            onClick={() => {
              reset()
              setIsOpen(false)
            }}
          >
            {t('cancel')}
          </Button>

          <Button
            variant="solid"
            className="w-full"
            onClick={() => methods.handleSubmit(onSubmit)()}
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </Dialog>
    </FormProvider>
  )
}

export default TransactionCreateAddStockBudgetSourceModal
