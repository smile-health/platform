export const ORDER_LIST_URL = [
  '/v5/order/all',
  '/v5/order/vendor',
  '/v5/order/customer',
]

export enum OrderStatusEnum {
  Pending = 1,
  Confirmed = 2,
  Allocated = 3,
  Shipped = 4,
  Fulfilled = 5,
  Cancelled = 6,
  Draft = 8,
}

export enum OrderTypeEnum {
  Request = 1,
  Distribution = 2,
  Return = 3,
  CentralDistribution = 4,
  Relocation = 7,
}

export const orderStatusType = (
  type: 'batch' | 'children',
  isOrderDetailHierarchy?: boolean
) => {
  const value = isOrderDetailHierarchy
    ? type === 'batch'
      ? 'received'
      : 'fulfilled'
    : 'received'
  return ['ordered', 'confirmed', 'allocated', 'shipped', value, 'cancelled']
}

export enum OrderDeviceTypeEnum {
  Web = 1,
  Mobile = 2,
}

export enum OrderReasonEnum {
  Others = 9,
}

export enum OrderCancelReasonEnum {
  Others = 4,
}

export enum ThirdPartyOrderEnum {
  SIHA = 'siha',
  SITB = 'sitb',
  DIN = 'din',
}

export const orderThirdPartyTypes = [
  ThirdPartyOrderEnum.SIHA,
  ThirdPartyOrderEnum.SITB,
  ThirdPartyOrderEnum.DIN,
]
