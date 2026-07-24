import { TFunction } from 'i18next'
import * as yup from 'yup'
import { TRANSACTION_TYPE } from '../transaction-create.constant'
import { formDiscardSchema } from '../TransactionDiscard/transaction-discard.schema';
import { formCancelDiscardSchema } from '../TransactionCancelDiscard/transaction-cancel-discard.schema';

export const formSchema = (t: TFunction<['transactionCreate', 'common']>) =>
  yup.object({
    entity: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    activity: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    items: yup.array().when('transactionType', ([transactionType], schema) => {
      switch (transactionType?.value) {
        case TRANSACTION_TYPE.DISCARD:
          return yup.array(formDiscardSchema(t));

        case TRANSACTION_TYPE.CANCELLATION_OF_DISCARD:
          return formCancelDiscardSchema(t);

        default:
          return schema.notRequired();
      }
    })
  })
