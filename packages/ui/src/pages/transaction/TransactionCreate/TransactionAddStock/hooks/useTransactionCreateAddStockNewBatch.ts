import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDateTime } from '#utils/date'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formSchemaAddStockNewBatch } from '../schema/TransactionCreateAddStockSchemaForm'
import {
  CreateTransactionBatch,
  ModalAddEditBatch,
  NewBatchForm,
} from '../transaction-add-stock.type'

export const useTransactionCreateAddStockNewBatch = ({
  batches,
  activity,
  setIsOpen,
  batchIndex,
  setValueBatch,
  temperature_sensitive,
  managed_in_batch,
  pieces_per_unit,
  currentItem,
  isOpen,
}: ModalAddEditBatch) => {
  const { t } = useTranslation(['transactionCreateAddStock', 'common'])
  const methods = useForm<NewBatchForm>({
    resolver: yupResolver(formSchemaAddStockNewBatch(t)),
    mode: 'onChange',
    defaultValues: {
      code: null,
      production_date: null,
      expired_date: null,
      manufacturer: null,
    },
  })

   useMemo(() => {
    if (currentItem) {
      methods.setValue('code', currentItem.code)
      methods.setValue(
        'expired_date',
        parseDateTime(currentItem.expired_date ?? '', 'YYYY-MM-DD')
      )
      methods.setValue(
        'production_date',
        currentItem?.production_date
          ? parseDateTime(currentItem.production_date, 'YYYY-MM-DD')
          : null
      )
      methods.setValue('manufacturer', currentItem.manufacturer)
    } else {
      methods.reset()
    }
  }, [isOpen])
  
  type AddEmptyBatchProps = {
    newValue: NewBatchForm
  }
  const addEmptyBatch = ({ newValue }: AddEmptyBatchProps) => {
    const copyItems = batches ? [...batches] : []
    const newBatch: CreateTransactionBatch = {
      batch_id: null,
      activity_id: activity?.value ?? null,
      activity_name: activity?.label ?? null,
      change_qty: null,
      code: newValue.code,
      production_date: newValue?.production_date
        ? parseDateTime(newValue?.production_date, 'YYYY-MM-DD')
        : null,
      expired_date: newValue?.expired_date
        ? parseDateTime(newValue?.expired_date, 'YYYY-MM-DD')
        : null,
      manufacturer: newValue.manufacturer,
      on_hand_stock: null,
      min: null,
      max: null,
      available_qty: null,
      allocated_qty: null,
      temperature_sensitive: temperature_sensitive ?? null,
      pieces_per_unit: pieces_per_unit ?? null,
      status_material: null,
      managed_in_batch: managed_in_batch ?? null,
      budget_source: null,
      budget_source_year: null,
      budget_source_price: null,
      total_price_input: null,
      transaction_reason: null,
      other_reason: null,
      other_reason_required: false,
    }
    copyItems.push(newBatch)
    return copyItems
  }

  const handleSubmit = ({ data }: { data: NewBatchForm }) => {
    if (data) {
      if (typeof batchIndex === 'number') {
        setValueBatch?.(`batches.${batchIndex}.code`, data.code)
        setValueBatch?.(
          `batches.${batchIndex}.production_date`,
          data?.production_date
            ? parseDateTime(data?.production_date, 'YYYY-MM-DD')
            : null
        )
        setValueBatch?.(
          `batches.${batchIndex}.expired_date`,
          data?.expired_date
            ? parseDateTime(data?.expired_date, 'YYYY-MM-DD')
            : null
        )
        setValueBatch?.(`batches.${batchIndex}.manufacturer`, data.manufacturer)
      } else {
        const newData = addEmptyBatch({
          newValue: data,
        })
        setValueBatch?.('batches', newData)
      }
      setIsOpen?.(false)
    }
  }

  return {
    methods,
    addEmptyBatch,
    handleSubmit,
  }
}
