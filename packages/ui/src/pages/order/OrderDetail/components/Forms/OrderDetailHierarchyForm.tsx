import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Stock } from '#types/stock'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailHierarchyChildrenFormSchema } from '../../order-detail-hierarchy.schema'
import { countRecommenedStockFormula } from '../../order-detail.helpers'
import useOrderDetailStore from '../../order-detail.store'
import {
  CreateOrderDetailItemFormValues,
  OrderDetailChildren,
  OrderDetailItem,
  UpdateOrderDetailItemFormValues,
} from '../../order-detail.type'
import { OrderDetailHierachyDrawerForm } from './OrderDetailHierarchyDrawerForm'

type OrderDetailHierarchyFormProps = {
  selectedMaterialStockData?: Stock | OrderDetailItem
  onSubmit?: (formData?: OrderDetailChildren[]) => void
}

type OrderDetailItemFormValues =
  | CreateOrderDetailItemFormValues
  | UpdateOrderDetailItemFormValues

export const OrderDetailHierarchyForm = ({
  selectedMaterialStockData,
  onSubmit,
}: OrderDetailHierarchyFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderDetail'])

  const {
    selectedOrderItemData: orderItemData,
    itemFormType: formType,
    setOpenHierarchyDrawerForm,
  } = useOrderDetailStore()

  const isEditForm = formType === 'edit'
  const stockData = isEditForm
    ? orderItemData?.children
    : selectedMaterialStockData

  const defaultValues: OrderDetailItemFormValues = {
    material_id: selectedMaterialStockData?.material?.id || undefined,
    id: isEditForm ? orderItemData?.id : undefined,
    recommended_stock: isEditForm
      ? orderItemData?.recommended_stock
      : countRecommenedStockFormula(
          (selectedMaterialStockData as Stock)?.max,
          (selectedMaterialStockData as Stock)?.total_available_qty,
          (selectedMaterialStockData as Stock)?.material
            ?.consumption_unit_per_distribution_unit
        ),
    children: isEditForm
      ? orderItemData?.children
      : (selectedMaterialStockData as Stock)?.details?.map((detail) => ({
          material: {
            id: detail.material?.id || 0,
            name: detail.material?.name || '',
            consumption_unit_per_distribution_unit:
              detail.material?.consumption_unit_per_distribution_unit || 5,
            is_managed_in_batch: Number(detail?.material?.is_managed_in_batch),
          },
          material_id: detail.material?.id || 0,
          ordered_qty: undefined,
          allocated_qty: detail.total_allocated_qty || 0,
          confirmed_qty: 0,
          qty: detail.total_qty || 0,
          shipped_qty: 0,
          stock_customer: {
            total_allocated_qty: detail.total_allocated_qty || 0,
            total_available_qty: detail.total_available_qty || 0,
            max: detail.max || 0,
            min: detail.min || 0,
            total_qty: detail.total_qty || 0,
          },
        })),
    other_reason: isEditForm ? orderItemData?.other_reason : null,
    ordered_qty: isEditForm
      ? (orderItemData?.ordered_qty ?? undefined)
      : undefined,
    order_reason_id: isEditForm
      ? orderItemData?.reason
        ? {
            label: orderItemData?.reason?.name,
            value: orderItemData?.reason?.id,
          }
        : null
      : null,
  }

  const { setValue, reset, watch } = useForm<OrderDetailItemFormValues>({
    defaultValues,
    resolver: yupResolver(orderDetailHierarchyChildrenFormSchema(t, language)),
  })

  const { children } = watch()

  useEffect(() => {
    if (selectedMaterialStockData) {
      setValue('children', defaultValues.children)
    } else {
      setValue('children', stockData as OrderDetailChildren[])
    }
  }, [setValue, selectedMaterialStockData, formType])

  return (
    <OrderDetailHierachyDrawerForm
      selectedMaterialStockData={selectedMaterialStockData}
      values={{ children: children }}
      onSubmit={(formData) => {
        onSubmit?.(formData)
        setValue('children', formData)
        setOpenHierarchyDrawerForm(false)
      }}
      isLoading={false}
      onReset={() => reset(defaultValues)}
    />
  )
}
