import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { numberFormatter } from '#utils/formatter'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  DistributionDisposalStockExterminationForm,
  DistributionDisposalStockForm,
} from '../types/DistributionDisposal'

type Props = {
  stock_exterminations: DistributionDisposalStockExterminationForm[]
  index: number
  id: 'input-extermination-discard' | 'input-extermination-received'
  name: 'discard_qty' | 'received_qty'
  control: Control<{ stocks: DistributionDisposalStockForm[] }>
}

const DistributionDisposalFormStockExterminationsInputNumber: React.FC<
  Props
> = ({ stock_exterminations, index, id, name, control }) => {
  const { i18n } = useTranslation()
  const lang = i18n.language

  if (!stock_exterminations?.length) return null

  return stock_exterminations.map((item, idx) => {
    const fieldName =
      `stocks.${index}.stock_exterminations.${idx}.${name}` as const
    const labelTitle =
      lang === 'en'
        ? item.transaction_reason_title_en
        : item.transaction_reason_title
    const quantity =
      name === 'discard_qty'
        ? item.extermination_discard_qty
        : item.extermination_received_qty

    return (
      <Controller
        key={fieldName}
        control={control}
        name={fieldName}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormControl>
            <FormLabel htmlFor={`select-${id}-${index}-${idx}`}>
              {labelTitle ?? '-'} ({numberFormatter(quantity, lang)})
            </FormLabel>
            <InputNumberV2
              id={id}
              placeholder=""
              value={value ?? ''}
              onValueChange={(e) => onChange(e?.floatValue ?? null)}
              error={!!error}
              disabled={Number(quantity) === 0}
            />
            {error?.message && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
    )
  })
}

export default DistributionDisposalFormStockExterminationsInputNumber
