import React, { useMemo } from 'react'
import { StockTransaction, Transaction } from '#types/transaction'
import { useTranslation } from 'react-i18next'

import { generateBatchSchema } from '../helpers/transaction-list.detail'

const TransactionListBatchBox = ({
  transaction,
  stock,
}: {
  transaction: Transaction
  stock?: StockTransaction
}) => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])
  const batchSchema = useMemo(() => {
    return generateBatchSchema({ t, locale: i18n.language, transaction })
  }, [transaction, t, i18n.language])

  return (
    <div className="ui-p-3 ui-bg-stone-100">
      <h6 className="ui-font-bold ui-text-sm ui-text-dark-blue">
        {t('transactionList:batch_columns.taken_from_activity_stock')}{' '}
        {stock?.activity?.name ?? transaction.activity_name ?? ''}
      </h6>
      <div className="ui-space-y-1 ui-mt-1">
        {batchSchema.map(
          (detail, index) => (
            <div
              key={`${detail.label}-${index}`}
              className="ui-grid ui-grid-cols-[1fr_2fr]"
            >
              <h6 className="ui-font-normal ui-text-dark-blue ui-text-sm">
                {detail.label}
              </h6>
              <h6 className="ui-font-normal ui-text-neutral-500 ui-text-sm">
                : {detail.value}
              </h6>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default TransactionListBatchBox
