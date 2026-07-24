import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MappedMaterialData, TOrderCreateForm } from '../order-create.type'
import { formSchemaChild } from '../schema/orderCreateSchema'

type useOrderCreateHierarchyDrawerParams = {
  onClose: () => void
  isOpen: boolean
  indexRow: number
  order_items: TOrderCreateForm['order_items']
}

export const useOrderCreateHierarchyDrawer = ({
  onClose,
  isOpen,
  indexRow,
  order_items,
}: useOrderCreateHierarchyDrawerParams) => {
  const [resetKey, setResetKey] = useState(0)

  const handleDefaultValue = () => {
    return {
      material_companions: order_items?.[indexRow]?.value?.material_companions
        ?.length
        ? order_items?.[indexRow]?.value?.material_companions
        : null,
      material_id: order_items?.[indexRow]?.value?.material_id,
      total_available_qty: order_items?.[indexRow]?.value?.total_available_qty,
      total_qty: order_items?.[indexRow]?.value?.total_qty,
      ordered_qty: order_items?.[indexRow]?.value?.recommended_stock ?? null,
      min: order_items?.[indexRow]?.value?.min,
      max: order_items?.[indexRow]?.value?.max,
      order_reason_id: null,
      other_reason: null,
      recommended_stock: order_items?.[indexRow]?.value?.recommended_stock,
      consumption_unit_per_distribution_unit:
        order_items?.[indexRow]?.value?.consumption_unit_per_distribution_unit,
      children: order_items?.[indexRow]?.value?.children,
    }
  }

  const {
    watch: parentWatch,
    setValue: parentSetValue,
    trigger: parentTrigger,
  } = useFormContext<TOrderCreateForm>()
  const { t } = useTranslation(['common', 'orderCreate'])

  const methods = useForm<MappedMaterialData['value']>({
    resolver: yupResolver(formSchemaChild(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(),
  })

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods

  const { order_items: parentOrderItems } = parentWatch()
  const { children } = watch()

  const parentTrademarkChild =
    parentOrderItems?.[indexRow]?.value?.children ?? []

  const handleInputChange = (
    value: number | null,
    indexBatch: number,
    field: 'ordered_qty'
  ) => {
    const fieldName = `children.${indexBatch}.${field}` as const

    setValue(fieldName, value)
  }

  const handleSaveUpdate = async () => {
    const totalOrderedQty = children?.reduce((acc, child) => {
      return acc + (child.ordered_qty ?? 0)
    }, 0)
    parentSetValue(`order_items.${indexRow}.value.children`, children)
    parentSetValue(`order_items.${indexRow}.value.ordered_qty`, totalOrderedQty)

    parentTrigger(`order_items.${indexRow}.value.ordered_qty`)
    return onClose()
  }

  useEffect(() => {
    if (isOpen) {
      reset((prev: any) => {
        const newValues = {
          ...order_items?.[indexRow],
          children: parentTrademarkChild ?? [],
        }
        return JSON.stringify(prev) !== JSON.stringify(newValues)
          ? newValues
          : prev
      })
    }
  }, [isOpen, JSON.stringify(parentTrademarkChild), indexRow, reset])

  return {
    errors,
    methods,
    resetKey,
    children,
    setValue,
    setResetKey,
    handleSubmit,
    parentSetValue,
    handleSaveUpdate,
    handleInputChange,
  }
}
