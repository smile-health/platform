import { useMemo } from 'react'
import { useProgram } from '#hooks/program/useProgram'
import { Stock } from '#types/stock'
import { useTranslation } from 'react-i18next'

import {
  orderDetailAddHierarchyFormSchema,
  orderDetailEditHierarchyFormSchema,
} from '../order-detail.schema'
import {
  CreateOrderDetailItemFormValues,
  OrderDetailItem,
  UpdateOrderDetailItemFormValues,
} from '../order-detail.type'

type OrderDetailItemFormValues =
  | CreateOrderDetailItemFormValues
  | UpdateOrderDetailItemFormValues

type UseOrderDetailHierarchyAddEditMaterialParams = {
  pageType: 'add' | 'edit'
  stockData?: Stock | OrderDetailItem
}
export const useOrderDetailHierarchyAddEditMaterial = ({
  pageType,
  stockData,
}: UseOrderDetailHierarchyAddEditMaterialParams) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderDetail'])
  const { activeProgram } = useProgram()

  const orderDetailFormHierarchySchema = useMemo(() => {
    if (pageType === 'add') {
      return orderDetailAddHierarchyFormSchema(t, language, stockData as Stock)
    }
    return orderDetailEditHierarchyFormSchema(
      t,
      language,
      stockData as OrderDetailItem
    )
  }, [pageType, stockData])

  const defaultValues: OrderDetailItemFormValues = {
    id: (stockData as OrderDetailItem)?.material?.id,
    material_id: undefined,
    order_item_kfa_id: null,
    ordered_qty: (stockData as OrderDetailItem)?.ordered_qty,
    recommended_stock: (stockData as OrderDetailItem)?.recommended_stock,
    order_reason_id: {
      label: (stockData as OrderDetailItem)?.reason?.name,
      value: (stockData as OrderDetailItem)?.reason?.id,
    },
    other_reason: (stockData as OrderDetailItem)?.other_reason,
    children: (stockData as OrderDetailItem)?.children,
  }

  return {
    orderDetailFormHierarchySchema,
    isHierarchyEnabled: activeProgram?.config?.material?.is_hierarchy_enabled,
    defaultValuesHierarchy: defaultValues,
  }
}
