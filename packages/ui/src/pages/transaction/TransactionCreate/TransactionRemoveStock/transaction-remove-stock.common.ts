import { OptionType } from '#components/react-select'
import { TCommonObject } from '#types/common'
import { StockDetailStock } from '#types/stock'
import { TFunction } from 'i18next'

import { CreateTransactionRemoveForm } from './transaction-remove-stock.type'

export const textGrouper = ({
  text1,
  text2 = null,
  separator = ', ',
}: {
  text1: string
  text2?: string | null
  separator?: string
}) => {
  if (!text2 || text2 === null) return text1
  return `${text1}${separator}${text2}`
}

export const thousandFormatter = ({
  value,
  locale = 'en-US',
}: {
  value: number
  locale: string
}) => {
  return new Intl.NumberFormat(locale).format(value) || ''
}

export const defineMinSize = (
  listDataExists: boolean,
  size: number,
  constantSize: number = 20
) => (listDataExists ? size : constantSize)

export const quantityButtonLabel = ({
  stocks,
  t,
}: {
  stocks: StockDetailStock[]
  t: TFunction<['transactionCreate', 'common']>
}) => {
  return stocks?.some((stock) => stock.batch)
    ? t('transactionCreate:transaction_remove_stock.input_table.column.batch')
    : t('common:detail')
}

export const availabilityIndicatorColor = ({
  availableQty,
  minQty,
  maxQty,
}: {
  availableQty: number
  minQty: number
  maxQty: number
}) => {
  if (availableQty === 0) return 'ui-bg-red-50'
  if (availableQty < minQty) return 'ui-bg-orange-50'
  if (availableQty >= minQty && (availableQty <= maxQty || maxQty === 0))
    return 'ui-bg-green-50'
  if (availableQty > maxQty) return 'ui-bg-blue-50'
  return 'ui-bg-white'
}

// Submitter
export const submitTransactionRemoveStock = (
  value: CreateTransactionRemoveForm
) => {
  const process = {
    entity_id: Number(value?.entity?.value),
    activity_id: Number((value?.activity as OptionType)?.value),
    entity_activity_id: Number(
      (value?.activity as unknown as { entity_activity_id: number })
        ?.entity_activity_id
    ),
    materials: value?.items?.flatMap((material) =>
      material?.stocks
        ?.filter((stock) => Number(stock?.input_qty) > 0)
        ?.map((stock) => ({
          material_id: Number((material?.material as TCommonObject)?.id),
          transaction_reason_id: Number(stock?.transaction_reason?.value),
          other_reason: stock?.other_reason ?? '',
          stock_id: Number(stock?.id),
          qty: Number(stock?.input_qty),
          stock_quality_id:
            (stock?.material_status as OptionType)?.value ?? null,
        }))
    ),
  }

  return process
}

export default {}
