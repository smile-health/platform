import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useQuery } from '@tanstack/react-query'
import { USER_ROLE } from '#constants/roles'
import { useProgram } from '#hooks/program/useProgram'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import { listStockByEntities } from '#services/stock'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import OrderInteroperabilityBadge from '../components/OrderInteroperabilityBadge'
import { OrderStatusEnum, OrderTypeEnum } from '../order.constant'
import OrderContainer from '../OrderContainer'
import {
  OrderDetailAllocateForm,
  OrderDetailCancelConfirmationForm,
  OrderDetailCancelForm,
  OrderDetailComment,
  OrderDetailConfirmForm,
  OrderDetailDetails,
  OrderDetailFloatingBar,
  OrderDetailItemForm,
  OrderDetailItems,
  OrderDetailQuantityDetailModal,
  OrderDetailStatus,
} from './components'
import { OrderDetailAllocateFormHierarchy } from './components/Forms/OrderDetailAllocateFormHierarchy'
import { OrderDetailConfirmHierarchyForm } from './components/Forms/OrderDetailConfirmHierarchyForm'
import { OrderDetailShipForm } from './components/Forms/OrderDetailShipForm'
import { OrderDetailValidateForm } from './components/Forms/OrderDetailValidateForm'
import { OrderDetailHistory } from './components/OrderDetailHistory'
import { OrderDetailCapacityProjection } from './components/Sections/OrderDetailCapacityProjection'
import { orderDetailHierarchyTypes } from './order-detail.constant'
import { getOrderDetail } from './order-detail.service'
import useOrderDetailStore from './order-detail.store'
import {
  OrderDetailMappedOrderItem,
  OrderDetailResponse,
} from './order-detail.type'

const { Draft, Cancelled, Pending, Confirmed, Allocated, Shipped, Fulfilled } =
  OrderStatusEnum
const { Request, Distribution, Return, CentralDistribution, Relocation } =
  OrderTypeEnum

