import React from 'react'
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '#components/tooltip'
import { Transaction } from '#types/transaction'
import { useTranslation } from 'react-i18next'

const FieldBox = ({ title, subTitle }: { title: string; subTitle: string }) => (
  <div className="ui-flex ui-flex-col">
    <h4 className="ui-text-sm ui-text-neutral-500">{title}</h4>
    <TooltipRoot>
      <TooltipTrigger>
        <h5 className="ui-text-base ui-text-dark-blue ui-font-bold ui-truncate">
          {subTitle}
        </h5>
      </TooltipTrigger>
      <TooltipContent style={{ zIndex: 999 }}>
        <h5 className="ui-text-base ui-text-dark-blue ui-font-bold">
          {subTitle}
        </h5>
      </TooltipContent>
    </TooltipRoot>
  </div>
)

const TransactionListMaterialIdentityBox = ({
  transaction,
}: {
  transaction: Transaction
}) => {
  const { t } = useTranslation(['common', 'transactionList'])

  return (
    <>
      <FieldBox
        title={t('transactionList:batch_columns.material_name')}
        subTitle={transaction?.material_name || '-'}
      />
      <div className="ui-grid ui-grid-cols-3 ui-my-4 ui-gap-10">
        {transaction?.batch_code && (
          <FieldBox
            title={t('transactionList:batch_columns.batch_code')}
            subTitle={transaction?.batch_code || '-'}
          />
        )}

        {transaction?.order_id && (
          <FieldBox
            title={t('transactionList:order_number')}
            subTitle={`${transaction?.order_id} (${transaction?.order_status})`}
          />
        )}

        <FieldBox
          title={t('transactionList:columns.device_type')}
          subTitle={
            transaction?.device === 'mobile'
              ? t('transactionList:columns.mobile_phone')
              : t('transactionList:columns.web')
          }
        />
      </div>
    </>
  )
}

export default TransactionListMaterialIdentityBox
