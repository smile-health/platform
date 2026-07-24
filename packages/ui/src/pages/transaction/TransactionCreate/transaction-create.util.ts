import { Stock } from "#types/stock"
import { TRANSACTION_TYPE } from "./transaction-create.constant"

export const setDisabledMaterialStockZero = (type: number, total: number): boolean => {
  return (
    (type === TRANSACTION_TYPE.DISCARD ||
      type === TRANSACTION_TYPE.LAST_MILE ||
      type === TRANSACTION_TYPE.REMOVE_STOCK ||
      type === TRANSACTION_TYPE.TRANSFER_STOCK) &&
    total <= 0
  )
}

export const setDisabledMaterialActivityIsNotAvailable = (type: number, item: Stock) => {
  if (
    (type === TRANSACTION_TYPE.DISCARD ||
      type === TRANSACTION_TYPE.REMOVE_STOCK) &&
    item
  )
    return item.total_available_qty === 0

  return (
    (type === TRANSACTION_TYPE.DISCARD ||
      type === TRANSACTION_TYPE.REMOVE_STOCK) &&
    !item
  )
}