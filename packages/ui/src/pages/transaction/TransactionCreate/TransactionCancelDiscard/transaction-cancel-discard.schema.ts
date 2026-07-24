import * as yup from 'yup'
import { TFunction } from 'i18next'

export const formCancelDiscardSchema = (t: TFunction<['transactionCreate', 'common']>) => yup.array(
  yup.object().shape({
    stock_id: yup.number().required(t('common:validation.required')),
    transaction_reason: yup.object({
      value: yup.number(),
      label: yup.string(),
    }).required(t('common:validation.required')),
    transaction_ids: yup.array(yup.number()).min(1, t('common:validation.required')).required(t('common:validation.required'))
  })
)