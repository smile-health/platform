import { OrderStatusEnum, OrderTypeEnum } from '../order.constant'
import {
  exportBatchNote,
  exportConfirmationNote,
  exportLetterRequest,
  exportSbbk,
  exportVar,
} from './order-detail.service'

const { Pending, Confirmed, Allocated, Shipped, Fulfilled } = OrderStatusEnum

export const downloadFileFetchingFunction = {
  'export-order-letter-request': exportLetterRequest,
  'export-order-confirmation-note': exportConfirmationNote,
  'export-order-batch-note': exportBatchNote,
  'export-order-sbbk': exportSbbk,
  'export-order-var': exportVar,
}

export const downloadFileStatusMap = {
  'export-order-letter-request': [
    Pending,
    Confirmed,
    Allocated,
    Shipped,
    Fulfilled,
  ],
  'export-order-confirmation-note': [Confirmed, Allocated, Shipped, Fulfilled],
  'export-order-batch-note': [Allocated, Shipped, Fulfilled],
  'export-order-sbbk': [Shipped, Fulfilled],
  'export-order-var': [Shipped, Fulfilled],
}

export const orderDetailHierarchyTypes = [
  OrderTypeEnum.Request,
  OrderTypeEnum.Relocation,
]

export enum orderDetailCapacityProjectionStatusEnum {
  Pending = 0,
  Confirmed = 1,
  Allocated = 2,
}

export const orderDetailCapacityProjectionStatus = [
  orderDetailCapacityProjectionStatusEnum.Pending,
  orderDetailCapacityProjectionStatusEnum.Confirmed,
  orderDetailCapacityProjectionStatusEnum.Allocated,
]

export const orderDetailCapacityProjectionTitleMap = {
  [orderDetailCapacityProjectionStatusEnum.Pending]: 'based_on_ordered_qty',
  [orderDetailCapacityProjectionStatusEnum.Confirmed]: 'based_on_confirmed_qty',
  [orderDetailCapacityProjectionStatusEnum.Allocated]: 'based_on_allocated_qty',
}
