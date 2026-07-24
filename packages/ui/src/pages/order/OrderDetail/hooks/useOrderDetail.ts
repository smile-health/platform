import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useProgram } from '#hooks/program/useProgram'
import { listStockByEntities } from '#services/stock'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { OrderTypeEnum } from '../../order.constant'
import { orderDetailHierarchyTypes } from '../order-detail.constant'
import { getOrderDetail } from '../order-detail.service'
import useOrderDetailStore from '../order-detail.store'
import { OrderDetailResponse } from '../order-detail.type'

export default function useOrderDetail(orderId: string) {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const { setLoadingPopup } = useLoadingPopupStore()
  const { activeProgram } = useProgram()
  const isHierarchyEnabled =
    activeProgram?.config?.material?.is_hierarchy_enabled

  // NOTE: remove this after refactoring
  const { setData, setVendorStockData } = useOrderDetailStore()

  const {
    data: orderDetailData,
    isLoading: isOrderDetailLoading,
    error: orderDetailError,
  } = useQuery<OrderDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: [i18n.language, 'order', 'detail', orderId],
    queryFn: () => getOrderDetail(orderId),
    staleTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const isOrderDetailHierarchy = orderDetailHierarchyTypes.includes(
    orderDetailData?.type as OrderTypeEnum
  )

  const {
    data: vendorStockData,
    isLoading: isVendorStockLoading,
    error: vendorStockError,
  } = useQuery({
    queryKey: [i18n.language, 'order', 'detail', orderId, 'stock-entities'],
    queryFn: () => {
      return listStockByEntities({
        page: 1,
        paginate: 100,
        ...(isHierarchyEnabled &&
          isOrderDetailHierarchy && {
            material_level_id: '2',
          }),
        entity_id: orderDetailData?.vendor_id,
        with_details: 1,
        material_id: orderDetailData?.order_items
          .map((item) => item.material.id)
          .join(','),
        activity_id: orderDetailData?.activity?.id,
      })
    },
    select: (response) => response.data,
    enabled: Boolean(orderDetailData),
  })

  const mappedOrderItems = orderDetailData?.order_items?.map((item) => {
    return {
      order_item: item,
      vendor_stock: vendorStockData?.find(
        (stock) => stock?.material?.id === item.material.id
      ),
    }
  })

  useEffect(() => {
    setLoadingPopup(isOrderDetailLoading || isVendorStockLoading)
  }, [isOrderDetailLoading, isVendorStockLoading])

  // NOTE: remove this after refactoring
  useEffect(() => {
    setData(orderDetailData)
    setVendorStockData(vendorStockData)
  }, [orderDetailData])

  return {
    orderDetailData,
    orderDetailError,
    vendorStockData,
    vendorStockError,
    isLoading: isOrderDetailLoading || isVendorStockLoading,
    mappedOrderItems,
    isOrderDetailHierarchy,
  }
}