const OrderDetailPage = () => {
  const router = useSmileRouter()
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const { setLoadingPopup } = useLoadingPopupStore()
  const { activeProgram } = useProgram()

  const userData = getUserStorage()
  const userEntity = userData?.programs?.find(
    (data) => data?.id === activeProgram?.id
  )?.entity_id

  const isSuperAdmin = [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(
    Number(userData?.role)
  )

  const showOrderProjectionCapacitySection = useFeatureIsOn(
    'order_detail.show_order_projection_capacities'
  )

  const {
    setData,
    setVendorStockData,
    setLoading,
    setMappedOrderItem,
    setIsCustomer,
    setIsVendor,
    setIsOrderDetailHierarchy,
    isOrderDetailHierarchy,
    setIsThirdPartyOrder,
    setOrderItemProjectionCapacities,
    orderItemProjectionCapacities,
  } = useOrderDetailStore()

  const isHierarchyEnabled =
    activeProgram?.config?.material?.is_hierarchy_enabled

  const orderId = params.id as string

  const { data, isLoading, error } = useQuery<
    OrderDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: [i18n.language, 'order', 'detail', orderId],
    queryFn: () => getOrderDetail(orderId),
    staleTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const isOrderInteroperability = data?.metadata?.client_key

  const { data: vendorStockResponseData, isLoading: isLoadingStock } = useQuery(
    {
      queryKey: [i18n.language, 'order', 'detail', orderId, 'stock-entities'],
      queryFn: () => {
        return listStockByEntities({
          ...(isHierarchyEnabled &&
            orderDetailHierarchyTypes && {
              material_level_id: '2',
            }),
          page: 1,
          paginate: 100,
          entity_id: data?.vendor_id,
          with_details: 1,
          material_id: data?.order_items
            .map((item) => item.material.id)
            .join(','),
          activity_id: data?.activity?.id,
        })
      },
      select: (response) => response.data,
      enabled: Boolean(data) && data?.status === Confirmed,
    }
  )

  const handlePageTitle = () => {
    const title = {
      [Request]: t('orderDetail:title.request'),
      [Distribution]: t('orderDetail:title.distribution'),
      [Return]: t('orderDetail:title.return'),
      [CentralDistribution]: t('orderDetail:title.central_distribution'),
      [Relocation]: t('orderDetail:title.relocation'),
    }

    return `${title[data?.type ?? Request]} - ${orderId}`
  }

  useEffect(() => {
    setData(data as OrderDetailResponse)
    setVendorStockData(vendorStockResponseData)
    setLoading(isLoading || isLoadingStock)
    setLoadingPopup(isLoading || isLoadingStock)
    setIsCustomer(data?.customer_id === userEntity)
    setIsVendor(isSuperAdmin ? false : data?.vendor_id === userEntity)
    setIsOrderDetailHierarchy(
      orderDetailHierarchyTypes.includes(data?.type as OrderTypeEnum)
    )
    setIsThirdPartyOrder(
      Boolean(data?.metadata?.client_key) &&
        Boolean(activeProgram?.config?.order?.is_confirm_restricted)
    )
    if (showOrderProjectionCapacitySection) {
      setOrderItemProjectionCapacities(
        data?.order_item_projection_capacities || undefined
      )
    }

    const mapped: OrderDetailMappedOrderItem[] | undefined =
      data?.order_items?.map((item) => {
        return {
          order_item: item,
          vendor_stock: vendorStockResponseData?.find(
            (stock) => stock?.material?.id === item.material.id
          ),
        }
      })
    setMappedOrderItem(mapped)
  }, [data, vendorStockResponseData, isLoading, isLoadingStock, i18n.language])

  if (error?.response?.status === 403) return <Error403Page />
  if (error?.response?.status === 404) return <Error404Page />

  return (
    <OrderContainer
      title={
        <div className="ui-justify-center ui-items-center ui-gap-4 ui-text-center ui-flex">
          {handlePageTitle()}{' '}
          {data?.metadata?.client_key && (
            <OrderInteroperabilityBadge
              client={data.metadata.client_key}
              className="text-base"
            />
          )}
        </div>
      }
      metaTitle={handlePageTitle()}
      backButton={{
        show: true,
        label: t('common:back_to_list'),
        onClick: () => {
          userData?.role === USER_ROLE.MANAGER ||
          userData?.role === USER_ROLE.MANUFACTURE
            ? router.push('/v5/order/vendor')
            : router.push('/v5/order/all')
        },
      }}
    >
      <div className="ui-space-y-6">
        <OrderDetailStatus />
        <OrderDetailItems />
        {Boolean(
          showOrderProjectionCapacitySection &&
            activeProgram?.key === 'immunization' &&
            orderItemProjectionCapacities?.length
        ) && <OrderDetailCapacityProjection />}
        <OrderDetailDetails />
        <OrderDetailComment />
        {isOrderInteroperability && <OrderDetailHistory />}
      </div>

      {data &&
        [Draft, Pending, Confirmed, Allocated, Shipped].includes(
          data.status
        ) && <OrderDetailFloatingBar />}

      {data?.status !== Cancelled && data?.status !== Fulfilled && (
        <OrderDetailCancelForm />
      )}

      {data?.status === Draft && <OrderDetailValidateForm />}

      {data?.status === Pending && (
        <>
          <OrderDetailItemForm />
          {isHierarchyEnabled && isOrderDetailHierarchy ? (
            <>
              <OrderDetailConfirmHierarchyForm />
              <OrderDetailQuantityDetailModal
                isHierarchyEnabled={
                  isHierarchyEnabled && isOrderDetailHierarchy
                }
              />
            </>
          ) : (
            <OrderDetailConfirmForm />
          )}
        </>
      )}

      {data?.status === Confirmed && (
        <>
          <OrderDetailCancelConfirmationForm />
          {isHierarchyEnabled && isOrderDetailHierarchy ? (
            <>
              <OrderDetailAllocateFormHierarchy />
              <OrderDetailQuantityDetailModal
                isHierarchyEnabled={
                  isHierarchyEnabled && isOrderDetailHierarchy
                }
              />
            </>
          ) : (
            <OrderDetailAllocateForm />
          )}
        </>
      )}

      {data?.status === Allocated && (
        <>
          <OrderDetailCancelConfirmationForm />
          <OrderDetailShipForm />
        </>
      )}

      {(data?.status === Allocated ||
        data?.status === Shipped ||
        data?.status === Fulfilled) && (
        <OrderDetailQuantityDetailModal
          isHierarchyEnabled={isHierarchyEnabled && isOrderDetailHierarchy}
        />
      )}
    </OrderContainer>
  )
}

export default OrderDetailPage
