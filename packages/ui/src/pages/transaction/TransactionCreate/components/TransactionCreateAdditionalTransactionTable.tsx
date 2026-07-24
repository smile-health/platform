import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

import { TRANSACTION_TYPE } from '../transaction-create.constant'
import TransactionCancelDiscardSelectedDiscard from '../TransactionCancelDiscard/components/TransactionCancelDiscardSelectedDiscard'
import TransactionReturnFromFacilityDetailTable from '../TransactionReturnFromFacility/components/TransactionReturnFromFacilityDetailTable'

const TransactionCreateAdditionalTransactionTable: React.FC = () => {
  const { t } = useTranslation('transactionCreate')
  const { query } = useRouter()
  const { type } = query as { type: string }

  if (Number(type) === TRANSACTION_TYPE.CANCELLATION_OF_DISCARD)
    return (
      <div className="ui-mt-5 ui-w-full ui-p-6 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
        <h1 className="ui-font-bold">
          {t('cancel_transaction_discard.table.cancel.title')}
          <TransactionCancelDiscardSelectedDiscard />
        </h1>
      </div>
    )

  if (Number(type) === TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES)
    return (
      <div className="ui-mt-5 ui-w-full ui-p-6 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
        <TransactionReturnFromFacilityDetailTable />
      </div>
    )

  return null
}

export default TransactionCreateAdditionalTransactionTable
