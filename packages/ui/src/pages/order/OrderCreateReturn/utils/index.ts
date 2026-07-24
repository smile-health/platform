import { DetailStock, Stock } from '#types/stock'
import { TFunction } from 'i18next'

import { OrderItem } from '../order-create-return.type'

export const mapStocks = (data?: Stock[]) =>
  data?.map((item) => ({
    label: item?.material?.name ?? '',
    value: {
      material_id: item?.material?.id,
      total_available_qty: item?.total_available_qty,
      total_qty: item?.total_qty,
      ordered_qty: null,
      min: item?.min,
      max: item?.max,
      order_reason_id: null,
      other_reason: null,
      recommended_stock: (item?.max ?? 0) - (item?.total_qty ?? 0),
    },
  }))
export const mapStock = (
  indexData: number,
  activityName?: string,
  data?: Stock,
  otherActivityData?: { label: string; value: OrderItem }[]
) => {
  const batchData = data?.details?.[indexData]?.stocks?.map((stock) => ({
    batch_code: stock?.batch?.code,
    batch_activity_id: stock?.activity?.id,
    batch_ordered_qty: null,
    batch_order_stock_status_id: null,
    batch_total_qty: stock?.qty,
    batch_allocated_qty: stock?.allocated_qty,
    batch_available_qty: stock?.available_qty,
    batch_production_date: stock?.batch?.production_date,
    batch_expiry_date: stock?.batch?.expired_date,
    batch_manufacturer: stock?.batch?.manufacture?.name,
    batch_activity: stock?.activity,
    batch_consumption_unit_per_distribution_unit:
      data?.material?.consumption_unit_per_distribution_unit,
    batch_stock_id: stock?.id,
    batch_is_temperature_sensitive: data?.material?.is_temperature_sensitive,
  }))

  return {
    material_other_activity: otherActivityData,
    material_id: data?.material?.id ?? 0,
    material_name: data?.material?.name,
    material_total_qty: data?.total_qty,
    material_available_qty: data?.total_available_qty,
    material_companions: data?.material?.companions,
    material_activity_name: activityName,
    material_is_managed_in_batch: data?.material?.is_managed_in_batch,
    material_min: data?.min,
    material_max: data?.max,
    material_stocks: {
      valid: batchData?.filter(
        (stock) =>
          new Date(stock?.batch_expiry_date ?? '') > new Date() ||
          stock?.batch_expiry_date === undefined
      ),
      expired: batchData?.filter(
        (stock) =>
          new Date(stock?.batch_expiry_date ?? '') <= new Date() &&
          stock?.batch_expiry_date !== undefined
      ),
    },
  }
}

export const mapDetailStock = (
  data?: DetailStock,
  material?: Stock['material']
) => {
  const mapStockToBatch = data?.stocks?.map((stock) => ({
    batch_code: stock?.batch?.code,
    batch_activity_id: stock?.activity?.id,
    batch_ordered_qty: null,
    batch_order_stock_status_id: null,
    batch_total_qty: stock?.qty,
    batch_allocated_qty: stock?.allocated_qty,
    batch_available_qty: stock?.available_qty,
    batch_production_date: stock?.batch?.production_date,
    batch_expiry_date: stock?.batch?.expired_date,
    batch_manufacturer: stock?.batch?.manufacture?.name,
    batch_activity: stock?.activity,
    batch_consumption_unit_per_distribution_unit:
      material?.consumption_unit_per_distribution_unit,
    batch_stock_id: stock?.id,
    batch_is_temperature_sensitive: material?.is_temperature_sensitive,
  }))

  return {
    material_id: material?.id,
    material_name: material?.name,
    material_total_qty: data?.total_qty,
    material_available_qty: data?.total_available_qty,
    material_activity_name: data?.activity?.name,
    material_is_managed_in_batch: material?.is_managed_in_batch,
    material_min: data?.min,
    material_max: data?.max,
    material_companions: material?.companions,
    material_stocks: {
      valid: mapStockToBatch?.filter(
        (stock) =>
          new Date(stock?.batch_expiry_date ?? '') > new Date() ||
          stock?.batch_expiry_date === undefined
      ),
      expired: mapStockToBatch?.filter(
        (stock) =>
          new Date(stock?.batch_expiry_date ?? '') <= new Date() &&
          stock?.batch_expiry_date !== undefined
      ),
    },
  }
}

export const checkStatusMaterial = (
  materialId: number,
  orderItem: OrderItem[]
) => {
  let isChecked = false
  const selectedMaterialId = orderItem?.map((obj) => obj?.material_id)
  isChecked = Boolean(selectedMaterialId?.includes(materialId))
  return isChecked
}

export const isHasQty = (item: OrderItem['material_stocks']) => {
  return Boolean(
    item?.valid?.filter((stock) => stock?.batch_ordered_qty ?? 0)?.length ||
      item?.expired?.filter((stock) => stock?.batch_ordered_qty ?? 0)?.length
  )
}

export const handleButtonName = (
  isManagedInBatch: boolean,
  item: OrderItem['material_stocks'],
  t: TFunction<['common', 'orderCreateReturn']>
) => {
  const isBatchItem = isManagedInBatch ? 'batch' : 'non_batch'
  return isHasQty(item)
    ? t(
        `orderCreateReturn:list.selected.column.quantity.button.${isBatchItem}.update`
      )
    : t(
        `orderCreateReturn:list.selected.column.quantity.button.${isBatchItem}.qty`
      )
}
