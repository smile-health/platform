import React, { useEffect, useState } from 'react'
import { Input } from '#components/input'
import { UseFormReturn } from 'react-hook-form'

import { CreateTransactionRemoveForm } from '../transaction-remove-stock.type'

type Props = {
  name: string
  index: number
  id: number | string
  table: any
  methods: UseFormReturn<CreateTransactionRemoveForm>
  type?: string
  placeholder?: string
}

const TransactionRemoveStockFormInput: React.FC<Props> = ({
  name,
  index,
  id,
  table,
  methods: { getValues, setValue },
  type = 'number',
  placeholder = '0',
}) => {
  const initialValue = getValues(name as keyof CreateTransactionRemoveForm)
  const [localValue, setLocalValue] = useState<any>(initialValue)

  const onBlur = () => {
    table.options.meta?.updateData(index, id, localValue)
    setValue(name as keyof CreateTransactionRemoveForm, localValue, {
      shouldValidate: true,
    })
  }

  const numberInputOnWheelPreventChange = (
    e: React.WheelEvent<HTMLInputElement>
  ) => {
    ;(e.target as HTMLInputElement).blur()
    e.stopPropagation()
    setTimeout(() => {
      ;(e.target as HTMLInputElement).focus()
    }, 0)
  }

  useEffect(() => {
    setLocalValue(initialValue)
  }, [initialValue])

  return (
    <>
      <Input
        type={type}
        placeholder={placeholder}
        value={localValue || ''}
        onChange={(e) => {
          const newValue = e.target.value
          setLocalValue(newValue)
        }}
        onBlur={onBlur}
        onWheel={numberInputOnWheelPreventChange}
      />
      <style>{`
        input::-webkit-inner-spin-button,
        input::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type=number] {
           -moz-appearance: textfield;
        }
        `}</style>
    </>
  )
}

export default TransactionRemoveStockFormInput
