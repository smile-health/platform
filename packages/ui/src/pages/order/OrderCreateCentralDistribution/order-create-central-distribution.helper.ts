import { Stock } from '#types/stock'
import { parseDateTime } from '#utils/date'

import { CreateOrderCentralDistributionBody } from './order-create-central-distribution.service'
import type {
  TOrderFormItemStocksValues,
  TOrderFormItemsValues,
  TOrderFormValues,
  TOrderItem,
} from './order-create-central-distribution.type'

export function parseDate(date?: string | null) {
  return parseDateTime(date ?? '', 'DD MMM YYYY').toUpperCase()
}

export function isSelectedStock(material_id?: number, selected?: number[]) {
  return selected?.includes(material_id as number)
}

export function handleMaterialTableClass(
  data: Stock,
  selectedMaterial: number[]
) {
  if (isSelectedStock(data?.material?.id, selectedMaterial)) {
    return 'ui-bg-[#E2F3FC]'
  }

  return ''
}

export function mapMaterial(item?: Stock): TOrderFormItemsValues {
  return {
    id: item?.material?.id,
    name: item?.material?.name,
    unit: item?.material?.unit_of_consumption,
    is_managed_in_batch: item?.material?.is_managed_in_batch,
    pieces_per_unit: item?.material?.consumption_unit_per_distribution_unit,
    companions: item?.material?.companions,
    stocks: [],
  }
}

export function mapStocks(
  stocks: TOrderFormItemStocksValues[],
  activity_id: number
) {
  return stocks?.map((item) => ({
    activity_id,
    expired_date: item?.expired_date,
    manufacture_name: item?.manufacturer?.label ?? null,
    production_date: item?.production_date,
    ordered_qty: item?.ordered_qty,
    batch_code: item?.batch_code,
    budget_year: item?.budget_year,
    budget_source_id: item?.budget_source?.value,
    total_price: item?.total_price,
  }))
}

export function handleBodyRequest(
  data: TOrderFormValues,
  activity_id: number
): CreateOrderCentralDistributionBody {
  return {
    vendor_id: Number(data?.vendor?.value),
    activity_id: Number(data?.activity?.value),
    customer_id: Number(data?.customer?.value),
    delivery_type_id: Number(data?.delivery_type_id),
    required_date: data?.required_date,
    do_number: data?.do_number,
    po_number: data?.po_number?.label as string,
    order_comment: data?.order_comment,
    order_items: data?.order_items?.map((item) => ({
      material_id: item?.id,
      is_managed_in_batch: Boolean(item?.is_managed_in_batch),
      stocks: mapStocks(item?.stocks, activity_id),
    })) as TOrderItem[],
  }
}

export function isAllFieldEmpty(
  stocks: TOrderFormItemStocksValues[],
  isManagedInBatch?: boolean
) {
  return stocks?.every((s) => {
    const isEmpty = !s?.ordered_qty && !s?.total_price && !s?.price

    if (isManagedInBatch) {
      return isEmpty
    }

    return isEmpty && !s?.budget_year && !s?.budget_source
  })
}
