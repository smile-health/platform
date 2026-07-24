import React from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Td } from '#components/table'
import { Control, Controller, UseFormTrigger } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItem, Stock } from '../order-create-return.type'

type Props = {
  headers: {
    header: string
    id: string
    size: number
  }[]
  indexRow: number
  index: number
  resetKey: number
  control: Control<OrderItem, any>
  material_stocks: Stock[]
  setActiveField: (fieldName: string | null) => void
  onHandleInputChange: (
    value: number,
    index: number,
    fieldName: string,
    tableName: 'valid' | 'expired'
  ) => void
  trigger: UseFormTrigger<OrderItem>
  tableName: 'valid' | 'expired'
}

export const OrderCreateReturnBatchInputStock: React.FC<Props> = ({
  headers,
  indexRow,
  index,
  resetKey,
  control,
  material_stocks,
  setActiveField,
  onHandleInputChange,
  trigger,
  tableName,
}) => {
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  return (
    <Td id={`cell-${headers?.[4]?.id}`}>
      <Controller
        control={control}
        key={`ordered_qty_${indexRow}-${index}-${resetKey}`}
        name={`material_stocks.${tableName}.${index}.batch_ordered_qty`}
        render={({ field, fieldState: { error } }) => {
          return (
            <FormControl>
              <InputNumberV2
                id={`input-quantity-${indexRow}-${index}`}
                placeholder={t(
                  'orderCreateReturn:drawer.table.column.quantity.placeholder'
                )}
                onFocus={() => setActiveField(field.name)}
                onBlur={() => setActiveField(null)}
                value={material_stocks?.[index]?.batch_ordered_qty || undefined}
                onValueChange={(e) => {
                  onHandleInputChange(
                    e.floatValue as number,
                    index,
                    'batch_ordered_qty',
                    tableName
                  )
                  trigger(
                    `material_stocks.${tableName}.${index}.batch_ordered_qty`
                  )
                }}
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )
        }}
      />
    </Td>
  )
}
