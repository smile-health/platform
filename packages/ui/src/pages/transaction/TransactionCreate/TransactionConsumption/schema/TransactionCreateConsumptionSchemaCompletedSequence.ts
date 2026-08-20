import { TFunction } from 'i18next'
import * as yup from 'yup'

export const schemaFormCompletedSequence = (
  t: TFunction<['common', 'transactionCreateConsumption']>
) =>
  yup.object({
    materials: yup.array().of(
      yup.object({
        patients: yup.array().of(
          yup.object({
            actual_date: yup
              .date()
              .typeError(
                t(
                  'transactionCreateConsumption:completed_sequence.validation.date_not_valid'
                )
              )
              .required(t('common:validation.required')),
            protocol_id: yup.number().required(),
            data: yup.array().notRequired(),
          })
        ),
      })
    ),
  })
