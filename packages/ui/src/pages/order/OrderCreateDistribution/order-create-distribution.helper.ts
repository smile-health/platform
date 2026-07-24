import { DetailStock, Stock, StockDetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'

import { isLessThanToday } from '../order.helper'
import { CreateOrderDistributionBody } from './order-create-distribution.service'
import {
  TFormatBatch,
  TFormatDetailBatch,
  TOrderFormItemsDetailValues,
  TOrderFormItemsValues,
  TOrderFormValues,
  TOrderItem,
  TOrderStock,
} from './order-create-distribution.type'

export function parseDate(date?: string) {
  return parseDateTime(date, 'DD MMM YYYY').toUpperCase()
}

export function isSelectedStock(material_id?: number, selected?: number[]) {
  return selected?.includes(material_id as number)
}

export function isOutOfStock(stock?: number) {
  return !stock
}

export function handleMaterialTableClass(
  stock: Stock,
  selectedMaterial: number[]
) {
  if (isOutOfStock(stock?.total_available_qty + Number(stock?.aggregate?.total_available_qty))) {
    return 'ui-text-slate-300 ui-cursor-not-allowed'
  }
  if (isSelectedStock(stock?.material?.id, selectedMaterial)) {
    return 'ui-bg-[#E2F3FC]'
  }

  return ''
}

export function getStockByActivity(details?: DetailStock[], activity?: number) {
  return details?.find((detail) => {
    return detail?.activity?.id === activity
  })
}

function mapBatch(data?: StockDetailStock[]) {
  return data?.map((item) => ({
    id: item?.id,
    qty: item?.qty,
    available_qty: item?.available_qty,
    allocated_qty: item?.allocated_qty,
    min: item?.min,
    max: item?.max,
    code: item?.batch?.code,
    expired_date: item?.batch?.expired_date,
    production_date: item?.batch?.production_date,
    ordered_qty: null,
    order_stock_status: null,
    manufacturer: {
      id: item?.batch?.manufacture?.id,
      name: item?.batch?.manufacture?.name,
    },
  }))
}

export function mapDetails(data?: DetailStock[]) {
  return data?.map((item) => ({
    activity: item?.activity,
    total_qty: item?.total_qty,
    total_available_qty: item?.total_available_qty,
    min: item?.min,
    max: item?.max,
    batch: mapBatch(item?.stocks),
  }))
}

export function mapStock(stock?: Stock) {
  return {
    material: {
      id: stock?.material?.id,
      name: stock?.material?.name,
      is_managed_in_batch: stock?.material?.is_managed_in_batch,
      is_temperature_sensitive: stock?.material?.is_temperature_sensitive,
      companions: stock?.material?.companions,
    },
    total_available_qty: stock?.total_available_qty,
    total_qty: stock?.total_qty,
    min: stock?.min,
    max: stock?.max,
  }
}

export function mapStocks(stocks?: Stock[]) {
  if (stocks?.length) {
    return stocks?.map((item) => {
      return mapStock(item)
    })
  }

  return []
}

export function formatDetailBatch(
  data: TOrderFormItemsDetailValues[],
  activity?: number,
  pieces_per_unit?: number
): TFormatDetailBatch {
  let stock: TOrderFormItemsDetailValues = {}
  const otherBatch: TFormatDetailBatch['otherBatch'] = []

  if (data?.length) {
    data.forEach((item) => {
      if (item?.activity?.id === activity) {
        stock = item
      } else {
        otherBatch.push({
          label: item?.activity?.name ?? '',
          value: item?.batch?.map((b) => ({
            ...b,
            activity: item?.activity,
            pieces_per_unit,
          })) as TFormatBatch[],
        })
      }
    })
  }

  const batch = stock?.batch?.map((item) => ({
    ...item,
    activity: stock?.activity,
    pieces_per_unit,
  }))

  return {
    batch: batch ?? [],
    otherBatch,
  }
}

export function resetBatch(batch: TFormatBatch[], activity: number) {
  let result: TFormatBatch[] = []
  if (batch?.length) {
    batch.forEach((item) => {
      if (item?.activity?.id === activity) {
        result.push({ ...item, ordered_qty: null, order_stock_status: null })
      }
    })
  }

  return result
}

export function filterBatch(batch?: TFormatBatch[]) {
  const result: TOrderStock[] = []

  if (batch?.length) {
    batch.forEach((item) => {
      if (item?.ordered_qty) {
        result.push({
          stock_id: item?.id,
          activity_id: Number(item?.activity?.id),
          allocated_qty: item?.ordered_qty,
          order_stock_status_id: item?.order_stock_status?.value
            ? Number(item?.order_stock_status?.value)
            : null,
        })
      }
    })
  }

  return result
}

export function handleBodyRequest(
  data: TOrderFormValues
): CreateOrderDistributionBody {
  return {
    vendor_id: Number(data?.vendor?.value),
    customer_id: Number(data?.customer?.value),
    activity_id: Number(data?.activity?.value),
    required_date: data?.required_date,
    order_comment: data?.order_comment,
    order_items: data?.order_items?.map((item) => ({
      material_id: item?.material?.id,
      stocks: filterBatch(item?.batch),
    })) as TOrderItem[],
  }
}

export function isAllFieldEmpty(
  batch: TFormatBatch[],
  isDisabledMaterialStatus?: boolean
) {
  return batch?.every((b) => {
    if (isDisabledMaterialStatus) {
      return !b?.ordered_qty
    }

    return !b?.ordered_qty && !b?.order_stock_status?.value
  })
}

export function splitBatch(data?: TFormatBatch[]) {
  return data?.reduce(
    (acc, curr) => {
      if (isLessThanToday(curr?.expired_date)) {
        return {
          ...acc,
          expiredBatch: [...acc.expiredBatch, curr],
        }
      }
      return {
        ...acc,
        validBatch: [...acc.validBatch, curr],
      }
    },
    { expiredBatch: [], validBatch: [] }
  )
}

export function mergeBatch(
  isBatch: boolean,
  valid: TFormatBatch[],
  expired: TFormatBatch[]
) {
  if (isBatch) {
    return [...valid, ...expired]
  }

  return valid
}

export function handleDefaultBatchList(data: TOrderFormItemsValues | null) {
  if (!data?.material?.is_managed_in_batch) {
    return {
      material: data?.material,
      validBatch: data?.batch,
      expiredBatch: [],
    }
  }

  const splittedBatch = splitBatch(data?.batch)

  return {
    material: data?.material,
    ...splittedBatch,
  }
}
