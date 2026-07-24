import React from 'react'
import { Transaction } from '#types/transaction'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

const TransactionListTimestampBox = ({
  transaction,
}: {
  transaction: Transaction
}) => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])

  return (
    <div className="ui-text-neutral-500 ui-text-sm ui-font-normal">
      {t('transactionList:columns.created_by')}: {transaction.created_by}{' '}
      {t('common:at')}{' '}
      {dayjs(transaction.created_at)
        .locale(i18n.language)
        .format('DD MMM YYYY HH:mm')}
    </div>
  )
}

export default TransactionListTimestampBox
