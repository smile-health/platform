import { Badge } from '#components/badge'
import { Color } from '#types/component'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useOrder } from '../../hooks/useOrder'
import { OrderStatusEnum } from '../../order.constant'
import { OrderDetailUser } from '../order-detail.type'

const { Draft, Pending, Confirmed, Allocated, Shipped, Fulfilled, Cancelled } =
  OrderStatusEnum

const OrderDetailStatusItem = ({
  status,
  date,
  user,
}: {
  status: OrderStatusEnum
  date?: string | null
  user?: OrderDetailUser | null
}) => {
  const { t } = useTranslation()
  const { orderStatus } = useOrder()

  const getStatusColor = (): Color => {
    return {
      [Draft]: orderStatus[Draft].color,
      [Pending]:
        status === Pending || status === Cancelled
          ? orderStatus[Pending].color
          : 'success',
      [Confirmed]: orderStatus[Confirmed].color,
      [Allocated]: orderStatus[Allocated].color,
      [Shipped]: orderStatus[Shipped].color,
      [Fulfilled]: orderStatus[Fulfilled].color,
      [Cancelled]: orderStatus[Cancelled].color,
    }[status]
  }

  return (
    <div className="ui-flex ui-flex-col ui-items-center ui-min-w-[160px]">
      <Badge
        rounded="full"
        color={getStatusColor()}
        variant="light"
        className="ui-w-full ui-py-2"
      >
        {orderStatus[status].label}
      </Badge>
      <div className="ui-p-2 ui-text-center ui-text-sm">
        <div className="ui-text-gray-500 ui-uppercase">
          {date ? dayjs(date).format('YYYY MMM DD HH:mm') : '-'}
        </div>
        <div className="ui-text-dark-blue">
          {user
            ? `${t('by')} ${getFullName(user?.firstname, user?.lastname)}`
            : '-'}
        </div>
      </div>
    </div>
  )
}

export default OrderDetailStatusItem
