import { useTranslation } from 'react-i18next'

import { OrderStatusEnum } from '../order.constant'
import { OrderStatusOption } from '../order.type'

const { Draft, Pending, Confirmed, Allocated, Shipped, Fulfilled, Cancelled } =
  OrderStatusEnum

export const useOrder = () => {
  const { t } = useTranslation('order')

  const status: Record<OrderStatusEnum, OrderStatusOption> = {
    [Draft]: {
      value: Draft,
      label: t('status.draft'),
      color: 'neutral',
    },
    [Pending]: {
      value: Pending,
      label: t('status.pending'),
      color: 'secondary',
    },
    [Confirmed]: {
      value: Confirmed,
      label: t('status.confirmed'),
      color: 'success',
    },
    [Allocated]: {
      value: Allocated,
      label: t('status.allocated'),
      color: 'success',
    },
    [Shipped]: {
      value: Shipped,
      label: t('status.shipped'),
      color: 'success',
    },
    [Fulfilled]: {
      value: Fulfilled,
      label: t('status.fulfilled'),
      color: 'success',
    },
    [Cancelled]: {
      value: Cancelled,
      label: t('status.cancelled'),
      color: 'danger',
    },
  }

  return {
    orderStatus: status,
    orderStatusList: [
      status[Draft],
      status[Pending],
      status[Confirmed],
      status[Allocated],
      status[Shipped],
      status[Fulfilled],
      status[Cancelled],
    ],
  }
}
