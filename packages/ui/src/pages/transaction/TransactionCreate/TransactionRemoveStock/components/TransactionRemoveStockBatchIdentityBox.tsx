import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { thousandFormatter } from '../transaction-remove-stock.common'
import TransactionRemoveStockContext from '../transaction-remove-stock.context'

const FieldBox = ({
  title,
  subTitle,
  spanText,
}: {
  title: string
  subTitle: string
  spanText?: string
}) => (
  <div className="ui-flex ui-flex-col ui-w-fit">
    <h4 className="ui-text-sm ui-text-neutral-500">{title}</h4>
    <h5 className="ui-text-base ui-text-dark-blue ui-font-bold">
      {subTitle}{' '}
      {spanText && (
        <span className="ui-text-xs ui-font-normal ui-text-neutral-500">
          {spanText}
        </span>
      )}
    </h5>
  </div>
)

const TransactionRemoveStockBatchIdentityBox = () => {
  const { t, i18n } = useTranslation(['transactionCreate', 'common'])
  const format = (value: number) =>
    thousandFormatter({
      value,
      locale: i18n.language,
    })

  const minMax = (min: number, max: number) => {
    if (min <= 0 && max > 0) return `(max: ${format(max)})`
    if (max <= 0 && min > 0) return `(min:${format(min)})`
    if (min > 0 && max > 0) return `(min:${format(min)}, max: ${format(max)})`
    return ''
  }

  const { stockData } = useContext(TransactionRemoveStockContext)
  return (
    <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-my-4">
      <FieldBox
        title={t('transactionCreate:table.column.material_name')}
        subTitle={stockData?.material?.name ?? '-'}
      />
      <FieldBox
        title={t('transactionCreate:table.column.stock_on_hand')}
        subTitle={format(stockData?.total_qty ?? 0)}
        spanText={minMax(stockData?.min ?? 0, stockData?.max ?? 0) ?? '-'}
      />
      <FieldBox
        title={t('transactionCreate:table.column.available_stock')}
        subTitle={format(stockData?.total_available_qty ?? 0) ?? '-'}
      />
    </div>
  )
}

export default TransactionRemoveStockBatchIdentityBox
