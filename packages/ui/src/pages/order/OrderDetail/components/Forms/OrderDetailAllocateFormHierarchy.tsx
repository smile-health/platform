import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { Stock } from '#types/stock'
import { AxiosError } from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useOrderDetail from '../../hooks/useOrderDetail'
import { orderDetailAllocateDrawerHierarchyFormSchema } from '../../order-detail-hierarchy.schema'
import { updateOrderStatusToAllocated } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateHierarchyFormValues,
  OrderDetailItem,
  OrderDetailResponse,
  OrderDetailStock,
  UpdateOrderStatusToFulfilledResponseError,
} from '../../order-detail.type'
import { OrderDetailAllocateDrawerFormHierarchy } from './OrderDetailAllocateDrawerFormHierarchy'
import { OrderDetailAllocateModalFormHierarchy } from './OrderDetailAllocateModalFormHierarchy'

export type AllocatedOrderItemsDrawerFormHierarchyValues = {
  id: number | undefined
  children: Array<{
    id: number | undefined
    allocated_qty: number | undefined
    allocations?: Array<{
      stock_id: number
      allocated_qty: number | undefined
      order_stock_status_id: number | undefined
      _order_stock?: OrderDetailStock
      _vendor_stock?: Stock
      _customer_stock?: Stock
      _customer: OrderDetailResponse['customer']
      _vendor: OrderDetailResponse['vendor']
      _activity: OrderDetailResponse['activity']
    }>
    _order_item_children?: OrderDetailItem['children']
    _vendor_stock?: Stock
    _customer_stock?: Stock
    _customer: OrderDetailResponse['customer']
    _vendor: OrderDetailResponse['vendor']
    _activity: OrderDetailResponse['activity']
  }>
  _order_item?: OrderDetailItem
  _vendor_stock?: Stock
  _customer_stock?: Stock
  _customer: OrderDetailResponse['customer']
  _vendor: OrderDetailResponse['vendor']
  _activity: OrderDetailResponse['activity']
}

