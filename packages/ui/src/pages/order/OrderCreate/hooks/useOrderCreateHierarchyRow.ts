import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItemError } from '../components/Table/OrderCreateRow'
import { columnsOrderCreateTableHeader } from '../constants/table'
import { MappedMaterialData, TOrderCreateForm } from '../order-create.type'

type useOrderCreateHierarchyRowParams = {
  index: number
  item: MappedMaterialData
}

export const useOrderCreateHierarchyRow = ({
  index,
  item,
}: useOrderCreateHierarchyRowParams) => {
  const {
    control,
    watch,
    register,
    trigger,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<TOrderCreateForm>()
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreate'])

  const activity = watch('activity_id')
  const order_items = watch('order_items')
  const orderedQty = order_items?.[index]?.value?.ordered_qty || 0
  const headers = columnsOrderCreateTableHeader(t)

  const recommendationFormula = useMemo(() => {
    return (
      Math.ceil(
        ((item?.value?.max ?? 0) - (item?.value?.total_qty ?? 0)) /
          (item?.value?.consumption_unit_per_distribution_unit ?? 1)
      ) * (item?.value?.consumption_unit_per_distribution_unit ?? 1)
    )
  }, [item])

  const recommendationQty = useMemo(() => {
    return recommendationFormula > 0 ? recommendationFormula : 0
  }, [recommendationFormula])

  const fieldError = (errors?.order_items as OrderItemError[] | undefined)?.[
    index
  ]?.value

  const showRecommendation = useMemo(() => {
    return (
      (recommendationFormula !== 0 &&
        Number(orderedQty) !== recommendationQty) ||
      (item?.value?.total_qty ?? 0) >= (item?.value?.max ?? 0)
    )
  }, [recommendationFormula, orderedQty, recommendationQty, item])

  const watchedOrderedQty = watch(`order_items.${index}.value.ordered_qty`)

  const enableReasons = useMemo(() => {
    return (
      (item?.value?.total_qty ?? 0) >= (item?.value?.max ?? 0) ||
      (watchedOrderedQty || 0) !== recommendationQty
    )
  }, [watchedOrderedQty, recommendationQty, item])

  const sumChildInputField = useMemo(() => {
    return order_items?.[index]?.value?.children?.reduce((total, child) => {
      return total + (child?.ordered_qty || 0)
    }, 0)
  }, [order_items, index, order_items?.[index]?.value?.children])

  const checkChildInputField = useMemo(() => {
    return order_items?.[index]?.value?.children?.some(
      (child) => child.ordered_qty !== null
    )
  }, [order_items, index, order_items?.[index]?.value?.children])

  useEffect(() => {
    if (watchedOrderedQty == null) {
      setValue(`order_items.${index}.value.ordered_qty`, recommendationQty)
    }
  }, [watchedOrderedQty, recommendationQty, index, setValue])

  useEffect(() => {
    if (!enableReasons) {
      setValue(`order_items.${index}.value.order_reason_id`, null)
    }
  }, [enableReasons, index, setValue])

  useEffect(() => {
    if (recommendationQty) {
      setValue(
        `order_items.${index}.value.recommended_stock`,
        recommendationQty
      )
    } else {
      setValue(`order_items.${index}.value.recommended_stock`, 0)
    }
  }, [recommendationQty, index, setValue])

  return {
    t,
    item,
    index,
    errors,
    control,
    headers,
    activity,
    language,
    fieldError,
    order_items,
    enableReasons,
    recommendationQty,
    watchedOrderedQty,
    sumChildInputField,
    showRecommendation,
    checkChildInputField,
    recommendationFormula,
    watch,
    register,
    trigger,
    setValue,
    clearErrors,
  }
}
