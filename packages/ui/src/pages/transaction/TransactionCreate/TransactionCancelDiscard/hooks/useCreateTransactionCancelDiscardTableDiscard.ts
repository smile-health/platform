import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { CreateTransctionForm } from '../../transaction-create.type'
import {
  ItemsCancelTransactionDiscard,
  TransactionsDiscard,
} from '../transaction-cancel-discard.type'

export const useCreateTransactionCancelDiscardTableDiscard = () => {
  const [detailSelected, setDetailSelected] = useState<number | null>(null)
  const { control, watch, setValue } = useFormContext<CreateTransctionForm>()
  const { items = [] } = watch()

  const handleAdd = (data: TransactionsDiscard) => {
    const index = (items as ItemsCancelTransactionDiscard[]).findIndex(
      (item) =>
        item.stock?.batch?.id === data.stock?.batch?.id &&
        typeof item.stock?.batch?.id === 'number' &&
        typeof data.stock?.batch?.id === 'number'
    )

    if (index > -1) {
      const existingData = items[index] as ItemsCancelTransactionDiscard
      if (existingData) {
        existingData.change_qty += data.change_qty ?? 0
        existingData.change_qty_open_vial += data.change_qty_open_vial ?? 0
        existingData.transaction_ids.push(data.id)
        existingData.details.push(data)
      }

      setValue(`items.${index}`, existingData)
    } else {
      const newData: ItemsCancelTransactionDiscard = {
        activity: data.activity,
        transaction_reason: null,
        change_qty: data.change_qty ?? 0,
        change_qty_open_vial: data.change_qty_open_vial ?? 0,
        details: [data],
        material: data.material,
        stock_id: data.stock_id ?? 0,
        transaction_ids: [data.id],
        stock: data.stock,
      }

      setValue(
        'items',
        (items as ItemsCancelTransactionDiscard[]).concat(newData)
      )
    }
  }

  const handleRemove = (data: TransactionsDiscard) => {
    const newItems = [] as ItemsCancelTransactionDiscard[]

    ;(items as ItemsCancelTransactionDiscard[]).forEach(
      (x: ItemsCancelTransactionDiscard) => {
        const newDetails = x.details.filter((y) => y.id !== data.id)
        const transactionIds = x.transaction_ids.filter((y) => y !== data.id)

        if (newDetails.length > 0 || transactionIds.length > 0) {
          const isSameTransaction = newDetails.length === x.details.length

          newItems.push({
            ...x,
            details: newDetails,
            transaction_ids: transactionIds,
            ...(!isSameTransaction && {
              change_qty: x.change_qty - (data.change_qty ?? 0),
            }),
          })
        }
      }
    )

    setValue('items', newItems)
  }

  const handleSelectDiscardTransaction = (data: TransactionsDiscard) => {
    const isRemove = (items as ItemsCancelTransactionDiscard[]).some((x) =>
      x.transaction_ids.includes(data.id)
    )

    if (!isRemove) handleAdd(data)
    else handleRemove(data)
  }

  const handleRemoveCancelDiscard = (index: number) => {
    const newData = [...items]

    newData.splice(index, 1)

    setValue('items', newData as ItemsCancelTransactionDiscard[])
  }

  const handleRemoveCancelDiscardTransaction = (
    index: number,
    indexTransactionId: number
  ) => {
    const newData = [...items] as ItemsCancelTransactionDiscard[]

    newData[index].change_qty -=
      newData[index].details[indexTransactionId].change_qty ?? 0
    newData[index].transaction_ids.splice(indexTransactionId, 1)
    newData[index].details.splice(indexTransactionId, 1)
    if (newData[index].transaction_ids.length === 0) {
      newData.splice(index, 1)

      setDetailSelected(null)
    }

    setValue('items', newData)
  }

  return {
    handleSelectDiscardTransaction,
    handleRemoveCancelDiscard,
    handleRemoveCancelDiscardTransaction,
    items: items as ItemsCancelTransactionDiscard[],
    control,
    detailSelected,
    setDetailSelected,
  }
}
