import { TFunction } from 'i18next'
import * as yup from 'yup'

const requiredObject = (t: TFunction<['transactionCreate', 'common']>) =>
  yup
    .object({
      label: yup.string().required(t('common:validation.required')),
      value: yup.number().required(t('common:validation.required')),
    })
    .required(t('common:validation.required'))

export const formSchemaTransferStock = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  yup.object({
    entity: requiredObject(t),
    destination_program_id: yup
      .number()
      .required(t('common:validation.required')),
    items: yup
      .array()
      .of(
        yup.object().shape({
          destination_activity: requiredObject(t),
          batches: yup
            .array()
            .of(
              yup.object().shape({
                change_qty: yup.number().nullable(),
              })
            )
            .test(
              'at-least-one-change_qty',
              t('common:validation.required'),
              (batches) => {
                if (!batches) return false
                return batches.some(
                  (batch) =>
                    batch.change_qty !== null && batch.change_qty !== undefined
                )
              }
            ),
        })
      )
      .required(t('common:validation.required'))
      .min(
        1,
        t(
          'transactionCreate:transaction_transfer_stock.validation.required_materials'
        )
      ),
  })

export const formSchemaTransferStockBatch = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  yup.object({
    batches: yup
      .array()
      .of(
        yup.object().shape({
          managed_in_batch: yup.number().nullable(),
          temperature_sensitive: yup.number().nullable(),
          batch_id: yup.number().nullable(),
          available_qty: yup.number().nullable(),
          pieces_per_unit: yup.number().nullable(),
          change_qty: yup
            .number()
            .nullable()
            .typeError(t('common:validation.numeric_only'))
            .min(0, t('common:validation.numeric_cannot_negative'))
            .when(['pieces_per_unit'], (pieces_per_unit, schema) =>
              schema.test({
                test: (change_qty) =>
                  !change_qty ||
                  (Number(change_qty) > 0 &&
                    Number(change_qty) % Number(pieces_per_unit) === 0),
                message: t(
                  'transactionCreate:transaction_transfer_stock.validation.quantity_must_multiply',
                  { number: pieces_per_unit }
                ),
              })
            )
            .when('available_qty', ([available_qty], schema, { value }) => {
              if (typeof value === 'number' && value >= 0 && available_qty)
                return schema
                  .min(
                    1,
                    t(
                      'transactionCreate:transaction_transfer_stock.validation.min_qty'
                    )
                  )
                  .max(
                    available_qty,
                    t(
                      'transactionCreate:transaction_transfer_stock.validation.max_qty'
                    )
                  )
              return schema.notRequired()
            }),
        })
      )
      .test(
        'at-least-one-change_qty',
        t('common:validation.required'),
        (batches) => {
          if (!batches) return false
          return batches.some(
            (batch) =>
              batch.change_qty !== null && batch.change_qty !== undefined
          )
        }
      ),
  })
