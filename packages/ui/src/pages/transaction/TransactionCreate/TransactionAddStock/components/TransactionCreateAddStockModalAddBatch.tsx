import React from 'react'
import { parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
} from '#components/modal'
import { ReactSelectAsync } from '#components/react-select'
import { handleDateChange, parseValidDate } from '#utils/date'
import dayjs from 'dayjs'
import { Controller, FormProvider, SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateAddStockNewBatch } from '../hooks/useTransactionCreateAddStockNewBatch'
import { loadManufacturer } from '../transaction-add-stock.service'
import { ModalAddEditBatch, NewBatchForm } from '../transaction-add-stock.type'

const TransactionCreateAddStockModalAddBatch = ({
  isOpen = false,
  setIsOpen,
  currentItem,
  itemIndex,
  batchIndex,
  setValueBatch,
  batches,
  activity,
  temperature_sensitive,
  pieces_per_unit,
  managed_in_batch,
  material_id,
}: ModalAddEditBatch) => {
  const { t } = useTranslation('transactionCreateAddStock')
  const { methods, handleSubmit } = useTransactionCreateAddStockNewBatch({
    batches,
    setValueBatch,
    activity,
    temperature_sensitive,
    managed_in_batch,
    pieces_per_unit,
    setIsOpen,
    batchIndex,
    currentItem,
    isOpen,
  })
  const { control, reset } = methods
  const onSubmit: SubmitHandler<NewBatchForm> = (data) => {
    handleSubmit({ data })
  }
  const modalRoot = document.getElementById('drawer-batch') || document.body
  return (
    <FormProvider {...methods}>
      <ModalRoot
        open={isOpen}
        closeOnOverlayClick={false}
        className="ui-z-10"
        classNameOverlay="ui-z-10"
        verticalCentered
        size="lg"
        portalContainer={modalRoot}
      >
        <ModalCloseButton
          onClick={() => {
            reset()
            setIsOpen?.(!isOpen)
          }}
        />
        <ModalHeader border className="ui-text-center ui-pr-0">
          <span className="ui-font-medium ui-text-xl ui-text-primary-800">
            {t('add_new_batch')}
          </span>
        </ModalHeader>
        <ModalContent>
          <div className="ui-flex ui-flex-col ui-space-y-5">
            <Controller
              key={`${itemIndex}-${batchIndex}-code`}
              control={control}
              name={`code`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required>{t('table.column.batch_code')}</FormLabel>
                  <Input
                    {...field}
                    id={`change-qty-material-stock-code-${itemIndex}-${batchIndex}`}
                    placeholder={t('enter_batch_code')}
                    value={value || ''}
                    type="text"
                    min={0}
                    error={!!error?.message}
                    onChange={(e) => {
                      onChange(e.target.value.toUpperCase())
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
            <Controller
              key={`${itemIndex}-${batchIndex}-production-date`}
              control={control}
              name={`production_date`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => {
                return (
                  <FormControl>
                    <FormLabel>{t('table.column.production_date')}</FormLabel>
                    <DatePicker
                      {...field}
                      data-testid={`transaction-add-stock-production-date-${itemIndex}-${batchIndex}`}
                      value={parseValidDate(value)}
                      maxValue={parseDate(
                        dayjs(new Date()).format('YYYY-MM-DD')
                      )}
                      onChange={handleDateChange(onChange)}
                      error={!!error?.message}
                      clearable
                    />

                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )
              }}
            />
            <Controller
              key={`${itemIndex}-${batchIndex}-manufaturer`}
              control={control}
              name={`manufacturer`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required>
                    {t('table.column.manufacturer')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    value={value}
                    id={`select-transaction-material-manufacturer-${itemIndex}-${batchIndex}`}
                    loadOptions={loadManufacturer}
                    debounceTimeout={300}
                    isClearable
                    placeholder={t('choose_manufacture')}
                    additional={{
                      page: 1,
                      material_id: material_id,
                    }}
                    onChange={(option) => {
                      onChange(option)
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
              key={`${itemIndex}-${batchIndex}-expired-date`}
              control={control}
              name={`expired_date`}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required>
                    {t('table.column.expired_date')}
                  </FormLabel>
                  <DatePicker
                    {...field}
                    data-testid={`transaction-add-stock-expired-date-${itemIndex}-${batchIndex}`}
                    value={parseValidDate(value)}
                    minValue={parseDate(dayjs(new Date()).format('YYYY-MM-DD'))}
                    onChange={handleDateChange(onChange)}
                    error={!!error?.message}
                  />

                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </div>
        </ModalContent>
        <ModalFooter className="ui-border ui-flex ui-flex-row">
          <Button
            color="danger"
            variant="default"
            className="w-full"
            onClick={() => {
              reset()
              setIsOpen?.(!isOpen)
            }}
            type="button"
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
        </ModalFooter>
      </ModalRoot>
    </FormProvider>
  )
}

export default TransactionCreateAddStockModalAddBatch
