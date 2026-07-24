import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { OptionType } from '#components/react-select'
import { useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../../transaction/TransactionCreate/store/modal-warning.store'
import {
  OrderItem,
  Stock,
  TOrderCreateReturnForm,
} from '../order-create-return.type'
import { formSchemaStocks } from '../schema/orderCreateReturnSchema'

type Props = {
  indexRow: number
  isOpen: boolean
  onClose: () => void
}

export const useOrderCreateReturnDrawer = ({
  indexRow,
  isOpen,
  onClose,
}: Props) => {
  const [activeField, setActiveField] = useState<string | null>(null)

  const { watch: parentWatch, setValue: parentSetValue } =
    useFormContext<TOrderCreateReturnForm>()
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  const { order_items: parentOrderItems, activity_id } = parentWatch()

  const handleDefaultValue = () => {
    return {
      material_other_activity:
        parentOrderItems?.[indexRow]?.material_other_activity,
      material_id: parentOrderItems?.[indexRow]?.material_id,
      material_name: parentOrderItems?.[indexRow]?.material_name,
      material_total_qty: parentOrderItems?.[indexRow]?.material_total_qty,
      material_available_qty:
        parentOrderItems?.[indexRow]?.material_available_qty,
      material_activity_name:
        parentOrderItems?.[indexRow]?.material_activity_name,
      material_is_managed_in_batch:
        parentOrderItems?.[indexRow]?.material_is_managed_in_batch,
      material_min: parentOrderItems?.[indexRow]?.material_min,
      material_max: parentOrderItems?.[indexRow]?.material_max,
      material_stocks: {
        valid: parentOrderItems?.[indexRow]?.material_stocks?.valid?.map(
          (stock) => ({
            ...stock,
            batch_ordered_qty: null,
            batch_order_stock_status_id: null,
          })
        ),
        expired: parentOrderItems?.[indexRow]?.material_stocks?.expired?.map(
          (stock) => ({
            ...stock,
            batch_ordered_qty: null,
            batch_order_stock_status_id: null,
          })
        ),
      },
    }
  }

  const methods = useForm<OrderItem>({
    resolver: yupResolver(formSchemaStocks(t)),
    context: { activeField },
    mode: 'onChange',
    defaultValues: handleDefaultValue(),
  })
  const { setModalWarning } = useModalWarningStore()

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods

  const { material_stocks } = watch()
  const allMaterialStocks = [
    ...material_stocks.valid,
    ...material_stocks.expired,
  ]

  const parentMaterialStocks =
    parentOrderItems?.[indexRow]?.material_stocks ?? []

  const handleInputChange = (
    value: number | OptionType | null,
    indexBatch: number,
    field: 'batch_ordered_qty' | 'batch_order_stock_status_id',
    tableName: 'valid' | 'expired'
  ) => {
    const fieldName =
      `material_stocks.${tableName}.${indexBatch}.${field}` as const

    setValue(fieldName, value)
  }

  const handleSaveUpdate = async () => {
    parentSetValue(
      `order_items.${indexRow}.material_stocks.valid`,
      material_stocks?.valid
    )
    parentSetValue(
      `order_items.${indexRow}.material_stocks.expired`,
      material_stocks?.expired
    )
    return onClose()
  }

  useEffect(() => {
    if (isOpen) {
      reset((prev) => {
        const newValues = {
          ...parentOrderItems?.[indexRow],
          material_stocks: parentMaterialStocks,
        }
        return JSON.stringify(prev) !== JSON.stringify(newValues)
          ? newValues
          : prev
      })
    }
  }, [isOpen, JSON.stringify(parentMaterialStocks), indexRow, reset])

  useEffect(() => {
    if (errors?.material_stocks?.root?.type === 'at-least-one-change-qty') {
      setModalWarning(
        true,
        t('orderCreateReturn:drawer.table.validation') as string
      )
    }
  }, [errors])

  const getFilteredActivities = () => {
    const selectedBatchActivityIds = Array.from(
      new Set(allMaterialStocks?.map((stock) => stock?.batch_activity_id))
    )
    const filteredActivities =
      parentOrderItems?.[indexRow]?.material_other_activity
        ?.filter(
          (orderItem) =>
            !selectedBatchActivityIds.includes(orderItem?.entity_activity_id)
        )
        .map((filteredData) => ({
          label: filteredData?.label || '',
          value: filteredData?.value || null,
        })) || []

    return filteredActivities?.map((item) => ({
      label: item?.label,
      value: [
        ...(item?.value?.material_stocks?.valid as Stock[]),
        ...(item?.value?.material_stocks?.expired as Stock[]),
      ],
    }))
  }

  return {
    methods,
    activity_id,
    material_stocks,
    parentOrderItems,
    setValue,
    handleSubmit,
    setActiveField,
    parentSetValue,
    handleSaveUpdate,
    handleInputChange,
    getFilteredActivities,
  }
}
