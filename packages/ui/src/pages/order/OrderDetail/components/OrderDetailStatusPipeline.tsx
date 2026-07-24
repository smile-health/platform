import { Badge } from '#components/badge'
import { Skeleton } from '#components/skeleton'
import { Color } from '#types/component'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useOrder } from '../../hooks/useOrder'
import { OrderStatusEnum } from '../../order.constant'
import useOrderDetailStore from '../order-detail.store'

const { Draft, Pending, Confirmed, Allocated, Shipped, Fulfilled, Cancelled } =
  OrderStatusEnum

export const OrderDetailStatusPipeline = () => {
  const { t } = useTranslation(['common', 'orderDetail'])

  const { orderStatus, orderStatusList } = useOrder()
  const { data } = useOrderDetailStore()

  const isOrderInteroperability = Boolean(data?.metadata?.client_key)

  const getStatusColor = (value: OrderStatusEnum): Color => {
    return {
      [Draft]: orderStatus[Draft].color,
      [Pending]:
        data?.status === Pending || data?.status === Cancelled
          ? orderStatus[Pending].color
          : 'success',
      [Confirmed]: orderStatus[Confirmed].color,
      [Allocated]: orderStatus[Allocated].color,
      [Shipped]: orderStatus[Shipped].color,
      [Fulfilled]: orderStatus[Fulfilled].color,
      [Cancelled]: orderStatus[Cancelled].color,
    }[value]
  }

  const getStatusDate = (value: OrderStatusEnum) => {
    const date = {
      [Draft]: data?.drafted_at,
      [Pending]: data?.status !== Draft && data?.created_at,
      [Confirmed]: data?.status !== Pending && data?.confirmed_at,
      [Allocated]: data?.allocated_at,
      [Shipped]: data?.shipped_at,
      [Fulfilled]: data?.status === Fulfilled && data?.updated_at,
      [Cancelled]: data?.cancelled_at,
    }

    return date[value] ? dayjs(date[value]).format('DD MMM YYYY HH:mm') : null
  }

  const getStatusUser = (value: OrderStatusEnum) => {
    const user = {
      [Draft]: data?.user_drafted_by,
      [Pending]: isOrderInteroperability
        ? data?.user_validated_by
        : data?.user_created_by,
      [Confirmed]: data?.user_confirmed_by,
      [Allocated]: data?.user_allocated_by,
      [Shipped]: data?.user_shipped_by,
      [Fulfilled]: data?.user_fulfilled_by,
      [Cancelled]: data?.user_cancelled_by,
    }

    return user[value]
      ? `${t('common:by')} ${getFullName(user[value]?.firstname, user[value]?.lastname)}`
      : null
  }

  const getStatusVisibility = (value: OrderStatusEnum) => {
    if (data?.metadata?.client_key === 'din') {
      return (
        value >= OrderStatusEnum.Shipped &&
        value !== OrderStatusEnum.Draft &&
        Boolean(getStatusDate(value))
      )
    }

    return Boolean(getStatusDate(value))
  }

  return (
    <div className="ui-inline-flex ui-items-start ui-gap-10 relative">
      {!data && <OrderDetailStatusPipelineSkeleton />}

      {data && (
        <>
          <div className="ui-absolute -ui-z-10 ui-left-0 ui-top-[15px] ui-h-[1.25px] ui-w-full ui-bg-gray-300" />

          {orderStatusList
            .filter((statusItem) => getStatusVisibility(statusItem.value))
            .map((statusItem) => (
              <div
                key={statusItem.value}
                className="ui-flex ui-flex-col ui-items-center ui-min-w-[160px]"
              >
                <Badge
                  rounded="full"
                  color={getStatusColor(statusItem.value)}
                  variant="light"
                  className="ui-w-full ui-py-2"
                >
                  {statusItem.label}
                </Badge>
                <div className="ui-p-2 ui-text-center ui-text-sm">
                  <div className="ui-text-gray-500 ui-uppercase">
                    {getStatusDate(statusItem.value) ?? '-'}
                  </div>
                  <div className="ui-text-dark-blue">
                    {getStatusUser(statusItem.value) ?? '-'}
                  </div>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  )
}

export const OrderDetailStatusPipelineSkeleton = () => (
  <div className="ui-flex ui-gap-6 ui-relative">
    <Skeleton className="ui-w-[160px] ui-h-16" />
    <Skeleton className="ui-w-[160px] ui-h-16" />
    <Skeleton className="ui-w-[160px] ui-h-16" />
  </div>
)
