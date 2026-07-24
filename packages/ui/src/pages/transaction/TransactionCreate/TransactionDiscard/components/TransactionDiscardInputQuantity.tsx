import { Fragment } from "react"
import { Control, Controller, useFormContext } from "react-hook-form"

import { Td } from "#components/table"
import { FormControl, FormErrorMessage } from "#components/form-control"

import { useTranslation } from "react-i18next"
import { InputNumberV2 } from "#components/input-number-v2"
import { ItemTransactionDiscard } from "../transaction-discard.type"

type Props = {
  is_open_vial: boolean
  is_sensitive: boolean
  index: number
  columns: Array<{ id: string, header: string, minSize: number }>
  control: Control<any, any>
}

const TransactionDiscardInputQuantity: React.FC<Props> = (props) => {
  const { is_open_vial, is_sensitive, index, columns, control } = props
  const { t } = useTranslation('transactionCreate')
  const {
    watch,
    formState: { errors },
    setValue,
    trigger
  } = useFormContext<ItemTransactionDiscard>()

  return is_open_vial ? (
    <Fragment>
      <Td id={`cell-${columns[4].id}`} className="ui-content-start">
        <Controller
          control={control}
          name={`details.${index}.open_vial` as keyof ItemTransactionDiscard}
          render={({
            field: { value, onChange },
            fieldState: { error },
          }) => (
            <FormControl>
              <InputNumberV2
                id={`input-open-vial-${index}`}
                placeholder={t('transaction_discard.form.table.placeholder.qty')}
                value={value as unknown as number ?? ''}
                onValueChange={async e => {
                  onChange(e.floatValue)
                  if (is_sensitive) await trigger(`details.${index}.stock_quality`)
                  await trigger(`details.${index}.transaction_reason`)
                }}
                error={!!error?.message}
                disabled={watch(`details.${index}.open_vial_qty` as keyof ItemTransactionDiscard) === 0}
                maxLength={11}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </Td>
      <Td id={`cell-${columns[5].id}`} className="ui-content-start">
        <Controller
          control={control}
          name={`details.${index}.close_vial` as keyof ItemTransactionDiscard}
          render={({
            field: { value, onChange },
            fieldState: { error },
          }) => (
            <FormControl>
              <InputNumberV2
                id={`input-close-vial-${index}`}
                placeholder={t('transaction_discard.form.table.placeholder.qty')}
                value={value as unknown as number ?? ''}
                onValueChange={async e => {
                  onChange(e.floatValue)
                  if (is_sensitive) await trigger(`details.${index}.stock_quality`)
                  await trigger(`details.${index}.transaction_reason`)
                }}
                error={!!error?.message}
                maxLength={11}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </Td>
    </Fragment>
  ) : (
    <Td id={`cell-${columns[4].id}`} className="ui-content-start">
      <FormControl>
        <InputNumberV2
          id={`input-quantity-${index}`}
          placeholder={t('transaction_discard.form.table.placeholder.qty')}
          value={watch(`details.${index}.qty`) as unknown as number ?? ''}
          onValueChange={async e => {
            setValue(`details.${index}.qty`, e.floatValue)
            await trigger(`details.${index}.qty`)
            if (is_sensitive) await trigger(`details.${index}.stock_quality`)
            await trigger(`details.${index}.transaction_reason`)
          }}
          error={errors?.details && !!errors?.details[index]?.qty}
          maxLength={11}
        />
        {errors?.details?.[index]?.qty && (
          <FormErrorMessage>{errors?.details[index]?.qty.message}</FormErrorMessage>
        )}
      </FormControl>
    </Td>
  )
}

export default TransactionDiscardInputQuantity
