import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'

import { TRANSACTION_TYPE_LIST } from '../transaction-create.constant'
import { ApiErrorResponse } from '../transaction-create.type'

export function handleDefaultValue(
  t: TFunction<['transactionCreate']>,
  type: number,
  entity: OptionType | null
) {
  const transactionType = TRANSACTION_TYPE_LIST(t).find(
    (i) => i.id === Number(type)
  )
  return {
    entity: entity,
    transactionType: {
      label: transactionType?.title,
      value: transactionType?.id,
    },
    activity: null,
  }
}

export const getTodayDate = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function extractErrorMessage(res: ApiErrorResponse): string {
  const inner =
    res.errors?.materials?.["0"]?.budget_source_id?.[0] ?? res.message;

  return inner;
}