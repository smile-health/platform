import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const transactionRemoveStockValidation = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  Yup.object().shape({
    entity: Yup.object()
      .shape({
        value: Yup.number(),
      })
      .required(t('common:validation.required')),
    activity: Yup.object()
      .shape({
        value: Yup.number(),
      })
      .required(t('common:validation.required')),
    items: Yup.array().of(
      Yup.object().shape({
        stocks: Yup.array().test(
          'at-least-one-filled',
          t(
            'transactionCreate:transaction_remove_stock.input_table.column.validation.min_qty'
          ),
          function (value) {
            return value?.some((stock) => Number(stock?.input_qty) > 0)
          }
        ),
      })
    ),
  })

export const transactionRemoveStockBatchValidation = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  Yup.object().shape({
    stocks: Yup.array().of(
      Yup.object().shape({
        transaction_reason: Yup.object()
          .shape({
            value: Yup.string().nullable(),
          })
          .nullable()
          .test(
            'is-required',
            t('common:validation.required'),
            function (value) {
              const { parent } = this
              const isQtyFilled = !!parent?.input_qty
              if (isQtyFilled) {
                return !!value?.value
              }
              return true
            }
          ),
        other_reason: Yup.string()
          .nullable()
          .test(
            'is-required',
            t('common:validation.required'),
            function (value) {
              const { transaction_reason } = this.parent
              return Number(transaction_reason?.is_other) === BOOLEAN.TRUE
                ? !!value
                : true
            }
          ),
        input_qty: Yup.string()
          .nullable()
          .min(0, t('common:validation.numeric_cannot_negative'))
          .test(
            'must-less-than-qty',
            t(
              'transactionCreate:transaction_remove_stock.input_table.column.validation.max_input_qty'
            ),
            function (value) {
              if (!value) return true
              const { parent } = this
              const qty = parent?.qty
              return Number(value) <= Number(qty)
            }
          )
          .test({
            name: 'must-multiply-of',
            test: function (value) {
              const { parent } = this

              const piecesPerUnit =
                parent?.consumption_unit_per_distribution_unit
              if (!value || !piecesPerUnit) return true
              return Number(value) % Number(piecesPerUnit) === 0
                ? true
                : this.createError({
                    message: t(
                      'transactionCreate:transaction_remove_stock.input_table.column.validation.quantity_must_multiply',
                      {
                        number: piecesPerUnit,
                      }
                    ),
                  })
            },
          })
          .test(
            'is-required',
            t('common:validation.required'),
            function (value) {
              const { parent } = this
              const isTransactionReasonFilled =
                !!parent?.transaction_reason?.value

              const isMaterialStatusFilled = !!parent?.material_status?.value

              if (isTransactionReasonFilled || isMaterialStatusFilled) {
                return !!value
              }
              return true
            }
          ),
        material_status: Yup.object()
          .shape({
            value: Yup.string().nullable(),
          })
          .nullable()
          .test(
            'is-required',
            t('common:validation.required'),
            function (value) {
              const { parent } = this
              const isTemperatureSensitive = parent?.is_temperature_sensitive
              const isQtyFilled = !!parent?.input_qty
              if (
                Number(isTemperatureSensitive) === BOOLEAN.TRUE &&
                isQtyFilled
              ) {
                return !!value?.value
              }
              return true
            }
          ),
      })
    ),
  })

export default {}
