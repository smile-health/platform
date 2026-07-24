import React from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Td } from '#components/table'
import { Control, Controller, UseFormTrigger } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterialStatus } from '../order-create-return.service'
import { OrderItem, Stock } from '../order-create-return.type'

type Props = {
  headers: {
    header: string
    id: string
    size: number
  }[]
  indexRow: number
  index: number
  control: Control<OrderItem, any>
  material_stocks: Stock[]
  onHandleInputChange: (
    value: number | OptionType,
    index: number,
    fieldName: string,
    tableName: 'valid' | 'expired'
  ) => void
  trigger: UseFormTrigger<OrderItem>
  tableName: 'valid' | 'expired'
}

export const OrderCreateReturnBatchSelectStatus: React.FC<Props> = ({
  headers,
  indexRow,
  index,
  control,
  material_stocks,
  tableName,
  onHandleInputChange,
  trigger,
}) => {
  const { t } = useTranslation(['common', 'orderCreateReturn'])

  return (
    <Td id={`cell-${headers?.[5]?.id}`}>
      <Controller
        control={control}
        key={`order_stock_status_id_${indexRow}-${index}`}
        name={`material_stocks.${tableName}.${index}.batch_order_stock_status_id`}
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          return (
            <FormControl>
              <ReactSelectAsync
                id={`material-status-${indexRow}-${index}`}
                disabled={
                  !material_stocks?.[index]?.batch_is_temperature_sensitive
                }
                className="ui-text-sm"
                placeholder={t(
                  'orderCreateReturn:drawer.table.column.material_status.placeholder'
                )}
                isClearable
                value={value as OptionType}
                menuPosition="fixed"
                onChange={(option: OptionType) => {
                  onChange(option)
                  onHandleInputChange(
                    option,
                    index,
                    'batch_order_stock_status_id',
                    tableName
                  )
                  trigger(
                    `material_stocks.${tableName}.${index}.batch_order_stock_status_id`
                  )
                }}
                loadOptions={loadMaterialStatus}
                additional={{
                  page: 1,
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
