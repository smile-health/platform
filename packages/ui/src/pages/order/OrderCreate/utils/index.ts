import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'

import { MaterialChildren } from '../order-create.type'

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
      recommended_stock: (item?.max || 0) - (item?.total_qty || 0),
      consumption_unit_per_distribution_unit:
        item?.material?.consumption_unit_per_distribution_unit,
    },
  }))

export const mapStock = (data?: Stock) => {
  const recommendationFormula =
    Math.ceil(
      ((data?.max ?? 0) - (data?.total_qty ?? 0)) /
        (data?.material?.consumption_unit_per_distribution_unit ?? 1)
    ) * (data?.material?.consumption_unit_per_distribution_unit ?? 1)

  const recommended_stock =
    recommendationFormula > 0 ? recommendationFormula : 0

  const trademarkMaterial = data?.details?.map((item) => {
    return {
      kfa_type: 93,
      material_id: item?.material?.id,
      ordered_qty: null,
      total_ordered_qty: null,
      available_qty: item?.total_available_qty,
      max: item?.max,
      min: item?.min,
      name: item?.material?.name,
      consumption_unit_per_distribution_unit:
        item?.material?.consumption_unit_per_distribution_unit,
    }
  })

  return {
    label: data?.material?.name ?? '',
    value: {
      material_companions: data?.material?.companions.length
        ? data?.material?.companions
        : null,
      material_id: data?.material?.id,
      total_available_qty: data?.aggregate?.total_available_qty ?? 0,
      total_qty: data?.aggregate?.total_qty ?? 0,
      ordered_qty: recommended_stock || null,
      min: data?.min,
      max: data?.max,
      order_reason_id: null,
      other_reason: null,
      recommended_stock: recommended_stock,
      consumption_unit_per_distribution_unit:
        data?.material?.consumption_unit_per_distribution_unit,
      children: trademarkMaterial,
    },
  }
}

export const isHasQty = (item?: MaterialChildren[]) => {
  return Boolean(item?.filter((stock) => stock?.ordered_qty ?? 0)?.length)
}

export const minMax = (min: number, max: number, language: string) => {
  const isNumber = typeof min === 'number' && typeof max === 'number'
  return isNumber
    ? `(${[
        `min: ${numberFormatter(min, language)}`,
        `max : ${numberFormatter(max, language)}`,
      ].join(', ')})`
    : null
}