export const OrderDetailAllocateFormHierarchy = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const {
    data: orderDetailData,
    setOpenAllocateDrawerForm,
    setOpenAllocateModalForm,
    allocateFormSelectedRow,
    vendorStockData,
  } = useOrderDetailStore()
  const { setLoadingPopup } = useLoadingPopupStore()

  const orderId = params.id as string
  const { mappedOrderItems } = useOrderDetail(orderId)

  const [currentOrderItems, setCurrentOrderItems] = useState<any>(undefined)

  const defaultValues: OrderDetailAllocateHierarchyFormValues = {
    order_items: currentOrderItems,
  }

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    watch,
    trigger,
    clearErrors,
    formState,
  } = useForm<OrderDetailAllocateHierarchyFormValues>({
    resolver: yupResolver(
      orderDetailAllocateDrawerHierarchyFormSchema(
        t,
        i18n.language,
        currentOrderItems
      )
    ),
    mode: 'onChange',
    defaultValues,
  })

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<UpdateOrderStatusToFulfilledResponseError>>,
    any
  >({
    mutationKey: ['order', 'detail', 'allocate'],
    mutationFn: (values) => updateOrderStatusToAllocated(orderId, values),
    onSuccess: async () => {
      setLoadingPopup(true)
      setOpenAllocateDrawerForm(false)
      setOpenAllocateModalForm(false)
      toast.success({
        description: t('orderDetail:message.allocate_order_success'),
      })
      setTimeout(async () => {
        await queryClient.refetchQueries({
          queryKey: [i18n.language, 'order', 'detail', orderId],
        })
        setLoadingPopup(false)
        reset()
      }, 500)
    },
    onError: (error) => {
      const responseData = error.response?.data
      const message =
        responseData?.message ?? t('orderDetail:message.allocate_order_failed')

      toast.danger({ description: message })
    },
  })

  const { update } = useFieldArray<any>({
    control,
    name: 'order_items',
  })

  const handleSubmitForm = (values: OrderDetailAllocateHierarchyFormValues) => {
    const mergeChildrenByMaterialId = (children: any[]) => {
      const materialMap = new Map()

      children.forEach((child) => {
        const materialId = child?._child_detail?.material?.id
        if (!materialId) return

        if (materialMap.has(materialId)) {
          const existing = materialMap.get(materialId)
          existing.allocations = [
            ...(existing.allocations || []),
            ...(child.allocations || []),
          ]
          existing.allocated_qty =
            (existing.allocated_qty || 0) + (child.allocated_qty || 0)
        } else {
          materialMap.set(materialId, { ...child })
        }
      })

      return Array.from(materialMap.values())
    }

    const payload = {
      order_items: values.order_items
        .map((item) => ({
          id: item.id,
          children: mergeChildrenByMaterialId(
            item?.children?.filter((child) => child?.allocated_qty) || []
          ).map((child) => {
            if (item?._order_item?.children?.length && child?.child_id) {
              return {
                id: child.child_id,
                allocations: child?.allocations
                  ?.filter((data: any) => data.allocated_qty)
                  ?.map((allocation: any) => ({
                    stock_id: allocation.stock_id,
                    allocated_qty: allocation.allocated_qty,
                    order_stock_status_id: child.order_stock_status_id?.value,
                  })),
              }
            } else {
              return {
                order_item_kfa_id:
                  child?._child_detail?.material?.material_level_id,
                allocated_qty: child?.allocated_qty,
                material_id: child?._child_detail?.material?.id,
                recommended_stock:
                  child?._child_detail?.recommended_stock ??
                  item?._order_item?.recommended_stock ??
                  0,
                order_reason_id:
                  child?._child_detail?.reason?.id ??
                  item?._order_item?.reason?.id,
                allocations: child?.allocations
                  ?.filter((data: any) => data.allocated_qty)
                  ?.map((allocation: any) => ({
                    stock_id: allocation?.stock_id,
                    allocated_qty: allocation?.allocated_qty,
                    order_stock_status_id: child?.order_stock_status_id?.value,
                  })),
              }
            }
          }),
        }))
        .filter?.((item) => item?.children?.length),
    }
    // mutate(payload)
  }

  const handleSubmitModalForm = (
    values: OrderDetailAllocateHierarchyFormValues['order_items'][number],
    rowIndex: number
  ) => {
    const currentValues = watch('order_items')
    if (!currentValues) return
    const updatedValue = [...currentValues]
    let currentItem = updatedValue[rowIndex]

    currentItem.children = values?.children

    updatedValue[rowIndex] = {
      ...currentItem,
    }

    update(rowIndex, updatedValue[rowIndex])
    trigger()
  }

  useEffect(() => {
    if (orderDetailData) {
      const mapOrderItems = () => {
        return (
          mappedOrderItems?.map((item, index) => {
            const mapChildren = () => {
              if (item?.order_item?.children?.length) {
                return item.order_item.children.map((child) => ({
                  id: child?.id,
                  child_id: child?.id,
                  allocated_qty: undefined,
                  order_stock_status_id: undefined,
                  allocations: mappedOrderItems?.[index]?.vendor_stock?.details
                    ?.filter((detail) => Boolean(detail?.stocks.length))
                    ?.flatMap((detail) => detail?.stocks)
                    ?.map((stock, index) => ({
                      stock_id: child,
                      allocated_qty: undefined,
                      _stock_material: child.material,
                      _stock_detail: stock,
                      _stock_vendor: child.stock_vendor,
                      _stock_customer: child.stock_customer,
                    })),
                  _activity: orderDetailData?.activity,
                  _stock_vendor: child.stock_vendor,
                  _stock_customer: child.stock_customer,
                  _child_detail: child,
                  _child_of_detail_stock: vendorStockData?.find(
                    (detail) => detail?.material?.id === child?.material?.id
                  ),
                  _order_item_children: [child],
                  _vendor_stock: item?.vendor_stock,
                  _customer: orderDetailData.customer,
                  _vendor: orderDetailData.vendor,
                }))
              }

              if (item?.vendor_stock?.details?.length) {
                return item.vendor_stock.details
                  ?.filter((detail) => detail?.stocks.length)
                  .map((detail) => ({
                    id: null,
                    child_id: item?.order_item?.id,
                    allocated_qty: undefined,
                    order_stock_status_id: undefined,
                    allocations: [],
                    _activity: orderDetailData?.activity,
                    _stock_vendor: item?.order_item?.stock_vendor,
                    _stock_customer: item?.order_item?.stock_customer,
                    _child_detail: {
                      allocated_qty: 0,
                      confirmed_qty: item?.order_item?.confirmed_qty,
                      created_at: new Date().toISOString(),
                      fulfilled_qty: 0,
                      id: null,
                      material: {
                        id: detail?.material?.id,
                        name: detail?.material?.name,
                        code: null,
                        type: null,
                        kfa_level_id: null,
                        kfa_level_name: null,
                        material_level_id: detail?.material?.material_level_id,
                        parent_id: null,
                        unit_of_consumption: null,
                        unit_of_distribution: null,
                      },
                      order_id: orderDetailData?.id,
                      order_stocks: [],
                      ordered_qty: item?.order_item?.ordered_qty,
                      other_reason: item?.order_item?.other_reason,
                      qty: item?.order_item?.qty,
                      reason: item?.order_item?.reason,
                      recommended_stock:
                        item?.order_item?.recommended_stock ?? 0,
                      shipped_qty: item?.order_item?.shipped_qty,
                    },
                    _child_of_detail_stock: detail,
                    _order_item_children: [],
                    _vendor_stock: item?.vendor_stock,
                    _customer: orderDetailData.customer,
                    _vendor: orderDetailData.vendor,
                  }))
              }

              return []
            }

            return {
              id: item.order_item.id,
              children: mapChildren(),
              _order_item: item?.order_item,
              _vendor_stock: item?.vendor_stock,
              _customer: orderDetailData.customer,
              _vendor: orderDetailData.vendor,
              _activity: orderDetailData.activity,
            }
          }) ?? []
        )
      }

      const orderItems = mapOrderItems()
      setValue('order_items', orderItems)
      setCurrentOrderItems(orderItems)
    }
  }, [orderDetailData])

  return (
    <>
      <OrderDetailAllocateDrawerFormHierarchy
        errors={formState.errors}
        values={watch('order_items')}
        isLoading={isPending}
        onSubmit={handleSubmit(handleSubmitForm)}
        onReset={() => setValue('order_items', currentOrderItems)}
        clearErrors={clearErrors}
      />
      {allocateFormSelectedRow && (
        <OrderDetailAllocateModalFormHierarchy
          values={getValues('order_items')?.[allocateFormSelectedRow?.index]}
          childIndex={allocateFormSelectedRow?.index}
          onSubmit={handleSubmitModalForm}
          isLoading={false}
        />
      )}
    </>
  )
}
