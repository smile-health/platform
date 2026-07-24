import React from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { Input } from '#components/input'
import { ReactSelectAsync } from '#components/react-select'
import { STATUS } from '#constants/common'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TRANSACTION_TYPE } from '../../transaction-create.constant'
import { loadTransactionReason } from '../transaction-add-stock.service'
import { TransactionAddStockChild } from '../transaction-add-stock.type'

type Props = {
  index: number
  indexBatch: number
}

const TransactionCreateAddStockSelectReason = ({
  index,
  indexBatch,
}: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreateAddStock')
  const { control, watch, setValue, trigger } =
    useFormContext<TransactionAddStockChild>()

  return (
    <>
      <Controller
        key={index}
        control={control}
        name={`batches.${indexBatch}.transaction_reason`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <ReactSelectAsync
              key={`${language}`}
              {...field}
              value={value}
              id={`select-transaction-reason-${index}-${indexBatch}`}
              loadOptions={loadTransactionReason}
              debounceTimeout={300}
              isClearable
              placeholder={t('select_reason')}
              additional={{
                page: 1,
                transaction_type_id: TRANSACTION_TYPE.ADD_STOCK,
              }}
              onChange={(option) => {
                onChange(option)
                const isOtherReasonRequired: boolean = Boolean(
                  option?.value.is_other
                )
                setValue(
                  `batches.${indexBatch}.other_reason_required`,
                  isOtherReasonRequired
                )
                setValue(`batches.${indexBatch}.other_reason`, null)
                //reset budget source if is purchase inactive
                if (
                  !option?.value ||
                  option?.value?.is_purchase === STATUS.INACTIVE
                ) {
                  setValue(`batches.${indexBatch}.budget_source_price`, null)
                  setValue(`batches.${indexBatch}.budget_source`, null)
                  setValue(`batches.${indexBatch}.budget_source_year`, null)
                  setValue(`batches.${indexBatch}.total_price_input`, null)
                }
                trigger([
                  `batches.${indexBatch}.budget_source_price`,
                  `batches.${indexBatch}.budget_source`,
                  `batches.${indexBatch}.budget_source_year`,
                  `batches.${indexBatch}.other_reason`,
                ])
              }}
              menuPosition="fixed"
              menuPlacement="top"
              error={!!error?.message}
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      {Boolean(watch(`batches.${indexBatch}.other_reason_required`)) && (
        <Controller
          key={index}
          control={control}
          name={`batches.${indexBatch}.other_reason`}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl className="ui-mt-4">
              <Input
                {...field}
                id={`others-transaction-reason-${index}-${indexBatch}`}
                placeholder={t('enter_reason')}
                value={value || ''}
                type="text"
                error={!!error?.message}
                onChange={(e) => onChange(e.target.value)}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      )}
    </>
  )
}

export default TransactionCreateAddStockSelectReason
