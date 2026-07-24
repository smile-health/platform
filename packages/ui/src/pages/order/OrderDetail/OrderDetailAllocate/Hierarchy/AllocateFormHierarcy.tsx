import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import OrderCreateReturnModalNeedRelation from '#pages/order/OrderCreateReturn/components/OrderCreateReturnModalNeedRelation'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { numberFormatter } from '#utils/formatter'
import { AxiosError } from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderDetailBox } from '../../components'
import useOrderDetail from '../../hooks/useOrderDetail'
import { orderDetailAllocateDrawerHierarchyFormSchema } from '../../order-detail-hierarchy.schema'
import { updateOrderStatusToAllocated } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateHierarchyFormValues,
  OrderDetailMappedOrderItem,
  UpdateOrderStatusToFulfilledResponseError,
} from '../../order-detail.type'
import OrderHierarchyAllocatedFormBatchModal from '../Form/OrderHierarchyAllocatedFormBatchModal'
import OrderHierarchyAllocatedFormDrawer from '../Form/OrderHierarchyAllocatedFormDrawer'

const AllocateFormHierarcy = () => {
  const router = useSmileRouter()
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const orderId = params.id as string
  const [currentOrderItems, setCurrentOrderItems] = useState<any>(undefined)
  const queryClient = useQueryClient()
  const defaultValues: OrderDetailAllocateHierarchyFormValues = {
    order_items: currentOrderItems,
  }
  const { setLoadingPopup } = useLoadingPopupStore()

  const [showModalNeedRelation, setShowModalNeedRelation] = useState(false)
  const [needRelationData, setNeedRelationData] = useState({
    header: '',
    message: '',
    list: [] as string[],
  })

  const { mappedOrderItems, orderDetailData, vendorStockData } =
    useOrderDetail(orderId)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
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

  const values = watch('order_items')

  const {
    setOpenAllocateModalForm,
    allocateFormSelectedRow,
    setMappedOrderItem,
  } = useOrderDetailStore()

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<UpdateOrderStatusToFulfilledResponseError>>,
    any
  >({
    mutationKey: ['order', 'detail', 'allocate'],
    mutationFn: (values) => updateOrderStatusToAllocated(orderId, values),
    onSuccess: async () => {
      setLoadingPopup(true)
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
      router.push(`/v5/order/${orderId}`)
    },
    onError: (error) => {
      const responseData = error.response?.data
      const errors = responseData?.errors as unknown as Record<string, unknown>

      if (errors?.need_relation === true) {
        toast.danger({ description: responseData?.message })
        setNeedRelationData({
          header: errors.header as string,
          message: errors.message as string,
          list: errors.list as string[],
        })
        setShowModalNeedRelation(true)
        return
      }

      const message =
        responseData?.message ?? t('orderDetail:message.allocate_order_failed')
      toast.danger({ description: message })
    },
  })

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
                  confirmed_qty: child?.confirmed_qty ?? 0,
                  order_stock_status_id: undefined,
                  allocations: mappedOrderItems?.[index]?.vendor_stock?.details
                    ?.filter((detail) => Boolean(detail?.stocks.length))
                    ?.flatMap((detail) => detail?.stocks)
                    ?.map((stock, index) => ({
                      stock_id: child,
                      allocated_qty: undefined,
                      confirmed_qty: child?.confirmed_qty ?? 0,
                      order_stock_status_id: null,
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
                    confirmed_qty: item?.order_item?.confirmed_qty ?? 0,
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

  const renderActionColumn = useCallback(
    (row: Row<OrderDetailMappedOrderItem>) => {
      const vendorStock = row.original.vendor_stock
      const value = values?.find(
        (value) => value?.id === row.original.order_item?.id
      )
      const filteredAllocations =
        value?.children?.filter((value) => Number(value?.allocated_qty) > 0) ??
        []
      const totalFilteredAllocations = filteredAllocations?.reduce(
        (prev, curr) => prev + (curr?.allocated_qty || 0),
        0
      )

      const isFilteredAllocationExist = filteredAllocations.length > 0
      const errorMessage = errors.order_items?.[row.index]?.children
        ?.message as any

      const handleClick = () => {
        setOpenAllocateModalForm(true, row)
        setMappedOrderItem(mappedOrderItems)
      }

      return (
        <div className="space-y-2">
          {isFilteredAllocationExist && (
            <div className="space-y-2">
              {isFilteredAllocationExist && (
                <div className="ui-text-sm">
                  <div className="ui-font-semibold">
                    Qty:{' '}
                    {numberFormatter(totalFilteredAllocations, i18n.language)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="ui-space-y-1">
            <Button
              size="sm"
              type="button"
              disabled={!vendorStock?.aggregate?.total_available_qty}
              leftIcon={
                !isFilteredAllocationExist && (
                  <PlusIcon className="ui-w-5 ui-text-dark-blue" />
                )
              }
              variant="outline"
              onClick={handleClick}
            >
              {!isFilteredAllocationExist
                ? t('orderDetail:table.product_variant')
                : t('orderDetail:button.update_product_variant')}
            </Button>

            {errorMessage && (
              <FormErrorMessage>
                {typeof errorMessage === 'string'
                  ? errorMessage
                  : errorMessage?.button}
              </FormErrorMessage>
            )}
          </div>
        </div>
      )
    },
    [values, errors]
  )

  const columns: ColumnDef<OrderDetailMappedOrderItem>[] = useMemo(
    () => [
      {
        accessorKey: 'order_item.material.name',
        header: t('orderDetail:table.column.material_name'),
        cell: ({ row }) => row.original.order_item?.material.name,
      },
      {
        accessorKey: 'order_item.qty',
        header: t('orderDetail:table.column.ordered'),
        cell: ({ row }) =>
          numberFormatter(row.original.order_item?.ordered_qty, i18n.language),
      },
      {
        accessorKey: 'order_item.confirmed_qty',
        header: t('orderDetail:table.column.confirmed'),
        cell: ({ row }) => {
          return (
            <div>
              {numberFormatter(
                row.original.order_item?.confirmed_qty,
                i18n.language
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'action',
        header: t('orderDetail:table.column.allocation'),
        minSize: 180,
        cell: ({ row }) => renderActionColumn(row),
      },
    ],
    [values, errors, orderDetailData, i18n.language]
  )

  const { update } = useFieldArray<any>({
    control,
    name: 'order_items',
  })

  const handleSubmitModalForm = (
    values: OrderDetailAllocateHierarchyFormValues['order_items'][number],
    rowIndex: number
  ) => {
    setOpenAllocateModalForm(false, undefined)
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
                    order_stock_status_id:
                      allocation.order_stock_status_id?.value,
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
                    order_stock_status_id:
                      allocation?.order_stock_status_id?.value,
                  })),
              }
            }
          }),
        }))
        .filter?.((item) => item?.children?.length),
    }
    mutate(payload)
  }

  useEffect(() => {
    setLoadingPopup(isPending)
  }, [isPending])

  return (
    <OrderDetailBox
      title={mappedOrderItems ? `Item (${mappedOrderItems.length})` : 'Item'}
      enableShowHide
    >
      <DataTable
        className="ui-overflow-y-auto ui-max-h-[50vh]"
        columns={columns}
        data={mappedOrderItems}
        isSticky
      />

      <OrderHierarchyAllocatedFormDrawer
        values={watch('order_items')?.[Number(allocateFormSelectedRow?.index)]}
        childIndex={Number(allocateFormSelectedRow?.index)}
        onSubmit={handleSubmitModalForm}
        isLoading={false}
      />

      <OrderHierarchyAllocatedFormBatchModal />

      <OrderCreateReturnModalNeedRelation
        open={showModalNeedRelation}
        setOpen={setShowModalNeedRelation}
        header={needRelationData.header}
        message={needRelationData.message}
        list={needRelationData.list}
      />

      <div className="ui-fixed ui-bottom-0 ui-left-0 ui-w-full ui-shadow-lg ui-bg-white ui-border-t ui-transition-all ui-transform ui-translate-y-0">
        <div className="ui-container ui-mx-auto ui-flex ui-justify-end ui-items-center ui-py-4 ui-px-6 ui-gap-3">
          <Button
            key={'test'}
            className="ui-min-w-[200px]"
            variant="outline"
            onClick={() => router.push(`/v5/order/${orderId}`)}
            loading={isPending}
          >
            {t('common:cancel')}
          </Button>
          <Button
            key={'test'}
            className="ui-min-w-[200px]"
            onClick={handleSubmit(handleSubmitForm)}
            loading={isPending}
          >
            {t('orderDetail:button.submit_allocation')}
          </Button>
        </div>
      </div>
    </OrderDetailBox>
  )
}

export default AllocateFormHierarcy
