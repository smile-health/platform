import React from 'react'
import Plus from '#components/icons/Plus'
import { OptionType, ReactSelect } from '#components/react-select'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TransactionCreateConsumptionBatch } from '../hooks/useTransactionCreateConsumptionBatch'
import {
  CreateTransactionBatch,
  CreateTransactionChild,
  CreateTransactionConsumptionItems,
} from '../transaction-consumption.type'

const TransactionCreateConsumptionOtherActivity = ({
  items,
  setValue,
  batches,
}: {
  items: CreateTransactionConsumptionItems
  setValue: UseFormSetValue<CreateTransactionChild>
  batches: CreateTransactionBatch[] | null | undefined
}) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const { addNewBatch } = TransactionCreateConsumptionBatch()
  return (
    <div className="ui-flex ui-flex-row ui-space-x-5">
      <div className="ui-text-dark-teal ui-flex ui-flex-row ui-space-x-3 ui-place-items-center">
        <span>
          <Plus></Plus>
        </span>
        <div>{t('take_stock_from_others_activities')}</div>
      </div>
      <div className="ui-w-[320px]">
        <ReactSelect
          key={`${items?.batchNonActivity?.length}`}
          menuPlacement="auto"
          placeholder={t('placeholder_select_activity')}
          options={items?.batchNonActivity
            ?.filter(
              (i) =>
                !batches
                  ?.map((item) => item.activity_id)
                  .includes(i.activity?.id)
            )
            ?.map((i) => ({
              label: i.activity?.name,
              value: i.activity?.id,
            }))}
          onChange={(val: OptionType) => {
            const newData = addNewBatch({
              itemParent: items,
              itemChild: batches,
              otherBatch:
                items?.batchNonActivity?.find(
                  (i) => i?.activity?.id === val.value && !!i?.activity?.id
                ) || undefined,
            })
            setValue('batches', newData)
          }}
          value={null}
        />
      </div>
    </div>
  )
}

export default TransactionCreateConsumptionOtherActivity
