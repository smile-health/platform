import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import {
  CreateTransactionAddStockBody,
  CreateTransactionAddStockMaterial,
  CreateTransactionBatch,
  setBatches,
} from '../transaction-add-stock.type'

/** @deprecated This function will be remove asap, please use general function getBackgroundStock on utils/formatter.ts */
export const getBackgroundStock = ({
  onHandStock,
  minQty,
  maxQty,
}: {
  onHandStock: number
  minQty: number
  maxQty: number
}) => {
  if (onHandStock === 0) return 'ui-bg-red-50'
  if (onHandStock && onHandStock < minQty) return 'ui-bg-orange-50'
  if (
    onHandStock &&
    minQty &&
    onHandStock >= minQty &&
    (onHandStock <= maxQty || maxQty === 0)
  )
    return 'ui-bg-green-50'
  if (onHandStock > maxQty) return 'ui-bg-blue-50'
  return 'ui-bg-white'
}

export const setIntialBatch = ({
  obj,
  materialItemList,
  selectedItem,
}: setBatches) => {
  if (materialItemList && materialItemList.length > 0) {
    return materialItemList.map((itm) => {
      const batchTemp: CreateTransactionBatch = {
        batch_id: itm.id ?? null,
        activity_id: itm?.activity.id ?? null,
        activity_name: itm?.activity.name ?? null,
        change_qty: null,
        code: itm?.batch?.code ?? null,
        production_date: itm?.batch?.production_date ?? null,
        expired_date: itm?.batch?.expired_date ?? null,
        manufacturer: itm.batch?.manufacture?.id
          ? {
              value: itm?.batch?.manufacture.id,
              label: itm?.batch?.manufacture?.name ?? '',
            }
          : null,
        available_qty: itm?.available_qty ?? 0,
        allocated_qty: itm?.allocated_qty ?? 0,
        on_hand_stock: itm?.qty ?? 0,
        min: obj?.min ?? 0,
        max: obj?.max ?? 0,
        temperature_sensitive:
          selectedItem?.material?.is_temperature_sensitive ?? null,
        pieces_per_unit:
          selectedItem?.material?.consumption_unit_per_distribution_unit ??
          null,
        status_material: null,
        managed_in_batch: selectedItem?.material?.is_managed_in_batch ?? null,
        budget_source: null,
        budget_source_year: null,
        budget_source_price: null,
        total_price_input: null,
        transaction_reason: null,
        other_reason: null,
        other_reason_required: false,
      }

      return batchTemp
    })
  }
  return []
}

export const listYear = () => {
  const year_start = 2020
  const year_end = 2030
  const years = []

  for (let yearIndex = year_start; yearIndex <= year_end; yearIndex++) {
    years.push({
      label: yearIndex,
      value: yearIndex,
    })
  }

  return years
}

export const SummaryListBatch = ({
  key,
  t,
  lang,
  batchName,
  expiredDate,
  reason,
  budgetSource,
  qty,
  otherReason,
}: {
  key: string
  t: TFunction<['transactionCreateAddStock']>
  lang: string
  batchName: string
  expiredDate: string
  reason: string
  otherReason?: string
  budgetSource: string
  qty: number | null | undefined
}) => {
  return (
    <div key={key} className="ui-flex ui-flex-col">
      <div>
        {t('table.column.batch_code')}: {batchName ?? '-'}
      </div>
      <div>
        {t('table.column.expired_date')}:{' '}
        {parseDateTime(expiredDate, 'DD MMM YYYY')}
      </div>
      {reason && (
        <div>
          {t('table.column.reason')}: {otherReason ?? reason}
        </div>
      )}
      {budgetSource && (
        <div>
          {t('table.column.budget_info')}: {budgetSource}
        </div>
      )}
      <div className="ui-font-bold">Qty: {numberFormatter(qty, lang)}</div>
    </div>
  )
}

export const checkIsHaveQty = (
  item: CreateTransactionBatch[] | null | undefined
) => {
  const check = item?.find((i) => !!i.change_qty)
  return !!check
}

export const processPayload = ({
  data,
}: {
  data: CreateTransactionAddStockBody
}) => {
  return {
    ...data,
    materials: data.materials.map(
      (material: CreateTransactionAddStockMaterial) => ({
        ...material,
        total_price: material?.total_price
          ? Number(material?.total_price?.toFixed(2))
          : null,
      })
    ),
  }
}
