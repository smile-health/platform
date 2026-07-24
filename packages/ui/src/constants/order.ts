import { TFunction } from 'i18next'

import { OrderStatusEnum, OrderTypeEnum } from '../pages/order/order.constant'
import { TOrderIntegrationType } from '../pages/order/OrderList/order-list.type'
import { ProgramEnum } from './program'

export const orderStatusList = (
  t: TFunction<['common', 'order', 'orderList']>
) => [
  {
    value: OrderStatusEnum.Draft,
    label: t('order:status.draft'),
  },
  {
    value: OrderStatusEnum.Pending,
    label: t('order:status.pending'),
  },
  {
    value: OrderStatusEnum.Confirmed,
    label: t('order:status.confirmed'),
  },
  {
    value: OrderStatusEnum.Allocated,
    label: t('order:status.allocated'),
  },
  {
    value: OrderStatusEnum.Shipped,
    label: t('order:status.shipped'),
  },
  {
    value: OrderStatusEnum.Fulfilled,
    label: t('order:status.fulfilled'),
  },
  {
    value: OrderStatusEnum.Cancelled,
    label: t('order:status.cancelled'),
  },
]

export function orderTypeList(t: TFunction) {
  return [
    {
      label: t('order.type.order'),
      value: OrderTypeEnum.Request,
    },
    {
      label: t('order.type.distribution'),
      value: OrderTypeEnum.Distribution,
    },
    {
      label: t('order.type.return'),
      value: OrderTypeEnum.Return,
    },
    {
      label: t('order.type.central_distribution'),
      value: OrderTypeEnum.CentralDistribution,
    },
    {
      label: t('order.type.relocation'),
      value: OrderTypeEnum.Relocation,
    },
  ]
}

export function orderIntegrationTypeList(t: TFunction): Array<{
  label: Uppercase<TOrderIntegrationType>
  value: TOrderIntegrationType
  programKey?: ProgramEnum
}> {
  return [
    {
      label: 'SIHA',
      value: 'siha',
      programKey: ProgramEnum.Hiv,
    },
    {
      label: 'SITB',
      value: 'sitb',
      programKey: ProgramEnum.Tb,
    },
    {
      label: 'DIN',
      value: 'din',
    },
    {
      label: 'BIOFARMA',
      value: 'biofarma',
    },
  ]
}
