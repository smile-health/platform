import React from 'react'
import { useTranslation } from 'react-i18next'

import { CreateTransactionBatch } from '../transaction-consumption.type'

type TransactionCreateConsumptionTableDetailCloseVialSupportingTextProps = {
  item: CreateTransactionBatch
  value?: number | null
}
const TransactionCreateConsumptionTableDetailCloseVialSupportingText = ({
  item,
  value,
}: TransactionCreateConsumptionTableDetailCloseVialSupportingTextProps) => {
  const { t } = useTranslation(['transactionCreateConsumption'])
  if (!value && Number(item?.open_vial_qty) > 0)
    return (
      <span className="ui-my-1 ui-text-neutral-500 ui-block ui-w-fit">
        {t('transactionCreateConsumption:validation.close_qty_supporting_text')}
      </span>
    )

  return null
}

export default TransactionCreateConsumptionTableDetailCloseVialSupportingText
