import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from '#components/toast'
import { useProgram } from '#hooks/program/useProgram'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import OrderContainer from '#pages/order/OrderContainer'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum, OrderTypeEnum } from '../../order.constant'
import { OrderDetailCustomer } from '../components/Sections/OrderDetailCustomer'
import { OrderDetailVendor } from '../components/Sections/OrderDetailVendor'
import useOrderDetail from '../hooks/useOrderDetail'
import { ReceiveFormHierarchy } from './Hierarchy/ReceiveFormHierarchy'
import { ReceiveForm } from './ReceiveForm/ReceiveForm'

const eligibleStatuses = [OrderStatusEnum.Shipped]

const { Request, Distribution, Return, CentralDistribution, Relocation } =
  OrderTypeEnum

const OrderDetailReceivePage = () => {
  const router = useSmileRouter()
  const params = useParams()

  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const { orderDetailData, orderDetailError, isOrderDetailHierarchy } =
    useOrderDetail(orderId)
  const { activeProgram } = useProgram()

  const isHierarchyEnabled =
    activeProgram?.config?.material?.is_hierarchy_enabled

  const status = orderDetailData?.status
  const isStatusEligible = eligibleStatuses.includes(status as OrderStatusEnum)

  useEffect(() => {
    if (orderDetailData && !isStatusEligible) {
      toast.warning({
        description:
          status === OrderStatusEnum.Fulfilled
            ? t('orderDetail:message.status_already_fulfilled')
            : t('orderDetail:message.status_not_eligible'),
      })

      // router.replace(`/v5/order/${orderId}`)
    }
  }, [orderDetailData, i18n.language])

  if (orderDetailError?.response?.status === 403) return <Error403Page />
  if (orderDetailError?.response?.status === 404) return <Error404Page />

  const handlePageTitle = () => {
    const title = {
      [Request]: t('orderDetail:title.receive_order'),
      [Distribution]: t('orderDetail:title.receive_distribution'),
      [Return]: t('orderDetail:title.receive_return'),
      [CentralDistribution]: t(
        'orderDetail:title.receive_central_distribution'
      ),
      [Relocation]: t('orderDetail:title.receive_relocation'),
    }

    return `${title[orderDetailData?.type ?? Request]} - ${orderId}`
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
        <div className="border ui-border-secondary-700 ui-text-secondary-700 ui-bg-secondary-50 ui-px-3.5 ui-rounded-md ui-py-3 ui-font-semibold">
          {t('orderDetail:info.receive')}
        </div>

        <div className="ui-grid ui-grid-cols-2 ui-gap-6">
          <OrderDetailCustomer />
          <OrderDetailVendor />
        </div>
        {isHierarchyEnabled && isOrderDetailHierarchy ? (
          <ReceiveFormHierarchy />
        ) : (
          <ReceiveForm />
        )}
      </div>
    </OrderContainer>
  )
}

export default OrderDetailReceivePage
