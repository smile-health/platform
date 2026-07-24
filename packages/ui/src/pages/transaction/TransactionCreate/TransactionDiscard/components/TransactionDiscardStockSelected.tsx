import React from 'react'
import { DiscardItem } from '../transaction-discard.type'
import { useTranslation } from 'react-i18next'
import { numberFormatter } from '#utils/formatter'

type Props = {
  stock: DiscardItem
  batch_code: string
  expired_date: string
}

const TransactionDiscardStockSelected: React.FC<Props> = (props) => {
  const { stock, batch_code, expired_date } = props
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')

  if (!stock.is_open_vial && !stock.qty) return null
  else if (stock.is_open_vial && !stock.open_vial && !stock.close_vial) return null

  return (
    <div
      className="ui-space-y-1"
      key={`detail-${stock.stock_id}`}
    >
      <p className="ui-text-dark-teal ui-text-sm">
        {t(
          'transaction_discard.form.table.description.batch.code',
          { value: batch_code }
        )}
      </p>
      <p className="ui-text-dark-teal ui-text-sm">
        {t(
          'transaction_discard.form.table.description.batch.expired_date',
          {
            value: expired_date,
          }
        )}
      </p>
      <p className="ui-text-dark-teal ui-text-sm">
        {t(
          'transaction_discard.form.table.description.batch.reason',
          { value: stock.transaction_reason?.label ?? '-' }
        )}
      </p>
      <p className="ui-font-bold ui-text-dark-teal">
        Qty: {!stock.is_open_vial ? numberFormatter(stock.qty || 0, language) : t('transaction_discard.form.table.column.open_close_vial', {
          open: numberFormatter(stock.open_vial || 0, language),
          close: numberFormatter(stock.close_vial || 0, language),
        })}
      </p>
    </div>
  )
}

export default TransactionDiscardStockSelected
