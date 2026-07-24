import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import OrderContainer from '#pages/order/OrderContainer'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum, OrderTypeEnum } from '../../order.constant'
import { OrderDetailCustomer } from '../components/Sections/OrderDetailCustomer'
import { OrderDetailVendor } from '../components/Sections/OrderDetailVendor'
import useOrderDetail from '../hooks/useOrderDetail'
import AllocateFormHierarcy from './Hierarchy/AllocateFormHierarcy'

const eligibleStatuses = [OrderStatusEnum.Confirmed]
const { Request, Relocation } = OrderTypeEnum

const AllocatePage = () => {
  const router = useSmileRouter()
  const params = useParams()

  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const { orderDetailData, orderDetailError } = useOrderDetail(orderId)

  const status = orderDetailData?.status
  const isStatusEligible = eligibleStatuses.includes(status as OrderStatusEnum)

  useEffect(() => {
    if (orderDetailData && !isStatusEligible) {
      toast.warning({
        description:
          status === OrderStatusEnum.Allocated
            ? t('orderDetail:message.status_already_allocated')
            : t('orderDetail:message.status_not_eligible'),
      })
      router.replace(`/v5/order/${orderId}`)
    }
  }, [orderDetailData, i18n.language])

  if (orderDetailError?.response?.status === 403) return <Error403Page />
  if (orderDetailError?.response?.status === 404) return <Error404Page />

  const handlePageTitle = () => {
    const title: Record<number, string> = {
      [Request]: t('orderDetail:title.allocate_request'),
      [Relocation]: t('orderDetail:title.allocate_relocation'),
    }

    const currentStatus = Number(orderDetailData?.type) || Request
    return `${title[currentStatus]} - ${orderId}`
  }

  return (
    <OrderContainer
      title={handlePageTitle()}
      metaTitle={handlePageTitle()}
      backButton={{
        show: true,
        label: t('common:back'),
        onClick: () => {
          router.push(`/v5/order/${orderId}`)
        },
      }}
    >
      <div className="ui-space-y-6">
        <div className="ui-grid ui-grid-cols-2 ui-gap-6">
          <OrderDetailCustomer />
          <OrderDetailVendor />
        </div>
        <AllocateFormHierarcy />
      </div>
    </OrderContainer>
  )
}

export default AllocatePage
