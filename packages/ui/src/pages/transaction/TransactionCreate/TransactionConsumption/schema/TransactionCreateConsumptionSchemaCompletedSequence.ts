import { TFunction } from 'i18next'
import * as yup from 'yup'
import { VACCINE_PROTOCOL } from '../transaction-consumption.constant'
import { vaccineDataSchemaSkipSequenceRabies } from './TransactionCreateConsumptionSchemaProtocolRabiesForm'
import { vaccineDataSchemaSkipSequenceDengue } from './TransactionCreateConsumptionSchemaProtocolDengueForm'

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
            data: yup.array().when(['protocol_id'], ([protocol_id], schema) => {

              switch (Number(protocol_id)) {
                case VACCINE_PROTOCOL.RABIES:
                  return vaccineDataSchemaSkipSequenceRabies(schema, t);

                case VACCINE_PROTOCOL.DENGUE:
                  return vaccineDataSchemaSkipSequenceDengue(schema, t);

                default:
                  return schema.notRequired();
              }
            })
          })
        ),
      })
    ),
  })
